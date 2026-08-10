import { z } from "zod";
import { defineFunction, requireDb, dbFail, FunctionError } from "./types";
import {
  DIRECTORY_SELECT,
  invalidateDirectoryCache,
  loadDirectory,
} from "../lib/directory";
import {
  CARRIER_WRITE_COLUMNS,
  syncCarrierAppetite,
  syncCarrierContacts,
} from "../lib/carrier-writes";

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  // Job title / underwriting role for the contact (e.g. "Senior Underwriter").
  role: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  region: z.string().nullish(),
});

const appetiteRowSchema = z.object({
  id: z.string().optional(),
  lob: z.string().describe("Line of business — the grain of an appetite row. Required."),
  appetite_level: z.string().nullish(),
  min_premium: z.number().nullish(),
  max_premium: z.number().nullish(),
  states_approved: z.array(z.string()).optional(),
  key_requirements: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  class_codes: z.array(z.string()).optional(),
  notes: z.string().nullish(),
  details: z.record(z.string(), z.unknown()).optional(),
  effective_date: z.string().nullish(),
  active: z.boolean().optional(),
  source: z.string().optional(),
  confidence: z.string().optional(),
});

export const listCarriers = defineFunction({
  name: "list_carriers",
  title: "List carrier directory",
  description:
    "The agency's full carrier panel: every carrier with its underwriting contacts and " +
    "its structured appetite rows (line of business, approved states, premium bands, " +
    "class codes, requirements, exclusions). Start here for any question about who the " +
    "agency is appointed with or what a specific carrier writes.",
  input: z.object({}),
  readOnly: true,
  async handler(_input, ctx) {
    const db = requireDb(ctx);
    // Reads go through the same cache the grounded answers use, so a directory
    // listing and an Ask-the-Desk answer can never disagree within a request.
    const carriers = await loadDirectory(db);
    return { carriers };
  },
});

export const saveCarrier = defineFunction({
  name: "save_carrier",
  title: "Create or update a carrier",
  description:
    "Upsert a carrier record. Contacts and appetite rows are replace-in-full when " +
    "supplied: the list you send becomes the complete set for that carrier and rows " +
    "you omit are deleted. Omit the `contacts` or `appetite_rows` key entirely to leave " +
    "that side untouched. Read the carrier first and confirm it is the right record " +
    "before writing — the directory contains near-duplicate names.",
  input: z.object({
    id: z.string().describe("Carrier id. Must already be known for an update."),
    name: z.string(),
    is_active: z.boolean().optional(),
    segment: z.array(z.string()).optional(),
    lines_of_business: z.array(z.string()).optional(),
    agency_code: z.string().nullish(),
    general_agent: z.string().nullish().describe("Set when the appointment is through a GA rather than direct."),
    website: z.string().nullish(),
    agent_login: z.string().nullish(),
    logo_url: z.string().nullish(),
    original_logo_path: z.string().nullish(),
    appetite_can_write: z.array(z.string()).optional(),
    appetite_cannot_write: z.array(z.string()).optional(),
    appetite_notes: z.string().nullish(),
    underwriting_hotline: z.string().nullish(),
    incentives: z.unknown().optional(),
    worksheets: z.unknown().optional(),
    contacts: z.array(contactSchema).optional()
      .describe("Full replacement list of underwriting contacts."),
    appetite_rows: z.array(appetiteRowSchema).optional()
      .describe("Full replacement list of structured appetite rows, one per line of business."),
  }),
  readOnly: false,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const body = input as Record<string, any>;
    if (!body.id || !body.name) {
      throw new FunctionError("carrier id and name are required");
    }

    const row: Record<string, unknown> = {};
    for (const col of CARRIER_WRITE_COLUMNS) {
      if (col in body) row[col] = body[col];
    }
    const { error } = await db.from("carriers").upsert(row);
    if (error) dbFail("carrier upsert", error);

    // Persist the carrier's contacts too (carrier upserted first so the FK holds).
    if (Array.isArray(body.contacts)) {
      try {
        await syncCarrierContacts(db, String(body.id), body.contacts);
      } catch (e: any) {
        throw new FunctionError(e.message, 500);
      }
    }

    // Guarded on presence so a payload that omits appetite_rows never deletes
    // existing rows.
    if (Array.isArray(body.appetite_rows)) {
      try {
        await syncCarrierAppetite(db, String(body.id), String(body.name), body.appetite_rows);
      } catch (e: any) {
        throw new FunctionError(e.message, 500);
      }
    }

    invalidateDirectoryCache();
    return { ok: true };
  },
});

export const deleteCarrier = defineFunction({
  name: "delete_carrier",
  title: "Delete a carrier",
  description:
    "Permanently remove a carrier along with its contacts and appetite rows. There is " +
    "no undo and no soft-delete. To take a carrier off the panel without losing its " +
    "record, call save_carrier with is_active false instead.",
  input: z.object({
    id: z.string().describe("Carrier id to delete."),
  }),
  readOnly: false,
  destructive: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const id = String(input.id || "").trim();
    if (!id) throw new FunctionError("carrier id is required");

    // No ON DELETE CASCADE is assumed, so children go first, then the carrier.
    for (const child of ["carrier_contacts", "carrier_appetite"] as const) {
      const { error } = await db.from(child).delete().eq("carrier_id", id);
      if (error) dbFail(`delete ${child}`, error);
    }
    const { error } = await db.from("carriers").delete().eq("id", id);
    if (error) dbFail("delete carrier", error);

    invalidateDirectoryCache();
    return { ok: true };
  },
});

export const getCarrier = defineFunction({
  name: "get_carrier",
  title: "Get one carrier",
  description:
    "One carrier in full — contacts and structured appetite rows included. Use this " +
    "before any write, to confirm you have the right record.",
  input: z.object({
    id: z.string().describe("Carrier id."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const { data, error } = await db
      .from("carriers")
      .select(DIRECTORY_SELECT)
      .eq("id", String(input.id))
      .maybeSingle();
    if (error) dbFail("carrier read", error);
    if (!data) throw new FunctionError(`No carrier with id ${input.id}`, 404);
    return { carrier: data };
  },
});
