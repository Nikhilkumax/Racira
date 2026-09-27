import React from "react";

export interface SeoSection {
  h2: string;
  paras?: string[];
  list?: string[];
}

export interface SeoArticle {
  intro?: string[];
  sections: SeoSection[];
}

/**
 * Shared unboxed SEO article — the PMI Calculator golden-standard pattern:
 * a `section.prose-finance` block with h2 sections, paragraphs and lists.
 * Rendered inside the tool's `max-w-[1180px] mt-8` stack (Ad → article →
 * FAQ → Popular), never inside a boxed card.
 */
const SeoContentSection = ({ article }: { article: SeoArticle }) => (
  <section className="prose-finance text-[15.75px]">
    {(article.intro ?? []).map((p, i) => (
      <p key={`intro-${i}`}>{p}</p>
    ))}
    {article.sections.map((s) => (
      <React.Fragment key={s.h2}>
        <h2 className="text-2xl font-bold mb-3">{s.h2}</h2>
        {(s.paras ?? []).map((p, i) => (
          <p key={`${s.h2}-${i}`} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
        {s.list && (
          <ul>
            {s.list.map((li, i) => (
              <li key={`${s.h2}-li-${i}`} dangerouslySetInnerHTML={{ __html: li }} />
            ))}
          </ul>
        )}
      </React.Fragment>
    ))}
  </section>
);

export default SeoContentSection;
