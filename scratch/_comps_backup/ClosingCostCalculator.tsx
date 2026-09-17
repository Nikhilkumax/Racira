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

export default function ClosingCostCalculator() {
  const [homePrice, setHomePrice] = useState<number>(350000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);

  const calculateCosts = () => {
    const loanAmount = homePrice * (1 - downPaymentPercent / 100);
    
    // Estimate standard closing costs
    const originationFee = loanAmount * 0.01; // 1% of loan amount
    const appraisalFee = 500;
    const titleInsurance = homePrice * 0.005; // 0.5% of home price
    const recordingFees = 150;
    const propertyTaxes = homePrice * 0.012 / 2; // 6 months of 1.2% tax rate
    const homeInsurance = 1000;
    
    const lenderFees = originationFee + appraisalFee;
    const thirdPartyFees = titleInsurance + recordingFees;
    const prepaidCosts = propertyTaxes + homeInsurance;
    
    const totalClosingCosts = lenderFees + thirdPartyFees + prepaidCosts;
    const cashToClose = totalClosingCosts + (homePrice * downPaymentPercent / 100);

    const chartData = [
      { name: "Lender Fees", value: lenderFees, color: "hsl(var(--chart-1))" },
      { name: "Third Party Fees", value: thirdPartyFees, color: "hsl(var(--chart-2))" },
      { name: "Prepaid Costs", value: prepaidCosts, color: "hsl(var(--chart-3))" }
    ];

    return {
      loanAmount,
      totalClosingCosts,
      cashToClose,
      breakdown: {
        originationFee,
        appraisalFee,
        titleInsurance,
        recordingFees,
        propertyTaxes,
        homeInsurance
      },
      chartData
    };
  };

  const [results, setResults] = useState(calculateCosts());
  const handleCalculate = () => setResults(calculateCosts());
  const handleReset = () => {
    setHomePrice(350000);
    setDownPaymentPercent(20);
  };

  return (
    <div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          Closing Cost Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-4 w-full space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold mb-6">Property Details</h3>
            
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
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  value={downPaymentPercent || ""}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <div className="mt-2 text-sm text-muted-foreground text-right">
                  Amount: ${(homePrice * downPaymentPercent / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
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
        <div className="lg:col-span-8 w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-primary/10 border-l-4 border-primary rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Estimated Closing Costs</h3>
              <div className="text-4xl font-bold tracking-tight text-primary mb-2">
                ${results.totalClosingCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-muted-foreground">
                ~{((results.totalClosingCosts / homePrice) * 100).toFixed(1)}% of home price
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Cash to Close</h3>
              <div className="text-4xl font-bold tracking-tight text-foreground mb-2">
                ${results.cashToClose.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Includes down payment & closing costs
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Cost Breakdown</h3>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-border/50">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Lender Fees</span>
                    <span>${(results.breakdown.originationFee + results.breakdown.appraisalFee).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Origination Fee</span>
                    <span>${results.breakdown.originationFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Appraisal Fee</span>
                    <span>${results.breakdown.appraisalFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="pb-4 border-b border-border/50">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Third-Party Fees</span>
                    <span>${(results.breakdown.titleInsurance + results.breakdown.recordingFees).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Title Insurance</span>
                    <span>${results.breakdown.titleInsurance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Recording Fees</span>
                    <span>${results.breakdown.recordingFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Prepaid Costs (Escrow)</span>
                    <span>${(results.breakdown.propertyTaxes + results.breakdown.homeInsurance).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Property Taxes</span>
                    <span>${results.breakdown.propertyTaxes.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Homeowners Insurance</span>
                    <span>${results.breakdown.homeInsurance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 md:h-auto min-h-[250px]">
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
                    formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-16 max-w-4xl prose prose-slate dark:prose-invert">
        <h2 className="text-2xl font-bold mb-3">Understanding Closing Costs</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Closing costs are processing fees that you pay to your lender and third parties when you close on your loan. They typically range from 2% to 5% of the total loan amount.
        </p>
        
        <h3 className="text-2xl font-bold mb-4">Common Fees Explained</h3>
        <div className="space-y-4">
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-lg font-bold">Lender Fees</h4>
            <p className="text-muted-foreground">Fees charged by the mortgage company to process, underwrite, and close your loan. This includes origination fees, application fees, and underwriting fees.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-lg font-bold">Third-Party Fees</h4>
            <p className="text-muted-foreground">Fees paid to other companies involved in the transaction, such as appraisers, title companies, and local government recording offices.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50">
            <h4 className="text-lg font-bold">Prepaid Costs</h4>
            <p className="text-muted-foreground">Upfront payments for ongoing homeownership expenses, typically placed into an escrow account. This usually includes property taxes and homeowners insurance premiums.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
