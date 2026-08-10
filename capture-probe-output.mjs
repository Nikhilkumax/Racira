import fs from "fs";
const chunks = [];
const orig = console.log;
console.log = (...args) => { chunks.push(args.map(String).join(" ")); orig(...args); };
await import("./probe-espeak-ng.mjs");
fs.writeFileSync("probe-espeak-readable.txt", chunks.join("\n"), "utf8");
