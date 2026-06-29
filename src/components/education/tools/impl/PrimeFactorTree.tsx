import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function factor(n: number): number[] {
  const res: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) { res.push(p); x /= p; }
  }
  if (x > 1) res.push(x);
  return res;
}

function Tree({ n }: { n: number }) {
  if (n < 2) return <div className="font-mono font-bold text-primary">{n}</div>;
  let p = 2;
  for (; p <= n; p++) if (n % p === 0) break;
  if (p === n) return <div className="font-mono font-bold text-primary">{n}</div>;
  const other = n / p;
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono font-bold mb-2 px-3 py-1 rounded border bg-card">{n}</div>
      <div className="flex gap-8 relative">
        <div className="absolute top-0 left-1/2 w-0.5 h-3 -translate-x-1/2 bg-muted-foreground/30" />
        <Tree n={p} />
        <Tree n={other} />
      </div>
    </div>
  );
}

export function PrimeFactorTree() {
  const [n, setN] = useState(60);
  const f = factor(n);
  return (
    <div className="space-y-6">
      <div className="max-w-xs"><Label>Number</Label><Input type="number" value={n} onChange={(e) => setN(Math.max(2, +e.target.value || 2))} /></div>
      <div className="overflow-x-auto py-6 flex justify-center"><Tree n={n} /></div>
      <div className="text-center font-mono text-lg">
        {n} = <span className="text-primary font-bold">{f.join(" × ")}</span>
      </div>
    </div>
  );
}
