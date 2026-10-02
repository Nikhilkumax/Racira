"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  TextInput,
} from "./ui";
import { buildCtaVariants } from "@/domains/writing/lib/text/cta-copy.ts";

/**
 * CTA button copy generator: five short label variants from a verb, an object
 * and the benefit behind the click, with checks for weak or overlong wording.
 */
export default function CtaButtonCopyGenerator() {
  const [verb, setVerb] = useState("");
  const [object, setObject] = useState("");
  const [benefit, setBenefit] = useState("");

  const draft = useMemo(() => buildCtaVariants({ verb, object, benefit }), [verb, object, benefit]);
  const hasParts = verb.trim().length > 0 || object.trim().length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>The click</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput name="verb" label="Verb" value={verb} onChange={setVerb} placeholder="Download" />
          <TextInput name="object" label="What they get" value={object} onChange={setObject} placeholder="the rota template" />
          <TextInput name="benefit" label="Benefit behind the click" value={benefit} onChange={setBenefit} placeholder="start this week" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Variants</PanelTitle>
        {!hasParts ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Enter a verb and what the click gets — the variants build as you type.
          </p>
        ) : (
          <>
            <HeroStat label="Variants" value={draft.variants.length} testid="res-count" sub="same click, five ways" />
            <ul data-testid="res-variants" className="space-y-2">
              {draft.variants.map((variant, index) => (
                <li key={variant} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                  <span className="text-sm text-foreground">{variant}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{draft.words[index]}w</span>
                    <CopyButton text={variant} testid={`copy-variant-${index + 1}`} label="Copy" />
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Checks</PanelTitle>
        {draft.checks.length === 0 ? (
          <Notice>
            {hasParts ? "No structural issues found. Save the one that sounds least like a button." : "Checks appear once there is a click to describe."}
          </Notice>
        ) : (
          <ul data-testid="res-checks" className="space-y-2">
            {draft.checks.map((check) => (
              <li
                key={check.id}
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
            The generator composes five fixed patterns from your three parts and checks the wording. It knows nothing
            about the page the button sits on, which is most of what makes a label work.
          </Notice>
          <Notice tone="warn">
            A CTA promises what happens after the click. Keep the label honest: if the button says start, the next
            screen should start something.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
