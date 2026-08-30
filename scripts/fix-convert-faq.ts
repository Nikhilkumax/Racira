import { readFileSync, writeFileSync } from 'fs';

const file = 'src/domains/pdf/registry/tool-seo.ts';
let content = readFileSync(file, 'utf-8');

// Fix the wrong FAQ structure in seoPdfToText
// Wrong: { heading: "FAQ", content: [ { subHeading: "Q1", content: [...] }, ... ] }
// Right: { heading: "FAQ", subHeading: "Q1", content: [...] }, { heading: "", subHeading: "Q2", content: [...] }

// Replace the entire FAQ block for seoPdfToText
const wrongBlock = `    { heading: "Frequently Asked Questions", content: [
      { subHeading: "Does text extraction preserve formatting?", content: [
        { type: "paragraph", text: \`No. The output is plain text \\u2014 no bold, italics, fonts, colors, or layout. The text is extracted in reading order with page separators. For formatted output, consider the PDF to HTML or PDF to Word tools instead.\` },
      ]},
      { subHeading: "Will it extract text from scanned PDFs?", content: [
        { type: "paragraph", text: \`Not reliably. Scanned PDFs contain images of text, not actual text data. The tool reads the text content stream, which is empty for scanned pages. For scanned documents, use the OCR tool to recognize text first, then extract.\` },
      ]},
      { subHeading: "How are pages separated in the output?", content: [
        { type: "paragraph", text: \`Each page's text is preceded by a "--- Page N ---" header. This makes it easy to identify which text came from which page and to navigate the output in a text editor.\` },
      ]},
      { subHeading: "Can I extract text from specific pages only?", content: [
        { type: "paragraph", text: \`Not directly \\u2014 the tool extracts all pages. To get text from specific pages, first extract those pages using the Extract Pages tool, then run text extraction on the smaller document.\` },
      ]},
      { subHeading: "Why does some text appear out of order?", content: [
        { type: "paragraph", text: \`PDF text extraction follows the order items appear in the content stream, which may not match the visual reading order in complex layouts (multi-column pages, text boxes, overlays). For most single-column documents, the reading order is preserved correctly.\` },
      ]},
      { subHeading: "How large can the output file be?", content: [
        { type: "paragraph", text: \`The output size depends on the text content of the PDF. A 100-page text-heavy document might produce a 200-500KB text file. Scanned PDFs with no embedded text data produce nearly empty output files.\` },
      ]},
    ]},`;

const rightBlock = `    { heading: "Frequently Asked Questions", subHeading: "Does text extraction preserve formatting?", content: [
      { type: "paragraph", text: \`No. The output is plain text \\u2014 no bold, italics, fonts, colors, or layout. The text is extracted in reading order with page separators. For formatted output, consider the PDF to HTML or PDF to Word tools instead.\` },
    ]},
    { heading: "", subHeading: "Will it extract text from scanned PDFs?", content: [
      { type: "paragraph", text: \`Not reliably. Scanned PDFs contain images of text, not actual text data. The tool reads the text content stream, which is empty for scanned pages. For scanned documents, use the OCR tool to recognize text first, then extract.\` },
    ]},
    { heading: "", subHeading: "How are pages separated in the output?", content: [
      { type: "paragraph", text: \`Each page's text is preceded by a "--- Page N ---" header. This makes it easy to identify which text came from which page and to navigate the output in a text editor.\` },
    ]},
    { heading: "", subHeading: "Can I extract text from specific pages only?", content: [
      { type: "paragraph", text: \`Not directly \\u2014 the tool extracts all pages. To get text from specific pages, first extract those pages using the Extract Pages tool, then run text extraction on the smaller document.\` },
    ]},
    { heading: "", subHeading: "Why does some text appear out of order?", content: [
      { type: "paragraph", text: \`PDF text extraction follows the order items appear in the content stream, which may not match the visual reading order in complex layouts (multi-column pages, text boxes, overlays). For most single-column documents, the reading order is preserved correctly.\` },
    ]},
    { heading: "", subHeading: "How large can the output file be?", content: [
      { type: "paragraph", text: \`The output size depends on the text content of the PDF. A 100-page text-heavy document might produce a 200-500KB text file. Scanned PDFs with no embedded text data produce nearly empty output files.\` },
    ]},`;

if (content.includes(wrongBlock)) {
  content = content.replace(wrongBlock, rightBlock);
  writeFileSync(file, content);
  console.log('Fixed seoPdfToText FAQ structure');
} else {
  console.log('Wrong block not found exactly - trying line-by-line approach');
  
  // Line-by-line approach
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check for wrong FAQ heading pattern
    if (line.includes('heading: "Frequently Asked Questions", content: [') && 
        !line.includes('subHeading:')) {
      // This is the wrong pattern - check next line
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.includes('{ subHeading:')) {
        // Extract subHeading from next line
        const match = nextLine.match(/\{ subHeading: "([^"]+)"/);
        if (match) {
          // Emit correct structure
          result.push(line.replace('content: [', `subHeading: "${match[1]}", content: [`));
          i += 2; // Skip the next line (it's been absorbed)
          continue;
        }
      }
    }
    
    // Check for inner subHeading lines (6 spaces indent)
    if (line.match(/^      \{ subHeading: "/)) {
      const match = line.match(/\{ subHeading: "([^"]+)"/);
      if (match) {
        // Emit as section level with empty heading (4 spaces indent)
        result.push(`    { heading: "", subHeading: "${match[1]}", content: [`);
        i++;
        continue;
      }
    }
    
    result.push(line);
    i++;
  }
  
  writeFileSync(file, result.join('\n'));
  console.log('Fixed via line-by-line approach');
}

// Verify
const fixed = readFileSync(file, 'utf-8');
const wrongCount = (fixed.match(/heading: "Frequently Asked Questions", content: \[/g) || []).length;
const correctCount = (fixed.match(/heading: "Frequently Asked Questions", subHeading:/g) || []).length;
console.log(`Wrong FAQ patterns remaining: ${wrongCount}`);
console.log(`Correct FAQ patterns: ${correctCount}`);
