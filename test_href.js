async function run() {
  const urls = ['http://localhost:3002/travel', 'http://localhost:3002/engineering', 'http://localhost:3002/education'];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const match = text.match(/Explore Tools<\/a>/i);
      if (match) {
        // find the closest href backwards
        const sub = text.substring(0, match.index);
        const hrefMatch = sub.match(/href="([^"]+)"[^>]*$/);
        console.log(url, '-> CTA Href:', hrefMatch ? hrefMatch[1] : 'NOT FOUND');
      } else {
        console.log(url, 'Explore Tools not found');
      }
    } catch(e) {
      console.error('Failed to fetch', url, e.message);
    }
  }
}
run();
