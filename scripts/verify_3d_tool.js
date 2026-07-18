const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = 'http://localhost:3002/3d/tool/3d-model-viewer-gltf-obj-stl?cb=' + Date.now();
  const toolRes = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const toolBody = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('3D live tool HTTP status:', toolRes.status());
  console.log('3D live tool body preview:\n' + toolBody);

  await browser.close();
})();
