"use client";

import { useMemo, useState } from "react";
import { Field, ResultCard, fmt } from "@/components/engineering/tool-shell";

export function OhmsLawTool() {
  const [v, setV] = useState("");
  const [i, setI] = useState("");
  const [r, setR] = useState("");

  const results = useMemo(() => {
    const V = parseFloat(v);
    const I = parseFloat(i);
    const R = parseFloat(r);
    const has = [Number.isFinite(V), Number.isFinite(I), Number.isFinite(R)].filter(Boolean).length;
    if (has < 2) return null;
    let voltage = V, current = I, resistance = R;
    if (!Number.isFinite(voltage)) voltage = current * resistance;
    else if (!Number.isFinite(current)) current = voltage / resistance;
    else if (!Number.isFinite(resistance)) resistance = voltage / current;
    const power = voltage * current;
    return { voltage, current, resistance, power };
  }, [v, i, r]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Enter any two values — leave the third blank.</p>
        <Field label="Voltage (V)" unit="V" value={v} onChange={setV} placeholder="e.g. 12" />
        <Field label="Current (I)" unit="A" value={i} onChange={setI} placeholder="e.g. 0.5" />
        <Field label="Resistance (R)" unit="Ω" value={r} onChange={setR} placeholder="e.g. 24" />
      </div>
      {results ? (
        <ResultCard
          rows={[
            { label: "Voltage", value: fmt(results.voltage), unit: "V" },
            { label: "Current", value: fmt(results.current), unit: "A" },
            { label: "Resistance", value: fmt(results.resistance), unit: "Ω" },
            { label: "Power", value: fmt(results.power), unit: "W" },
          ]}
        />
      ) : (
        <EmptyHint />
      )}
    </div>
  );
}

