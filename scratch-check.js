const fs = require('fs');
const files = ['BonusCalculator.tsx', 'BudgetRuleCalculator.tsx', 'BonusPercentageCalculator.tsx', 'CreditCardMinimumPaymentCalculator.tsx'];
files.forEach(f => {
  const content = fs.readFileSync('src/domains/calculator/components/' + f, 'utf8');
  const size = content.length;
  const hasRecharts = /from [\'\"]recharts[\'\"]/.test(content);
  const hasAdv = /Advanced Options/i.test(content);
  const hasSections = /<section/.test(content);
  const hasH10Button = /h-10/.test(content);
  const hasDivWrapper = /<section[^>]*>(\s*<div[^>]*>)/i.test(content);
  console.log(f + ': size=' + size + ' recharts=' + hasRecharts + ' adv=' + hasAdv + ' sections=' + hasSections + ' h10=' + hasH10Button + ' divWrapper=' + hasDivWrapper);
});
