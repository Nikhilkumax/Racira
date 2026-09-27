"use client";

import { useState } from "react";
import { CopyBtn, Panel, PanelTitle, RefTable, Sel, TextInput } from "../ui";

interface Group {
  name: string;
  chars: { ch: string; name: string; entity?: string }[];
}

const GROUPS: Group[] = [
  {
    name: "Typography punctuation",
    chars: [
      { ch: "—", name: "Em dash", entity: "&mdash; / &#8212;" },
      { ch: "–", name: "En dash", entity: "&ndash; / &#8211;" },
      { ch: "…", name: "Ellipsis", entity: "&hellip; / &#8230;" },
      { ch: "•", name: "Bullet", entity: "&bull; / &#8226;" },
      { ch: "·", name: "Middle dot", entity: "&middot; / &#183;" },
      { ch: "§", name: "Section sign", entity: "&sect; / &#167;" },
      { ch: "¶", name: "Pilcrow", entity: "&para; / &#182;" },
      { ch: "†", name: "Dagger", entity: "&dagger; / &#8224;" },
      { ch: "‡", name: "Double dagger", entity: "&Dagger; / &#8225;" },
    ],
  },
  {
    name: "Quotes & primes",
    chars: [
      { ch: "“", name: "Left double quote", entity: "&ldquo; / &#8220;" },
      { ch: "”", name: "Right double quote", entity: "&rdquo; / &#8221;" },
      { ch: "‘", name: "Left single quote", entity: "&lsquo; / &#8216;" },
      { ch: "’", name: "Right single quote / apostrophe", entity: "&rsquo; / &#8217;" },
      { ch: "′", name: "Prime (feet, minutes)", entity: "&prime; / &#8242;" },
      { ch: "″", name: "Double prime (inches, seconds)", entity: "&Prime; / &#8243;" },
      { ch: "«", name: "Left guillemet", entity: "&laquo; / &#171;" },
      { ch: "»", name: "Right guillemet", entity: "&raquo; / &#187;" },
      { ch: "‹", name: "Single left guillemet", entity: "&lsaquo; / &#8249;" },
    ],
  },
  {
    name: "Legal, math & units",
    chars: [
      { ch: "©", name: "Copyright", entity: "&copy; / &#169;" },
      { ch: "®", name: "Registered", entity: "&reg; / &#174;" },
      { ch: "™", name: "Trademark", entity: "&trade; / &#8482;" },
      { ch: "°", name: "Degree", entity: "&deg; / &#176;" },
      { ch: "±", name: "Plus-minus", entity: "&plusmn; / &#177;" },
      { ch: "×", name: "Multiplication sign", entity: "&times; / &#215;" },
      { ch: "÷", name: "Division sign", entity: "&divide; / &#247;" },
      { ch: "≈", name: "Almost equal", entity: "&asymp; / &#8776;" },
      { ch: "≠", name: "Not equal", entity: "&ne; / &#8800;" },
      { ch: "µ", name: "Micro sign", entity: "&micro; / &#181;" },
      { ch: "Ω", name: "Ohm sign", entity: "&Omega; / &#937;" },
      { ch: "€", name: "Euro", entity: "&euro; / &#8364;" },
    ],
  },
  {
    name: "Arrows & marks",
    chars: [
      { ch: "→", name: "Rightwards arrow", entity: "&rarr; / &#8594;" },
      { ch: "←", name: "Leftwards arrow", entity: "&larr; / &#8592;" },
      { ch: "↑", name: "Upwards arrow", entity: "&uarr; / &#8593;" },
      { ch: "↓", name: "Downwards arrow", entity: "&darr; / &#8595;" },
      { ch: "↔", name: "Left-right arrow", entity: "&harr; / &#8596;" },
      { ch: "✓", name: "Check mark", entity: "&check; / &#10003;" },
      { ch: "★", name: "Black star", entity: "&#9733;" },
      { ch: "♥", name: "Heart suit", entity: "&hearts; / &#9829;" },
    ],
  },
];

/**
 * Special Character Picker — the characters typists actually need but cannot
 * find on a keyboard: dashes, real quotes, primes, legal marks, units and
 * arrows. Each entry is copyable and carries both its named entity and numeric
 * reference so it can be dropped into HTML, Markdown or plain text safely.
 */
export default function SpecialCharacterPicker() {
  const [group, setGroup] = useState(GROUPS[0].name);
  const [custom, setCustom] = useState("");
  const [query, setQuery] = useState("");

  const active = GROUPS.find((g) => g.name === group) ?? GROUPS[0];
  const filtered = query.trim()
    ? active.chars.filter((c) => (c.name + c.ch + (c.entity ?? "")).toLowerCase().includes(query.trim().toLowerCase()))
    : active.chars;

  const all = GROUPS.flatMap((g) => g.chars);
  const readout = [custom, ...filtered.map((c) => c.ch)].join("");

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Pick characters</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <Sel
            name="group"
            label="Character group"
            value={group}
            onChange={setGroup}
            options={GROUPS.map((g) => ({ value: g.name, label: `${g.name} (${g.chars.length})` }))}
          />
          <TextInput name="query" label="Filter" value={query} onChange={setQuery} placeholder="dash, quote, arrow…" />
          <TextInput name="custom" label="Build a string" value={custom} onChange={setCustom} placeholder="type here…" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CopyBtn text={readout} label="Copy string" testid="special-copy" />
          <span className="text-xs text-muted-foreground">
            {all.length} characters catalogued · {filtered.length} shown
          </span>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-background p-3 font-mono text-sm break-all text-foreground" data-testid="special-readout">
          {readout || "(nothing selected)"}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>{group}</PanelTitle>
        <RefTable
          cols={["", "Character", "Name", "HTML entity / numeric", ""]}
          rows={filtered.map((c) => [
            <button
              key="add"
              type="button"
              onClick={() => setCustom((v) => v + c.ch)}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              add
            </button>,
            <span key="ch" className="font-mono text-lg">
              {c.ch}
            </span>,
            c.name,
            <code key="ent" className="font-mono text-[11px] text-muted-foreground">
              {c.entity ?? "—"}
            </code>,
            <CopyBtn key="copy" text={c.ch} label="Copy" />,
          ])}
          minWidth={520}
          note="Pick inserts into the string above; Copy copies that single character to the clipboard."
        />
      </Panel>
    </div>
  );
}
