import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/education/tool/curriculum-builder?cb=${cb}`, (res2) => {
  let data2 = '';
  res2.on('data', chunk => data2 += chunk);
  res2.on('end', () => {
    console.log(`[Verification] Tool page curriculum-builder returned status ${res2.statusCode}`);
    const fallbackMatch = data2.match(/href="(\/education)"/g);
    console.log(`[Verification] Fallback link present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
  });
});
