import { readFileSync, writeFileSync } from "fs";

function fixFaqStructure(filePath: string): number {
  const raw = readFileSync(filePath, "utf-8");
  let result = raw;
  let fixCount = 0;

  while (true) {
    const faqPattern = /\{ heading: "Frequently Asked Questions", content: \[/;
    const match = result.match(faqPattern);
    if (!match) break;

    const matchStart = result.indexOf(match[0]);
    const afterMatch = result.slice(matchStart + match[0].length);

    let depth = 1;
    let pos = 0;
    while (pos < afterMatch.length && depth > 0) {
      const ch = afterMatch[pos];
      if (ch === "[" || ch === "{") depth++;
      if (ch === "]" || ch === "}") depth--;
      if (depth === 0) break;
      pos++;
    }

    const contentArray = afterMatch.slice(0, pos);
    const itemPattern = /\{ subHeading: "((?:[^"\\]|\\.)*)", content: \[/g;
    let itemMatch;
    const itemStarts: number[] = [];
    while ((itemMatch = itemPattern.exec(contentArray)) !== null) {
      itemStarts.push(itemMatch.index);
    }
    if (itemStarts.length === 0) break;

    const items: { subHeading: string; contentStr: string }[] = [];
    for (let idx = 0; idx < itemStarts.length; idx++) {
      const start = itemStarts[idx];
      const end = idx + 1 < itemStarts.length ? itemStarts[idx + 1] : contentArray.length;
      const itemStr = contentArray.slice(start, end);
      const subMatch = itemStr.match(/subHeading: "((?:[^"\\]|\\.)*)"/);
      if (!subMatch) continue;
      const contentStart = itemStr.indexOf("content: [") + "content: [".length;
      let cDepth = 1;
      let cPos = contentStart;
      while (cPos < itemStr.length && cDepth > 0) {
        if (itemStr[cPos] === "[" || itemStr[cPos] === "{") cDepth++;
        if (itemStr[cPos] === "]" || itemStr[cPos] === "}") cDepth--;
        cPos++;
      }
      const contentBody = itemStr.slice(contentStart, cPos - 1).trim();
      items.push({ subHeading: subMatch[1], contentStr: contentBody });
    }
    if (items.length === 0) break;

    const replacement = items.map((item, idx) => {
      const heading = idx === 0 ? '"Frequently Asked Questions"' : '""';
      return `    { heading: ${heading}, subHeading: "${item.subHeading}", content: [\n      ${item.contentStr}\n    ]}`;
    }).join(",\n");

    const oldEnd = matchStart + match[0].length + pos + 1;
    let closePos = oldEnd;
    while (closePos < result.length && result[closePos] !== "}") closePos++;
    closePos++;
    result = result.slice(0, matchStart) + replacement + result.slice(closePos);
    fixCount++;
  }

  writeFileSync(filePath, result, "utf-8");
  return fixCount;
}

let total = 0;
total += fixFaqStructure("scratch/seo-convert-from-pdf-template.ts");
total += fixFaqStructure("scratch/seo-convert-from-pdf-batch.ts");
console.log(`Fixed ${total} FAQ sections across both files`);
