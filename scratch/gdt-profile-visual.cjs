const { chromium } = require("@playwright/test");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3002/cad/gdt/profile-surface", { waitUntil: "networkidle" });

  const figs = page.locator("figure");
  const n = await figs.count();
  fs.mkdirSync("scratch/profile-visual", { recursive: true });
  for (let i = 0; i < n; i++) {
    await figs.nth(i).screenshot({ path: `scratch/profile-visual/fig-${i}.png` });
  }

  const analysis = await page.evaluate(async () => {
    const svg = [...document.querySelectorAll("figure svg")].find((s) =>
      s.getAttribute("aria-label")?.startsWith("Profile of a surface")
    );
    // Clone and bake computed styles into inline attributes so the standalone
    // rasterization keeps the page's colors (classes don't serialize).
    const clone = svg.cloneNode(true);
    const srcEls = svg.querySelectorAll("*");
    const dstEls = clone.querySelectorAll("*");
    srcEls.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const dst = dstEls[i];
      if (cs.stroke && cs.stroke !== "none") {
        dst.setAttribute("stroke", cs.stroke);
        dst.setAttribute("stroke-width", cs.strokeWidth);
        if (cs.strokeDasharray && cs.strokeDasharray !== "none") dst.setAttribute("stroke-dasharray", cs.strokeDasharray);
        if (cs.strokeLinecap && cs.strokeLinecap !== "butt") dst.setAttribute("stroke-linecap", cs.strokeLinecap);
      }
      if (cs.fill && cs.fill !== "none") dst.setAttribute("fill", cs.fill);
      dst.removeAttribute("class");
    });
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = 440 * scale; canvas.height = 300 * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const isBlue = (r, g, b) => b > 140 && b - r > 40 && g > 80 && g < 200;
    const isInk = (r, g, b) => r < 110 && g < 110 && b < 130;
    const band = (y0, y1, test) => {
      let count = 0, minX = 1e9, maxX = -1;
      for (let y = y0; y < y1; y++) for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (test(data[i], data[i + 1], data[i + 2])) { count++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
      }
      return { count, spread: maxX > minX ? +((maxX - minX) / canvas.width).toFixed(2) : 0 };
    };
    const H = canvas.height;
    // Vertical profile of blue pixels per row — expect two distinct bands.
    const blueRows = [];
    for (let y = 0; y < H; y++) {
      let c = 0;
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (isBlue(data[i], data[i + 1], data[i + 2])) c++;
      }
      blueRows.push(c);
    }
    const bands = [];
    let start = -1;
    for (let y = 0; y < H; y++) {
      const on = blueRows[y] > 5;
      if (on && start < 0) start = y;
      if (!on && start >= 0) { bands.push([start, y - 1]); start = -1; }
    }
    if (start >= 0) bands.push([start, H - 1]);
    return {
      topEnvelope: band(Math.round(H * 0.10), Math.round(H * 0.42), isBlue),
      bottomEnvelope: band(Math.round(H * 0.60), Math.round(H * 0.92), isBlue),
      meshBand: band(Math.round(H * 0.42), Math.round(H * 0.60), isInk),
      distinctBlueBands: bands.map(([a, b]) => [+(a / H).toFixed(2), +(b / H).toFixed(2)]),
      totalInk: band(0, H, isInk).count,
    };
  });

  await browser.close();
  console.log(JSON.stringify(analysis, null, 2));
})();
