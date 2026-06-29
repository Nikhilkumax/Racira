import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCALE = [
  { min: 93, letter: "A", gpa: 4.0 },
  { min: 90, letter: "A-", gpa: 3.7 },
  { min: 87, letter: "B+", gpa: 3.3 },
  { min: 83, letter: "B", gpa: 3.0 },
  { min: 80, letter: "B-", gpa: 2.7 },
  { min: 77, letter: "C+", gpa: 2.3 },
  { min: 73, letter: "C", gpa: 2.0 },
  { min: 70, letter: "C-", gpa: 1.7 },
  { min: 67, letter: "D+", gpa: 1.3 },
  { min: 60, letter: "D", gpa: 1.0 },
  { min: 0, letter: "F", gpa: 0.0 },
];

export function GradingScale() {
  const [earned, setEarned] = useState(85);
  const [total, setTotal] = useState(100);
  const pct = total > 0 ? (earned / total) * 100 : 0;
  const grade = SCALE.find((s) => pct >= s.min)!;
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Points Earned</Label><Input type="number" value={earned} onChange={(e) => setEarned(+e.target.value || 0)} /></div>
        <div><Label>Points Possible</Label><Input type="number" value={total} onChange={(e) => setTotal(+e.target.value || 0)} /></div>
      </div>
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 text-center">
        <div className="text-sm uppercase tracking-wider text-muted-foreground">Result</div>
        <div className="text-6xl font-bold text-primary my-2">{grade.letter}</div>
        <div className="text-lg">{pct.toFixed(1)}% · GPA {grade.gpa.toFixed(1)}</div>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-2">Range</th><th className="text-left p-2">Letter</th><th className="text-left p-2">GPA</th></tr></thead>
          <tbody>
            {SCALE.map((s, i) => (
              <tr key={s.letter} className={`border-t ${grade.letter === s.letter ? "bg-primary/10 font-semibold" : ""}`}>
                <td className="p-2">{s.min}{i === 0 ? "+" : `–${SCALE[i - 1].min - 1}`}%</td>
                <td className="p-2">{s.letter}</td>
                <td className="p-2">{s.gpa.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
