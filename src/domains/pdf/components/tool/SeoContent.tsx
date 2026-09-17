import { Fragment } from "react";
import type { ToolSeo, SeoContentBlock } from "@/domains/pdf/registry/tool-seo";

interface SeoContentProps {
  seo: ToolSeo;
}

/**
 * Renders the editorial SEO content block.
 *
 * Supports:
 *  - `<h2>` per section heading
 *  - `<h3>` via `subHeading` (for FAQ questions)
 *  - `<p>` for paragraphs
 *  - `<ol>` for ordered list items (how-to steps)
 *
 * Uses the `.seo-prose` utility class from globals.css for consistent typography.
 *
 * MARKUP CONTRACT: headings and paragraphs are rendered through `<Fragment>`, so
 * they stay DIRECT children of `.seo-prose`. Wrapping each section in its own
 * element collapsed every gap inside it — the container's `space-y-6` rhythm
 * only applies between direct children. Same contract as the CAD renderer.
 */
const SeoContent = ({ seo }: SeoContentProps) => {
  if (!seo.sections || seo.sections.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="seo-prose">
        {seo.sections.map((section, i) => (
          <Fragment key={i}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.subHeading && <h3>{section.subHeading}</h3>}
            {section.content
              ? section.content.map((block: SeoContentBlock, j: number) =>
                  block.type === "list" ? (
                    <ol key={j}>
                      {(block.items ?? []).map((item: string, k: number) => (
                        <li key={k} dangerouslySetInnerHTML={{ __html: item }} />
                      ))}
                    </ol>
                  ) : (
                    <p key={j} dangerouslySetInnerHTML={{ __html: block.text ?? "" }} />
                  )
                )
              : (section.paragraphs ?? []).map((p: string, j: number) => (
                  <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
};

export default SeoContent;
