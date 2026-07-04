import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PunnettSquare() {
  const [p1, setP1] = useState("Aa");
  const [p2, setP2] = useState("Aa");
  const a = p1.split("").slice(0, 2);
  const b = p2.split("").slice(0, 2);
  const grid = a.map((x) => b.map((y) => [x, y].sort((m, n) => (m === m.toUpperCase() ? -1 : 1)).join("")));
  const flat = grid.flat();
  const counts: Record<string, number> = {};
  flat.forEach((g) => (counts[g] = (counts[g] || 0) + 1));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Parent 1 (e.g. Aa)</Label><Input maxLength={2} value={p1} onChange={(e) => setP1(e.target.value)} /></div>
        <div><Label>Parent 2 (e.g. Aa)</Label><Input maxLength={2} value={p2} onChange={(e) => setP2(e.target.value)} /></div>
      </div>
      <div className="racira-page-container">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div></div>
          {b.map((y, i) => <div key={i} className="font-bold text-lg p-2 bg-primary/10 rounded">{y}</div>)}
          {a.map((x, i) => (
            <>
              <div key={`r${i}`} className="font-bold text-lg p-2 bg-primary/10 rounded">{x}</div>
              {b.map((_, j) => (
                <div key={`${i}${j}`} className="border-2 border-primary/30 rounded p-4 font-mono text-xl font-bold">
                  {grid[i][j]}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="font-semibold mb-2">Genotype Ratios</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(counts).map(([g, c]) => (
            <span key={g} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-mono">
              {g}: {c}/4 ({Math.round((c / 4) * 100)}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
