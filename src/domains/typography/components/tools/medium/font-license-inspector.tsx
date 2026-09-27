"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, Sel, TextInput } from "../ui";

interface License {
  name: string;
  spdx: string;
  embedWeb: string;
  embedApp: string;
  modify: string;
  redistribute: string;
  attribution: string;
  note: string;
}

const LICENSES: License[] = [
  {
    name: "SIL Open Font License 1.1",
    spdx: "OFL-1.1",
    embedWeb: "yes",
    embedApp: "yes",
    modify: "yes (derivatives must use a different reserved name)",
    redistribute: "yes, with the licence and copyright notice",
    attribution: "keep the notice; the licence must travel with the font",
    note: "The licence of most Google Fonts. Compatible with commercial use; the font itself may not be sold on its own.",
  },
  {
    name: "Apache License 2.0",
    spdx: "Apache-2.0",
    embedWeb: "yes",
    embedApp: "yes",
    modify: "yes",
    redistribute: "yes, with the licence, notice and change statements",
    attribution: "keep NOTICE file and state modifications",
    note: "Common for fonts released by companies; permissive with an explicit patent grant.",
  },
  {
    name: "Ubuntu Font Licence 1.0",
    spdx: "Ubuntu-font-1.0",
    embedWeb: "yes",
    embedApp: "yes",
    modify: "yes, but derivatives cannot use the reserved name",
    redistribute: "yes, with the licence",
    attribution: "keep the notice",
    note: "OFL-style terms specific to the Ubuntu family.",
  },
  {
    name: "MIT / Expat",
    spdx: "MIT",
    embedWeb: "yes",
    embedApp: "yes",
    modify: "yes",
    redistribute: "yes, with the copyright and licence text",
    attribution: "keep the notice",
    note: "Rare for fonts but occasionally used for small open-source releases.",
  },
  {
    name: "Freeware / unknown terms",
    spdx: "—",
    embedWeb: "check the readme",
    embedApp: "check the readme",
    modify: "usually no",
    redistribute: "usually no",
    attribution: "as stated",
    note: "A download being free does not grant redistribution or webfont embedding rights.",
  },
  {
    name: "Commercial / desktop-licensed",
    spdx: "—",
    embedWeb: "usually an extra webfont licence",
    embedApp: "usually a separate app-embedding licence",
    modify: "no",
    redistribute: "no",
    attribution: "per the EULA",
    note: "Desktop licences typically cover design use only; serving the font to browsers needs its own licence.",
  },
];

interface AuditItem {
  id: string;
  question: string;
  why: string;
}

const AUDIT: AuditItem[] = [
  { id: "source", question: "Is the font's source recorded (foundry, URL, download date)?", why: "A licence claim is worthless without knowing exactly which release it applies to." },
  { id: "terms", question: "Is the licence file stored beside the font files?", why: "Most licences require the notice to travel with the font, including in a repository." },
  { id: "web", question: "Does the licence explicitly allow webfont serving?", why: "The right to self-host differs from the right to serve; some permissive-looking fonts restrict web embedding." },
  { id: "app", question: "Does the licence allow app embedding if the font ships in a mobile build?", why: "App embedding is often a separate grant from desktop use." },
  { id: "subset", question: "Does the licence allow modification and subsetting?", why: "Subsetting modifies the file; some licences restrict modified versions." },
  { id: "rename", question: "If modified, has the font been renamed as required?", why: "Reserved font names are protected by OFL-style clauses." },
  { id: "attribution", question: "Is the attribution shown where the licence requires it?", why: "Some licences require credit in the product's about screen or documentation." },
  { id: "proof", question: "Is the licence reference recorded in the project's asset manifest?", why: "Future contributors need to know the terms without re-researching them." },
];

/**
 * Font License Inspector — a reference for the terms of the licences fonts are
 * actually released under, plus an audit checklist for the fonts already in a
 * project. It does not read the licence out of a font binary: terms live in the
 * accompanying licence file, so the tool's job is to state what each licence
 * permits and to make the audit auditable.
 */
export default function FontLicenseInspector() {
  const [licenseIdx, setLicenseIdx] = useState("0");
  const [font, setFont] = useState("Racira Sans");
  const [checked, setChecked] = useState<string[]>([]);

  const license = LICENSES[Number(licenseIdx) % LICENSES.length];
  const done = checked.length;

  const toggle = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const manifest = `/* ${font} — font asset manifest entry */
{
  "family": "${font}",
  "source": "<foundry or URL>",
  "version": "<release/date>",
  "license": "${license.name} (${license.spdx === "—" ? "see licence file" : license.spdx})",
  "webfontAllowed": ${license.embedWeb === "yes" ? "true" : "false"},
  "appEmbeddingAllowed": ${license.embedApp === "yes" ? "true" : "false"},
  "modificationAllowed": ${license.modify.startsWith("yes") ? "true" : "false"},
  "licenseFile": "assets/fonts/${font.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/LICENSE.txt"
}`;

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Licence terms</PanelTitle>
        <Sel
          name="license"
          label="Licence"
          value={licenseIdx}
          onChange={setLicenseIdx}
          options={LICENSES.map((l, i) => ({ value: String(i), label: l.name }))}
        />
        <div className="mt-3">
          <TextInput name="font" label="Font being audited" value={font} onChange={setFont} />
        </div>
        <ResBox>
          <Res name="spdx" label="SPDX identifier" value={license.spdx} />
          <Res name="web" label="Webfont serving" value={license.embedWeb} />
          <Res name="app" label="App embedding" value={license.embedApp} />
          <Res name="modify" label="Modification / subsetting" value={license.modify} />
          <Res name="attribution" label="Attribution" value={license.attribution} />
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{license.note}</p>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Comparison</PanelTitle>
          <RefTable
            cols={["Licence", "Webfont", "App embed", "Modify", "Redistribute"]}
            rows={LICENSES.map((l, i) => [
              <button key="n" type="button" onClick={() => setLicenseIdx(String(i))} className="text-left underline decoration-dotted underline-offset-2 hover:text-primary">
                {l.name}
              </button>,
              l.embedWeb,
              l.embedApp,
              l.modify.startsWith("yes") ? "yes" : l.modify,
              l.redistribute,
            ])}
            minWidth={680}
          />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            This is a reference for the licence families, not legal advice, and licences get amended: read the actual
            LICENSE file that shipped with the font. The comparison exists to make clear which questions to ask it.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Audit checklist for {font}</PanelTitle>
          <RefTable
            cols={["", "Question", "Why it matters"]}
            rows={AUDIT.map((item) => [
              <input
                key="c"
                type="checkbox"
                checked={checked.includes(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={item.question}
                className="mt-0.5 h-4 w-4 accent-primary"
              />,
              item.question,
              item.why,
            ])}
            minWidth={640}
          />
          <ResBox>
            <Res name="progress" label="Checklist progress" value={`${done} / ${AUDIT.length}`} />
            <Res
              name="status"
              label="Status"
              value={done === AUDIT.length ? "audit complete" : done > AUDIT.length / 2 ? "in progress" : "not yet audited"}
            />
          </ResBox>
        </Panel>

        <Panel>
          <PanelTitle>Manifest entry</PanelTitle>
          <pre className="overflow-x-auto rounded-xl border border-border bg-card/40 p-4 text-xs leading-relaxed text-foreground">
            <code>{manifest}</code>
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Storing the terms next to the font is what prevents the same research being repeated — and repeated wrongly — the
            next time the asset is touched.
          </p>
        </Panel>
      </div>
    </CalcLayout>
  );
}
