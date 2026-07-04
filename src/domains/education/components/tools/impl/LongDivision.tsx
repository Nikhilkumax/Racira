import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LongDivision() {
  const [a, setA] = useState(1234);
  const [b, setB] = useState(7);
  const steps: { partial: number; bring: string; quotient: number; product: number; remainder: number }[] = [];
  let carry = 0;
  const digits = String(a).split("");
  let quotientStr = "";
  digits.forEach((d) => {
    const partial = carry * 10 + +d;
    const q = Math.floor(partial / b);
    const product = q * b;
    const remainder = partial - product;
    quotientStr += q;
    steps.push({ partial, bring: d, quotient: q, product, remainder });
    carry = remainder;
  });
  const finalQ = +quotientStr;
  const finalR = carry;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Dividend</Label><Input type="number" value={a} onChange={(e) => setA(+e.target.value || 0)} /></div>
        <div><Label>Divisor</Label><Input type="number" value={b} onChange={(e) => setB(Math.max(1, +e.target.value || 1))} /></div>
      </div>
      <div className="rounded-lg border bg-card p-6 font-mono">
        <div className="text-2xl mb-4 text-center">
          {a} ÷ {b} = <span className="text-primary font-bold">{finalQ}</span> remainder <span className="text-primary font-bold">{finalR}</span>
        </div>
        <div className="space-y-1 text-sm">
          {steps.map((s, i) => (
            <div key={i} className="flex justify-between border-b pb-1">
              <span>Step {i + 1}: bring down {s.bring} → {s.partial}</span>
              <span>{s.partial} ÷ {b} = {s.quotient} (×{b}={s.product}), remainder {s.remainder}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
