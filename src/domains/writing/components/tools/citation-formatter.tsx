"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import {
  CITATION_STYLES,
  SOURCE_TYPES,
  formatCitation,
  parseAuthorsInput,
  stylesFor,
  type CitationStyle,
  type SourceType,
} from "@/domains/writing/lib/text/citation.ts";

const EXAMPLE_AUTHORS = "Smith, John A.\nJones, Bob";

/**
 * Citation formatter: typed metadata in, one formatted entry out, for APA 7,
 * MLA 9, Chicago 17 (notes-bibliography) and Bluebook 21 (cases and statutes).
 * Nothing is looked up — there is no DOI resolver and no ISBN search — so the
 * output is exactly a function of the fields, which is what makes every entry
 * checkable against the manual's own worked example.
 */
export default function CitationFormatter() {
  const [style, setStyle] = useState<CitationStyle>("apa7");
  const [sourceType, setSourceType] = useState<SourceType>("book");
  const [fieldText, setFieldText] = useState({
    authors: "",
    editors: "",
    year: "",
    title: "",
    container: "",
    publisher: "",
    place: "",
    edition: "",
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    url: "",
    accessed: "",
    date: "",
    pinpoint: "",
    reportNumber: "",
    reporter: "",
    court: "",
    codeTitle: "",
    section: "",
  });

  const set = (key: keyof typeof fieldText) => (value: string) => setFieldText((previous) => ({ ...previous, [key]: value }));
  const authorsInput = useDebouncedValue(fieldText.authors, 250);
  const editorsInput = useDebouncedValue(fieldText.editors, 250);

  const legal = sourceType === "case" || sourceType === "statute";
  const availableStyles = useMemo(() => stylesFor(sourceType), [sourceType]);
  const activeStyle: CitationStyle = availableStyles.includes(style) ? style : availableStyles[0];

  const result = useMemo(() => {
    const fields = {
      sourceType,
      authors: parseAuthorsInput(authorsInput),
      editors: parseAuthorsInput(editorsInput),
      title: fieldText.title,
      year: fieldText.year || undefined,
      container: fieldText.container || undefined,
      publisher: fieldText.publisher || undefined,
      place: fieldText.place || undefined,
      edition: fieldText.edition || undefined,
      volume: fieldText.volume || undefined,
      issue: fieldText.issue || undefined,
      pages: fieldText.pages || undefined,
      doi: fieldText.doi || undefined,
      url: fieldText.url || undefined,
      accessed: fieldText.accessed || undefined,
      date: fieldText.date || undefined,
      pinpoint: fieldText.pinpoint || undefined,
      reportNumber: fieldText.reportNumber || undefined,
      reporter: fieldText.reporter || undefined,
      court: fieldText.court || undefined,
      codeTitle: fieldText.codeTitle || undefined,
      section: fieldText.section || undefined,
    };
    return formatCitation(fields, activeStyle);
  }, [sourceType, authorsInput, editorsInput, fieldText, activeStyle]);

  const hasTitle = fieldText.title.trim().length > 0 || legal;
  const report = useMemo(
    () =>
      [
        `${result.styleLabel} — ${SOURCE_TYPES.find((entry) => entry.id === sourceType)?.label}`,
        "",
        "Bibliography / reference entry:",
        result.bibliography,
        result.note && result.note !== result.bibliography ? `\nNote / footnote form:\n${result.note}` : "",
        `\nIn-text / short form:\n${result.inText}`,
        result.warnings.length > 0 ? `\nWarnings:\n${result.warnings.map((warning) => `- ${warning}`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [result, sourceType],
  );

  const fillExample = () => {
    if (legal) {
      setSourceType("case");
      setStyle("bluebook21");
      setFieldText((previous) => ({
        ...previous,
        title: "Smith v. Jones",
        volume: "123",
        reporter: "F.3d",
        pages: "456",
        court: "2d Cir.",
        year: "2020",
        pinpoint: "458",
      }));
      return;
    }
    setSourceType("journal-article");
    setStyle("apa7");
    setFieldText((previous) => ({
      ...previous,
      authors: EXAMPLE_AUTHORS,
      title: "A study of style",
      container: "Journal of Writing",
      year: "2021",
      volume: "12",
      issue: "3",
      pages: "45-67",
      doi: "10.1000/xyz",
      pinpoint: "45",
    }));
  };

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<Btn kind="ghost" testid="btn-example" onClick={fillExample}>Fill a worked example</Btn>}>
          Source and style
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="type"
            label="Source type"
            value={sourceType}
            onChange={(value) => {
              const next = value as SourceType;
              setSourceType(next);
              // Keep the style list and the chosen style in agreement: a case
              // switches to Bluebook, and a book leaves it.
              setStyle(stylesFor(next)[0]);
            }}
            options={SOURCE_TYPES.map((entry) => ({ value: entry.id, label: entry.label }))}
          />
          <Select
            name="style"
            label="Citation style"
            value={activeStyle}
            onChange={(value) => setStyle(value as CitationStyle)}
            options={CITATION_STYLES.filter((entry) => availableStyles.includes(entry.id)).map((entry) => ({
              value: entry.id,
              label: entry.label,
            }))}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextArea
            name="authors"
            label="Authors — one per line: Family, Given"
            value={fieldText.authors}
            onChange={set("authors")}
            rows={3}
            placeholder={EXAMPLE_AUTHORS}
            hint="an organisation with no comma is kept as written"
          />
          {!legal && (
            <TextArea
              name="editors"
              label="Editors (chapters only) — one per line"
              value={fieldText.editors}
              onChange={set("editors")}
              rows={3}
              placeholder="Jones, Bob"
            />
          )}
          {legal && (
            <div className="grid gap-3">
              <TextInput name="court" label="Court (e.g. 2d Cir.)" value={fieldText.court} onChange={set("court")} />
              <TextInput name="reporter" label="Reporter (e.g. F.3d)" value={fieldText.reporter} onChange={set("reporter")} />
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Fields</PanelTitle>
        {legal ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="title" label="Case or statute name / title" value={fieldText.title} onChange={set("title")} />
            <TextInput name="year" label="Year" value={fieldText.year} onChange={set("year")} hint="e.g. 2020" />
            <TextInput name="volume" label="Volume" value={fieldText.volume} onChange={set("volume")} />
            <TextInput name="pages" label="First page (or page range)" value={fieldText.pages} onChange={set("pages")} />
            <TextInput name="codeTitle" label="Code title (statutes, e.g. 42)" value={fieldText.codeTitle} onChange={set("codeTitle")} />
            <TextInput name="section" label="Section (statutes, e.g. 1983)" value={fieldText.section} onChange={set("section")} />
            <TextInput name="pinpoint" label="Pinpoint page (short form)" value={fieldText.pinpoint} onChange={set("pinpoint")} hint="optional" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput name="title" label="Title (enter the style's capitalisation)" value={fieldText.title} onChange={set("title")} />
            <TextInput name="container" label="Journal / newspaper / website, or book title for a chapter" value={fieldText.container} onChange={set("container")} />
            <TextInput name="year" label="Year" value={fieldText.year} onChange={set("year")} hint="blank prints n.d." />
            <TextInput name="date" label="Full date (news and web)" value={fieldText.date} onChange={set("date")} hint="printed as entered" />
            <TextInput name="volume" label="Volume" value={fieldText.volume} onChange={set("volume")} />
            <TextInput name="issue" label="Issue" value={fieldText.issue} onChange={set("issue")} />
            <TextInput name="pages" label="Pages (e.g. 45-67)" value={fieldText.pages} onChange={set("pages")} />
            <TextInput name="edition" label="Edition (e.g. 2nd)" value={fieldText.edition} onChange={set("edition")} />
            <TextInput name="publisher" label="Publisher" value={fieldText.publisher} onChange={set("publisher")} />
            <TextInput name="place" label="Place of publication (Chicago)" value={fieldText.place} onChange={set("place")} />
            <TextInput name="doi" label="DOI" value={fieldText.doi} onChange={set("doi")} hint="10.1000/xyz" />
            <TextInput name="url" label="URL" value={fieldText.url} onChange={set("url")} />
            <TextInput name="accessed" label="Accessed (printed as entered)" value={fieldText.accessed} onChange={set("accessed")} />
            <TextInput name="reportNumber" label="Report number" value={fieldText.reportNumber} onChange={set("reportNumber")} />
            <TextInput name="pinpoint" label="Pinpoint page (in-text and note forms)" value={fieldText.pinpoint} onChange={set("pinpoint")} hint="optional" />
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle right={result.unsupported ? <span className="text-[10px] text-amber-700 dark:text-amber-300">not supported by this style</span> : undefined}>
          Formatted entry
        </PanelTitle>
        {result.unsupported ? (
          <Notice tone="warn">{result.unsupportedReason}</Notice>
        ) : (
          <>
            <OutputBlock name="bibliography" value={hasTitle ? result.bibliography : ""} maxHeight={200} mono={false} />
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                In-text / short form: <span data-testid="res-intext" className="font-mono text-foreground">{hasTitle ? result.inText : "—"}</span>
              </p>
              {result.note && result.note !== result.bibliography && (
                <p className="text-xs text-muted-foreground">
                  Note form: <span data-testid="res-note" className="font-mono text-foreground">{result.note}</span>
                </p>
              )}
            </div>
            {result.warnings.length > 0 && (
              <div className="mt-3">
                <ul data-testid="res-warnings" className="space-y-1">
                  {result.warnings.map((warning) => (
                    <li key={warning} className="text-xs text-amber-700 dark:text-amber-300">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={result.bibliography} testid="copy-bibliography" label="Copy entry" />
              <CopyButton text={report} testid="copy-report" label="Copy report" />
              <DownloadButton text={report} filename="citation.txt" testid="download-entry" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Editions, scope and what this cannot do</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The engine implements {CITATION_STYLES.map((entry) => entry.short).join(", ")}. Titles are printed exactly
            as you enter them, because correct capitalisation depends on the style, the language and proper nouns; enter
            the title in the case your style requires. Italics are plain text here — use your word processor&rsquo;s
            italic command on the element your style italicises.
          </Notice>
          <Notice tone="warn">
            This is a formatter, not a reference manager: it does not look anything up, does not resolve DOIs, and
            cannot tell you whether an entry is complete or correct. Bluebook support covers the case and statute
            patterns shown here, not the whole rule set, and nothing on this page is legal advice. Check every entry
            against the current edition of the manual before submitting.
          </Notice>
          <Notice>
            Documented simplifications: APA lists up to twenty authors, MLA and Chicago use et al. from four, Chicago
            lists up to three, page ranges use each style&rsquo;s own dash (en dash for APA and Chicago, hyphen for
            MLA), and Bluebook case citations carry no authors. No data leaves this page.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
