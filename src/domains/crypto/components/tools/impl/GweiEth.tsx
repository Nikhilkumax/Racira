"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function GweiEth() {
  const [gwei, setGwei] = useState("1000000000");
  const [eth, setEth] = useState("1");
  const ethFromGwei = useMemo(() => {
    const n = parseFloat(gwei);
    return isNaN(n) ? null : (n / 1e9).toString();
  }, [gwei]);
  const gweiFromEth = useMemo(() => {
    const n = parseFloat(eth);
    return isNaN(n) ? null : (n * 1e9).toString();
  }, [eth]);
  return (
    <div className="space-y-4">
      <Field label="Gwei"><Input value={gwei} onChange={(e) => setGwei(e.target.value)} /></Field>
      {ethFromGwei && <Result label="ETH" value={ethFromGwei} ok />}
      <Field label="ETH"><Input value={eth} onChange={(e) => setEth(e.target.value)} /></Field>
      {gweiFromEth && <Result label="Gwei" value={gweiFromEth} ok />}
    </div>
  );
}
