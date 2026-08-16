"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  }, [output, laborHours, costPerHour, efficiencyFactor]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
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
                <h2 className="text-lg font-semibold mb-3">Advanced Options</h2>
                <p className="text-sm text-gray-600">
                  Advanced options allow you to adjust output, labor hours, cost per hour, and efficiency factor to model different productivity scenarios.
                </p>
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
      </div>
    </div>
  );
};

export default TotalFactorProductivityCalculator;