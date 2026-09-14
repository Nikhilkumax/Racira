"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, UtensilsCrossed } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CateringResult {
  guests: number;
  mealType: string;
  appetizers: number;
  protein: number;
  sides: number;
  drinks: number;
  dessert: number;
  chartData: { name: string; amount: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// Per-guest quantity estimates (servings) by meal style.
const MEAL_PROFILES: Record<string, { appetizers: number; protein: number; sides: number; drinks: number; dessert: number; label: string }> = {
  cocktail: { appetizers: 8, protein: 2, sides: 0, drinks: 3, dessert: 1, label: "Cocktail Reception" },
  buffet: { appetizers: 4, protein: 5, sides: 3, drinks: 2, dessert: 1, label: "Buffet Dinner" },
  plated: { appetizers: 3, protein: 6, sides: 4, drinks: 2, dessert: 1, label: "Plated Dinner" },
  bbq: { appetizers: 3, protein: 7, sides: 3, drinks: 3, dessert: 1, label: "BBQ / Casual" },
};

function calcCatering(guests: number, mealType: string, hours: number): CateringResult {
  const p = MEAL_PROFILES[mealType] || MEAL_PROFILES.buffet;
  const hourFactor = 1 + Math.max(0, hours - 2) * 0.1;
  const appetizers = Math.round(guests * p.appetizers * hourFactor);
  const protein = Math.round(guests * p.protein);
  const sides = Math.round(guests * p.sides);
  const drinks = Math.round(guests * p.drinks * (1 + Math.max(0, hours - 1) * 0.15));
  const dessert = Math.round(guests * p.dessert);

  const chartData = [
    { name: "Appetizers", amount: appetizers },
    { name: "Protein (oz)", amount: protein },
    { name: "Sides (cups)", amount: sides },
    { name: "Drinks", amount: drinks },
    { name: "Desserts", amount: dessert },
  ];

  const breakdown = [
    { label: "Guests", value: `${guests.toLocaleString()}` },
    { label: "Meal Style", value: p.label },
    { label: "Event Length", value: `${hours} hrs` },
    { label: "Appetizers (pieces)", value: `${appetizers.toLocaleString()}` },
    { label: "Protein", value: `${protein.toLocaleString()} oz (~${(protein / 6).toFixed(1)} lb)` },
    { label: "Side Dishes", value: `${sides.toLocaleString()} cups` },
    { label: "Drinks (incl. bar)", value: `${drinks.toLocaleString()} servings` },
    { label: "Desserts", value: `${dessert.toLocaleString()} pieces` },
  ];

  const summaryStats = [
    { label: "Guests", value: `${guests.toLocaleString()}` },
    { label: "Meal Style", value: p.label },
    { label: "Total Food Servings", value: `${(appetizers + protein + sides + dessert).toLocaleString()}` },
    { label: "Drink Servings", value: `${drinks.toLocaleString()}` },
    { label: "Protein per Guest", value: `${p.protein} oz` },
    { label: "Rule of Thumb", value: "Plan 10% extra for seconds" },
  ];

  return { guests, mealType, appetizers, protein, sides, drinks, dessert, chartData, breakdown, summaryStats };
}

const DEFAULTS = { guests: "50", mealType: "buffet", hours: "2" };

export default function CateringQuantityCalculator() {
  const [guests, setGuests] = useState(DEFAULTS.guests);
  const [mealType, setMealType] = useState(DEFAULTS.mealType);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [result, setResult] = useState<CateringResult>(() => calcCatering(50, "buffet", 2));

  useEffect(() => {
    const g = parseFloat(guests);
    const h = parseFloat(hours);
    if (!isNaN(g) && g >= 1 && !isNaN(h) && h >= 1) setResult(calcCatering(Math.round(g), mealType, h));
  }, []);

  const handleCalculate = () => {
    const g = parseFloat(guests);
    const h = parseFloat(hours);
    if (!isNaN(g) && g >= 1 && !isNaN(h) && h >= 1) setResult(calcCatering(Math.round(g), mealType, h));
  };
  const reset = () => { setGuests(DEFAULTS.guests); setMealType(DEFAULTS.mealType); setHours(DEFAULTS.hours); setResult(calcCatering(Math.round(parseFloat(DEFAULTS.guests)), DEFAULTS.mealType, parseFloat(DEFAULTS.hours))); };
  const invalid = isNaN(parseFloat(guests)) || parseFloat(guests) < 1 || isNaN(parseFloat(hours)) || parseFloat(hours) < 1;

  const faqs = [
    { question: "How much food per guest should I order?", answer: "For a buffet, plan 4–5 oz of protein, 3 cups of sides, and 3–4 appetizer pieces per guest. Plated dinners are slightly larger on protein; cocktail parties need more appetizers (6–8 pieces per person)." },
    { question: "Should I order extra food?", answer: "Caterers typically recommend 10–15% extra to cover seconds and unexpected guests. For long events (3+ hours), add another 10%." },
    { question: "How many drinks per guest?", answer: "Plan 2 drinks for the first hour and 1 per hour after that, so a 3-hour event needs roughly 4 servings per guest. Add 15–20% if the crowd skews heavy drinkers or it is an open bar." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Catering Quantity Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Catering Quantity Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="guests" className="block text-sm font-medium mb-1 text-foreground">Number of Guests</label>
                <input id="guests" type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="hours" className="block text-sm font-medium mb-1 text-foreground">Event Length (hrs)</label>
                <input id="hours" type="number" min="1" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="mealtype" className="block text-sm font-medium mb-1 text-foreground">Meal Style</label>
              <select id="mealtype" value={mealType} onChange={(e) => setMealType(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="cocktail">Cocktail Reception</option>
                <option value="buffet">Buffet Dinner</option>
                <option value="plated">Plated Dinner</option>
                <option value="bbq">BBQ / Casual</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <UtensilsCrossed className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Guests and hours must be at least 1.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Protein Needed</div>
              <div className="text-4xl font-extrabold text-primary">{result.protein.toLocaleString()} oz</div>
              <div className="text-sm text-muted-foreground mt-1">≈ {(result.protein / 16).toFixed(1)} lb · {result.guests.toLocaleString()} guests · {MEAL_PROFILES[result.mealType].label}</div>
            </div>

            <div className="grid grid-cols-4 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Appetizers</div>
                <div className="text-lg font-bold text-primary">{result.appetizers.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Sides (cups)</div>
                <div className="text-lg font-bold text-primary">{result.sides.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Drinks</div>
                <div className="text-lg font-bold text-primary">{result.drinks.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Desserts</div>
                <div className="text-lg font-bold text-primary">{result.dessert.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
                    <th className="p-2.5 pr-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Order Amounts by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, n: string) => [`${v.toLocaleString()}`, n]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Catering Quantity Calculator</h2>
            <p>Ordering the right amount of food for an event prevents both waste and empty plates. This calculator applies industry per-guest serving standards — roughly 4–5 oz of protein, 3 cups of sides, and 3–8 appetizer pieces per person depending on meal style — and scales them to your guest count and event length.</p>
            <h3>Adjusting for Your Event</h3>
            <p>Cocktail receptions skew heavy on appetizers (6–8 pieces per guest); plated dinners skew heavy on protein. Longer events need more drinks and a 10% bump on appetizers. When in doubt, add 10–15% for seconds and unexpected guests.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/catering-quantity-calculator" />
          <PopularCalculators exclude="/calculator/catering-quantity-calculator" />
        </div>
      </div>
    </>
  );
}
