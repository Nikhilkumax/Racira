"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const LeaveEncashmentCalculator = () => {
  const [basicPay, setBasicPay] = useState("50000");
  const [da, setDa] = useState("25000");
  const [leavesAccumulated, setLeavesAccumulated] = useState("300");
  const [yearsOfService, setYearsOfService] = useState("20");
  const [employeeType, setEmployeeType] = useState<"govt" | "private">("private");
  const [result, setResult] = useState<{
    encashmentAmount: number; taxExempt: number; taxableAmount: number; dailyRate: number;
  } | null>(null);

  const calculate = () => {
    const basic = parseFloat(basicPay) || 0;
    const daAmt = parseFloat(da) || 0;
    const leaves = parseInt(leavesAccumulated) || 0;
    const years = parseInt(yearsOfService) || 0;
    if (basic <= 0 || leaves <= 0) return;

    const monthlySalary = basic + daAmt;
    const dailyRate = monthlySalary / 30;
    const encashmentAmount = dailyRate * leaves;

    // Tax exemption u/s 10(10AA) for non-government employees
    let taxExempt = 0;
    if (employeeType === "govt") {
      taxExempt = encashmentAmount; // Fully exempt for govt
    } else {
      const maxLeaves = Math.min(leaves, 30 * years); // Max 30 days per year
      const avgSalary10m = monthlySalary; // Simplified: using current salary as avg
      const exemptCalc = [
        25_00_000, // Statutory limit (as of 2023)
        dailyRate * maxLeaves,
        avgSalary10m * 10,
        encashmentAmount,
      ];
      taxExempt = Math.min(...exemptCalc);
    }

    setResult({
      encashmentAmount: Math.round(encashmentAmount),
      taxExempt: Math.round(taxExempt),
      taxableAmount: Math.round(Math.max(0, encashmentAmount - taxExempt)),
      dailyRate: Math.round(dailyRate),
    });
  };

  const reset = () => { setBasicPay("50000"); setDa("25000"); setLeavesAccumulated("300"); setYearsOfService("20"); setEmployeeType("private"); setResult(null); };

  const faqs = [
    { question: "What is leave encashment?", answer: "Leave encashment is the monetary compensation an employee receives for accumulated unused leaves at the time of retirement, resignation, or during service (in some organizations)." },
    { question: "Is leave encashment taxable?", answer: "For government employees, leave encashment at retirement is fully tax-exempt. For private employees, it is exempt up to ₹25,00,000 (raised from ₹3,00,000 in Budget 2023) subject to conditions under Section 10(10AA)." },
    { question: "How are encashable leaves calculated?", answer: "The maximum encashable leaves are calculated as 30 days per year of completed service. Any accumulated leaves beyond this are not considered for tax exemption." },
    { question: "What is the formula for leave encashment?", answer: "Leave Encashment = (Basic + DA) ÷ 30 × Number of accumulated leaves. Tax exemption is the least of: statutory limit, 10 months' average salary, 30 days per year of service, or actual amount." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Leave Encashment Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Leave Encashment Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate leave encashment amount and tax exemption under Section 10(10AA) at retirement.</p>

            <div className="card-calculator mb-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Employee Type</label>
                <div className="flex gap-2">
                  <button onClick={() => { setEmployeeType("govt"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${employeeType === "govt" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Government</button>
                  <button onClick={() => { setEmployeeType("private"); setResult(null); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${employeeType === "private" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Private Sector</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="basicPay" label="Basic Pay (Monthly)" value={basicPay} onChange={setBasicPay} prefix="₹" />
                <InputField id="da" label="Dearness Allowance (Monthly)" value={da} onChange={setDa} prefix="₹" />
                <InputField id="leavesAccumulated" label="Accumulated Leaves" value={leavesAccumulated} onChange={setLeavesAccumulated} suffix="days" tooltip="Total unused leaves at retirement" />
                <InputField id="yearsOfService" label="Years of Service" value={yearsOfService} onChange={setYearsOfService} suffix="yrs" />
              </div>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate Encashment</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Leave Encashment Calculation</h2>
                <ResultDisplay currency="₹" items={[
                  { label: "Total Encashment", value: result.encashmentAmount, highlight: true },
                  { label: "Tax-Exempt Amount", value: result.taxExempt },
                  { label: "Taxable Amount", value: result.taxableAmount, highlight: true },
                  { label: "Daily Rate (Basic+DA)", value: result.dailyRate },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is Leave Encashment?</h2>
              <p>Leave encashment is the process of converting unused (accumulated) leave into cash. This is typically done at the time of retirement, resignation, or superannuation. Some organizations also allow leave encashment during service, but the tax treatment differs.</p>

              <h2>How Is Leave Encashment Calculated?</h2>
              <p>The formula is: <strong>Leave Encashment = (Basic Pay + DA) ÷ 30 × Number of accumulated leaves</strong></p>
              <p>For example, if your Basic + DA is ₹75,000/month and you have 300 accumulated leaves: ₹75,000 ÷ 30 × 300 = ₹7,50,000.</p>

              <h2>Tax Exemption Rules (Section 10(10AA))</h2>
              <ul>
                <li><strong>Government employees:</strong> Leave encashment at retirement is fully tax-exempt with no upper limit.</li>
                <li><strong>Private employees:</strong> Exempt amount is the LEAST of:
                  <ul>
                    <li>₹25,00,000 (statutory limit as per Budget 2023)</li>
                    <li>10 months' average salary (Basic + DA)</li>
                    <li>Cash equivalent of leaves at 30 days per year of service</li>
                    <li>Actual amount received</li>
                  </ul>
                </li>
              </ul>

              <h2>Leave Encashment During Service vs Retirement</h2>
              <p>Leave encashment received <strong>during service</strong> is fully taxable as salary income. The tax exemption under Section 10(10AA) applies only at the time of <strong>retirement or resignation</strong>. If you receive encashment from multiple employers, the cumulative exemption limit of ₹25,00,000 applies.</p>

              <h2>Important Considerations</h2>
              <ul>
                <li>Only <strong>earned leave</strong> (EL/PL) is eligible for encashment, not casual leave or sick leave.</li>
                <li>The maximum encashable leaves for tax purposes are 30 days × completed years of service.</li>
                <li>The "average salary" for exemption is calculated using the last 10 months' Basic + DA.</li>
                <li>Legal heirs can claim leave encashment of a deceased employee — it's tax-exempt without limit.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> Tax exemption limits and rules may change with annual budgets. Consult a CA or tax professional for personalized advice.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/leave-encashment-calculator" />
            <PopularCalculators exclude="/leave-encashment-calculator" />
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

export default LeaveEncashmentCalculator;

