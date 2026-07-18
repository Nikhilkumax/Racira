const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3002/productivity', { waitUntil: 'domcontentloaded' });
  
  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a.tool-card')).slice(0, 5).map(card => {
      const title = card.querySelector('h3')?.innerText || '';
      const desc = card.querySelector('p')?.innerText || '';
      const badge = card.querySelector('.absolute.top-0.right-0, .uppercase.tracking-widest')?.innerText || 'live';
      const icon = card.querySelector('svg')?.className.baseVal || '';
      
      return { title, desc, badge, icon };
    });
  });

  console.log(JSON.stringify(cards, null, 2));
  
  await browser.close();
})();
