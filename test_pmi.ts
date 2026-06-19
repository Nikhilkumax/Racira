import { calculatePmiRemoval } from './src/calculators/pmiRemovalLogic';

const runTests = () => {
  const inputs1: any = {
    homeValue: 400000,
    loanAmount: 320000,
    interestRate: 6.5,
    loanTermYears: 30,
    loanType: "conventional",
    startMonth: "Jan",
    startYear: 2024,
    appreciationRate: 0,
    extraMonthly: 0,
    creditScore: 740,
    propertyUse: "primary",
    pmiMode: "manual",
    manualPmiRate: (145 * 12) / 320000 * 100, 
    seasoningMonths: 24
  };

  const res1 = calculatePmiRemoval(inputs1);

  console.log("=== SCENARIO 1: $320k Loan (80% LTV) ===");
  console.log("Monthly PMI:", res1.monthlyPmi?.toFixed(2));
  console.log("LTV at month 1:", res1.ltvCurve?.[0]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 12:", res1.ltvCurve?.[11]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 60:", res1.ltvCurve?.[59]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 120:", res1.ltvCurve?.[119]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 122:", res1.ltvCurve?.[121]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 180:", res1.ltvCurve?.[179]?.ltvOriginal?.toFixed(4));
  console.log("LTV at month 360:", res1.ltvCurve?.[359]?.ltvOriginal?.toFixed(4));

  console.log("Requested (80%):", res1.borrowerRequested80?.months, res1.borrowerRequested80?.dateLabel);
  console.log("Automatic (78%):", res1.autoTermination78?.months, res1.autoTermination78?.dateLabel);
  console.log("Midpoint:", res1.midpoint?.months, res1.midpoint?.dateLabel);
  console.log("Earliest Date:", res1.earliest?.dateLabel, "Basis:", res1.earliest?.basis);

  // Scenario 2: With Appreciation
  const inputs2 = {
    ...inputs1,
    appreciationRate: 0, 
    currentValueOverride: 440000 // 10% appreciation on 400k
  };

  const res2 = calculatePmiRemoval(inputs2);
  console.log("\n=== SCENARIO 2: APPRECIATION to $440k ===");
  console.log("Requested Appreciated:", res2.borrowerRequested80?.months, res2.borrowerRequested80?.dateLabel);
}

runTests();
