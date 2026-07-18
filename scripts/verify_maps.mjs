import http from 'http';

http.get('http://localhost:3002/maps', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/maps\/tool\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Maps index returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    http.get('http://localhost:3002/maps/tool/interactive-map-viewer', (res2) => {
      console.log(`[Verification] Tool page interactive-map-viewer returned status ${res2.statusCode}`);
    });
  });
});
