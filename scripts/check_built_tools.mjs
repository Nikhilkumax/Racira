import http from 'http';

const domains = [
  { name: 'audio', route: 'tools', slug: 'mp3-converter' }, // audio's built tool
  { name: 'games', route: 'tools', slug: 'tic-tac-toe' },
  { name: 'cad', route: 'tool', slug: 'dxf-viewer' },
  { name: '3d', route: 'tool', slug: '3d-model-viewer-gltf-obj-stl' },
  { name: 'animator', route: 'tools', slug: 'css-keyframe-generator' },
  { name: 'colors', route: 'tools', slug: 'color-json-generator' }, // color-format-converter is also live
  { name: 'crypto', route: 'tools', slug: 'sha256-hash' },
  { name: 'design', route: 'tools', slug: 'pixel-to-rem' },
  { name: 'education', route: 'tools', slug: 'flashcard-maker' },
  { name: 'engineering', route: 'tools', slug: 'unit-converter' },
  { name: 'insight', route: 'tools', slug: 'swot-analysis' },
  { name: 'music', route: 'tools', slug: 'bpm-counter' },
  { name: 'photo', route: 'tools', slug: 'image-resizer' },
  { name: 'security', route: 'tool', slug: 'password-generator' },
  { name: 'seo', route: 'tools', slug: 'keyword-density-checker' },
  { name: 'travel', route: 'tool', slug: 'trip-itinerary-builder' },
  { name: 'typography', route: 'tools', slug: 'font-previewer' },
];

async function checkDomain(d) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3002/${d.name}/${d.route}/${d.slug}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for common ComingSoon text patterns
        const isComingSoon = data.toLowerCase().includes('coming soon') || data.toLowerCase().includes('polishing this');
        console.log(`[${d.name}] Built tool (${d.slug}) isComingSoon? ${isComingSoon}`);
        resolve();
      });
    }).on('error', (e) => {
      console.log(`[${d.name}] Error fetching: ${e.message}`);
      resolve();
    });
  });
}

async function run() {
  for (const d of domains) {
    await checkDomain(d);
  }
}
run();
