/**
 * Minimal .env reader/updater.
 *
 * Next.js already loads .env.local for the app, so this is not a config
 * system: it exists only so the one-time device-login script (which runs
 * outside Next) can check whether SIEVE_API_KEY is already present and write
 * the freshly issued key without clobbering unrelated variables.
 *
 * Dependency-free and pure, so the update rules are unit-testable and the
 * script never needs its own copy of them.
 */

/** Reads NAME's value, or null. Handles quotes and a leading `export`. */
export function parseEnvValue(content: string, name: string): string | null {
  const line = findLine(content, name);
  if (line === null) return null;
  const raw = line.value.trim();
  if (raw === "") return null;
  if (
    (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) ||
    (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2)
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

interface EnvLine {
  index: number;
  value: string;
}

function linePattern(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*(?:export\\s+)?${escaped}\\s*=`);
}

function findLine(content: string, name: string): EnvLine | null {
  const pattern = linePattern(name);
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (pattern.test(line)) {
      return { index, value: line.replace(pattern, "") };
    }
  }
  return null;
}

/**
 * Sets NAME to value, replacing an existing assignment in place or appending
 * one. Every other line is preserved verbatim, including comments and blank
 * lines, and the file's existing newline style is kept.
 */
export function upsertEnvVar(content: string, name: string, value: string): string {
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const pattern = linePattern(name);
  const lines = content.split(/\r?\n/);
  const replacement = `${name}=${value}`;
  const existing = lines.findIndex((line) => pattern.test(line));

  let next: string[];
  if (existing >= 0) {
    next = [...lines];
    next[existing] = replacement;
  } else {
    next = [...lines];
    while (next.length > 0 && next[next.length - 1].trim() === "") next.pop();
    next.push(replacement);
  }
  return next.join(newline).replace(/\s*$/, newline);
}

/** Never print a key: keep a recognisable prefix and the last four characters. */
export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return "•".repeat(trimmed.length);
  const prefix = trimmed.startsWith("dc_sk_") ? "dc_sk_" : trimmed.slice(0, 4);
  return `${prefix}…${trimmed.slice(-4)}`;
}
