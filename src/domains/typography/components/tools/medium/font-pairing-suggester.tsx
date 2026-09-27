"use client";

import { useMemo, useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, TextInput } from "../ui";
import { FONTS } from "../fonts";

type Brief = "editorial" | "product" | "brand" | "technical" | "warm";

const KIND_SCORE: Record<Brief, (kind: string) => number> = {
  editorial: (k) => (k === "serif" ? 3 : k === "sans" ? 1 : 0),
  product: (k) => (k === "sans" ? 3 : k === "mono" ? 2 : 0),
  brand: (k) => (k === "display" ? 3 : k === "serif" ? 2 : k === "sans" ? 1 : 0),
  technical: (k) => (k === "mono" ? 3 : k === "sans" ? 2 : 0),
  warm: (k) => (k === "serif" ? 2 : k === "sans" ? 2 : k === "display" ? 1 : 0),
};

interface Suggestion {
  heading: string;
  body: string;
  why: string;
  score: number;
}

/**
 * Font Pairing Suggester — a rule-based scorer over the preview catalog. It
 * scores candidate pairs on three rules that hold up in practice: the two faces
 * must differ in classification (so the roles are distinguishable), the heading
 * face must be the more expressive of the two, and a technical brief needs a
 * monospace partner. The rules are shown, so the suggestions can be argued with.
 */
export default function FontPairingSuggester() {
  const [brief, setBrief] = useState<Brief>("editorial");
  const [heading, setHeading] = useState("Choose a pairing in minutes");
  const [body, setBody] = useState(
    "The suggestion engine ranks every heading/body combination in the preview catalog by three rules and shows its reasoning, so a shortlist can be tested instead of guessed.",
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    const out: Suggestion[] = [];
    for (const h of FONTS) {
      for (const b of FONTS) {
        if (h.name === b.name) continue;
        let score = 0;
        const reasons: string[] = [];
        if (h.kind !== b.kind) {
          score += 3;
          reasons.push("different classifications, so the roles read apart");
        }
        score += KIND_SCORE[brief](h.kind);
        if (KIND_SCORE[brief](h.kind) >= 2) reasons.push(`${h.kind} heading suits a ${brief} brief`);
        if (h.kind === "mono" && brief !== "technical") score -= 2;
        if (h.kind === "display" && h.name !== "Bebas Neue") score += 1;
        out.push({
          heading: h.name,
          body: b.name,
          why: reasons.join(" · ") || "same classification — differentiate by weight instead",
          score,
        });
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [brief]);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Brief</PanelTitle>
        <Sel
          name="brief"
          label="What the page is for"
          value={brief}
          onChange={(v) => setBrief(v as Brief)}
          options={[
            { value: "editorial", label: "Editorial / long-form reading" },
            { value: "product", label: "Product UI / dashboard" },
            { value: "brand", label: "Brand / marketing" },
            { value: "technical", label: "Technical / documentation" },
            { value: "warm", label: "Warm / humanist" },
          ]}
        />
        <div className="mt-3 space-y-3">
          <TextInput name="heading" label="Heading sample" value={heading} onChange={setHeading} />
          <TextInput name="body" label="Body sample" value={body} onChange={setBody} />
        </div>
        <ResBox>
          <Res name="candidates" label="Combinations scored" value={String(FONTS.length * (FONTS.length - 1))} />
          <Res name="rules" label="Rules applied" value="classification difference · brief fit · mono only where useful" />
          <Res name="top" label="Top suggestion" value={`${suggestions[0]?.heading} + ${suggestions[0]?.body}`} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          A suggester is a shortlist machine, not an oracle: it removes the combinations that fail structurally and leaves
          the choice to the preview.
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Ranked shortlist</PanelTitle>
          <RefTable
            cols={["Heading face", "Body face", "Score", "Why it ranked"]}
            rows={suggestions.map((s) => {
              const h = FONTS.find((f) => f.name === s.heading);
              const b = FONTS.find((f) => f.name === s.body);
              return [
                <button
                  key="h"
                  type="button"
                  onClick={() => {
                    setHeading(`${s.heading} — heading sample`);
                    setBody(`Body sample set in ${s.body}, measured in the preview below.`);
                  }}
                  className="underline decoration-dotted underline-offset-2 hover:text-primary"
                  style={{ fontFamily: h?.stack }}
                >
                  {s.heading}
                </button>,
                s.body,
                String(s.score),
                s.why,
              ];
            })}
            minWidth={620}
            note="Click a heading face to load the pair into the preview."
          />
        </Panel>

        <Panel>
          <PanelTitle>Preview top three</PanelTitle>
          <div className="space-y-5" data-testid="suggester-preview">
            {suggestions.slice(0, 3).map((s) => {
              const h = FONTS.find((f) => f.name === s.heading)!;
              const b = FONTS.find((f) => f.name === s.body)!;
              return (
                <div key={`${s.heading}-${s.body}`} className="border-b border-border/40 pb-4 last:border-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {s.heading} + {s.body} · score {s.score}
                  </span>
                  <h4 className="mt-1 text-2xl leading-tight text-foreground" style={{ fontFamily: h.stack, fontWeight: 700 }}>
                    {heading}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85" style={{ fontFamily: b.stack }}>
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        <CodeOut
          title="How the score is built"
          language="ts"
          testid="suggester-rules"
          code={`// each candidate pair is scored, then sorted descending
score = 0
if (heading.kind !== body.kind) score += 3      // roles must read apart
score += briefFit(heading.kind)                 // serif for editorial, sans for product…
if (heading.kind === "mono" && brief !== "technical") score -= 2
if (heading.kind === "display") score += 1      // display faces are expressive by design`}
        />
      </div>
    </CalcLayout>
  );
}
