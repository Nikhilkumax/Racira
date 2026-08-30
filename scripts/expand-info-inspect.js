const fs = require('fs');
const tools = JSON.parse(fs.readFileSync('scratch/seo-info-inspect.json', 'utf8'));

function addFaq(t, q, a) { t.sections.push({ heading: '', subHeading: q, content: [{ type: 'paragraph', text: a }] }); }
function addWhyUse(t, x) { t.sections.find(s => s.heading.startsWith('Why Use')).content.push({ type: 'paragraph', text: x }); }
function addWhatIs(t, x) { t.sections[0].content.push({ type: 'paragraph', text: x }); }

// extract-hyperlinks
const t1 = tools.find(t => t.slug === 'extract-hyperlinks');
addWhatIs(t1, 'The regex matching covers both http:// and https:// protocols, as well as URLs starting with www. that may not have an explicit protocol prefix. URLs with special characters like query parameters, fragments, and encoded characters are captured as long as they appear on a single text line.');
addWhyUse(t1, 'SEO auditors analyzing PDF marketing materials need to verify that all embedded links point to live, correct destinations. Bulk extraction followed by automated link checking is faster than manually clicking each link in a PDF reader.');
addFaq(t1, 'Does it extract mailto: links from annotations?', 'Not currently. Only http/https URLs from Link annotations and text content are extracted. Mailto: links in annotations are a different annotation subtype and are not included in this extraction.');

// extract-headings
const t2 = tools.find(t => t.slug === 'extract-headings');
addWhatIs(t2, 'The font size calculation uses the Euclidean norm of the text matrix transformation vectors, which correctly handles rotated and scaled text. This means headings that are rotated 90 degrees or scaled non-uniformly are still detected by their effective font size.');
addWhyUse(t2, 'Technical documentation teams verifying that their PDF export maintains proper heading hierarchy use the extraction output to compare against the source document outline. Discrepancies indicate export issues with heading detection.');
addFaq(t2, 'Why the 14pt threshold?', '14pt is a common minimum for heading text in standard documents where body text is typically 10-12pt. Documents with larger body text may produce false positives. The threshold is hardcoded and cannot be adjusted per-document.');

// extract-email-addresses
const t3 = tools.find(t => t.slug === 'extract-email-addresses');
addWhatIs(t3, 'The regex pattern matches standard email formats with at least one character before the @ symbol, a domain with at least one dot, and a top-level domain of at least 2 characters. This filters out most false positives while catching legitimate addresses in the document text.');
addWhyUse(t3, 'Privacy compliance teams auditing PDFs for GDPR or CCPA requirements use email extraction to identify all personal data that may need to be redacted or disclosed in data subject access requests.');
addFaq(t3, 'What about email addresses split across text items?', 'pdf.js may split a single email address across multiple text items if the PDF was created with individual character positioning. In that case, the email may not be detected because the @ symbol and domain are in separate text items. This is a known limitation of text-based extraction from PDFs.');

// extract-phone-numbers
const t4 = tools.find(t => t.slug === 'extract-phone-numbers');
addWhatIs(t4, 'The regex pattern handles US phone number formats with various separators including parentheses, dashes, dots, and spaces. The optional country code prefix is captured when present. The pattern requires exactly 10 digits for the main number after stripping formatting characters.');
addWhyUse(t4, 'HR departments processing employment applications or contact forms exported as PDFs need to extract phone numbers for their applicant tracking system. Bulk extraction eliminates manual data entry from PDF documents.');
addFaq(t4, 'Does it handle international formats like +44 20 7946 0958?', 'The pattern primarily matches US-style formats. International numbers with different digit groupings like UK 11-digit numbers or German area codes may not be fully matched. The pattern is designed for common North American formats.');

// extract-tables
const t5 = tools.find(t => t.slug === 'extract-tables');
addWhatIs(t5, 'The row grouping uses a 5-point Y-coordinate tolerance to handle slight vertical misalignment between text items on the same logical row. Text items within 5 points of the same Y position are grouped together, then sorted left-to-right by their X coordinate to preserve column order.');
addWhyUse(t5, 'Financial analysts extracting data from annual reports or SEC filings need structured data from tables that appear as images or complex layouts in the PDF. The CSV output provides a machine-readable format for analysis in Excel or Python.');
addFaq(t5, 'How does it handle tables with borders or lines?', 'The tool does not detect table borders or lines - it only uses text item positions. Tables defined by visual borders but containing sparse text may not be detected as tables. The tool works best with text-heavy tables where items are clearly aligned in rows and columns.');

// pdf-size-analyzer
const t6 = tools.find(t => t.slug === 'pdf-size-analyzer');
addWhatIs(t6, 'While this tool only reports file size, understanding what drives PDF size is useful context. The largest contributors to PDF file size are typically embedded images especially uncompressed or high-resolution ones, embedded fonts where full font subsets can add hundreds of KB per font, XMP metadata streams, and embedded attachments. A 10-page text-only PDF is usually under 100KB, while the same document with high-resolution images can easily exceed 10MB.');
addWhyUse(t6, 'Help desk teams receiving oversized PDF uploads need a quick size check before directing users to compression tools. Knowing the exact byte count helps determine whether the file exceeds email attachment limits typically 25MB or upload restrictions.');
addFaq(t6, 'Why would a simple text PDF be large?', 'Text PDFs can be large if they embed full font subsets including glyphs not used in the document, contain high-resolution scanned page images behind the text, or include embedded attachments and metadata streams. The file size reflects the total of all embedded resources, not just the visible text.');

