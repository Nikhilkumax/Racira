/**
 * sieve device login (RFC 8628-style device authorization grant).
 *
 * Deliberately self-contained — no imports at all — because the one-time login
 * script runs it directly under `node --experimental-strip-types`, which
 * resolves relative imports only with explicit extensions. Keeping it
 * dependency-free also means the whole flow is unit-testable with a fake
 * `fetch`.
 *
 * Anti-phishing: this module can only build URLs and poll. It never opens a
 * browser, never signs in, and never approves anything — approval is the
 * user's explicit click on sieve's own page, and the code works once and
 * expires after `expires_in` seconds.
 */

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

export type SieveDeviceLoginErrorCode =
  | "http"
  | "network"
  | "timeout"
  | "contract"
  | "access_denied"
  | "expired_token";

export class SieveDeviceLoginError extends Error {
  readonly code: SieveDeviceLoginErrorCode;
  readonly status: number | null;
  readonly detail: string | null;

  constructor(
    code: SieveDeviceLoginErrorCode,
    message: string,
    options?: { status?: number | null; detail?: string | null; cause?: unknown },
  ) {
    super(message);
    this.name = "SieveDeviceLoginError";
    this.code = code;
    this.status = options?.status ?? null;
    this.detail = options?.detail ?? null;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/** One poll's outcome. `pending` and `slow_down` mean "keep polling". */
export type DeviceTokenOutcome =
  | { state: "approved"; api_key: string; key_name: string | null; token_type: string | null }
  | { state: "pending" }
  | { state: "slow_down" }
  | { state: "transient"; message: string };

export interface DeviceLoginOptions {
  baseUrl: string;
  clientName: string;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  timeoutMs?: number;
  /** Called once with the code the user must see before polling starts. */
  onDeviceCode?: (code: DeviceCode) => void | Promise<void>;
  /** Called after each pending poll, with the attempt number. */
  onPending?: (attempt: number) => void | Promise<void>;
  /** Extra attempts after `expired_token`, restarting from step 1. */
  maxRestarts?: number;
}

export interface DeviceLoginResult {
  apiKey: string;
  keyName: string | null;
}

/**
 * Wording the operator must see. The verification page shows where the code
 * was requested from, labels the tool name as self-reported, and warns to
 * approve only a code you started yourself — so the script repeats the warning
 * rather than paraphrasing it away.
 */
export const DEVICE_LOGIN_SAFETY_TEXT = [
  "Approve only a code you started yourself.",
  "The tool name below is self-reported by this agent, not verified by sieve.",
  "If you did not start this login, deny it and report the code.",
].join("\n  ");

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Reads `{"error": "..."}`. */
function readErrorCode(text: string): string | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      const value = (parsed as Record<string, unknown>).error;
      if (typeof value === "string") return value;
    }
  } catch {
    // not JSON
  }
  return null;
}

async function postJson(
  fetchImpl: typeof fetch,
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<{ status: number; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();
    return { status: response.status, text };
  } finally {
    clearTimeout(timer);
  }
}

