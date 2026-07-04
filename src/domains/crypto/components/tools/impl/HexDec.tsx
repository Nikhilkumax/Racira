"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function HexDec() {
  const [hex, setHex] = useState("0x1a");
  const [dec, setDec] = useState("26");
  const fromHex = useMemo(() => {
    try { return BigInt(hex).toString(10); } catch { return null; }
  }, [hex]);
  const fromDec = useMemo(() => {
    try { return "0x" + BigInt(dec).toString(16); } catch { return null; }
  }, [dec]);
  return (
    <div className="space-y-4">
      <Field label="Hex (e.g. 0x1a)"><Input value={hex} onChange={(e) => setHex(e.target.value)} /></Field>
      {fromHex && <Result label="Decimal" value={fromHex} ok />}
      <Field label="Decimal"><Input value={dec} onChange={(e) => setDec(e.target.value)} /></Field>
      {fromDec && <Result label="Hex" value={fromDec} ok />}
    </div>
  );
}
