import http from 'http';

const cb = Math.random().toString(36).substring(7);

http.get(`http://localhost:3002/engineering/tool/555-timer-calculator?cb=${cb}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`[Verification] Tool page 555-timer-calculator returned status ${res.statusCode}`);
    const fallbackMatch = data.match(/href="(\/engineering)"/g);
    console.log(`[Verification] Fallback link (href="/engineering") present (occurrences):`, fallbackMatch ? fallbackMatch.length : 0);
  });
});