/** Step 1: ask for a device code plus the URL the user opens. */
export async function requestDeviceCode(options: {
  baseUrl: string;
  clientName: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<DeviceCode> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: { status: number; text: string };
  try {
    response = await postJson(
      fetchImpl,
      joinUrl(options.baseUrl, "/api/auth/device/code"),
      { client_name: options.clientName },
      options.timeoutMs ?? 30_000,
    );
  } catch (error) {
    throw new SieveDeviceLoginError("network", "could not reach sieve to start the device login", {
      cause: error,
    });
  }
  if (response.status < 200 || response.status >= 300) {
    throw new SieveDeviceLoginError("http", `device code request failed with HTTP ${response.status}`, {
      status: response.status,
      detail: response.text.slice(0, 300),
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new SieveDeviceLoginError("contract", "device code response was not JSON");
  }
  const record = (parsed ?? {}) as Record<string, unknown>;
  const deviceCode = record.device_code;
  const userCode = record.user_code;
  const verificationUriComplete = record.verification_uri_complete;
  if (typeof deviceCode !== "string" || typeof userCode !== "string") {
    throw new SieveDeviceLoginError("contract", "device code response is missing device_code/user_code");
  }
  return {
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: typeof record.verification_uri === "string" ? record.verification_uri : "",
    verification_uri_complete:
      typeof verificationUriComplete === "string" ? verificationUriComplete : "",
    expires_in: typeof record.expires_in === "number" ? record.expires_in : 600,
    interval: typeof record.interval === "number" && record.interval > 0 ? record.interval : 5,
  };
}

/** Step 3, one attempt. Never throws for the documented 400 codes. */
export async function pollDeviceTokenOnce(options: {
  baseUrl: string;
  deviceCode: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<DeviceTokenOutcome> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: { status: number; text: string };
  try {
    response = await postJson(
      fetchImpl,
      joinUrl(options.baseUrl, "/api/auth/device/token"),
      { device_code: options.deviceCode },
      options.timeoutMs ?? 30_000,
    );
  } catch (error) {
    const message = (error as { message?: string } | null)?.message ?? "network error";
    return { state: "transient", message };
  }

  if (response.status === 200) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch {
      throw new SieveDeviceLoginError("contract", "token response was not JSON");
    }
    const record = (parsed ?? {}) as Record<string, unknown>;
    const apiKey = record.api_key;
    if (typeof apiKey !== "string" || apiKey.trim() === "") {
      throw new SieveDeviceLoginError("contract", "token response carried no api_key");
    }
    return {
      state: "approved",
      api_key: apiKey,
      key_name: typeof record.key_name === "string" ? record.key_name : null,
      token_type: typeof record.token_type === "string" ? record.token_type : null,
    };
  }

  const code = readErrorCode(response.text);
  if (response.status === 400) {
    switch (code) {
      case "authorization_pending":
        return { state: "pending" };
      case "slow_down":
        return { state: "slow_down" };
      case "access_denied":
        throw new SieveDeviceLoginError("access_denied", "the login was denied in the browser");
      case "expired_token":
        throw new SieveDeviceLoginError("expired_token", "the device code expired before approval");
      default:
        throw new SieveDeviceLoginError(
          "http",
          `token poll failed with HTTP 400${code ? ` (${code})` : ""}`,
          { status: 400, detail: response.text.slice(0, 300) },
        );
    }
  }
  if (response.status === 429 || response.status >= 500) {
    // Nobody created a key on these; safe to keep polling.
    return { state: "transient", message: `HTTP ${response.status}` };
  }
  throw new SieveDeviceLoginError("http", `token poll failed with HTTP ${response.status}`, {
    status: response.status,
    detail: response.text.slice(0, 300),
  });
}

/**
 * Steps 1–3 in one call: request a code, hand it to `onDeviceCode`, then poll
 * every `interval` seconds (plus 5s on every slow_down) until approval, denial,
 * expiry. On expiry it restarts from step 1, up to `maxRestarts` times,
 * because the procedure for an expired code is literally "start over".
 */
export async function runDeviceLogin(options: DeviceLoginOptions): Promise<DeviceLoginResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const now = options.now ?? (() => Date.now());
  const maxRestarts = options.maxRestarts ?? 2;

  for (let restart = 0; ; restart += 1) {
    try {
      return await loginOnce({
        ...options,
        fetchImpl,
        sleep,
        now,
      });
    } catch (error) {
      const expired =
        error instanceof SieveDeviceLoginError && error.code === "expired_token";
      if (!expired || restart >= maxRestarts) throw error;
      await sleep(1_000);
    }
  }
}

async function loginOnce(options: DeviceLoginOptions & {
  fetchImpl: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
}): Promise<DeviceLoginResult> {
  const code = await requestDeviceCode({
    baseUrl: options.baseUrl,
    clientName: options.clientName,
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
  });
  await options.onDeviceCode?.(code);

  let interval = code.interval;
  let attempt = 0;
  const deadline = options.now() + code.expires_in * 1000;

  for (;;) {
    if (options.now() >= deadline) {
      throw new SieveDeviceLoginError("expired_token", "the device code expired before approval");
    }
    await options.sleep(interval * 1000);
    attempt += 1;
    const outcome = await pollDeviceTokenOnce({
      baseUrl: options.baseUrl,
      deviceCode: code.device_code,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
    });
    switch (outcome.state) {
      case "approved":
        return { apiKey: outcome.api_key, keyName: outcome.key_name };
      case "slow_down":
        interval += 5;
        break;
      case "transient":
        break;
      case "pending":
        await options.onPending?.(attempt);
        break;
      default:
        break;
    }
  }
}
