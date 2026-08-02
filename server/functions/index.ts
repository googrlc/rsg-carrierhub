import { z } from "zod";
import type { CarrierHubFunction, FunctionContext } from "./types";
import { FunctionError, makeContext } from "./types";
import { getCarrier, listCarriers, saveCarrier, deleteCarrier } from "./carriers";
import {
  getClassCode, linkClassCode, listClassCodes, saveClassCode, searchClassCodes,
} from "./class-codes";
import { listAppointments, matchAppetiteFn, matchOpportunity } from "./appetite";
import { askCarrierDesk, carrierAdvisor, panelAdvisor } from "./advisors";

// The registry. This is the app's capability surface — everything Carrier Hub can
// do, in one list. The HTTP routes and the MCP door are both generated from it,
// so a capability can't exist on one transport and not the other.
export const FUNCTIONS: CarrierHubFunction<any>[] = [
  // Carrier directory
  listCarriers,
  getCarrier,
  saveCarrier,
  deleteCarrier,
  // Class codes — the dictionary and the carrier links
  listClassCodes,
  searchClassCodes,
  getClassCode,
  saveClassCode,
  linkClassCode,
  // Appetite / placement
  listAppointments,
  matchAppetiteFn,
  matchOpportunity,
  // Grounded answers
  askCarrierDesk,
  carrierAdvisor,
  panelAdvisor,
];

const BY_NAME = new Map(FUNCTIONS.map((f) => [f.name, f]));

export function getFunction(name: string): CarrierHubFunction<any> | undefined {
  return BY_NAME.get(name);
}

// Validate then run. Every caller — HTTP route, MCP tool, a future scheduled job —
// goes through here, so input validation and error shape are the same everywhere.
export async function callFunction(
  name: string,
  rawInput: unknown,
  ctx: FunctionContext = makeContext("http"),
): Promise<unknown> {
  const fn = BY_NAME.get(name);
  if (!fn) throw new FunctionError(`No such function: ${name}`, 404);

  const parsed = fn.input.safeParse(rawInput ?? {});
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new FunctionError(`Invalid input for ${name} — ${issues}`, 400);
  }
  return fn.handler(parsed.data, ctx);
}

/** Machine-readable description of the whole surface, with JSON Schema inputs. */
export function describeFunctions() {
  return FUNCTIONS.map((f) => ({
    name: f.name,
    title: f.title,
    description: f.description,
    readOnly: f.readOnly,
    destructive: f.destructive ?? false,
    inputSchema: z.toJSONSchema(f.input, { io: "input" }),
  }));
}

export { FunctionError, makeContext };
export type { CarrierHubFunction, FunctionContext };
