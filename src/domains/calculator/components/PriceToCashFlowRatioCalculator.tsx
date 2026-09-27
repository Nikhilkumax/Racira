"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PcfInputs {
  sharePrice: number;
  cashFlowPerShare: number;
  earningsPerShare: number;
  peerMultiple: number;
  growthRate: number;
}

const DEFAULTS: PcfInputs = {
  sharePrice: 45,
  cashFlowPerShare: 4.5,
  earningsPerShare: 2.8,
  peerMultiple: 11,
  growthRate: 8,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function valuationBand(pcf: number, peer: number): { label: string; tone: string } {
  if (peer <= 0) return { label: "No peer benchmark", tone: "text-muted-foreground" };
  const ratio = pcf / peer;
  if (ratio <= 0.85) return { label: "Discount to peers", tone: "text-emerald-600" };
  if (ratio <= 1.15) return { label: "In line with peers", tone: "text-emerald-600" };
  return { label: "Premium to peers", tone: "text-amber-600" };
}

interface PcfResult {
  pcf: number;
  cashFlowYieldPct: number;
  peRatio: number;
  fairValueByPeer: number;
  relativeValuePct: number;
  multipleVsPeerPct: number;
  multipleToGrowth: number;
  cashFlowConversion: number;
  band: string;
  bandTone: string;
  cheapRelativeToPeers: boolean;
  valid: boolean;
  errorMsg: string;
}

function computePcf(i: PcfInputs): PcfResult {
  const invalid =
    i.sharePrice <= 0 ||
    i.cashFlowPerShare <= 0 ||
    i.earningsPerShare < 0 ||
    i.peerMultiple < 0 ||
    i.growthRate < 0;

  const pcf = i.cashFlowPerShare > 0 ? i.sharePrice / i.cashFlowPerShare : 0;
  const peRatio = i.earningsPerShare > 0 ? i.sharePrice / i.earningsPerShare : 0;
  const fairValueByPeer = i.peerMultiple * i.cashFlowPerShare;
  const band = valuationBand(pcf, i.peerMultiple);

  return {
    pcf,
    cashFlowYieldPct: i.sharePrice > 0 ? (i.cashFlowPerShare / i.sharePrice) * 100 : 0,
    peRatio,
    fairValueByPeer,
    relativeValuePct: i.sharePrice > 0 ? ((fairValueByPeer - i.sharePrice) / i.sharePrice) * 100 : 0,
    multipleVsPeerPct: i.peerMultiple > 0 ? ((pcf - i.peerMultiple) / i.peerMultiple) * 100 : 0,
    multipleToGrowth: i.growthRate > 0 ? pcf / i.growthRate : 0,
    cashFlowConversion: i.earningsPerShare > 0 ? (i.cashFlowPerShare / i.earningsPerShare) * 100 : 0,
    band: band.label,
    bandTone: band.tone,
    cheapRelativeToPeers: i.peerMultiple > 0 && pcf <= i.peerMultiple,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a share price and cash flow per share above zero, and non-negative earnings, peer multiple and growth figures."
      : "",
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
  hint?: string;
  type?: string;
  min?: string;
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
  hint,
  type = "number",
  min,
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
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function PriceToCashFlowRatioCalculator() {
  const [sharePrice, setSharePrice] = useState(String(DEFAULTS.sharePrice));
  const [cashFlowPerShare, setCashFlowPerShare] = useState(String(DEFAULTS.cashFlowPerShare));
  const [earningsPerShare, setEarningsPerShare] = useState(String(DEFAULTS.earningsPerShare));
  const [peerMultiple, setPeerMultiple] = useState(String(DEFAULTS.peerMultiple));
  const [growthRate, setGrowthRate] = useState(String(DEFAULTS.growthRate));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PcfInputs => ({
    sharePrice: parseFloat(sharePrice) || 0,
    cashFlowPerShare: parseFloat(cashFlowPerShare) || 0,
    earningsPerShare: parseFloat(earningsPerShare) || 0,
    peerMultiple: parseFloat(peerMultiple) || 0,
    growthRate: parseFloat(growthRate) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<PcfInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PcfResult>(() => computePcf(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePcf(inputs));
  };

  const reset = () => {
    setSharePrice(String(DEFAULTS.sharePrice));
    setCashFlowPerShare(String(DEFAULTS.cashFlowPerShare));
    setEarningsPerShare(String(DEFAULTS.earningsPerShare));
    setPeerMultiple(String(DEFAULTS.peerMultiple));
    setGrowthRate(String(DEFAULTS.growthRate));
    setCalcInputs(DEFAULTS);
    setResults(computePcf(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the price-to-cash-flow ratio?",
      answer:
        "It divides a company's share price by its cash flow per share, producing the number of dollars investors pay for each dollar of cash the business generates. Cash flow is harder to manipulate than reported earnings because it starts from actual cash received rather than accrual accounting, which is why some analysts prefer this multiple for capital-intensive or accounting-complex businesses.",
    },
    {
      question: "Why is it useful alongside the price-to-earnings ratio?",
      answer:
        "Earnings can be depressed by large non-cash charges such as depreciation, amortization or writedowns, which makes a profitable, cash-generating business look expensive on a P/E basis. Comparing the two multiples reveals that: when price-to-cash-flow sits well below price-to-earnings, the cash generation is stronger than reported profit suggests, and when it sits above, earnings quality deserves closer inspection.",
    },
    {
      question: "Is a low price-to-cash-flow ratio always a bargain?",
      answer:
        "No. A low multiple often reflects a business the market expects to shrink, a cyclical peak in cash flow that will not persist, or heavy capital spending that consumes the cash before shareholders see it. The multiple is a starting point for questions, not an answer: free cash flow, after capital expenditure, is what ultimately funds dividends, buybacks and debt reduction.",
    },
    {
      question: "Which cash flow figure should I use?",
      answer:
        "Operating cash flow is the common base, but it includes changes in working capital that can swing widely with timing. Many analysts prefer free cash flow — operating cash flow minus capital expenditure — because it represents the money genuinely available for shareholders. Whichever figure you choose, use it consistently across the companies you compare, and state the definition so the multiple is interpretable.",
    },
  ];


  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Price to Cash Flow Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Price to Cash Flow Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Per-Share Data">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="share-price"
                  label="Share Price"
                  value={sharePrice}
                  onChange={setSharePrice}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Current market price per share."
                />
                <CompactInput
                  id="cash-flow"
                  label="Cash Flow Per Share"
                  value={cashFlowPerShare}
                  onChange={setCashFlowPerShare}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Operating or free cash flow divided by shares outstanding."
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <CompactInput
                  id="eps"
                  label="Earnings Per Share"
                  value={earningsPerShare}
                  onChange={setEarningsPerShare}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Reported earnings per share, used for the P/E comparison."
                />
                <CompactInput
                  id="growth"
                  label="Cash Flow Growth"
                  value={growthRate}
                  onChange={setGrowthRate}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Expected annual growth in cash flow per share."
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
                  <SubSection title="Peer Benchmark">
                    <CompactInput
                      id="peer-multiple"
                      label="Peer Price-to-Cash-Flow"
                      value={peerMultiple}
                      onChange={setPeerMultiple}
                      onEnter={runCalculate}
                      suffix="x"
                      min="0"
                      tooltip="Average price-to-cash-flow multiple across comparable companies."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Price to Cash Flow</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {fmt(results.pcf, 2)}x
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.band} — peers trade at {fmt(calcInputs.peerMultiple, 1)}x cash flow
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cash Flow Yield</span>
                <span className="font-extrabold text-foreground">{fmt(results.cashFlowYieldPct, 2)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Peer Fair Value</span>
                <span className="font-extrabold text-foreground">${fmt(results.fairValueByPeer, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">vs Peers</span>
                <span className={`font-extrabold ${results.cheapRelativeToPeers ? "text-emerald-600" : "text-amber-600"}`}>
                  {fmt(results.multipleVsPeerPct, 1)}%
                </span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Line</th>
                    <th className="p-2.5 text-right w-[120px]">Value</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Reading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Price to cash flow</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.pcf, 2)}x</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">cash per share</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Price to earnings</td>
                    <td className="p-2.5 text-right text-foreground">
                      {results.peRatio > 0 ? `${fmt(results.peRatio, 2)}x` : "—"}
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">reported profit</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Cash flow conversion</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.cashFlowConversion, 1)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">cash vs earnings</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Peer multiple fair value</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.fairValueByPeer, 2)}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.relativeValuePct, 1)}% vs price</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Multiple to growth</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.multipleToGrowth, 2)}</td>
                    <td className={`p-2.5 pr-3 text-right ${results.bandTone}`}>{results.band}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cash Flow Per Share</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.cashFlowPerShare, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Earnings Per Share</span>
                  <span className="text-base font-bold text-foreground">${fmt(calcInputs.earningsPerShare, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peer Multiple</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.peerMultiple, 1)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Upside to Peer Value</span>
                  <span className={`text-base font-bold ${results.relativeValuePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {fmt(results.relativeValuePct, 1)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cash Flow Growth</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.growthRate, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Valuation Signal</span>
                  <span className={`text-base font-bold ${results.bandTone}`}>{results.band}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Price to Cash Flow Ratio Calculator?</h2>
            <p>
              A price-to-cash-flow calculator divides a share price by the cash the business generates per share, giving
              the multiple investors are paying for each dollar of cash. Where the price-to-earnings ratio uses reported
              profit, this measure uses cash, which is far harder to dress up with accounting choices. The result is a
              valuation gauge that suits capital-intensive businesses, turnaround situations and any company whose
              earnings are distorted by large non-cash items.
            </p>
            <p>
              The calculator also expresses the relationship the other way round, as a cash flow yield: the cash generated
              per share as a percentage of the price. That framing is often more intuitive, because it can be compared
              directly with bond yields and with the returns available elsewhere.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The primary multiple is the share price divided by cash flow per share. The calculator then derives the P/E
              ratio from earnings per share, and compares the two: when cash flow per share exceeds earnings per share,
              the business converts profit into cash generously, which usually signals genuine quality rather than
              accounting polish.
            </p>
            <p>
              A peer multiple turns the analysis into a relative-value exercise. Multiplying the peer average by this
              company&apos;s cash flow per share produces a fair value estimate, and the difference between that and the
              current price is expressed as a percentage. A multiple divided by the cash flow growth rate gives a rough
              sense of whether you are paying a sensible price for the expansion underway.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the price-to-cash-flow multiple with the peer benchmark beneath it. The three-stat
              bar shows the cash flow yield, the peer-based fair value and the premium or discount to peers, while the
              table lays out the multiple, the P/E comparison, cash conversion and the growth-adjusted reading.
            </p>
            <p>
              A discount to peers is only meaningful if the business is comparable in quality, growth and risk. A cheaper
              multiple on a slower-growing or more heavily indebted company may be entirely deserved. Check the cash flow
              conversion line first, then the growth figure: a modest multiple attached to strong conversion and solid
              growth is a far better signal than a low multiple alone.
            </p>
            <p>
              Finally, remember what the multiple leaves out. Capital expenditure, working capital swings and debt service
              all sit between cash flow and the money that reaches shareholders. A company can generate impressive cash
              flow and still return little of it if the business is capital-hungry. Read the multiple as one input among
              several, and follow it with a look at free cash flow and the balance sheet before drawing conclusions. It
also helps to track the multiple over several years rather than reading a single snapshot, because one unusually
strong or weak cash flow quarter can distort the ratio. A multiple that has drifted steadily higher while cash flow
stalls is a warning; one that compresses while cash generation improves is often exactly where opportunity appears for disciplined, long-term investors who are willing to look past a single quarter of noise.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/price-to-cash-flow-ratio-calculator" />
          <PopularCalculators exclude="/calculator/price-to-cash-flow-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
