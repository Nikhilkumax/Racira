import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/voice?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/voice\/tools\/[^"]+)"/g)].map(m => m[1]);

    console.log(`[Verification] Voice index (cb=${cb}) returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} tool links. First 3:`, matches.slice(0, 3));
    
    // Check unbuilt tool (should render ComingSoon since nothing is truly built)
    http.get(`http://localhost:3002/voice/tools/text-to-speech-generator?cb=${cb}`, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`[Verification] Tool page text-to-speech-generator returned status ${res2.statusCode}`);
        const fallbackMatch = data2.match(/href="(\/voice)"/g);
        console.log(`[Verification] Fallback link present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
      });
    });
  });
});
