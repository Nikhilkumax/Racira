"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function PitiCalculator() {
  const [homePrice, setHomePrice] = useState<number>(350000);
  const [downPayment, setDownPayment] = useState<number>(70000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [annualPropertyTaxes, setAnnualPropertyTaxes] = useState<number>(4200);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);

  const calculatePITI = () => {
    const loanAmount = homePrice - downPayment;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Principal & Interest (P&I)
    let monthlyPI = 0;
    if (monthlyInterestRate > 0) {
      monthlyPI =
        (loanAmount *
          (monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      monthlyPI = loanAmount / numberOfPayments;
    }

    // Taxes (T)
    const monthlyTaxes = annualPropertyTaxes / 12;

    // Insurance (I) - Homeowners + PMI if applicable
    const monthlyHomeInsurance = annualHomeInsurance / 12;
    let monthlyPMI = 0;
    const ltv = loanAmount / homePrice;
    if (ltv > 0.8) {
      // Estimate PMI at 0.5% of loan amount annually
      monthlyPMI = (loanAmount * 0.005) / 12;
    }

    const totalInsurance = monthlyHomeInsurance + monthlyPMI;

    const totalPITI = monthlyPI + monthlyTaxes + totalInsurance;
    const totalPayment = totalPITI + monthlyHoa;

    const chartData = [
      { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--chart-1))" },
      { name: "Property Taxes", value: monthlyTaxes, color: "hsl(var(--chart-2))" },
      { name: "Insurance (Home + PMI)", value: totalInsurance, color: "hsl(var(--chart-3))" },
    ];
    
    if (monthlyHoa > 0) {
      chartData.push({ name: "HOA Fees", value: monthlyHoa, color: "hsl(var(--chart-4))" });
    }

    return {
      loanAmount,
      monthlyPI,
      monthlyTaxes,
      monthlyHomeInsurance,
      monthlyPMI,
      totalInsurance,
      totalPITI,
      totalPayment,
      chartData
    };
  };

  const results = calculatePITI();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          PITI Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-5 w-full space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold mb-6">Mortgage Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Home Price ($)
                </label>
                <input
                  type="number"
                  value={homePrice || ""}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Down Payment ($)
                </label>
                <input
                  type="number"
                  value={downPayment || ""}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <div className="mt-2 text-sm text-muted-foreground text-right">
                  {homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : 0}% Down
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate || ""}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Loan Term (Years)
                  </label>
                  <input
                    type="number"
                    value={loanTerm || ""}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-bold mb-4">Taxes & Insurance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Annual Property Taxes ($)
                    </label>
                    <input
                      type="number"
                      value={annualPropertyTaxes || ""}
                      onChange={(e) => setAnnualPropertyTaxes(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Annual Home Insurance ($)
                    </label>
                    <input
                      type="number"
                      value={annualHomeInsurance || ""}
                      onChange={(e) => setAnnualHomeInsurance(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Monthly HOA Fees ($)
                    </label>
                    <input
                      type="number"
                      value={monthlyHoa || ""}
                      onChange={(e) => setMonthlyHoa(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 w-full space-y-6">
          <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-2">Total Monthly Payment</h3>
              <div className="text-5xl font-bold tracking-tight mb-4">
                ${results.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm opacity-80 mb-6">
                Total PITI: ${results.totalPITI.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mo
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                <div>
                  <div className="text-sm opacity-80 mb-1">P&I (Principal & Interest)</div>
                  <div className="text-2xl font-semibold">${results.monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm opacity-80 mb-1">T&I (Taxes & Insurance)</div>
                  <div className="text-2xl font-semibold">${(results.monthlyTaxes + results.totalInsurance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground mb-4">Payment Breakdown</h3>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                  <span className="font-semibold">Principal & Interest</span>
                </div>
                <span>${results.monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                  <span className="font-semibold">Property Taxes</span>
                </div>
                <span>${results.monthlyTaxes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>
                  <span className="font-semibold">Home Insurance</span>
                </div>
                <span>${results.monthlyHomeInsurance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              
              {results.monthlyPMI > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))] opacity-70"></div>
                    <span className="font-semibold">PMI</span>
                  </div>
                  <span>${results.monthlyPMI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              {monthlyHoa > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]"></div>
                    <span className="font-semibold">HOA Fees</span>
                  </div>
                  <span>${monthlyHoa.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {results.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-16 max-w-4xl mx-auto prose prose-slate dark:prose-invert">
        <h2 className="text-3xl font-bold mb-6">What does PITI mean?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          PITI is an acronym that stands for Principal, Interest, Taxes, and Insurance. It represents the total monthly payment you will make for your home. Lenders use PITI to determine if you can afford a mortgage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-xl font-bold text-primary mb-2">P = Principal</h4>
            <p className="text-muted-foreground">The portion of your payment that goes toward paying down the actual loan amount you borrowed.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-xl font-bold text-primary mb-2">I = Interest</h4>
            <p className="text-muted-foreground">The cost of borrowing the money, calculated as a percentage of your outstanding principal balance.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-xl font-bold text-primary mb-2">T = Taxes</h4>
            <p className="text-muted-foreground">Property taxes assessed by your local government, usually collected monthly in an escrow account.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-xl font-bold text-primary mb-2">I = Insurance</h4>
            <p className="text-muted-foreground">Homeowners insurance to protect the property, plus Private Mortgage Insurance (PMI) if your down payment is less than 20%.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
