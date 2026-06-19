import { calculatePmiRemoval } from './src/calculators/pmiRemovalLogic';

const result = calculatePmiRemoval({
    homeValue: 400000,
    loanAmount: 380000,
    interestRate: 6.5,
    loanTermYears: 30,
    loanType: "conventional",
    startMonth: "Jan",
    startYear: 2024,
    appreciationRate: 3.0,
    extraMonthly: 150,
    pmiMode: "auto",
    manualPmiRate: 0,
    creditScore: 720,
    propertyUse: "primary",
    seasoningMonths: 24,
});

console.log("Borrower-Requested (80% Current Value):");
console.log(`Months: ${result.borrowerRequested80.months}`);
console.log(`Date Label: ${result.borrowerRequested80.dateLabel}`);
