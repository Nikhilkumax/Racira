import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();

const checks = [];

// line-weight-manager: 0.7 → thin 0.35 (1:2); 0.35 → thin 0.18 (snap); three-policy 0.7 → medium 0.5
await page.goto('http://localhost:3002/cad/line-weight-manager', { waitUntil: 'networkidle' });
checks.push(['lwm thin@0.7 = 0.35', await page.getByTestId('res-thin').textContent(), /0\.35 mm/]);
await page.getByTestId('in-thick').selectOption('0.35');
checks.push(['lwm thin@0.35 = 0.18 (snapped)', await page.getByTestId('res-thin').textContent(), /0\.18 mm/]);
await page.getByTestId('in-thick').selectOption('0.7');
await page.getByTestId('in-policy').selectOption('three');
checks.push(['lwm medium@0.7 = 0.5 (√2 snap)', await page.getByTestId('res-medium').textContent(), /0\.5 mm/]);

// scale-bar-tool: 1:50 m 1 seg → 20 mm; 1:50 ft 5 seg → 30.48 mm / 25 ft
await page.goto('http://localhost:3002/cad/scale-bar-tool', { waitUntil: 'networkidle' });
checks.push(['scale 1:50 m 1 seg = 20mm', await page.getByTestId('res-seg').textContent(), /20 mm/]);
checks.push(['scale real = 5 m', await page.getByTestId('res-real').textContent(), /5 m/]);
await page.getByTestId('in-unit').selectOption('ft');
await page.getByTestId('in-seg').fill('5');
checks.push(['scale 1:50 ft 5 = 30.48mm', await page.getByTestId('res-seg').textContent(), /30\.48 mm/]);
checks.push(['scale real = 25 ft', await page.getByTestId('res-real').textContent(), /25 ft/]);

// waterjet: 5mm steel → 202; alu 10 premium → 105; alu 10 240g standard → 164; fast 340 → 294
await page.goto('http://localhost:3002/cad/waterjet-cutting-reference', { waitUntil: 'networkidle' });
checks.push(['wj 10mm steel = 120', await page.getByTestId('res-speed').textContent(), /120 mm\/min/]);
await page.getByTestId('in-thick').fill('5');
checks.push(['wj 5mm steel = 202', await page.getByTestId('res-speed').textContent(), /202 mm\/min/]);
await page.getByTestId('in-thick').fill('10');
await page.getByTestId('in-material').selectOption('Aluminium');
checks.push(['wj alu 10 = 210', await page.getByTestId('res-speed').textContent(), /210 mm\/min/]);
await page.getByTestId('in-quality').selectOption('premium');
checks.push(['wj alu premium = 105', await page.getByTestId('res-speed').textContent(), /105 mm\/min/]);
await page.getByTestId('in-quality').selectOption('standard');
await page.getByTestId('in-abrasive').selectOption('240 g/min');
checks.push(['wj alu 240g = 164', await page.getByTestId('res-speed').textContent(), /164 mm\/min/]);
await page.getByTestId('in-abrasive').selectOption('340 g/min');
await page.getByTestId('in-quality').selectOption('fast');
checks.push(['wj alu fast 340 = 294', await page.getByTestId('res-speed').textContent(), /294 mm\/min/]);

// chip-load: 600/8000/2 Ø6 alu → 0.0375, MRR 10800
await page.goto('http://localhost:3002/cad/chip-load-calculator', { waitUntil: 'networkidle' });
checks.push(['chip fz = 0.0375', await page.getByTestId('res-fz').textContent(), /0\.0375 mm\/tooth/]);
checks.push(['chip mrr = 10800', await page.getByTestId('res-mrr').textContent(), /10800 mm³\/min/]);
checks.push(['chip status below', await page.getByTestId('res-check').textContent(), /Below range/]);

let fails = 0;
for (const [name, actual, re] of checks) {
  const ok = re.test(actual);
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} — got "${actual}"`);
}
await browser.close();
console.log(fails === 0 ? 'ALL LIVE CHECKS PASS' : `${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);