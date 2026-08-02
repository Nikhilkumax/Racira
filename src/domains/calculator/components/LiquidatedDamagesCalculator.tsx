"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// Define input types
interface Inputs {
  contractValue: number | string;
  dailyRate: number | string; // LD Rate in percent per day
  daysDelayed: number | string;
  startDate: string; // YYYY-MM-DD
  interestRate: number | string; // Interest rate per annum in percent
  compounding: string; // e.g., "Monthly", "Quarterly", "Annually", "None"
  dailyIncrease: number | string; // Daily increase in rate (percent per day)
  maxCap: number | string; // Maximum damages as percent of contract value
}

// Define result type
interface Result {
  dailyDamages: number; // Base daily damages (without escalation or interest)
  totalDamages: number; // Base total damages (without escalation or interest)
  totalWithInterest: number; // Total after applying interest to escalated amount
  totalWithInterestAndEscalation: number; // Same as totalWithInterest for clarity
  cappedTotal: number; // Final amount after applying max cap
  dailyDamagesWithEscalation: number[]; // cumulative daily damages with escalation (for chart)
  maxPossibleDamages: number; // contractValue * (maxCap/100)
}

// Pure calculation function (zero React)
const calculateLiquidatedDamages = (inputs: Inputs): Result => {
  // Extract and validate inputs
  const {
    contractValue,
    dailyRate,
    daysDelayed,
    startDate,
    interestRate,
    compounding,
    dailyIncrease,
    maxCap
  } = inputs;

  // Convert to numbers, defaulting to 0 for invalid/negative values where appropriate
  const cv = Math.max(0, parseFloat(contractValue.toString()) || 0);
  const dr = Math.max(0, parseFloat(dailyRate.toString()) || 0);
  const dd = Math.max(0, parseFloat(daysDelayed.toString()) || 0);
  const ir = Math.max(0, parseFloat(interestRate.toString()) || 0);
  const di = Math.max(0, parseFloat(dailyIncrease.toString()) || 0);
  const mc = Math.max(0, parseFloat(maxCap.toString()) || 0);

  // Handle zero days delayed
  if (dd === 0) {
    return {
      dailyDamages: 0,
      totalDamages: 0,
      totalWithInterest: 0,
      totalWithInterestAndEscalation: 0,
      cappedTotal: 0,
      dailyDamagesWithEscalation: [],
      maxPossibleDamages: 0
    };
  }

  // 1. Base daily damages (without escalation or interest)
  const baseDailyDamages = (cv * dr) / 100;

  // 2. Base total damages (without escalation or interest)
  const baseTotalDamages = baseDailyDamages * dd;

  // 3. Calculate escalated total damages (without interest)
  //    Formula: sum over days of [CV * (DR + i * DI) / 100] for i from 0 to (dd-1)
  //    = (CV/100) * [ DR * dd + DI * (0+1+...+(dd-1)) ]
  //    = (CV/100) * [ DR * dd + DI * (dd*(dd-1)/2) ]
  const sumOfIncrements = (dd * (dd - 1)) / 2;
  const escalatedTotalDamages = (cv / 100) * (dr * dd + di * sumOfIncrements);

  // 4. Calculate interest on the escalated total damages
  let totalWithInterest = escalatedTotalDamages; // Default: no interest

  if (compounding !== 'None' && ir > 0 && dd > 0) {
    const years = dd / 365; // Convert days to years
    let effectiveRate = 0;

    switch (compounding) {
      case 'Monthly':
        // Monthly compounding: rate per period = annualRate/12, periods = years*12
        effectiveRate = Math.pow(1 + (ir / 100) / 12, 12 * years) - 1;
        break;
      case 'Quarterly':
        // Quarterly compounding: rate per period = annualRate/4, periods = years*4
        effectiveRate = Math.pow(1 + (ir / 100) / 4, 4 * years) - 1;
        break;
      case 'Annually':
        // Annual compounding: rate per period = annualRate, periods = years
        effectiveRate = Math.pow(1 + (ir / 100), years) - 1;
        break;
      default:
        // Fallback to simple interest if compounding type is unknown
        effectiveRate = (ir / 100) * years;
        break;
    }

    totalWithInterest = escalatedTotalDamages * (1 + effectiveRate);
  } else if (compounding === 'None' && ir > 0 && dd > 0) {
    // Simple interest: I = P * r * t
    totalWithInterest = escalatedTotalDamages * (1 + (ir / 100) * (dd / 365));
  }

  // 5. Apply the maximum cap
  const maxPossibleDamages = (cv * mc) / 100;
  const cappedTotal = Math.min(totalWithInterest, maxPossibleDamages);

  // 6. Calculate daily damages with escalation (for chart) - cumulative without interest
  const dailyDamagesWithEscalation: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < dd; i++) {
    const rateForDay = dr + i * di; // Rate for this day (in percent)
    const dailyAmount = (cv * rateForDay) / 100;
    cumulative += dailyAmount;
    dailyDamagesWithEscalation.push(cumulative);
  }

  return {
    dailyDamages: baseDailyDamages,
    totalDamages: baseTotalDamages,
    totalWithInterest: totalWithInterest, // After escalation and interest
    totalWithInterestAndEscalation: totalWithInterest, // Alias for clarity
    cappedTotal,
    dailyDamagesWithEscalation,
    maxPossibleDamages
  };
};

