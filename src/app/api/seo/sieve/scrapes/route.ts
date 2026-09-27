/**
 * POST /api/seo/sieve/scrapes — start a run.
 * GET  /api/seo/sieve/scrapes — the operator view: resumable runs plus runs
 *      that need a human (a start whose outcome is unknown is never retried).
 *
 * Admin-gated with the same rule as /finance/admin, because accepted runs
 * spend credits. 202 returns the session_id, which is persisted before this
 * handler responds.
 */

import { NextRequest, NextResponse } from "next/server";

import { startSieveRun } from "@/domains/seo/lib/sieve/runs.server";
import { requireAdmin } from "@/lib/adminAuth";

import {
  adminDenied,
  sieveContext,
  sieveErrorResponse,
  sieveUnavailable,
} from "../context";
import { readRunInput } from "../run-input";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = adminDenied(requireAdmin(request));
  if (denied) return denied;

  const unavailable = sieveUnavailable();
  if (unavailable) return unavailable;

  try {
    const input = await readRunInput(request);
    const record = await startSieveRun(sieveContext(), input);
    return NextResponse.json(
      {
        run_id: record.id,
        session_id: record.sessionId,
        status: record.status,
        poll: record.sessionId ? `/api/scrapes/${record.sessionId}` : null,
      },
      { status: 202 },
    );
  } catch (error) {
    return sieveErrorResponse(error, "POST /api/seo/sieve/scrapes");
  }
}

export async function GET(request: NextRequest) {
  const denied = adminDenied(requireAdmin(request));
  if (denied) return denied;

  const unavailable = sieveUnavailable();
  if (unavailable) return unavailable;

  try {
    const { store } = sieveContext();
    const [resumable, needsAttention] = await Promise.all([
      store.listResumable(50),
      store.listNeedingAttention(50),
    ]);
    return NextResponse.json({
      resumable: resumable.map((record) => ({
        run_id: record.id,
        session_id: record.sessionId,
        status: record.status,
        instruction: record.instruction,
        updated_at: record.updatedAt,
      })),
      needs_attention: needsAttention.map((record) => ({
        run_id: record.id,
        session_id: record.sessionId,
        status: record.status,
        instruction: record.instruction,
        last_error: record.lastError,
        updated_at: record.updatedAt,
      })),
    });
  } catch (error) {
    return sieveErrorResponse(error, "GET /api/seo/sieve/scrapes");
  }
}
