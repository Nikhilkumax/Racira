"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function WeiEth() {
  const [wei, setWei] = useState("1000000000000000000");
  const [eth, setEth] = useState("1");
  const ethFromWei = useMemo(() => {
    try { return (Number(BigInt(wei)) / 1e18).toString(); } catch { return null; }
  }, [wei]);
  const weiFromEth = useMemo(() => {
    const n = parseFloat(eth);
    if (isNaN(n)) return null;
    return BigInt(Math.round(n * 1e18)).toString();
  }, [eth]);
  return (
    <div className="space-y-4">
      <Field label="Wei"><Input value={wei} onChange={(e) => setWei(e.target.value)} /></Field>
      {ethFromWei && <Result label="ETH" value={ethFromWei} ok />}
      <Field label="ETH"><Input value={eth} onChange={(e) => setEth(e.target.value)} /></Field>
      {weiFromEth && <Result label="Wei" value={weiFromEth} ok />}
    </div>
  );
}
