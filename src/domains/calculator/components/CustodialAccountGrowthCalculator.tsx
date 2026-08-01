"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DEFAULTS = {
  initialContribution: 5000,
  monthlyContribution: 200,
  annualReturn: 7,
  years: 18,
};

const calculateFutureValue = (initial: number, monthly: number, annualReturn: number, years: number) => {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
  const fvMonthly = monthlyRate > 0
    ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : monthly * months;
  return futureValueInitial + fvMonthly;
};

const CustodialAccountGrowthCalculator = () => {
  const [initial, setInitial] = useState(DEFAULTS.initialContribution);
  const [monthly, setMonthly] = useState(DEFAULTS.monthlyContribution);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [years, setYears] = useState(DEFAULTS.years);
  const [result, setResult] = useState<number>(0);
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculate = () => {
    const fv = calculateFutureValue(initial, monthly, annualReturn, years);
    setResult(fv);
    const points = [];
    let balance = initial;
    const monthlyRate = annualReturn / 100 / 12;
    for (let y = 1; y <= years; y++) {
      for (let month = 0; month < 12; month++) {
        balance += monthly;
        balance *= 1 + monthlyRate;
      }
      points.push({ year: y, balance: Math.round(balance) });
    }
    setDataPoints(points);
  };

  useEffect(() => {
    calculate();
  }, [initial, monthly, annualReturn, years]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Initial Contribution ($)</label>
              <input
                type="number"
                value={initial}
                onChange={(e) => setInitial(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Monthly Contribution ($)</label>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Annual Return (%)</label>
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Investment Period (Years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
              />
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-3">Compounding Frequency</h2>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="frequency" value="monthly" defaultChecked className="mr-2" />
                    Monthly
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="frequency" value="quarterly" className="mr-2" />
                    Quarterly
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="frequency" value="annually" className="mr-2" />
                    Annually
                  </label>
                </div>
              </div>
            )}
            <button
              onClick={calculate}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Calculate
            </button>
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Primary Result Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Future Value</h2>
              <p className="text-4xl font-bold text-indigo-600">${result.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            
            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Total Contributions</h3>
                <p className="text-2xl font-bold">${(initial + years * monthly * 12).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Total Interest</h3>
                <p className="text-2xl font-bold">${Math.max(0, result - (initial + years * monthly * 12)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Years</h3>
                <p className="text-2xl font-bold">{years}</p>
              </div>
            </div>
            
            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Yearly Breakdown</h2>
              </div>
              <div className="overflow-x-auto max-h-60">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataPoints.map((point, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{point.year}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${point.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Growth Over Time</h2>
              </div>
              <div className="h-80 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPoints} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="balance" stroke="#4361ee" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <p className="text-gray-700">
                Custodial accounts like UGMA and UTMA provide a powerful way to save and invest for a child&apos;s future.
                Starting early maximizes the effect of compound interest, giving investments more time to grow.
                With an annual return of {annualReturn}% over {years} years, your ${initial.toLocaleString()} initial contribution
                plus ${monthly}/month grows to ${result.toLocaleString(undefined, { maximumFractionDigits: 0 })}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustodialAccountGrowthCalculator;