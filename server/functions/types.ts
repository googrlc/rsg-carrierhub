import { z } from "zod";
import { resolveSupabase, type SupabaseClient } from "../supabase";

// A Carrier Hub function is the app's unit of capability. It is defined once,
// independent of any transport, and then surfaced two ways: as an HTTP route for
// the browser UI, and as an MCP tool for whatever agent runs the app. Adding a
// capability means adding a function here — never a route and a tool that drift.

export interface FunctionContext {
  /** Supabase, or null when the store isn't configured. Use `requireDb`. */
  db: SupabaseClient | null;
  /** Who called: "http" for the browser UI, "mcp" for an agent. */
  caller: "http" | "mcp";
}

// Errors a function raises deliberately, carrying the HTTP status the route
// adapter should use. Anything else that throws is a 500.
export class FunctionError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "FunctionError";
  }
}

export function requireDb(ctx: FunctionContext): SupabaseClient {
  if (!ctx.db) {
    throw new FunctionError("Carrier store not configured on the server", 503);
  }
  return ctx.db;
}

/** Turn a Supabase error into a FunctionError with the operation named. */
export function dbFail(op: string, error: { message: string } | null): never {
  throw new FunctionError(`${op}: ${error?.message ?? "unknown database error"}`, 500);
}

export interface CarrierHubFunction<Schema extends z.ZodObject<any> = z.ZodObject<any>> {
  /** Stable identifier — also the MCP tool name. snake_case. */
  name: string;
  /** Human label for tool listings. */
  title: string;
  /** What it does and when to reach for it. An agent picks tools from this. */
  description: string;
  /** Zod object; doubles as the MCP input schema and the HTTP body validator. */
  input: Schema;
  /** True when the call cannot change stored data. */
  readOnly: boolean;
  /** True when the call can remove data that isn't recoverable from the UI. */
  destructive?: boolean;
  handler: (input: z.infer<Schema>, ctx: FunctionContext) => Promise<unknown>;
}

/** Helper that preserves the schema's inferred input type in the handler. */
export function defineFunction<Schema extends z.ZodObject<any>>(
  fn: CarrierHubFunction<Schema>,
): CarrierHubFunction<any> {
  return fn as CarrierHubFunction<any>;
}

export function makeContext(caller: "http" | "mcp"): FunctionContext {
  return { db: resolveSupabase(), caller };
}
