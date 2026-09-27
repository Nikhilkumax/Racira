/**
 * Supabase adapter for the sieve run store.
 *
 * Reuses the app's existing Supabase persistence — no second database, no
 * queue, no config system. The client is injected (the app already builds one
 * with createAdminClient() from the finance supabase module) so this file
 * knows nothing about how the client is configured, and nothing about sieve
 * credentials.
 *
 * Table: see `sieve_runs` in supabase/schema.sql. RLS is on with no public
 * policy, so only the service-role client can read or write it.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isResumableLocalStatus,
  localStatusForSnapshot,
  sanitizeRequestForStorage,
  type SieveRunStore,
} from "./store";
import type {
  SieveRunInput,
  SieveRunRecord,
  SieveRunSnapshot,
  SieveRunStatusLocal,
} from "./types";

export const SIEVE_RUNS_TABLE = "sieve_runs";

interface SieveRunRow {
  id: string;
  session_id: string | null;
  status: string;
  instruction: string;
  request: SieveRunInput | null;
  snapshot: SieveRunSnapshot | null;
  baseline_turns: number | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SieveRunRow): SieveRunRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    status: row.status as SieveRunStatusLocal,
    instruction: row.instruction,
    request: row.request ?? { instruction: row.instruction },
    snapshot: row.snapshot ?? null,
    baselineTurns: row.baseline_turns,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fail(action: string, error: { message?: string } | null): never {
  throw new Error(`sieve_runs ${action} failed: ${error?.message ?? "unknown Supabase error"}`);
}

export function createSupabaseRunStore(supabase: SupabaseClient): SieveRunStore {
  const table = () => supabase.from(SIEVE_RUNS_TABLE);

  async function selectOne(column: "id" | "session_id", value: string): Promise<SieveRunRecord | null> {
    const { data, error } = await table()
      .select("*")
      .eq(column, value)
      .limit(1)
      .maybeSingle();
    if (error) fail("select", error);
    return data ? fromRow(data as SieveRunRow) : null;
  }

  async function patch(id: string, values: Record<string, unknown>): Promise<void> {
    const { error } = await table()
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) fail("update", error);
  }

  return {
    async createStarting(input) {
      const { data, error } = await table()
        .insert({
          status: "starting",
          instruction: input.instruction,
          request: sanitizeRequestForStorage(input),
        })
        .select("*")
        .single();
      if (error) fail("insert", error);
      return fromRow(data as SieveRunRow);
    },

    async attachSession(id, sessionId) {
      await patch(id, { session_id: sessionId, status: "queued", last_error: null });
    },

    async recordSnapshot(id, snapshot) {
      await patch(id, {
        snapshot,
        status: localStatusForSnapshot(snapshot),
        last_error: null,
      });
    },

    async markAmbiguous(id, message) {
      await patch(id, { status: "ambiguous", last_error: message });
    },

    async markError(id, message) {
      await patch(id, { status: "error", last_error: message });
    },

    async setBaselineTurns(id, turns) {
      await patch(id, { baseline_turns: turns });
    },

    async getById(id) {
      return selectOne("id", id);
    },

    async getBySessionId(sessionId) {
      return selectOne("session_id", sessionId);
    },

    async listResumable(limit = 25) {
      const { data, error } = await table()
        .select("*")
        .in("status", ["queued", "running"])
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) fail("select resumable", error);
      return ((data ?? []) as SieveRunRow[])
        .map(fromRow)
        .filter((record) => isResumableLocalStatus(record.status));
    },

    async listNeedingAttention(limit = 25) {
      const { data, error } = await table()
        .select("*")
        .in("status", ["starting", "ambiguous", "error"])
        .order("updated_at", { ascending: false })
        .limit(limit);
      if (error) fail("select attention", error);
      return ((data ?? []) as SieveRunRow[]).map(fromRow);
    },
  };
}
