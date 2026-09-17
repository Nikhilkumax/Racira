"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Clock, DollarSign } from "lucide-react";
import {
  BarChart as RBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface OvertimeInputs {
  hourlyRate: string;
  hoursWorked: string;
  otThreshold: string;
  otMultiplier: string;
  // Tier 2A
  doubleTimeThreshold: string;
  doubleTimeMultiplier: string;
  weeksPerYear: string;
  // Tier 2B
  proMode: boolean;
  bonus: string;
  unpaidBreakHours: string;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface ChartPoint {
  id: string;
  name: string;
  pay: number;
  fill: string;
}

interface OvertimeResult {
  paidHours: number;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  regularRate: number;
  regularPay: number;
  overtimePay: number;
  doubleTimePay: number;
  otPremium: number;
  totalPay: number;
  effectiveRate: number;
  otShareOfPay: number;
  annualPay: number;
  annualOtCost: number;
  isOvertime: boolean;
  rows: TableRow[];
  chartData: ChartPoint[];
}

const DEFAULTS: OvertimeInputs = {
  hourlyRate: "25",
  hoursWorked: "50",
  otThreshold: "40",
  otMultiplier: "1.5",
  doubleTimeThreshold: "60",
  doubleTimeMultiplier: "2",
  weeksPerYear: "52",
  proMode: false,
  bonus: "0",
  unpaidBreakHours: "0",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const calculate = (v: OvertimeInputs): OvertimeResult => {
  const baseRate = Math.max(0, parseFloat(v.hourlyRate) || 0);
  const rawHours = Math.max(0, parseFloat(v.hoursWorked) || 0);
  const otThreshold = Math.max(0, parseFloat(v.otThreshold) || 0);
  const otMultiplier = Math.max(1, parseFloat(v.otMultiplier) || 1.5);
  const dtThreshold = Math.max(otThreshold, parseFloat(v.doubleTimeThreshold) || 0);
  const dtMultiplier = Math.max(1, parseFloat(v.doubleTimeMultiplier) || 2);
  const weeksPerYear = Math.max(1, parseFloat(v.weeksPerYear) || 52);
  const bonus = v.proMode ? Math.max(0, parseFloat(v.bonus) || 0) : 0;
  const unpaidBreaks = v.proMode ? Math.max(0, parseFloat(v.unpaidBreakHours) || 0) : 0;

  // Unpaid meal breaks are not hours worked, so they never count toward overtime
  const paidHours = Math.max(0, rawHours - unpaidBreaks);

  // Split the week into the three FLSA-style tiers
  const regularHours = Math.min(paidHours, otThreshold);
  const doubleTimeHours = Math.max(0, paidHours - dtThreshold);
  const overtimeHours = Math.max(0, paidHours - otThreshold - doubleTimeHours);

  // FLSA regular rate of pay: nondiscretionary bonuses are folded into the base
  // rate before the overtime premium is applied, not paid on top of it.
  const regularRate = paidHours > 0 ? baseRate + bonus / paidHours : baseRate;

  const regularPay = regularHours * regularRate;
  const overtimePay = overtimeHours * regularRate * otMultiplier;
  const doubleTimePay = doubleTimeHours * regularRate * dtMultiplier;

  // The premium is the extra above straight time — the true marginal cost of OT
  const otPremium =
    overtimeHours * regularRate * (otMultiplier - 1) + doubleTimeHours * regularRate * (dtMultiplier - 1);

  const totalPay = regularPay + overtimePay + doubleTimePay;
  const effectiveRate = paidHours > 0 ? totalPay / paidHours : 0;
  const otShareOfPay = totalPay > 0 ? ((overtimePay + doubleTimePay) / totalPay) * 100 : 0;

  const annualPay = totalPay * weeksPerYear;
  const annualOtCost = (overtimePay + doubleTimePay) * weeksPerYear;

  const rows: TableRow[] = [
    { rowId: "rate", label: "Base hourly rate", value: `${money(baseRate)}/hr` },
    ...(v.proMode
      ? [
          { rowId: "bonus", label: "Nondiscretionary bonus this week", value: money(bonus) },
          { rowId: "regrate", label: "FLSA regular rate of pay", value: `${money(regularRate)}/hr` },
          { rowId: "breaks", label: "Unpaid break hours (not hours worked)", value: `${unpaidBreaks.toFixed(2)} hrs` },
        ]
      : []),
    { rowId: "paid", label: "Total paid hours worked", value: `${paidHours.toFixed(2)} hrs` },
    { rowId: "reg-hrs", label: `Straight-time hours (first ${otThreshold})`, value: `${regularHours.toFixed(2)} hrs` },
    { rowId: "ot-hrs", label: `Overtime hours (at ${otMultiplier}×)`, value: `${overtimeHours.toFixed(2)} hrs`, key: true },
    ...(doubleTimeHours > 0
      ? [{ rowId: "dt-hrs", label: `Double-time hours (past ${dtThreshold}, at ${dtMultiplier}×)`, value: `${doubleTimeHours.toFixed(2)} hrs` }]
      : []),
    { rowId: "reg-pay", label: "Straight-time pay", value: money(regularPay) },
    { rowId: "ot-pay", label: "Overtime pay", value: money(overtimePay) },
    ...(doubleTimeHours > 0 ? [{ rowId: "dt-pay", label: "Double-time pay", value: money(doubleTimePay) }] : []),
    { rowId: "premium", label: "Overtime premium (extra above straight time)", value: money(otPremium) },
    { rowId: "eff", label: "Effective hourly rate", value: `${money(effectiveRate)}/hr` },
    { rowId: "share", label: "Overtime as a share of the paycheck", value: `${otShareOfPay.toFixed(1)}%` },
    { rowId: "annual", label: `Annualised at ${weeksPerYear} weeks`, value: money(annualPay) },
    { rowId: "total", label: "Total gross pay this week", value: money(totalPay), total: true },
  ];

  const chartData: ChartPoint[] = [
    { id: "reg", name: "Straight time", pay: Math.round(regularPay * 100) / 100, fill: "hsl(217 91% 60%)" },
    { id: "ot", name: "Overtime", pay: Math.round(overtimePay * 100) / 100, fill: "hsl(25 95% 53%)" },
    ...(doubleTimeHours > 0
      ? [{ id: "dt", name: "Double time", pay: Math.round(doubleTimePay * 100) / 100, fill: "hsl(0 84% 60%)" }]
      : []),
    { id: "total", name: "Total pay", pay: Math.round(totalPay * 100) / 100, fill: "hsl(142 71% 45%)" },
  ];

  return {
    paidHours, regularHours, overtimeHours, doubleTimeHours,
    regularRate, regularPay, overtimePay, doubleTimePay, otPremium,
    totalPay, effectiveRate, otShareOfPay, annualPay, annualOtCost,
    isOvertime: overtimeHours + doubleTimeHours > 0,
    rows, chartData,
  };
};

interface TooltipEntry {
  value: number;
  payload: ChartPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold text-foreground">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{money(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const FAQS = [
  {
    question: "How is overtime pay calculated?",
    answer:
      "Overtime pay is the hours worked beyond the threshold multiplied by your regular rate and then by the overtime multiplier, which is normally 1.5. Under the US Fair Labor Standards Act, the threshold is 40 hours in a workweek and the multiplier is one and a half. This calculator derives the overtime hours for you from total hours worked rather than making you split them yourself, which is where most manual calculations go wrong.",
  },
  {
    question: "What is the 'regular rate of pay' and why is it not just my hourly wage?",
    answer:
      "The FLSA bases overtime on the regular rate, which includes nondiscretionary bonuses, shift differentials, and commissions — not only your base hourly wage. If you earn a 200 dollar production bonus in a 50-hour week, that bonus is spread across all 50 hours, raising your regular rate by 4 dollars, and the overtime premium is then calculated on the higher figure. Employers who pay overtime on the base wage alone while also paying nondiscretionary bonuses are underpaying, and this is one of the most common wage-and-hour violations. Professional Mode performs this calculation.",
  },
  {
    question: "What is the difference between overtime pay and the overtime premium?",
    answer:
      "Overtime pay is the full amount earned for those hours — at 1.5× it is the straight-time value plus half again. The overtime premium is only the extra portion above straight time, so at 1.5× the premium is 0.5× the regular rate. The distinction matters for employers deciding whether to hire additional staff, because only the premium is the genuine marginal cost of the overtime decision; the straight-time portion would be payable to whoever did the work.",
  },
  {
    question: "Why does my effective hourly rate go down when I work overtime?",
    answer:
      "It does not go down — it goes up, but by less than the overtime multiplier suggests, and that surprises people. At 25 dollars an hour with 40 regular hours and 10 overtime hours at time and a half, you earn 1,000 dollars plus 375 dollars, so 1,375 dollars across 50 hours, an effective rate of 27.50 dollars. That is higher than 25 but well below the 37.50 overtime rate, because the premium applies only to the last ten hours. The more overtime you work, the closer the effective rate creeps toward the overtime rate.",
  },
  {
    question: "What is double time and when does it apply?",
    answer:
      "Double time pays twice the regular rate. Federal US law does not require it at all — it comes from state law or union contracts. California is the best-known example, requiring double time beyond 12 hours in a workday and beyond 8 hours on the seventh consecutive day of a workweek. Some collective agreements also specify double time for holidays or Sundays. Set the double-time threshold in Advanced Options to match your own rule.",
  },
  {
    question: "Do unpaid meal breaks count toward overtime?",
    answer:
      "No. Only hours actually worked count toward the overtime threshold. A bona fide meal break of 30 minutes or more, during which you are fully relieved of duty, is not hours worked and is not paid. Short rest breaks of 5 to 20 minutes, by contrast, are compensable and do count. If you clock 45 hours but take five unpaid half-hour lunches, your paid hours are 42.5 and only 2.5 of them are overtime. Professional Mode subtracts unpaid breaks before splitting the tiers.",
  },
  {
    question: "Who is exempt from overtime?",
    answer:
      "Exemption depends on how you are paid and what you actually do, not on your job title. The main FLSA exemptions cover executive, administrative, professional, outside sales, and certain computer employees, and each requires meeting both a salary threshold and a duties test. Being paid a salary does not by itself make you exempt — a salaried employee whose duties fail the test is still owed overtime. Misclassification is a frequent source of back-pay claims.",
  },
  {
    question: "Can my employer average two weeks to avoid paying overtime?",
    answer:
      "Generally no. The FLSA workweek is a fixed and regularly recurring period of 168 hours, and overtime is owed on each workweek separately. Working 50 hours one week and 30 the next means 10 hours of overtime is owed, even though the two-week average is 40. A narrow exception exists for hospital and residential care employees under a formal 8/80 agreement, and for certain public-sector fire and police work periods.",
  },
];

export default function OvertimeHoursCalculator() {
  const [vals, setVals] = useState<OvertimeInputs>(DEFAULTS);
  const [result, setResult] = useState<OvertimeResult>(calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => setResult(calculate(vals));

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
    setShowAdvanced(false);
  };

  const updateVal = <K extends keyof OvertimeInputs>(key: K, val: OvertimeInputs[K]) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const lbl = "text-sm font-medium text-foreground mb-1 block";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Overtime Hours Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Overtime Hours Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Work Schedule
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={lbl}>Hourly Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={vals.hourlyRate}
                      onChange={(e) => updateVal("hourlyRate", e.target.value)}
                      className="input-calc h-10 text-base"
                      step="any"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$/hr</span>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Total Hours Worked This Week</label>
                  <input
                    type="number"
                    value={vals.hoursWorked}
                    onChange={(e) => updateVal("hoursWorked", e.target.value)}
                    className="input-calc h-10 text-base"
                    step="any"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter everything you worked. The calculator splits straight time, overtime and double time for you.
                  </p>
                </div>
                <div>
                  <label className={lbl}>Overtime Threshold</label>
                  <input
                    type="number"
                    value={vals.otThreshold}
                    onChange={(e) => updateVal("otThreshold", e.target.value)}
                    className="input-calc h-10 text-base"
                    step="any"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">40 hours per week under the US FLSA.</p>
                </div>
                <div>
                  <label className={lbl}>Overtime Multiplier</label>
                  <input
                    type="number"
                    value={vals.otMultiplier}
                    onChange={(e) => updateVal("otMultiplier", e.target.value)}
                    className="input-calc h-10 text-base"
                    step="0.1"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-sm font-semibold text-primary hover:underline text-left"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Double Time</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Threshold</label>
                      <input
                        type="number"
                        value={vals.doubleTimeThreshold}
                        onChange={(e) => updateVal("doubleTimeThreshold", e.target.value)}
                        className="input-calc h-10 text-base"
                        step="any"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={lbl}>Multiplier</label>
                      <input
                        type="number"
                        value={vals.doubleTimeMultiplier}
                        onChange={(e) => updateVal("doubleTimeMultiplier", e.target.value)}
                        className="input-calc h-10 text-base"
                        step="0.1"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Annualising</div>
                  <label className={lbl}>Weeks Worked Per Year</label>
                  <input
                    type="number"
                    value={vals.weeksPerYear}
                    onChange={(e) => updateVal("weeksPerYear", e.target.value)}
                    className="input-calc h-10 text-base"
                    step="any"
                    min="1"
                    max="52"
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vals.proMode}
                      onChange={(e) => updateVal("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Applies the FLSA regular-rate calculation, folding nondiscretionary bonuses into the overtime base and
                    excluding unpaid breaks from hours worked.
                  </p>
                  {vals.proMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Bonus This Week</label>
                        <input
                          type="number"
                          value={vals.bonus}
                          onChange={(e) => updateVal("bonus", e.target.value)}
                          className="input-calc h-10 text-base"
                          step="any"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className={lbl}>Unpaid Break Hours</label>
                        <input
                          type="number"
                          value={vals.unpaidBreakHours}
                          onChange={(e) => updateVal("unpaidBreakHours", e.target.value)}
                          className="input-calc h-10 text-base"
                          step="0.25"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCalculate}
                className="flex-1 h-10 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={reset}
                className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* 1. Primary */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none print:hidden"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Total Weekly Gross Pay
              </div>
              <div className="text-4xl font-bold text-primary mb-1">{money(result.totalPay)}</div>
              <p className="text-sm text-muted-foreground">
                {result.isOvertime
                  ? `${result.overtimeHours.toFixed(2)} overtime hours${result.doubleTimeHours > 0 ? ` and ${result.doubleTimeHours.toFixed(2)} double-time hours` : ""} · ${money(result.effectiveRate)} effective rate`
                  : `No overtime this week — all ${result.paidHours.toFixed(2)} hours are straight time.`}
              </p>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Straight Time</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{money(result.regularPay)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{result.regularHours.toFixed(1)} hrs</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Overtime Pay</div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: result.isOvertime ? "hsl(25 95% 53%)" : "hsl(215 16% 65%)" }}
                >
                  {money(result.overtimePay + result.doubleTimePay)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {(result.overtimeHours + result.doubleTimeHours).toFixed(1)} hrs
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">OT Share</div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      result.otShareOfPay === 0
                        ? "hsl(142 71% 45%)"
                        : result.otShareOfPay < 25
                        ? "hsl(25 95% 53%)"
                        : "hsl(0 84% 60%)",
                  }}
                >
                  {result.otShareOfPay.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">of gross pay</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Pay Breakdown</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {result.rows.map((r) => (
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
              <h3 className="text-base font-bold text-foreground mb-1">Where the Paycheck Comes From</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Straight time against the overtime tiers, with the weekly total for scale.
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RBar data={result.chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" width={60} />
                      <RTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="pay" name="Weekly pay" radius={[6, 6, 0, 0]}>
                        {result.chartData.map((d) => (
                          <Cell key={d.id} fill={d.fill} />
                        ))}
                      </Bar>
                    </RBar>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* 5. Summary statistics — same rows as the breakdown table */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {result.rows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {result.isOvertime
                  ? `The genuine marginal cost of this overtime is the ${money(result.otPremium)} premium, not the full ${money(result.overtimePay + result.doubleTimePay)} — the straight-time portion would be payable to whoever did the work. Sustained at ${vals.weeksPerYear} weeks, the premium alone runs to ${money(result.otPremium * (parseFloat(vals.weeksPerYear) || 52))} a year.`
                  : `All hours fall below the ${vals.otThreshold}-hour threshold, so no overtime premium is owed this week.`}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Overtime Hours Are Actually Determined</h2>
            <p>
              Overtime is not a category of work — it is a category of <em>hour</em>. Under the US Fair Labor Standards Act, every
              hour a non-exempt employee works beyond 40 in a fixed workweek is an overtime hour, and it must be paid at no less
              than one and a half times the regular rate. Nothing about the task changes; only its position in the week does. The
              41st hour is overtime whether it is spent on the same work as the first.
            </p>
            <p>
              That is why this calculator asks for total hours worked rather than asking you to type in the overtime hours
              separately. Splitting the tiers yourself is exactly where manual payroll calculations go wrong, particularly when a
              double-time threshold is also in play. Enter what you actually worked and the tiers are derived: straight time up to
              the threshold, overtime between the two thresholds, and double time beyond the second.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Regular Rate Is Not Your Hourly Wage</h2>
            <p>
              The single most misunderstood element of overtime law is the phrase &ldquo;regular rate of pay.&rdquo; It is a
              calculated figure, not the number on your offer letter. The FLSA requires that nondiscretionary bonuses, shift
              differentials, commissions, and most other forms of compensation be included in the regular rate before the overtime
              multiplier is applied.
            </p>
            <p>
              A worked example makes the difference concrete. Suppose you earn 25 dollars an hour, work 50 hours, and receive a
              200 dollar production bonus. The bonus is spread across all 50 hours worked, raising your regular rate to 29 dollars.
              Your ten overtime hours are then paid at 43.50 rather than 37.50 — a difference of 60 dollars in a single week.
              Employers who pay the bonus and separately pay overtime on the base wage are underpaying, and this specific error is
              among the most common findings in wage-and-hour audits. Professional Mode in this calculator performs the regular-rate
              computation so you can see both figures side by side.
            </p>

            <h2 className="text-2xl font-bold mb-3">Overtime Pay Versus the Overtime Premium</h2>
            <p>
              For employers deciding whether overtime is cheaper than hiring, the relevant number is not overtime pay but the
              overtime <strong>premium</strong> — the extra portion above straight time. At time and a half, the premium is half
              the regular rate; at double time, it equals the regular rate.
            </p>
            <p>
              The distinction matters because the straight-time component is not a marginal cost. That work has to be paid for
              regardless of who performs it, so it appears on the books either as overtime to an existing employee or as wages to
              a new one. Only the premium is genuinely attributable to the decision to use overtime. Weighed against the fixed
              costs of an additional headcount — recruitment, training, benefits, payroll taxes, equipment — a surprising amount of
              overtime turns out to be the cheaper option, which is precisely why so much of it exists. This calculator reports the
              premium separately, both weekly and annualised, so the comparison can be made on the correct number.
            </p>

            <h2 className="text-2xl font-bold mb-3">Double Time, Breaks, and the Rules That Trip People Up</h2>
            <p>
              Federal law never requires double time. Where it exists, it comes from state statute or a collective agreement.
              California is the prominent example, mandating double time beyond 12 hours in a workday and beyond 8 hours on the
              seventh consecutive day of work. Many union contracts add double time for holidays or Sundays. Set the threshold in
              Advanced Options to whatever rule governs your workplace.
            </p>
            <p>
              Two further rules catch people out. First, unpaid meal breaks are not hours worked, so they neither get paid nor
              count toward the overtime threshold — but short rest breaks of 5 to 20 minutes are compensable and do count. Clocking
              45 hours with five unpaid half-hour lunches means 42.5 paid hours and only 2.5 overtime hours. Second, the workweek
              stands alone: an employer generally cannot average a 50-hour week against a 30-hour week to avoid the premium. Ten
              hours of overtime is owed on the first week regardless of what the second looks like, with narrow exceptions for
              hospital 8/80 agreements and certain public-safety work periods.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/overtime-hours-calculator" />
          <PopularCalculators exclude="/calculator/overtime-hours-calculator" />
        </div>
      </div>
    </>
  );
}
