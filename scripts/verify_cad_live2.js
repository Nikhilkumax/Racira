const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const toolRes = await page.goto('http://localhost:3002/cad/tools/2d-cad-sketch-tool?cb=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const toolBody = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('CAD live tool body preview:', toolBody);

  await browser.close();
})();
