import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/design?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/design\/tool\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Design index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    http.get(`http://localhost:3002/design/tool/grid-system-builder?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page grid-system-builder returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/design)"/);
        console.log(`[Verification] Fallback link (All tools) present:`, !!fallbackMatch);
      });
    });
  });
});
