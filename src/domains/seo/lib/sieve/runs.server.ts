/**
 * Run orchestration: the small amount of ordering that must be right.
 *
 *  1. Record the intent durably, THEN send the start POST. If the process dies
 *     between the two, the row says "starting" and nothing is resent.
 *  2. On the 202, write session_id before doing anything else, so a crash
 *     resumes polling instead of starting a duplicate run.
 *  3. On a timeout / network failure of the start POST, mark the row
 *     "ambiguous". Every caller here treats that as "needs a human": it is
 *     never retried automatically, because the first call may have created a
 *     run and accepted calls spend credits.
 *
 * Polling is deliberately a single step per call, not a loop: this app has no
 * queue or background worker, and a serverless handler must not block for the
 * minutes a run can take. Long-running waits live in the client
 * (`waitForRun` / `followUp`) and are driven by scripts and tests.
 */

import { SieveError, isRetryableRead, toSieveError } from "./errors";
import { turnCount } from "./request";
import { isResumableLocalStatus, type SieveRunStore } from "./store";
import type { SieveClient } from "./client.server";
import type {
  SieveRunInput,
  SieveRunRecord,
  SieveRunSnapshot,
} from "./types";

export interface SieveRunDeps {
  client: SieveClient;
  store: SieveRunStore;
}

/**
 * Read failures that will not fix themselves: the record is closed out so a
 * later resume stops hammering the API. Transient kinds are left resumable.
 */
function isNonTransientReadFailure(kind: string): boolean {
  return kind === "bad_request" || kind === "unauthorized" || kind === "not_found";
}

function describe(error: SieveError): string {
  return error.detail ? `${error.kind}: ${error.message} (${error.detail})` : `${error.kind}: ${error.message}`;
}

/**
 * Records the intent, starts the run, and persists session_id before
 * returning. Throws a SieveError; the row it leaves behind is the durable
 * evidence of what happened.
 */
export async function startSieveRun(
  deps: SieveRunDeps,
  input: SieveRunInput,
): Promise<SieveRunRecord> {
  const record = await deps.store.createStarting(input);
  try {
    const started = await deps.client.startRun(input);
    await deps.store.attachSession(record.id, started.sessionId);
    const updated = await deps.store.getById(record.id);
    return updated ?? { ...record, sessionId: started.sessionId, status: "queued" };
  } catch (error) {
    const mapped = toSieveError(error, "startSieveRun");
    const message = describe(mapped);
    if (mapped.ambiguous) {
      // The POST may have been accepted. Do not retry; make it visible.
      await deps.store.markAmbiguous(record.id, message);
    } else {
      await deps.store.markError(record.id, message);
    }
    throw mapped;
  }
}

/** One poll step: GET the run and persist what it said. */
export async function pollSieveRunOnce(
  deps: SieveRunDeps,
  sessionId: string,
): Promise<{ record: SieveRunRecord; snapshot: SieveRunSnapshot }> {
  const record = await deps.store.getBySessionId(sessionId);
  if (!record) {
    throw new SieveError("not_found", `no local record for sieve session ${sessionId}`);
  }
  const snapshot = await deps.client.getRun(sessionId);
  await deps.store.recordSnapshot(record.id, snapshot);
  const updated = await deps.store.getById(record.id);
  return { record: updated ?? record, snapshot };
}

/**
 * Records the turn count BEFORE the follow-up is sent, then sends it. The
 * count is what lets a later poll tell the new answer from the previous one.
 * A 409 propagates: the caller waits and resends, per the contract.
 */
export async function recordFollowUpTurn(
  deps: SieveRunDeps,
  sessionId: string,
  input: SieveRunInput,
): Promise<{ record: SieveRunRecord; baselineTurns: number }> {
  const record = await deps.store.getBySessionId(sessionId);
  if (!record) {
    throw new SieveError("not_found", `no local record for sieve session ${sessionId}`);
  }
  const before = await deps.client.getRun(sessionId);
  const baselineTurns = turnCount(before);
  await deps.store.setBaselineTurns(record.id, baselineTurns);
  await deps.client.sendMessage(sessionId, input);
  const updated = await deps.store.getById(record.id);
  return { record: updated ?? record, baselineTurns };
}

export interface SieveResumeSummary {
  polled: number;
  done: number;
  refused: number;
  running: number;
  /** Reads that failed transiently; the record stays resumable. */
  failed: { sessionId: string; kind: string; message: string }[];
  /** Records that need a human: starting / ambiguous / error. */
  needsAttention: SieveRunRecord[];
}

/**
 * Advances every resumable run by one poll. Intended to be called on a
 * schedule or by hand; it never starts a run and never touches a record whose
 * start POST is ambiguous.
 */
export async function resumeSieveRuns(
  deps: SieveRunDeps,
  options?: { limit?: number },
): Promise<SieveResumeSummary> {
  const summary: SieveResumeSummary = {
    polled: 0,
    done: 0,
    refused: 0,
    running: 0,
    failed: [],
    needsAttention: [],
  };

  const records = (await deps.store.listResumable(options?.limit ?? 25)).filter((record) =>
    isResumableLocalStatus(record.status),
  );
  summary.needsAttention = await deps.store.listNeedingAttention(options?.limit ?? 25);

  for (const record of records) {
    if (!record.sessionId) continue;
    summary.polled += 1;
    try {
      const { snapshot } = await pollSieveRunOnce(deps, record.sessionId);
      if (snapshot.status === "done") summary.done += 1;
      else if (snapshot.status === "refused") summary.refused += 1;
      else summary.running += 1;
    } catch (error) {
      const mapped = toSieveError(error, `resume ${record.sessionId}`);
      if (!isRetryableRead(mapped.kind) && isNonTransientReadFailure(mapped.kind)) {
        await deps.store.markError(record.id, describe(mapped));
      }
      summary.failed.push({
        sessionId: record.sessionId,
        kind: mapped.kind,
        message: mapped.message,
      });
    }
  }

  // `needsAttention` (starting / ambiguous / error) is surfaced, never acted
  // on: a "starting" row may be mid-POST and an "ambiguous" row may already
  // have a live run, so re-sending either could create a duplicate.
  return summary;
}
