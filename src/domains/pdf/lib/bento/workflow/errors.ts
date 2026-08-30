/**
 * Stub for BentoPDF's workflow errors module.
 * In the original, this called i18n t() for workflow error messages.
 * In Racira, this returns the raw error key as a passthrough.
 * TODO: Wire to Racira's i18n in the adapter phase.
 */
export function wfError(
  key: string,
  _params?: Record<string, string | number>,
): string {
  return key;
}
