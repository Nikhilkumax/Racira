"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function TokenDecimal() {
  const [raw, setRaw] = useState("1000000");
  const [decimals, setDecimals] = useState("6");
  const [human, setHuman] = useState("1");
  const fromRaw = useMemo(() => {
    try {
      const d = +decimals;
      return (Number(BigInt(raw)) / 10 ** d).toString();
    } catch { return null; }
  }, [raw, decimals]);
  const fromHuman = useMemo(() => {
    const n = parseFloat(human), d = +decimals;
    return isNaN(n) ? null : BigInt(Math.round(n * 10 ** d)).toString();
  }, [human, decimals]);
  return (
    <div className="space-y-4">
      <Field label="Decimals"><Input value={decimals} onChange={(e) => setDecimals(e.target.value)} /></Field>
      <Field label="Raw (on-chain integer)"><Input value={raw} onChange={(e) => setRaw(e.target.value)} /></Field>
      {fromRaw && <Result label="Human-readable" value={fromRaw} ok />}
      <Field label="Human-readable"><Input value={human} onChange={(e) => setHuman(e.target.value)} /></Field>
      {fromHuman && <Result label="Raw" value={fromHuman} ok />}
    </div>
  );
}
