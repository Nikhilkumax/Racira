"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function SatBtc() {
  const [sat, setSat] = useState("100000000");
  const [btc, setBtc] = useState("1");
  const btcFromSat = useMemo(() => {
    const n = parseFloat(sat);
    return isNaN(n) ? null : (n / 1e8).toFixed(8);
  }, [sat]);
  const satFromBtc = useMemo(() => {
    const n = parseFloat(btc);
    return isNaN(n) ? null : Math.round(n * 1e8).toString();
  }, [btc]);
  return (
    <div className="space-y-4">
      <Field label="Satoshi"><Input value={sat} onChange={(e) => setSat(e.target.value)} /></Field>
      {btcFromSat && <Result label="BTC" value={btcFromSat} ok />}
      <Field label="BTC"><Input value={btc} onChange={(e) => setBtc(e.target.value)} /></Field>
      {satFromBtc && <Result label="Satoshi" value={satFromBtc} ok />}
    </div>
  );
}
