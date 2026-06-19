import { calculatePmiRemoval } from './src/calculators/pmiRemovalLogic';

const res = calculatePmiRemoval({
    homeValue: 400000,
    loanAmount: 380000,
    interestRate: 6.5,
    loanTermYears: 30,
    loanType: "conventional",
    startMonth: "Jan",
    startYear: 2024,
    appreciationRate: 10,
    extraMonthly: 0,
    creditScore: 740,
    propertyUse: "primary",
    pmiMode: "manual",
    manualPmiRate: 0.4578, 
    seasoningMonths: 24
});

console.log(JSON.stringify(res.ltvCurve.slice(0, 10), null, 2));
