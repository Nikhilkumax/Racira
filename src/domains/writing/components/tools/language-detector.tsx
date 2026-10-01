"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  formatDetectionReport,
  detectLanguage,
  type LanguageDetection,
  type LanguageProfile,
} from "@/domains/writing/lib/text/language.ts";

/**
 * Language detector for Latin-script text.
 *
 * Scoring happens in `language.ts`; the profiles (function words, distinctive
 * letters and endings for twelve languages) are in `language-profiles.ts` and
 * are dynamic-imported here, so the data loads only on this page. The tool
 * states its refusals instead of guessing: short input returns "not enough
 * text", other scripts are reported as unsupported, and a close race between
 * two languages lowers the confidence band rather than hiding it.
 */
type LoadState = "loading" | "ready" | "error";

const CONFIDENCE_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function LanguageDetectorTool() {
  const [raw, setRaw] = useState("");
  const [profiles, setProfiles] = useState<readonly LanguageProfile[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadNote, setLoadNote] = useState("");

  const text = useDebouncedValue(raw, 250);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const module = await import("@/domains/writing/lib/text/language-profiles.ts");
        if (cancelled) return;
        setProfiles(module.LANGUAGE_PROFILES);
        setLoadState("ready");
        setLoadNote(
          `Profiles ready — ${module.LANGUAGE_PROFILES.length} Latin-script languages, loaded on this page only.`,
        );
      } catch (error) {
        if (cancelled) return;
        setLoadState("error");
        setLoadNote(error instanceof Error ? error.message : "The language profiles could not be loaded.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const detection = useMemo<LanguageDetection | null>(
    () => (profiles !== null && text.trim().length > 0 ? detectLanguage(text, profiles) : null),
    [profiles, text],
  );

  const report = useMemo(() => (detection ? formatDetectionReport(detection) : ""), [detection]);
  const hasText = text.trim().length > 0;
  const isOk = detection?.status === "ok" && detection.best !== null;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={9}
          placeholder={"The quick brown fox jumps over the lazy dog and the sleepy cat."}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={report} testid="copy-report" label="Copy report" />
          <DownloadButton text={report} filename="language-detection.txt" testid="download-report" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Detection</PanelTitle>
        {loadState === "loading" && (
          <Notice>
            Loading the language profiles (twelve Latin-script languages, hand-curated function words, letters and
            endings). The data is imported on this page only.
          </Notice>
        )}
        {loadState === "error" && (
          <Notice tone="error">
            The language profiles could not be loaded, so no detection is possible. {loadNote} Reload the page to try
            again — everything runs locally.
          </Notice>
        )}
        {loadState === "ready" && !hasText && <EmptyState>Start typing — a sentence or two is enough.</EmptyState>}
        {detection !== null && (
          <>
            <Notice tone={isOk ? "info" : "warn"}>
              <span data-testid="res-status">
                {isOk
                  ? `Detected ${detection.best?.name} with ${CONFIDENCE_LABELS[detection.confidence]} confidence.`
                  : detection.notes[0]}
              </span>
            </Notice>
            <div className="mt-3">
              <HeroStat
                label="Detected language"
                value={isOk ? detection.best?.name : "—"}
                testid="res-language"
                sub={
                  isOk && detection.best
                    ? `${detection.words} words · ${detection.latinLetters} letters · strongest signals: words ${detection.best.stopwordHits}, letters ${detection.best.characterHits}, endings ${detection.best.endingHits}`
                    : undefined
                }
              />
            </div>
            <StatGrid>
              <Stat label="Confidence" value={isOk ? CONFIDENCE_LABELS[detection.confidence] : "—"} testid="res-confidence" />
              <Stat label="Words" value={detection.words} testid="res-words" />
              <Stat label="Letters" value={detection.latinLetters} testid="res-letters" />
            </StatGrid>
          </>
        )}
      </Panel>

      {isOk && detection && (
        <Panel>
          <PanelTitle
            right={
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                top {Math.min(6, detection.scores.length)} of {detection.scores.length}
              </span>
            }
          >
            Score table
          </PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-scores" className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Language</th>
                  <th className="py-2 pr-3 font-semibold">Score</th>
                  <th className="py-2 pr-3 font-semibold">Function words</th>
                  <th className="py-2 pr-3 font-semibold">Letters</th>
                  <th className="py-2 font-semibold">Endings</th>
                </tr>
              </thead>
              <tbody>
                {detection.scores.slice(0, 6).map((score) => (
                  <tr
                    key={score.code}
                    className={`border-t border-border/60 ${score.code === detection.best?.code ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-2 pr-3 text-foreground">{score.name}</td>
                    <td className="py-2 pr-3 font-mono text-foreground">{score.score}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{score.stopwordHits}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{score.characterHits}</td>
                    <td className="py-2 font-mono text-muted-foreground">{score.endingHits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {detection.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this does and cannot do</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The profile table itself is shown above: every point comes from a listed function word, a distinctive
            letter, or a characteristic ending. There is no model, no network call and no stored text — the profiles
            load in the browser and your input never leaves it.
          </Notice>
          <Notice tone="warn">
            Short samples are refused rather than guessed: at least 5 words and 24 letters are required, and the result
            is reported with a confidence band. Text that is mostly another script (Cyrillic, Han, Arabic, …) is
            reported as unsupported, because only Latin-script languages are profiled.
          </Notice>
          <Notice tone="warn">
            Closely related languages are deliberately narrowed to one profile per pair — Swedish but not Danish or
            Norwegian, Czech but not Slovak — because scoring cannot separate them reliably. Proper nouns, loanwords,
            and text that switches language midway can still mislead any profile scorer.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
