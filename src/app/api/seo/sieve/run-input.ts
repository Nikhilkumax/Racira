/**
 * Parses a run body from a route request — application/json or
 * multipart/form-data with a "file" field, exactly as the sieve API accepts
 * them. Validation itself lives in the pure request builder; this file only
 * turns HTTP bytes into the input shape.
 */

import { SieveError } from "@/domains/seo/lib/sieve/errors";
import type { SieveRunInput } from "@/domains/seo/lib/sieve/types";

/** Upload ceiling: keeps a single request inside a serverless memory budget. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function asString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new SieveError("bad_request", `${field} must be a string`);
  }
  return value;
}

/** Accepts a JSON array, a JSON string, or newline/comma separated values. */
function asStringList(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry !== "string") {
        throw new SieveError("bad_request", `${field} entries must be strings`);
      }
      return entry;
    });
  }
  if (typeof value !== "string") {
    throw new SieveError("bad_request", `${field} must be an array or a string`);
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new SieveError("bad_request", `${field} is not valid JSON`);
    }
    if (!Array.isArray(parsed)) {
      throw new SieveError("bad_request", `${field} must be a JSON array`);
    }
    return parsed.map((entry) => String(entry));
  }
  return trimmed
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

function parseJsonField(value: unknown, field: string): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "object") return value;
  if (typeof value !== "string") {
    throw new SieveError("bad_request", `${field} must be a JSON object`);
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new SieveError("bad_request", `${field} is not valid JSON`);
  }
}

export async function readRunInput(request: Request): Promise<SieveRunInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new SieveError("bad_request", "could not parse the multipart body");
    }
    const file = form.get("file");
    const input: SieveRunInput = {
      instruction: asString(form.get("instruction"), "instruction") ?? "",
      target_urls: asStringList(form.getAll("target_urls").length > 1 ? form.getAll("target_urls") : form.get("target_urls"), "target_urls"),
      fields: asStringList(form.getAll("fields").length > 1 ? form.getAll("fields") : form.get("fields"), "fields"),
      schema: parseJsonField(form.get("schema"), "schema"),
      output_schema: parseJsonField(form.get("output_schema"), "output_schema"),
      table_shape: asString(form.get("table_shape"), "table_shape") as SieveRunInput["table_shape"],
      compliance_mode: asString(form.get("compliance_mode"), "compliance_mode") as SieveRunInput["compliance_mode"],
    };
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new SieveError(
          "bad_request",
          `file exceeds the ${MAX_UPLOAD_BYTES} byte upload ceiling`,
        );
      }
      input.file = {
        bytes: new Uint8Array(await file.arrayBuffer()),
        filename: file.name || "upload",
        contentType: file.type || "application/octet-stream",
      };
    }
    if (!input.instruction.trim()) {
      throw new SieveError("bad_request", "instruction is required (plain language)");
    }
    return input;
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new SieveError("bad_request", "request body must be JSON or multipart/form-data");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new SieveError("bad_request", "request body must be a JSON object");
  }
  const record = parsed as Record<string, unknown>;
  let file: SieveRunInput["file"];
  const rawFile = record.file;
  if (rawFile && typeof rawFile === "object") {
    const fileRecord = rawFile as Record<string, unknown>;
    const base64 = fileRecord.base64;
    if (typeof base64 !== "string") {
      throw new SieveError("bad_request", "file.base64 must be a string");
    }
    const bytes = Buffer.from(base64, "base64");
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      throw new SieveError(
        "bad_request",
        `file exceeds the ${MAX_UPLOAD_BYTES} byte upload ceiling`,
      );
    }
    file = {
      bytes: new Uint8Array(bytes),
      filename: typeof fileRecord.filename === "string" ? fileRecord.filename : "upload",
      contentType:
        typeof fileRecord.contentType === "string" ? fileRecord.contentType : undefined,
    };
  }

  return {
    instruction: asString(record.instruction, "instruction") ?? "",
    target_urls: asStringList(record.target_urls, "target_urls"),
    fields: asStringList(record.fields, "fields"),
    schema: record.schema,
    output_schema: record.output_schema,
    table_shape: record.table_shape as SieveRunInput["table_shape"],
    compliance_mode: record.compliance_mode as SieveRunInput["compliance_mode"],
    file,
  };
}
