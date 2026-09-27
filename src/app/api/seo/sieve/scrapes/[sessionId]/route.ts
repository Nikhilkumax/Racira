/**
 * GET /api/seo/sieve/scrapes/<session_id> — one poll step.
 *
 * One step, not a loop: this app has no queue or worker, and a serverless
 * handler must not block for the minutes a run can take. Callers (or a
 * scheduler hitting this route) poll until the status is terminal; the client
 * library's waitForRun does the same thing with 5s→30s backoff for scripts
 * and tests.
 */

import { NextRequest, NextResponse } from "next/server";

import { conformanceVerdict } from "@/domains/seo/lib/sieve/request";
import { pollSieveRunOnce } from "@/domains/seo/lib/sieve/runs.server";
import { refusalReason } from "@/domains/seo/lib/sieve/store";
import { requireAdmin } from "@/lib/adminAuth";

import { adminDenied, sieveContext, sieveErrorResponse, sieveUnavailable } from "../../context";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const denied = adminDenied(requireAdmin(request));
  if (denied) return denied;

  const unavailable = sieveUnavailable();
  if (unavailable) return unavailable;

  const sessionId = params.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const { record, snapshot } = await pollSieveRunOnce(sieveContext(), sessionId);
    return NextResponse.json({
      run_id: record.id,
      session_id: sessionId,
      local_status: record.status,
      status: snapshot.status,
      summary: snapshot.summary ?? null,
      files: snapshot.files ?? [],
      // "fail" (and anything unrecognised) must never be presented as clean data.
      schema_conformance: snapshot.schema_conformance ?? null,
      conformance: conformanceVerdict(snapshot.schema_conformance),
      refusal: snapshot.refusal ?? null,
      refusal_reason: refusalReason(snapshot),
      turns: Array.isArray(snapshot.turns) ? snapshot.turns.length : 0,
      baseline_turns: record.baselineTurns,
      result: snapshot.result ?? null,
    });
  } catch (error) {
    return sieveErrorResponse(error, `GET /api/seo/sieve/scrapes/${sessionId}`);
  }
}
