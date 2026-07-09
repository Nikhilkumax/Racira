async function run() {
  const urls = ['http://localhost:3002/travel', 'http://localhost:3002/engineering', 'http://localhost:3002/education'];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const regex = /href="([^"]+)"[^>]*>Explore Tools<\/a>/i;
      const match = text.match(regex);
      if (match) {
        console.log(`[VERIFIED] ${url} -> CTA Href: "${match[1]}"`);
      } else {
        console.log(`[FAILED] ${url} -> CTA not found`);
      }
    } catch(e) {
      console.error(`[ERROR] ${url} -> ${e.message}`);
    }
  }
}
run();
