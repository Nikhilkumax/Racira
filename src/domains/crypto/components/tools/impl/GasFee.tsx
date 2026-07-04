"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function GasFee() {
  const [limit, setLimit] = useState("21000");
  const [gwei, setGwei] = useState("30");
  const [ethUsd, setEthUsd] = useState("3000");
  const r = useMemo(() => {
    const l = +limit, g = +gwei, p = +ethUsd;
    if (!l || !g) return null;
    const eth = (l * g) / 1e9;
    return { eth, usd: eth * (p || 0) };
  }, [limit, gwei, ethUsd]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Gas limit"><Input value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
        <Field label="Gas price (gwei)"><Input value={gwei} onChange={(e) => setGwei(e.target.value)} /></Field>
        <Field label="ETH price (USD)"><Input value={ethUsd} onChange={(e) => setEthUsd(e.target.value)} /></Field>
      </div>
      {r && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Result label="Fee (ETH)" value={r.eth.toFixed(8)} />
          <Result label="Fee (USD)" value={"$" + r.usd.toFixed(2)} />
        </div>
      )}
    </div>
  );
}