// version-checker
const t7 = tools.find(t => t.slug === 'version-checker');
addWhatIs(t7, 'Different PDF versions enable different features: PDF 1.4 (Acrobat 5) introduced transparency and layers; PDF 1.5 (Acrobat 6) added JPEG2000 compression, object streams, and XMP metadata; PDF 1.6 (Acrobat 7) added extended security and 3D annotations; PDF 1.7 (Acrobat 8) added improved compression and annotation support; PDF 2.0 (ISO 32000-2) added rich media, 3D, and improved encryption. Knowing the version helps predict which features a document may use.');
addFaq(t7, 'Can a PDF claim a version but use features from a different version?', 'Yes. Some PDF producers set the version header higher than necessary, or embed features from newer versions in an older-version document. The header version indicates what the creator declared, not necessarily what features are actually used.');

// attachment-inspector
const t8 = tools.find(t => t.slug === 'attachment-inspector');
addWhatIs(t8, 'PDF attachments are stored in the document EmbeddedFiles name tree, which maps filenames to file data streams. The inspector reads this tree structure and reports each entry filename and byte count without downloading the actual file data.');
addWhyUse(t8, 'Security Operations teams scanning inbound PDFs for potential threats use attachment inspection to identify embedded executables, scripts, or suspicious file types before allowing the document into the corporate environment.');
addFaq(t8, 'Can attachments be hidden or obfuscated?', 'Attachments are visible in the PDF structure but may not be obvious to casual users. Some PDFs embed attachments without obvious UI indicators. This tool reveals all attachments regardless of whether the PDF reader displays them prominently.');

// pdf-statistics
const t9 = tools.find(t => t.slug === 'pdf-statistics');
addWhatIs(t9, 'The text character count is calculated by summing the length of all text items across all pages. Image count includes both inline images and XObject references. Font count tracks unique font names, meaning the same font referenced on multiple pages counts once. Annotation and form field counts include all subtypes found in the document.');
addWhyUse(t9, 'Document processing pipelines use statistics to classify incoming PDFs: text-heavy documents go to text extraction, image-heavy documents go to OCR, and form-heavy documents go to form processing. Statistics-based routing is faster than full content analysis.');
addFaq(t9, 'Does it count images inside annotations or form fields?', 'The tool counts images referenced as page resources (XObject references). Images embedded in annotations or form field appearances may or may not be counted depending on how they are referenced in the PDF structure. The count represents a best-effort approximation.');

// view-metadata
const t10 = tools.find(t => t.slug === 'view-metadata');
addWhatIs(t10, 'The metadata dictionary, also called the Document Information Dictionary, stores key-value pairs in the PDF trailer. Standard fields include Title, Author, Subject, Keywords, Creator (the application that created the source document), Producer (the application that generated the PDF), CreationDate, and ModDate. Custom fields may also be present depending on the PDF producer.');
addWhyUse(t10, 'Forensic document analysts use metadata to establish document provenance - when it was created, what software was used, and whether it has been modified. Metadata timestamps and software identifiers provide clues about the document history.');
addFaq(t10, 'What date format is used?', 'PDF metadata dates follow the D:YYYYMMDDHHmmSS format (for example D:20240115143000 for January 15, 2024 at 2:30 PM). Timezone offsets may be appended. The tool preserves the original format in the JSON output.');

// page-dimensions
const t11 = tools.find(t => t.slug === 'page-dimensions');
addWhatIs(t11, 'PDF dimensions are measured in points where 1 point equals 1/72 inch. Common sizes include A4 at 595.28 x 841.89 points (210 x 297mm), US Letter at 612 x 792 points (8.5 x 11 inches), and US Legal at 612 x 1008 points (8.5 x 14 inches). The tool reads the MediaBox array from each page dictionary, which defines the physical page boundaries.');
addFaq(t11, 'What about pages with different orientations?', 'Each page is reported independently. A document with mixed portrait and landscape pages will show different dimensions for different pages. The tool does not detect or report orientation - only raw width and height values.');

// certificate-inspector
const t12 = tools.find(t => t.slug === 'certificate-inspector');
addWhatIs(t12, 'The certificate chain typically has 2-3 levels: the end-entity certificate used to sign the document, one or more intermediate CA certificates, and the root CA certificate. The inspector reports each level separately, showing the issuer-subject relationship that forms the trust chain. Self-signed certificates where issuer equals subject appear at the root level.');
addWhyUse(t12, 'PKI administrators validating signing certificates against their organization trust store need the full certificate chain data to verify that each link in the chain is valid and trusted. The inspector provides the raw data needed for this verification.');
addFaq(t12, 'What if the certificate chain is incomplete?', 'The tool reports whatever certificates are present in the signature. If intermediate certificates are missing, which is a common issue, the chain will appear truncated. Incomplete chains may cause validation failures in strict PDF readers.');

fs.writeFileSync('scratch/seo-info-inspect.json', JSON.stringify(tools, null, 2), 'utf8');
console.log('Expanded all 12 tools');
