"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RoicInputs {
  ebit: number;
  taxRate: number;
  totalDebt: number;
  totalEquity: number;
  cash: number;
  wacc: number;
  revenue: number;
}

const DEFAULTS: RoicInputs = {
  ebit: 12000000,
  taxRate: 21,
  totalDebt: 20000000,
  totalEquity: 30000000,
  cash: 4000000,
  wacc: 8,
  revenue: 40000000,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const money2 = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

interface DecompositionRow {
  item: string;
  value: string;
  note: string;
}

interface RoicResult {
  valid: boolean;
  errorMsg: string;
  nopat: number;
  investedCapital: number;
  waccUsed: number;
  roic: number;
  spread: number;
  eva: number;
  margin: number;
  turnover: number;
  debtShare: number;
  afterTaxFactor: number;
  verdict: string;
  verdictTone: string;
  rows: DecompositionRow[];
  summary: { label: string; value: string; tone?: string }[];
}

function compute(i: RoicInputs): RoicResult {
  const taxRate = Math.max(0, Math.min(60, i.taxRate)) / 100;
  const ebit = i.ebit;
  const nopat = ebit * (1 - taxRate);
  const cash = Math.max(0, i.cash);
  const investedCapital = Math.max(0.01, i.totalDebt + i.totalEquity - cash);
  const roic = (nopat / investedCapital) * 100;
  const spread = roic - i.wacc;
  const eva = (spread / 100) * investedCapital;
  const margin = i.revenue > 0 ? (ebit / i.revenue) * 100 : 0;
  const turnover = i.revenue > 0 ? i.revenue / investedCapital : 0;
  const debtShare = ((i.totalDebt / Math.max(i.totalDebt + i.totalEquity, 0.01)) * 100) || 0;

  const verdict =
    spread > 5 ? "Creating value well above its cost of capital" : spread > 0 ? "Creating value above its cost of capital" : spread === 0 ? "Exactly covering its cost of capital" : "Destroying value against its cost of capital";
  const verdictTone = spread > 0 ? "text-emerald-600" : "text-destructive";

  const rows: DecompositionRow[] = [
    { item: "EBIT", value: money(ebit), note: "Operating profit before interest and tax." },
    { item: "Tax rate applied", value: fmt(i.taxRate, 2) + "%", note: "Effective rate used to convert operating profit to NOPAT." },
    { item: "NOPAT", value: money(nopat), note: "Net operating profit after tax — the numerator of ROIC." },
    { item: "Total debt", value: money(i.totalDebt), note: "Interest-bearing borrowings, including leases where capitalised." },
    { item: "Total equity", value: money(i.totalEquity), note: "Book value of shareholders' funds." },
    { item: "Less cash", value: "− " + money(cash), note: "Excess cash is excluded because it is not operating capital." },
    { item: "Invested capital", value: money(investedCapital), note: "Debt plus equity less excess cash — the denominator of ROIC." },
    { item: "Operating margin", value: fmt(margin, 2) + "%", note: "EBIT divided by revenue; how much profit each sales dollar produces." },
    { item: "Capital turnover", value: fmt(turnover, 2) + "x", note: "Revenue divided by invested capital; how hard the capital works." },
    { item: "Debt share of capital", value: fmt(debtShare, 2) + "%", note: "Debt as a share of debt plus equity, before netting cash." },
    { item: "WACC", value: fmt(i.wacc, 2) + "%", note: "The blended cost of the capital employed." },
    { item: "ROIC spread over WACC", value: fmt(spread, 2) + " pp", note: "Positive means each incremental dollar of capital creates value." },
    { item: "Economic profit (EVA)", value: money(eva), note: "The dollar value created above the cost of capital each year." },
  ];

  const valid =
    i.ebit > -1000000000 &&
    i.taxRate >= 0 &&
    i.taxRate <= 60 &&
    i.totalDebt >= 0 &&
    i.totalEquity >= 0 &&
    i.totalDebt + i.totalEquity - cash > 0 &&
    i.cash >= 0 &&
    i.wacc >= 0 &&
    i.wacc <= 40 &&
    i.revenue >= 0;
  const errorMsg = valid
    ? ""
    : "Enter an EBIT figure, a tax rate between 0% and 60%, non-negative debt, equity, cash and revenue, a WACC up to 40%, and ensure invested capital is positive.";

  return {
    valid,
    errorMsg,
    nopat,
    investedCapital,
    waccUsed: i.wacc,
    roic,
    spread,
    eva,
    margin,
    turnover,
    debtShare,
    afterTaxFactor: 1 - taxRate,
    verdict,
    verdictTone,
    rows,
    summary: [
      { label: "EBIT", value: money(ebit) },
      { label: "Tax Rate", value: fmt(i.taxRate, 2) + "%" },
      { label: "NOPAT", value: money(nopat), tone: "text-primary" },
      { label: "Total Debt", value: money(i.totalDebt) },
      { label: "Total Equity", value: money(i.totalEquity) },
      { label: "Cash & Equivalents", value: money(cash) },
      { label: "Invested Capital", value: money(investedCapital) },
      { label: "ROIC", value: fmt(roic, 2) + "%", tone: "text-primary" },
      { label: "WACC", value: fmt(i.wacc, 2) + "%" },
      { label: "Spread", value: fmt(spread, 2) + " pp", tone: spread >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Economic Profit (EVA)", value: money(eva), tone: eva >= 0 ? "text-emerald-600" : "text-destructive" },
      { label: "Operating Margin", value: fmt(margin, 2) + "%" },
      { label: "Capital Turnover", value: fmt(turnover, 2) + "x" },
      { label: "Debt Share of Capital", value: fmt(debtShare, 2) + "%" },
      { label: "Cost of Capital in Dollars", value: money((i.wacc / 100) * investedCapital) },
      { label: "Verdict", value: verdict, tone: verdictTone },
    ],
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  suffix,
  tooltip,
  type = "number",
  min,
  max,
  step,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function ReturnOnInvestedCapitalRoicCalculator() {
  const [ebit, setEbit] = useState(String(DEFAULTS.ebit));
  const [taxRate, setTaxRate] = useState(String(DEFAULTS.taxRate));
  const [totalDebt, setTotalDebt] = useState(String(DEFAULTS.totalDebt));
  const [totalEquity, setTotalEquity] = useState(String(DEFAULTS.totalEquity));
  const [cash, setCash] = useState(String(DEFAULTS.cash));
  const [wacc, setWacc] = useState(String(DEFAULTS.wacc));
  const [revenue, setRevenue] = useState(String(DEFAULTS.revenue));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): RoicInputs => ({
    ebit: parseFloat(ebit) || 0,
    taxRate: parseFloat(taxRate) || 0,
    totalDebt: parseFloat(totalDebt) || 0,
    totalEquity: parseFloat(totalEquity) || 0,
    cash: parseFloat(cash) || 0,
    wacc: parseFloat(wacc) || 0,
    revenue: parseFloat(revenue) || 0,
  });

  const [results, setResults] = useState<RoicResult>(() => compute(DEFAULTS));

  const runCalculate = () => setResults(compute(getInputs()));

  const reset = () => {
    setEbit(String(DEFAULTS.ebit));
    setTaxRate(String(DEFAULTS.taxRate));
    setTotalDebt(String(DEFAULTS.totalDebt));
    setTotalEquity(String(DEFAULTS.totalEquity));
    setCash(String(DEFAULTS.cash));
    setWacc(String(DEFAULTS.wacc));
    setRevenue(String(DEFAULTS.revenue));
    setResults(compute(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is return on invested capital?",
      answer:
        "ROIC measures how much operating profit a company generates for every dollar of capital invested in the business. The numerator is net operating profit after tax, which excludes interest so that the measure is independent of how the company is financed. The denominator is debt plus equity less excess cash, the capital actually employed in operations. A company earning 20% on invested capital creates value quickly; one earning 6% on the same capital is barely covering its costs.",
    },
    {
      question: "Why compare ROIC with WACC?",
      answer:
        "Because capital is never free. WACC is the blended cost of the debt and equity a company uses, and it is the minimum return a business must earn to be worth operating as it is. The difference between ROIC and WACC is the economic profit spread: positive means every extra dollar of capital creates value, negative means growth actually destroys value. A growing company with ROIC below its WACC is compounding a loss, not building wealth.",
    },
    {
      question: "What is economic value added?",
      answer:
        "EVA converts the spread into dollars: it multiplies ROIC minus WACC by invested capital. A company with $46 million of capital, a 20.6% ROIC and an 8% WACC creates about $5.8 million of value a year. EVA is useful because it scales with the size of the capital base, which makes it directly comparable with reported earnings — and it shows how much of a company's profit is simply the cost of the capital it consumed.",
    },
    {
      question: "How do margin and turnover combine in ROIC?",
      answer:
        "ROIC equals operating margin multiplied by capital turnover, all multiplied by one minus the tax rate. That decomposition explains why two companies with the same ROIC can look completely different: a software business might earn a 30% margin with 0.9x turnover, while a distributor earns 4% with 6x turnover. Both create value, but through different mechanisms, and the levers available to improve ROIC differ accordingly.",
    },
    {
      question: "Should excess cash be excluded from invested capital?",
      answer:
        "Yes, because cash sitting on the balance sheet is not required for operations and would otherwise flatter the denominator, making ROIC look lower than the operating business deserves. The convention is to subtract cash and short-term investments from the capital base. For companies holding large cash balances deliberately — or financial firms, where cash is inventory — the adjustment needs judgement rather than a fixed rule.",
    },
    {
      question: "Why use EBIT rather than net income?",
      answer:
        "Because net income depends on the capital structure: interest expense reflects how the company is financed, not how well it operates. Using EBIT in the numerator and total capital in the denominator keeps the comparison about operating performance. That is also why the tax rate is applied separately — the NOPAT figure shows what the operating profit would be if the business were unlevered and taxed at the effective rate.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Return on Invested Capital (ROIC) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Return on Invested Capital (ROIC) Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Operating Profit & Capital">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="ebit"
                  label="EBIT"
                  value={ebit}
                  onChange={setEbit}
                  onEnter={runCalculate}
                  prefix="$"
                  step="100000"
                  tooltip="Operating profit before interest and tax."
                />
                <CompactInput
                  id="tax-rate"
                  label="Effective Tax Rate"
                  value={taxRate}
                  onChange={setTaxRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  max="60"
                  step="0.5"
                  tooltip="Tax rate applied to operating profit to get NOPAT."
                />
                <CompactInput
                  id="total-debt"
                  label="Total Debt"
                  value={totalDebt}
                  onChange={setTotalDebt}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="100000"
                  tooltip="Interest-bearing borrowings, including capitalised leases."
                />
                <CompactInput
                  id="total-equity"
                  label="Total Equity"
                  value={totalEquity}
                  onChange={setTotalEquity}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  step="100000"
                  tooltip="Book value of shareholders' funds."
                />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Capital Adjustments">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="cash"
                        label="Cash & Equivalents"
                        value={cash}
                        onChange={setCash}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="100000"
                        tooltip="Excess cash subtracted from invested capital because it is not employed in operations."
                      />
                      <CompactInput
                        id="wacc"
                        label="WACC"
                        value={wacc}
                        onChange={setWacc}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        max="40"
                        step="0.5"
                        tooltip="Blended after-tax cost of capital; the hurdle ROIC must beat."
                      />
                      <CompactInput
                        id="revenue"
                        label="Revenue"
                        value={revenue}
                        onChange={setRevenue}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        step="100000"
                        tooltip="Used for the margin and turnover decomposition of ROIC."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      NOPAT is EBIT taxed at the effective rate. Invested capital is debt plus equity less excess cash. ROIC is
                      the ratio of the two, and the decomposition ROIC = margin x turnover x (1 − tax) must reconcile to the
                      same figure. Economic value added is the spread over WACC multiplied by invested capital, which converts
                      a percentage into the dollars of value created or destroyed each year.
                    </p>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Return on Invested Capital</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{fmt(results.roic, 2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.spread, 2)} points above the {fmt(results.waccUsed, 2)}% cost of capital · EVA {money(results.eva)}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">NOPAT</span>
                <span className="font-extrabold text-foreground">{money(results.nopat)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Invested Capital</span>
                <span className="font-extrabold text-foreground">{money(results.investedCapital)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Spread vs WACC</span>
                <span className={`font-extrabold ${results.spread >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {fmt(results.spread, 2)} pp
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.item} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3">
                        <div className="font-semibold text-foreground">{row.item}</div>
                        <div className="text-[11px] text-muted-foreground leading-snug">{row.note}</div>
                      </td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                {results.summary.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{item.label}</span>
                    <span className={`text-base font-bold ${item.tone || "text-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Return on Invested Capital?</h2>
            <p>
              Return on invested capital measures the operating profit a business generates for each dollar of capital tied up
              in it. It is the cleanest single test of business quality: a company that earns 20% on its capital can reinvest
              every dollar at that rate and compound shareholder value quickly, while a company earning 6% on the same capital
              is struggling to justify the money it uses. ROIC cuts across industries because it focuses on the relationship
              between profit and capital rather than on the size of either.
            </p>
            <p>
              The tool compares ROIC with the weighted average cost of capital and converts the difference into economic value
              added. That comparison is the point: a return only matters relative to what the capital costs. A 9% ROIC sounds
              respectable until you notice the company pays 11% for its capital, at which point growth is a machine for
              destroying value rather than creating it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The numerator is net operating profit after tax: EBIT multiplied by one minus the effective tax rate. Using
              EBIT rather than net income removes the effect of financing decisions, so the measure reflects operating
              performance. The denominator is invested capital, which is total debt plus total equity less excess cash,
              because cash that is not required for operations would otherwise dilute the ratio.
            </p>
            <p>
              In the default example, $12 million of EBIT taxed at 21% gives $9.48 million of NOPAT, and invested capital of
              $20 million of debt plus $30 million of equity less $4 million of cash is $46 million. ROIC is therefore 20.6%.
              Against an 8% WACC, the spread is 12.6 points and economic value added is about $5.8 million a year — the
              dollar amount by which the business out-earns the cost of the capital it employs.
            </p>
            <p>
              The decomposition table shows how margin and turnover combine to produce that result. Operating margin is EBIT
              divided by revenue — 30% here — and capital turnover is revenue divided by invested capital, about 0.87 times.
              Multiplying margin by turnover and then by one minus the tax rate gives exactly the ROIC figure, which is a
              useful reconciliation and a diagnostic tool: a company can improve ROIC by raising margin, by turning capital
              faster, or by both.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows ROIC with the spread over the cost of capital and the economic value added. The three
              statistics beside it give NOPAT, invested capital and the spread in percentage points. The table walks the
              calculation line by line, from EBIT through the tax adjustment, the capital build-up, the two operating ratios
              and finally the value-creation verdict.
            </p>
            <p>
              Summary Statistics adds the cost of capital in dollars, the debt share of capital and a plain verdict on whether
              the business is creating or destroying              value. Two experiments are revealing. Raise the debt and watch ROIC fall: NOPAT is untouched, but the capital
              base grows, and the extra capital has to earn its keep. Then raise EBIT and watch both ROIC and EVA climb
              together, which is exactly the behaviour that makes high-return, capital-light businesses so valuable over time.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-invested-capital-roic-calculator" />
          <PopularCalculators exclude="/calculator/return-on-invested-capital-roic-calculator" />
        </div>
      </div>
    </>
  );
}
