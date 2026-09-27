import { NextRequest, NextResponse } from "next/server";
import { adminGate } from "@/lib/adminAuth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin gate ──────────────────────────────────────────────
  if (pathname.startsWith("/finance/admin")) {
    const gate = adminGate(request, process.env.ADMIN_SECRET);
    if (gate.ok) {
      return NextResponse.next();
    }
    return new NextResponse(gate.status === 401 ? "Unauthorized" : "Forbidden", {
      status: gate.status,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/finance/admin/:path*"],
};
