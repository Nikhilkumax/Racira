"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

export function AprApy() {
  const [apr, setApr] = useState("10");
  const [n, setN] = useState("365");
  const r = useMemo(() => {
    const a = +apr / 100, k = +n;
    if (!a || !k) return null;
    const apy = (Math.pow(1 + a / k, k) - 1) * 100;
    const aprFromApy = (Math.pow(1 + a, 1 / k) - 1) * k * 100;
    return { apy, aprFromApy };
  }, [apr, n]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="APR (%)"><Input value={apr} onChange={(e) => setApr(e.target.value)} /></Field>
        <Field label="Compounds per year"><Input value={n} onChange={(e) => setN(e.target.value)} /></Field>
      </div>
      {r && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Result label="APY (from APR)" value={r.apy.toFixed(4) + "%"} ok />
          <Result label="APR (if input was APY)" value={r.aprFromApy.toFixed(4) + "%"} />
        </div>
      )}
    </div>
  );
}
