import { useState } from "react";

type El = { n: number; s: string; name: string; r: number; c: number; cat: string };

const ELEMENTS: El[] = [
  { n: 1, s: "H", name: "Hydrogen", r: 1, c: 1, cat: "nonmetal" },
  { n: 2, s: "He", name: "Helium", r: 1, c: 18, cat: "noble" },
  { n: 3, s: "Li", name: "Lithium", r: 2, c: 1, cat: "alkali" },
  { n: 4, s: "Be", name: "Beryllium", r: 2, c: 2, cat: "alkaline" },
  { n: 5, s: "B", name: "Boron", r: 2, c: 13, cat: "metalloid" },
  { n: 6, s: "C", name: "Carbon", r: 2, c: 14, cat: "nonmetal" },
  { n: 7, s: "N", name: "Nitrogen", r: 2, c: 15, cat: "nonmetal" },
  { n: 8, s: "O", name: "Oxygen", r: 2, c: 16, cat: "nonmetal" },
  { n: 9, s: "F", name: "Fluorine", r: 2, c: 17, cat: "halogen" },
  { n: 10, s: "Ne", name: "Neon", r: 2, c: 18, cat: "noble" },
  { n: 11, s: "Na", name: "Sodium", r: 3, c: 1, cat: "alkali" },
  { n: 12, s: "Mg", name: "Magnesium", r: 3, c: 2, cat: "alkaline" },
  { n: 13, s: "Al", name: "Aluminum", r: 3, c: 13, cat: "metal" },
  { n: 14, s: "Si", name: "Silicon", r: 3, c: 14, cat: "metalloid" },
  { n: 15, s: "P", name: "Phosphorus", r: 3, c: 15, cat: "nonmetal" },
  { n: 16, s: "S", name: "Sulfur", r: 3, c: 16, cat: "nonmetal" },
  { n: 17, s: "Cl", name: "Chlorine", r: 3, c: 17, cat: "halogen" },
  { n: 18, s: "Ar", name: "Argon", r: 3, c: 18, cat: "noble" },
  { n: 19, s: "K", name: "Potassium", r: 4, c: 1, cat: "alkali" },
  { n: 20, s: "Ca", name: "Calcium", r: 4, c: 2, cat: "alkaline" },
];
for (let i = 21; i <= 30; i++) ELEMENTS.push({ n: i, s: "·", name: "Transition", r: 4, c: i - 18, cat: "transition" });
for (let i = 31; i <= 36; i++) {
  const names = ["Ga","Ge","As","Se","Br","Kr"];
  const cats = ["metal","metalloid","metalloid","nonmetal","halogen","noble"];
  ELEMENTS.push({ n: i, s: names[i-31], name: names[i-31], r: 4, c: i - 18, cat: cats[i-31] });
}

const COLORS: Record<string, string> = {
  alkali: "bg-rose-100 border-rose-300 text-rose-900",
  alkaline: "bg-orange-100 border-orange-300 text-orange-900",
  transition: "bg-amber-100 border-amber-300 text-amber-900",
  metal: "bg-yellow-100 border-yellow-300 text-yellow-900",
  metalloid: "bg-teal-100 border-teal-300 text-teal-900",
  nonmetal: "bg-emerald-100 border-emerald-300 text-emerald-900",
  halogen: "bg-cyan-100 border-cyan-300 text-cyan-900",
  noble: "bg-indigo-100 border-indigo-300 text-indigo-900",
};

export function PeriodicTable() {
  const [sel, setSel] = useState<El | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Showing periods 1–4 (educational subset). Click an element.</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
        {ELEMENTS.map((e) => (
          <button
            key={e.n}
            onClick={() => setSel(e)}
            className={`aspect-square rounded border text-[10px] font-semibold flex flex-col items-center justify-center hover:scale-110 transition ${COLORS[e.cat]}`}
            style={{ gridColumn: e.c, gridRow: e.r }}
          >
            <span className="text-[8px] opacity-70">{e.n}</span>
            <span className="text-sm">{e.s}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="rounded-xl border bg-card p-6">
          <div className="text-xs text-muted-foreground uppercase">Element #{sel.n}</div>
          <div className="text-3xl font-bold">{sel.s} — {sel.name}</div>
          <div className="text-sm text-muted-foreground mt-1 capitalize">Category: {sel.cat}</div>
        </div>
      )}
    </div>
  );
}
