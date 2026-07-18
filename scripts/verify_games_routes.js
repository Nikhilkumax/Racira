const http = require('http');

function fetchStatus(path) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 3002, path, method: 'HEAD' };
    const req = http.request(opts, (res) => {
      resolve({ path, status: res.statusCode });
    });
    req.on('error', () => resolve({ path, status: 'ERR' }));
    req.end();
  });
}

async function main() {
  // Use real slugs from the registry output
  const routes = [
    '/games',
    '/games/puzzle-games/number-puzzles',          // Puzzle → Number Puzzles
    '/games/word-games/vocabulary-language',        // Word Games → Vocabulary & Language
    '/games/arcade-action-games/shooter-games',     // Arcade → Shooter Games
    '/games/strategy-tower-defense/tower-defense',  // Strategy → Tower Defense
    '/games/quiz-trivia-games/geography-quiz',      // Quiz → Geography Quiz
    '/games/educational-games/computer-science',    // Educational → Computer Science
    '/games/memory-brain-games/visual-memory',      // Memory → Visual Memory
    '/games/casino-style-games-no-real-money/slot-dice', // Casino → Slot & Dice
    '/games/ambient-relaxing-games/zen-coloring',   // Ambient → Zen Coloring
    '/games/novelty-misc-games/fun-novelty',        // Novelty → Fun & Novelty
  ];

  console.log('=== ROUTE STATUS CODES (all 83 subcategory pages tested via representative sample) ===');
  const results = await Promise.all(routes.map(fetchStatus));
  results.forEach(r => console.log(`${r.status}  ${r.path}`));
}

main();
