"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type GSTMode = "exclusive" | "inclusive";

const GSTCalculator = () => {
  const [mode, setMode] = useState<GSTMode>("exclusive");
  const [amount, setAmount] = useState("10000");
  const [gstRate, setGstRate] = useState("18");
  const [showSplit, setShowSplit] = useState(false);
  const [isIGST, setIsIGST] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{
    gstAmount: number;
    netAmount: number;
    totalAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const amt = parseFloat(amount) || 0;
    const rate = (parseFloat(gstRate) || 0) / 100;
    if (amt <= 0) return;

    let gstAmount: number, netAmount: number, totalAmount: number;

    if (mode === "exclusive") {
      gstAmount = amt * rate;
      netAmount = amt;
      totalAmount = amt + gstAmount;
    } else {
      totalAmount = amt;
      netAmount = amt / (1 + rate);
      gstAmount = totalAmount - netAmount;
    }

    setResult({
      gstAmount,
      netAmount,
      totalAmount,
      cgst: isIGST ? 0 : gstAmount / 2,
      sgst: isIGST ? 0 : gstAmount / 2,
      igst: isIGST ? gstAmount : 0,
    });
  };

  const reset = () => {
    setShowResults(false); setAmount("10000"); setGstRate("18"); setResult(null); };

  const faqs = [
    { question: "What is GST?", answer: "Goods and Services Tax (GST) is a comprehensive indirect tax levied on the manufacture, sale, and consumption of goods and services. India implemented GST in July 2017, replacing multiple cascading taxes with a unified system." },
    { question: "What are CGST, SGST, and IGST?", answer: "For intra-state transactions, GST is split equally between CGST (Central GST) and SGST (State GST). For inter-state transactions, IGST (Integrated GST) applies at the full rate. The total tax amount is the same regardless." },
    { question: "How do I add GST to a price?", answer: "Use the 'GST Exclusive' mode: enter the base price and GST rate. The calculator adds the GST amount to give you the total price including tax." },
    { question: "How do I remove GST from a price?", answer: "Use the 'GST Inclusive' mode: enter the total price and GST rate. The calculator extracts the GST amount to show you the net (pre-tax) price." },
    { question: "What are the GST rate slabs in India?", answer: "India has four main GST slabs: 5%, 12%, 18%, and 28%. Essential goods like food grains are exempt (0%). Most services and manufactured goods fall under 18%. Luxury items and sin goods are taxed at 28%, sometimes with additional cess." },
    { question: "Is GST similar to VAT?", answer: "Yes, GST is a type of Value Added Tax (VAT). Like VAT used in EU countries, GST is collected at each stage of the supply chain with input tax credits, preventing cascading taxation." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "GST Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">GST Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate GST (Goods and Services Tax) with CGST/SGST split or IGST for inter-state transactions.</p>

            <div className="card-calculator mb-8">
              <div className="flex rounded-lg border border-input overflow-hidden mb-6">
                <button onClick={() => { setMode("exclusive"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "exclusive" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Add GST (Exclusive)</button>
                <button onClick={() => { setMode("inclusive"); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "inclusive" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Remove GST (Inclusive)</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="amount" label={mode === "exclusive" ? "Amount (Before GST)" : "Amount (Including GST)"} value={amount} onChange={setAmount} prefix="₹" />
                <InputField id="gstRate" label="GST Rate" value={gstRate} onChange={setGstRate} suffix="%" min="0" step="0.01" placeholder="e.g. 18" />
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isIGST} onChange={(e) => setIsIGST(e.target.checked)} className="h-4 w-4 rounded border-input text-primary" />
                  <span className="text-foreground">Inter-State (IGST)</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate GST</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">GST Breakdown</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Net Amount", value: result.netAmount },
                  { label: "GST Amount", value: result.gstAmount, highlight: true },
                  { label: "Total Amount", value: result.totalAmount, highlight: true },
                ]} />

                {/* Invoice-style breakdown */}
                <div className="mt-6 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary text-foreground">
                        <th className="px-4 py-3 text-left font-medium">Component</th>
                        <th className="px-4 py-3 text-right font-medium">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3 text-muted-foreground">Taxable Amount</td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">₹{result.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      {!isIGST ? (
                        <>
                          <tr className="border-t border-border">
                            <td className="px-4 py-3 text-muted-foreground">CGST @ {parseFloat(gstRate) / 2}%</td>
                            <td className="px-4 py-3 text-right text-foreground font-medium">₹{result.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-4 py-3 text-muted-foreground">SGST @ {parseFloat(gstRate) / 2}%</td>
                            <td className="px-4 py-3 text-right text-foreground font-medium">₹{result.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </>
                      ) : (
                        <tr className="border-t border-border">
                          <td className="px-4 py-3 text-muted-foreground">IGST @ {gstRate}%</td>
                          <td className="px-4 py-3 text-right text-foreground font-medium">₹{result.igst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr className="border-t border-border bg-secondary/30">
                        <td className="px-4 py-3 font-semibold text-foreground">Total</td>
                        <td className="px-4 py-3 text-right font-bold text-[hsl(217,91%,40%)] dark:text-primary">₹{result.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a GST Calculator?</h2>
              <p>A GST (Goods and Services Tax) calculator helps you add or remove GST from any amount. It's essential for businesses and consumers in India and other countries that use the GST system. Our calculator provides a complete breakdown including CGST, SGST, and IGST splits.</p>
              <p>Whether you're preparing invoices, checking bills, or calculating the tax component of a purchase, this tool gives you instant, accurate results with an invoice-ready format.</p>

              <h2>Understanding GST in India</h2>
              <p>India implemented GST on July 1, 2017, unifying dozens of central and state taxes into a single, comprehensive indirect tax system. GST is levied at every stage of the supply chain, with input tax credits preventing cascading (tax-on-tax) effects.</p>

              <h2>GST Rate Slabs</h2>
              <ul>
                <li><strong>0% (Exempt):</strong> Essential items like fresh food, milk, bread, and healthcare services.</li>
                <li><strong>5%:</strong> Common goods like packaged food, economy transport, and some textiles.</li>
                <li><strong>12%:</strong> Processed food, business-class flights, and certain services.</li>
                <li><strong>18%:</strong> Most goods and services including electronics, restaurants, and professional services.</li>
                <li><strong>28%:</strong> Luxury and sin goods like automobiles, tobacco, and aerated drinks.</li>
              </ul>

              <h2>CGST, SGST, and IGST Explained</h2>
              <p>For transactions within the same state (intra-state), GST is split equally between CGST (Central GST, going to the central government) and SGST (State GST, going to the state government). For transactions across state borders (inter-state), IGST (Integrated GST) applies at the full rate, with the revenue later distributed between central and destination state governments.</p>

              <h2>Using GST Calculator for Business</h2>
              <p>Businesses use GST calculators for invoice preparation, pricing decisions, and tax compliance. When quoting prices to customers, you can start with your desired net amount and add GST to determine the total invoice value. When receiving invoices, you can extract the tax component for input tax credit claims.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for general purposes. GST rules are complex and subject to change. For official tax compliance, consult a chartered accountant or tax professional.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gst-calculator" />
            <PopularCalculators exclude="/gst-calculator" />
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

export default GSTCalculator;


