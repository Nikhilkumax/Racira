const http = require('http');

http.get('http://localhost:3002/writing', res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const comingSoon = [...b.matchAll(/Coming Soon/g)].length;
    const toolCards = [...b.matchAll(/tool-card/g)].length;
    // Extract titles using a robust regex for the Next.js HTML structure
    // They are usually in h3 or similar with font-semibold
    const titleRegex = /<h3[^>]*class="[^"]*font-semibold[^"]*"[^>]*>(.*?)<\/h3>/g;
    let match;
    const titles = [];
    while ((match = titleRegex.exec(b)) !== null && titles.length < 8) {
      titles.push(match[1].trim());
    }

    console.log('HTTP status:', res.statusCode);
    console.log('Coming Soon badges found:', comingSoon);
    console.log('tool-card instances found (approx tool count):', toolCards);
    console.log('First 8 tool titles:', titles);
  });
}).on('error', e => console.log('ERR', e.message));
