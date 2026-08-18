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
  Legend
} from "recharts";

export default function ArmVsFixedRateCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  
  // Fixed Rate Inputs
  const [fixedRate, setFixedRate] = useState<number>(6.5);
  
  // ARM Inputs
  const [armInitialRate, setArmInitialRate] = useState<number>(5.5);
  const [armFixedYears, setArmFixedYears] = useState<number>(5); // e.g. 5/1 ARM
  const [armExpectedAdjustment, setArmExpectedAdjustment] = useState<number>(0.25); // expected average annual increase after fixed period

  const calculateComparison = () => {
    // Fixed Rate Calculation
    const monthlyInterestFixed = fixedRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    let fixedPayment = 0;
    if (monthlyInterestFixed > 0) {
      fixedPayment = (loanAmount * (monthlyInterestFixed * Math.pow(1 + monthlyInterestFixed, numPayments))) / 
                     (Math.pow(1 + monthlyInterestFixed, numPayments) - 1);
    } else {
      fixedPayment = loanAmount / numPayments;
    }
    
    // ARM Calculation Simulation
    let armBalance = loanAmount;
    let totalArmPaid = 0;
    let totalFixedPaid = 0;
    interface ChartData {
      year: string;
      "Fixed Payment": number;
      "ARM Payment": number;
      "Total Fixed Paid": number;
      "Total ARM Paid": number;
    }
    let chartData: ChartData[] = [];
    
    let currentArmRate = armInitialRate;
    let armMonthlyInterest = currentArmRate / 100 / 12;
    let remainingPayments = numPayments;
    
    let currentArmPayment = 0;
    if (armMonthlyInterest > 0) {
      currentArmPayment = (armBalance * (armMonthlyInterest * Math.pow(1 + armMonthlyInterest, remainingPayments))) / 
                          (Math.pow(1 + armMonthlyInterest, remainingPayments) - 1);
    } else {
      currentArmPayment = armBalance / remainingPayments;
    }

    const initialArmPayment = currentArmPayment;
    let maxArmPayment = currentArmPayment;

    for (let year = 1; year <= loanTerm; year++) {
      let yearlyArmPaid = 0;
      let yearlyFixedPaid = 0;

      // Adjust ARM rate if past fixed period
      if (year > armFixedYears) {
        currentArmRate += armExpectedAdjustment;
        armMonthlyInterest = currentArmRate / 100 / 12;
        
        // Recalculate payment based on new rate and remaining balance
        if (armMonthlyInterest > 0) {
          currentArmPayment = (armBalance * (armMonthlyInterest * Math.pow(1 + armMonthlyInterest, remainingPayments))) / 
                              (Math.pow(1 + armMonthlyInterest, remainingPayments) - 1);
        } else {
          currentArmPayment = armBalance / remainingPayments;
        }
        
        if (currentArmPayment > maxArmPayment) maxArmPayment = currentArmPayment;
      }

      for (let month = 1; month <= 12; month++) {
        // Fixed Tracking
        totalFixedPaid += fixedPayment;
        yearlyFixedPaid += fixedPayment;

        // ARM Tracking
        const interestPortion = armBalance * armMonthlyInterest;
        const principalPortion = currentArmPayment - interestPortion;
        armBalance -= principalPortion;
        
        totalArmPaid += currentArmPayment;
        yearlyArmPaid += currentArmPayment;
        remainingPayments--;
      }

      chartData.push({
        year: `Year ${year}`,
        "Fixed Payment": fixedPayment,
        "ARM Payment": currentArmPayment,
        "Total Fixed Paid": totalFixedPaid,
        "Total ARM Paid": totalArmPaid
      });
    }

    const fixedTotalInterest = (fixedPayment * numPayments) - loanAmount;
    const armTotalInterest = totalArmPaid - loanAmount;

    return {
      fixedPayment,
      initialArmPayment,
      maxArmPayment,
      fixedTotalInterest,
      armTotalInterest,
      totalFixedPaid: fixedPayment * numPayments,
      totalArmPaid,
      chartData
    };
  };

  const [results, setResults] = useState(calculateComparison());
  const handleCalculate = () => setResults(calculateComparison());
  const handleReset = () => {
    setLoanAmount(300000);
    setLoanTerm(30);
    setFixedRate(6.5);
    setArmInitialRate(5.5);
    setArmFixedYears(5);
    setArmExpectedAdjustment(0.25);
  };
  const savingsInitial = results.fixedPayment - results.initialArmPayment;
  const isArmCheaperOverall = results.totalArmPaid < results.totalFixedPaid;

  return (
    <div className="max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
          ARM vs Fixed Rate Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Section */}
        <div className="lg:col-span-4 w-full space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold mb-6">General Loan Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  value={loanAmount || ""}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
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

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-bold mb-4">Fixed Rate Scenario</h3>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Fixed Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fixedRate || ""}
                    onChange={(e) => setFixedRate(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-bold mb-4">ARM Scenario</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Initial ARM Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={armInitialRate || ""}
                      onChange={(e) => setArmInitialRate(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Fixed Period (Years)
                    </label>
                    <input
                      type="number"
                      value={armFixedYears || ""}
                      onChange={(e) => setArmFixedYears(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Expected Annual Rate Increase (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={armExpectedAdjustment || ""}
                      onChange={(e) => setArmExpectedAdjustment(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      How much you expect the rate to increase each year after the fixed period ends.
                    </p>
                  </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Fixed Monthly Payment</h3>
              <div className="text-4xl font-bold tracking-tight text-foreground mb-2">
                ${results.fixedPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Interest: ${results.fixedTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-medium opacity-90 mb-2">Initial ARM Payment</h3>
              <div className="text-4xl font-bold tracking-tight mb-2">
                ${results.initialArmPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm opacity-80">
                Saves ${savingsInitial > 0 ? savingsInitial.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}/mo for the first {armFixedYears} years
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 shadow-lg p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Long-Term Cost Comparison</h3>
            <p className="text-muted-foreground mb-6">
              {isArmCheaperOverall 
                ? `Over the full ${loanTerm} years, the ARM saves you $${(results.totalFixedPaid - results.totalArmPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })} in total interest.`
                : `Over the full ${loanTerm} years, the Fixed Rate saves you $${(results.totalArmPaid - results.totalFixedPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })} in total interest.`
              }
            </p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorArm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Total Fixed Paid" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorFixed)" />
                  <Area type="monotone" dataKey="Total ARM Paid" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorArm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-16 max-w-4xl prose prose-slate dark:prose-invert">
        <h2 className="text-2xl font-bold mb-3">ARM vs Fixed Rate: Which is Better?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Choosing between an Adjustable-Rate Mortgage (ARM) and a Fixed-Rate Mortgage is one of the most important decisions when financing a home.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Fixed-Rate Mortgage</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pros:</strong> Payment predictability. Your interest rate and monthly principal and interest payment will never change for the life of the loan.</li>
              <li><strong>Cons:</strong> Initial rates are usually higher than ARMs. You may pay more interest if you move before an ARM would have adjusted.</li>
              <li><strong>Best For:</strong> Buyers who plan to stay in their home long-term (7+ years) or during periods of historically low interest rates.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-[hsl(var(--chart-1))]">Adjustable-Rate Mortgage</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pros:</strong> Lower initial interest rate and lower initial monthly payments during the fixed introductory period (e.g., the first 5 or 7 years).</li>
              <li><strong>Cons:</strong> Uncertainty. After the fixed period, your rate can increase, causing your monthly payment to jump significantly.</li>
              <li><strong>Best For:</strong> Buyers who plan to sell or refinance before the introductory fixed-rate period ends.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
