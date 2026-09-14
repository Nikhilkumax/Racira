"use client";

import { useState } from "react";
import { Btn, CalcLayout, FormGrid, Panel, PanelTitle, Sel, TextInput } from "../easy/ui";

/**
 * Drawing Title Block Generator — composes a standard bottom-right title
 * block (ISO 7200-style layout) from drawing metadata, rendered at screen
 * scale, plus a copyable plain-text block for quick entry into CAD.
 */
const SCALES = ["1:1", "1:2", "1:5", "1:10", "1:20", "1:50", "1:100"];

export default function DrawingTitleBlockGenerator() {
  const [company, setCompany] = useState("ACME Engineering");
  const [title, setTitle] = useState("Base Plate");
  const [number, setNumber] = useState("DWG-001");
  const [drawnBy, setDrawnBy] = useState("J. Doe");
  const [date, setDate] = useState("2026-09-05");
  const [scale, setScale] = useState("1:1");
  const [sheet, setSheet] = useState("1");
  const [sheets, setSheets] = useState("1");
  const [units, setUnits] = useState("mm");
  const [material, setMaterial] = useState("Steel");
  const [status, setStatus] = useState("");

  const fields = [
    ["Company", company],
    ["Title", title],
    ["Drawing number", number],
    ["Drawn by", drawnBy],
    ["Date", date],
    ["Scale", scale],
    ["Sheet", `${sheet} of ${sheets}`],
    ["Units", units],
    ["Material", material],
  ];

  const copy = async () => {
    const text = fields.map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`Copied ${fields.length} fields to clipboard`);
    } catch {
      setStatus("Copy blocked — select the text block below manually");
    }
  };

  const Cell = ({ label, value, testid, wide }: { label: string; value: string; testid: string; wide?: boolean }) => (
    <div
      data-testid={testid}
      className={`flex flex-col justify-center border-t border-border px-2 py-1 first:border-t-0 ${
        wide ? "col-span-2" : ""
      }`}
    >
      <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="truncate font-mono text-xs font-semibold text-foreground" title={value}>
        {value || "—"}
      </span>
    </div>
  );

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Drawing metadata</PanelTitle>
        <div className="space-y-3">
          <TextInput name="company" label="Company / organisation" value={company} onChange={setCompany} />
          <TextInput name="title" label="Drawing title" value={title} onChange={setTitle} />
          <FormGrid>
            <TextInput name="number" label="Drawing number" value={number} onChange={setNumber} />
            <TextInput name="drawn" label="Drawn by" value={drawnBy} onChange={setDrawnBy} />
          </FormGrid>
          <FormGrid>
            <TextInput name="date" label="Date" value={date} onChange={setDate} />
            <TextInput name="material" label="Material" value={material} onChange={setMaterial} />
          </FormGrid>
          <FormGrid>
            <Sel
              name="scale"
              label="Scale"
              value={scale}
              onChange={setScale}
              options={SCALES.map((s) => ({ value: s, label: s }))}
            />
            <Sel
              name="units"
              label="Units"
              value={units}
              onChange={setUnits}
              options={["mm", "cm", "m", "in", "ft"].map((u) => ({ value: u, label: u }))}
            />
          </FormGrid>
          <FormGrid>
            <TextInput name="sheet" label="Sheet" value={sheet} onChange={setSheet} />
            <TextInput name="sheets" label="Sheets" value={sheets} onChange={setSheets} />
          </FormGrid>
          <div className="flex items-center gap-2 pt-1">
            <Btn testid="copy-tb" onClick={copy}>Copy text block</Btn>
            {status && <span data-testid="res-status" className="text-xs text-muted-foreground">{status}</span>}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The block follows the ISO 7200 idea: identification fields (company, title, number) on
          the left, administrative fields (scale, sheet, date, units, material) on the right.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Title block preview</PanelTitle>
        <div className="overflow-x-auto">
          <div
            data-testid="tb-block"
            className="mx-auto grid w-[560px] grid-cols-2 border border-foreground/80 bg-background text-foreground"
            aria-label="Generated title block"
          >
            <Cell label="Company / organisation" value={company} testid="tb-company" />
            <Cell label="Drawing title" value={title} testid="tb-title" />
            <Cell label="Drawing number" value={number} testid="tb-number" />
            <Cell label="Scale" value={scale} testid="tb-scale" />
            <Cell label="Sheet" value={`${sheet} of ${sheets}`} testid="tb-sheet" />
            <Cell label="Units" value={units} testid="tb-units" />
            <Cell label="Material" value={material} testid="tb-material" />
            <Cell label="Drawn by" value={drawnBy} testid="tb-drawn" />
            <Cell label="Date" value={date} testid="tb-date" />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Preview is at screen scale, not sheet scale. The copy button emits a plain-text block
          you can paste into a CAD text entity or your PDM notes field.
        </p>
      </Panel>
    </CalcLayout>
  );
}