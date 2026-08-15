import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal fail-closed gate for the finance admin section.
 *
 * Access requires a bearer token (or `racira_admin` cookie) matching the
 * ADMIN_SECRET env var. If ADMIN_SECRET is not configured, the routes are
 * denied outright — "not publicly reachable" is the invariant, not
 * "reachable when configured".
 *
 * NOTE: this is a simple gate, not a full auth system. A proper admin
 * (sessions, roles, audit logging) is a follow-up item.
 */
const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;

  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const cookie = request.cookies.get("racira_admin")?.value;

  return bearer === ADMIN_SECRET || cookie === ADMIN_SECRET;
}

export function middleware(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next();
  }
  // 401 if a secret is configured (client can authenticate); 403 otherwise.
  return new NextResponse(
    ADMIN_SECRET ? "Unauthorized" : "Forbidden",
    { status: ADMIN_SECRET ? 401 : 403 }
  );
}

export const config = {
  matcher: ["/finance/admin/:path*"],
};
