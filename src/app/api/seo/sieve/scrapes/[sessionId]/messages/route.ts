/**
 * POST /api/seo/sieve/scrapes/<session_id>/messages — send a follow-up turn.
 *
 * The turn count is recorded BEFORE the message is sent, which is what lets a
 * later poll distinguish the new answer from the previous one: a run can be
 * "done" again while still carrying the old turns.
 *
 * 409 means a turn is already in flight — wait, then resend. That is the one
 * POST in this integration where a resend is the documented behaviour.
 */

import { NextRequest, NextResponse } from "next/server";

import { recordFollowUpTurn } from "@/domains/seo/lib/sieve/runs.server";
import { requireAdmin } from "@/lib/adminAuth";

import { adminDenied, sieveContext, sieveErrorResponse, sieveUnavailable } from "../../../context";
import { readRunInput } from "../../../run-input";

export const dynamic = "force-dynamic";

export async function POST(
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
    const input = await readRunInput(request);
    const { record, baselineTurns } = await recordFollowUpTurn(
      sieveContext(),
      sessionId,
      input,
    );
    return NextResponse.json(
      {
        run_id: record.id,
        session_id: sessionId,
        status: "accepted",
        baseline_turns: baselineTurns,
        // The caller must keep polling until status is "done" AND turns > baseline.
        note: "Poll until status is done and turns has advanced past baseline_turns.",
      },
      { status: 202 },
    );
  } catch (error) {
    return sieveErrorResponse(error, `POST /api/seo/sieve/scrapes/${sessionId}/messages`);
  }
}
