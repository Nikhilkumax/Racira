"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import PopularCalculators from "@/components/PopularCalculators";

const DEFAULTS = {
  output: 1000,
  laborHours: 50,
  costPerHour: 10,
  efficiencyFactor: 1.0,
};

const staticChartData = [
  { week: 1, output: 1000, laborHours: 50, cost: 500 },
  { week: 2, output: 1500, laborHours: 75, cost: 750 },
  { week: 3, output: 2000, laborHours: 100, cost: 1000 },
  { week: 4, output: 2500, laborHours: 125, cost: 1250 },
  { week: 5, output: 3000, laborHours: 150, cost: 1500 },
];

const TotalFactorProductivityCalculator = () => {
  const [output, setOutput] = useState(DEFAULTS.output);
  const [laborHours, setLaborHours] = useState(DEFAULTS.laborHours);
  const [costPerHour, setCostPerHour] = useState(DEFAULTS.costPerHour);
  const [efficiencyFactor, setEfficiencyFactor] = useState(DEFAULTS.efficiencyFactor);
  const [result, setResult] = useState(0);
  const [efficiencyPercent, setEfficiencyPercent] = useState(0);

  const calculate = () => {
    const out = Number(output);
    const hours = Number(laborHours);
    const cost = Number(costPerHour);
    const ef = Number(efficiencyFactor);
    const productivity = hours > 0 ? (out / hours) * ef : 0;
    const computedEfficiencyPercent = (hours * cost) > 0 ? (out / (hours * cost)) * 100 : 0;

    setResult(productivity);
    setEfficiencyPercent(computedEfficiencyPercent);
  };

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Factor Productivity Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Output</label>
              <input
                type="number"
                value={output}
                onChange={(e) => setOutput(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Labor Hours</label>
              <input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Cost per Hour ($)</label>
              <input
                type="number"
                value={costPerHour}
                onChange={(e) => setCostPerHour(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Efficiency Factor</label>
              <input
                type="number"
                value={efficiencyFactor}
                onChange={(e) => setEfficiencyFactor(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
                step="0.01"
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
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Productivity</div>
              <p className="text-4xl font-bold text-primary">{result.toFixed(2)} units/hr</p>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-600 mb-2">Productivity</h3>
                <p className="text-2xl font-bold">{result.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Output per Hour</h3>
                <p className="text-2xl font-bold">{result.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Labor Cost</h3>
                <p className="text-2xl font-bold">${(laborHours * costPerHour).toLocaleString()}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Detailed Metrics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Productivity</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{result.toFixed(2)} units/hr</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Output per Hour</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{result.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Labor Cost</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(laborHours * costPerHour).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Efficiency %</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{efficiencyPercent.toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Total Cost</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(laborHours * costPerHour).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md mt-4">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Productivity Trend</h2>
              </div>
              <div className="h-64 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={staticChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="output" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <p className="text-gray-700">
                The Total Factor Productivity Calculator evaluates productivity metrics based on output, labor hours, cost per hour, and efficiency factor.
                Current productivity: {result.toFixed(2)} units/hr with a labor cost of ${(laborHours * costPerHour).toLocaleString()}.
              </p>
            </div>
          </div>
        </div>

      <div className="max-w-[1180px]">
        <PopularCalculators exclude="/calculator/total-factor-productivity-calculator" />
      </div>
    </div>
  );
};

export default TotalFactorProductivityCalculator;