import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/engineering?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/engineering\/tool\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Engineering index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    http.get(`http://localhost:3002/engineering/tool/ohm-s-law-calculator?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page ohm-s-law-calculator returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/engineering)"/g);
        console.log(`[Verification] Fallback link present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
      });
    });
  });
});
