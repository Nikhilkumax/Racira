"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TokenBurnInputs {
  supply: number;
  burnPerMonth: number;
  price: number;
  emissionsPerMonth: number;
}

interface TokenBurnResult {
  netBurnPerMonth: number;
  annualBurnPct: number;
  monthlyBurnPct: number;
  monthlyBurnValue: number;
  annualBurnValue: number;
  monthsToHalve: number;
  yearsToHalve: number;
  chartData: { month: number; supply: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcTokenBurn(inputs: TokenBurnInputs): TokenBurnResult {
  const netBurnPerMonth = Math.max(0, inputs.burnPerMonth - inputs.emissionsPerMonth);
  const monthlyBurnPct = inputs.supply > 0 ? (netBurnPerMonth / inputs.supply) * 100 : 0;
  const annualBurnPct = monthlyBurnPct * 12;
  const monthlyBurnValue = netBurnPerMonth * inputs.price;
  const annualBurnValue = monthlyBurnValue * 12;
  const monthsToHalve = netBurnPerMonth > 0 ? inputs.supply / (2 * netBurnPerMonth) : 999;
  const yearsToHalve = monthsToHalve / 12;

  const chartData: { month: number; supply: number }[] = [];
  for (let m = 0; m <= 60; m++) {
    chartData.push({ month: m, supply: Math.max(0, Math.round(inputs.supply - netBurnPerMonth * m)) });
  }

  const breakdown = [
    { label: "Total Token Supply", value: inputs.supply.toLocaleString() },
    { label: "Tokens Burned per Month", value: inputs.burnPerMonth.toLocaleString() },
    { label: "Monthly Emissions (New Tokens)", value: inputs.emissionsPerMonth.toLocaleString() },
    { label: "Net Burn per Month", value: netBurnPerMonth.toLocaleString(), highlight: true },
    { label: "Monthly Burn Rate", value: `${monthlyBurnPct.toFixed(2)}%` },
    { label: "Annual Burn Rate", value: `${annualBurnPct.toFixed(1)}%`, highlight: true },
    { label: "Monthly Burn Value", value: `$${monthlyBurnValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Burn Value", value: `$${annualBurnValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Time to Halve Supply", value: netBurnPerMonth > 0 ? `${monthsToHalve.toLocaleString("en-US", { maximumFractionDigits: 1 })} months` : "No net burn" },
  ];

  const summaryStats = [
    { label: "Annual Burn Rate", value: `${annualBurnPct.toFixed(1)}%` },
    { label: "Monthly Burn Rate", value: `${monthlyBurnPct.toFixed(2)}%` },
    { label: "Net Burn per Month", value: netBurnPerMonth.toLocaleString() },
    { label: "Monthly Burn Value", value: `$${monthlyBurnValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Burn Value", value: `$${annualBurnValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Years to Halve Supply", value: netBurnPerMonth > 0 ? `${yearsToHalve.toFixed(1)} yrs` : "∞" },
  ];

  return { netBurnPerMonth, annualBurnPct, monthlyBurnPct, monthlyBurnValue, annualBurnValue, monthsToHalve, yearsToHalve, chartData, breakdown, summaryStats };
}

const DEFAULTS: TokenBurnInputs = { supply: 100000000, burnPerMonth: 500000, price: 0.1, emissionsPerMonth: 100000 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">Month {label}</p>
    <p className="text-primary font-extrabold text-sm">{payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })} tokens</p>
  </div>
) : null;

export default function TokenBurnRateCalculator() {
  const [supply, setSupply] = useState("100000000");
  const [burnPerMonth, setBurnPerMonth] = useState("500000");
  const [price, setPrice] = useState("0.1");
  const [emissionsPerMonth, setEmissionsPerMonth] = useState("100000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<TokenBurnResult | null>(null);

  const calculate = () =>
    setResult(calcTokenBurn({
      supply: parseFloat(supply) || 0,
      burnPerMonth: parseFloat(burnPerMonth) || 0,
      price: parseFloat(price) || 0,
      emissionsPerMonth: parseFloat(emissionsPerMonth) || 0,
    }));
  const reset = () => { setSupply(DEFAULTS.supply.toString()); setBurnPerMonth(DEFAULTS.burnPerMonth.toString()); setPrice(DEFAULTS.price.toString()); setEmissionsPerMonth(DEFAULTS.emissionsPerMonth.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is token burn?", answer: "Token burn permanently removes tokens from circulation, usually by sending them to an unspendable address. It reduces total supply, which — all else equal — increases scarcity. Burn rate measures how fast that supply reduction happens, often expressed as an annual percentage." },
    { question: "How is token burn rate calculated?", answer: "Burn rate is the number of tokens removed per period divided by the circulating supply. Monthly burn of 500,000 on a 100 million supply is a 0.5% monthly burn, roughly 6% annually. Emissions (new tokens minted) subtract from the net effect." },
    { question: "Does burning tokens increase price?", answer: "Only if demand holds. Burning reduces supply, which can support price, but token price is ultimately set by supply and demand together. A burn that removes less than emissions is net inflationary — the calculator's net-burn figure separates narrative from math." },
    { question: "What is time to halve supply?", answer: "It is how long until circulating supply drops by half at the current net burn rate: supply ÷ (2 × monthly burn). It is a useful magnitude check — a halving time of centuries means the burn is symbolic, while single-digit years means the burn materially shapes supply." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Token Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Token Burn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="supply" label="Total Token Supply" value={supply} onChange={setSupply} />
              <CompactInput id="burn" label="Tokens Burned per Month" value={burnPerMonth} onChange={setBurnPerMonth} />
            </div>
            <CompactInput id="price" label="Current Price" value={price} onChange={setPrice} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Supply Dynamics</label>
                    <CompactInput id="emissions" label="Monthly Emissions (New Tokens Minted)" value={emissionsPerMonth} onChange={setEmissionsPerMonth} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Burn Rate</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.annualBurnPct.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground font-medium">Net burn of {result.netBurnPerMonth.toLocaleString()} tokens/month from a {supply} supply</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Net Burn / Month", result.netBurnPerMonth.toLocaleString()], ["Monthly Burn Value", `$${result.monthlyBurnValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Years to Halve Supply", result.netBurnPerMonth > 0 ? `${result.yearsToHalve.toFixed(1)} yrs` : "∞"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Supply Decline Over 60 Months</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="supply" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Reading a Token's Burn Schedule</h2>
            <p>Token burn is a supply-side mechanism: tokens are permanently removed from circulation to create scarcity. But the size of a burn only matters relative to supply and emissions. This <strong>token burn rate calculator</strong> converts raw burn numbers into the annual rate, dollar value, and supply trajectory that actually describe the mechanism.</p>
            <h2 className="text-2xl font-bold mb-3">Net Burn Is What Counts</h2>
            <p>Many protocols both mint and burn. If monthly emissions exceed monthly burns, supply grows regardless of the burn announcement. The calculator's net-burn figure — burn minus emissions — is the number that determines whether supply is actually contracting, and the supply chart makes the direction visual over five years.</p>
            <h2 className="text-2xl font-bold mb-3">Burns and Price Are Different Questions</h2>
            <p>A burn only supports price if demand holds steady. The dollar-value rows here show the market's price assumption: at $0.10, the default burn removes $50,000 of tokens per month. Whether that moves the market depends on trading volume — but the supply math itself is deterministic and this tool makes it precise.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/token-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/token-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
