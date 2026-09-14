"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, Plus, X } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface WorkPackage {
  id: number;
  name: string;
  labor: string;
  materials: string;
  equipment: string;
  subcontract: string;
  overhead: string;
}

interface Inputs {
  packages: WorkPackage[];
}

interface Result {
  labor: number;
  materials: number;
  equipment: number;
  subcontract: number;
  overhead: number;
  totalCost: number;
  largestPackage: string;
  largestShare: number;
}

const DEFAULT_PACKAGES: WorkPackage[] = [
  { id: 1, name: "Planning & Design", labor: "45000", materials: "5000", equipment: "2000", subcontract: "15000", overhead: "8000" },
  { id: 2, name: "Core Build", labor: "120000", materials: "60000", equipment: "25000", subcontract: "40000", overhead: "22000" },
  { id: 3, name: "Testing & QA", labor: "35000", materials: "3000", equipment: "4000", subcontract: "12000", overhead: "6000" },
  { id: 4, name: "Deployment & Closeout", labor: "25000", materials: "8000", equipment: "6000", subcontract: "10000", overhead: "5000" },
];

const DEFAULTS: Inputs = {
  packages: DEFAULT_PACKAGES,
};

function calculate(inputs: Inputs): Result {
  const pkgs = inputs.packages.map((p) => ({
    name: p.name || "Unnamed",
    labor: Math.max(0, parseFloat(p.labor) || 0),
    materials: Math.max(0, parseFloat(p.materials) || 0),
    equipment: Math.max(0, parseFloat(p.equipment) || 0),
    subcontract: Math.max(0, parseFloat(p.subcontract) || 0),
    overhead: Math.max(0, parseFloat(p.overhead) || 0),
  }));
  const labor = pkgs.reduce((a, p) => a + p.labor, 0);
  const materials = pkgs.reduce((a, p) => a + p.materials, 0);
  const equipment = pkgs.reduce((a, p) => a + p.equipment, 0);
  const subcontract = pkgs.reduce((a, p) => a + p.subcontract, 0);
  const overhead = pkgs.reduce((a, p) => a + p.overhead, 0);
  const totalCost = labor + materials + equipment + subcontract + overhead;

  let largestPackage = pkgs[0]?.name || "";
  let largestShare = 0;
  pkgs.forEach((p) => {
    const total = p.labor + p.materials + p.equipment + p.subcontract + p.overhead;
    const share = totalCost > 0 ? (total / totalCost) * 100 : 0;
    if (share > largestShare) {
      largestShare = share;
      largestPackage = p.name;
    }
  });

  return { labor, materials, equipment, subcontract, overhead, totalCost, largestPackage, largestShare };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

const NumInput = ({ id, label, value, onChange, prefix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

const WorkBreakdownStructureCostCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const updateRow = (id: number, key: keyof WorkPackage, value: string) =>
    setInputs((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    }));

  const addRow = () =>
    setInputs((prev) => ({
      ...prev,
      packages: [...prev.packages, { id: Date.now(), name: "New Package", labor: "20000", materials: "5000", equipment: "2000", subcontract: "5000", overhead: "3000" }],
    }));

  const removeRow = (id: number) =>
    setInputs((prev) => ({
      ...prev,
      packages: prev.packages.length > 1 ? prev.packages.filter((p) => p.id !== id) : prev.packages,
    }));

  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors = inputs.packages.some(
    (p) => num(p.labor) < 0 || num(p.materials) < 0 || num(p.equipment) < 0 || num(p.subcontract) < 0 || num(p.overhead) < 0
  );

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const directCosts = result.labor + result.materials;

  const breakdown = [
    { label: "Labor", value: fmtMoney(result.labor) },
    { label: "Materials", value: fmtMoney(result.materials) },
    { label: "Equipment", value: fmtMoney(result.equipment) },
    { label: "Subcontracts", value: fmtMoney(result.subcontract) },
    { label: "Overhead", value: fmtMoney(result.overhead) },
    { label: "Direct Costs (Labor + Materials)", value: fmtMoney(directCosts) },
    { label: "Largest Work Package", value: result.largestPackage },
    { label: "Largest Package Share", value: `${fmt(result.largestShare, 1)}%` },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="flex flex-col gap-3">
            {inputs.packages.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <label htmlFor={`pkg-${p.id}-name`} className="text-sm font-medium mb-1">Work Package {i + 1} Name</label>
                    <input id={`pkg-${p.id}-name`} type="text" value={p.name} onChange={(e) => updateRow(p.id, "name", e.target.value)} className="w-full h-10 px-3 py-1 text-base rounded-md border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id={`pkg-${p.id}-labor`} label="Labor" value={p.labor} onChange={(v) => updateRow(p.id, "labor", v)} prefix="$" />
                    <NumInput id={`pkg-${p.id}-materials`} label="Materials" value={p.materials} onChange={(v) => updateRow(p.id, "materials", v)} prefix="$" />
                    <NumInput id={`pkg-${p.id}-equipment`} label="Equipment" value={p.equipment} onChange={(v) => updateRow(p.id, "equipment", v)} prefix="$" />
                    <NumInput id={`pkg-${p.id}-subcontract`} label="Subcontract" value={p.subcontract} onChange={(v) => updateRow(p.id, "subcontract", v)} prefix="$" />
                    <NumInput id={`pkg-${p.id}-overhead`} label="Overhead" value={p.overhead} onChange={(v) => updateRow(p.id, "overhead", v)} prefix="$" />
                  </div>
                </div>
                {inputs.packages.length > 1 && (
                  <button type="button" onClick={() => removeRow(p.id)} className="self-end flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            <Plus className="h-4 w-4" /> Add Work Package
          </button>

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — all costs must be zero or positive.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Project Cost</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCost)}</div>
            <div className="text-sm text-muted-foreground mt-1">across {inputs.packages.length} work packages</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Largest Package</div>
              <div className="text-lg font-bold mt-1">{result.largestPackage}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Largest Share</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmt(result.largestShare, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Direct Costs</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmtMoney(directCosts)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Cost Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Project Cost</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.totalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Total Project Cost</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.totalCost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Work Breakdown Structure Costing?</h2>
            <p className="text-muted-foreground leading-relaxed">Work breakdown structure (WBS) costing is a bottom-up method of estimating a project by decomposing it into manageable work packages and pricing each one across its cost categories: labor, materials, equipment, subcontracts, and overhead. The project total is simply the sum of every package's lines, which makes the estimate far more defensible than a top-down guess because each number traces back to a named piece of work. The structure mirrors how work is actually planned, so the same roll-up doubles as a control tool during execution: actual spend can be compared against the same package lines, and variance analysis points straight at the package that is drifting rather than at the project as a whole. That traceability is the strongest argument for building project estimates this way, and it is why WBS costing remains the default for construction, engineering, software delivery, and most professional services engagements.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How WBS Cost Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Each work package carries five cost lines. Labor should use fully loaded rates — wages plus benefits and employer taxes. Materials should reflect committed quotes rather than list prices. Equipment covers rentals, depreciation, and operating costs. Subcontracts capture work performed by outside vendors, and overhead is the share of indirect costs such as management, facilities, and administration, which can be allocated per package or entered once as a project-level line on a single package. The calculator sums each category across all packages to give the five category subtotals, then adds them to produce the total project cost. It also identifies the largest work package by its share of the total, which is the first place to look when cost overruns appear or budget cuts are proposed. The model is deliberately additive: there are no hidden multipliers or allocations, so the estimate stays auditable. What matters most is consistency — decide how you treat each category and apply that treatment to every package. Keep packages at a consistent granularity, roughly two to ten percent of project cost each, so no single package hides too much, and name packages after deliverables rather than departments so the structure survives reorganizations.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">The total is your baseline for funding, contingency sizing, and earned-value calculations. The category subtotals reveal the project's cost profile — a labor-heavy project behaves differently from one dominated by subcontracts or equipment, and each carries different risk levers. The largest-package share is your concentration risk: if one package exceeds roughly a third of the total, its overrun alone can sink the project budget, so it deserves the most detailed estimating and the closest monitoring. Direct costs — labor plus materials — are the lines a WBS captures most reliably, so a large gap between direct costs and the total is a reminder that equipment, subcontracts, and overhead deserve the same estimating rigor. Re-run the roll-up whenever scope changes and compare against the original to quantify the change's cost impact before approving it, and compare actual spend against the same package lines during execution to catch drift early while there is still time to correct it.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/work-breakdown-structure-cost-calculator" />
      </div>
    </div>
  );
};

export default WorkBreakdownStructureCostCalculator;