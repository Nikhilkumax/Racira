"use client";

import { useState } from "react";
import { FormGrid, Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "./ui";

const DISC = [
  { value: "A", label: "A — Architectural" },
  { value: "S", label: "S — Structural" },
  { value: "M", label: "M — Mechanical" },
  { value: "E", label: "E — Electrical" },
  { value: "P", label: "P — Plumbing" },
  { value: "C", label: "C — Civil" },
];

const DOC_TYPES = [
  { value: "DRG", label: "DRG — drawing" },
  { value: "SK", label: "SK — sketch" },
  { value: "SCH", label: "SCH — schematic" },
  { value: "DET", label: "DET — detail" },
  { value: "LAY", label: "LAY — layout" },
  { value: "GRA", label: "GRA — general arrangement" },
];

/**
 * Drawing Number Generator — compose a document number from project prefix,
 * discipline, document type and sequence, e.g. ACME-M-DRG-007.
 */
export default function DrawingNumberGenerator() {
  const [prefix, setPrefix] = useState("ACME");
  const [disc, setDisc] = useState("M");
  const [type, setType] = useState("DRG");
  const [seq, setSeq] = useState("7");
  const [pad, setPad] = useState(true);

  const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const pre = clean(prefix);
  const seqN = parseInt(seq, 10);
  const seqValid = Number.isFinite(seqN) && seqN >= 0;
  const seqStr = seqValid ? (pad ? String(seqN).padStart(3, "0") : String(seqN)) : "???";

  const parts = [pre, disc, type, seqStr].filter(Boolean);
  const number = parts.join("-");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <PanelTitle>Rules</PanelTitle>
        <div className="space-y-3">
          <TextInput name="prefix" label="Project prefix" value={prefix} onChange={setPrefix} placeholder="ACME" />
          <FormGrid>
            <Sel name="disc" label="Discipline" value={disc} onChange={setDisc} options={DISC} />
            <Sel name="type" label="Document type" value={type} onChange={setType} options={DOC_TYPES} />
            <TextInput name="seq" label="Sequence" value={seq} onChange={setSeq} placeholder="1" />
            <label className="flex items-end gap-2 pb-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={pad}
                onChange={(e) => setPad(e.target.checked)}
                className="h-3.5 w-3.5 accent-primary"
                data-testid="in-pad"
              />
              Pad to 3 digits
            </label>
          </FormGrid>
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Generated number</PanelTitle>
        <p
          data-testid="res-number"
          className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-lg font-semibold text-primary"
        >
          {number}
        </p>
        <div className="mt-4">
          <ResBox>
            <Res label="Pattern" value="PREFIX-DISC-TYPE-SEQ" />
            <Res label="Example (next sheet)" value={`${[pre, disc, type].filter(Boolean).join("-")}-${seqValid ? String(seqN + 1).padStart(3, "0") : "???"}`} />
          </ResBox>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Many studios extend this with a sheet-stage suffix (0–9) or a revision tag. Keep the rule in the title
          block so the number can be re-generated from the drawing properties.
        </p>
      </Panel>
    </div>
  );
}
