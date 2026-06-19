// ─── PMI Rate Matrix (Conventional Only) ────────────────────────────────────
// Rows = LTV band, Cols = credit score tier index [<680, 680-719, 720-759, 760+]
// Rates are annual % for 30-year loans. Multiply by 0.65 for 15-year loans.

export interface CreditTierInfo {
  label: string;
  tierIndex: number;
}

export function getCreditTierInfo(score: number): CreditTierInfo {
  if (score >= 760) return { label: "Excellent: 760+", tierIndex: 4 };
  if (score >= 720) return { label: "Good: 720–759", tierIndex: 3 };
  if (score >= 680) return { label: "Fair-Good: 680–719", tierIndex: 2 };
  if (score >= 640) return { label: "Fair: 640–679", tierIndex: 1 };
  if (score >= 620) return { label: "Poor: 620–639", tierIndex: 0 };
  return { label: "Unavailable: <620", tierIndex: -1 };
}

// LTV bands: [80-85], (85-90], (90-95], (95-97]
// Tiers:       620-639  640-679  680-719  720-759  760+
const CONV_PMI_MATRIX: number[][] = [
  [0.32, 0.28, 0.23, 0.20, 0.19], // 80–85% LTV
  [0.49, 0.40, 0.33, 0.28, 0.26], // 85–90% LTV
  [0.80, 0.65, 0.55, 0.48, 0.41], // 90–95% LTV
  [1.15, 0.95, 0.80, 0.70, 0.60], // 95–97% LTV
];

const FIFTEEN_YR_FACTOR = 0.65;

function getLtvBandIndex(ltv: number): number {
  if (ltv <= 85) return 0;
  if (ltv <= 90) return 1;
  if (ltv <= 95) return 2;
  return 3;
}

export function getConventionalPmiRate(
  ltv: number,
  creditScore: number,
  propertyUse: string
): { rate: number; tierLabel: string } {
  const { label, tierIndex } = getCreditTierInfo(creditScore);
  if (tierIndex < 0) {
    return { rate: 0, tierLabel: label };
  }
  const bandIdx = getLtvBandIndex(ltv);
  let rate = CONV_PMI_MATRIX[bandIdx][tierIndex];
  if (propertyUse === "investment") rate += 0.40;
  else if (propertyUse === "second") rate += 0.15;
  return { rate: parseFloat(rate.toFixed(2)), tierLabel: label };
}

// ─── FHA MIP Constants ───────────────────────────────────────────────────────
// Annual MIP rates for loans with term > 15 years
export function getFhaAnnualMipRate(ltv: number): number {
  if (ltv <= 90) return 0.50;
  if (ltv <= 95) return 0.50;
  return 0.55;
}

// FHA upfront MIP as a fraction of base loan amount
export const FHA_UPFRONT_MIP_RATE = 0.0175;
