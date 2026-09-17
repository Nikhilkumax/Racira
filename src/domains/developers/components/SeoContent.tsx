import { Fragment } from "react";
import type { ToolSeo, SeoContentBlock } from "@/domains/developers/registry/tool-seo";
import { htmlToReact } from "@/lib/utils/html-to-react";

interface SeoContentProps {
  seo: ToolSeo;
}

/**
 * Renders editorial SEO content below the tool UI.
 * Uses the `.seo-prose` utility class from globals.css for consistent typography.
 * Styling: full container width, no bordered card — matches the tool grid margins.
 *
 * MARKUP CONTRACT: sections render through `<Fragment>` so headings and blocks
 * stay DIRECT children of `.seo-prose` — a per-section wrapper element blocked
 * the container's `space-y-6` rhythm and collapsed the gaps around every
 * heading and paragraph inside it. Same contract as the CAD/PDF renderers.
 *
 * Paragraph blocks intentionally stay `<div>` here rather than `<p>`: this
 * domain's copy embeds block-level markup (e.g. `<h3>…</h3><p>…</p>`) directly
 * inside paragraph strings, and nesting those in `<p>` produces invalid HTML.
 * The container rhythm supplies their spacing instead.
 *
 * Uses htmlToReact() instead of dangerouslySetInnerHTML to avoid hydration
 * mismatches caused by RSC streaming stripping the __html prop during serialization.
 */
export default function SeoContent({ seo }: SeoContentProps) {
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
                        <li key={k}>{htmlToReact(item)}</li>
                      ))}
                    </ol>
                  ) : (
                    <div key={j}>{htmlToReact(block.text ?? "")}</div>
                  )
                )
              : (section.paragraphs ?? []).map((p: string, j: number) => (
                  <div key={j}>{htmlToReact(p)}</div>
                ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
