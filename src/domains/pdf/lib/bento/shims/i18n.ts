/**
 * Stub for BentoPDF's i18n module.
 * In the original, this called i18next for translated strings.
 * In Racira, this returns the raw key as a passthrough.
 * TODO: Wire to Racira's i18n in the adapter phase.
 */

/** @deprecated — Returns the key as-is. Replace with explicit strings in the adapter phase. */
export function t(key: string, _params?: Record<string, string | number>): string {
  return key;
}

/** @deprecated — No-op stub. */
export function initI18n(): void {
  // no-op
}
