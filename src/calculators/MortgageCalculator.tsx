"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";

interface MortgageResults {
  monthlyPI: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  interestSaved: number;
  timeSavedMonths: number;
  loanAmount: number;
  totalTaxInsurance: number;
  monthlyRows: AmortRow[];
  yearlyRows: AmortRow[];
}

const MortgageCalculator = () => {
  // Basic inputs
  const [homePrice, setHomePrice] = useState("400000");
  const [downPaymentAmt, setDownPaymentAmt] = useState("80000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [dpMode, setDpMode] = useState<"amount" | "percent">("percent");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyTax, setPropertyTax] = useState("3600");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [pmi, setPmi] = useState("0");
  const [hoaFee, setHoaFee] = useState("0");
  const [otherCosts, setOtherCosts] = useState("0");
  const [extraMonthly, setExtraMonthly] = useState("0");
  const [oneTimeExtra, setOneTimeExtra] = useState("0");
  const [annualExtra, setAnnualExtra] = useState("0");
  const [paymentFreq, setPaymentFreq] = useState<"monthly" | "biweekly">("monthly");

  const [results, setResults] = useState<MortgageResults | null>(null);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const printRef = useRef<HTMLDivElement>(null);

  const getLoanAmount = () => {
    const hp = parseFloat(homePrice) || 0;
    if (dpMode === "percent") return hp * (1 - (parseFloat(downPaymentPct) || 0) / 100);
    return hp - (parseFloat(downPaymentAmt) || 0);
  };

  const handleDpChange = (val: string) => {
    const hp = parseFloat(homePrice) || 0;
    if (dpMode === "percent") {
      setDownPaymentPct(val);
      setDownPaymentAmt(hp > 0 ? String(Math.round(hp * (parseFloat(val) || 0) / 100)) : "0");
    } else {
      setDownPaymentAmt(val);
      setDownPaymentPct(hp > 0 ? String(((parseFloat(val) || 0) / hp * 100).toFixed(1)) : "0");
    }
  };

  const calculate = () => {
    const P = getLoanAmount();
    const annualRate = parseFloat(interestRate) || 0;
    const years = parseFloat(loanTerm) || 0;
    const extraM = parseFloat(extraMonthly) || 0;
    const oneTime = parseFloat(oneTimeExtra) || 0;
    const annualE = parseFloat(annualExtra) || 0;
    const taxMonthly = (parseFloat(propertyTax) || 0) / 12;
    const insMonthly = (parseFloat(homeInsurance) || 0) / 12;
    const pmiMonthly = parseFloat(pmi) || 0;
    const hoaMonthly = parseFloat(hoaFee) || 0;
    const otherMonthly = parseFloat(otherCosts) || 0;

    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (P <= 0 || r <= 0 || n <= 0) return;

    const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalWithoutExtra = M * n;
    const totalInterestBase = totalWithoutExtra - P;
    const escrow = taxMonthly + insMonthly + pmiMonthly + hoaMonthly + otherMonthly;

    // Build amortization with extra payments
    let balance = P;
    const monthlyRows: AmortRow[] = [];
    let totalPaid = 0;
    let month = 0;
    const hasExtra = extraM > 0 || oneTime > 0 || annualE > 0;

    while (balance > 0.01 && month < n * 2) {
      month++;
      const intPayment = balance * r;
      let prinPayment = M - intPayment;
      let extra = extraM;
      if (month === 1) extra += oneTime;
      if (month % 12 === 0) extra += annualE;
      prinPayment += extra;
      if (prinPayment > balance) {
        prinPayment = balance;
      }
      const totalPayment = intPayment + prinPayment;
      balance -= prinPayment;
      totalPaid += totalPayment;
      monthlyRows.push({
        period: month,
        payment: totalPayment,
        principal: prinPayment - extra > 0 ? prinPayment - extra : prinPayment,
        interest: intPayment,
        extraPayment: extra,
        balance: Math.max(0, balance),
      });
    }

    // Yearly aggregation
    const yearlyRows: AmortRow[] = [];
    for (let y = 0; y < Math.ceil(monthlyRows.length / 12); y++) {
      const yearSlice = monthlyRows.slice(y * 12, (y + 1) * 12);
      if (yearSlice.length === 0) break;
      yearlyRows.push({
        period: y + 1,
        payment: yearSlice.reduce((s, r) => s + r.payment, 0),
        principal: yearSlice.reduce((s, r) => s + r.principal, 0),
        interest: yearSlice.reduce((s, r) => s + r.interest, 0),
        balance: yearSlice[yearSlice.length - 1].balance,
      });
    }

    // Payoff date
    const sd = startDate.split("-");
    const startMonth = parseInt(sd[1]) || 1;
    const startYear = parseInt(sd[0]) || new Date().getFullYear();
    const payoffMonth = ((startMonth - 1 + month) % 12) + 1;
    const payoffYear = startYear + Math.floor((startMonth - 1 + month) / 12);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    setResults({
      monthlyPI: M,
      totalMonthly: M + escrow,
      totalInterest: totalPaid - P,
      totalCost: totalPaid + escrow * month,
      payoffDate: `${monthNames[payoffMonth - 1]} ${payoffYear}`,
      interestSaved: hasExtra ? totalInterestBase - (totalPaid - P) : 0,
      timeSavedMonths: hasExtra ? n - month : 0,
      loanAmount: P,
      totalTaxInsurance: escrow * month,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setHomePrice("400000"); setDownPaymentAmt("80000"); setDownPaymentPct("20");
    setInterestRate("6.5"); setLoanTerm("30"); setPropertyTax("3600");
    setHomeInsurance("1200"); setPmi("0"); setHoaFee("0"); setOtherCosts("0");
    setExtraMonthly("0"); setOneTimeExtra("0"); setAnnualExtra("0");
    setResults(null);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Mortgage Amortization – RaciraCalculator</title>
      <style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}th{background:#f5f5f5;text-align:left}
      h2{margin-bottom:1rem}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a mortgage calculator?", answer: "A mortgage calculator estimates your monthly home loan payments including principal, interest, taxes, and insurance. It helps you understand the true cost of homeownership and compare different scenarios before committing to a mortgage." },
    { question: "How is the monthly mortgage payment calculated?", answer: "The monthly payment uses the standard amortization formula: M = P[r(1+r)^n] / [(1+r)^n – 1], where P is the principal, r is the monthly interest rate, and n is the total number of payments. Taxes, insurance, and PMI are added separately." },
    { question: "What is PMI and when is it required?", answer: "Private Mortgage Insurance (PMI) is typically required when your down payment is less than 20% of the home price. PMI protects the lender if you default. It usually costs 0.5% to 1% of the loan amount annually and can be removed once you reach 20% equity." },
    { question: "How do extra payments save money?", answer: "Extra payments go directly toward reducing your principal balance. This reduces the interest charged in every subsequent month, shortening your loan term and saving thousands in total interest paid over the life of the loan." },
    { question: "What is an amortization schedule?", answer: "An amortization schedule is a table showing each payment broken down into principal and interest portions over the life of the loan. In early payments, most goes to interest. Over time, more goes to principal. Our calculator generates a complete monthly and yearly schedule." },
    { question: "Should I choose a 15-year or 30-year mortgage?", answer: "A 15-year mortgage has higher monthly payments but saves significant interest over the loan term. A 30-year mortgage has lower monthly payments, providing more flexibility. Use our calculator to compare both scenarios side-by-side." },
    { question: "Does this include property taxes and insurance?", answer: "Yes. Our advanced calculator includes fields for property tax, homeowners insurance, PMI, HOA fees, and other monthly costs. These are added to your principal and interest to show the true total monthly payment." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Mortgage Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Advanced Mortgage Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate your complete monthly mortgage payment including taxes, insurance, PMI, and see how extra payments save you money.</p>

            {/* Calculator Inputs */}
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="home-price" label="Home Price" value={homePrice} onChange={(v) => { setHomePrice(v); if (dpMode === "percent") handleDpChange(downPaymentPct); }} prefix="$" tooltip="The total purchase price of the home." />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-foreground">Down Payment</label>
                    <div className="flex rounded-md border border-input overflow-hidden text-xs">
                      <button type="button" onClick={() => setDpMode("percent")} className={`px-2 py-0.5 ${dpMode === "percent" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>%</button>
                      <button type="button" onClick={() => setDpMode("amount")} className={`px-2 py-0.5 ${dpMode === "amount" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>$</button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={dpMode === "percent" ? downPaymentPct : downPaymentAmt}
                    onChange={(e) => handleDpChange(e.target.value)}
                    className="input-calc"
                    aria-label="Down payment"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Loan Amount: ${getLoanAmount().toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <InputField id="interest-rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" tooltip="Annual interest rate (APR) from your lender." />
                <InputField id="loan-term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} tooltip="Length of the mortgage, typically 15 or 30 years." />
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                  <input id="start-date" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-calc" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Payment Frequency</label>
                  <div className="flex rounded-lg border border-input overflow-hidden">
                    <button type="button" onClick={() => setPaymentFreq("monthly")} className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentFreq === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Monthly</button>
                    <button type="button" onClick={() => setPaymentFreq("biweekly")} className={`flex-1 py-3 text-sm font-medium transition-colors ${paymentFreq === "biweekly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Bi-Weekly</button>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-accent hover:underline mb-4"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
                  <InputField id="property-tax" label="Property Tax (Annual)" value={propertyTax} onChange={setPropertyTax} prefix="$" tooltip="Annual property taxes. Typically 0.5%–2.5% of home value." />
                  <InputField id="home-insurance" label="Home Insurance (Annual)" value={homeInsurance} onChange={setHomeInsurance} prefix="$" tooltip="Annual homeowners insurance premium." />
                  <InputField id="pmi" label="PMI (Monthly)" value={pmi} onChange={setPmi} prefix="$" tooltip="Private Mortgage Insurance. Required if down payment is under 20%." />
                  <InputField id="hoa" label="HOA Fee (Monthly)" value={hoaFee} onChange={setHoaFee} prefix="$" tooltip="Monthly homeowner association fees." />
                  <InputField id="other-costs" label="Other Monthly Costs" value={otherCosts} onChange={setOtherCosts} prefix="$" tooltip="Any additional monthly expenses related to the property." />
                  <InputField id="extra-monthly" label="Extra Monthly Payment" value={extraMonthly} onChange={setExtraMonthly} prefix="$" tooltip="Additional amount paid toward principal each month." />
                  <InputField id="one-time-extra" label="One-Time Extra Payment" value={oneTimeExtra} onChange={setOneTimeExtra} prefix="$" tooltip="A lump-sum payment applied at the start of the loan." />
                  <InputField id="annual-extra" label="Annual Extra Payment" value={annualExtra} onChange={setAnnualExtra} prefix="$" tooltip="Additional principal paid once per year (e.g., from a bonus)." />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="card-calculator mb-8" ref={printRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Your Results</h2>
                  <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-accent hover:underline">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>

                <ResultDisplay items={[
                  { label: "Monthly P&I", value: results.monthlyPI, highlight: true },
                  { label: "Total Monthly Payment", value: results.totalMonthly, highlight: true },
                  { label: "Loan Amount", value: results.loanAmount },
                  { label: "Total Interest", value: results.totalInterest },
                  { label: "Total Loan Cost", value: results.totalCost },
                  { label: "Payoff Date", value: 0, textValue: results.payoffDate },
                ]} />

                {results.interestSaved > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h3 className="font-semibold text-foreground mb-2">Extra Payment Savings</h3>
                    <ResultDisplay items={[
                      { label: "Interest Saved", value: Math.max(0, results.interestSaved), highlight: true },
                      { label: "Time Saved", value: 0, textValue: `${Math.floor(results.timeSavedMonths / 12)}y ${results.timeSavedMonths % 12}m`, highlight: true },
                    ]} />
                  </div>
                )}

                {/* Pie Chart */}
                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Principal", value: results.loanAmount, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest", value: results.totalInterest, color: "hsl(220, 60%, 20%)" },
                      { label: "Taxes & Insurance", value: results.totalTaxInsurance, color: "hsl(210, 30%, 75%)" },
                    ]}
                    size={180}
                  />
                </div>

                {/* Amortization */}
                <div className="mt-6">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setViewMode("yearly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "yearly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Yearly</button>
                    <button onClick={() => setViewMode("monthly")} className={`px-3 py-1 rounded-md text-sm ${viewMode === "monthly" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Monthly</button>
                  </div>
                  <AmortizationTable
                    rows={viewMode === "yearly" ? results.yearlyRows : results.monthlyRows}
                    yearly={viewMode === "yearly"}
                  />
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            {/* SEO Content */}
            <article className="prose-finance">
              <h2>What Is a Mortgage Calculator?</h2>
              <p>A mortgage calculator is an essential financial planning tool that helps you estimate your monthly home loan payments. Our advanced calculator goes beyond basic principal and interest by including property taxes, homeowners insurance, PMI, HOA fees, and additional costs to give you a complete picture of your monthly housing expense.</p>
              <p>Whether you're a first-time homebuyer exploring affordability or a homeowner considering refinancing, our mortgage calculator provides the clarity you need to make informed decisions. The built-in amortization schedule shows exactly how each payment is split between principal and interest over the life of the loan.</p>

              <h2>How Mortgage Interest Works</h2>
              <p>When you take out a mortgage, your lender charges interest on the outstanding principal balance. In the early years of a standard amortization schedule, a large portion of each monthly payment goes toward interest rather than paying down the principal. As you gradually reduce the principal, the interest portion decreases and more of your payment chips away at the balance.</p>
              <p>For example, on a $320,000 mortgage at 6.5% interest over 30 years, your monthly payment would be approximately $2,023. In the first month alone, about $1,733 goes toward interest and only $290 toward principal. This ratio shifts dramatically over time, illustrating why early extra payments are so powerful.</p>

              <h2>Understanding Your Total Monthly Payment</h2>
              <p>Your total monthly housing payment consists of several components, often referred to as PITI: Principal, Interest, Taxes, and Insurance. Our calculator breaks down each component so you can see exactly where your money goes.</p>
              <ul>
                <li><strong>Principal & Interest:</strong> The core mortgage payment calculated using the amortization formula.</li>
                <li><strong>Property Tax:</strong> Annual property taxes divided by 12, typically 0.5%–2.5% of home value depending on your location.</li>
                <li><strong>Homeowners Insurance:</strong> Annual insurance premium divided by 12, protecting your property against damage and liability.</li>
                <li><strong>PMI:</strong> Private Mortgage Insurance, required when your down payment is less than 20% of the purchase price.</li>
                <li><strong>HOA Fees:</strong> Monthly homeowner association dues, common in condominiums and planned communities.</li>
              </ul>

              <h2>How Extra Payments Reduce Your Loan Term</h2>
              <p>Making additional payments — even modest ones — can dramatically reduce both total interest and loan duration. Extra payments go directly toward reducing the principal balance, which means less interest accrues in every subsequent month.</p>
              <p>Our calculator supports three types of extra payments: monthly additions, a one-time lump sum, and annual contributions. This flexibility lets you model real-world scenarios like applying a year-end bonus or consistently rounding up your payment.</p>

              <h3>Example Scenario</h3>
              <p>Consider a $350,000 home with 20% down ($70,000), leaving a $280,000 loan at 7% for 30 years. The base monthly P&I would be about $1,863. Adding just $200 per month extra reduces total interest by approximately $78,000 and pays off the mortgage 6 years early. Add property taxes ($4,200/year) and insurance ($1,500/year), and your total monthly payment would be about $2,338 before extra payments.</p>

              <h2>Benefits of Using an Amortization Schedule</h2>
              <p>An amortization schedule is your roadmap to debt freedom. It shows the exact breakdown of each payment into principal and interest, letting you see your equity building over time. Our calculator generates both monthly and yearly views, and you can print the schedule for your records or to share with a financial advisor.</p>
              <ul>
                <li><strong>Track equity growth:</strong> See how much of your home you truly own at any point in the loan.</li>
                <li><strong>Plan extra payments:</strong> Identify optimal times to make additional payments for maximum impact.</li>
                <li><strong>Compare scenarios:</strong> Run calculations with different terms, rates, or extra payments to find your best strategy.</li>
                <li><strong>Tax planning:</strong> Understand your annual interest paid for potential mortgage interest deductions.</li>
              </ul>

              <h2>Tips for Managing Your Mortgage</h2>
              <p>Before committing to extra payments, ensure you have an adequate emergency fund (3–6 months of expenses) and no higher-interest debt such as credit cards. Consider whether your mortgage has prepayment penalties — most modern mortgages do not, but it's worth confirming with your lender.</p>
              <p>Always compare multiple lenders when shopping for a mortgage. Even a 0.25% difference in interest rate can translate to tens of thousands of dollars over the life of a 30-year loan. Use our calculator to compare different rate scenarios side by side.</p>
              <p>If your interest rate is very low (under 4%), you may get a better return investing extra cash in diversified index funds rather than paying down the mortgage early. This decision depends on your risk tolerance, tax situation, and financial goals.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage" />
            <PopularCalculators exclude="/calculator/mortgage-calculator" />
          </div>

          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default MortgageCalculator;

