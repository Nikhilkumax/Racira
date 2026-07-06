"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LtvCalculator() {
  const [propertyValue, setPropertyValue] = useState<number>(300000);
  const [loanAmount, setLoanAmount] = useState<number>(240000);
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [isInputDownPayment, setIsInputDownPayment] = useState<boolean>(true);

  const calculateLTV = () => {
    let currentLoanAmount = loanAmount;
    if (isInputDownPayment) {
      currentLoanAmount = propertyValue - downPayment;
    }
    const ltv = (currentLoanAmount / propertyValue) * 100;
    
    // Chart data showing the ratio
    const chartData = [
      { name: "0", value: 0 },
      { name: "Down Payment", value: (propertyValue - currentLoanAmount) / propertyValue * 100 },
      { name: "LTV", value: ltv }
    ];

    return {
      ltv: isNaN(ltv) ? 0 : ltv,
      currentLoanAmount: isNaN(currentLoanAmount) ? 0 : currentLoanAmount,
      chartData,
    };
  };

  const results = calculateLTV();

  return (
    <div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          LTV Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Property Value ($)
                </label>
                <input
                  type="number"
                  value={propertyValue || ""}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  placeholder="e.g. 300000"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsInputDownPayment(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isInputDownPayment
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Enter Down Payment
                </button>
                <button
                  onClick={() => setIsInputDownPayment(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    !isInputDownPayment
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Enter Loan Amount
                </button>
              </div>

              {isInputDownPayment ? (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Down Payment ($)
                  </label>
                  <input
                    type="number"
                    value={downPayment || ""}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder="e.g. 60000"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Loan Amount ($)
                  </label>
                  <input
                    type="number"
                    value={loanAmount || ""}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder="e.g. 240000"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 w-full space-y-6">
          <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium opacity-90 mb-2">Loan-to-Value (LTV) Ratio</h3>
              <div className="text-5xl font-bold tracking-tight mb-4">
                {results.ltv.toFixed(2)}%
              </div>
              <div className="text-sm opacity-80 mb-6 max-w-sm">
                {results.ltv > 80 
                  ? "Since your LTV is over 80%, you will likely be required to pay Private Mortgage Insurance (PMI)."
                  : "Your LTV is 80% or below, which means you typically won't need Private Mortgage Insurance (PMI)."}
              </div>

              <div className="pt-6 border-t border-white/20">
                <h3 className="text-lg font-medium opacity-90 mb-2">Total Loan Amount</h3>
                <div className="text-3xl font-semibold">
                  ${results.currentLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">LTV Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-16 max-w-4xl prose prose-slate dark:prose-invert">
        <h2 className="text-2xl font-bold mb-3">What is a Loan-to-Value (LTV) Ratio?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          The Loan-to-Value (LTV) ratio is a financial term used by lenders to express the ratio of a loan to the value of an asset purchased. The term is commonly used by banks and building societies to represent the ratio of the first mortgage line as a percentage of the total appraised value of real property.
        </p>
        
        <div className="bg-card p-6 rounded-2xl border border-border/50 my-8">
          <h3 className="text-xl font-semibold mb-4">LTV Formula</h3>
          <p className="text-lg font-mono bg-muted p-4 rounded-xl text-center">
            LTV = (Mortgage Amount / Appraised Property Value) × 100
          </p>
        </div>

        <h3 className="text-2xl font-bold mb-4">Why Does LTV Matter?</h3>
        <p className="text-lg text-muted-foreground mb-4">
          LTV is one of the key risk factors that lenders assess when qualifying borrowers for a mortgage. 
        </p>
        <ul className="list-disc pl-6 space-y-2 text-lg text-muted-foreground">
          <li><strong>Interest Rates:</strong> A lower LTV generally qualifies you for better interest rates because it represents less risk to the lender.</li>
          <li><strong>PMI Requirement:</strong> If your LTV is higher than 80% (meaning your down payment is less than 20%), conventional lenders will usually require you to pay for Private Mortgage Insurance (PMI).</li>
          <li><strong>Loan Approval:</strong> Some loan programs have maximum LTV limits. For example, conventional loans typically max out at 97% LTV, while FHA loans can go up to 96.5%.</li>
        </ul>
      </div>
    </div>
  );
}
