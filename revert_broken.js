const fs = require('fs');
const execSync = require('child_process').execSync;
let log = fs.readFileSync('tsc_errors.log');
log = Buffer.from(log).toString('utf16le');
const files = new Set();
const lines = log.split('\n');
lines.forEach(line => {
  if (line.includes('src/domains/calculator/components/')) {
     const match = line.match(/src\/domains\/calculator\/components\/([a-zA-Z0-9_]+\.tsx)/);
     if (match) files.add(match[1]);
  }
});
if (files.size > 0) {
  const fileArray = Array.from(files);
  console.log('Reverting', fileArray.length, 'files...');
  // chunk to avoid command line length limits
  const chunkSize = 20;
  for (let i = 0; i < fileArray.length; i += chunkSize) {
    const chunk = fileArray.slice(i, i + chunkSize);
    const cmd = 'git checkout ' + chunk.map(f => 'src/domains/calculator/components/' + f).join(' ');
    execSync(cmd);
  }
  console.log('Reverted successfully.');
}
