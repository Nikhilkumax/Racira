"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, Radios, Res, ResBox, SliderNum, TextArea, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

const STORY =
  "Newspaper typography is governed by the fold: what is above it has to sell the paper, and what is below it has to be readable at arm's length on rough paper. Headlines are set tight and heavy, body text is set small on a tight leading, and the rules between stories carry more of the separation than white space does.";

type HeadStyle = "banner" | "stacked" | "ribbon";

/**
 * Newspaper Typography Previewer — renders a broadsheet story unit: banner
 * headline, deck, byline, rule, multi-column body. The controls that matter are
 * the headline size relative to the body, the leading (newspapers run tight,
 * around 1.15–1.25) and the rule weights, which do the structural work when
 * white space is scarce.
 */
export default function NewspaperTypographyPreviewer() {
  const [headline, setHeadline] = useState("Presses roll as the type scale tightens");
  const [deck, setDeck] = useState("Editors trim leading and widen columns to fit the day's news");
  const [byline, setByline] = useState("By A. Editor · Typography Desk");
  const [body, setBody] = useState(STORY);
  const [headStyle, setHeadStyle] = useState<HeadStyle>("banner");
  const [headPt, setHeadPt] = useState("36");
  const [bodyPt, setBodyPt] = useState("9.5");
  const [leading, setLeading] = useState("11.5");
  const [columns, setColumns] = useState("3");
  const [rule, setRule] = useState("thin");

  const hp = Math.max(12, parseFloat(headPt) || 36);
  const bp = Math.max(6, parseFloat(bodyPt) || 9.5);
  const lead = Math.max(8, parseFloat(leading) || 11.5);
  const cols = Math.min(5, Math.max(1, Math.round(parseFloat(columns) || 3)));
  const ratio = hp / bp;

  const css = `.story h1 {
  font-family: ${FONTS.find((f) => f.name === "Roboto Slab")?.stack ?? "serif"};
  font-size: ${fmtTrim(hp, 1)}pt;
  line-height: 1.02;
  letter-spacing: -0.01em;
  ${headStyle === "stacked" ? "text-transform: uppercase;" : ""}
}

.story .deck { font-size: ${fmtTrim(bp * 1.6, 2)}pt; line-height: 1.25; }
.story .byline { font-size: ${fmtTrim(bp * 1.05, 2)}pt; letter-spacing: 0.06em; text-transform: uppercase; }
.story .body { font-size: ${bp}pt; line-height: ${lead}pt; column-count: ${cols}; column-gap: 4mm; hyphens: auto; text-align: justify; }
.story .rule { border-top: ${rule === "hairline" ? "0.5" : rule === "thin" ? "1" : "3"}px solid currentColor; }`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Story settings</PanelTitle>
        <div className="space-y-3">
          <TextInput name="headline" label="Headline" value={headline} onChange={setHeadline} />
          <TextInput name="deck" label="Deck / standfirst" value={deck} onChange={setDeck} />
          <TextInput name="byline" label="Byline" value={byline} onChange={setByline} />
          <Radios
            name="headStyle"
            value={headStyle}
            onChange={(v) => setHeadStyle(v as HeadStyle)}
            ariaLabel="headline style"
            options={[
              { value: "banner", label: "Banner (sentence case)" },
              { value: "stacked", label: "Stacked caps" },
              { value: "ribbon", label: "Ribbon (rule above)" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <SliderNum name="head" label="Headline" unit="pt" value={headPt} onChange={setHeadPt} min={12} max={84} step={1} />
            <SliderNum name="body" label="Body" unit="pt" value={bodyPt} onChange={setBodyPt} min={6} max={14} step={0.25} />
            <SliderNum name="lead" label="Leading" unit="pt" value={leading} onChange={setLeading} min={8} max={20} step={0.25} />
            <SliderNum name="cols" label="Columns" value={columns} onChange={setColumns} min={1} max={5} step={1} />
          </div>
          <Radios
            name="rule"
            value={rule}
            onChange={setRule}
            ariaLabel="rule weight"
            options={[
              { value: "hairline", label: "Hairline" },
              { value: "thin", label: "Thin" },
              { value: "thick", label: "Thick" },
            ]}
          />
          <TextArea name="body" label="Story copy" value={body} onChange={setBody} rows={4} />
        </div>
        <ResBox>
          <Res name="ratio" label="Headline ÷ body" value={`${fmtTrim(ratio, 2)}×`} />
          <Res name="lead" label="Leading ratio" value={`${fmtTrim(lead / bp, 3)}× — newspapers run 1.15–1.25`} />
          <Res name="preview" label="Paper look" value={ratio < 3 ? "magazine-ish; raise the headline" : "broadsheet scale"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Story unit</PanelTitle>
          <div className="rounded-lg border border-border bg-[#faf8f3] p-4 text-neutral-900">
            {headStyle === "ribbon" && <div className="mb-2 border-t-4 border-neutral-900" />}
            <h3
              data-testid="newspaper-headline"
              style={{
                fontFamily: FONTS.find((f) => f.name === "Roboto Slab")?.stack,
                fontSize: `${hp}pt`,
                lineHeight: 1.02,
                letterSpacing: "-0.01em",
                textTransform: headStyle === "stacked" ? "uppercase" : "none",
              }}
            >
              {headline || "Headline"}
            </h3>
            <p className="mt-1 text-neutral-700" style={{ fontFamily: FONTS[0].stack, fontSize: `${bp * 1.6}pt`, lineHeight: 1.25 }}>
              {deck}
            </p>
            <div className="my-2 flex items-center gap-3">
              <span
                className="uppercase text-neutral-600"
                style={{ fontFamily: FONTS[0].stack, fontSize: `${bp * 1.05}pt`, letterSpacing: "0.06em" }}
              >
                {byline}
              </span>
            </div>
            <div className={rule === "hairline" ? "border-t border-neutral-900/60" : rule === "thin" ? "border-t-2 border-neutral-900" : "border-t-4 border-neutral-900"} />
            <p
              className="mt-2 text-neutral-900"
              style={{
                fontFamily: FONTS[3].stack,
                fontSize: `${bp}pt`,
                lineHeight: `${lead}pt`,
                columnCount: cols,
                columnGap: "4mm",
                textAlign: "justify",
                hyphens: "auto",
              }}
            >
              {body || STORY}
              <br />
              <br />
              A second column of copy continues the story under the same rule, with the column bottoms ragged rather than
              balanced — that raggedness is itself a newspaper signal.
            </p>
          </div>
        </Panel>
        <CodeOut code={css} testid="newspaper-css" />
      </div>
    </CalcLayout>
  );
}
