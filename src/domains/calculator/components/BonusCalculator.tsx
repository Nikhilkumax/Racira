"use client";

import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import PieChart from "@/domains/calculator/components/ui/PieChart";
import { RotateCcw, Award, ShieldCheck, Landmark, Calculator } from "lucide-react";

const BonusCalculator = () => {
  const [bonusAmount, setBonusAmount] = useState("10000");
  const [federalTax, setFederalTax] = useState("22");
  const [stateTax, setStateTax] = useState("5");
  const [ficaTax, setFicaTax] = useState("7.65");
  const [retirementContribution, setRetirementContribution] = useState("5");

  const [results, setResults] = useState<{
    netBonus: number;
    federalAmt: number;
    stateAmt: number;
    ficaAmt: number;
    retirementAmt: number;
    totalDeductions: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const gross = parseFloat(bonusAmount) || 0;
    const fedRate = (parseFloat(federalTax) || 0) / 100;
    const stateRate = (parseFloat(stateTax) || 0) / 100;
    const ficaRate = (parseFloat(ficaTax) || 0) / 100;
    const retRate = (parseFloat(retirementContribution) || 0) / 100;

    const retirementAmt = gross * retRate;
    const taxableAmt = gross - retirementAmt; // Assuming 401k is pre-tax

    const federalAmt = taxableAmt * fedRate;
    const stateAmt = taxableAmt * stateRate;
    const ficaAmt = gross * ficaRate; // FICA is on gross usually

    const totalDeductions = federalAmt + stateAmt + ficaAmt + retirementAmt;
    const netBonus = gross - totalDeductions;

    setResults({
      netBonus,
      federalAmt,
      stateAmt,
      ficaAmt,
      retirementAmt,
      totalDeductions
    });
  };

  const reset = () => {
    setShowResults(false);
    setBonusAmount("10000"); setFederalTax("22"); setStateTax("5");
    setFicaTax("7.65"); setRetirementContribution("5");
    setResults(null);
  };

  const faqs = [
    { question: "How is a bonus taxed?", answer: "In the US, bonuses are considered 'supplemental wages' and are subject to federal income tax, state income tax, Social Security tax, and Medicare tax. Lenders typically use the 'percentage method' (a flat 22% for federal tax) or the 'aggregate method' (combining bonus with your regular paycheck)." },
    { question: "What is the 22% flat rate for bonuses?", answer: "The IRS allows employers to withhold federal income tax at a flat rate of 22% for supplemental wages up to $1 million. This is often simpler than calculating based on your regular tax bracket, though you may still owe more or be due a refund when you file your return." },
    { question: "Is my bonus subject to FICA taxes?", answer: "Yes. Bonuses are subject to Social Security (6.2%) and Medicare (1.45%) taxes, totaling 7.65%, unless you have already exceeded the annual Social Security wage base limit." },
    { question: "Can I put my bonus into my 401(k)?", answer: "Most employers allow you to contribute a percentage of your bonus to your 401(k). This is a pre-tax contribution, which reduces the amount of federal and state income tax withheld, helping you keep more of your money working for your retirement." },
    { question: "What is the 'Aggregate Method' of bonus withholding?", answer: "Under the aggregate method, your employer combines your bonus with your regular pay and calculates withholding as if you were earning that higher amount every pay period. This often results in a much higher withholding rate because it temporarily pushes you into a higher tax bracket." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bonus Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bonus Pay Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" /> Bonus Amount
                        </h3>
                        <InputField id="gross" label="Gross Bonus Amount" value={bonusAmount} onChange={setBonusAmount} prefix="$" tooltip="The total amount of your bonus before any taxes or deductions." />
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Tax Withholding
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-5">
                            <InputField id="fed" label="Federal Tax (%)" value={federalTax} onChange={setFederalTax} suffix="%" tooltip="Standard flat rate is 22% for bonuses under $1M." />
                            <InputField id="state" label="State Tax (%)" value={stateTax} onChange={setStateTax} suffix="%" tooltip="Your state's supplemental wage withholding rate." />
                            <InputField id="fica" label="FICA/Social Security" value={ficaTax} onChange={setFicaTax} suffix="%" tooltip="Social Security (6.2%) + Medicare (1.45%) = 7.65%." />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" /> Pre-Tax Deductions
                        </h3>
                        <InputField id="ret" label="401(k) Contribution (%)" value={retirementContribution} onChange={setRetirementContribution} suffix="%" tooltip="Percentage of bonus to contribute to your 401(k)." />
                    </section>

                    <div className="flex gap-3 pt-4">
                        <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="p-4 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
                    </div>
                </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Net Bonus Breakdown</h2>
                
                <div className="bg-primary/5 rounded-3xl p-10 text-center border border-primary/10 mb-8">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Your Take-Home Bonus</p>
                    <p className="text-6xl font-black text-foreground">
                        ${results.netBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4 italic">Estimated amount you'll see on your paycheck.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <ResultDisplay items={[
                        { label: "Federal Withholding", value: results.federalAmt },
                        { label: "State Withholding", value: results.stateAmt },
                        { label: "FICA (SS & Medicare)", value: results.ficaAmt },
                        { label: "401(k) Contribution", value: results.retirementAmt },
                        { label: "Total Deductions", value: results.totalDeductions, highlight: true },
                    ]} />
                    <div className="flex justify-center">
                        <PieChart segments={[
                            { label: "Take-Home", value: results.netBonus, color: "hsl(var(--primary))" },
                            { label: "Taxes", value: results.federalAmt + results.stateAmt + results.ficaAmt, color: "hsl(var(--accent))" },
                            { label: "Retirement", value: results.retirementAmt, color: "hsl(var(--secondary))" },
                        ]} size={180} />
                    </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Bonus Taxes: Why Your Net is Lower Than Expected</h2>
              <p>Receiving a bonus is always exciting, but the excitement often turns to confusion when you see the final amount on your paycheck. It's a common observation: "My bonus was taxed at 40%!" In reality, while bonuses might be *withheld* at a higher rate, they are eventually taxed as regular income when you file your annual return. This guide explains how the withholding math works and how you can plan for it.</p>
              
              <h2 className="text-2xl font-bold mb-3">Supplemental Wages: The IRS Definition</h2>
              <p>The IRS classifies bonuses as "supplemental wages"—compensation paid in addition to your regular salary. Because supplemental wages are often irregular, the IRS provides employers with specific methods for calculating withholding to ensure enough tax is collected throughout the year.</p>
              
              <h2 className="text-2xl font-bold mb-3">The Two Methods of Bonus Withholding</h2>
              <p>Your employer will typically choose one of two methods to calculate your bonus taxes:</p>
              <ol>
                <li><strong>The Percentage Method:</strong> If your employer pays your bonus separately from your regular salary, they can simply withhold a flat 22% for federal income tax (for bonuses under $1 million). This is the most common and predictable method.</li>
                <li><strong>The Aggregate Method:</strong> If your bonus is included in your regular paycheck, the employer combines the two and calculates withholding based on the total. Because the IRS tables assume you earn that combined amount every period, it can push you into a much higher withholding bracket, making it look like your bonus was taxed at 30% or more.</li>
              </ol>

              <h2 className="text-2xl font-bold mb-3">Payroll Taxes (FICA)</h2>
              <p>Unlike federal income tax, which is based on your total annual earnings, FICA taxes (Social Security and Medicare) are flat rates applied to every dollar you earn. You will pay 6.2% for Social Security and 1.45% for Medicare on your bonus, regardless of which withholding method your employer uses. Note that Social Security tax stops once you reach the annual wage base limit ($168,600 for 2024).</p>

              <h2 className="text-2xl font-bold mb-3">Strategies to Keep More of Your Bonus</h2>
              <p>While you can't avoid taxes entirely, you can influence how much cash you take home in the short term:</p>
              <ul>
                <li><strong>Increase 401(k) Contributions:</strong> Contributing to a traditional 401(k) or 403(b) is done on a pre-tax basis. By increasing your contribution percentage for your bonus, you reduce the taxable portion of the bonus, lowering the amount withheld for federal and state income tax.</li>
                <li><strong>Adjust Your W-4:</strong> If you know a large bonus is coming, you could temporarily adjust your W-4 allowances (now "Step 3" or "Step 4" on the new form) to reduce withholding, though this carries the risk of underpayment penalties if not managed carefully.</li>
                <li><strong>Timing:</strong> If you have the choice, receiving a bonus in a year where you expect to have lower overall income (or higher deductions) can help you keep more of the money after you file your tax return.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-3">Withholding vs. Actual Tax Liability</h2>
              <p>It is crucial to understand that **withholding is not the same as the final tax.** If your employer withholds 22% but your actual marginal tax rate is only 12%, you will get that extra 10% back as a tax refund when you file your return the following year. Conversely, if you are in the 37% tax bracket, you will owe the difference when you file. Using a bonus calculator helps you avoid surprises during tax season.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bonus-calculator" />
          <PopularCalculators exclude="/calculator/bonus-calculator" />
        </div>
      </div>
    </>
  );
};

export default BonusCalculator;

