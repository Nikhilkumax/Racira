"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TotalDebtRatioResult {
  totalDebt: number;
  totalAssets: number;
  debtRatio: number;
  isHealthy: boolean;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTotalDebtRatio(mortgage: number, auto: number, student: number, creditCards: number, otherDebt: number, realEstate: number, cash: number, investments: number, otherAssets: number): TotalDebtRatioResult {
  const totalDebt = mortgage + auto + student + creditCards + otherDebt;
  const totalAssets = realEstate + cash + investments + otherAssets;
  const debtRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  const equity = Math.max(0, totalAssets - totalDebt);
  
  // Generally < 40% is healthy for individuals
  const isHealthy = debtRatio <= 40;

  const pieData = [
    { name: "Total Debt", value: totalDebt },
    { name: "Net Equity", value: equity },
  ];

  const breakdown = [
    { label: "Total Liabilities (Debt)", value: `$${totalDebt.toLocaleString()}` },
    { label: "Total Assets", value: `$${totalAssets.toLocaleString()}` },
    { label: "Net Worth (Equity)", value: `$${(totalAssets - totalDebt).toLocaleString()}` },
    { label: "Total Debt Ratio", value: `${debtRatio.toFixed(2)}%` },
  ];

  const summaryStats = [
    { label: "Total Debt Ratio", value: `${debtRatio.toFixed(2)}%` },
    { label: "Health Status", value: isHealthy ? "Healthy (<40%)" : "High Risk (>40%)" },
    { label: "Total Assets", value: `$${totalAssets.toLocaleString()}` },
    { label: "Total Debt", value: `$${totalDebt.toLocaleString()}` },
    { label: "Net Worth", value: `$${(totalAssets - totalDebt).toLocaleString()}` },
    { label: "Leverage Multiplier", value: equity > 0 ? `${(totalAssets / equity).toFixed(2)}x` : "N/A" },
  ];

  return { totalDebt, totalAssets, debtRatio, isHealthy, pieData, breakdown, summaryStats };
}

const DEFAULTS = { 
  mortgage: "250000", auto: "25000", student: "40000", creditCards: "5000", otherDebt: "0",
  realEstate: "350000", cash: "20000", investments: "80000", otherAssets: "10000"
};
const PIE_COLORS = ["#ef4444", "#10b981"]; // Red for debt, Green for equity

