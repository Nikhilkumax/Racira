const fs = require('fs');
const content = fs.readFileSync('c:/Racira/racira-nextjs/src/calculators/pmiLogic.ts', 'utf8');
const evalCode = content.replace(/export /g, '') + `
const inp = {
    homeValue: 400000,
    dpMode: 'percent',
    interestRate: 6.5,
    loanTerm: 5,
    creditScore: 720,
    loanType: 'conventional',
    propertyUse: 'primary',
    startMonth: 'Jun',
    startYear: '2026',
    paymentFreq: 'weekly',
    pmiMode: 'auto',
    manualPmiRate: 0,
    propertyTax: 3600,
    homeInsurance: 1200,
    hoaFee: 0,
    extraMonthly: 0,
    oneTimeExtra: 0,
    annualExtra: 0,
    fhaMipMode: 'auto',
    manualFhaMipRate: 0,
    vaFundingFeeRate: 2.15,
    appreciationRate: 0
};
console.log('5% down: ' + calculatePmi({...inp, dpPct: 5, dpAmt: 20000}).totalPmiCost);
console.log('10% down: ' + calculatePmi({...inp, dpPct: 10, dpAmt: 40000}).totalPmiCost);
console.log('15% down: ' + calculatePmi({...inp, dpPct: 15, dpAmt: 60000}).totalPmiCost);
console.log('20% down: ' + calculatePmi({...inp, dpPct: 20, dpAmt: 80000}).totalPmiCost);
`;
eval(evalCode);
