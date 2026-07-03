"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart as RPieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";

interface VacResult {
  totalBudget: number;
  perPerson: number;
  perDay: number;
  breakdown: { category: string; amount: number; pct: number }[];
  contingency: number;
  grandTotal: number;
}

const DEFAULTS = {
  flights: "1200",
  accommodation: "900",
  food: "600",
  transport: "300",
  activities: "400",
  shopping: "200",
  travel_insurance: "120",
  miscellaneous: "100",
  people: "2",
  days: "7",
  contingency_pct: "10",
};

function calculate(d: typeof DEFAULTS): VacResult {
  const vals = {
    flights: parseFloat(d.flights) || 0,
    accommodation: parseFloat(d.accommodation) || 0,
    food: parseFloat(d.food) || 0,
    transport: parseFloat(d.transport) || 0,
    activities: parseFloat(d.activities) || 0,
    shopping: parseFloat(d.shopping) || 0,
    travel_insurance: parseFloat(d.travel_insurance) || 0,
    miscellaneous: parseFloat(d.miscellaneous) || 0,
  };
  const people = Math.max(1, parseFloat(d.people) || 1);
  const days = Math.max(1, parseFloat(d.days) || 1);
  const contingencyPct = parseFloat(d.contingency_pct) || 0;

  const cats = [
    { category: "Flights", amount: vals.flights },
    { category: "Accommodation", amount: vals.accommodation },
    { category: "Food & Dining", amount: vals.food },
    { category: "Local Transport", amount: vals.transport },
    { category: "Activities & Tours", amount: vals.activities },
    { category: "Shopping & Souvenirs", amount: vals.shopping },
    { category: "Travel Insurance", amount: vals.travel_insurance },
    { category: "Miscellaneous", amount: vals.miscellaneous },
  ];

  const totalBudget = cats.reduce((s, c) => s + c.amount, 0);
  const contingency = totalBudget * (contingencyPct / 100);
  const grandTotal = totalBudget + contingency;

  const breakdown = cats.filter(c => c.amount > 0).map(c => ({
    ...c,
    pct: totalBudget > 0 ? (c.amount / totalBudget) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    totalBudget,
    perPerson: grandTotal / people,
    perDay: grandTotal / days,
    breakdown,
    contingency,
    grandTotal,
  };
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmt2 = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const COLORS = ["hsl(var(--primary))","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316","#6366f1"];

export default function VacationBudgetCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [result, setResult] = useState<VacResult>(() => calculate(DEFAULTS));

  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const handleCalc = () => setResult(calculate(f));
  const handleReset = () => { setF(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const fields: { label: string; key: keyof typeof DEFAULTS }[] = [
    { label: "Flights / Airfare", key: "flights" },
    { label: "Accommodation", key: "accommodation" },
    { label: "Food & Dining", key: "food" },
    { label: "Local Transport", key: "transport" },
    { label: "Activities & Tours", key: "activities" },
    { label: "Shopping & Souvenirs", key: "shopping" },
    { label: "Travel Insurance", key: "travel_insurance" },
    { label: "Miscellaneous", key: "miscellaneous" },
  ];

  const faqs = [
    { question: "How much should I budget for a vacation?", answer: "A week-long domestic US vacation for two averages $3,500–$6,000 total. International trips typically run $5,000–$12,000 per couple for 7–10 days. Use this calculator to itemize your specific destinations and travel style." },
    { question: "What is the 10% contingency buffer?", answer: "Travel experts recommend adding 10–15% to your total vacation budget for unexpected costs — delayed flights, medical expenses, spontaneous excursions, or currency fluctuations. Our calculator builds this into the grand total." },
    { question: "How can I reduce accommodation costs?", answer: "Use Airbnb, Vrbo, or Hostelworld for alternatives to hotels. Book 3–6 months in advance for best rates. Consider apartments with kitchen access to reduce food costs. Loyalty program points can offset hotel costs significantly." },
    { question: "Should travel insurance be included in my budget?", answer: "Absolutely. Travel insurance typically costs 5–10% of the trip total and protects against cancellations, medical emergencies, and lost baggage. It is especially important for international travel and expensive trips." },
    { question: "How do I budget for food while traveling?", answer: "Estimate $50–$100 per person per day for mid-range dining. Mix hotel breakfasts, local markets, and sit-down restaurants. Cooking some meals in self-catering accommodation can cut food costs by 30–40%." },
    { question: "What is a per-day vacation budget?", answer: "Dividing your total trip cost by the number of days gives you the daily burn rate. Budget travelers aim for under $100/day per person; mid-range is $150–$300/day; luxury is $400+/day. Your per-day figure helps compare destination costs." },
    { question: "How early should I start saving for a vacation?", answer: "Divide your grand total by the months until your trip to find your monthly savings target. For a $5,000 trip in 12 months, save approximately $417/month. Open a dedicated high-yield savings account to prevent spending it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Vacation Budget Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vacation Budget Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">{label}</label>
                  <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                    <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Travelers", key: "people" as const, suffix: "ppl" },
                { label: "Trip Days", key: "days" as const, suffix: "days" },
                { label: "Contingency", key: "contingency_pct" as const, suffix: "%" },
              ].map(({ label, key, suffix }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-semibold text-foreground mb-1">{label}</label>
                  <div className="flex items-center rounded-md border border-input bg-background h-9 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                    <input type="number" value={f[key]} onChange={e => set(key)(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
                    <span className="pr-2 text-xs text-muted-foreground">{suffix}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleCalc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all">Calculate</button>
              <button onClick={handleReset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Total Vacation Budget</div>
              <div className="text-5xl font-extrabold text-foreground">{fmt(result.grandTotal)}</div>
              <div className="text-sm text-muted-foreground mt-1">incl. {fmt(result.contingency)} contingency</div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Per Person</div><div className="font-bold text-lg">{fmt(result.perPerson)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Per Day</div><div className="font-bold text-lg">{fmt2(result.perDay)}</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Base Budget</div><div className="font-bold text-lg">{fmt(result.totalBudget)}</div></div>
              </div>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm text-foreground mb-3">Budget Breakdown by Category</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={result.breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={85} innerRadius={45}>
                      {result.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RTooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50">
                <h3 className="font-bold text-foreground text-sm">Category Details</h3>
              </div>
              {result.breakdown.map((row, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-2.5 hover:bg-secondary/20 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground text-sm truncate">{row.category}</span>
                  </div>
                  <div className="text-center font-semibold text-sm">{fmt(row.amount)}</div>
                  <div className="text-right text-sm text-muted-foreground">{row.pct.toFixed(1)}%</div>
                </div>
              ))}
              {result.contingency > 0 && (
                <div className="grid grid-cols-3 px-4 py-2.5 hover:bg-secondary/20 border-b border-border/30 bg-amber-500/5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    Contingency ({f.contingency_pct}%)
                  </div>
                  <div className="text-center font-semibold text-sm">{fmt(result.contingency)}</div>
                  <div className="text-right text-sm text-muted-foreground">buffer</div>
                </div>
              )}
              <div className="px-4 py-2.5 bg-primary/5 grid grid-cols-3 font-bold border-t border-border">
                <span>Grand Total</span>
                <span className="text-center text-primary">{fmt(result.grandTotal)}</span>
                <span className="text-right text-muted-foreground">{f.days} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>About the Vacation Budget Calculator</h2>
            <p>Planning a vacation without a budget is one of the fastest ways to return home stressed about finances. This vacation budget calculator lets you itemize all trip expenses across eight common categories, set your travel group size and trip length, and automatically adds a contingency buffer for unexpected costs. The result is a comprehensive, realistic trip budget with per-person and per-day metrics.</p>
            <h2>How Vacation Budgets Are Calculated</h2>
            <p>Total budget = sum of all category expenses. Contingency = total × contingency %. Grand total = total + contingency. Per person = grand total ÷ number of travelers. Per day = grand total ÷ trip length in days. These metrics allow you to compare your planned trip against travel benchmarks and adjust categories to hit a target spend.</p>
            <h2>Average Vacation Costs by Destination Type</h2>
            <p>Domestic US travel for two people averages $4,200–$6,500 per week all-in. A week in Western Europe costs $6,000–$10,000 per couple. Southeast Asia is significantly cheaper at $2,500–$4,000 for two. Caribbean all-inclusive resorts range from $3,000–$8,000 per couple for seven nights. Your per-day figure should benchmark against these ranges to assess whether your budget is realistic.</p>
            <h2>The Biggest Budget Categories Explained</h2>
            <p><strong>Flights:</strong> Typically the largest single expense (25–35% of total). Book 6–8 weeks in advance for domestic and 3–6 months for international. Use Google Flights, Hopper, or Scott's Cheap Flights to track fares. <strong>Accommodation:</strong> The second largest at 20–30%. Alternatives to hotels (Airbnb, hostels, home-swapping) can cut this by 30–50%. <strong>Food:</strong> Budget $50–$100/person/day for mid-range. Cooking in self-catering accommodation saves substantially. <strong>Activities:</strong> Research free and low-cost activities at your destination — many world-class museums and attractions are free.</p>
            <h2>Why a Contingency Buffer Is Essential</h2>
            <p>Travel rarely goes exactly to plan. Airline delays may require unplanned hotel nights. Health emergencies can arise. Spontaneous excursions tempt even the strictest budgeters. Currency fluctuations affect international trips. A 10–15% contingency buffer prevents these situations from causing financial stress. If you return without using the buffer, transfer it directly to your next vacation fund.</p>
            <h2>Saving Strategies to Hit Your Vacation Budget</h2>
            <p>Open a dedicated vacation savings account. Automate monthly transfers equal to (Grand Total ÷ Months Until Trip). Use travel rewards credit cards for everyday purchases — a card offering 2–3x points on travel can offset $300–$600 in costs for a $5,000 trip. Sell unused items, take on extra work, or redirect discretionary spending temporarily to accelerate savings.</p>
            <h2>Travel Insurance — Don't Skip It</h2>
            <p>Travel insurance typically costs 5–10% of the trip total and covers trip cancellation, emergency medical, evacuation, and baggage loss. For a $6,000 trip, expect to pay $200–$600 for comprehensive coverage. It is particularly critical for international travel where medical costs can be catastrophic. Always compare policies on InsureMyTrip or Squaremouth before purchasing.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vacation-budget-calculator" />
          <PopularCalculators exclude="/calculator/vacation-budget-calculator" />
        </div>
      </div>
    </>
  );
}