export function VoltageDividerTool() {
  const [vin, setVin] = useState("");
  const [r1, setR1] = useState("");
  const [r2, setR2] = useState("");

  const res = useMemo(() => {
    const V = parseFloat(vin), R1 = parseFloat(r1), R2 = parseFloat(r2);
    if (![V, R1, R2].every(Number.isFinite)) return null;
    const vout = V * (R2 / (R1 + R2));
    const i = V / (R1 + R2);
    return { vout, i };
  }, [vin, r1, r2]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Input Voltage (Vin)" unit="V" value={vin} onChange={setVin} placeholder="12" />
        <Field label="R1 (top resistor)" unit="Ω" value={r1} onChange={setR1} placeholder="1000" />
        <Field label="R2 (bottom resistor)" unit="Ω" value={r2} onChange={setR2} placeholder="2000" />
        <p className="text-xs text-muted-foreground">Vout = Vin × R2 / (R1 + R2)</p>
      </div>
      {res ? (
        <ResultCard
          rows={[
            { label: "Output Voltage", value: fmt(res.vout), unit: "V" },
            { label: "Loop Current", value: fmt(res.i), unit: "A" },
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

export function CurrentDividerTool() {
  const [it, setIt] = useState("");
  const [r1, setR1] = useState("");
  const [r2, setR2] = useState("");

  const res = useMemo(() => {
    const I = parseFloat(it), R1 = parseFloat(r1), R2 = parseFloat(r2);
    if (![I, R1, R2].every(Number.isFinite)) return null;
    const i1 = I * (R2 / (R1 + R2));
    const i2 = I * (R1 / (R1 + R2));
    return { i1, i2 };
  }, [it, r1, r2]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Total Current (Iₜ)" unit="A" value={it} onChange={setIt} placeholder="1" />
        <Field label="R1" unit="Ω" value={r1} onChange={setR1} placeholder="100" />
        <Field label="R2" unit="Ω" value={r2} onChange={setR2} placeholder="200" />
        <p className="text-xs text-muted-foreground">I₁ = Iₜ × R2 / (R1 + R2)</p>
      </div>
      {res ? (
        <ResultCard
          rows={[
            { label: "Current through R1", value: fmt(res.i1), unit: "A" },
            { label: "Current through R2", value: fmt(res.i2), unit: "A" },
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

export function CapacitorTool() {
  const [c, setC] = useState("");
  const [v, setV] = useState("");
  const [f, setF] = useState("");

  const res = useMemo(() => {
    const C = parseFloat(c), V = parseFloat(v), F = parseFloat(f);
    const out: { energy?: number; charge?: number; xc?: number } = {};
    if (Number.isFinite(C) && Number.isFinite(V)) {
      out.energy = 0.5 * C * V * V;
      out.charge = C * V;
    }
    if (Number.isFinite(C) && Number.isFinite(F) && F > 0) {
      out.xc = 1 / (2 * Math.PI * F * C);
    }
    return Object.keys(out).length ? out : null;
  }, [c, v, f]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Capacitance (C)" unit="F" value={c} onChange={setC} placeholder="0.000001 (1 µF)" />
        <Field label="Voltage (V)" unit="V" value={v} onChange={setV} placeholder="12" />
        <Field label="Frequency (f) — optional" unit="Hz" value={f} onChange={setF} placeholder="1000" />
        <p className="text-xs text-muted-foreground">E = ½CV² · Q = CV · Xc = 1 / (2πfC)</p>
      </div>
      {res ? (
        <ResultCard
          rows={[
            ...(res.energy !== undefined ? [{ label: "Energy stored", value: fmt(res.energy), unit: "J" }] : []),
            ...(res.charge !== undefined ? [{ label: "Charge", value: fmt(res.charge), unit: "C" }] : []),
            ...(res.xc !== undefined ? [{ label: "Reactance (Xc)", value: fmt(res.xc), unit: "Ω" }] : []),
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

export function InductorTool() {
  const [l, setL] = useState("");
  const [i, setI] = useState("");
  const [f, setF] = useState("");

  const res = useMemo(() => {
    const L = parseFloat(l), I = parseFloat(i), F = parseFloat(f);
    const out: { energy?: number; xl?: number } = {};
    if (Number.isFinite(L) && Number.isFinite(I)) out.energy = 0.5 * L * I * I;
    if (Number.isFinite(L) && Number.isFinite(F)) out.xl = 2 * Math.PI * F * L;
    return Object.keys(out).length ? out : null;
  }, [l, i, f]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Inductance (L)" unit="H" value={l} onChange={setL} placeholder="0.01 (10 mH)" />
        <Field label="Current (I)" unit="A" value={i} onChange={setI} placeholder="2" />
        <Field label="Frequency (f) — optional" unit="Hz" value={f} onChange={setF} placeholder="60" />
        <p className="text-xs text-muted-foreground">E = ½LI² · Xl = 2πfL</p>
      </div>
      {res ? (
        <ResultCard
          rows={[
            ...(res.energy !== undefined ? [{ label: "Energy stored", value: fmt(res.energy), unit: "J" }] : []),
            ...(res.xl !== undefined ? [{ label: "Reactance (Xl)", value: fmt(res.xl), unit: "Ω" }] : []),
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

export function RcTimeConstantTool() {
  const [r, setR] = useState("");
  const [c, setC] = useState("");
  const [v, setV] = useState("");
  const [t, setT] = useState("");

  const res = useMemo(() => {
    const R = parseFloat(r), C = parseFloat(c), V = parseFloat(v), T = parseFloat(t);
    if (![R, C].every(Number.isFinite)) return null;
    const tau = R * C;
    const out: { tau: number; charge?: number; discharge?: number; time99?: number } = { tau, time99: 5 * tau };
    if (Number.isFinite(V) && Number.isFinite(T)) {
      out.charge = V * (1 - Math.exp(-T / tau));
      out.discharge = V * Math.exp(-T / tau);
    }
    return out;
  }, [r, c, v, t]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Resistance (R)" unit="Ω" value={r} onChange={setR} placeholder="10000" />
        <Field label="Capacitance (C)" unit="F" value={c} onChange={setC} placeholder="0.0001" />
        <Field label="Source Voltage (V) — optional" unit="V" value={v} onChange={setV} placeholder="5" />
        <Field label="Elapsed Time (t) — optional" unit="s" value={t} onChange={setT} placeholder="1" />
        <p className="text-xs text-muted-foreground">τ = RC · 5τ ≈ 99% settled</p>
      </div>
      {res ? (
        <ResultCard
          rows={[
            { label: "Time constant τ", value: fmt(res.tau), unit: "s" },
            { label: "Settling time (5τ)", value: fmt(res.time99 ?? 0), unit: "s" },
            ...(res.charge !== undefined ? [{ label: "Charging voltage at t", value: fmt(res.charge), unit: "V" }] : []),
            ...(res.discharge !== undefined ? [{ label: "Discharging voltage at t", value: fmt(res.discharge), unit: "V" }] : []),
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

export function PowerFactorTool() {
  const [p, setP] = useState("");
  const [s, setS] = useState("");
  const [target, setTarget] = useState("");
  const [vline, setVline] = useState("");
  const [freq, setFreq] = useState("50");

  const res = useMemo(() => {
    const P = parseFloat(p), S = parseFloat(s);
    if (!Number.isFinite(P) || !Number.isFinite(S) || S === 0) return null;
    const pf = P / S;
    const angle = Math.acos(Math.min(1, Math.max(-1, pf)));
    const Q = S * Math.sin(angle);
    const out: { pf: number; angle: number; Q: number; qCorr?: number; capF?: number } = {
      pf, angle: (angle * 180) / Math.PI, Q,
    };
    const targetPf = parseFloat(target);
    if (Number.isFinite(targetPf) && targetPf > 0 && targetPf <= 1) {
      const newAngle = Math.acos(targetPf);
      const qNew = P * Math.tan(newAngle);
      out.qCorr = Q - qNew;
      const V = parseFloat(vline), F = parseFloat(freq);
      if (Number.isFinite(V) && Number.isFinite(F) && V > 0 && F > 0 && out.qCorr > 0) {
        out.capF = out.qCorr / (2 * Math.PI * F * V * V);
      }
    }
    return out;
  }, [p, s, target, vline, freq]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Field label="Real Power (P)" unit="W" value={p} onChange={setP} placeholder="800" />
        <Field label="Apparent Power (S)" unit="VA" value={s} onChange={setS} placeholder="1000" />
        <div className="border-t border-border pt-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">PF Correction (optional)</p>
          <div className="space-y-3">
            <Field label="Target Power Factor" value={target} onChange={setTarget} placeholder="0.95" />
            <Field label="Line Voltage" unit="V" value={vline} onChange={setVline} placeholder="230" />
            <Field label="Frequency" unit="Hz" value={freq} onChange={setFreq} />
          </div>
        </div>
      </div>
      {res ? (
        <ResultCard
          rows={[
            { label: "Power Factor", value: fmt(res.pf) },
            { label: "Phase Angle", value: fmt(res.angle), unit: "°" },
            { label: "Reactive Power", value: fmt(res.Q), unit: "VAR" },
            ...(res.qCorr !== undefined ? [{ label: "Compensation needed", value: fmt(res.qCorr), unit: "VAR" }] : []),
            ...(res.capF !== undefined ? [{ label: "Capacitor required", value: fmt(res.capF * 1e6), unit: "µF" }] : []),
          ]}
        />
      ) : <EmptyHint />}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
      Fill in the required fields to see results.
    </div>
  );
}
