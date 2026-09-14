"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmt } from "../easy/ui";

/** Normalise a compass angle to 0–360°. */
function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Angle Bisector Tool — two modes:
 *   1. Angle value: bisector of θ is θ/2; the reflex sector's bisector is θ/2 + 180.
 *   2. Three points A–B–C (B is the vertex): interior angle at B from vectors
 *      BA and BC, bisector direction = unit(BA) + unit(BC), measured from +X.
 */
export default function AngleBisectorTool() {
  const [mode, setMode] = useState("points");
  const [deg, setDeg] = useState("90");
  const [pts, setPts] = useState({
    x1: "1", y1: "0",
    x2: "0", y2: "0",
    x3: "0", y3: "1",
  });

  const degv = parseFloat(deg);

  let angle = NaN;      // interior angle at the vertex (degrees)
  let half = NaN;       // half of the interior angle
  let bis = NaN;        // bisector direction from +X axis (degrees, 0–360)
  let reflexBis = NaN;  // bisector of the reflex sector

  if (mode === "angle") {
    if (Number.isFinite(degv)) {
      const t = norm360(degv);
      angle = t;
      half = t / 2;
      bis = t / 2;
      reflexBis = norm360(t / 2 + 180);
    }
  } else {
    const n = (s: string) => parseFloat(s);
    const A = { x: n(pts.x1), y: n(pts.y1) };
    const B = { x: n(pts.x2), y: n(pts.y2) };
    const C = { x: n(pts.x3), y: n(pts.y3) };
    if ([A.x, A.y, B.x, B.y, C.x, C.y].every(Number.isFinite)) {
      const ua = { x: A.x - B.x, y: A.y - B.y };
      const uc = { x: C.x - B.x, y: C.y - B.y };
      const la = Math.hypot(ua.x, ua.y);
      const lc = Math.hypot(uc.x, uc.y);
      if (la > 0 && lc > 0) {
        const dot = (ua.x * uc.x + ua.y * uc.y) / (la * lc);
        const clamped = Math.min(1, Math.max(-1, dot));
        angle = (Math.acos(clamped) * 180) / Math.PI;
        half = angle / 2;
        // Bisector direction: normalised sum of the two arm unit vectors.
        const dx = ua.x / la + uc.x / lc;
        const dy = ua.y / la + uc.y / lc;
        bis = norm360((Math.atan2(dy, dx) * 180) / Math.PI);
        reflexBis = norm360(bis + 180);
      }
    }
  }

  const setP = (k: keyof typeof pts, v: string) => setPts((p) => ({ ...p, [k]: v }));

  const ok = (n: number) => Number.isFinite(n);
  const cell = (n: number) => (ok(n) ? `${fmt(n)}°` : "—");

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <div className="space-y-3">
          <Sel
            name="mode"
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "points", label: "Three points (A–B–C, B = vertex)" },
              { value: "angle", label: "Angle value" },
            ]}
          />
          {mode === "angle" ? (
            <Num name="deg" label="Angle θ" unit="°" value={deg} onChange={setDeg} />
          ) : (
            <div className="space-y-2">
              <FormGrid>
                <Num name="x1" label="A · X" value={pts.x1} onChange={(v) => setP("x1", v)} />
                <Num name="y1" label="A · Y" value={pts.y1} onChange={(v) => setP("y1", v)} />
              </FormGrid>
              <FormGrid>
                <Num name="x2" label="B (vertex) · X" value={pts.x2} onChange={(v) => setP("x2", v)} />
                <Num name="y2" label="B (vertex) · Y" value={pts.y2} onChange={(v) => setP("y2", v)} />
              </FormGrid>
              <FormGrid>
                <Num name="x3" label="C · X" value={pts.x3} onChange={(v) => setP("x3", v)} />
                <Num name="y3" label="C · Y" value={pts.y3} onChange={(v) => setP("y3", v)} />
              </FormGrid>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {mode === "angle"
            ? "The bisector of an angle θ is the ray at θ/2. The reflex sector (360° − θ) is bisected 180° opposite."
            : "Angles are measured counter-clockwise from the +X axis. A(1,0), B(0,0), C(0,1) gives a 90° angle at B with a 45° bisector."}
        </p>
      </Panel>
      <Panel>
        <PanelTitle>Result</PanelTitle>
        <ResBox>
          <Res name="angle" label="Interior angle at vertex" value={cell(angle)} />
          <Res name="half" label="Half-angle" value={cell(half)} />
          <Res name="bis" label="Bisector direction (from +X)" value={cell(bis)} />
          <Res name="reflex" label="Reflex-sector bisector" value={cell(reflexBis)} />
        </ResBox>
      </Panel>
    </CalcLayout>
  );
}