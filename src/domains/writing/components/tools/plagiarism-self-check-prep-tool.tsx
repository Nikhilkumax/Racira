"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
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
import { preparePlagiarismCheck } from "@/domains/writing/lib/text/plagiarism-prep.ts";

/**
 * Plagiarism self-check prep: quote hygiene and the checklist for submitting a
 * draft to a similarity service. It does not and cannot detect plagiarism.
 */
export default function PlagiarismSelfCheckPrepTool() {
  const [text, setText] = useState("");
  const result = useMemo(() => preparePlagiarismCheck(text), [text]);

  const prepText = result.report;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your draft</PanelTitle>
        <TextArea
          name="text"
          label="Draft"
          value={text}
          onChange={setText}
          rows={10}
          placeholder={'Paste the draft. Quotations are found whether they use straight (") or curly (“ ”) marks.'}
          hint="Plain text; the checker will compare content, not formatting."
        />
      </Panel>

      <Panel>
        <PanelTitle right={prepText ? <CopyButton text={prepText} testid="copy-report" /> : undefined}>
          Quotation report
        </PanelTitle>
        <HeroStat
          label="Quoted share"
          value={`${result.counts.quoteShare}%`}
          testid="res-quote-share"
          sub={`${result.quotes.length} quotation${result.quotes.length === 1 ? "" : "s"} found`}
        />
        <StatGrid>
          <Stat label="Words" value={result.counts.words} testid="res-words" />
          <Stat label="Citations" value={result.counts.citations} testid="res-citations" />
          <Stat label="Uncited" value={result.counts.uncited} testid="res-uncited" />
        </StatGrid>
        <div className="mt-3">
          <OutputBlock name="report" value={result.report} mono={false} />
        </div>
        <div className="mt-3">
          <DownloadButton text={prepText} filename="plagiarism-prep.txt" testid="download-report" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Before you submit to a checker</PanelTitle>
        <ul className="space-y-2" data-testid="res-checklist">
          {result.checklist.map((item) => (
            <li key={item}>
              <Notice>{item}</Notice>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {result.checks.length === 0 ? (
          <Notice>No documented problem: quotations are balanced, cited and within a proportionate share of the draft.</Notice>
        ) : (
          <ul className="space-y-2" data-testid="res-checks">
            {result.checks.map((check) => (
              <li key={check}>
                <Notice tone="warn">{check}</Notice>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            This page cannot detect plagiarism. Similarity detection means comparing your text against a corpus, which
            is a service, not a local script. What it checks is the preparation that decides what a similarity report
            will say: quotation marks that balance, citations close enough to follow, and quoted material kept in a
            proportionate share.
          </Notice>
          <Notice tone="warn">
            A high similarity score is a question, not a verdict. Read every flagged passage against its source before
            changing anything, and never use a checker as a substitute for citing.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
