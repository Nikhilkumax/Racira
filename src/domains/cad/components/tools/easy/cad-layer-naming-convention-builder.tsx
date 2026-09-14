"use client";

import { useState } from "react";
import { Panel, PanelTitle, Res, ResBox, Sel, TextInput } from "./ui";

const DISCIPLINES = [
  { value: "A", label: "A — Architectural" },
  { value: "S", label: "S — Structural" },
  { value: "M", label: "M — Mechanical" },
  { value: "E", label: "E — Electrical" },
  { value: "P", label: "P — Plumbing" },
  { value: "C", label: "C — Civil" },
  { value: "L", label: "L — Landscape" },
  { value: "G", label: "G — General" },
];

const SUFFIXES = [
  { value: "", label: "(none)" },
  { value: "EXST", label: "EXST — existing" },
  { value: "DEMO", label: "DEMO — demolition" },
  { value: "NEW", label: "NEW — new work" },
  { value: "PRCH", label: "PRCH — to be purchased" },
  { value: "PH1", label: "PH1 — phase 1" },
];

/**
 * CAD Layer Naming Convention Builder — compose an AIA/NCS-style layer name:
 * DISCIPLINE-MAJOR[-MINOR][-SUFFIX], e.g. A-WALL or S-COLS-NEW.
 */
export default function CadLayerNamingConventionBuilder() {
  const [disc, setDisc] = useState("A");
  const [major, setMajor] = useState("WALL");
  const [minor, setMinor] = useState("");
  const [suffix, setSuffix] = useState("");

  const majorClean = major.trim().toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
  const minorClean = minor.trim().toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
  const parts = [disc, majorClean, minorClean, suffix].filter(Boolean);
  const name = parts.join("-");
  const valid = majorClean.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <PanelTitle>Compose</PanelTitle>
        <div className="space-y-3">
          <Sel name="disc" label="Discipline" value={disc} onChange={setDisc} options={DISCIPLINES} />
          <TextInput name="major" label="Major group (element)" value={major} onChange={setMajor} placeholder="WALL" />
          <TextInput name="minor" label="Minor group (optional)" value={minor} onChange={setMinor} placeholder="EXIST or blank" />
          <Sel name="suffix" label="Status suffix" value={suffix} onChange={setSuffix} options={SUFFIXES} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Follows the NCS/AIA convention used by most CAD systems: upper-case discipline + major group, dash
          separated. Keeping layer names predictable makes filters, lineweight overrides and sheet exports work.
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Layer name</PanelTitle>
        <p
          data-testid="res-layer"
          className={`rounded-lg border px-4 py-3 font-mono text-lg font-semibold ${
            valid ? "border-border bg-background text-primary" : "border-border bg-background text-muted-foreground"
          }`}
        >
          {valid ? name : "—"}
        </p>
        <div className="mt-4">
          <ResBox>
            <Res label="Discipline code" value={disc} />
            <Res label="Elements" value={[majorClean, minorClean].filter(Boolean).join("-") || "—"} />
            <Res label="Full name (typ.)" value={`${disc}-${majorClean || "???"}`} />
          </ResBox>
        </div>
      </Panel>
    </div>
  );
}
