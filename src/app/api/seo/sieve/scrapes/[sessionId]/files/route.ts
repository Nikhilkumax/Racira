/**
 * GET /api/seo/sieve/scrapes/<session_id>/files?url=<relative url>&name=<name>
 *
 * Delivered file URLs are relative to the API base and require the bearer
 * header, so the browser can never fetch them directly. This route proxies the
 * download server-side — and only for the API's own origin, so the key is
 * never attached to a request to a third-party host.
 */

import { NextRequest, NextResponse } from "next/server";

import { toArrayBuffer } from "@/domains/seo/lib/sieve/request";
import { requireAdmin } from "@/lib/adminAuth";

import { adminDenied, sieveContext, sieveErrorResponse, sieveUnavailable } from "../../../context";

export const dynamic = "force-dynamic";

/** Strips anything that could break out of the Content-Disposition header. */
function safeFilename(raw: string): string {
  const cleaned = raw.replace(/[\r\n"\\]/g, "").replace(/[/\\]/g, "_").trim();
  return cleaned === "" ? "sieve-artifact" : cleaned.slice(0, 200);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const denied = adminDenied(requireAdmin(request));
  if (denied) return denied;

  const unavailable = sieveUnavailable();
  if (unavailable) return unavailable;

  const fileUrl = request.nextUrl.searchParams.get("url");
  if (!fileUrl) {
    return NextResponse.json({ error: 'missing required "url" query parameter' }, { status: 400 });
  }

  try {
    const { client } = sieveContext();
    const bytes = await client.downloadFile({ url: fileUrl });
    const name = safeFilename(request.nextUrl.searchParams.get("name") ?? fileUrl.split("/").pop() ?? "");
    return new NextResponse(toArrayBuffer(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return sieveErrorResponse(error, `GET /api/seo/sieve/scrapes/${params.sessionId}/files`);
  }
}
