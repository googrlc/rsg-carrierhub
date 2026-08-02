import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { APP_TITLE, APP_VERSION, PORT, llmConfig, mcpConfig } from "./config";
import { describeFunctions } from "./functions";
import { registerHttpRoutes } from "./http";
import { MCP_PATH, registerMcpEndpoint } from "./mcp";
import { resolveSupabase } from "./supabase";

// RSG Carrier Hub — a standalone service. It owns its data access, its LLM
// client, and its capability surface; a runner starts it and calls it, but the
// app does not reach into the runner for anything.
//
// Two doors onto the same functions:
//   /api/*  — the browser UI and any plain HTTP caller
//   /mcp    — the MCP door, bearer-gated, for an agent

export async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "4mb" }));

  if (!resolveSupabase()) {
    console.warn(
      "WARN: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — carrier endpoints will return 503",
    );
  }
  if (!llmConfig.apiKey) {
    console.warn("WARN: CARRIERHUB_LLM_API_KEY not set — the grounded advisors will report unavailable");
  }
  if (!mcpConfig.enabled) {
    console.warn(`WARN: CARRIERHUB_MCP_TOKEN not set — ${MCP_PATH} will refuse every call`);
  }

  registerHttpRoutes(app);
  registerMcpEndpoint(app);

  // Serve static files in production or hook Vite development middleware.
  // Registered last so the SPA catch-all can't shadow an API route.
  if (process.env.NODE_ENV !== "production") {
    console.log("Express starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    console.log("Express starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `${APP_TITLE} v${APP_VERSION} listening on http://0.0.0.0:${PORT} — ` +
        `${describeFunctions().length} functions, MCP at ${MCP_PATH} ` +
        `(${mcpConfig.enabled ? "token set" : "NO TOKEN — closed"})`,
    );
  });
}