export default function TotalDebtRatioCalculator() {
  const [mortgage, setMortgage] = useState(DEFAULTS.mortgage);
  const [auto, setAuto] = useState(DEFAULTS.auto);
  const [student, setStudent] = useState(DEFAULTS.student);
  const [creditCards, setCreditCards] = useState(DEFAULTS.creditCards);
  const [otherDebt, setOtherDebt] = useState(DEFAULTS.otherDebt);
  const [realEstate, setRealEstate] = useState(DEFAULTS.realEstate);
  const [cash, setCash] = useState(DEFAULTS.cash);
  const [investments, setInvestments] = useState(DEFAULTS.investments);
  const [otherAssets, setOtherAssets] = useState(DEFAULTS.otherAssets);
  
  const [result, setResult] = useState<TotalDebtRatioResult | null>(null);

  const calculate = () => setResult(calcTotalDebtRatio(
    parseFloat(mortgage) || 0, parseFloat(auto) || 0, parseFloat(student) || 0, parseFloat(creditCards) || 0, parseFloat(otherDebt) || 0,
    parseFloat(realEstate) || 0, parseFloat(cash) || 0, parseFloat(investments) || 0, parseFloat(otherAssets) || 0
  ));
  
  const reset = () => { 
    setMortgage(DEFAULTS.mortgage); setAuto(DEFAULTS.auto); setStudent(DEFAULTS.student); setCreditCards(DEFAULTS.creditCards); setOtherDebt(DEFAULTS.otherDebt);
    setRealEstate(DEFAULTS.realEstate); setCash(DEFAULTS.cash); setInvestments(DEFAULTS.investments); setOtherAssets(DEFAULTS.otherAssets);
    setResult(calcTotalDebtRatio(250000, 25000, 40000, 5000, 0, 350000, 20000, 80000, 10000)); 
  };
  
  useEffect(() => { setResult(calcTotalDebtRatio(250000, 25000, 40000, 5000, 0, 350000, 20000, 80000, 10000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the total debt ratio?", answer: "The total debt ratio (also known as debt-to-asset ratio) measures the percentage of your total assets that are financed by debt. Formula: Total Debt ÷ Total Assets. For individuals, it's a key indicator of overall financial health and leverage." },
    { question: "What is a healthy total debt ratio?", answer: "For individuals, a ratio below 40% is generally considered healthy. Between 40% and 60% indicates moderate leverage. Above 60% is considered high risk, as a small drop in asset values could wipe out your net worth (equity). The ideal ratio decreases as you get closer to retirement." },
    { question: "How is this different from debt-to-income (DTI)?", answer: "Debt-to-Income (DTI) compares your monthly debt payments to your monthly income. Total Debt Ratio compares your total outstanding debt balances to your total asset values. DTI measures cash flow sustainability, while Total Debt Ratio measures balance sheet solvency." },
    { question: "Does my mortgage hurt my debt ratio?", answer: "Yes, a mortgage increases your total debt. However, because it's usually backed by an appreciating asset (real estate), it's considered 'good debt' compared to credit cards. As you pay down the mortgage and your home appreciates, your ratio will naturally improve." },
    { question: "How can I improve my total debt ratio?", answer: "There are two ways: 1) Decrease the numerator (pay off debt aggressively using the snowball or avalanche method). 2) Increase the denominator (save more cash, invest more, or benefit from asset appreciation). Paying off debt using existing cash doesn't change your net worth, but it does lower your debt ratio safely." },
    { question: "Is a zero percent debt ratio the ultimate goal?", answer: "While a 0% debt ratio means you are completely debt-free and carry zero leverage risk, it may not always be mathematically optimal. If you can borrow at 3% and invest that money to earn 8%, some leverage can accelerate wealth creation. However, a 0% ratio provides unmatched peace of mind." },
    { question: "Do student loans count towards this ratio?", answer: "Yes, student loans are a liability and must be included in your total debt. Unlike a mortgage, student loans are not backed by a physical, sellable asset. Therefore, they increase your debt without simultaneously increasing your asset column, which can significantly drive up your ratio early in your career." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Total Debt Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Total Debt Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <h3 className="text-base font-bold text-foreground">Liabilities (Debt)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Mortgages</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={mortgage} onChange={e => setMortgage(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Auto Loans</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={auto} onChange={e => setAuto(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Student Loans</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={student} onChange={e => setStudent(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Credit Cards</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={creditCards} onChange={e => setCreditCards(e.target.value)} className={ci} /></div></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Other Debt</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherDebt} onChange={e => setOtherDebt(e.target.value)} className={ci} /></div></div>
            
            <hr className="border-border my-2" />
            <h3 className="text-base font-bold text-foreground">Assets</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Real Estate Value</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={realEstate} onChange={e => setRealEstate(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Cash/Bank Accts</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cash} onChange={e => setCash(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block">Investments</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={investments} onChange={e => setInvestments(e.target.value)} className={ci} /></div></div>
              <div><label className="text-sm font-medium mb-1.5 block">Other Assets</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={otherAssets} onChange={e => setOtherAssets(e.target.value)} className={ci} /></div></div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm"><Calculator className="h-4 w-4" /> Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-5 ${result.isHealthy ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500" : "bg-red-50 dark:bg-red-950/20 border-red-500"}`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.isHealthy ? "text-emerald-600" : "text-red-600"}`}>Total Debt Ratio</div>
                <div className={`text-4xl font-extrabold tracking-tight ${result.isHealthy ? "text-emerald-600" : "text-red-600"}`}>{result.debtRatio.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Total Assets: ${result.totalAssets.toLocaleString()} · Total Debt: ${result.totalDebt.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Assets", `$${result.totalAssets.toLocaleString()}`], ["Total Debt", `$${result.totalDebt.toLocaleString()}`], ["Net Worth", `$${(result.totalAssets - result.totalDebt).toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Balance Sheet Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Total Debt Ratio" ? "font-bold text-primary border-t-2 border-border" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Assets Composition (Debt vs Equity)</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is the Total Debt Ratio?</h2>
            <p>The <strong>total debt ratio</strong>, frequently referred to in financial planning as the debt-to-asset ratio, is a fundamental metric used to evaluate a person's or a business's financial leverage. It measures the exact percentage of your total assets that are financed by creditors versus the percentage you own outright (your equity). Simply put, it answers the question: "How much of what I own is actually mine?" For individuals, this is one of the most critical indicators of long-term financial health and solvency.</p>
            <p>While income dictates your day-to-day cash flow and ability to pay bills, your total debt ratio reveals your true underlying wealth. High-income earners can still have a poor total debt ratio if they finance everything they own—from luxury vehicles and primary residences to vacation homes and credit card spending. Conversely, someone with a modest income who diligently pays down their mortgage and avoids consumer debt might boast an excellent total debt ratio. A lower ratio means you are significantly more financially secure, less vulnerable to economic downturns, and closer to achieving true financial independence.</p>

            <h2>How It Works</h2>
            <p>The mechanics of the total debt ratio are straightforward but immensely powerful. To calculate it, you must aggregate all your liabilities and divide them by the sum of all your assets. The formula is universally expressed as: <strong>Total Debt Ratio = Total Liabilities (Debt) ÷ Total Assets</strong>.</p>
            <p>For example, let's break down a typical household's balance sheet. Suppose you have a mortgage balance of $300,000, an auto loan balance of $20,000, and outstanding credit card debt of $10,000. Your Total Debt (Liabilities) equals $330,000.</p>
            <p>Now, let's look at the asset side. Your home has a current market value of $400,000, your retirement accounts hold $100,000, and you have $20,000 in liquid cash savings. Your Total Assets equal $520,000.</p>
            <p>Applying the formula: $330,000 ÷ $520,000 = 0.634. Expressed as a percentage, your total debt ratio is 63.4%. This means that creditors effectively "own" 63.4% of your assets, while you possess equity in the remaining 36.6%. The calculator automates this math, allowing you to tweak individual variables to see how debt paydowns or asset growth affect your overall financial posture.</p>

            <h2>Understanding Your Results</h2>
            <p>Interpreting your total debt ratio is crucial for making informed financial decisions. The calculator provides several key outputs designed to give you a holistic view of your balance sheet.</p>
            <p><strong>Primary Debt Ratio:</strong> The headline number is your debt-to-asset percentage. This tells you your overall leverage. If this number is highlighted in green, your leverage is generally considered healthy. If it is red, it serves as a warning that your debt load may be disproportionately high compared to your assets.</p>
            <p><strong>Net Worth (Equity):</strong> The calculator subtracts your total debt from your total assets to reveal your net worth. This is the absolute dollar value of your wealth. A positive net worth means you own more than you owe; a negative net worth means your debts exceed your assets (technical insolvency).</p>
            <p><strong>Asset Composition Chart:</strong> The visual donut chart breaks down your asset base into the portion financed by debt versus your true equity. Watching the equity slice grow over time is a tangible visual representation of wealth accumulation.</p>
            <p><strong>Leverage Multiplier:</strong> This metric shows how magnified your financial position is. A 2.0x leverage multiplier means you control $2 of assets for every $1 of actual equity you hold. High leverage can accelerate wealth in a rising market but introduces severe risk in a declining one.</p>

            <h2>Key Factors</h2>
            <p>Several distinct factors heavily influence your total debt ratio. Understanding these components helps you pinpoint where to focus your financial energy.</p>
            <p><strong>Real Estate Values vs. Mortgages:</strong> For most households, the primary residence is both the largest asset and the largest liability. Consequently, your home's market value and your outstanding mortgage balance exert the most significant gravitational pull on your ratio. In a hot housing market, your ratio might improve simply through property appreciation, even if you haven't paid down extra principal.</p>
            <p><strong>Consumer Debt Load:</strong> Credit cards, personal loans, and auto loans are toxic to your total debt ratio. Because these debts are either unsecured or backed by depreciating assets (like cars), they inflate your liabilities without providing a corresponding long-term boost to your assets. Aggressively eliminating this 'bad debt' is the fastest way to improve your score.</p>
            <p><strong>Investment Portfolios:</strong> The balances in your 401(k), IRA, brokerage accounts, and other investments are vital counterweights to your debt. As compound interest grows your investments, your total assets increase, driving your debt ratio down. This highlights why saving and investing are just as important as paying off debt.</p>
            <p><strong>Age and Career Stage:</strong> It is entirely normal for young adults and first-time homebuyers to have a high total debt ratio—often exceeding 70% or 80%. They have just taken on a massive mortgage but haven't had time to build equity or retirement savings. As you progress toward retirement, your ratio should systematically decrease. A healthy retiree often has a debt ratio close to zero.</p>

            <h2>Advanced Features</h2>
            <p>While the basic inputs provide a snapshot of your current financial health, a comprehensive assessment requires digging deeper into the advanced categorization of your balance sheet.</p>
            <p>Our calculator allows you to segment your debt into specific tranches: mortgages, auto loans, student loans, and credit cards. This granularity is essential because not all debt is created equal. A 50% debt ratio driven entirely by a low-interest mortgage is fundamentally safer than a 30% debt ratio driven by high-interest, revolving credit card debt.</p>
            <p>Similarly, the calculator allows you to segment your assets into real estate, liquid cash, and market investments. This is critical for assessing liquidity risk. You might have a fantastic total debt ratio on paper, but if 95% of your assets are locked in illiquid real estate and you have zero cash reserves, you are still financially fragile in an emergency.</p>

            <h2>Practical Examples</h2>
            <p>To contextualize how the total debt ratio operates in the real world, consider the following contrasting examples:</p>
            <p><strong>Example A: The High-Income Leverager.</strong> Sarah earns $250,000 a year. She recently purchased an $800,000 home with a $750,000 mortgage. She financed a $60,000 luxury car and owes $30,000 in student loans. Her total debt is $840,000. Her assets include the $800,000 home, $40,000 in a 401(k), and $10,000 in cash (Total Assets = $850,000). Her Total Debt Ratio is a staggering 98.8%. Despite her high income, Sarah is highly leveraged and financially vulnerable to any disruption in income or property values.</p>
            <p><strong>Example B: The Steady Saver.</strong> John earns $75,000 a year. He bought a modest $250,000 home years ago and currently owes $120,000 on the mortgage. He drives a paid-off, older car and carries no credit card debt. His retirement accounts total $180,000, and he has $25,000 in emergency savings. His total debt is $120,000. His total assets are $455,000. His Total Debt Ratio is a very healthy 26.3%. John has a much lower income than Sarah, but his balance sheet is fortress-like.</p>

            <h2>Tips & Best Practices</h2>
            <p>Improving your total debt ratio requires disciplined action on both sides of the balance sheet. Here are proven strategies to optimize your financial leverage:</p>
            <p>First, attack high-interest consumer debt ruthlessly. Credit cards and personal loans destroy wealth. Use the debt avalanche (highest interest first) or debt snowball (smallest balance first) method to eliminate these liabilities entirely. Every dollar of consumer debt paid off is a dollar added directly to your net worth.</p>
            <p>Second, avoid financing depreciating assets. Vehicles lose value the moment you drive them off the lot. Financing a depreciating asset guarantees that your liabilities will temporarily outpace the asset's value, harming your ratio. Aim to buy cars with cash or utilize aggressive repayment schedules if financing is necessary.</p>
            <p>Third, automate your asset building. Set up automatic contributions to your retirement accounts and brokerage portfolios. Consistently buying income-producing assets inflates the denominator of the ratio equation, driving your overall leverage percentage down over time.</p>
            <p>Finally, don't obsess over paying off low-interest, fixed-rate mortgages if you have better investment opportunities. While paying down a 3% mortgage improves your debt ratio, investing that money to earn 7-10% in the stock market increases your total assets faster, ultimately leading to a more robust long-term financial position.</p>

            <h2>Benefits</h2>
            <p>Regularly monitoring your total debt ratio provides immense clarity and peace of mind. It strips away the illusion of wealth created by high incomes and luxury spending, forcing you to confront the reality of your balance sheet.</p>
            <p>By understanding your exact leverage position, you can make more rational decisions about taking on new debt, prioritizing payoffs, and allocating investments. A low, healthy total debt ratio ensures you can weather economic storms, handle unexpected emergencies without panic, and ultimately achieve the financial freedom to retire comfortably on your own terms.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-debt-ratio-calculator" />
          <PopularCalculators exclude="/calculator/total-debt-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
