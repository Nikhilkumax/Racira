import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const cookie = request.cookies.get("racira_admin")?.value;
  return bearer === ADMIN_SECRET || cookie === ADMIN_SECRET;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin gate ──────────────────────────────────────────────
  if (pathname.startsWith("/finance/admin")) {
    if (isAuthorized(request)) {
      return NextResponse.next();
    }
    return new NextResponse(
      ADMIN_SECRET ? "Unauthorized" : "Forbidden",
      { status: ADMIN_SECRET ? 401 : 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/finance/admin/:path*"],
};
