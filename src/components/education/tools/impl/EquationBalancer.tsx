import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EXAMPLES = [
  { eq: "H2 + O2 -> H2O", balanced: "2 H₂ + O₂ → 2 H₂O" },
  { eq: "CH4 + O2 -> CO2 + H2O", balanced: "CH₄ + 2 O₂ → CO₂ + 2 H₂O" },
  { eq: "Fe + O2 -> Fe2O3", balanced: "4 Fe + 3 O₂ → 2 Fe₂O₃" },
  { eq: "N2 + H2 -> NH3", balanced: "N₂ + 3 H₂ → 2 NH₃" },
  { eq: "C3H8 + O2 -> CO2 + H2O", balanced: "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O" },
];

export function EquationBalancer() {
  const [eq, setEq] = useState("");
  const match = EXAMPLES.find((e) => e.eq.replace(/\s+/g, "") === eq.replace(/\s+/g, ""));
  return (
    <div className="space-y-4">
      <div>
        <Input placeholder="e.g. H2 + O2 -> H2O" value={eq} onChange={(e) => setEq(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">Try one of the examples below.</p>
      </div>
      {match && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Balanced</div>
          <div className="text-2xl font-mono font-bold">{match.balanced}</div>
        </div>
      )}
      <div>
        <div className="text-sm font-semibold mb-2">Examples</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {EXAMPLES.map((e) => (
            <Button key={e.eq} variant="outline" size="sm" className="justify-start font-mono" onClick={() => setEq(e.eq)}>
              {e.eq}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
