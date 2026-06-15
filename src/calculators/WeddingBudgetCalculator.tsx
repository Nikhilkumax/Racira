"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, PartyPopper } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface WeddingResult {
  venue: number;
  catering: number;
  photography: number;
  attire: number;
  flowers: number;
  entertainment: number;
  invitations: number;
  gifts: number;
  transportation: number;
  miscellaneous: number;
  total: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateWedding = (budgetStr: string): WeddingResult | null => {
  const budget = parseFloat(budgetStr);

  if (isNaN(budget) || budget <= 0) return null;

  try {
    // Standard industry breakdown percentages
    // Venue & Catering are often grouped, but let's separate them
    // Venue & Rentals: 20%
    // Catering & Cake: 30%
    // Photography & Videography: 12%
    // Attire & Beauty: 10%
    // Flowers & Decor: 8%
    // Entertainment (Band/DJ): 8%
    // Invitations & Paper: 3%
    // Favors & Gifts: 2%
    // Transportation: 2%
    // Miscellaneous / Emergency buffer: 5%

    return {
      venue: budget * 0.20,
      catering: budget * 0.30,
      photography: budget * 0.12,
      attire: budget * 0.10,
      flowers: budget * 0.08,
      entertainment: budget * 0.08,
      invitations: budget * 0.03,
      gifts: budget * 0.02,
      transportation: budget * 0.02,
      miscellaneous: budget * 0.05,
      total: budget,
      isError: false
    };

  } catch (err) {
    return { venue: 0, catering: 0, photography: 0, attire: 0, flowers: 0, entertainment: 0, invitations: 0, gifts: 0, transportation: 0, miscellaneous: 0, total: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const WeddingBudgetCalculator = () => {
  const [budget, setBudget] = useState("30000");

  const [result, setResult] = useState<WeddingResult | null>(null);

  const calculate = () => {
    setResult(calculateWedding(budget));
  };

  useEffect(() => { calculate(); }, [budget]);

  const wrap = "flex items-center rounded-md border border-input bg-background h-12 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-2 text-xl font-bold bg-transparent outline-none border-none text-foreground";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const faqs = [
    { question: "Why is Catering the largest expense?", answer: "Feeding 150 people is essentially throwing a massive dinner party at a high-end restaurant. When you combine the cost of the food ingredients, the chef's labor, the serving staff, the bartenders, alcohol, and the wedding cake, the food and beverage cost almost always consumes roughly 30% to 40% of the entire budget." },
    { question: "Do I really need a 5% emergency buffer?", answer: "Absolutely. Unexpected expenses are virtually guaranteed at a wedding. You might need to pay for extra postage on heavy invitations, last-minute vendor meals, sudden alterations to a dress, or overtime fees if the DJ plays for an extra hour. Never allocate 100% of your budget in the planning phase." },
    { question: "How can I drastically cut the budget?", answer: "The absolute fastest way to cut a wedding budget is to cut the guest list. Almost every major expense (food, alcohol, tables, chairs, centerpieces, invitations) is calculated on a 'per head' basis. Cutting 20 people from the guest list can easily save you $3,000 to $5,000 instantly." },
    { question: "Should I tip my vendors?", answer: "Yes, tipping is standard practice and often overlooked in the initial budget. While business owners (like a solo photographer) do not traditionally expect tips, it is highly customary to tip delivery drivers, setup crews, waitstaff, bartenders, and hair/makeup artists. Check your contracts carefully; some venues automatically include a 20% 'service charge' or gratuity." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Wedding Budget Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wedding Budget Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-6 !p-6 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Total Wedding Budget</label>
              <div className="flex items-center rounded-md border border-input bg-primary/5 h-14 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-4 text-primary font-bold text-xl">$</span>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full h-full px-2 text-2xl font-bold bg-transparent outline-none border-none text-foreground" min="1" step="any" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Enter the absolute maximum amount of money you are willing to spend. We will use industry standards to distribute it.</p>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-14 text-lg transition-all active:scale-[0.98] shadow-sm">
                <PartyPopper className="h-5 w-5" /> Calculate Breakdown
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please enter a valid budget amount.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                <div className="bg-secondary/50 p-4 border-b border-border/50 flex justify-between items-center">
                  <h3 className="font-bold text-foreground">Recommended Budget Allocation</h3>
                </div>
                
                <div className="p-4 bg-background">
                  <div className="h-64 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Catering (30%)', value: result.catering },
                            { name: 'Venue (20%)', value: result.venue },
                            { name: 'Photo/Video (12%)', value: result.photography },
                            { name: 'Attire (10%)', value: result.attire },
                            { name: 'Flowers (8%)', value: result.flowers },
                            { name: 'Music (8%)', value: result.entertainment },
                            { name: 'Other (12%)', value: result.miscellaneous + result.invitations + result.gifts + result.transportation },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#f43f5e" /> {/* rose */}
                          <Cell fill="#8b5cf6" /> {/* violet */}
                          <Cell fill="#0ea5e9" /> {/* sky */}
                          <Cell fill="#10b981" /> {/* emerald */}
                          <Cell fill="#f59e0b" /> {/* amber */}
                          <Cell fill="#3b82f6" /> {/* blue */}
                          <Cell fill="#64748b" /> {/* slate */}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Food & Beverage (30%)</div>
                    <div className="text-right font-mono text-rose-500 font-bold">{formatCurrency(result.catering)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Venue & Rentals (20%)</div>
                    <div className="text-right font-mono text-violet-500 font-bold">{formatCurrency(result.venue)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Photography & Video (12%)</div>
                    <div className="text-right font-mono text-sky-500 font-bold">{formatCurrency(result.photography)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Attire & Beauty (10%)</div>
                    <div className="text-right font-mono text-emerald-500 font-bold">{formatCurrency(result.attire)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Flowers & Decor (8%)</div>
                    <div className="text-right font-mono text-amber-500 font-bold">{formatCurrency(result.flowers)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Entertainment/DJ (8%)</div>
                    <div className="text-right font-mono text-blue-500 font-bold">{formatCurrency(result.entertainment)}</div>
                  </div>
                  <div className="grid grid-cols-2 p-3 items-center hover:bg-secondary/20 transition-colors">
                    <div className="text-sm font-bold text-foreground">Emergency Buffer (5%)</div>
                    <div className="text-right font-mono text-slate-500 font-bold">{formatCurrency(result.miscellaneous)}</div>
                  </div>
                </div>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Mathematics of a Wedding</h2>
            <p>Planning a wedding is effectively managing a large-scale event production. Many couples start planning with an arbitrary total budget in mind, only to be completely shocked when they receive their first quote from a caterer or venue. Understanding the mathematical breakdown of the event is crucial to avoid going deeply into debt before the honeymoon even begins.</p>

            <h2>The 'Per Head' Reality</h2>
            <p>The single most important factor in a wedding budget is the guest count. In the wedding industry, almost everything is calculated "per head."</p>
            <p>If you invite 150 people, you don't just pay for 150 plates of food. You must rent 150 chairs. You need 15 tables to seat them. You need 15 expensive floral centerpieces to decorate those tables. You need a venue large enough to hold 150 people safely. You need to mail 75 heavy invitations. If you want to cut costs, <strong>do not try to save money by haggling with the florist. Save money by cutting the guest list.</strong> Reducing the guest list by just 20 people can instantly save thousands of dollars across multiple categories.</p>

            <h2>Why is Food Half the Budget?</h2>
            <p>When you combine the Venue rental and the Catering costs, you are looking at roughly 50% of your total budget. Feeding massive groups of people is incredibly labor-intensive. A standard catering quote doesn't just include chicken and steak; it includes the chef's labor, the kitchen equipment rental, the waitstaff to serve the food, the bartenders to pour the drinks, the alcohol itself, and the labor required to clean the dishes at the end of the night.</p>

            <h2>The 5% Emergency Buffer</h2>
            <p>Every professional event planner includes a buffer in their budget. A wedding has hundreds of moving parts, and things will inevitably change. You might forget to budget for vendor meals (you have to feed your photographer and DJ). You might need to pay overtime if the party runs late. You might have to pay a massive shipping fee for a dress alteration. Never allocate 100% of your money during the planning phase. Keep 5% locked away as an emergency fund.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wedding-budget-calculator" />
          <PopularCalculators exclude="/calculator/wedding-budget-calculator" />
        </div>
      </div>
    </>
  );
};
export default WeddingBudgetCalculator;
