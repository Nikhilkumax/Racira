import type { ToolSeo } from "@/data/pdf/tool-seo";

interface SeoContentProps {
  seo: ToolSeo;
}

/**
 * Renders the editorial SEO content block.
 *
 * Strictly `<h2>` + `<p>` — no `<ul>`, `<ol>`, or question-formatted headers.
 * Uses the `.seo-prose` utility class from globals.css for consistent typography.
 */
const SeoContent = ({ seo }: SeoContentProps) => {
  if (!seo.sections || seo.sections.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card px-6 py-8 sm:px-8 sm:py-10">
      <div className="seo-prose max-w-3xl">
        {seo.sections.map((section, i) => (
          <div key={i}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeoContent;
