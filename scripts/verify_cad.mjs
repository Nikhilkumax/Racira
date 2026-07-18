import http from 'http';

http.get('http://localhost:3002/cad', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/cad\/tools\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] CAD index returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} ToolCard links. First 3:`, matches.slice(0, 3));
    
    http.get('http://localhost:3002/cad/tools/2d-cad-sketch-tool', (res2) => {
      console.log(`[Verification] Tool page 2d-cad-sketch-tool returned status ${res2.statusCode}`);
    });
  });
});
