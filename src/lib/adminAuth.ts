/**
 * The single admin gate.
 *
 * Extracted from middleware.ts so a route handler can apply exactly the same
 * rule the /finance/admin pages already use: a bearer token or the
 * `racira_admin` cookie matching ADMIN_SECRET. Fail-closed: with no
 * ADMIN_SECRET configured nothing is authorized.
 *
 * Edge-safe on purpose (Web Headers API only) because middleware imports it.
 */

export interface AdminGateRequest {
  headers: { get(name: string): string | null };
  cookies: { get(name: string): { value: string } | undefined };
}

export interface AdminGateResult {
  ok: boolean;
  /** 401 when a secret is configured but not presented, 403 when there is none. */
  status: 401 | 403;
  message: string;
}

export function adminGate(
  request: AdminGateRequest,
  adminSecret: string | undefined,
): AdminGateResult {
  if (!adminSecret) {
    return {
      ok: false,
      status: 403,
      message: "Forbidden: ADMIN_SECRET is not configured",
    };
  }
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const cookie = request.cookies.get("racira_admin")?.value;
  if (bearer === adminSecret || cookie === adminSecret) {
    return { ok: true, status: 401, message: "" };
  }
  return { ok: false, status: 401, message: "Unauthorized" };
}

/** Convenience for route handlers: the same rule, reading env per request. */
export function requireAdmin(request: AdminGateRequest): AdminGateResult {
  return adminGate(request, process.env.ADMIN_SECRET);
}