// Default values
const DEFAULTS: Inputs = {
  contractValue: 500000, // $500,000
  dailyRate: 0.1, // 0.1% per day
  daysDelayed: 30,
  startDate: '2024-01-15',
  interestRate: 6, // 6% per annum
  compounding: 'Monthly',
  dailyIncrease: 0.01, // 0.01% per day increase
  maxCap: 20 // 20% max cap
};

const LiquidatedDamagesCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculateLiquidatedDamages(DEFAULTS));

  // Recalculate on input changes (as per requirement: useEffect with inputs dependency)
  useEffect(() => {
    setResult(calculateLiquidatedDamages(inputs));
  }, [inputs]);

  const handleInputChange = (field: keyof Inputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = () => {
    setResult(calculateLiquidatedDamages(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    // Result will update via useEffect
  };

  // Format number as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format number as percentage
  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Format number as plain number with 2 decimal places
  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">
        Liquidated Damages Calculator
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Inputs and Controls */}
        <div className="space-y-6">
          {/* Normal Tier - 2 per row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contract Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.contractValue}
                onChange={(e) => handleInputChange('contractValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LD Rate (% per day)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={inputs.dailyRate}
                onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Days Delayed</label>
              <input
                type="number"
                min="0"
                step="1"
                value={inputs.daysDelayed}
                onChange={(e) => handleInputChange('daysDelayed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={inputs.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Second Tier: Advanced Options */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Interest Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Interest Rate (% per annum)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputs.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compounding</label>
                  <select
                    value={inputs.compounding}
                    onChange={(e) => handleInputChange('compounding', e.target.value as string)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
                  >
                    <option value="None">Simple Interest</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Escalation Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Increase (% per day)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputs.dailyIncrease}
                    onChange={(e) => handleInputChange('dailyIncrease', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Cap (% of Contract Value)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputs.maxCap}
                    onChange={(e) => handleInputChange('maxCap', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 Focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Reset
            </button>
            <button
              onClick={handleCalculate}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Primary Result Card */}
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-2">Total Liquidated Damages</h2>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(result.cappedTotal)}
            </p>
            <p className="text-sm text-gray-500">
              Maximum possible: {formatCurrency(result.maxPossibleDamages)}
            </p>
          </div>

          {/* 3-Stat Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Daily Damages</p>
              <p className="text-lg font-bold">{formatCurrency(result.dailyDamages)}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Base Total Damages</p>
              <p className="text-lg font-bold">{formatCurrency(result.totalDamages)}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Maximum Possible</p>
              <p className="text-lg font-bold">{formatCurrency(result.maxPossibleDamages)}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Breakdown</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Contract Value:</span>
                <span>{formatCurrency(Number(inputs.contractValue))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Daily Rate:</span>
                <span>{formatPercent(Number(inputs.dailyRate))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Days Delayed:</span>
                <span>{Number(inputs.daysDelayed)} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Base Daily Damages:</span>
                <span>{formatCurrency(result.dailyDamages)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Base Total Damages:</span>
                <span>{formatCurrency(result.totalDamages)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Escalation Added:</span>
                <span>{formatCurrency(Math.max(0, result.totalWithInterest - result.totalDamages))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interest Added:</span>
                <span>{formatCurrency(Math.max(0, result.totalWithInterestAndEscalation - result.totalDamages))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount After Interest & Escalation:</span>
                <span>{formatCurrency(result.totalWithInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Maximum Allowable:</span>
                <span>{formatCurrency(result.maxPossibleDamages)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Final Amount (Capped):</span>
                <span>{formatCurrency(result.cappedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Damages Accumulation Over Time</h2>
            {result.dailyDamagesWithEscalation.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={result.dailyDamagesWithEscalation.map((value, index) => ({
                    day: index + 1,
                    cumulative: value
                  }))}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cumulative" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data to display (0 days delayed)</p>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Summary Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Total Damages:</span>
                <span>{formatCurrency(result.totalDamages)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Escalation Added:</span>
                <span>{formatCurrency(Math.max(0, result.totalWithInterest - result.totalDamages))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Interest Added:</span>
                <span>{formatCurrency(Math.max(0, result.totalWithInterestAndEscalation - result.totalDamages))}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Amount Due to Cap:</span>
                <span>{formatCurrency(Math.max(0, result.totalWithInterest - result.maxPossibleDamages))}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Final Amount:</span>
                <span>{formatCurrency(result.cappedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content - 3 sections, ~400 words */}
      <section className="mt-8 pt-6 border-t">
        <h2 className="text-2xl font-bold mb-3">Understanding Liquidated Damages in Contracts</h2>
        <p className="mb-4">
          Liquidated damages clauses are contractual provisions that establish a predetermined amount of money 
          to be paid as damages for breach of contract, particularly for delays in project completion. These 
          provisions serve as a reasonable forecast of actual damages that might be difficult to calculate precisely. 
          Unlike penalties, which are designed to punish, liquidated damages aim to compensate the non-breaching 
          party for anticipated losses. Courts generally enforce liquidated damages provisions when they represent 
          a reasonable forecast of just compensation for the harm caused by the breach and when the actual damages 
          are difficult to ascertain at the time of contract formation.
        </p>
        
        <h2 className="text-2xl font-bold mb-3">Key Components of Liquidated Damages Calculations</h2>
        <p className="mb-4">
          The calculation of liquidated damages typically involves several key elements. First, the contract value 
          represents the total value of the agreement upon which the damages are based. Second, the daily rate 
          specifies the amount owed for each day of delay, usually expressed as a percentage of the contract value. 
          Third, the number of days delayed determines the duration of the breach. Additional factors may include 
          interest on overdue amounts, escalation clauses that increase the daily rate over time, and maximum caps 
          that limit total liability. Understanding how these elements interact is crucial for both parties drafting 
          and enforcing contractual agreements.
        </p>
        
        <h2 className="text-2xl font-bold mb-3">Practical Applications and Considerations</h2>
        <p className="mb-4">
          In practice, liquidated damages calculators help contractors, owners, and legal professionals estimate 
          potential liabilities and make informed decisions during project negotiations and disputes. The calculator 
          accounts for various scenarios including simple or compound interest calculations, daily rate escalations, 
          and liability caps. Users should consider jurisdictional differences in how courts interpret liquidated 
          damages clauses, as some regions may scrutinize these provisions more closely than others. Proper 
          documentation of delay notices and careful tracking of project timelines are essential for enforcing or 
          contesting liquidated damages claims effectively.
        </p>
      </section>
    </div>
  );
};

export default LiquidatedDamagesCalculator;