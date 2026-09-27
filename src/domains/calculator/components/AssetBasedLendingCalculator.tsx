"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AblInputs {
  receivables: number;
  inventory: number;
  equipment: number;
  outstanding: number;
  ineligiblePct: number;
  arRate: number;
  inventoryRate: number;
  equipmentRate: number;
  realEstate: number;
  realEstateRate: number;
  reserves: number;
  lcExposure: number;
  indexRate: number;
  spread: number;
  commitmentFee: number;
  monitoringFee: number;
  closingFee: number;
  utilization: number;
}

const DEFAULTS: AblInputs = {
  receivables: 1800000,
  inventory: 620000,
  equipment: 740000,
  outstanding: 900000,
  ineligiblePct: 15,
  arRate: 85,
  inventoryRate: 50,
  equipmentRate: 60,
  realEstate: 0,
  realEstateRate: 75,
  reserves: 25000,
  lcExposure: 0,
  indexRate: 5.33,
  spread: 2.75,
  commitmentFee: 0.375,
  monitoringFee: 750,
  closingFee: 1,
  utilization: 65,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number) =>
  Number.isFinite(v) ? "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";

const pct = (v: number) => (Number.isFinite(v) ? fmt(v, 2) + "%" : "—");

interface CollateralRow {
  label: string;
  gross: number;
  ineligible: number;
  eligible: number;
  rate: number;
  advance: number;
  note: string;
}

interface AblResult {
  rows: CollateralRow[];
  grossCollateral: number;
  totalEligible: number;
  grossBorrowingBase: number;
  borrowingBase: number;
  commitment: number;
  availability: number;
  outstanding: number;
  undrawn: number;
  collateralCoverage: number;
  allInRate: number;
  annualInterest: number;
  commitmentCost: number;
  monitoringCost: number;
  closingCost: number;
  annualCost: number;
  effectiveCost: number;
  costPerDollar: number;
  valid: boolean;
  errorMsg: string;
}

