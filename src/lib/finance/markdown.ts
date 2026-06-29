/**
 * Tiny markdown → HTML renderer for article bodies.
 * Sufficient for now; swap for `marked` + DOMPurify if you need full CommonMark.
 */
export function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inPara = false;
  let inQuote = false;

  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const closePara = () => { if (inPara) { out.push("</p>"); inPara = false; } };
  const closeQuote = () => { if (inQuote) { out.push("</blockquote>"); inQuote = false; } };
  const closeAll = () => { closeList(); closePara(); closeQuote(); };

  const inline = (s: string) =>
    escape(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeAll(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,4})\s+(.+)$/))) {
      closeAll();
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
      continue;
    }
    if (line.startsWith("> ")) {
      closeList(); closePara();
      if (!inQuote) { out.push("<blockquote>"); inQuote = true; }
      out.push(`<p>${inline(line.slice(2))}</p>`);
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.+)$/))) {
      closePara(); closeQuote();
      if (inList !== "ul") { closeList(); out.push("<ul>"); inList = "ul"; }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    if ((m = line.match(/^\d+\.\s+(.+)$/))) {
      closePara(); closeQuote();
      if (inList !== "ol") { closeList(); out.push("<ol>"); inList = "ol"; }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    closeList(); closeQuote();
    if (!inPara) { out.push("<p>"); inPara = true; } else { out.push(" "); }
    out.push(inline(line));
  }
  closeAll();
  return out.join("");
}