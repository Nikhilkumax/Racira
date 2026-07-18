import http from 'http';

http.get('http://localhost:3002/games', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/href="(\/games\/game\/[^"]+)"/g)].map(m => m[1]);
    console.log(`[Verification] Games index returned status ${res.statusCode}`);
    console.log(`[Verification] Found ${matches.length} GameCard links. First 3:`, matches.slice(0, 3));
    
    http.get('http://localhost:3002/games/game/sudoku', (res2) => {
      console.log(`[Verification] Tool page sudoku returned status ${res2.statusCode}`);
    });
  });
});
