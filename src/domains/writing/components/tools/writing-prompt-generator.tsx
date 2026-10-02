"use client";

import { useMemo, useState } from "react";
import { Btn, HeroStat, Notice, Panel, PanelTitle, Select, StackLayout } from "./ui";
import { PROMPT_CATEGORIES, nextPromptOffset, promptPage } from "@/domains/writing/lib/text/writing-prompt.ts";

/**
 * Writing prompt generator: a fixed, authored bank of prompts served three at a
 * time in a stable order — no randomness, so every writer sees the same list.
 */
export default function WritingPromptGenerator() {
  const [categoryId, setCategoryId] = useState(PROMPT_CATEGORIES[0].id);
  const [offset, setOffset] = useState(0);

  const page = useMemo(() => promptPage(categoryId, offset), [categoryId, offset]);

  const changeCategory = (value: string) => {
    setCategoryId(value);
    setOffset(0);
  };

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Category</PanelTitle>
        <Select
          name="category"
          label="What kind of prompt"
          value={categoryId}
          onChange={changeCategory}
          options={PROMPT_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
        />
        <div className="mt-3 flex items-center gap-2">
          <Btn testid="btn-next" onClick={() => setOffset(nextPromptOffset(categoryId, offset))}>
            Next three
          </Btn>
          <Btn kind="ghost" testid="btn-reset" onClick={() => setOffset(0)}>
            Back to the start
          </Btn>
        </div>
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">fixed order, no shuffle</span>}>
          Prompts
        </PanelTitle>
        <HeroStat label="Prompts in this bank" value={page.total} testid="res-count" sub={`page ${Math.floor(page.offset / 3) + 1}`} />
        <ul data-testid="res-prompts" className="space-y-2">
          {page.prompts.map((prompt) => (
            <li key={prompt} className="rounded-lg border border-border bg-card/40 px-3 py-2 text-sm text-foreground">
              {prompt}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The bank is authored and finite — six prompts per category — and the next-three button cycles through it in
            a fixed order. Nothing is generated and nothing is random, so a prompt you liked will be there when you
            come back.
          </Notice>
          <Notice tone="warn">
            A prompt is a starting point, not an assignment. If one does not catch, skip it; the purpose of the bank is
            to get words on the page, and the words can be thrown away.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
