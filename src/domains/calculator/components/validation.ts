/**
 * PMI-style inline validation for calculator inputs — shared helper.
 *
 * Golden standard: PmiCalculator.tsx — every invalid field shows inline error
 * text under the input (`text-[11px] text-red-500 font-medium mt-1`), the
 * Calculate button is disabled while `hasValidationErrors` is true, and a
 * summary warning box replaces silent failure. This module centralizes the
 * rule evaluation so each calculator only declares its field rules.
 *
 * Usage in a component:
 *
 *   import { buildValErrors, hasErrors } from "./validation";
 *
 *   const valErrors = buildValErrors({
 *     loanAmount: [parseFloat(loanAmount) > 0, "Loan Amount must be > 0"],
 *     interestRate: [rate >= 0.1 && rate <= 99, "Interest Rate must be between 0.1% and 99%"],
 *   });
 *   const hasValidationErrors = hasErrors(valErrors);
 *
 *   // under an input:
 *   {valErrors.loanAmount && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.loanAmount}</p>}
 *
 *   // on the button:
 *   <button disabled={hasValidationErrors} ...>Calculate</button>
 *
 *   // summary box above the button row (PMI pattern):
 *   {hasValidationErrors && (
 *     <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
 *       ⚠️ Please fix the errors above before calculating.
 *     </div>
 *   )}
 */
export type ValErrors = Record<string, string>;

/** One rule: `[isValidNow, messageWhenInvalid]`. */
export type ValRule = [boolean, string];

/**
 * Evaluate field rules into a PMI-compatible error map.
 * Keys are field names; values are the user-facing error strings.
 * Only the FIRST failing rule per key is reported (PMI behavior).
 */
export function buildValErrors(rules: Record<string, ValRule | ValRule[]>): ValErrors {
  const errors: ValErrors = {};
  for (const [key, ruleOrList] of Object.entries(rules)) {
    const list: ValRule[] =
      ruleOrList.length > 0 && Array.isArray(ruleOrList[0])
        ? (ruleOrList as ValRule[])
        : [ruleOrList as ValRule];
    for (const [valid, message] of list) {
      if (!valid) {
        errors[key] = message;
        break; // first failing rule per field wins
      }
    }
  }
  return errors;
}

/** True when at least one field failed (gates the Calculate button). */
export function hasErrors(errors: ValErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Standard PMI-style classes for inline error text under an input. */
export const VAL_ERROR_CLASS = "text-[11px] text-red-500 font-medium mt-1";

/** Standard PMI-style summary box above the button row. */
export const VAL_SUMMARY_CLASS =
  "text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md";

/**
 * Numeric field rules — the most common validators, matching PMI's checks.
 * All take parsed numbers (NaN-safe: use `parseNum` first).
 */
export const parseNum = (v: string | number | undefined | null): number => {
  const n = typeof v === "number" ? v : parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

export const rules = {
  /** `> 0` required (amounts, balances). */
  positive: (n: number, label: string): ValRule => [n > 0, `${label} is required and must be > 0`],
  /** `>= 0` (rates that may be zero, extra payments). */
  nonNegative: (n: number, label: string): ValRule => [n >= 0, `${label} must be ≥ 0`],
  /** Inclusive range check. */
  range: (n: number, min: number, max: number, label: string, unit = ""): ValRule => [
    n >= min && n <= max,
    `${label} must be between ${min}${unit} and ${max}${unit}`,
  ],
};
