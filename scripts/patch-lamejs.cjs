const fs = require("fs");
const path = require("path");

const lamejsDir = path.join(__dirname, "..", "node_modules", "lamejs");

if (!fs.existsSync(lamejsDir)) {
  console.log("[postinstall] lamejs not found, skipping patch");
  process.exit(0);
}

// 1. Patch package.json: change main to lame.all.js
const pkgPath = path.join(lamejsDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
if (pkg.main !== "lame.all.js") {
  pkg.main = "lame.all.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("[postinstall] Patched lamejs package.json main -> lame.all.js");
}

// 2. Patch lame.all.js: add module.exports = lamejs;
const lamePath = path.join(lamejsDir, "lame.all.js");
let content = fs.readFileSync(lamePath, "utf8");
if (!content.includes("module.exports = lamejs;")) {
  content += "\nmodule.exports = lamejs;\n";
  fs.writeFileSync(lamePath, content);
  console.log("[postinstall] Patched lame.all.js with module.exports");
}

// 3. Verify it works
try {
  const lamejs = require("lamejs");
  const enc = new lamejs.Mp3Encoder(1, 24000, 128);
  const int16 = new Int16Array(1152);
  enc.encodeBuffer(int16);
  console.log("[postinstall] lamejs MP3 encoder verified OK");
} catch (err) {
  console.error("[postinstall] lamejs verification failed:", err.message);
}
