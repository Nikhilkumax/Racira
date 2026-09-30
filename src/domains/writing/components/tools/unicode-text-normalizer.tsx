"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  EmptyState,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  NORMALIZATION_FORMS,
  findInvisibleCharacters,
  inspectCharacters,
  normalize,
  stableForms,
  stripInvisible,
  summarizeKinds,
  type NormalizationForm,
} from "@/domains/writing/lib/text/unicode.ts";

const FORM_NOTES: Record<NormalizationForm, string> = {
  NFC: "Canonical composition — the usual choice for text on the web and in databases.",
  NFD: "Canonical decomposition — accents become separate combining marks (common on macOS file names).",
  NFKC: "Compatibility composition — also folds ligatures, full-width forms and roman numerals.",
  NFKD: "Compatibility decomposition — the most aggressive reduction; loses formatting distinctions.",
};

export default function UnicodeTextNormalizer() {
  const [raw, setRaw] = useState("");
  const [form, setForm] = useState<NormalizationForm>("NFC");
  const [strip, setStrip] = useState(false);
  const text = useDebouncedValue(raw, 250);

  const analysis = useMemo(() => {
    const normalized = normalize(text, form);
    const stripped = strip ? stripInvisible(normalized) : { text: normalized, removed: 0 };
    return {
      output: stripped.text,
      removed: stripped.removed,
      stable: stableForms(text),
      invisible: findInvisibleCharacters(text),
      kinds: summarizeKinds(stripped.text),
      codePointsBefore: inspectCharacters(text).length,
      codePointsAfter: inspectCharacters(stripped.text).length,
    };
  }, [text, form, strip]);

  const changed = analysis.output !== text;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={7}
          placeholder="Paste text with accents, ligatures, full-width characters or invisible separators."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="form"
            label="Normalization form"
            value={form}
            onChange={(next) => setForm(next as NormalizationForm)}
            options={NORMALIZATION_FORMS.map((candidate) => ({
              value: candidate,
              label: candidate,
            }))}
            hint={analysis.stable.includes(form) ? "already stable" : "changes this text"}
          />
          <div className="flex items-end pb-2">
            <Checkbox name="strip" label="Remove invisible characters" checked={strip} onChange={setStrip} />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{FORM_NOTES[form]}</p>
        {analysis.invisible.length > 0 && (
          <div className="mt-3">
            <Notice tone="warn">
              {analysis.invisible.length} invisible character{analysis.invisible.length === 1 ? "" : "s"} found
              (zero-width spaces, marks or byte order marks).{" "}
              {strip ? "They are removed from the output." : "Tick the box above to remove them."}
            </Notice>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Normalized output</PanelTitle>
        {text.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <pre
              data-testid="res-normalized"
              className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
            >
              {analysis.output}
            </pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={analysis.output} testid="copy-normalized" label="Copy result" />
              <DownloadButton
                text={analysis.output}
                filename={`normalized-${form.toLowerCase()}.txt`}
                testid="download-normalized"
                label="Download"
              />
            </div>
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="changed" label="Differs from input" value={changed ? "yes" : "no"} />
                <ResultRow name="removed" label="Invisible characters removed" value={String(analysis.removed)} />
                <ResultRow name="stable" label="Input already stable in" value={analysis.stable.join(", ") || "none"} />
                <ResultRow name="length-before" label="UTF-16 length before → after" value={`${text.length} → ${analysis.output.length}`} />
                <ResultRow name="codepoints" label="Code points before → after" value={`${analysis.codePointsBefore} → ${analysis.codePointsAfter}`} />
                <ResultRow name="kinds" label="Letters / digits / marks" value={`${analysis.kinds.letters} / ${analysis.kinds.digits} / ${analysis.kinds.marks}`} />
                <ResultRow name="controls" label="Control / format characters" value={`${analysis.kinds.control} / ${analysis.kinds.format}`} />
              </ResultBox>
            </div>
          </>
        )}
      </Panel>

      {analysis.invisible.length > 0 && (
        <Panel>
          <PanelTitle>Invisible characters found</PanelTitle>
          <ResultBox>
            {analysis.invisible.map((hit) => (
              <ResultRow key={`${hit.index}-${hit.hex}`} label={`Offset ${hit.index} — ${hit.name}`} value={hit.hex} />
            ))}
          </ResultBox>
        </Panel>
      )}
    </StackLayout>
  );
}
