async function run() {
  const url = 'http://localhost:3002/cad/tools/2d-cad-sketch-tool';
  try {
    const res = await fetch(url);
    const text = await res.text();
    const regex = /href="([^"]+)"[^>]*>Explore Tools<\/a>/i;
    const match = text.match(regex);
    if (match) {
      console.log(`[VERIFIED] ${url} -> CTA Href: "${match[1]}"`);
    } else {
      console.log(`[FAILED] ${url} -> CTA not found`);
    }
  } catch(e) {
    console.error(`[ERROR] ${url} -> ${e.message}`);
  }
}
run();
