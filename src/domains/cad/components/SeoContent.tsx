import { Fragment } from "react";
import type { ToolSeo, SeoContentBlock } from "@/domains/cad/registry/tool-seo";
import { htmlToReact } from "@/lib/utils/html-to-react";

interface SeoContentProps {
  seo: ToolSeo;
}

/**
 * Renders editorial SEO content below the tool UI.
 * Uses the `.seo-prose` typography class from globals.css (full container
 * width, no bordered card — matches the tool grid margins).
 *
 * MARKUP CONTRACT — the two rules below are what make the shared spacing
 * actually apply, and both were violated here until they were fixed:
 *
 *  1. Every paragraph is rendered as its own `<p>`. `.seo-prose`'s paragraph
 *     rules (`mb-4`, leading, muted colour) are element selectors — wrapping
 *     copy in a `<div>` skips them entirely and adjacent paragraphs collapse
 *     into one unbroken block.
 *  2. Sections render through `<Fragment>`, so headings and paragraphs stay
 *     DIRECT children of `.seo-prose`. The container's `space-y-6` rhythm only
 *     reaches direct children, so a per-section wrapper element collapsed the
 *     gaps around every heading and paragraph inside it.
 *
 * The CAD GD&T guide pages document and already follow the same contract.
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
          <Fragment key={i}>
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
                <p key={j}>{htmlToReact(block.text ?? "")}</p>
              )
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
