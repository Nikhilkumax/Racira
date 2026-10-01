"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { analyzeDialogue, dialogueReport } from "@/domains/writing/lib/text/dialogue.ts";

const PROMPTS = [
  "Two people who used to be friends meet at a funeral. Neither mentions the reason they stopped speaking.",
  "One character is lying and the other knows it. Neither says so directly.",
  "A character asks for something they are afraid to want. The other answers a different question.",
  "Two people argue about something trivial while a serious decision is being avoided.",
  "One character has five words left before they leave. Make every one count.",
  "A negotiation where both people want the same thing and cannot admit it.",
  "Someone delivers good news that will ruin the person hearing it.",
  "Two characters disagree about what happened, and both are telling the truth.",
];

const SAMPLE = [
  'Mara: "We should turn back."',
  'Dev: "Not yet — the tide is with us."',
  'Mara: "The tide is the problem," she said quietly.',
].join("\n");

/**
 * Dialogue practice tool: a space to write dialogue from a prompt, with an
 * analysis of what you wrote — who speaks, how long each speech runs, which
 * attribution verbs you reached for and how many lines are questions. It
 * measures your draft; it does not rewrite it.
 */
export default function DialoguePracticeTool() {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [text, setText] = useState(SAMPLE);

  const report = useMemo(() => analyzeDialogue(text), [text]);
  const copy = useMemo(() => dialogueReport(report), [report]);
  const hasDialogue = report.lines > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle
          right={
            <Btn kind="ghost" testid="btn-prompt" onClick={() => setPrompt(PROMPTS[(PROMPTS.indexOf(prompt) + 1) % PROMPTS.length])}>
              Next prompt
            </Btn>
          }
        >
          Prompt
        </PanelTitle>
        <p data-testid="res-prompt" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
          {prompt}
        </p>
        <div className="mt-3">
          <TextArea
            name="dialogue"
            label="Write the exchange — one speech per line, as Name: &quot;speech&quot;"
            value={text}
            onChange={setText}
            rows={14}
            placeholder={'Mara: "We should turn back."\nDev: "Not yet."'}
            hint="quoted prose dialogue is read too"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Write directly here or paste a passage. Nothing is uploaded, and nothing is stored beyond this tab.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Your dialogue</PanelTitle>
        {!hasDialogue ? (
          <EmptyState>Write an exchange above — the analysis appears as you type.</EmptyState>
        ) : (
          <>
            <HeroStat label="Speeches" value={report.lines} testid="res-lines" sub={`${report.words} words`} />
            <StatGrid>
              <Stat label="Average speech" value={report.averageWords} testid="res-average" />
              <Stat label="Questions" value={report.questions} testid="res-questions" />
              <Stat label="Exclamations" value={report.exclamations} testid="res-exclamations" />
              <Stat label="Adverb tags" value={report.adverbTags} testid="res-adverbs" />
              <Stat label="Plain tags" value={report.plainTags} testid="res-plain-tags" />
              <Stat label="Narration lines" value={report.narrationLines} testid="res-narration" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasDialogue && (
        <>
          <Panel>
            <PanelTitle>Who speaks</PanelTitle>
            <ul data-testid="res-speakers" className="space-y-1 text-sm">
              {report.speakers.map((speaker) => (
                <li key={speaker.name} className="flex items-baseline justify-between gap-3 border-t border-border/60 pt-1 first:border-0 first:pt-0">
                  <span className="text-foreground">{speaker.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {speaker.lines} speech(es) · {speaker.words} words
                  </span>
                </li>
              ))}
            </ul>
            {report.longest && (
              <p className="mt-3 text-xs text-muted-foreground">
                Longest speech:{" "}
                <span data-testid="res-longest" className="font-mono text-foreground">
                  {report.longest.speaker}, {report.longest.words} words
                </span>
              </p>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Attribution verbs</PanelTitle>
            {report.bookisms.length === 0 ? (
              <Notice>Every attribution uses said, asked, replied or answered. Nothing to flag.</Notice>
            ) : (
              <ul data-testid="res-bookisms" className="space-y-1 text-sm">
                {report.bookisms.map((entry) => (
                  <li key={entry.verb} className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-foreground">{entry.verb}</span>
                    <span className="font-mono text-xs text-muted-foreground">×{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <CopyButton text={copy} testid="copy-report" label="Copy report" />
              <span className="ml-2 align-middle">
                <DownloadButton text={copy} filename="dialogue-report.txt" testid="download-report" label="Download" />
              </span>
            </div>
          </Panel>

          <Panel>
            <PanelTitle>Report</PanelTitle>
            <OutputBlock name="report" value={copy} maxHeight={220} mono={false} />
          </Panel>
        </>
      )}

      <Panel>
        <PanelTitle>How to read this</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Verbs other than said, asked, replied and answered are listed as &ldquo;said-bookisms&rdquo; — a long list is a
            prompt to check whether a character is hissing and breathing too often, not a rule that they may not. Adverb
            tags are counted for the same reason.
          </Notice>
          <Notice tone="warn">
            Speakers are found from a script prefix (<span className="font-mono">Name: &quot;speech&quot;</span>) or from a
            name immediately before an attribution verb; a name the tool cannot place is counted as unnamed. It measures
            your text, does not rewrite it and does not judge whether the dialogue is good.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
