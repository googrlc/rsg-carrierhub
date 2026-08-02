import OpenAI from "openai";
import { llmConfig, type LLMTask } from "./config";

export type { LLMTask };

// OpenAI-compatible client. An optional base URL points at a LiteLLM proxy; with
// no base URL set the call goes straight to OpenAI. The app resolves this itself
// rather than borrowing another service's client, so the only thing it needs from
// its host is a key.
export function resolveLLM(task: LLMTask = "desk"): { client: OpenAI; model: string } | null {
  const { apiKey, baseURL } = llmConfig;
  if (!apiKey || apiKey === "MY_OPENAI_API_KEY") return null;

  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  return { client, model: llmConfig.modelFor(task) };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// One call path for every LLM request the app makes, so retries, timeouts and
// cost visibility are uniform. `cached_tokens` is the number that matters when
// tuning spend: on a big stable prefix it should approach the prompt size, and a
// zero there means something is silently invalidating the cache.
export async function completeChat(
  llm: { client: OpenAI; model: string },
  messages: ChatMessage[],
  opts: { task: LLMTask; temperature?: number },
): Promise<string> {
  const startedAt = Date.now();
  const res = await llm.client.chat.completions.create(
    { model: llm.model, messages, temperature: opts.temperature ?? 0.2 },
    // The proxy can be slow on a cold model; retry transient failures rather than
    // surfacing them as a dead assistant.
    { timeout: 90_000, maxRetries: 2 },
  );
  const u: any = res.usage ?? {};
  const cached = u.prompt_tokens_details?.cached_tokens ?? 0;
  console.log(
    `[llm] task=${opts.task} model=${res.model || llm.model} ` +
      `prompt=${u.prompt_tokens ?? "?"} cached=${cached} ` +
      `completion=${u.completion_tokens ?? "?"} ms=${Date.now() - startedAt}`,
  );
  return res.choices[0]?.message?.content ?? "";
}
