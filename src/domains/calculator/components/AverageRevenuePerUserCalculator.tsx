"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown, Printer } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
type TimePeriod = "monthly" | "annual";

interface ArpuInputs {
  timePeriod: TimePeriod;
  totalRevenue: number;
  totalUsers: number;
  userGrowthPct: number;
  arpuGrowthPct: number;
}

interface ChartPoint {
  month: string;
  revenue: number;
  users: number;
}

interface ArpuResults {
  arpu: number;
  annualizedRevenue: number;
  projectedArpu: number;
  projectedUsers: number;
  projectedMonthlyRevenue: number;
  yearOneTotalRevenue: number;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcArpu(i: ArpuInputs): ArpuResults {
  const arpu = i.totalUsers > 0 ? i.totalRevenue / i.totalUsers : 0;
  const annualizedRevenue = i.timePeriod === "monthly" ? i.totalRevenue * 12 : i.totalRevenue;

  const chartData: ChartPoint[] = [{ month: "Now", revenue: Math.round(i.totalRevenue), users: Math.round(i.totalUsers) }];
  let users = i.totalUsers;
  let currentArpu = arpu;
  let monthlyRevenue = i.totalRevenue;
  let yearOneTotalRevenue = 0;

  for (let m = 1; m <= 12; m++) {
    users *= 1 + i.userGrowthPct / 100;
    currentArpu *= 1 + i.arpuGrowthPct / 100;
    monthlyRevenue = currentArpu * users;
    yearOneTotalRevenue += monthlyRevenue;
    chartData.push({ month: `Month ${m}`, revenue: Math.round(monthlyRevenue), users: Math.round(users) });
  }

  const periodLabel = i.timePeriod === "monthly" ? "Monthly" : "Annual";

  const breakdown = [
    { label: "Time Period", value: periodLabel },
    { label: "Total Revenue", value: `$${i.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Active Users", value: Math.round(i.totalUsers).toLocaleString("en-US") },
    { label: "ARPU", value: `$${arpu.toFixed(2)}`, highlight: true },
    { label: "Annualized Revenue (Run Rate)", value: `$${annualizedRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Projected ARPU (Month 12)", value: `$${currentArpu.toFixed(2)}` },
    { label: "Projected Users (Month 12)", value: Math.round(users).toLocaleString("en-US") },
    { label: "Projected Monthly Revenue (Month 12)", value: `$${Math.round(monthlyRevenue).toLocaleString("en-US")}` },
    { label: "Total Projected Revenue (Year 1)", value: `$${Math.round(yearOneTotalRevenue).toLocaleString("en-US")}`, isTotal: true },
  ];

  const summaryStats = [
    { label: "ARPU", value: `$${arpu.toFixed(2)}` },
    { label: "Annualized Revenue", value: `$${annualizedRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Projected ARPU (12 mo)", value: `$${currentArpu.toFixed(2)}` },
    { label: "Projected Users (12 mo)", value: Math.round(users).toLocaleString("en-US") },
    { label: "Projected Revenue (12 mo)", value: `$${Math.round(monthlyRevenue).toLocaleString("en-US")}/mo` },
    { label: "Year-1 Total Revenue", value: `$${Math.round(yearOneTotalRevenue).toLocaleString("en-US")}` },
    { label: "User Growth (MoM)", value: `${i.userGrowthPct}%` },
    { label: "ARPU Growth (MoM)", value: `${i.arpuGrowthPct}%` },
  ];

  return {
    arpu,
    annualizedRevenue,
    projectedArpu: currentArpu,
    projectedUsers: users,
    projectedMonthlyRevenue: monthlyRevenue,
    yearOneTotalRevenue,
    chartData,
    breakdown,
    summaryStats,
  };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  timePeriod: "monthly",
  totalRevenue: "100000",
  totalUsers: "5000",
  userGrowthPct: "2",
  arpuGrowthPct: "0",
};

const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// 4. Component
export default function AverageRevenuePerUserCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<ArpuResults>(() =>
    calcArpu({
      timePeriod: "monthly",
      totalRevenue: 100000,
      totalUsers: 5000,
      userGrowthPct: 2,
      arpuGrowthPct: 0,
    })
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(
      calcArpu({
        timePeriod: "monthly",
        totalRevenue: 100000,
        totalUsers: 5000,
        userGrowthPct: 2,
        arpuGrowthPct: 0,
      })
    );
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => {
    setResult(
      calcArpu({
        timePeriod: inputs.timePeriod as TimePeriod,
        totalRevenue: parseFloat(inputs.totalRevenue) || 0,
        totalUsers: parseFloat(inputs.totalUsers) || 0,
        userGrowthPct: parseFloat(inputs.userGrowthPct) || 0,
        arpuGrowthPct: parseFloat(inputs.arpuGrowthPct) || 0,
      })
    );
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(
      calcArpu({ timePeriod: "monthly", totalRevenue: 100000, totalUsers: 5000, userGrowthPct: 2, arpuGrowthPct: 0 })
    );
  };

  // Validation
  const errors: Record<string, string> = {};
  const revenue = parseFloat(inputs.totalRevenue) || 0;
  const users = parseFloat(inputs.totalUsers) || 0;
  const userGrowth = parseFloat(inputs.userGrowthPct) || 0;
  const arpuGrowth = parseFloat(inputs.arpuGrowthPct) || 0;
  if (inputs.totalRevenue.trim() === "") errors.totalRevenue = "Revenue is required";
  else if (revenue < 0) errors.totalRevenue = "Revenue cannot be negative";
  if (inputs.totalUsers.trim() === "") errors.totalUsers = "Active users is required";
  else if (users <= 0) errors.totalUsers = "Active users must be greater than 0";
  if (userGrowth < -100) errors.userGrowthPct = "Growth cannot be below -100%";
  if (arpuGrowth < -100) errors.arpuGrowthPct = "Growth cannot be below -100%";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is ARPU?", answer: "ARPU stands for Average Revenue Per User (or sometimes Average Revenue Per Unit). It is a metric used primarily by subscription-based companies, telecommunications, and media companies to measure how much revenue they generate on average from each active customer." },
    { question: "How do you calculate ARPU?", answer: "The formula is very straightforward: Total Revenue in a given period divided by the Total Number of Active Users in that same period. For example, if you generate $100,000 in a month from 5,000 active users, your monthly ARPU is $20." },
    { question: "Is ARPU calculated monthly or annually?", answer: "It can be calculated for any time period, but it is most commonly calculated monthly (especially for SaaS companies) to align with Monthly Recurring Revenue (MRR). Telecommunications companies often report it quarterly, and some businesses track annual ARPU." },
    { question: "Why is ARPU important?", answer: "ARPU helps businesses understand the value of their customer base. A high ARPU means you can afford higher Customer Acquisition Costs (CAC). By tracking ARPU over time, you can see if your upselling strategies are working or if your product is becoming commoditized." },
    { question: "How can I increase ARPU?", answer: "You can increase ARPU by upselling users to premium tiers, cross-selling complementary products, increasing prices, or eliminating unengaged free/low-tier users who dilute the average." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "ARPU Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">ARPU Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="total-revenue" className={lbl}>Total Revenue</label>
                <div className={inp}>
                  <span className="pl-3 text-muted-foreground text-sm">$</span>
                  <input id="total-revenue" type="number" min="0" value={inputs.totalRevenue} onChange={(e) => set("totalRevenue")(e.target.value)} className={ci} />
                </div>
                {errors.totalRevenue && <p className="text-xs text-red-500 font-medium mt-1">{errors.totalRevenue}</p>}
              </div>
              <div>
                <label htmlFor="total-users" className={lbl}>Active Users</label>
                <div className={inp}>
                  <input id="total-users" type="number" min="1" value={inputs.totalUsers} onChange={(e) => set("totalUsers")(e.target.value)} className={ci} />
                </div>
                {errors.totalUsers && <p className="text-xs text-red-500 font-medium mt-1">{errors.totalUsers}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="time-period" className={lbl}>Time Period</label>
              <select
                id="time-period"
                value={inputs.timePeriod}
                onChange={(e) => set("timePeriod")(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Projection Settings</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="user-growth" className={lbl}>MoM User Growth</label>
                        <div className={inp}>
                          <input id="user-growth" type="number" step="0.1" value={inputs.userGrowthPct} onChange={(e) => set("userGrowthPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.userGrowthPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.userGrowthPct}</p>}
                      </div>
                      <div>
                        <label htmlFor="arpu-growth" className={lbl}>MoM ARPU Growth</label>
                        <div className={inp}>
                          <input id="arpu-growth" type="number" step="0.1" value={inputs.arpuGrowthPct} onChange={(e) => set("arpuGrowthPct")(e.target.value)} className={ci} />
                          <span className="pr-3 text-muted-foreground text-sm">%</span>
                        </div>
                        {errors.arpuGrowthPct && <p className="text-xs text-red-500 font-medium mt-1">{errors.arpuGrowthPct}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline absolute top-3 right-3 focus:outline-none">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">ARPU</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">${result.arpu.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Per {result.breakdown[0].value.toLowerCase() === "annual" ? "year" : "month"} · {fmtMoney(result.annualizedRevenue)} annualized
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Annualized Run Rate", fmtMoney(result.annualizedRevenue)],
                ["Proj. Revenue (+12m)", `${fmtMoney(result.projectedMonthlyRevenue)}/mo`],
                ["Proj. Users (+12m)", Math.round(result.projectedUsers).toLocaleString("en-US")],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">ARPU Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">12-Month Revenue & User Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis yAxisId="left" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(value: number, name: string) => (name === "users" ? [value.toLocaleString(), "Users"] : [`$${Math.round(value).toLocaleString()}`, "Revenue"])} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13, marginTop: 10 }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="users" name="Users" stroke="#10b981" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is ARPU?</h2>
            <p>Average Revenue Per User (ARPU) is a highly tracked performance metric in the software, media, telecommunications, and digital services industries. It essentially breaks down your total revenue on a per-customer basis. By understanding how much revenue a single user generates on average, executives and investors can quickly gauge the profitability of the business model and the effectiveness of upselling strategies.</p>
            <h2 className="text-2xl font-bold mb-3">How to Calculate ARPU</h2>
            <p>The standard formula is incredibly simple: <code>ARPU = Total Revenue / Total Active Users</code>. The time period must remain consistent. If you are using your Monthly Recurring Revenue (MRR), you will divide it by the number of active users in that month to get your monthly ARPU. If you are calculating an annual ARPU, you use the entire year's revenue divided by the average number of users across the year.</p>
            <h2 className="text-2xl font-bold mb-3">Why ARPU is Crucial for Growth</h2>
            <p>ARPU is directly tied to a company's Customer Acquisition Cost (CAC) limit. If your monthly ARPU is $10 and your average customer stays for 12 months, the Lifetime Value (LTV) of a user is $120. That means you absolutely cannot spend more than $120 to acquire a customer. However, if you can raise your ARPU to $20 through premium features or add-ons, your LTV doubles to $240, unlocking larger marketing budgets and faster growth.</p>
            <h2 className="text-2xl font-bold mb-3">ARPU vs. ARPPU</h2>
            <p>In freemium business models (like mobile games or SaaS platforms with free tiers), many companies track ARPPU (Average Revenue Per <em>Paying</em> User) instead of ARPU. While a game might have 1,000,000 active users, only 50,000 might actually pay for in-app purchases. Calculating revenue across all 1M users results in an artificially low ARPU, whereas calculating it across the 50,000 paying users (ARPPU) gives a clearer picture of how much spenders are willing to pay.</p>
            <h2 className="text-2xl font-bold mb-3">Strategies to Increase ARPU</h2>
            <p>Increasing ARPU is often cheaper than acquiring new customers. The most common strategies include creating tiered pricing models (Good, Better, Best), cross-selling related services, usage-based billing (where customers who use the product more pay more), and straight price increases. A healthy SaaS company should see its ARPU steadily grow year over year as the product matures and provides more value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/average-revenue-per-user-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
