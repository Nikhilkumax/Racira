"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function EscrowCalculator() {
  const [annualPropertyTaxes, setAnnualPropertyTaxes] = useState<number>(3600);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);
  const [pmiMonthly, setPmiMonthly] = useState<number>(0);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);

  const calculateEscrow = () => {
    const monthlyTaxes = annualPropertyTaxes / 12;
    const monthlyInsurance = annualHomeInsurance / 12;
    
    const totalMonthlyEscrow = monthlyTaxes + monthlyInsurance + pmiMonthly + hoaMonthly;

    const chartData = [
      {
        name: "Monthly Breakdown",
        "Property Taxes": monthlyTaxes,
        "Home Insurance": monthlyInsurance,
        "PMI": pmiMonthly,
        "HOA Dues": hoaMonthly,
      }
    ];

    return {
      monthlyTaxes,
      monthlyInsurance,
      totalMonthlyEscrow,
      chartData
    };
  };

  const [results, setResults] = useState(calculateEscrow());
  const handleCalculate = () => setResults(calculateEscrow());
  const handleReset = () => {
    setAnnualPropertyTaxes(3600);
    setAnnualHomeInsurance(1200);
    setPmiMonthly(0);
    setHoaMonthly(0);
  };

  return (
    <div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          Escrow Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-5 w-full space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold mb-6">Annual & Monthly Costs</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Annual Property Taxes ($)
                </label>
                <input
                  type="number"
                  value={annualPropertyTaxes || ""}
                  onChange={(e) => setAnnualPropertyTaxes(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g. 3600"
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
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Monthly PMI ($) (Optional)
                </label>
                <input
                  type="number"
                  value={pmiMonthly || ""}
                  onChange={(e) => setPmiMonthly(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g. 150"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Monthly HOA ($) (Optional)
                </label>
                <input
                  type="number"
                  value={hoaMonthly || ""}
                  onChange={(e) => setHoaMonthly(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="e.g. 200"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: HOA fees are not always held in escrow, but are part of your monthly housing cost.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleCalculate} className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 h-11 rounded-xl border border-border/50 bg-background hover:bg-secondary text-foreground font-semibold transition-colors flex items-center justify-center gap-2">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 w-full space-y-6">
          <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-2">Total Monthly Escrow</h3>
              <div className="text-5xl font-bold tracking-tight mb-4">
                ${results.totalMonthlyEscrow.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm opacity-80 mb-6 max-w-sm">
                This amount will be added to your principal and interest payment each month.
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                <div>
                  <div className="text-sm opacity-80 mb-1">Monthly Taxes</div>
                  <div className="text-2xl font-semibold">${results.monthlyTaxes.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm opacity-80 mb-1">Monthly Insurance</div>
                  <div className="text-2xl font-semibold">${results.monthlyInsurance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">Escrow Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Bar dataKey="Property Taxes" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Home Insurance" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="PMI" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="HOA Dues" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-16 max-w-4xl prose prose-slate dark:prose-invert">
        <h2 className="text-2xl font-bold mb-3">What is an Escrow Account?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          In real estate, an escrow account is set up by your mortgage lender to pay certain property-related expenses on your behalf. Most lenders require you to pay a portion of your property taxes and homeowners insurance each month along with your mortgage payment.
        </p>
        
        <h3 className="text-2xl font-bold mb-4">How Does It Work?</h3>
        <p className="text-lg text-muted-foreground mb-4">
          When you make your monthly mortgage payment, part of it goes toward your loan principal and interest, and the other part goes into your escrow account. When your tax bills and insurance premiums are due, the lender pays them from the escrow account.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-lg text-muted-foreground">
          <li><strong>Convenience:</strong> You don't have to worry about saving for large annual tax or insurance bills.</li>
          <li><strong>Protection:</strong> It ensures that your property taxes are paid on time (preventing tax liens) and that your home remains insured (protecting the lender's investment).</li>
          <li><strong>Adjustments:</strong> Because tax and insurance rates change, your lender will perform an annual escrow analysis. If there's a shortage, your monthly payment may increase. If there's an overage, you may receive an escrow refund.</li>
        </ul>
      </div>
    </div>
  );
}
