"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface PetFoodInputs {
  bagPrice: number;
  bagSize: number;
  dailyCups: number;
  cupsPerPound: number;
  pets: number;
}

interface PetFoodResult {
  daysPerBag: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  annualCost: number;
  costPerPound: number;
  bagsPerYear: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcPetFood(inputs: PetFoodInputs): PetFoodResult {
  const totalDailyCups = inputs.dailyCups * inputs.pets;
  const daysPerBag = totalDailyCups > 0 ? (inputs.bagSize * inputs.cupsPerPound) / totalDailyCups : 0;
  const dailyCost = daysPerBag > 0 ? inputs.bagPrice / daysPerBag : 0;
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * 30.44;
  const annualCost = dailyCost * 365;
  const costPerPound = inputs.bagSize > 0 ? inputs.bagPrice / inputs.bagSize : 0;
  const bagsPerYear = daysPerBag > 0 ? 365 / daysPerBag : 0;

  const chartData = [
    { name: "Per Day", value: Number(dailyCost.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Per Week", value: Number(weeklyCost.toFixed(2)), fill: "#10b981" },
    { name: "Per Month", value: Number(monthlyCost.toFixed(2)), fill: "#f59e0b" },
    { name: "Per Year", value: Number(annualCost.toFixed(2)), fill: "#8b5cf6" },
  ];

  const breakdown = [
    { label: "Bag Price", value: `$${inputs.bagPrice.toFixed(2)}` },
    { label: "Bag Size", value: `${inputs.bagSize} lb` },
    { label: "Daily Food Amount", value: `${inputs.dailyCups} cups` },
    { label: "Cups per Pound", value: `${inputs.cupsPerPound}` },
    { label: "Number of Pets", value: `${inputs.pets}` },
    { label: "Days per Bag", value: `${daysPerBag.toFixed(1)} days`, highlight: true },
    { label: "Daily Cost", value: `$${dailyCost.toFixed(2)}`, highlight: true },
    { label: "Monthly Cost", value: `$${monthlyCost.toFixed(2)}` },
    { label: "Annual Cost", value: `$${annualCost.toFixed(2)}` },
    { label: "Bags per Year", value: `${bagsPerYear.toFixed(1)} bags` },
  ];

  const summaryStats = [
    { label: "Daily Cost", value: `$${dailyCost.toFixed(2)}` },
    { label: "Weekly Cost", value: `$${weeklyCost.toFixed(2)}` },
    { label: "Monthly Cost", value: `$${monthlyCost.toFixed(2)}` },
    { label: "Annual Cost", value: `$${annualCost.toFixed(2)}` },
    { label: "Days per Bag", value: `${daysPerBag.toFixed(1)} days` },
    { label: "Cost per Pound", value: `$${costPerPound.toFixed(2)}` },
  ];

  return { daysPerBag, dailyCost, weeklyCost, monthlyCost, annualCost, costPerPound, bagsPerYear, chartData, breakdown, summaryStats };
}

const DEFAULTS: PetFoodInputs = { bagPrice: 45, bagSize: 30, dailyCups: 2, cupsPerPound: 4, pets: 1 };

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
    <p className="font-bold text-muted-foreground mb-0.5">{label}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
) : null;

export default function PetFoodDailyCostCalculator() {
  const [bagPrice, setBagPrice] = useState("45");
  const [bagSize, setBagSize] = useState("30");
  const [dailyCups, setDailyCups] = useState("2");
  const [cupsPerPound, setCupsPerPound] = useState("4");
  const [pets, setPets] = useState("1");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PetFoodResult | null>(null);

  const calculate = () =>
    setResult(calcPetFood({
      bagPrice: parseFloat(bagPrice) || 0,
      bagSize: parseFloat(bagSize) || 0,
      dailyCups: parseFloat(dailyCups) || 0,
      cupsPerPound: parseFloat(cupsPerPound) || 0,
      pets: parseFloat(pets) || 1,
    }));
  const reset = () => { setBagPrice(DEFAULTS.bagPrice.toString()); setBagSize(DEFAULTS.bagSize.toString()); setDailyCups(DEFAULTS.dailyCups.toString()); setCupsPerPound(DEFAULTS.cupsPerPound.toString()); setPets(DEFAULTS.pets.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "How do I calculate the daily cost of pet food?", answer: "First find how long a bag lasts: multiply bag weight by cups per pound, then divide by the cups your pet eats per day. A 30 lb bag at 4 cups/lb is 120 cups, which lasts 60 days at 2 cups/day. Daily cost is then bag price ÷ days per bag: $45 ÷ 60 = $0.75/day." },
    { question: "How many cups are in a pound of pet food?", answer: "It varies with density and kibble size, but most dry foods run 3.5–4.5 cups per pound. If the label lists feeding amounts in grams or ounces, weigh a cup once and use cups per pound = 16 ÷ ounces per cup." },
    { question: "Why does cost per pound matter?", answer: "Bag prices differ wildly, but cost per pound is the apples-to-apples comparison: $45 for a 30 lb bag is $1.50/lb, while $35 for a 15 lb bag is $2.33/lb. The same logic applies across brands and sizes." },
    { question: "Should I buy bigger bags to save?", answer: "Usually yes — larger bags almost always have a lower per-pound price. But check your pet's feeding rate and storage: dry food degrades after opening, so a bag that lasts beyond 6–8 weeks may lose freshness. Balance unit price against how long it sits open." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator/everyday-life" }, { label: "Pet Food Daily Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pet Food Daily Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Bag Price" value={bagPrice} onChange={setBagPrice} prefix="$" />
              <CompactInput id="size" label="Bag Size" value={bagSize} onChange={setBagSize} suffix="lb" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="daily" label="Daily Food Amount" value={dailyCups} onChange={setDailyCups} suffix="cups" />
              <CompactInput id="cupslb" label="Cups per Pound" value={cupsPerPound} onChange={setCupsPerPound} />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Household</label>
                    <CompactInput id="pets" label="Number of Pets" value={pets} onChange={setPets} />
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Food Cost</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.dailyCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground font-medium">per day · a {bagSize} lb bag lasts {result.daysPerBag.toFixed(1)} days</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Cost", `$${result.monthlyCost.toFixed(2)}`], ["Annual Cost", `$${result.annualCost.toFixed(2)}`], ["Days per Bag", `${result.daysPerBag.toFixed(1)} days`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-4">Cost by Time Period</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
            <h2 className="text-2xl font-bold mb-3">Feeding Costs, Down to the Day</h2>
            <p>Pet food is a recurring cost that sneaks up on a budget because the price tag is on the bag, not the bowl. This <strong>pet food daily cost calculator</strong> converts bag price, bag size, and feeding amount into the number that matters for budgeting: how much your pet's food costs per day, month, and year.</p>
            <h2 className="text-2xl font-bold mb-3">The Bag Economics</h2>
            <p>A bag's price means little without its size and your pet's intake. The calculator derives days-per-bag from weight, cups per pound, and daily cups, then divides the bag price across those days. That is where the $0.75/day figure comes from — and where brand comparisons become honest.</p>
            <h2 className="text-2xl font-bold mb-3">Sizing Up the Annual Total</h2>
            <p>At $0.75/day, feeding runs about $274 a year per pet. Multiply by multiple pets and premium brands and the annual figure climbs into four figures. Tracking it yearly makes the choice between brands, bag sizes, and feeding guidelines a visible budget decision instead of a rounding error.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pet-food-daily-cost-calculator" />
          <PopularCalculators exclude="/calculator/pet-food-daily-cost-calculator" />
        </div>
      </div>
    </>
  );
}
