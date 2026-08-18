import fs from "fs";
import path from "path";

const APPROVED = "src/domains/calculator/components/_approved.json";

// args: --approve Name1 Name2 ... | --live slug1 slug2 ...
const args = process.argv.slice(2);
const approveIdx = args.indexOf("--approve");
const liveIdx = args.indexOf("--live");

if (approveIdx >= 0) {
  const names = args.slice(approveIdx + 1);
  const json = JSON.parse(fs.readFileSync(APPROVED, "utf8"));
  let added = 0;
  for (const n of names) {
    const clean = n.replace(/\.tsx$/i, "");
    if (!json.approved.includes(clean)) { json.approved.push(clean); added++; }
    if (!json.slugs.includes(clean)) { json.slugs.push(clean); }
  }
  fs.writeFileSync(APPROVED, JSON.stringify(json, null, 2) + "\n");
  console.log(`_approved.json: +${added} approved (${names.length} total)`);
}

if (liveIdx >= 0) {
  const slugs = args.slice(liveIdx + 1);
  const regDir = "src/domains/calculator/registry";
  let flipped = 0;
  for (const f of fs.readdirSync(regDir).filter((x) => x.endsWith(".ts"))) {
    const p = path.join(regDir, f);
    let content = fs.readFileSync(p, "utf8");
    let changed = false;
    for (const slug of slugs) {
      const before = content;
      content = content.replace(
        new RegExp(`(slug: "${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^}]*?status: ")soon(")`, "g"),
        "$1live$2"
      );
      if (content !== before) changed = true;
    }
    if (changed) {
      fs.writeFileSync(p, content);
      flipped++;
    }
  }
  console.log(`registry: ${flipped} file(s) updated to live`);
}
