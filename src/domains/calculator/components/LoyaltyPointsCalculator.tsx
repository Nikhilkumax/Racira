"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PointsInputs {
  balance: number;     // points held
  centsPerPoint: number; // program baseline value
  program: string;     // "cashback" | "travel" | "giftcard"
  redemption: string;  // how points are redeemed
}

interface PointsResults {
  centsPerPoint: number;
  value: number;
  redemptionMultiplier: number;
  chartData: { name: string; value: number; selected: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const PROGRAMS: Record<string, { label: string; cents: number }> = {
  cashback: { label: "Cash Back", cents: 1.0 },
  travel: { label: "Travel / Miles", cents: 1.3 },
  giftcard: { label: "Gift Cards", cents: 0.8 },
};

const REDEMPTIONS: Record<string, { label: string; multiplier: number }> = {
  statement: { label: "Statement Credit", multiplier: 1.0 },
  giftcard: { label: "Gift Card", multiplier: 0.9 },
  travel: { label: "Travel Portal", multiplier: 1.25 },
  transfer: { label: "Transfer Partner", multiplier: 1.5 },
};

function calcPoints(i: PointsInputs): PointsResults {
  const prog = PROGRAMS[i.program] ?? PROGRAMS.cashback;
  const red = REDEMPTIONS[i.redemption] ?? REDEMPTIONS.statement;
  const centsPerPoint = prog.cents * red.multiplier;
  const value = (i.balance * centsPerPoint) / 100;

  const chartData = Object.entries(REDEMPTIONS).map(([k, v]) => ({
    name: v.label.split(" ")[0],
    value: +((i.balance * prog.cents * v.multiplier) / 100).toFixed(2),
    selected: k === i.redemption,
  }));

  const breakdown = [
    { label: "Points Balance", value: `${i.balance.toLocaleString()}` },
    { label: "Program", value: prog.label },
    { label: `Base Value (${prog.cents.toFixed(2)}¢/pt)`, value: `${prog.cents.toFixed(2)}¢` },
    { label: `Redemption (${red.label})`, value: `${red.multiplier.toFixed(2)}×` },
    { label: "Effective Value", value: `${centsPerPoint.toFixed(2)}¢/pt` },
    { label: "Total Value", value: `$${value.toFixed(2)}`, highlight: true, isTotal: true },
  ];

  const summaryStats = [
    { label: "Total Value", value: `$${value.toFixed(2)}` },
    { label: "Points Balance", value: `${i.balance.toLocaleString()}` },
    { label: "Effective Value", value: `${centsPerPoint.toFixed(2)}¢/pt` },
    { label: "Base Program", value: `${prog.cents.toFixed(2)}¢/pt` },
    { label: "Redemption Type", value: red.label },
    { label: "Multiplier", value: `${red.multiplier.toFixed(2)}×` },
    { label: "Value per 1,000 Pts", value: `$${((1000 * centsPerPoint) / 100).toFixed(2)}` },
    { label: "Break-Even Spend", value: `$${((i.balance / 100) * (100 / 2)).toLocaleString(undefined, { maximumFractionDigits: 0 })} (at 2 pts/$)` },
  ];

  return { centsPerPoint, value, redemptionMultiplier: red.multiplier, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  balance: "25000",
  centsPerPoint: "1.0",
  program: "cashback",
  redemption: "statement",
};

// 4. Component
export default function LoyaltyPointsCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PointsResults>(() => calcPoints({ balance: 25000, centsPerPoint: 1.0, program: "cashback", redemption: "statement" }));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPoints({ balance: 25000, centsPerPoint: 1.0, program: "cashback", redemption: "statement" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const selectProgram = (p: string) => setInputs((s) => ({ ...s, program: p, centsPerPoint: String(PROGRAMS[p]?.cents ?? s.centsPerPoint) }));

  const calculate = () =>
    setResult(
      calcPoints({
        balance: parseFloat(inputs.balance) || 0,
        centsPerPoint: parseFloat(inputs.centsPerPoint) || 0,
        program: inputs.program,
        redemption: inputs.redemption,
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPoints({ balance: 25000, centsPerPoint: 1.0, program: "cashback", redemption: "statement" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const balance = parseFloat(inputs.balance) || 0;
  const centsPerPoint = parseFloat(inputs.centsPerPoint) || 0;
  if (balance <= 0) errors.balance = "Must be greater than 0";
  if (centsPerPoint <= 0) errors.centsPerPoint = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is a point worth?", answer: "Cash-back programs typically value a point at 1 cent, travel programs at 1.3–1.5 cents, and gift-card redemptions at 0.8–0.9 cents. The effective value depends on how you redeem: statement credits are baseline, travel portals add ~25%, and transferring to airline partners can reach 1.5¢ or more per point." },
    { question: "How do I calculate the dollar value of my points?", answer: "Multiply points by the effective cents-per-point value and divide by 100. 25,000 points at 1 cent each are worth $250; at 1.25 cents (travel portal) they're worth $312.50. The calculator does this for you across redemption types so you can see which way to cash out." },
    { question: "Is it ever better to redeem for gift cards?", answer: "Sometimes, when gift cards carry a bonus (e.g., $100 card for 8,000 points instead of 10,000). Absent bonuses, gift cards usually return less than statement credits because the program takes a cut. Check the effective multiplier before choosing — the calculator shows each redemption type's value side by side." },
    { question: "How many points do I earn per dollar spent?", answer: "Most cards earn 1–2 points per dollar, with bonus categories earning 3–5×. At 2 points per dollar and a 1¢ value, you're earning a 2% return on spending. The break-even figure in the summary shows the spend that produced your current balance at that earn rate." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Loyalty Points Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loyalty Points Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="balance" className={lbl}>Points Balance</label>
                <div className={inp}>
                  <input id="balance" type="number" min="1" step="100" value={inputs.balance} onChange={(e) => set("balance")(e.target.value)} className={ci} />
                </div>
                {errors.balance && <p className="text-xs text-red-500 font-medium mt-1">{errors.balance}</p>}
              </div>
              <div>
                <label htmlFor="program" className={lbl}>Program Type</label>
                <select id="program" value={inputs.program} onChange={(e) => selectProgram(e.target.value)} className={sel}>
                  {Object.entries(PROGRAMS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="centsPerPoint" className={lbl}>Base Value per Point</label>
              <div className={inp}>
                <input id="centsPerPoint" type="number" min="0.01" step="0.05" value={inputs.centsPerPoint} onChange={(e) => set("centsPerPoint")(e.target.value)} className={ci} />
                <span className="pr-3 text-muted-foreground text-sm">¢/pt</span>
              </div>
              {errors.centsPerPoint && <p className="text-xs text-red-500 font-medium mt-1">{errors.centsPerPoint}</p>}
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Redemption Strategy</div>
                    <div>
                      <label htmlFor="redemption" className={lbl}>Redemption Type</label>
                      <select id="redemption" value={inputs.redemption} onChange={(e) => set("redemption")(e.target.value)} className={sel}>
                        {Object.entries(REDEMPTIONS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label} ({v.multiplier.toFixed(2)}×)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Points Dollar Value</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.value.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.centsPerPoint.toFixed(2)}¢/pt effective · {parseFloat(inputs.balance).toLocaleString()} points
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Base Value", `${PROGRAMS[inputs.program]?.cents.toFixed(2) ?? "1.00"}¢`],
                ["Multiplier", `${result.redemptionMultiplier.toFixed(2)}×`],
                ["Value per 1,000", `$${((1000 * result.centsPerPoint) / 100).toFixed(2)}`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Valuation Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Value by Redemption Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, i) => (
                      <Cell key={i} fill={d.selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Transfer partners and travel portals typically return 25–50% more than statement credits.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Points Are Currency — Value Them That Way</h2>
            <p>Loyalty points have a cash value, but it's not one number — it depends on the program and the redemption. Cash-back programs anchor at 1 cent per point; travel and miles programs are worth more (1.3¢ typical); gift cards less (0.8¢). The calculator multiplies your balance by the effective rate, so 25,000 points is either $250 or $312 depending on how you cash out.</p>
            <h2 className="text-2xl font-bold mb-3">Redemption Strategy Is the Real Return</h2>
            <p>The gap between statement credits and transfer-partner redemptions is often 50% or more. Travel portals add about 25% to point value, and transferring to airline partners can push past 1.5 cents per point for premium redemptions. The chart shows the same balance valued every way — redemption choice is where loyal customers either gain or give back value.</p>
            <h2 className="text-2xl font-bold mb-3">Don't Hoard, Don't Waste</h2>
            <p>Points devalue: programs raise redemption prices and cap values as part of regular "revenue management." A balance earning dust in an account is a depreciating asset. The practical rule: redeem at your best available multiplier when the value is there, and never buy points speculatively — the calculator's break-even line keeps the earning side honest.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loyalty-points-calculator" />
          <PopularCalculators exclude="/calculator/loyalty-points-calculator" />
        </div>
      </div>
    </>
  );
}
