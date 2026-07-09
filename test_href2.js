async function run() {
  const urls = ['http://localhost:3002/travel', 'http://localhost:3002/engineering', 'http://localhost:3002/education'];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const idx = text.indexOf('Explore Tools');
      if (idx !== -1) {
        console.log(url, 'Context:', text.substring(idx - 60, idx + 20));
      } else {
        console.log(url, 'Explore Tools not found');
      }
    } catch(e) {
      console.error('Failed to fetch', url, e.message);
    }
  }
}
run();
