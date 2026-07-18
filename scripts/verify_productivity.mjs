import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/productivity?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/productivity\/tools\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Productivity index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    // Check built tool (deep-work-session-planner)
    http.get(`http://localhost:3002/productivity/tools/deep-work-session-planner?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page deep-work-session-planner (built) returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/productivity)"/g);
        console.log(`[Verification] Fallback link (built) present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
        
        // Check unbuilt tool (time-blocking-planner)
        http.get(`http://localhost:3002/productivity/tools/time-blocking-planner?cb=${cb}`, (res3) => {
          let data3 = '';
          res3.on('data', chunk => data3 += chunk);
          res3.on('end', () => {
            console.log(`[Verification] Tool page time-blocking-planner (unbuilt) returned status ${res3.statusCode}`);
            const fallbackMatch2 = data3.match(/href="(\/productivity)"/g);
            console.log(`[Verification] Fallback link (unbuilt) present (occurrences):`, fallbackMatch2 ? fallbackMatch2.length : 0);
          });
        });
      });
    });
  });
});
