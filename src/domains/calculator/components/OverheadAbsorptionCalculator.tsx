"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pure calculation function with zero React dependencies
export function calculateOverheadAbsorption(inputs: OverheadAbsorptionInputs): OverheadAbsorptionResult {
  // Handle invalid inputs gracefully
  const totalOverhead = Number(inputs.totalOverhead) || 0;
  const allocationBase = Number(inputs.allocationBase) || 0;
  const actualOverhead = Number(inputs.actualOverhead) || 0;
  const actualBase = Number(inputs.actualBase) || 0;

  // Prevent division by zero
  const overheadRate = allocationBase !== 0 ? totalOverhead / allocationBase : 0;
  const appliedOverhead = overheadRate * actualBase;
  const underOverAbsorption = actualOverhead - appliedOverhead;
  const overheadPercentage = actualOverhead !== 0 ? (appliedOverhead / actualOverhead) * 100 : 0;

  return {
    overheadRate,
    appliedOverhead,
    underOverAbsorption,
    overheadPercentage,
    // Additional calculated values for breakdown
    totalOverhead,
    allocationBase,
    actualOverhead,
    actualBase,
  };
}

// Inputs interface
interface OverheadAbsorptionInputs {
  totalOverhead: string | number;
  allocationBase: string | number;
  actualOverhead: string | number;
  actualBase: string | number;
  // Advanced options
  rent: string | number;
  utilities: string | number;
  supervisorSalaries: string | number;
  machineHours: string | number;
  laborHours: string | number;
}

// Results interface
interface OverheadAbsorptionResult {
  overheadRate: number;
  appliedOverhead: number;
  underOverAbsorption: number;
  overheadPercentage: number;
  totalOverhead: number;
  allocationBase: number;
  actualOverhead: number;
  actualBase: number;
}

// Default values
const DEFAULTS: OverheadAbsorptionInputs = {
  totalOverhead: 100000,
  allocationBase: 500000,
  actualOverhead: 95000,
  actualBase: 480000,
  rent: 2000,
  utilities: 500,
  supervisorSalaries: 4000,
  machineHours: 10000,
  laborHours: 20000,
};

