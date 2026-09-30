/**
 * Spans of text that are not prose: URLs, e-mail addresses, file names,
 * @handles, Markdown links and inline code.
 *
 * The spell checker skips these by default — "https", "example", "com" and
 * "tsx" are not spelling mistakes, they are identifiers. The patterns are
 * deliberately simple and anchored on punctuation that prose does not contain,
 * so a false skip costs a missed typo in a URL rather than a false report.
 */
export const SPAN_SKIP_PATTERNS: RegExp[] = [
  // http(s)://… , www.…
  /\bhttps?:\/\/[^\s<>()]+/gi,
  /\bwww\.[^\s<>()]+/gi,
  // anything containing an @ is treated as an address or handle
  /[^\s<>()]*@[^\s<>()]*/g,
  // Markdown links: [label](target)
  /\[[^\]\n]*\]\([^)\n]*\)/g,
  // file names with a known extension
  /\b[\w./\\-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|css|scss|html?|md|mdx|txt|py|rb|go|rs|java|kt|swift|c|cpp|h|cs|php|sh|bash|ps1|yml|yaml|toml|ini|cfg|env|xml|csv|tsv|sql|png|jpe?g|gif|svg|webp|ico|avf|mp[34]|wav|ogg|pdf|docx?|xlsx?|pptx?|zip|gz|tar|war|jar|exe|dll|so|dylib)\b/gi,
  // snake_case and SCREAMING_SNAKE identifiers
  /\b\w+_\w+\b/g,
];
