import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/photo?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/photo\/tool\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Photo index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    // Check built tool (histogram-editor)
    http.get(`http://localhost:3002/photo/tool/histogram-editor?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page histogram-editor returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/photo)"/g);
        console.log(`[Verification] Fallback link (built) present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
        
        // Check unbuilt tool (raw-file-viewer)
        http.get(`http://localhost:3002/photo/tool/raw-file-viewer?cb=${cb}`, (res3) => {
          let data3 = '';
          res3.on('data', chunk => data3 += chunk);
          res3.on('end', () => {
            console.log(`[Verification] Tool page raw-file-viewer returned status ${res3.statusCode}`);
            const fallbackMatch2 = data3.match(/href="(\/photo)"/g);
            console.log(`[Verification] Fallback link (unbuilt) present (occurrences):`, fallbackMatch2 ? fallbackMatch2.length : 0);
          });
        });
      });
    });
  });
});