// Component
export const OverheadAbsorptionCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<OverheadAbsorptionInputs>(DEFAULTS);
  const [result, setResult] = useState<OverheadAbsorptionResult>(() => calculateOverheadAbsorption(DEFAULTS));

  // Recalculate when inputs change
  useEffect(() => {
    setResult(calculateOverheadAbsorption(inputs));
  }, [inputs]);

  const handleCalculate = () => {
    setResult(calculateOverheadAbsorption(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateOverheadAbsorption(DEFAULTS));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 gap-8">
      <h1 className="text-3xl font-bold mb-6">Overhead Absorption Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs and Controls */}
        <div className="space-y-6">
          {/* Normal Tier Inputs */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-3">Normal Tier</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Overhead ($)</label>
                <input
                  type="number"
                  value={inputs.totalOverhead}
                  onChange={(e) => setInputs({ ...inputs, totalOverhead: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allocation Base ($)</label>
                <input
                  type="number"
                  value={inputs.allocationBase}
                  onChange={(e) => setInputs({ ...inputs, allocationBase: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Actual Overhead ($)</label>
                <input
                  type="number"
                  value={inputs.actualOverhead}
                  onChange={(e) => setInputs({ ...inputs, actualOverhead: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Actual Base ($)</label>
                <input
                  type="number"
                  value={inputs.actualBase}
                  onChange={(e) => setInputs({ ...inputs, actualBase: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-3">Advanced Options</h2>
            <div className="space-y-4">
              {/* Overhead Components */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Overhead Components</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rent ($/mo)</label>
                    <input
                      type="number"
                      value={inputs.rent}
                      onChange={(e) => setInputs({ ...inputs, rent: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formula</label>
                    <p className="text-sm text-gray-500">monthly expense</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Utilities ($/mo)</label>
                    <input
                      type="number"
                      value={inputs.utilities}
                      onChange={(e) => setInputs({ ...inputs, utilities: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formula</label>
                    <p className="text-sm text-gray-500">monthly expense</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Supervisor Salaries ($/mo)</label>
                    <input
                      type="number"
                      value={inputs.supervisorSalaries}
                      onChange={(e) => setInputs({ ...inputs, supervisorSalaries: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formula</label>
                    <p className="text-sm text-gray-500">monthly expense</p>
                  </div>
                </div>
              </div>

              {/* Allocation Base */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Allocation Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Machine Hours</label>
                    <input
                      type="number"
                      value={inputs.machineHours}
                      onChange={(e) => setInputs({ ...inputs, machineHours: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formula</label>
                    <p className="text-sm text-gray-500">hours of machine operation</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Labor Hours</label>
                    <input
                      type="number"
                      value={inputs.laborHours}
                      onChange={(e) => setInputs({ ...inputs, laborHours: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formula</label>
                    <p className="text-sm text-gray-500">hours of direct labor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleCalculate}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Primary Result Card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Primary Result</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Overhead Rate</span>
                <span className="font-medium">{result.overheadRate.toFixed(4)} per allocation base unit</span>
              </div>
              <div className="flex justify-between">
                <span>Applied Overhead</span>
                <span className="font-medium">${result.appliedOverhead.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Under/Over Absorption</span>
                <span className="font-medium">{result.underOverAbsorption >= 0 ? '+' : ''}${result.underOverAbsorption.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead Percentage</span>
                <span className="font-medium">{result.overheadPercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* 3-Stat Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 border rounded-lg p-4 text-center">
              <h4 className="font-semibold mb-2">Total Overhead</h4>
              <p className="text-2xl">${result.totalOverhead.toLocaleString()}</p>
            </div>
            <div className="flex-1 border rounded-lg p-4 text-center">
              <h4 className="font-semibold mb-2">Allocation Base</h4>
              <p className="text-2xl">{result.allocationBase.toLocaleString()}</p>
            </div>
            <div className="flex-1 border rounded-lg p-4 text-center">
              <h4 className="font-semibold mb-2">Actual Overhead</h4>
              <p className="text-2xl">${result.actualOverhead.toLocaleString()}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Component</th>
                    <th className="text-left p-3">Monthly Amount ($)</th>
                    <th className="text-left p-3">Annual Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">Rent</td>
                    <td className="p-3">${inputs.rent}</td>
                    <td className="p-3">${(Number(inputs.rent) * 12).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Utilities</td>
                    <td className="p-3">${inputs.utilities}</td>
                    <td className="p-3">${(Number(inputs.utilities) * 12).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Supervisor Salaries</td>
                    <td className="p-3">${inputs.supervisorSalaries}</td>
                    <td className="p-3">${(Number(inputs.supervisorSalaries) * 12).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Total Overhead Components</td>
                    <td className="p-3 font-medium">${(Number(inputs.rent) + Number(inputs.utilities) + Number(inputs.supervisorSalaries)).toLocaleString()}</td>
                    <td className="p-3 font-medium">${((Number(inputs.rent) + Number(inputs.utilities) + Number(inputs.supervisorSalaries)) * 12).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Overhead Allocation Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Estimated Overhead', value: result.totalOverhead },
                { name: 'Applied Overhead', value: result.appliedOverhead },
                { name: 'Actual Overhead', value: result.actualOverhead },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
                <Bar dataKey="value" fill="#82ca9d" />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Summary Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Estimated Overhead Rate</span>
                <span>{result.overheadRate.toFixed(4)} per $1 of allocation base</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead Absorption Efficiency</span>
                <span className={result.overheadPercentage >= 100 ? 'text-green-600' : 'text-red-600'}>
                  {result.overheadPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Absorption Status</span>
                <span className={result.underOverAbsorption >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {result.underOverAbsorption >= 0 ? 'Overabsorbed' : 'Underabsorbed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Overhead Components Total</span>
                <span>${(Number(inputs.rent) + Number(inputs.utilities) + Number(inputs.supervisorSalaries)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 text-sm text-gray-600">
        <section>
          <h3 className="font-semibold mb-2">Understanding Overhead Absorption in Cost Accounting</h3>
          <p>Overhead absorption is a critical concept in managerial accounting that helps businesses allocate indirect costs to products or services. This calculator demonstrates the predetermined overhead rate method, which is essential for accurate product pricing and profitability analysis. By estimating overhead costs and allocation base at the beginning of an accounting period, companies can apply overhead consistently throughout the period, facilitating better cost control and decision-making.</p>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Key Formulas and Calculations Explained</h3>
          <p>The calculator uses four fundamental formulas: Predetermined Overhead Rate = Estimated Total Overhead / Estimated Total Allocation Base; Applied Overhead = Predetermined Rate × Actual Allocation Base; Under/Over Absorption = Actual Overhead - Applied Overhead; and Overhead Percentage = (Applied Overhead / Actual Overhead) × 100. These calculations help businesses understand whether they have under-absorbed (insufficient overhead applied) or over-absorbed (excess overhead applied) during a period, prompting investigation into cost variances and efficiency improvements.</p>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Practical Applications for Business Management</h3>
          <p>Overhead absorption calculations are vital for product costing, inventory valuation, and pricing strategies. Manufacturing companies use these metrics to determine the full cost of production, while service providers apply them to understand the true cost of delivering services. The advanced options in this calculator allow users to break down overhead components (rent, utilities, supervisor salaries) and allocation bases (machine hours, labor hours), providing granular insights for activity-based costing approaches and helping identify which cost drivers most significantly impact overhead absorption.</p>
        </section>
      </div>
    </div>
  );
};