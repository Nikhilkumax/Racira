"use client";
import { useState } from "react";
import { ToolShell, Field, NumberInput, Select, Result, SENSORS } from "../ui";

export function FocalEquivCalculator() {
  const [sensor, setSensor] = useState(1);
  const [focal, setFocal] = useState(35);
  const equiv = focal * SENSORS[sensor].crop;
  return (
    <ToolShell note="Equivalent focal length describes the field of view your lens gives on full-frame terms.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your sensor">
          <Select value={sensor} onChange={(e) => setSensor(+e.target.value)}>
            {SENSORS.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Actual focal length (mm)"><NumberInput value={focal} onChange={(e) => setFocal(+e.target.value)} /></Field>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Result label="Full-frame equivalent" value={`${equiv.toFixed(0)} mm`} />
        <Result label="Crop factor" value={`${SENSORS[sensor].crop}×`} />
      </div>
    </ToolShell>
  );
}
