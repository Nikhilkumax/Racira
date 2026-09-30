"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import {
  MAX_REPORTED,
  MIN_SPELL_LENGTH,
  SUGGESTION_BUDGET,
  checkSpelling,
  formatSpellReport,
  type SpellChecker,
  type SpellOptions,
} from "@/domains/writing/lib/text/spell.ts";
import { SPAN_SKIP_PATTERNS } from "@/domains/writing/lib/text/code-likeness.ts";

/**
 * Spell checker backed by a real dictionary, loaded lazily on this page only.
 *
 * The word list is not written here. `spell.ts` scans and decides what to look
 * up; every correctness and every suggestion comes from `nspell` (MIT, ~41 KB
 * unpacked) reading the `dictionary-en` Hunspell data (v4.0.0, MIT AND BSD,
 * the SCOWL-derived en_US dictionary, ~562 KB unpacked). Both packages are
 * dynamic-imported in an effect, so the data files are requested only by a
 * visitor who opens this page.
 *
 * Consequences stated on the page, because they are visible in the results:
 *   - the dictionary is en_US, so British spellings (colour, organise) are
 *     reported as unknown and suggested as their US form;
 *   - names, jargon, brand names and code-like words are unknown by
 *     definition — they are not in the dictionary to be found.
 */
type LoadState = "loading" | "ready" | "error";

export default function SpellCheckerTool() {
  const [raw, setRaw] = useState("");
  const [allowRaw, setAllowRaw] = useState("");
  const [ignoreAcronyms, setIgnoreAcronyms] = useState(true);
  const [ignoreNumbers, setIgnoreNumbers] = useState(true);
  const [ignoreInnerCapitals, setIgnoreInnerCapitals] = useState(true);
  const [checker, setChecker] = useState<SpellChecker | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadNote, setLoadNote] = useState("");

  const text = useDebouncedValue(raw, 250);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    (async () => {
      try {
        const [nspellModule, affModule, dicModule] = await Promise.all([
          import("nspell"),
          import("dictionary-en/index.aff"),
          import("dictionary-en/index.dic"),
        ]);
        if (cancelled) return;
        const spell = nspellModule.default(affModule.default, dicModule.default);
        setChecker({
          correct: (word: string) => spell.correct(word),
          suggest: (word: string) => spell.suggest(word),
        });
        setLoadNote(
          `Dictionary ready — nspell parsed the en_US affix and dictionary text in ${Date.now() - started} ms.`,
        );
        setLoadState("ready");
      } catch (error) {
        if (cancelled) return;
        setLoadState("error");
        setLoadNote(error instanceof Error ? error.message : "The dictionary could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo<SpellOptions>(
    () => ({
      ignoreAcronyms,
      ignoreNumbers,
      ignoreInnerCapitals,
      allow: allowRaw.split(/[\s,;]+/).filter(Boolean),
    }),
    [ignoreAcronyms, ignoreNumbers, ignoreInnerCapitals, allowRaw],
  );

  const report = useMemo(
    () => (checker !== null && text.trim().length > 0 ? checkSpelling(text, checker, options) : null),
    [checker, text, options],
  );

  const summary = useMemo(() => (report ? formatSpellReport(report) : ""), [report]);
  const hasText = text.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste a draft. Words are looked up in the dictionary as you type — nothing leaves the browser."
        />
        <div className="mt-3">
          <TextInput
            name="allow"
            label="Words to accept"
            value={allowRaw}
            onChange={setAllowRaw}
            placeholder="Racira, Kubernetes, Nikhil"
            hint="comma separated"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <Checkbox name="acronyms" label="Skip ALL-CAPS words (API, NASA)" checked={ignoreAcronyms} onChange={setIgnoreAcronyms} />
          <Checkbox name="numbers" label="Skip words with digits (utf8, ISO8601)" checked={ignoreNumbers} onChange={setIgnoreNumbers} />
          <Checkbox name="brands" label="Skip camel-case brands (iPhone, GitHub)" checked={ignoreInnerCapitals} onChange={setIgnoreInnerCapitals} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={summary} testid="copy-summary" label="Copy report" />
          <DownloadButton text={summary} filename="spell-report.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Dictionary</PanelTitle>
        {loadState === "loading" && (
          <Notice>
            Loading the dictionary: `nspell` (MIT, ~41 KB) plus the `dictionary-en` en_US Hunspell data (MIT AND BSD, ~562
            KB), imported on this page only.
          </Notice>
        )}
        {loadState === "error" && (
          <Notice tone="error">
            The dictionary could not be loaded, so no word can be checked. {loadNote} Reload the page to try again — the
            rest of the tool needs no network.
          </Notice>
        )}
        {loadState === "ready" && <Notice>{loadNote}</Notice>}
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : report === null ? (
          <EmptyState>Waiting for the dictionary to finish loading…</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Unknown words"
              value={report.uniqueUnknown}
              testid="res-unknown"
              sub={`${report.totalUnknown} occurrences in ${report.checked} looked-up words`}
            />
            <StatGrid>
              <Stat label="Words checked" value={report.checked} testid="res-checked" />
              <Stat label="Tokens skipped" value={report.skipped} testid="res-skipped" />
              <Stat label="Suggestions computed" value={report.suggestBudget} testid="res-suggested" />
            </StatGrid>
          </>
        )}
      </Panel>

      {report !== null && report.misspellings.length > 0 && (
        <Panel>
          <PanelTitle>Unknown words</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-misspellings" className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Word</th>
                  <th className="py-2 pr-3 font-semibold">Times</th>
                  <th className="py-2 font-semibold">Suggestions (edit distance against the dictionary)</th>
                </tr>
              </thead>
              <tbody>
                {report.misspellings.map((entry) => (
                  <tr key={`${entry.normalized}-${entry.start}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-foreground">{entry.word}</td>
                    <td className="py-2 pr-3 text-muted-foreground">×{entry.count}</td>
                    <td className="py-2 text-muted-foreground">
                      {entry.suggestions.length > 0
                        ? entry.suggestions.join(", ")
                        : entry.suggestionsSkipped
                          ? "not computed — suggestion budget reached"
                          : "none"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.suggestSkipped > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Suggestions are computed for the first {SUGGESTION_BUDGET} distinct unknown words; {report.suggestSkipped}{" "}
              more were reported without them. At most {MAX_REPORTED} distinct words are listed.
            </p>
          )}
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this checker does and cannot do</PanelTitle>
        <div className="space-y-2">
          <Notice tone="warn">
            Names, jargon, brand names and code-like words are reported as unknown, because they are not in a general
            English dictionary. Racira, Kubernetes, Nikhil and localhost are all &quot;misspellings&quot; to this tool —
            add them under Words to accept rather than changing them.
          </Notice>
          <Notice tone="warn">
            The dictionary is the en_US one, so British spellings are reported: colour is unknown and suggests color,
            organise suggests organize. That is the dictionary talking, not a judgement — the Consistent Spelling Checker
            is the tool for reviewing US and UK spellings as a style choice.
          </Notice>
          <Notice>
            Suggestions are produced by walking character edits and keeping the candidates that exist in the dictionary —
            there is no hand-written correction table anywhere in this tool. The scanner skips {SPAN_SKIP_PATTERNS.length}{" "}
            kinds of code-like span (URLs, email addresses, Markdown links, file names, snake_case), words shorter than{" "}
            {MIN_SPELL_LENGTH} letters, and whichever of the three checkboxes above are ticked.
          </Notice>
          <Notice>
            It checks spelling only. It has no grammar, no punctuation and no sense of meaning: &quot;form&quot; and
            &quot;from&quot; are both correct words to it.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
