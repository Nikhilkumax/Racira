"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RotateCcw } from "lucide-react";

// 1. TypeScript interfaces
interface ArpuResults {
  arpu: number;
  projectedArpuOneYear: number;
  projectedUsersOneYear: number;
  projectedRevenueOneYear: number;
  annualizedRevenue: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateArpu = (inputs: typeof DEFAULTS): ArpuResults => {
  const totalRevenue = parseFloat(inputs.totalRevenue);
  const totalUsers = parseFloat(inputs.totalUsers);
  const timePeriod = inputs.timePeriod; // "monthly" or "annual"
  
  // Advanced
  const expectedMonthlyUserGrowth = parseFloat(inputs.expectedMonthlyUserGrowth) / 100;
  const expectedMonthlyArpuGrowth = parseFloat(inputs.expectedMonthlyArpuGrowth) / 100;

  if ([totalRevenue, totalUsers, expectedMonthlyUserGrowth, expectedMonthlyArpuGrowth].some(v => isNaN(v) || v < 0 && v > -100)) {
    return { arpu: 0, projectedArpuOneYear: 0, projectedUsersOneYear: 0, projectedRevenueOneYear: 0, annualizedRevenue: 0, chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid numbers." };
  }
  if (totalUsers <= 0) {
    return { arpu: 0, projectedArpuOneYear: 0, projectedUsersOneYear: 0, projectedRevenueOneYear: 0, annualizedRevenue: 0, chartData: [], schedule: [], isError: true, errorMsg: "Total users must be greater than 0." };
  }

  // Calculate Base ARPU
  const arpu = totalRevenue / totalUsers;
  
  // Annualized Revenue
  const annualizedRevenue = timePeriod === "monthly" ? totalRevenue * 12 : totalRevenue;

  // Chart and Projection (always projecting forward 12 months)
  const chartData = [];
  const schedule = [];
  
  let currentArpu = arpu;
  let currentUsers = totalUsers;
  let currentRevenue = totalRevenue;

  chartData.push({
    month: "Now",
    "Revenue": Math.round(currentRevenue),
    "Users": Math.round(currentUsers)
  });
  schedule.push({ month: 0, arpu: currentArpu, users: currentUsers, revenue: currentRevenue });

  for (let m = 1; m <= 12; m++) {
    currentArpu = currentArpu * (1 + expectedMonthlyArpuGrowth);
    currentUsers = currentUsers * (1 + expectedMonthlyUserGrowth);
    currentRevenue = currentArpu * currentUsers;

    chartData.push({
      month: `Month ${m}`,
      "Revenue": Math.round(currentRevenue),
      "Users": Math.round(currentUsers)
    });
    schedule.push({ month: m, arpu: currentArpu, users: currentUsers, revenue: currentRevenue });
  }

  return {
    arpu: Number(arpu.toFixed(2)),
    projectedArpuOneYear: Number(currentArpu.toFixed(2)),
    projectedUsersOneYear: Math.round(currentUsers),
    projectedRevenueOneYear: Math.round(currentRevenue),
    annualizedRevenue: Math.round(annualizedRevenue),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  timePeriod: "monthly",
  totalRevenue: "100000",
  totalUsers: "5000",
  expectedMonthlyUserGrowth: "2",
  expectedMonthlyArpuGrowth: "0",
  showAdvanced: false
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix, type = "number", step = "any", options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type={type} step={step} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function AverageRevenuePerUserCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<ArpuResults>(calculateArpu(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string | boolean) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    if (key !== 'showAdvanced') {
      const r = calculateArpu(newInputs);
      if (!r.isError) setResults(r);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateArpu(DEFAULTS));
  };

  const faqs = [
    { question: "What is ARPU?", answer: "ARPU stands for Average Revenue Per User (or sometimes Average Revenue Per Unit). It is a metric used primarily by subscription-based companies, telecommunications, and media companies to measure how much revenue they generate on average from each active customer." },
    { question: "How do you calculate ARPU?", answer: "The formula is very straightforward: Total Revenue in a given period divided by the Total Number of Active Users in that same period. For example, if you generate $100,000 in a month from 5,000 active users, your monthly ARPU is $20." },
    { question: "Is ARPU calculated monthly or annually?", answer: "It can be calculated for any time period, but it is most commonly calculated monthly (especially for SaaS companies) to align with Monthly Recurring Revenue (MRR). Telecommunications companies often report it quarterly, and some businesses track annual ARPU." },
    { question: "Why is ARPU important?", answer: "ARPU helps businesses understand the value of their customer base. A high ARPU means you can afford higher Customer Acquisition Costs (CAC). By tracking ARPU over time, you can see if your upselling strategies are working or if your product is becoming commoditized." },
    { question: "How can I increase ARPU?", answer: "You can increase ARPU by upselling users to premium tiers, cross-selling complementary products, increasing prices, or eliminating unengaged free/low-tier users who dilute the average." }
  ];

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "ARPU Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Average Revenue Per User (ARPU) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">Calculate your ARPU and project future revenue based on user and revenue growth.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="timePeriod" label="Time Period" value={inputs.timePeriod} onChange={(v: string) => handleChange("timePeriod", v)} options={[
                { label: "Monthly", value: "monthly" },
                { label: "Annual", value: "annual" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="totalRevenue" label={`${inputs.timePeriod === 'monthly' ? 'Monthly' : 'Annual'} Revenue`} value={inputs.totalRevenue} onChange={(v: string) => handleChange("totalRevenue", v)} prefix="$" />
              <CompactInput id="totalUsers" label="Active Users" value={inputs.totalUsers} onChange={(v: string) => handleChange("totalUsers", v)} />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <button onClick={() => handleChange("showAdvanced", !inputs.showAdvanced)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <span>12-Month Projections</span>
                <span className="text-muted-foreground">{inputs.showAdvanced ? "▼" : "▶"}</span>
              </button>
              
              {inputs.showAdvanced && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <CompactInput id="expectedMonthlyUserGrowth" label="MoM User Growth" value={inputs.expectedMonthlyUserGrowth} onChange={(v: string) => handleChange("expectedMonthlyUserGrowth", v)} suffix="%" />
                  <CompactInput id="expectedMonthlyArpuGrowth" label="MoM ARPU Growth" value={inputs.expectedMonthlyArpuGrowth} onChange={(v: string) => handleChange("expectedMonthlyArpuGrowth", v)} suffix="%" />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{inputs.timePeriod === 'monthly' ? 'Monthly' : 'Annual'} ARPU</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-primary tracking-tighter">${results.arpu}</div>
                    </div>
                  </div>

                  <div className={`bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm`}>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Annualized Run Rate</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-foreground tracking-tighter">${results.annualizedRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm border-l-2 border-emerald-500">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Proj. Revenue (+12m)</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">${results.projectedRevenueOneYear.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Proj. Users (+12m)</div>
                    <div className="text-xl font-bold text-foreground">{results.projectedUsersOneYear.toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Proj. ARPU (+12m)</div>
                    <div className="text-xl font-bold text-foreground">${results.projectedArpuOneYear}</div>
                  </div>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">12-Month Revenue & User Projection</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tickFormatter={(val) => `$${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${(val/1000)}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} width={40} />
                        <RechartsTooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                        <Area yAxisId="right" type="monotone" dataKey="Users" stroke="hsl(var(--emerald-500))" fill="none" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Growth Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Month</th>
                          <th className="px-4 py-3 font-semibold text-right">ARPU</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">Users</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.slice(0, 13).map((row, idx) => (
                          <tr key={idx} className={`hover:bg-muted/20 transition-colors ${idx % 3 === 0 && idx !== 0 ? 'bg-muted/5' : ''}`}>
                            <td className="px-4 py-3 text-foreground font-medium">{idx === 0 ? 'Current' : `Month ${row.month}`}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${row.arpu.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-500">{Math.round(row.users).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">${Math.round(row.revenue).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is ARPU?</h2>
            <p>Average Revenue Per User (ARPU) is a highly tracked performance metric in the software, media, telecommunications, and digital services industries. It essentially breaks down your total revenue on a per-customer basis. By understanding how much revenue a single user generates on average, executives and investors can quickly gauge the profitability of the business model and the effectiveness of upselling strategies.</p>
            
            <h2>How to Calculate ARPU</h2>
            <p>The standard formula is incredibly simple: <code>ARPU = Total Revenue / Total Active Users</code>. The time period must remain consistent. If you are using your Monthly Recurring Revenue (MRR), you will divide it by the number of active users in that month to get your monthly ARPU. If you are calculating an annual ARPU, you use the entire year's revenue divided by the average number of users across the year.</p>
            
            <h2>Why ARPU is Crucial for Growth</h2>
            <p>ARPU is directly tied to a company's Customer Acquisition Cost (CAC) limit. If your monthly ARPU is $10 and your average customer stays for 12 months, the Lifetime Value (LTV) of a user is $120. That means you absolutely cannot spend more than $120 to acquire a customer. However, if you can raise your ARPU to $20 through premium features or add-ons, your LTV doubles to $240, unlocking larger marketing budgets and faster growth.</p>
            
            <h2>ARPU vs. ARPPU</h2>
            <p>In freemium business models (like mobile games or SaaS platforms with free tiers), many companies track ARPPU (Average Revenue Per <em>Paying</em> User) instead of ARPU. While a game might have 1,000,000 active users, only 50,000 might actually pay for in-app purchases. Calculating revenue across all 1M users results in an artificially low ARPU, whereas calculating it across the 50,000 paying users (ARPPU) gives a clearer picture of how much spenders are willing to pay.</p>
            
            <h2>Strategies to Increase ARPU</h2>
            <p>Increasing ARPU is often cheaper than acquiring new customers. The most common strategies include creating tiered pricing models (Good, Better, Best), cross-selling related services, usage-based billing (where customers who use the product more pay more), and straight price increases. A healthy SaaS company should see its ARPU steadily grow year over year as the product matures and provides more value.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/average-revenue-per-user-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
