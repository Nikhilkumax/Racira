/**
 * Durable records for sieve runs.
 *
 * Why this exists: POST /api/scrapes has no idempotency key and an accepted
 * call spends credits, so the session_id must be written the moment the 202
 * arrives — a crash after that must resume polling, never start a second run.
 * The record also captures the intent (POST may be in flight) so an ambiguous
 * timeout is visible instead of silently retried.
 *
 * The interface is deliberately tiny and storage-agnostic: the Supabase
 * adapter (supabase-store.server.ts) plugs into the app's existing client
 * factories, and the in-memory adapter is used by tests and by local scripts.
 */

import { classifyRunStatus } from "./request";
import type {
  SieveRunInput,
  SieveRunRecord,
  SieveRunSnapshot,
  SieveRunStatusLocal,
} from "./types";

/** Local states a resume poller may pick up (a session_id exists). */
export const RESUMABLE_LOCAL_STATUSES: readonly SieveRunStatusLocal[] = [
  "queued",
  "running",
];

/**
 * Local states that need a human: "starting" and "ambiguous" mean the start
 * POST's outcome is unknown and MUST NOT be repeated automatically, "error" is
 * a terminal local failure.
 */
export const NEEDS_ATTENTION_LOCAL_STATUSES: readonly SieveRunStatusLocal[] = [
  "starting",
  "ambiguous",
  "error",
];

export const TERMINAL_LOCAL_STATUSES: readonly SieveRunStatusLocal[] = [
  "done",
  "refused",
];

export function isTerminalLocalStatus(status: SieveRunStatusLocal): boolean {
  return TERMINAL_LOCAL_STATUSES.includes(status);
}

export function isResumableLocalStatus(status: SieveRunStatusLocal): boolean {
  return RESUMABLE_LOCAL_STATUSES.includes(status);
}

/** Maps a sieve snapshot onto the local lifecycle. */
export function localStatusForSnapshot(snapshot: SieveRunSnapshot): SieveRunStatusLocal {
  switch (classifyRunStatus(snapshot.status)) {
    case "pending":
      return snapshot.status === "queued" ? "queued" : "running";
    case "done":
      return "done";
    case "refused":
      return "refused";
    default:
      return "error";
  }
}

/** One-line description of why a run is stuck, for the UI/log. */
export function refusalReason(snapshot: SieveRunSnapshot): string | null {
  if (classifyRunStatus(snapshot.status) !== "refused") return null;
  const code = snapshot.refusal?.code;
  if (typeof code === "string" && code !== "") {
    const isQuota = code.toLowerCase().includes("quota") || snapshot.refusal?.quota !== undefined;
    return isQuota ? `refused (${code}) — credit/quota limit reached` : `refused (${code})`;
  }
  return "refused";
}

/**
 * Storage-safe view of a run body: an upload's bytes are never written to a
 * durable record (only its name/size), so a request row stays small and
 * readable.
 */
export function sanitizeRequestForStorage(input: SieveRunInput): SieveRunInput {
  if (!input.file) return { ...input };
  const { file, ...rest } = input;
  return {
    ...rest,
    file: {
      bytes: new Uint8Array(0),
      filename: file.filename,
      contentType: file.contentType,
    },
  };
}

export interface SieveRunStore {
  /** Records the intent BEFORE the start POST is sent. */
  createStarting(input: SieveRunInput): Promise<SieveRunRecord>;
  /** Writes the session_id from the 202 — the durable anti-duplicate anchor. */
  attachSession(id: string, sessionId: string): Promise<void>;
  /** Persists a polled snapshot and the local status derived from it. */
  recordSnapshot(id: string, snapshot: SieveRunSnapshot): Promise<void>;
  /** The start POST timed out / lost the network: the outcome is unknown. */
  markAmbiguous(id: string, message: string): Promise<void>;
  markError(id: string, message: string): Promise<void>;
  /** Turn count recorded immediately before a follow-up was sent. */
  setBaselineTurns(id: string, turns: number): Promise<void>;
  getById(id: string): Promise<SieveRunRecord | null>;
  getBySessionId(sessionId: string): Promise<SieveRunRecord | null>;
  listResumable(limit?: number): Promise<SieveRunRecord[]>;
  listNeedingAttention(limit?: number): Promise<SieveRunRecord[]>;
}

/** Clone-on-read so a caller can never mutate stored state by accident. */
function clone(record: SieveRunRecord): SieveRunRecord {
  return {
    ...record,
    request: { ...record.request },
    snapshot: record.snapshot ? JSON.parse(JSON.stringify(record.snapshot)) : null,
  };
}

function newId(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * In-memory implementation. Correct for a single long-lived process (tests,
 * local scripts); NOT durable across a serverless cold start, which is why the
 * routes use the Supabase store.
 */
export function createMemoryRunStore(now: () => Date = () => new Date()): SieveRunStore {
  const byId = new Map<string, SieveRunRecord>();

  const timestamp = () => now().toISOString();

  async function mutate(
    id: string,
    change: (record: SieveRunRecord) => void,
  ): Promise<void> {
    const record = byId.get(id);
    if (!record) return;
    change(record);
    record.updatedAt = timestamp();
  }

  return {
    async createStarting(input) {
      const record: SieveRunRecord = {
        id: newId(),
        sessionId: null,
        status: "starting",
        instruction: input.instruction,
        request: sanitizeRequestForStorage(input),
        snapshot: null,
        baselineTurns: null,
        lastError: null,
        createdAt: timestamp(),
        updatedAt: timestamp(),
      };
      byId.set(record.id, record);
      return clone(record);
    },

    async attachSession(id, sessionId) {
      await mutate(id, (record) => {
        record.sessionId = sessionId;
        record.status = "queued";
      });
    },

    async recordSnapshot(id, snapshot) {
      await mutate(id, (record) => {
        record.snapshot = JSON.parse(JSON.stringify(snapshot)) as SieveRunSnapshot;
        record.status = localStatusForSnapshot(snapshot);
        record.lastError = null;
      });
    },

    async markAmbiguous(id, message) {
      await mutate(id, (record) => {
        record.status = "ambiguous";
        record.lastError = message;
      });
    },

    async markError(id, message) {
      await mutate(id, (record) => {
        record.status = "error";
        record.lastError = message;
      });
    },

    async setBaselineTurns(id, turns) {
      await mutate(id, (record) => {
        record.baselineTurns = turns;
      });
    },

    async getById(id) {
      const record = byId.get(id);
      return record ? clone(record) : null;
    },

    async getBySessionId(sessionId) {
      for (const record of byId.values()) {
        if (record.sessionId === sessionId) return clone(record);
      }
      return null;
    },

    async listResumable(limit = 25) {
      return [...byId.values()]
        .filter((record) => isResumableLocalStatus(record.status))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, limit)
        .map(clone);
    },

    async listNeedingAttention(limit = 25) {
      return [...byId.values()]
        .filter((record) => NEEDS_ATTENTION_LOCAL_STATUSES.includes(record.status))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, limit)
        .map(clone);
    },
  };
}
