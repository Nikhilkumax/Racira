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
  Stat,
  StatGrid,
  StackLayout,
  TextArea,
  TextInput,
} from "./ui";
import { buildFaqSection, parseFaqItems } from "@/domains/writing/lib/text/faq.ts";

/**
 * FAQ generator: a topic and question | answer lines become a formatted FAQ
 * section, with checks for duplicates, missing answers and coverage.
 */
export default function FaqGenerator() {
  const [topic, setTopic] = useState("");
  const [itemsText, setItemsText] = useState("");

  const items = useMemo(() => parseFaqItems(itemsText.split("\n")), [itemsText]);
  const draft = useMemo(() => buildFaqSection({ topic, items }), [topic, items]);
  const hasParts = topic.trim().length > 0 || items.length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">question | answer</span>}>
          The questions
        </PanelTitle>
        <div className="grid gap-3">
          <TextInput name="topic" label="Topic" value={topic} onChange={setTopic} placeholder="refunds" />
          <TextArea
            name="items"
            label="Questions and answers — one per line"
            value={itemsText}
            onChange={setItemsText}
            rows={6}
            placeholder={"How long does a refund take? | Up to ten working days.\nCan I get a refund after 30 days? | Only if the item is faulty.\nWhat do I need to send? | The order number and a photo of the item."}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasParts ? (
              <span className="flex items-center gap-2">
                <CopyButton text={draft.section} testid="copy-section" label="Copy" />
                <DownloadButton text={draft.section} filename="faq.txt" testid="download-section" label="Download" />
              </span>
            ) : undefined
          }
        >
          FAQ section
        </PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Name the topic and add a few questions — the section builds as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Words" value={draft.words} testid="res-words" sub="the section as it will ship" />
            <StatGrid>
              <Stat label="Questions" value={draft.questions} testid="res-questions" />
              <Stat
                label="Answered"
                value={`${items.filter((item) => item.answer).length}/${items.length}`}
                testid="res-answered"
              />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="section" value={draft.section} maxHeight={460} mono={false} />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>No structural issues found. Whether the answers are right is still your responsibility.</Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={`${check.id}-${check.message}`}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
              >
                {check.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The generator formats your questions and answers into a section and checks the coverage: at least three
            questions, no duplicates, an answer under each and one question phrased the way a reader would type it.
          </Notice>
          <Notice tone="warn">
            It writes no answers and knows nothing about your product. Placeholder text marked TODO is a reminder to
            finish the section, not something to publish.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
