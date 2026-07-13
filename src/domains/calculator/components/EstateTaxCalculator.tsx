"use client";
import { RotateCcw, Heart, Landmark, Calculator } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import InputField from "@/domains/calculator/components/ui/InputField";
const EstateTaxCalculator = () => {
  const [grossEstate, setGrossEstate] = useState("15000000");
  const [debts, setDebts] = useState("500000");
  const [charitableGifts, setCharitableGifts] = useState("1000000");
  const [taxYear, setTaxYear] = useState("2024");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const gross = parseFloat(grossEstate) || 0;
    const debt = parseFloat(debts) || 0;
    const gifts = parseFloat(charitableGifts) || 0;
    
    const netEstate = Math.max(0, gross - debt - gifts);
    
    // 2024 Federal Exemption: $13,610,000
    // 2023 Federal Exemption: $12,920,000
    const exemption = taxYear === "2024" ? 13610000 : 12920000;
    const taxableEstate = Math.max(0, netEstate - exemption);

    // Progressive Estate Tax Brackets (Simplified to top rate of 40%)
    // The first $1M is taxed at lower rates, but practically anything over exemption hits 40%
    const estateTax = taxableEstate > 0 ? (taxableEstate * 0.40) : 0;

    setResults({
      netEstate,
      exemption,
      taxableEstate,
      estateTax,
      remainingForHeirs: netEstate - estateTax,
      effectiveRate: netEstate > 0 ? (estateTax / netEstate) * 100 : 0
    });
  };

  const reset = () => {
    setGrossEstate("15000000");
    setDebts("500000");
    setCharitableGifts("1000000");
    setTaxYear("2024");
  };

  const faqs = [
    {
      question: "What is the federal estate tax?",
      answer: "The federal estate tax is a tax on your right to transfer property at your death. It consists of an accounting of everything you own or have certain interests in at the date of death."
    },
    {
      question: "What is the estate tax exemption for 2024?",
      answer: "For the 2024 tax year, the federal estate tax exemption is $13.61 million per person. For married couples, the combined exemption is $27.22 million. This means estates valued below these amounts generally owe no federal estate tax."
    },
    {
      question: "What are 'Step-Up in Basis' rules?",
      answer: "When an heir inherits an asset, like stock or real estate, the 'basis' (the value used to calculate capital gains) is 'stepped up' to the fair market value at the date of the original owner's death. This can significantly reduce the capital gains tax the heir pays if they sell the asset later."
    },
    {
      question: "How can I avoid estate taxes?",
      answer: "Common strategies include lifetime gifting (up to $18,000 per person per year in 2024), setting up Irrevocable Life Insurance Trusts (ILITs), donating to charities, and utilizing the unlimited marital deduction for transfers to a spouse."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Estate Tax Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Estate Tax Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Landmark className="h-5 w-5 text-primary" /> Assets & Debts
                  </h2>
                  <InputField id="gross" label="Gross Estate Value" value={grossEstate} onChange={setGrossEstate} prefix="$" tooltip="Total value of all property, cash, investments, and business interests." />
                  <InputField id="debts" label="Debts & Funeral Expenses" value={debts} onChange={setDebts} prefix="$" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tax Year</label>
                    <select value={taxYear} onChange={(e) => setTaxYear(e.target.value)} className="w-full bg-secondary/50 border border-border p-3 rounded-xl outline-none focus:border-primary transition-all font-medium">
                      <option value="2024">2024 ($13.61M Exemption)</option>
                      <option value="2023">2023 ($12.92M Exemption)</option>
                    </select>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Heart className="h-5 w-5 text-primary" /> Deductions
                  </h2>
                  <InputField id="gifts" label="Charitable Bequests" value={charitableGifts} onChange={setCharitableGifts} prefix="$" tooltip="Value of assets left to qualified non-profit organizations." />
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-10">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Net Estate for Taxation</p>
                    <p className="text-3xl font-black text-foreground">${results ? Math.round(results.netEstate).toLocaleString() : '0'}</p>
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-red-500/5 border-red-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Estimated Federal Estate Tax</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.estateTax).toLocaleString()}</p>
                    <p className="text-xs text-red-500 mt-2 font-bold uppercase tracking-widest">40% Top Marginal Rate</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Net Value for Heirs</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.remainingForHeirs).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-2xl font-bold mb-3">
                    <Calculator className="h-5 w-5 text-primary" /> Taxable Breakdown
                  </h2>
                  <div className="mb-8">
                     <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Estate Composition</span>
                        <span>100%</span>
                     </div>
                     <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${(results.exemption / results.netEstate) * 100}%` }}></div>
                        <div className="h-full bg-red-500" style={{ width: `${(results.taxableEstate / results.netEstate) * 100}%` }}></div>
                     </div>
                     <div className="flex gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Tax-Free Exemption</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-red-500"></div> Taxable Portion</div>
                     </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Unified Credit Exemption Amount", value: results.exemption },
                    { label: "Taxable Estate Value", value: results.taxableEstate },
                    { label: "Effective Estate Tax Rate", value: 0, textValue: `${results.effectiveRate.toFixed(1)}%` },
                    { label: "Marital Deduction", value: 0, textValue: "Unlimited (to Spouse)" },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding the Federal Estate Tax</h2>
              <p>Commonly referred to by critics as the "Death Tax," the federal estate tax is a levy on the transfer of wealth from a deceased person to their heirs. While it is one of the most debated taxes in the United States, it currently affects only a tiny fraction of the wealthiest households due to historically high exemption limits.</p>

              <h3>How the Exemption Works</h3>
              <p>The "Unified Credit" exemption is the amount of money you can leave behind tax-free. For 2024, this amount is <strong>$13.61 million per person</strong>. If your total estate is valued below this number, your heirs will owe zero federal estate tax. For married couples, this exemption is effectively doubled to $27.22 million, provided the first-to-die spouse's executor files for "portability" (Form 706).</p>

              <h3>What Counts as Part of Your Estate?</h3>
              <p>The IRS has a broad definition of what constitutes an estate. It includes:</p>
              <ul>
                <li><strong>Real Estate:</strong> Your primary home, vacation homes, and investment properties.</li>
                <li><strong>Cash and Investments:</strong> Bank accounts, stocks, bonds, and mutual funds.</li>
                <li><strong>Business Interests:</strong> The value of any closely held businesses or partnerships.</li>
                <li><strong>Life Insurance:</strong> If you own the policy, the death benefit is included in your taxable estate.</li>
                <li><strong>Personal Property:</strong> Cars, jewelry, art, and even high-value collectibles.</li>
              </ul>

              <h3>Progressive Rates up to 40%</h3>
              <p>Once an estate exceeds the exemption limit, the remaining value is taxed at progressive rates. However, because the lower brackets cover relatively small amounts of money, nearly all taxable estates quickly reach the top marginal rate of <strong>40%</strong>. This is one of the highest tax rates in the federal code, making estate planning critical for high-net-worth individuals.</p>

              <h3>The Marital Deduction</h3>
              <p>One of the most important rules in estate law is the "Unlimited Marital Deduction." This allows you to transfer an unlimited amount of assets to a surviving spouse (who is a U.S. citizen) without triggering any estate tax. The tax is essentially deferred until the second spouse passes away.</p>

              <h3>Common Estate Planning Tools</h3>
              <p>If you anticipate your estate being over the exemption limit, consider these strategies:</p>
              <ol>
                <li><strong>Annual Gifting:</strong> You can give up to $18,000 per person per year (in 2024) to an unlimited number of people without it counting against your lifetime exemption.</li>
                <li><strong>Irrevocable Life Insurance Trust (ILIT):</strong> By moving your life insurance policy into a trust, you can remove the death benefit from your taxable estate.</li>
                <li><strong>Charitable Lead/Remainder Trusts:</strong> These allow you to support a charity while also providing for your heirs and reducing your tax liability.</li>
              </ol>

              <h2 className="text-2xl font-bold mb-3">State-Level Estate Taxes</h2>
              <p>Be aware that even if you don't owe federal estate tax, you might owe state estate tax. Several states (including Oregon, Washington, New York, and Massachusetts) have their own estate or inheritance taxes with much lower exemptions, sometimes starting at just $1 million.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/estate-tax-calculator" />
          <PopularCalculators exclude="/calculator/estate-tax-calculator" />
        </div>
      </div>
    </>
  );
};

export default EstateTaxCalculator;

