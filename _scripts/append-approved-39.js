// Append the 39 wired calculators to _approved.json (owner-directed go-live).
const fs = require("fs");

const FILE = "src/domains/calculator/components/_approved.json";
const names = [
  "AutoLoanAffordabilityCalculator",
  "BalloonLoanPaymentCalculator",
  "BoatLoanPaymentCalculator",
  "ConsolidationLoanRateCalculator",
  "ConstructionLoanInterestCalculator",
  "DentalLoanCalculator",
  "FarmLoanPaymentCalculator",
  "FhaLoanLimitCalculator",
  "GraduatedPaymentMortgageCalculator",
  "GreenEnergyLoanCalculator",
  "InterestOnlyLoanPaymentCalculator",
  "LoanAmortizationScheduleCalculator",
  "LoanPrepaymentPenaltyCalculator",
  "LoanRestructuringSavingsCalculator",
  "MicrofinanceLoanCalculator",
  "MortgageAffordabilityByIncomeCalculator",
  "MortgageClosingCostEstimator",
  "MortgageInsurancePremiumCalculator",
  "MortgageRefinanceBreakEvenCalculator",
  "MortgageRefinanceSavingsCalculator",
  "MortgageStressTestCalculator",
  "MotorcycleLoanPaymentCalculator",
  "ParentPlusLoanRepaymentCalculator",
  "PaydayLoanCostCalculator",
  "PeerToPeerLoanCalculator",
  "PersonalLoanEmiCalculator",
  "PersonalLoanMonthlyPaymentCalculator",
  "PiggybackLoanCalculator",
  "Sba504LoanPaymentCalculator",
  "SbaLoanCalculator",
  "StepUpLoanPaymentCalculator",
  "StudentLoanRefinanceSavingsCalculator",
  "StudentLoanTotalInterestCalculator",
  "TeaserRateMortgageCalculator",
  "UsdaLoanPaymentCalculator",
  "VacationLoanCalculator",
  "VariableRateLoanPaymentCalculator",
  "WeddingLoanCostCalculator",
  "WorkingCapitalLoanCalculator",
];

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw.replace(/^\uFEFF/, ""));
const existing = new Set(data.approved.map((s) => s.replace(/\.tsx$/, "")));
const toAdd = names.filter((n) => !existing.has(n));
if (toAdd.length !== names.length) {
  console.log("Skipping " + (names.length - toAdd.length) + " already-present entries");
}
data.approved.push(...toAdd.sort((a, b) => a.localeCompare(b)));

const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const out = JSON.stringify(data, null, 2).replace(/\n/g, eol) + eol;
fs.writeFileSync(FILE, out, "utf8");
console.log("_approved.json: appended " + toAdd.length + " (total " + data.approved.length + ")");
