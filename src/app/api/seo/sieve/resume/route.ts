/**
 * POST /api/seo/sieve/resume — advance every resumable run by one poll.
 *
 * This is the "background job" this app can honestly support: there is no
 * queue or worker here, so resumption is an explicit, idempotent step that a
 * scheduler (or a human) can call. It never starts a run, and it never touches
 * a record whose start POST is ambiguous — that row is reported instead, so a
 * duplicate run can never be created by turning this on.
 */

import { NextRequest, NextResponse } from "next/server";

import { resumeSieveRuns } from "@/domains/seo/lib/sieve/runs.server";
import { requireAdmin } from "@/lib/adminAuth";

import { adminDenied, sieveContext, sieveErrorResponse, sieveUnavailable } from "../context";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = adminDenied(requireAdmin(request));
  if (denied) return denied;

  const unavailable = sieveUnavailable();
  if (unavailable) return unavailable;

  try {
    const summary = await resumeSieveRuns(sieveContext(), { limit: 25 });
    return NextResponse.json({
      polled: summary.polled,
      done: summary.done,
      refused: summary.refused,
      running: summary.running,
      failed: summary.failed,
      needs_attention: summary.needsAttention.map((record) => ({
        run_id: record.id,
        session_id: record.sessionId,
        status: record.status,
        last_error: record.lastError,
      })),
    });
  } catch (error) {
    return sieveErrorResponse(error, "POST /api/seo/sieve/resume");
  }
}
