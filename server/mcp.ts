import type { Express, Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { APP_NAME, APP_TITLE, APP_VERSION, mcpConfig } from "./config";
import { FUNCTIONS, FunctionError, callFunction, makeContext } from "./functions";

// Carrier Hub's own MCP door, at POST /mcp.
//
// The tools here are generated from the function registry, so the door exposes
// exactly what the app can do — there is no second list to keep in step. Runs
// stateless: a fresh server and transport per request, no session to resume, so
// the container can restart mid-conversation without stranding a client.

export const MCP_PATH = "/mcp";

function buildServer(): McpServer {
  const server = new McpServer(
    { name: APP_NAME, title: APP_TITLE, version: APP_VERSION },
    {
      instructions:
        `${APP_TITLE} is Risk Solutions Group's carrier system of record: the appointed ` +
        `carrier panel with underwriting contacts, the structured appetite spine (line of ` +
        `business, approved states, premium bands, class codes, requirements, exclusions), ` +
        `and the full GL/WC class-code dictionary with the carrier links that say who ` +
        `writes what.\n\n` +
        `Answer carrier questions from these tools rather than from memory — the panel is ` +
        `specific to this agency. For a repeatable placement list use match_appetite; for a ` +
        `written recommendation or a conversational question use ask_carrier_desk. ` +
        `list_class_codes returns every code with its description; search_class_codes finds ` +
        `the few that fit a description. Data is dirty and carrier names are near-duplicates, ` +
        `so read a record with get_carrier and confirm it before any write.`,
    },
  );

  for (const fn of FUNCTIONS) {
    server.registerTool(
      fn.name,
      {
        title: fn.title,
        description: fn.description,
        // The Zod object's raw shape is what the SDK wants; the same schema
        // validates HTTP bodies, so the two doors can't diverge on what's valid.
        inputSchema: fn.input.shape,
        annotations: {
          title: fn.title,
          readOnlyHint: fn.readOnly,
          destructiveHint: fn.destructive ?? false,
          idempotentHint: !fn.destructive,
          openWorldHint: false,
        },
      },
      async (args: unknown) => {
        try {
          const result = await callFunction(fn.name, args, makeContext("mcp"));
          return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
        } catch (e) {
          const msg = e instanceof FunctionError ? e.message : (e as any)?.message ?? String(e);
          if (!(e instanceof FunctionError) || e.status >= 500) {
            console.error(`[mcp] ${fn.name} failed:`, msg);
          }
          // Tool errors belong in the result, not as a protocol error — the model
          // needs to read them and adjust.
          return { isError: true, content: [{ type: "text" as const, text: `Error: ${msg}` }] };
        }
      },
    );
  }

  return server;
}

// Bearer auth. Fails closed: with no token configured the door refuses every
// call rather than serving the write tools to anything that can reach the port.
// The refusal is sent as both an HTTP status and a JSON-RPC error body, because
// MCP-over-HTTP clients read the body and smoke tests read the status.
function authorize(req: Request, res: Response): boolean {
  const deny = (code: number, message: string) => {
    res.status(code)
      .set("WWW-Authenticate", 'Bearer realm="carrierhub"')
      .json({ jsonrpc: "2.0", error: { code: -32001, message }, id: null });
    return false;
  };

  if (!mcpConfig.enabled) {
    console.warn("[mcp] refused a call — CARRIERHUB_MCP_TOKEN is not set");
    return deny(503, "MCP door not configured: set CARRIERHUB_MCP_TOKEN on the server");
  }

  const header = (req.headers.authorization ?? "").toString();
  const presented = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!presented) return deny(401, "Unauthorized: send an `Authorization: Bearer <token>` header");
  if (presented !== mcpConfig.token) return deny(401, "Unauthorized: bad token");
  return true;
}

export function registerMcpEndpoint(app: Express): void {
  app.post(MCP_PATH, async (req, res) => {
    if (!authorize(req, res)) return;

    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      // Stateless: no session id, plain JSON responses instead of an SSE stream,
      // so a caller can treat this as an ordinary JSON-RPC POST.
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e: any) {
      console.error("[mcp] request failed:", e?.message ?? e);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal error" },
          id: null,
        });
      }
    }
  });

  // Stateless mode has no stream to resume and no session to delete.
  const notAllowed = (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed — this MCP door is stateless; POST only" },
      id: null,
    });
  };
  app.get(MCP_PATH, notAllowed);
  app.delete(MCP_PATH, notAllowed);
}
