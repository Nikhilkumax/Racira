import type { ToolSeo, SeoContentBlock } from "@/domains/cad/registry/tool-seo";
import { htmlToReact } from "@/lib/utils/html-to-react";

interface SeoContentProps {
  seo: ToolSeo;
}

/**
 * Renders editorial SEO content below the tool UI.
 * Uses the `.seo-prose` utility class from globals.css for consistent
 * typography. Styling: full container width, no bordered card — matches the
 * tool grid margins (same convention as the other domains).
 *
 * Uses htmlToReact() instead of dangerouslySetInnerHTML to avoid hydration
 * mismatches caused by RSC streaming stripping the __html prop.
 */
export default function SeoContent({ seo }: SeoContentProps) {
  if (!seo.sections || seo.sections.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="seo-prose">
        {seo.sections.map((section, i) => (
          <div key={i}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.subHeading && <h3>{section.subHeading}</h3>}
            {section.content.map((block: SeoContentBlock, j: number) =>
              block.type === "list" ? (
                <ol key={j}>
                  {(block.items ?? []).map((item: string, k: number) => (
                    <li key={k}>{htmlToReact(item)}</li>
                  ))}
                </ol>
              ) : (
                <div key={j}>{htmlToReact(block.text ?? "")}</div>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
