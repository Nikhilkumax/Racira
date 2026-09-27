"use client";

import { useState } from "react";
import { CalcLayout, CodeOut, Panel, PanelTitle, RefTable, Res, ResBox, Sel, SliderNum, TextInput, fmtTrim } from "../ui";

/**
 * Font Loading Strategy Builder — plans how many fonts a page asks for and how
 * each one loads. The budget arithmetic is the part that matters: every extra
 * weight is a blocking request on the critical path, so the strategy states
 * which files are preloaded, which are deferred, and what happens when they are
 * slow or fail.
 */
export default function FontLoadingStrategyBuilder() {
  const [families, setFamilies] = useState("2");
  const [weights, setWeights] = useState("3");
  const [avgSize, setAvgSize] = useState("22");
  const [preload, setPreload] = useState("1");
  const [display, setDisplay] = useState("swap");
  const [subset, setSubset] = useState("latin");
  const [host, setHost] = useState("self");
  const [sample, setSample] = useState("/fonts/racira-sans-400.woff2");

  const f = Math.min(6, Math.max(1, Math.round(parseFloat(families) || 2)));
  const w = Math.min(9, Math.max(1, Math.round(parseFloat(weights) || 3)));
  const kb = Math.min(200, Math.max(8, parseFloat(avgSize) || 22));
  const pre = Math.min(w, Math.max(0, Math.round(parseFloat(preload) || 1)));
  const files = f * w;
  const totalKb = files * kb;
  const subsetFactor = subset === "latin" ? 0.35 : subset === "latin-ext" ? 0.55 : subset === "unicode-range" ? 0.4 : 1;
  const subsetKb = totalKb * subsetFactor;

  const html = [
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<!-- preload only what is used above the fold (${pre} of ${files} file(s)) -->`,
    ...Array.from({ length: pre }, (_, i) => `<link rel="preload" as="font" type="font/woff2" href="${sample.replace(/\.woff2$/, `-${300 + i * 100}.woff2`)}" crossorigin />`),
  ].join("\n");

  const css = `/* One @font-face per weight — each is a separate file the page must fetch. */
${Array.from({ length: w }, (_, i) => `@font-face {
  font-family: "Racira Sans";
  src: url("/fonts/racira-sans-${300 + i * 100}.woff2") format("woff2");
  font-weight: ${300 + i * 100};
  font-display: ${display};${subset === "unicode-range" ? "\n  unicode-range: U+0000-00FF, U+2000-206F, U+20AC;" : ""}
}`).join("\n\n")}

/* Defer the weights the first screen does not use. */
@media print { .deferred-fonts { font-family: serif; } }`;

  const verdict =
    files <= 2 && pre <= 1
      ? "lean — one or two files, one preloaded"
      : files <= 4
        ? "acceptable — keep the preload list to one or two files"
        : "heavy — consider consolidating weights or subsetting further";

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Budget</PanelTitle>
        <div className="space-y-3">
          <SliderNum name="families" label="Families" value={families} onChange={setFamilies} min={1} max={6} step={1} />
          <SliderNum name="weights" label="Weights per family" value={weights} onChange={setWeights} min={1} max={9} step={1} />
          <SliderNum name="size" label="Average file size" unit="KB" value={avgSize} onChange={setAvgSize} min={8} max={200} step={2} />
          <SliderNum name="preload" label="Files preloaded" value={preload} onChange={setPreload} min={0} max={6} step={1} />
          <Sel
            name="subset"
            label="Subsetting"
            value={subset}
            onChange={setSubset}
            options={[
              { value: "none", label: "None — ship the full character set" },
              { value: "latin", label: "Latin only (~35% of full size)" },
              { value: "latin-ext", label: "Latin extended (~55%)" },
              { value: "unicode-range", label: "Split with unicode-range (~40%)" },
            ]}
          />
          <Sel
            name="display"
            label="font-display"
            value={display}
            onChange={setDisplay}
            options={["swap", "block", "fallback", "optional", "auto"].map((v) => ({ value: v, label: v }))}
          />
          <Sel
            name="host"
            label="Hosting"
            value={host}
            onChange={setHost}
            options={[
              { value: "self", label: "Self-hosted (no third-party request)" },
              { value: "google", label: "Google Fonts" },
              { value: "cdn", label: "Other CDN" },
            ]}
          />
          <TextInput name="sample" label="Example font path" value={sample} onChange={setSample} />
        </div>
        <ResBox>
          <Res name="files" label="Font files requested" value={String(files)} />
          <Res name="raw" label="Total if unsubsetted" value={`${fmtTrim(totalKb, 0)} KB`} />
          <Res name="subset" label="After subsetting" value={`${fmtTrim(subsetKb, 0)} KB`} />
          <Res name="preload" label="Preloaded (blocking)" value={`${pre} file(s)`} />
          <Res name="verdict" label="Verdict" value={verdict} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {host === "self"
            ? "Self-hosting removes the third-party connection and gives you full control of caching and headers."
            : "A third-party host adds a DNS + TLS handshake on the critical path — preconnect is mandatory, and the service's uptime is on your page's critical path."}
        </p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Strategy table</PanelTitle>
          <RefTable
            cols={["Concern", "Decision", "Why"]}
            rows={[
              ["Above the fold", `preload ${pre} file(s)`, "preload is a hint that the request must start immediately"],
              ["Everything else", "normal discovery via @font-face", "unused weights should not compete with the critical path"],
              ["Swap period", `font-display: ${display}`, display === "swap" ? "readable text immediately, one re-render" : display === "block" ? "short blank period, no re-render" : "usable, but the font may never show on slow links"],
              ["Character set", subset === "none" ? "full" : subset, "subsetting is the single largest size reduction available"],
              ["Layout shift", "match fallback metrics with the override descriptors", "the fallback is what most first visits see"],
            ]}
            minWidth={640}
          />
        </Panel>

        <CodeOut code={html} title="HTML head" testid="loading-html" language="html" />
        <CodeOut code={css} title="@font-face set" testid="loading-css" />
      </div>
    </CalcLayout>
  );
}
