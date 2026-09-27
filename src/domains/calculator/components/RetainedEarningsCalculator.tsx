"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import PopularCalculators from "@/components/PopularCalculators";

const COLORS = ['#4361ee', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

const DEFAULTS = {
  beginningBalance: 10000,
  netIncome: 5000,
  dividends: 2000,
  otherAdjustments: 1000,
};

const RetainedEarningsCalculator = () => {
  const [beginningBalance, setBeginningBalance] = useState(DEFAULTS.beginningBalance);
  const [netIncome, setNetIncome] = useState(DEFAULTS.netIncome);
  const [dividends, setDividends] = useState(DEFAULTS.dividends);
  const [otherAdjustments, setOtherAdjustments] = useState(DEFAULTS.otherAdjustments);
  const [retainedEarnings, setRetainedEarnings] = useState(0);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);

  const calculate = () => {
    const total = beginningBalance + netIncome - dividends + otherAdjustments;
    setRetainedEarnings(total);
    const breakdown = [
      { label: 'Beginning Balance', value: beginningBalance },
      { label: 'Net Income', value: netIncome },
      { label: 'Other Adjustments', value: otherAdjustments },
    ].filter(item => item.value > 0);
    setBreakdownData(breakdown);
  };

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Retained Earnings Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Beginning Balance</label>
              <input
                type="number"
                value={beginningBalance}
                onChange={(e) => setBeginningBalance(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Net Income</label>
              <input
                type="number"
                value={netIncome}
                onChange={(e) => setNetIncome(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Dividends</label>
              <input
                type="number"
                value={dividends}
                onChange={(e) => setDividends(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Other Adjustments</label>
              <input
                type="number"
                value={otherAdjustments}
                onChange={(e) => setOtherAdjustments(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <button
              onClick={calculate}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Calculate
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Retained Earnings</div>
  <p className="text-4xl font-bold text-primary">${retainedEarnings.toLocaleString()}</p>
  </div>

            {/* 3‑Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-600 mb-2">Beginning Balance</h3>
                <p className="text-2xl font-bold">${beginningBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Net Income</h3>
                <p className="text-2xl font-bold">${netIncome.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Dividends</h3>
                <p className="text-2xl font-bold">${dividends.toLocaleString()}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Component Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Beginning Balance</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${beginningBalance.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Net Income</td>
                      <td className="px-6 py-4 text-sm text-gray-900">+${netIncome.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Dividends</td>
                      <td className="px-6 py-4 text-sm text-gray-900">-${dividends.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Other Adjustments</td>
                      <td className="px-6 py-4 text-sm text-gray-900">+${otherAdjustments.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-indigo-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">Retained Earnings</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">${retainedEarnings.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md mt-4">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Component Breakdown</h2>
              </div>
              <div className="h-80 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {breakdownData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <p className="text-gray-700">
                The Retained Earnings Calculator provides a clear, step‑by‑step view of how a company&apos;s equity evolves over time.
                Retained earnings = Beginning Balance + Net Income − Dividends + Other Adjustments = ${retainedEarnings.toLocaleString()}.
              </p>
            </div>
          </div>
        </div>

      <div className="max-w-[1180px]">
        <PopularCalculators exclude="/calculator/retained-earnings-calculator" />
      </div>
    </div>
  );
};

export default RetainedEarningsCalculator;