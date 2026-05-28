"use client";
import { RotateCcw, Shield, Gauge, Info, CheckCircle2, AlertCircle } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
const CreditScoreEstimator = () => {
  const [paymentHistory, setPaymentHistory] = useState("never");
  const [utilization, setUtilization] = useState("10");
  const [creditAge, setCreditAge] = useState("5");
  const [inquiries, setInquiries] = useState("0");
  const [creditMix, setCreditMix] = useState("both");
  const [derogatory, setDerogatory] = useState("none");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let score = 300; // Base score

    // Payment History (35%) - Max ~190 points
    if (paymentHistory === "never") score += 190;
    else if (paymentHistory === "once") score += 120;
    else if (paymentHistory === "frequent") score += 40;

    // Amounts Owed (30%) - Max ~165 points
    const util = parseFloat(utilization) || 0;
    if (util < 10) score += 165;
    else if (util < 30) score += 130;
    else if (util < 50) score += 80;
    else if (util < 75) score += 30;

    // Length of History (15%) - Max ~80 points
    const age = parseFloat(creditAge) || 0;
    if (age > 10) score += 80;
    else if (age > 5) score += 50;
    else if (age > 2) score += 30;
    else score += 10;

    // Credit Mix (10%) - Max ~55 points
    if (creditMix === "both") score += 55;
    else if (creditMix === "one") score += 30;

    // New Credit (10%) - Max ~55 points
    const inq = parseInt(inquiries) || 0;
    if (inq === 0) score += 55;
    else if (inq < 3) score += 35;
    else if (inq < 6) score += 15;

    // Derogatory Marks (Heavy Penalty)
    if (derogatory === "bankruptcy") score -= 150;
    else if (derogatory === "collection") score -= 80;

    // Ensure within 300-850 range
    score = Math.min(850, Math.max(300, score));

    setResults({
      score,
      rating: getRating(score),
      color: getColor(score)
    });
  };

  const getRating = (s: number) => {
    if (s >= 800) return "Exceptional";
    if (s >= 740) return "Very Good";
    if (s >= 670) return "Good";
    if (s >= 580) return "Fair";
    return "Poor";
  };

  const getColor = (s: number) => {
    if (s >= 800) return "text-emerald-600";
    if (s >= 740) return "text-emerald-500";
    if (s >= 670) return "text-amber-500";
    if (s >= 580) return "text-orange-500";
    return "text-red-500";
  };

  const reset = () => {
    setPaymentHistory("never");
    setUtilization("10");
    setCreditAge("5");
    setInquiries("0");
    setCreditMix("both");
    setDerogatory("none");
  };

  const faqs = [
    {
      question: "How accurate is this credit score estimator?",
      answer: "This tool provides an estimate based on the standard FICO scoring model weights. However, your actual credit score is calculated using proprietary algorithms from bureaus like Experian, Equifax, and TransUnion using your full official credit report. This estimator should be used for educational purposes only."
    },
    {
      question: "What are the most important factors in a credit score?",
      answer: "The two most critical factors are your payment history (35%) and your credit utilization ratio (30%). Making payments on time and keeping your credit card balances low relative to your limits will have the biggest positive impact on your score."
    },
    {
      question: "How long does a bankruptcy stay on my credit report?",
      answer: "A Chapter 7 bankruptcy stays on your report for 10 years, while a Chapter 13 bankruptcy stays for 7 years. However, its impact on your score diminishes over time as you rebuild your credit history."
    },
    {
      question: "How many inquiries are too many?",
      answer: "Generally, more than 5 hard inquiries in a 12-month period can signal to lenders that you are a higher risk. However, multiple inquiries for a single purpose (like shopping for a mortgage or auto loan) within a 14-45 day window are usually treated as a single inquiry."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Credit Score Estimator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Credit Score Estimator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your credit score range based on the key factors used by FICO and VantageScore models.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" /> Core Factors
                  </h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Payment History</label>
                    <select value={paymentHistory} onChange={(e) => setPaymentHistory(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="never">Never missed a payment</option>
                      <option value="once">Missed 1-2 payments (long ago)</option>
                      <option value="frequent">Recent or frequent missed payments</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Credit Utilization ({utilization}%)</label>
                    <input type="range" min="0" max="100" value={utilization} onChange={(e) => setUtilization(e.target.value)} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                       <span>0%</span>
                       <span>50%</span>
                       <span>100%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Oldest Account Age (Years)</label>
                    <input type="number" value={creditAge} onChange={(e) => setCreditAge(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-primary" /> Additional Data
                  </h2>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Hard Inquiries</label>
                    <input type="number" value={inquiries} onChange={(e) => setInquiries(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Credit Mix</label>
                    <select value={creditMix} onChange={(e) => setCreditMix(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="both">Both Revolving (Cards) & Installment (Loans)</option>
                      <option value="one">Only one type of credit</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Derogatory Marks</label>
                    <select value={derogatory} onChange={(e) => setDerogatory(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="none">None</option>
                      <option value="collection">Collection / Tax Lien</option>
                      <option value="bankruptcy">Bankruptcy (Recent)</option>
                    </select>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Score</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center py-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Gauge className="h-48 w-48" />
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated Credit Score</p>
                  <p className={`text-8xl font-black mb-2 ${results.color}`}>{results.score}</p>
                  <p className={`text-2xl font-bold uppercase ${results.color}`}>{results.rating}</p>
                  
                  <div className="mt-8 max-w-md mx-auto h-3 bg-secondary rounded-full overflow-hidden flex border border-border">
                    <div className="h-full bg-red-500" style={{ width: "20%" }}></div>
                    <div className="h-full bg-orange-500" style={{ width: "20%" }}></div>
                    <div className="h-full bg-amber-500" style={{ width: "20%" }}></div>
                    <div className="h-full bg-emerald-400" style={{ width: "20%" }}></div>
                    <div className="h-full bg-emerald-600" style={{ width: "20%" }}></div>
                  </div>
                  <div className="mt-2 max-w-md mx-auto flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>300</span>
                    <span>580</span>
                    <span>670</span>
                    <span>740</span>
                    <span>800</span>
                    <span>850</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mt-8">
                   <div className="card-calculator flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Top Strength</p>
                        <p className="text-sm font-medium">{paymentHistory === 'never' ? 'Perfect Payment History' : 'Good Account Age'}</p>
                      </div>
                   </div>
                   <div className="card-calculator flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Area to Improve</p>
                        <p className="text-sm font-medium">{parseFloat(utilization) > 30 ? 'Lower Credit Usage' : 'Keep Accounts Open'}</p>
                      </div>
                   </div>
                   <div className="card-calculator flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Next Milestone</p>
                        <p className="text-sm font-medium">Reach {results.score + 20} for better rates</p>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>How Credit Scores Are Calculated</h2>
              <p>Your credit score is a three-digit number that tells lenders how likely you are to repay your debts. In the United States, the most common model is the FICO score, which ranges from 300 to 850. Understanding the five main components of this score is the first step toward financial health.</p>

              <h3>1. Payment History (35%)</h3>
              <p>This is the single most important factor. Lenders want to see that you pay your bills on time, every time. Even one late payment (30 days past due) can cause a significant drop in your score. Bankruptcies, foreclosures, and collections also fall into this category and can devastate your rating for years.</p>

              <h3>2. Amounts Owed / Utilization (30%)</h3>
              <p>Credit utilization is the ratio of your outstanding credit card balances to your total credit limits. For example, if you have a $1,000 limit and a $500 balance, your utilization is 50%. Experts recommend keeping your utilization below 30%, and those with the highest scores often keep it below 10%.</p>

              <h3>3. Length of Credit History (15%)</h3>
              <p>A longer credit history generally results in a higher score. This is why it's often a bad idea to close old credit card accounts, even if you don't use them anymore. Lenders look at the average age of all your accounts and the age of your oldest account.</p>

              <h3>4. Credit Mix (10%)</h3>
              <p>Lenders like to see that you can handle different types of credit responsibly. Having both 'revolving' credit (credit cards) and 'installment' credit (car loans, student loans, or mortgages) can boost your score more than having just one type.</p>

              <h3>5. New Credit (10%)</h3>
              <p>Every time you apply for credit, a 'hard inquiry' is placed on your report, which can lower your score by a few points. Opening several new accounts in a short period can make you look desperate for cash and increase your risk profile.</p>

              <h2>Why a High Credit Score Matters</h2>
              <p>Your credit score doesn't just determine if you get a loan; it determines how much that loan will cost you. A borrower with an 'Exceptional' score might get an interest rate that is 2% or 3% lower than someone with a 'Fair' score. Over the life of a 30-year mortgage, this difference can save you hundreds of thousands of dollars.</p>

              <h3>Tips for a Perfect Score</h3>
              <ul>
                <li><strong>Set up Autopay:</strong> Ensure you never miss a deadline by automating at least the minimum payment.</li>
                <li><strong>Request Limit Increases:</strong> If you can't pay down your balance, increasing your limit will instantly lower your utilization ratio (as long as you don't spend more).</li>
                <li><strong>Check Your Report Regularly:</strong> Errors on credit reports are common. Use services like AnnualCreditReport.com to ensure everything is accurate.</li>
                <li><strong>Keep Old Cards Open:</strong> Even if you don't use them, they contribute to your average account age.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/credit-score-estimator" />
          <PopularCalculators exclude="/calculator/credit-score-estimator" />
        </div>
      </div>
    </>
  );
};

export default CreditScoreEstimator;

