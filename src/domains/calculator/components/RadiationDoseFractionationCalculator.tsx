"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity } from "lucide-react";
import {
  BarChart as RBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 1. TypeScript Interfaces
interface RadiationInputs {
  totalDose: number; // Gy
  fractions: number;
  alphaBetaRatioTumor: number; // typically 10
  alphaBetaRatioNormal: number; // typically 3
}

interface RadiationResults {
  dosePerFraction: number;
  tumorBED: number;
  tumorEQD2: number;
  normalBED: number;
  normalEQD2: number;
  hypofractionated: boolean;
  largeFractionWarning: boolean;
  chartData: { id: string; name: string; eqd2: number; bed: number }[];
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

// 2. Pure Calculation Function
const calculateRadiation = (inputs: RadiationInputs): RadiationResults => {
  const { totalDose, fractions, alphaBetaRatioTumor, alphaBetaRatioNormal } = inputs;

  const dosePerFraction = totalDose / fractions;

  // BED = D * (1 + d / (a/b))
  const tumorBED = totalDose * (1 + dosePerFraction / alphaBetaRatioTumor);
  const normalBED = totalDose * (1 + dosePerFraction / alphaBetaRatioNormal);

  // EQD2 = D * [(d + a/b) / (2 + a/b)]
  const tumorEQD2 = totalDose * ((dosePerFraction + alphaBetaRatioTumor) / (2 + alphaBetaRatioTumor));
  const normalEQD2 = totalDose * ((dosePerFraction + alphaBetaRatioNormal) / (2 + alphaBetaRatioNormal));

  const chartData = [
    { id: "tumor", name: "Tumor Tissue", eqd2: Math.round(tumorEQD2 * 10) / 10, bed: Math.round(tumorBED * 10) / 10 },
    { id: "normal", name: "Normal Tissue", eqd2: Math.round(normalEQD2 * 10) / 10, bed: Math.round(normalBED * 10) / 10 },
  ];

  return {
    dosePerFraction,
    tumorBED,
    tumorEQD2,
    normalBED,
    normalEQD2,
    hypofractionated: dosePerFraction > 2,
    largeFractionWarning: dosePerFraction > 8,
    chartData,
  };
};

const DEFAULTS: RadiationInputs = {
  totalDose: 60,
  fractions: 30,
  alphaBetaRatioTumor: 10,
  alphaBetaRatioNormal: 3,
};

const DEFAULT_RESULTS = calculateRadiation(DEFAULTS);

interface TooltipEntry {
  value: number;
  payload: { name: string; eqd2: number; bed: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold text-muted-foreground mb-1 border-b border-border pb-1">{payload[0].payload.name}</p>
        <div className="flex flex-col gap-1 mt-1">
          <p className="text-primary font-bold">EQD2: {payload[0].payload.eqd2.toFixed(1)} Gy</p>
          <p className="text-amber-500 font-bold">BED: {payload[0].payload.bed.toFixed(1)} Gy</p>
        </div>
      </div>
    );
  }
  return null;
};

const FAQS = [
  {
    question: "What is the Linear-Quadratic (LQ) Model?",
    answer:
      "The LQ model is the radiobiological model used to predict how cells respond to radiation. It assumes cell death happens through two mechanisms: a linear (alpha) component, where a single radiation track breaks both DNA strands, and a quadratic (beta) component, where two separate tracks break them. The alpha/beta ratio of a tissue dictates how sensitive it is to the size of the daily fraction, and it is the engine behind every BED and EQD2 calculation.",
  },
  {
    question: "What is an alpha/beta ratio?",
    answer:
      "It is the dose, in Gray, at which the linear and quadratic cell-kill components contribute equally, and it measures how a tissue responds to fraction size. A ratio of 10 Gy is typical for most tumors and early-responding tissues: they are relatively insensitive to fraction size, so total dose drives the outcome. A ratio of 3 Gy is typical for late-responding normal tissues such as spinal cord and brain, which are highly sensitive to large daily doses. That gap is the entire basis for the therapeutic ratio of radiotherapy.",
  },
  {
    question: "What is Biologically Effective Dose (BED)?",
    answer:
      "BED is the true biological weight of a radiation course, accounting for fraction size and tissue repair between fractions. 60 Gy in 30 fractions has a very different biological effect from 60 Gy in 3, and BED converts both into a comparable number. Because BED depends on the alpha/beta ratio, it is always quoted for a specific tissue — a schedule's tumor BED and normal-tissue BED are different numbers.",
  },
  {
    question: "What is EQD2?",
    answer:
      "EQD2, equivalent dose in 2 Gy fractions, converts any fractionation schedule into the dose delivered in the historical standard of 2 Gy per day. Clinicians have decades of experience with 2 Gy schedules, so they know immediately whether an EQD2 of 45 Gy to the spinal cord is safe while 55 Gy is not. EQD2 makes hypofractionated and SBRT regimens legible to the same intuition as conventional schedules.",
  },
  {
    question: "What is hypofractionation and why is it becoming common?",
    answer:
      "Hypofractionation delivers larger doses per fraction in fewer total sessions — 20 Gy in 5 fractions instead of 60 Gy in 30, for example. Imaging guidance and dose delivery have improved to the point where the risk of hitting normal tissue is lower, so larger fractions are safer than they once were. The trade works because tumors have high alpha/beta ratios and tolerate large fractions, while late-responding normal tissue does not; matching fraction size to the ratio is what the calculation is for.",
  },
  {
    question: "What is SBRT and how is it different from conventional radiotherapy?",
    answer:
      "Stereotactic body radiotherapy delivers 8 Gy or more per fraction in three to five sessions using precise targeting and sharp dose fall-off. Because BED is nonlinear in fraction size, those large fractions are dramatically more biologically potent than the physical dose suggests — which is why the same cancer that once needed 60 Gy in 30 fractions can be treated with 48 Gy in 4. Every SBRT protocol is validated by exactly the BED and EQD2 mathematics this calculator performs.",
  },
  {
    question: "Why does a high alpha/beta ratio make a tissue less sensitive to fraction size?",
    answer:
      "A high ratio means the linear (alpha) kill dominates, and linear kill depends only on total dose — the damage from each fraction is already severe and repairs poorly regardless of size. A low ratio means the quadratic (beta) kill matters, and that mechanism scales with the square of the dose per fraction, so large fractions are disproportionately damaging. This is why the spinal cord, at 3 Gy, tolerates 45 Gy in 2 Gy fractions but would be catastrophically injured by 5 Gy fractions — while a tumor at 10 Gy barely notices the difference in schedule.",
  },
  {
    question: "Why does this calculator carry a clinical disclaimer?",
    answer:
      "BED and EQD2 are planning tools, not prescriptions. Real treatment decisions weigh tumor control probability, organ-at-risk tolerances, concurrent chemotherapy, prior radiation, and three-dimensional dose distributions that a two-point model cannot represent. The fraction-count repair term in the full BED formula and the choice of alpha/beta values for specific tumors (prostate, for example, is debated at 1.5 to 3 Gy) are additional clinical judgements. Use this calculator to understand the biology and sanity-check a schedule — never to design one.",
  },
];

export default function RadiationDoseFractionationCalculator() {
  const [inputs, setInputs] = useState<RadiationInputs>(DEFAULTS);
  const [results, setResults] = useState<RadiationResults>(DEFAULT_RESULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof RadiationInputs>(key: K, val: RadiationInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResults(calculateRadiation(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(DEFAULT_RESULTS);
    setShowAdvanced(false);
  };

  useEffect(() => {
    setMounted(true);
    setResults(calculateRadiation(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.totalDose, inputs.fractions, inputs.alphaBetaRatioTumor, inputs.alphaBetaRatioNormal]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Radiation Dose Fractionation</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const rows: TableRow[] = [
    { rowId: "dose", label: "Total physical dose (D)", value: `${inputs.totalDose.toFixed(1)} Gy` },
    { rowId: "frac", label: "Number of fractions (n)", value: `${inputs.fractions}` },
    { rowId: "df", label: "Dose per fraction (d = D ÷ n)", value: `${results.dosePerFraction.toFixed(2)} Gy`, key: true },
    { rowId: "ab-t", label: `Tumor α/β ratio`, value: `${inputs.alphaBetaRatioTumor.toFixed(1)} Gy` },
    { rowId: "bed-t", label: "Tumor BED", value: `${results.tumorBED.toFixed(1)} Gy` },
    { rowId: "eqd2-t", label: "Tumor EQD2", value: `${results.tumorEQD2.toFixed(1)} Gy` },
    { rowId: "ab-n", label: `Normal tissue α/β ratio`, value: `${inputs.alphaBetaRatioNormal.toFixed(1)} Gy` },
    { rowId: "bed-n", label: "Normal tissue BED", value: `${results.normalBED.toFixed(1)} Gy` },
    { rowId: "eqd2-n", label: "Normal tissue EQD2", value: `${results.normalEQD2.toFixed(1)} Gy` },
    { rowId: "std", label: "Standard fraction size", value: "2 Gy" },
    {
      rowId: "interpretation",
      label: "Interpretation",
      value: results.hypofractionated
        ? `Hypofractionated — ${results.dosePerFraction.toFixed(1)} Gy/fraction`
        : `Conventional — ≤ 2 Gy/fraction`,
      total: true,
    },
  ];

  const wrap =
    "relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "flex items-center text-sm font-medium text-foreground mb-1";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Radiation Dose Fractionation Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radiation Dose Fractionation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1 text-sm">
                <Activity className="h-4 w-4" /> Linear-Quadratic Model
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculate Biologically Effective Dose (BED) and Equivalent Dose in 2 Gy fractions (EQD2) to compare altered
                radiotherapy schedules.
              </p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Total Physical Dose (D)</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.totalDose}
                  onChange={(e) => set("totalDose", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={0.5}
                />
                <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">Gy</span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Number of Fractions (n)</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.fractions}
                  onChange={(e) => set("fractions", parseInt(e.target.value, 10) || 0)}
                  className={ci}
                  min={1}
                  step={1}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Alpha/Beta Ratios (α/β){" "}
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Tumor (Acute)</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.alphaBetaRatioTumor}
                        onChange={(e) => set("alphaBetaRatioTumor", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0.1}
                        step={0.5}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Normal (Late)</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.alphaBetaRatioNormal}
                        onChange={(e) => set("alphaBetaRatioNormal", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0.1}
                        step={0.5}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            <div ref={printRef} className="flex flex-col gap-4">
              {/* 1. Primary Result Card (Tumor EQD2) */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                <button
                  onClick={handlePrint}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10"
                  aria-label="Print Results"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                    Standardized Tumor EQD2 (α/β = {inputs.alphaBetaRatioTumor.toFixed(1)})
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-4xl font-bold tracking-tight text-primary">{results.tumorEQD2.toFixed(1)}</div>
                    <div className="text-lg font-semibold text-muted-foreground">Gy</div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold mt-2 bg-background/60 px-3 py-1.5 rounded-full border border-border">
                    Dose per fraction: {results.dosePerFraction.toFixed(2)} Gy
                    {results.hypofractionated && results.largeFractionWarning ? " · large fraction — check normal tissue" : ""}
                  </div>
                </div>
                <Activity className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-primary" />
              </div>

              {/* 2. Three-stat bar */}
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                <div className="p-4 text-center">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Dose / Fraction</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: results.largeFractionWarning ? "hsl(0 84% 60%)" : "hsl(142 71% 45%)" }}
                  >
                    {results.dosePerFraction.toFixed(2)} Gy
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{inputs.fractions} fractions</div>
                </div>
                <div className="p-4 text-center border-l border-border">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Tumor EQD2</div>
                  <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{results.tumorEQD2.toFixed(1)} Gy</div>
                  <div className="text-xs text-muted-foreground mt-0.5">α/β {inputs.alphaBetaRatioTumor.toFixed(1)}</div>
                </div>
                <div className="p-4 text-center border-l border-border">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Normal EQD2</div>
                  <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{results.normalEQD2.toFixed(1)} Gy</div>
                  <div className="text-xs text-muted-foreground mt-0.5">α/β {inputs.alphaBetaRatioNormal.toFixed(1)}</div>
                </div>
              </div>

              {/* 3. Breakdown table */}
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Fractionation Breakdown</h3>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.rowId}
                        className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                      >
                        <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                        <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Chart */}
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-1">Biological vs Physical Dose</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  EQD2 and BED for each tissue at this schedule. Physical dose is {inputs.totalDose.toFixed(1)} Gy for both; the
                  biological weight diverges because the two tissues respond differently to the {results.dosePerFraction.toFixed(2)} Gy fraction.
                </p>
                <div style={{ height: 250 }}>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RBar data={results.chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" tickLine={false} axisLine={false} />
                        <RTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(215 16% 65% / 0.1)" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="eqd2" name="EQD2" radius={[4, 4, 0, 0]} maxBarSize={40} fill="hsl(217 91% 60%)" />
                        <Bar dataKey="bed" name="BED" radius={[4, 4, 0, 0]} maxBarSize={40} fill="hsl(25 95% 53%)" />
                      </RBar>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* 5. Summary statistics — same rows as the breakdown table */}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {rows.map((r) => (
                    <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {results.hypofractionated
                    ? `At ${results.dosePerFraction.toFixed(2)} Gy per fraction this schedule is hypofractionated. The tumor EQD2 of ${results.tumorEQD2.toFixed(1)} Gy holds its biological punch, but normal tissue EQD2 of ${results.normalEQD2.toFixed(1)} Gy is what actually limits the plan — late-responding tissues pay for large fractions disproportionately.`
                    : `At ${results.dosePerFraction.toFixed(2)} Gy per fraction this is a conventionally fractionated schedule, close to the 2 Gy standard the EQD2 scale is built on.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Radiation Dose Fractionation</h2>
            <p>
              In modern oncology, radiation therapy is a cornerstone of cancer treatment. However, prescribing radiation is not as
              simple as giving a patient a total physical dose (e.g., 60 Gray) all at once. Delivering a massive dose in a single
              burst causes catastrophic damage to healthy tissue. To protect the patient, radiation oncologists use
              <strong> fractionation</strong> — splitting the total dose into small daily treatments delivered over several weeks.
              This <strong>Radiation Dose Fractionation Calculator</strong> uses the Linear-Quadratic (LQ) model to compute the
              true biological effect of any schedule, returning the Biologically Effective Dose (BED) and the Equivalent Dose in
              2 Gy fractions (EQD2).
            </p>

            <h2 className="text-2xl font-bold mb-3">Why We Fractionate Radiation</h2>
            <p>
              The success of radiotherapy rests on a biological asymmetry known as the therapeutic index. Normal cells possess
              highly efficient DNA repair mechanisms. After a small dose such as 2 Gray, both the tumor and the healthy tissue
              suffer DNA damage, but within roughly 24 hours the healthy tissue has largely repaired its sublethal damage while
              the chaotic, rapidly dividing tumor cells — with defective repair — accumulate permanent injury. Daily fractions
              exploit that difference: healthy tissue continually recovers between treatments, and the tumor does not.
            </p>
            <p>
              Fractionation also exploits the oxygen effect: well-oxygenated tissue is more radiosensitive, and a fractionated
              course allows transiently hypoxic (oxygen-poor) tumor regions to reoxygenate between doses, making subsequent
              fractions more effective. Both mechanisms — repair and reoxygenation — are bought with the one currency this
              calculator quantifies: how much biological damage a given physical dose does to each tissue type.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Linear-Quadratic (LQ) Model</h2>
            <p>
              The LQ model is the mathematical foundation of modern radiobiology. It states that radiation kills cells through two
              distinct mechanisms. The <strong>alpha (linear) component</strong> represents a single track breaking both DNA
              strands simultaneously — damage that is unrepairable and proportional to total dose regardless of fraction size. The{" "}
              <strong>beta (quadratic) component</strong> represents two separate tracks, each breaking one strand close in space
              and time, which jointly form a double-strand break. The quadratic term depends on the square of the dose, which is
              why the size of each fraction matters: big fractions disproportionately increase beta-type damage.
            </p>
            <p>
              The alpha/beta ratio is the dose at which the two contributions are equal, and it is the single input that
              determines how a tissue reacts to fractionation. Values of 10 Gy or higher describe most tumors and early-responding
              tissues — driven by total dose, insensitive to fraction size. Values around 3 Gy describe late-responding normal
              tissues such as spinal cord, brain, kidney, and connective tissue — driven by fraction size, and damaged
              disproportionately by large daily doses.
            </p>

            <h2 className="text-2xl font-bold mb-3">Biologically Effective Dose (BED)</h2>
            <p>
              Physical dose cannot be compared across schedules. Sixty Gray in 30 fractions of 2 Gy is a routine, well-tolerated
              prostate regimen; sixty Gray in 3 fractions of 20 Gy would be a catastrophe for surrounding tissue. BED solves the
              comparison by weighting total dose with a fraction-size term: BED equals D times one plus d over alpha/beta. Because
              the formula contains alpha/beta, BED is tissue-specific — a single schedule has a tumor BED and a different
              normal-tissue BED, and the gap between them is a measure of how much therapeutic room the schedule has.
            </p>

            <h2 className="text-2xl font-bold mb-3">Equivalent Dose in 2 Gy Fractions (EQD2)</h2>
            <p>
              Clinicians have spent decades accumulating intuition in one language: the 2 Gy daily fraction. The spinal cord
              tolerates roughly 45 to 50 Gy in 2 Gy fractions before the risk of myelopathy becomes serious; the brain similarly.
              EQD2 translates any other schedule into that familiar currency: it asks what total dose delivered at 2 Gy per
              fraction would produce the same biological effect as the schedule being evaluated.
            </p>
            <p>
              The practical value is immediate. When a hypofractionated lung SBRT plan is checked, the physician does not ask
              &ldquo;is 12 Gy times 4 safe for the esophagus?&rdquo; in that unfamiliar form. The plan is converted to the
              esophageal EQD2, compared against the decades-old tolerance tables, and judged in the language those tables were
              written in. This calculator performs exactly that conversion for both a tumor and a normal tissue, side by side, so
              the therapeutic ratio of the schedule is visible in one view.
            </p>

            <h2 className="text-2xl font-bold mb-3">Clinical Uses: Hypofractionation and SBRT</h2>
            <p>
              Prostate cancer used to mean eight weeks of daily treatment. Modern evidence supports moderate hypofractionation —
              60 Gy in 20 fractions, or 70 Gy in 28 — with the same tumour control and acceptable toxicity, cutting clinic visits
              nearly in half. Stereotactic body radiotherapy pushes further, delivering 8 Gy or more per fraction in three to five
              sessions for lung, spine, and liver lesions. Because BED grows faster than linearly with fraction size, an 8 Gy
              fraction is far more than four times as biologically potent as a 2 Gy fraction, which is how small physical doses
              achieve high tumor control.
            </p>
            <p>
              The same nonlinearity is why SBRT is only safe with precision delivery. The normal tissue around a lesion still
              receives the large fraction, and its low alpha/beta ratio converts that dose into a punishing EQD2. The technique
              succeeds because image guidance and rapid dose fall-off confine the large fractions to a small volume of normal
              tissue — a three-dimensional judgement this two-point model cannot make for you. Use the numbers it produces to
              understand the biology, and leave the plan design to the radiation oncology team.
            </p>
          </section>

          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/radiation-dose-fractionation-calculator" />
          <PopularCalculators exclude="/calculator/radiation-dose-fractionation-calculator" />
        </div>
      </div>
    </>
  );
}
