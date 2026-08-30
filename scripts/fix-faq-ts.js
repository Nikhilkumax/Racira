const fs = require('fs');

function fixFaqStructure(content) {
  // Pattern: content: [\n      { subHeading: "...", content: [\n
  // Should be: subHeading: "...", content: [\n
  // We need to find lines like "      { subHeading: "..." and extract the subHeading
  // to the parent section level

  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line has a subHeading inside a content array item
    if (line.includes('subHeading:') && line.includes('content: [')) {
      // Extract the subHeading value
      const subMatch = line.match(/subHeading:\s*"([^"]+)"/);
      if (subMatch) {
        const subHeading = subMatch[1];

        // Find the parent section that contains this content array
        // Look backwards for the heading line
        let parentIdx = result.length - 1;
        while (parentIdx >= 0) {
          const parentLine = result[parentIdx];
          if (parentLine.includes('{ heading:') && parentLine.includes('content: [')) {
            // This is the parent section. We need to add subHeading to it
            // and remove the subHeading from the content item
            const fixedParent = parentLine.replace(
              /heading:\s*"([^"]*)",\s*content: \[/,
              'heading: "$1", subHeading: "' + subHeading + '", content: ['
            );
            result[parentIdx] = fixedParent;

            // Fix the current line - remove subHeading
            const fixedLine = line.replace(/\s*\{\s*subHeading:\s*"[^"]*",\s*/, '      { ');
            result.push(fixedLine);
            break;
          }
          parentIdx--;
        }
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
    i++;
  }

  return result.join('\n');
}

// Fix all three files
const files = [
  'scratch/seo-organize-batch-v2.ts',
  'scratch/seo-convert-from-pdf-batch.ts',
  'scratch/seo-convert-from-pdf-template.ts',
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const fixed = fixFaqStructure(content);
  const beforeCount = (content.match(/subHeading.*content:/g) || []).length;
  const afterCount = (fixed.match(/subHeading.*content:/g) || []).length;
  fs.writeFileSync(f, fixed, 'utf8');
  console.log(f + ': ' + beforeCount + ' -> ' + afterCount + ' wrong patterns');
});
