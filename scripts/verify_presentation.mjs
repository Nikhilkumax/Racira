import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/presentation?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/presentation\/tools\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Presentation index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    // Check unbuilt tool (slide-deck-builder)
    http.get(`http://localhost:3002/presentation/tools/slide-deck-builder?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page slide-deck-builder returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/presentation)"/g);
        console.log(`[Verification] Fallback link (unbuilt) present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
      });
    });
  });
});
