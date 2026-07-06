import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route - Carrier Appetite Assistant
  app.post("/api/advisor", async (req, res) => {
    const { carrierName, appetiteInfo, inquiry, history } = req.body;

    if (!inquiry) {
      return res.status(400).json({ error: "Missing inquiry in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return res.status(200).json({
        text: `⚠️ **API Key Missing**: The Gemini AI Advisor could not be completed because the \`GEMINI_API_KEY\` is not set yet. \n\nPlease provide your Gemini API Key in the **Settings > Secrets** panel in AI Studio to unlock full AI-assisted underwriting checks! \n\n*Context of Carrier analyzed:* **${carrierName || "General Carrier"}**`
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare system instructions with carrier appetite information
      const carrierContext = appetiteInfo 
        ? `Carrier Name: ${carrierName}
Segment: ${appetiteInfo.segment || "Commercial / Specialty"}
Lines of Business: ${appetiteInfo.linesOfBusiness ? appetiteInfo.linesOfBusiness.join(", ") : ""}
Carrier Written Appetite ✅:
${appetiteInfo.canWrite ? appetiteInfo.canWrite.map((c: string) => `- ${c}`).join("\n") : "No specific write rules detailed."}

Carrier Prohibited Appetite ❌:
${appetiteInfo.cannotWrite ? appetiteInfo.cannotWrite.map((c: string) => `- ${c}`).join("\n") : "No specific prohibited rules detailed."}

Specialist Notes:
${appetiteInfo.notes || "None."}
`
        : `General multi-carrier guidelines context. Search for matching appetites among commercial, personal, MGA, GA insurance operations.`;

      const systemInstruction = `You are a helpful, expert Senior Commercial Insurance Underwriting Assistant.
Your goal is to evaluate if a specific business risk, driver details/profile, or property description fits within the appetite of the carrier being queried.

Current Carrier Context:
${carrierContext}

Structure your response clearly with:
1. **Appetite Verdict**: One of [✅ WITHIN APPETITE], [⚠️ REFER TO UNDERWRITING], or [❌ PROHIBITED / EXPELLED]. Be honest and trace back to the carrier rules provided or standard industry guidelines.
2. **Key Compliance Analysis**: Briefly explain why it fits or conflicts.
3. **Information to Gather / Recommended Next Steps**: Detail what data points (e.g. roof age, gross sales, claims history, CDL years) the agent should collect to make a successful submission.
Keep your answer professional, concise, styled in structured markdown. Avoid generic fluffy paragraphs; get straight to underwriting criteria.`;

      // Format previous history into gemini SDK contents
      let contents: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        // Map history to SDK format
        contents = history.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));
      }
      
      // Append the current inquiry
      contents.push({
        role: "user",
        parts: [{ text: inquiry }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Low temperature for factual underwriting evaluation
        }
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error in /api/advisor:", err);
      return res.status(500).json({ error: "Failed to communicate with Gemini underwriter assistant API: " + err.message });
    }
  });

  // API Route - Global Appetite Policy Advisor (for analyzing across all carriers)
  app.post("/api/global-advisor", async (req, res) => {
    const { inquiry, carriersList } = req.body;

    if (!inquiry) {
      return res.status(400).json({ error: "Missing inquiry in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return res.status(200).json({
        text: `⚠️ **AI Advisor Unavailable**: Please set your \`GEMINI_API_KEY\` in the **Settings > Secrets** panel in AI Studio to search risk appetites across your carriers list!`
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const carriersBriefContext = carriersList && Array.isArray(carriersList)
        ? carriersList.map((c: any) => `Carrier: ${c.name}
Segment: ${c.segment.join(", ")}
LOBs: ${c.linesOfBusiness.join(", ")}
✅ Will Write: ${(c.appetite?.canWrite || []).slice(0, 3).join("; ")}
❌ Won't Write: ${(c.appetite?.cannotWrite || []).slice(0, 3).join("; ")}`).join("\n---\n")
        : "Standard commercial independent agency carriers panel.";

      const systemInstruction = `You are a helpful, senior Independent Agency Underwriting Consultant.
You help commercial and personal insurance agents identify which carrier(s) from their active panel would be the perfect fit for a certain client risk.

Active Carrier Panel available to check:
${carriersBriefContext}

Analyze the user's risk inquiry: "${inquiry}"
Help them by:
1. Identifying **1-3 Top Carrier Fits** from the panel that have positive appetite markers for this class. Explain why.
2. Flagging any **Definitely Prohibited** carriers that would trigger an instant auto-declination.
3. Suggesting the standard premium codes or class details required across these carriers to build a successful submission.

Keep your response professional, precise, and structured with clear markdown headings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: inquiry,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error in /api/global-advisor:", err);
      return res.status(500).json({ error: "Failed to communicate with Gemini underwriting advisor API: " + err.message });
    }
  });

  // Serve static files in production or hook Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Express starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Express starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve client router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running cleanly on: http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Express server startup failed:", e);
});
