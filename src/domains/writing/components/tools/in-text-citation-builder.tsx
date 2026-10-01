"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
} from "./ui";
import EntryFields from "./citation/entry-fields";
import {
  CITATION_STYLES,
  type CitationFields,
} from "@/domains/writing/lib/text/citation.ts";
import { inTextForms } from "@/domains/writing/lib/text/reference-list.ts";

const EMPTY: CitationFields = {
  sourceType: "book",
  authors: [],
  title: "",
  year: "",
  pinpoint: "",
};

/**
 * In-text citation builder: one source, every style shown side by side with its
 * parenthetical, narrative and short forms. This is the page to open while
 * writing, because the three forms of one citation are the thing writers
 * actually get wrong — (Smith, 2020) and Smith (2020) are not interchangeable
 * everywhere, and Chicago's note form is a third shape again.
 */
export default function InTextCitationBuilder() {
  const [fields, setFields] = useState<CitationFields>(EMPTY);

  const forms = useMemo(
    () => CITATION_STYLES.map((style) => ({ style, forms: inTextForms(fields, style.id) })),
    [fields],
  );
  const hasSource = fields.title.trim().length > 0 || fields.authors.length > 0;

  const report = useMemo(
    () =>
      [
        "In-text citation forms",
        fields.title ? `Source: ${fields.title}` : "Source: (untitled)",
        "",
        ...forms.flatMap(({ style, forms: row }) => [
          `${style.label}`,
          `  parenthetical: ${row.parenthetical}`,
          `  ${row.hasNarrative ? "narrative" : "note form"}: ${row.narrative}`,
          `  short note:   ${row.shortNote}`,
          "",
        ]),
      ].join("\n"),
    [forms, fields.title],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Source</PanelTitle>
        <EntryFields fields={fields} onChange={setFields} idSuffix="" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasSource ? report : ""} testid="copy-report" label="Copy all forms" />
          <Btn kind="ghost" testid="btn-reset" onClick={() => setFields(EMPTY)}>
            Clear
          </Btn>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Enter the source once and read every style side by side. Nothing is uploaded and nothing is stored: clearing
          the field or closing the tab removes it.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Forms</PanelTitle>
        {!hasSource ? (
          <EmptyState>Add an author or a title above — all four styles are rendered at once.</EmptyState>
        ) : (
          <HeroStat
            label="Styles rendered"
            value={forms.length}
            testid="res-styles"
            sub={forms.map(({ style }) => style.short).join(" · ")}
          />
        )}
      </Panel>

      {hasSource &&
        forms.map(({ style, forms: row }) => (
          <Panel key={style.id}>
            <PanelTitle
              right={
                <CopyButton
                  text={`${row.parenthetical} | ${row.narrative}`}
                  testid={`copy-${style.id}`}
                  label="Copy this style"
                />
              }
            >
              {style.label}
            </PanelTitle>
            <div data-testid={`res-${style.id}`} className="space-y-2">
              <p className="text-sm text-foreground">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">parenthetical</span>
                <span className="font-mono">{row.parenthetical}</span>
              </p>
              <p className="text-sm text-foreground">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {row.hasNarrative ? "narrative" : "note form"}
                </span>
                <span className="font-mono">{row.narrative}</span>
              </p>
              <p className="text-sm text-foreground">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  {style.id === "bluebook21" ? "short form" : "later reference"}
                </span>
                <span className="font-mono">{row.shortNote}</span>
              </p>
              {!row.hasNarrative && (
                <p className="text-xs text-muted-foreground">
                  {style.short} is a note style: it has no parenthetical narrative form, so the note text is shown in
                  that row instead.
                </p>
              )}
            </div>
          </Panel>
        ))}

      <Panel>
        <PanelTitle>How each form is built</PanelTitle>
        <div className="space-y-2">
          <Notice>
            APA puts the year in the parenthetical and drops the given names; MLA keeps the page number in the
            parenthetical and uses the author&rsquo;s family name alone in a narrative sentence; Chicago and Bluebook
            use notes, so their note text is the third form. The pinpoint page you enter is carried into every form that
            takes one.
          </Notice>
          <Notice tone="warn">
            These are the mechanical forms, not advice about which to use. Whether a narrative or parenthetical citation
            fits a sentence, whether et al. is allowed, and how a source with no author is introduced are editorial
            decisions your style manual explains in prose. Check the manual when a citation is unusual.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