function computeAbl(i: AblInputs): AblResult {
  const ar = Math.max(0, i.receivables);
  const inv = Math.max(0, i.inventory);
  const equip = Math.max(0, i.equipment);
  const re = Math.max(0, i.realEstate);
  const ineligiblePct = Math.min(100, Math.max(0, i.ineligiblePct));
  const reserves = Math.max(0, i.reserves);
  const lc = Math.max(0, i.lcExposure);
  const outstanding = Math.max(0, i.outstanding);

  const arIneligible = (ar * ineligiblePct) / 100;
  const arEligible = ar - arIneligible;

  // Advance rates apply to eligible collateral only; receivables are haircut for
  // ineligibles (balances over 90 days, foreign accounts, contra accounts) first.
  const rows: CollateralRow[] = [
    {
      label: "Accounts Receivable",
      gross: ar,
      ineligible: arIneligible,
      eligible: arEligible,
      rate: Math.max(0, i.arRate),
      advance: (arEligible * Math.max(0, i.arRate)) / 100,
      note: arIneligible > 0 ? `${fmt(ineligiblePct, 0)}% ineligible` : "Fully eligible",
    },
    {
      label: "Inventory",
      gross: inv,
      ineligible: 0,
      eligible: inv,
      rate: Math.max(0, i.inventoryRate),
      advance: (inv * Math.max(0, i.inventoryRate)) / 100,
      note: "At cost, net of shrinkage",
    },
    {
      label: "Machinery & Equipment",
      gross: equip,
      ineligible: 0,
      eligible: equip,
      rate: Math.max(0, i.equipmentRate),
      advance: (equip * Math.max(0, i.equipmentRate)) / 100,
      note: "Orderly liquidation value",
    },
    {
      label: "Real Estate",
      gross: re,
      ineligible: 0,
      eligible: re,
      rate: Math.max(0, i.realEstateRate),
      advance: (re * Math.max(0, i.realEstateRate)) / 100,
      note: re > 0 ? "Appraised value" : "Not pledged",
    },
  ].filter((r) => r.gross > 0.004);

  const grossCollateral = rows.reduce((s, r) => s + r.gross, 0);
  const totalEligible = rows.reduce((s, r) => s + r.eligible, 0);
  const grossBorrowingBase = rows.reduce((s, r) => s + r.advance, 0);
  const borrowingBase = Math.max(0, grossBorrowingBase - reserves - lc);

  const undrawn = Math.max(0, borrowingBase - outstanding);
  const availability = undrawn;
  const collateralCoverage = outstanding > 0 ? borrowingBase / outstanding : 0;

  const allInRate = Math.max(0, i.indexRate) + Math.max(0, i.spread);
  const annualInterest = (outstanding * allInRate) / 100;
  const commitmentCost = (undrawn * Math.max(0, i.commitmentFee)) / 100;
  const monitoringCost = Math.max(0, i.monitoringFee) * 12;
  // The closing fee is a one-off charge; expressed over a single year of use it is
  // simply the fee itself, which is the convention used for a one-year comparison.
  const closingCost = (borrowingBase * Math.max(0, i.closingFee)) / 100;
  const annualCost = annualInterest + commitmentCost + monitoringCost + closingCost;
  const effectiveCost = outstanding > 0 ? (annualCost / outstanding) * 100 : 0;
  const costPerDollar = outstanding > 0 ? annualCost / outstanding : 0;

  const invalid =
    i.receivables < 0 ||
    i.inventory < 0 ||
    i.equipment < 0 ||
    i.outstanding < 0 ||
    i.ineligiblePct < 0 ||
    i.ineligiblePct > 100 ||
    i.arRate < 0 ||
    i.inventoryRate < 0 ||
    i.equipmentRate < 0 ||
    i.indexRate < 0 ||
    i.spread < 0 ||
    grossBorrowingBase <= 0;
  const errorMsg = invalid
    ? "Enter non-negative collateral values, advance rates and costs, with an ineligible percentage between 0 and 100 and at least one pledged asset."
    : "";

  return {
    rows,
    grossCollateral,
    totalEligible,
    grossBorrowingBase,
    borrowingBase,
    commitment: borrowingBase,
    availability,
    outstanding,
    undrawn,
    collateralCoverage,
    allInRate,
    annualInterest,
    commitmentCost,
    monitoringCost,
    closingCost,
    annualCost,
    effectiveCost,
    costPerDollar,
    valid: !invalid,
    errorMsg,
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
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function AssetBasedLendingCalculator() {
  const [receivables, setReceivables] = useState(String(DEFAULTS.receivables));
  const [inventory, setInventory] = useState(String(DEFAULTS.inventory));
  const [equipment, setEquipment] = useState(String(DEFAULTS.equipment));
  const [outstanding, setOutstanding] = useState(String(DEFAULTS.outstanding));
  const [ineligiblePct, setIneligiblePct] = useState(String(DEFAULTS.ineligiblePct));
  const [arRate, setArRate] = useState(String(DEFAULTS.arRate));
  const [inventoryRate, setInventoryRate] = useState(String(DEFAULTS.inventoryRate));
  const [equipmentRate, setEquipmentRate] = useState(String(DEFAULTS.equipmentRate));
  const [realEstate, setRealEstate] = useState(String(DEFAULTS.realEstate));
  const [realEstateRate, setRealEstateRate] = useState(String(DEFAULTS.realEstateRate));
  const [reserves, setReserves] = useState(String(DEFAULTS.reserves));
  const [lcExposure, setLcExposure] = useState(String(DEFAULTS.lcExposure));
  const [indexRate, setIndexRate] = useState(String(DEFAULTS.indexRate));
  const [spread, setSpread] = useState(String(DEFAULTS.spread));
  const [commitmentFee, setCommitmentFee] = useState(String(DEFAULTS.commitmentFee));
  const [monitoringFee, setMonitoringFee] = useState(String(DEFAULTS.monitoringFee));
  const [closingFee, setClosingFee] = useState(String(DEFAULTS.closingFee));
  const [utilization, setUtilization] = useState(String(DEFAULTS.utilization));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): AblInputs => ({
    receivables: parseFloat(receivables) || 0,
    inventory: parseFloat(inventory) || 0,
    equipment: parseFloat(equipment) || 0,
    outstanding: parseFloat(outstanding) || 0,
    ineligiblePct: parseFloat(ineligiblePct) || 0,
    arRate: parseFloat(arRate) || 0,
    inventoryRate: parseFloat(inventoryRate) || 0,
    equipmentRate: parseFloat(equipmentRate) || 0,
    realEstate: parseFloat(realEstate) || 0,
    realEstateRate: parseFloat(realEstateRate) || 0,
    reserves: parseFloat(reserves) || 0,
    lcExposure: parseFloat(lcExposure) || 0,
    indexRate: parseFloat(indexRate) || 0,
    spread: parseFloat(spread) || 0,
    commitmentFee: parseFloat(commitmentFee) || 0,
    monitoringFee: parseFloat(monitoringFee) || 0,
    closingFee: parseFloat(closingFee) || 0,
    utilization: parseFloat(utilization) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<AblInputs>(() => DEFAULTS);
  const [results, setResults] = useState<AblResult>(() => computeAbl(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeAbl(inputs));
  };

  const reset = () => {
    setReceivables(String(DEFAULTS.receivables));
    setInventory(String(DEFAULTS.inventory));
    setEquipment(String(DEFAULTS.equipment));
    setOutstanding(String(DEFAULTS.outstanding));
    setIneligiblePct(String(DEFAULTS.ineligiblePct));
    setArRate(String(DEFAULTS.arRate));
    setInventoryRate(String(DEFAULTS.inventoryRate));
    setEquipmentRate(String(DEFAULTS.equipmentRate));
    setRealEstate(String(DEFAULTS.realEstate));
    setRealEstateRate(String(DEFAULTS.realEstateRate));
    setReserves(String(DEFAULTS.reserves));
    setLcExposure(String(DEFAULTS.lcExposure));
    setIndexRate(String(DEFAULTS.indexRate));
    setSpread(String(DEFAULTS.spread));
    setCommitmentFee(String(DEFAULTS.commitmentFee));
    setMonitoringFee(String(DEFAULTS.monitoringFee));
    setClosingFee(String(DEFAULTS.closingFee));
    setUtilization(String(DEFAULTS.utilization));
    setCalcInputs(DEFAULTS);
    setResults(computeAbl(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is asset-based lending?",
      answer:
        "Asset-based lending is a revolving credit facility secured by specific working capital assets, most often accounts receivable and inventory, sometimes with machinery, equipment or real estate pledged as additional collateral. The lender sets advance rates against each class, so the size of the line moves with your balance sheet rather than with a fixed amortisation schedule.",
    },
    {
      question: "How is the borrowing base calculated?",
      answer:
        "Each collateral class is valued on the basis the lender will actually recover: receivables net of ineligibles, inventory at cost, equipment at orderly liquidation value and real estate at appraised value. The advance rate for each class is then applied, the results are added together, and reserves and any letter of credit exposure are deducted from the total.",
    },
    {
      question: "Why are some receivables ineligible?",
      answer:
        "Standard exclusions in a borrowing base certificate cover balances more than ninety days past invoice date, foreign accounts without credit insurance, intercompany and affiliate balances, contra accounts where you also owe the customer, and government receivables subject to assignment rules. The eligible percentage here lets you approximate that carve-out without listing individual invoices.",
    },
    {
      question: "What does the effective annual cost include?",
      answer:
        "Interest at index plus spread on the amount drawn, a commitment or non-use fee on the undrawn portion, a monthly collateral monitoring charge, and the one-off closing or origination fee treated over a single year. Dividing that total by the amount actually drawn gives the cost of the funds in use, which is usually much higher than the headline spread when utilisation is low.",
    },
    {
      question: "How much availability is safe to run?",
      answer:
        "Lenders monitor excess availability as a covenant, commonly requiring the greater of a fixed dollar amount or ten percent of the commitment, because a sudden ineligibility event can wipe out a large part of the borrowing base in a single month. The collateral coverage figure shows how many times over your drawn balance is supported by eligible collateral.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Finance", href: "/calculator#finance" },
          { label: "Asset-Based Lending Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Asset-Based Lending Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Available Collateral">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="receivables"
                  label="Accounts Receivable"
                  value={receivables}
                  onChange={setReceivables}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Gross trade receivables before ineligible balances are removed."
                />
                <CompactInput
                  id="inventory"
                  label="Inventory at Cost"
                  value={inventory}
                  onChange={setInventory}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Inventory carried at the lower of cost or market."
                />
                <CompactInput
                  id="equipment"
                  label="Equipment (OLV)"
                  value={equipment}
                  onChange={setEquipment}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="Orderly liquidation value of the machinery and equipment being pledged."
                />
                <CompactInput
                  id="outstanding"
                  label="Drawn Balance"
                  value={outstanding}
                  onChange={setOutstanding}
                  onEnter={runCalculate}
                  prefix="$"
                  min="0"
                  tooltip="The amount already advanced against the facility."
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
                  <SubSection title="Advance Rates & Eligibility">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="ineligible"
                        label="Ineligible Receivables"
                        value={ineligiblePct}
                        onChange={setIneligiblePct}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Share of receivables the lender excludes, such as balances over 90 days or foreign accounts."
                      />
                      <CompactInput
                        id="ar-rate"
                        label="AR Advance Rate"
                        value={arRate}
                        onChange={setArRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Percentage of eligible receivables the lender will advance, typically 80 to 90 percent."
                      />
                      <CompactInput
                        id="inv-rate"
                        label="Inventory Advance Rate"
                        value={inventoryRate}
                        onChange={setInventoryRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Percentage of inventory value advanced, commonly 40 to 60 percent."
                      />
                      <CompactInput
                        id="equip-rate"
                        label="Equipment Advance Rate"
                        value={equipmentRate}
                        onChange={setEquipmentRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Percentage of orderly liquidation value advanced against machinery and equipment."
                      />
                      <CompactInput
                        id="re-value"
                        label="Real Estate Value"
                        value={realEstate}
                        onChange={setRealEstate}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Appraised value of any real estate pledged as collateral. Leave at zero if none."
                      />
                      <CompactInput
                        id="re-rate"
                        label="Real Estate Rate"
                        value={realEstateRate}
                        onChange={setRealEstateRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Advance rate against appraised real estate value, often 65 to 75 percent on a first lien."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Reserves & Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="reserves"
                        label="Reserves"
                        value={reserves}
                        onChange={setReserves}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Dilution, payroll, tax or rent reserves deducted from the borrowing base."
                      />
                      <CompactInput
                        id="lc"
                        label="LC Exposure"
                        value={lcExposure}
                        onChange={setLcExposure}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Letters of credit issued under the facility, which reduce availability."
                      />
                      <CompactInput
                        id="index"
                        label="Index Rate"
                        value={indexRate}
                        onChange={setIndexRate}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.01"
                        tooltip="Reference rate the facility tracks. Static default — edit it to match your lender's index."
                      />
                      <CompactInput
                        id="spread"
                        label="Spread"
                        value={spread}
                        onChange={setSpread}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.05"
                        tooltip="The lender's margin over the index, commonly 2 to 4 percent for a middle market facility."
                      />
                      <CompactInput
                        id="commitment"
                        label="Commitment Fee"
                        value={commitmentFee}
                        onChange={setCommitmentFee}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.025"
                        tooltip="Annual fee charged on the undrawn portion of the facility."
                      />
                      <CompactInput
                        id="monitoring"
                        label="Monitoring Fee"
                        value={monitoringFee}
                        onChange={setMonitoringFee}
                        onEnter={runCalculate}
                        prefix="$"
                        min="0"
                        tooltip="Monthly collateral monitoring or servicing charge."
                      />
                      <CompactInput
                        id="closing"
                        label="Closing Fee"
                        value={closingFee}
                        onChange={setClosingFee}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="0.25"
                        tooltip="One-off origination fee on the facility size, expressed over a single year of use."
                      />
                      <CompactInput
                        id="utilization"
                        label="Avg Utilization"
                        value={utilization}
                        onChange={setUtilization}
                        onEnter={runCalculate}
                        suffix="%"
                        min="0"
                        step="1"
                        tooltip="Average share of the facility you expect to use, used as a planning reference."
                      />
                    </div>
                  </SubSection>

                  <SubSection title="Method Notes">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Advance rates are applied to eligible collateral, not to gross book value: receivables are first reduced
                      by the ineligible percentage, inventory is advanced at cost, and equipment is advanced against orderly
                      liquidation value rather than replacement cost. Reserves and letter of credit exposure are deducted after
                      the advances are summed, which is how a borrowing base certificate is normally presented.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Available to Draw</div>
              <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{money(results.availability)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                Borrowing base {money(results.borrowingBase)} less {money(results.outstanding)} drawn
                {results.outstanding > results.borrowingBase && results.borrowingBase > 0 ? " · over-advanced" : ""}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Borrowing Base</span>
                <span className="font-extrabold text-foreground">{money(results.borrowingBase)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Coverage</span>
                <span className="font-extrabold text-foreground">{fmt(results.collateralCoverage, 2)}x</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Cost</span>
                <span className="font-extrabold text-foreground">{pct(results.effectiveCost)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Collateral</th>
                    <th className="p-2.5 text-right w-[105px]">Gross</th>
                    <th className="p-2.5 text-right w-[105px]">Eligible</th>
                    <th className="p-2.5 text-right w-[75px]">Rate</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Advance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.rows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        <span className="block text-[10px] font-medium text-muted-foreground">{row.note}</span>
                      </td>
                      <td className="p-2.5 text-right text-foreground align-top">{money(row.gross)}</td>
                      <td className="p-2.5 text-right text-foreground align-top">{money(row.eligible)}</td>
                      <td className="p-2.5 text-right text-muted-foreground align-top">{fmt(row.rate, 0)}%</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground align-top">{money(row.advance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/20">
                    <td className="p-2.5 pl-3 font-semibold text-foreground" colSpan={4}>
                      Less reserves and LC exposure
                    </td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-destructive">
                      −{money(Math.max(0, calcInputs.reserves) + Math.max(0, calcInputs.lcExposure))}
                    </td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground" colSpan={4}>
                      Borrowing Base
                    </td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{money(results.borrowingBase)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Collateral</span>
                  <span className="text-base font-bold text-foreground">{money(results.grossCollateral)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Eligible Collateral</span>
                  <span className="text-base font-bold text-foreground">{money(results.totalEligible)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross Advances</span>
                  <span className="text-base font-bold text-foreground">{money(results.grossBorrowingBase)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Facility Size</span>
                  <span className="text-base font-bold text-foreground">{money(results.commitment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Drawn Balance</span>
                  <span className="text-base font-bold text-foreground">{money(results.outstanding)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Undrawn</span>
                  <span className="text-base font-bold text-foreground">{money(results.undrawn)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">All-in Rate</span>
                  <span className="text-base font-bold text-foreground">{pct(results.allInRate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Collateral Coverage</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.collateralCoverage, 2)}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annual Interest</span>
                  <span className="text-base font-bold text-foreground">{money(results.annualInterest)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Commitment Fee</span>
                  <span className="text-base font-bold text-foreground">{money(results.commitmentCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monitoring & Admin</span>
                  <span className="text-base font-bold text-foreground">{money(results.monitoringCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Closing Fee (Year 1)</span>
                  <span className="text-base font-bold text-foreground">{money(results.closingCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Annual Cost</span>
                  <span className="text-base font-bold text-destructive">{money(results.annualCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Cost</span>
                  <span className="text-base font-bold text-primary">{pct(results.effectiveCost)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per $1 Drawn</span>
                  <span className="text-base font-bold text-foreground">${fmt(results.costPerDollar, 4)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Planned Utilization</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.utilization, 0)}%</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Pricing Assumptions (Static Defaults)
                  </span>
                  <span className="text-base font-bold text-foreground">
                    Index {fmt(calcInputs.indexRate, 2)}% + spread {fmt(calcInputs.spread, 2)}% = {pct(results.allInRate)} ·
                    commitment fee {fmt(calcInputs.commitmentFee, 3)}% of undrawn
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Asset-Based Lending Calculator?</h2>
            <p>
              An asset-based lending calculator works out how much credit a company can draw against the assets on its balance
              sheet, and what that facility costs to use. Unlike a term loan, where the lender commits a fixed amount repaid on
              a schedule, an asset-based facility is a revolver whose limit moves with the collateral. More eligible
              receivables mean more availability; a large slow-moving customer falling past ninety days means less.
            </p>
            <p>
              The mechanism is the borrowing base. Each class of collateral is valued on a basis the lender could actually
              realise in a workout, and then a haircut, called the advance rate, is applied. Receivables are typically the
              strongest collateral and carry the highest advance rate, inventory the weakest, with machinery, equipment and
              real estate used to add capacity or secure term debt alongside the revolver.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Every pledged asset is entered at gross book or appraised value. Receivables are reduced by the ineligible
              percentage before any advance is calculated, because the exclusions in a borrowing base certificate, balances
              over ninety days, foreign accounts, intercompany balances and contra accounts, are applied first. Inventory is
              taken at cost and equipment at orderly liquidation value, which is deliberately below replacement cost.
            </p>
            <p>
              Each class is then multiplied by its advance rate, commonly 80 to 90 percent for receivables, 40 to 60 percent for
              inventory, 50 to 75 percent for equipment and 65 to 75 percent for real estate on a first lien. The results are
              summed to give gross advances, from which reserves and any letter of credit exposure are deducted. What remains
              is the borrowing base, and subtracting the amount already drawn gives the availability the company can access.
            </p>
            <p>
              Cost is assembled in the same way a lender quotes it. Interest runs at the index plus the spread on the amount
              drawn, a commitment or non-use fee is charged on the undrawn portion, collateral monitoring is billed monthly,
              and the closing fee is a one-off charge shown over a single year. Dividing the total by the drawn balance gives
              the effective cost of the money actually in use, which is the figure that matters when availability is only
              partly used.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the amount available to draw, with the borrowing base and the drawn balance underneath. The
              three statistics beside it give the borrowing base itself, the collateral coverage ratio expressing how many
              times over the drawn balance is supported by eligible collateral, and the effective annual cost of funds in use.
              The breakdown table shows each collateral class with its gross value, eligible value, advance rate and the
              resulting advance, followed by the reserve deduction and the borrowing base total.
            </p>
            <p>
              Summary Statistics collects the gross and eligible collateral, gross advances, facility size, drawn and undrawn
              balances, the all-in rate, coverage, interest, commitment fee, monitoring charges, closing fee, total annual cost,
              effective cost and the cost per dollar drawn. If the effective cost looks far above the quoted spread, the cause
              is usually low utilisation: the commitment fee and monitoring charges are spread over a smaller drawn balance, so
              running closer to the borrowing base lowers the cost per dollar.
            </p>
            <p className="text-sm text-muted-foreground italic mt-4">
              The index rate is a static default rather than a live quote, because this page fetches no external data. Advance
              rates, reserve levels and fees vary by lender, industry and collateral quality, so treat the defaults here as
              typical middle market terms and replace them with the figures in your own term sheet before relying on the
              result.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/asset-based-lending-calculator" />
          <PopularCalculators exclude="/calculator/asset-based-lending-calculator" />
        </div>
      </div>
    </>
  );
}
