"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AgencyInputs {
  debtPlaced: number;
  recoveryRatePct: number;
  commissionPct: number;
  accountsPlaced: number;
  flatFeePerAccount: number;
  legalCosts: number;
}

const DEFAULTS: AgencyInputs = {
  debtPlaced: 10000,
  recoveryRatePct: 60,
  commissionPct: 25,
  accountsPlaced: 1,
  flatFeePerAccount: 15,
  legalCosts: 250,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface AgencyResult {
  grossRecovery: number;
  commission: number;
  flatFees: number;
  totalFees: number;
  netRecovery: number;
  effectiveFeePct: number;
  netRecoveryRate: number;
  costPerDollar: number;
  valid: boolean;
  errorMsg: string;
}

function computeAgency(i: AgencyInputs): AgencyResult {
  const invalid =
    i.debtPlaced <= 0 ||
    i.recoveryRatePct < 0 ||
    i.recoveryRatePct > 100 ||
    i.commissionPct < 0 ||
    i.commissionPct > 100 ||
    i.accountsPlaced <= 0 ||
    i.flatFeePerAccount < 0 ||
    i.legalCosts < 0;

  const grossRecovery = i.debtPlaced * (i.recoveryRatePct / 100);
  const commission = grossRecovery * (i.commissionPct / 100);
  const flatFees = i.flatFeePerAccount * i.accountsPlaced;
  const totalFees = commission + flatFees + i.legalCosts;
  const netRecovery = grossRecovery - totalFees;

  return {
    grossRecovery,
    commission,
    flatFees,
    totalFees,
    netRecovery,
    effectiveFeePct: grossRecovery > 0 ? (totalFees / grossRecovery) * 100 : 0,
    netRecoveryRate: i.debtPlaced > 0 ? (netRecovery / i.debtPlaced) * 100 : 0,
    costPerDollar: grossRecovery > 0 ? totalFees / grossRecovery : 0,
    valid: !invalid,
    errorMsg: invalid
      ? "Enter a debt above zero, rates between 0% and 100%, and non-negative fees."
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

export default function CollectionAgencyFeeCalculator() {
  const [debtPlaced, setDebtPlaced] = useState(String(DEFAULTS.debtPlaced));
  const [recoveryRatePct, setRecoveryRatePct] = useState(String(DEFAULTS.recoveryRatePct));
  const [commissionPct, setCommissionPct] = useState(String(DEFAULTS.commissionPct));
  const [accountsPlaced, setAccountsPlaced] = useState(String(DEFAULTS.accountsPlaced));
  const [flatFeePerAccount, setFlatFeePerAccount] = useState(String(DEFAULTS.flatFeePerAccount));
  const [legalCosts, setLegalCosts] = useState(String(DEFAULTS.legalCosts));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AgencyInputs => ({
    debtPlaced: parseFloat(debtPlaced) || 0,
    recoveryRatePct: parseFloat(recoveryRatePct) || 0,
    commissionPct: parseFloat(commissionPct) || 0,
    accountsPlaced: parseFloat(accountsPlaced) || 0,
    flatFeePerAccount: parseFloat(flatFeePerAccount) || 0,
    legalCosts: parseFloat(legalCosts) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<AgencyInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AgencyResult>(() => computeAgency(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAgency(inputs));
  };

  const reset = () => {
    setDebtPlaced(String(DEFAULTS.debtPlaced));
    setRecoveryRatePct(String(DEFAULTS.recoveryRatePct));
    setCommissionPct(String(DEFAULTS.commissionPct));
    setAccountsPlaced(String(DEFAULTS.accountsPlaced));
    setFlatFeePerAccount(String(DEFAULTS.flatFeePerAccount));
    setLegalCosts(String(DEFAULTS.legalCosts));
    setCalcInputs(DEFAULTS);
    setResults(computeAgency(DEFAULTS));
  };

  const debtShare = calcInputs.debtPlaced > 0 ? 100 : 0;
  const recoveredShare = calcInputs.debtPlaced > 0 ? (results.grossRecovery / calcInputs.debtPlaced) * 100 : 0;
  const commissionShare = calcInputs.debtPlaced > 0 ? (results.commission / calcInputs.debtPlaced) * 100 : 0;
  const otherFeesShare =
    calcInputs.debtPlaced > 0 ? ((results.flatFees + calcInputs.legalCosts) / calcInputs.debtPlaced) * 100 : 0;
  const netShare = calcInputs.debtPlaced > 0 ? (results.netRecovery / calcInputs.debtPlaced) * 100 : 0;

  const faqs = [
    {
      question: "How do collection agency fees usually work?",
      answer:
        "Most agencies charge a contingency commission — a percentage of whatever they recover — typically ranging from 15% to 50% depending on the age of the debt, the volume placed and whether litigation is needed. Fresh, collectible accounts sit at the low end; old, disputed or litigated accounts sit at the high end. Some agencies also charge flat per-account fees, and legal fees when a claim has to be filed, both of which are subtracted from the gross recovery before you receive anything.",
    },
    {
      question: "What is a good recovery rate to assume?",
      answer:
        "Contingency agencies commonly recover between 20% and 60% of the face value of placed debt, with results falling as accounts age. Debts under 90 days delinquent often recover well above 50%, while accounts older than a year frequently land in the 10% to 25% band. The right assumption depends on your portfolio: look at historical placements of similar age, size and documentation quality rather than industry averages.",
    },
    {
      question: "Why does the effective fee end up higher than the commission rate?",
      answer:
        "Because flat fees and legal costs are charged on top of the contingency commission. If an agency takes a 25% commission and your gross recovery is $6,000, the commission is $1,500, but add $250 of legal costs and $15 per account and the effective fee rises above 25% of what was recovered. This calculator reports the effective fee rate so offers can be compared on the total cost of recovery rather than the headline commission alone.",
    },
    {
      question: "Is it worth placing a debt with an agency at all?",
      answer:
        "Compare the net recovery against your alternatives: writing the debt off, selling it to a debt buyer for a few cents on the dollar, or pursuing it yourself. An agency at a 25% commission that recovers 60% returns 45% of face value to you — vastly more than the 1 to 10 cents on the dollar a typical debt sale produces. The trade-off is time and effort: collection is slower than a sale, and the agency only gets paid when it collects.",
    },
    {
      question: "Who is legally allowed to collect a debt?",
      answer:
        "In the United States, third-party collectors must comply with the Fair Debt Collection Practices Act, which restricts when and how they may contact debtors, prohibits harassment and false statements, and requires validation of the debt. Many states license collection agencies and set additional rules. Before placing accounts, verify the agency's licence, insurance and compliance record, and confirm how it will represent your company on the phone and in letters.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Collection Agency Fee Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Collection Agency Fee Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Placement">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="debt-placed"
                  label="Debt Placed"
                  value={debtPlaced}
                  onChange={setDebtPlaced}
                  onEnter={runCalculate}
                  prefix="$"
                  tooltip="Face value of the debt handed to the collection agency."
                />
                <CompactInput
                  id="recovery-rate"
                  label="Expected Recovery Rate"
                  value={recoveryRatePct}
                  onChange={setRecoveryRatePct}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  tooltip="Share of the placed debt the agency is expected to collect."
                />
              </div>
              <div className="mt-3">
                <CompactInput
                  id="commission"
                  label="Agency Commission"
                  value={commissionPct}
                  onChange={setCommissionPct}
                  onEnter={runCalculate}
                  suffix="%"
                  min="0"
                  step="0.5"
                  tooltip="Contingency fee taken from the amount recovered, typically 15% to 50%."
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
                  <SubSection title="Fee Structure">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="accounts"
                        label="Accounts Placed"
                        value={accountsPlaced}
                        onChange={setAccountsPlaced}
                        onEnter={runCalculate}
                        min="1"
                        tooltip="Number of accounts in this placement."
                      />
                      <CompactInput
                        id="flat-fee"
                        label="Flat Fee per Account"
                        value={flatFeePerAccount}
                        onChange={setFlatFeePerAccount}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Per-account charge independent of the commission."
                      />
                      <div className="col-span-2">
                        <CompactInput
                          id="legal-costs"
                          label="Legal & Filing Costs"
                          value={legalCosts}
                          onChange={setLegalCosts}
                          onEnter={runCalculate}
                          prefix="$"
                          min="0"
                          tooltip="Court filing, service and attorney costs charged to the placement."
                        />
                      </div>
                    </div>
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
            {results.valid && results.netRecovery < 0 && (
              <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Fees exceed recovery</div>
                <div className="text-base font-medium text-foreground">
                  At this recovery rate the fees and costs are larger than the amount collected — the placement loses
                  money.
                </div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">
                Net Recovery After Fees
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                ${fmt(results.netRecovery, 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {fmt(results.netRecoveryRate, 1)}% of the ${fmt(calcInputs.debtPlaced, 0)} placed
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Gross Recovery
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.grossRecovery, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Commission
                </span>
                <span className="font-extrabold text-foreground">${fmt(results.commission, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Effective Fee
                </span>
                <span className="font-extrabold text-foreground">{fmt(results.effectiveFeePct, 1)}%</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right w-[130px]">Amount</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">% of Debt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Debt Placed</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(calcInputs.debtPlaced, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(debtShare, 0)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Recovered</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.grossRecovery, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(recoveredShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Agency Commission</td>
                    <td className="p-2.5 text-right text-foreground">−${fmt(results.commission, 0)}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(commissionShare, 1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Flat & Legal Fees</td>
                    <td className="p-2.5 text-right text-foreground">
                      −${fmt(results.flatFees + calcInputs.legalCosts, 0)}
                    </td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(otherFeesShare, 1)}%</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Net Recovery</td>
                    <td className="p-2.5 text-right text-foreground">${fmt(results.netRecovery, 0)}</td>
                    <td className="p-2.5 pr-3 text-right text-muted-foreground">{fmt(netShare, 1)}%</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Total Fees & Costs
                  </span>
                  <span className="text-base font-bold text-foreground">${fmt(results.totalFees, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cost per $1 Recovered
                  </span>
                  <span className="text-base font-bold text-primary">${fmt(results.costPerDollar, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Flat Fees Total
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(results.flatFees, 0)} ({fmt(calcInputs.accountsPlaced, 0)}{" "}
                    {calcInputs.accountsPlaced === 1 ? "account" : "accounts"})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Commission Rate
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.commissionPct, 1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Written-Off Value
                  </span>
                  <span className="text-base font-bold text-foreground">
                    ${fmt(Math.max(0, calcInputs.debtPlaced - results.grossRecovery), 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Net Recovery Rate
                  </span>
                  <span className="text-base font-bold text-foreground">{fmt(results.netRecoveryRate, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Collection Agency Fee Calculator?</h2>
            <p>
              A collection agency fee calculator works out what you actually receive when a delinquent debt is placed
              with a third-party collector. Agencies are paid out of what they collect, so the headline number on a
              contract — a 25% contingency rate, for example — never tells the whole story. Flat per-account charges,
              court filing fees and legal costs are deducted as well, and the amount recovered is usually far below the
              face value of the debt. The result is a net recovery that can look very different from the gross figure.
            </p>
            <p>
              The calculation matters whenever a business decides what to do with unpaid invoices: place them with an
              agency, sell them to a debt buyer, pursue them internally, or write them off. An agency that recovers 60%
              of the face value at a 25% commission returns 45 cents on the dollar; a debt buyer paying three cents on
              the dollar returns three. Understanding the true net recovery — not the commission rate — is the only way
              to compare those options rationally.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator multiplies the debt placed by the expected recovery rate to produce the gross recovery, then
              applies the agency commission to that recovered amount. Flat fees are multiplied by the number of accounts
              placed, and legal and filing costs are added as entered. All three charges are subtracted from the gross
              recovery to produce the net recovery, and the total cost of collection is divided by the gross recovery to
              give the effective fee rate.
            </p>
            <p>
              Cost per dollar recovered is the total fees divided by the gross recovery — a compact way to compare
              agencies whose pricing mixes commissions, flat fees and legal costs. Net recovery rate expresses the result
              as a percentage of the debt originally placed, which is the number to weigh against alternatives such as
              selling the portfolio or writing it off.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card reports the net recovery you receive after every fee, with the net recovery rate beneath
              it. The three-stat bar separates gross recovery, commission and the effective fee rate, and the breakdown
              table traces the whole path from placed debt to net recovery, showing each deduction as a share of the
              original balance so the gap between the two ends of the process is fully visible.
            </p>
            <p>
              Summary Statistics adds the total fees, the cost per dollar recovered, the flat-fee total and the value
              that remains written off. A useful rule of thumb when comparing agencies is to divide total fees by gross
              recovery: a rate near the commission alone means pricing is clean, while a rate materially above it
              signals flat charges and costs doing real damage to the net result. Treat the recovery rate as the
              assumption to stress-test: collection results
              fall sharply with account age, so run the numbers at 20%, 40% and 60% to see how sensitive your net
              recovery is. Note also that placing a debt with a third-party collector has compliance obligations — the
              Fair Debt Collection Practices Act governs how collectors behave, and many states add licensing and
              disclosure rules — so confirm an agency&apos;s record before handing over customer accounts.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/collection-agency-fee-calculator" />
          <PopularCalculators exclude="/calculator/collection-agency-fee-calculator" />
        </div>
      </div>
    </>
  );
}
