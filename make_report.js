const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      fileList = walk(path.join(dir, file), fileList);
    } else if (file === 'page.tsx') {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const pages = walk('src/app');
let withClass = [];
let gapPages = [];

for (const page of pages) {
  const content = fs.readFileSync(page, 'utf8');
  if (content.includes('racira-page-container')) {
    withClass.push(page);
  } else {
    gapPages.push(page);
  }
}

console.log('Total pages:', pages.length);
console.log('Pages with class:', withClass.length);
console.log('Gap pages:', gapPages.length);
console.log('\n--- GAP PAGES ---');

for (const page of gapPages) {
  const content = fs.readFileSync(page, 'utf8');
  const match = content.match(/className=["']([^"']+)["']/);
  const firstClass = match ? match[1] : 'None or complex';
  const isTopLevel = page.match(/src[\\\/]app[\\\/][^\\\/]+[\\\/]page\.tsx$/) || page.match(/src[\\\/]app[\\\/]\([^)]+\)[\\\/]page\.tsx$/);
  const level = isTopLevel ? 'Top-level' : 'Leaf/Sub-page';
  console.log(`${page.replace(/\\/g, '/')} | Level: ${level} | First class: ${firstClass}`);
}
