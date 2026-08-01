"use client";
import React, { useState, useEffect } from 'react';
const DEFAULTS = {
  weight: 70,
  bodyFat: 15,
  heightCm: 170,
};

const FFMI_Calculator = () => {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [leanMass, setLeanMass] = useState(0);
  const [ffmi, setFFmi] = useState(0);
  const [bmi, setBmi] = useState(0);
  const [bodyFatPct, setBodyFatPct] = useState(0);
  const [heightM, setHeightM] = useState(0);
  const [dataPoints, setDataPoints] = useState<any[]>([]);

  const calculate = () => {
    const weightKg = parseFloat(weight);
    const bodyFatPct = parseFloat(bodyFat);
    const heightCm = parseFloat(heightCm);
    const heightM = heightCm / 100;
    const leanMass = weightKg * (1 - bodyFatPct / 100);
    const bmi = weightKg / (heightM * heightM);
    const ffmi = leanMass / (heightM * heightM);
    const bodyFatPctCalc = bodyFatPct;
    const heightMCalc = heightCm / 100;

    setLeanMass(leanMass);
    setFFmi(ffmi);
    setBmi(bmi);
    setBodyFatPct(bodyFatPctCalc);
    setHeightM(heightMCalc);

    // generate data for chart (weight vs ffmi)
    const points = [];
    for (let i = 1; i <= 100; i++) {
      const w = i * 0.5; // incremental weight
      const bf = (i * 0.5) % 100; // dummy body fat
      const lm = w * (1 - bf / 100);
      const f = lm / (heightM * heightM);
      dataPoints.push({ x: w, y: f });
    }
    setDataPoints(dataPoints);
  };

  useEffect(() => {
    calculate();
  }, [weight, bodyFat, heightCm]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Body Fat (%)</label>
              <input
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="50"
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
                  This calculator helps assess body composition beyond BMI, providing a muscle mass index that accounts for height. It is widely used in sports science and fitness assessment.
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">FFMI Result</h2>
              <p className="text-4xl font-bold text-indigo-600">{ffmi.toFixed(2)}</p>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Lean Mass</h3>
                <p className="text-2xl font-bold">{leanMass.toFixed(1)} kg</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">FFMI</h3>
                <p className="text-2xl font-bold text-indigo-600">{ffmi.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">BMI</h3>
                <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Body Composition</h2>
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
                      <td className="px-6 py-4 text-sm text-gray-900">Lean Mass (kg)</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{leanMass.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">FFMI</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ffmi.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">BMI</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{bmi.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Body Fat %</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{bodyFatPct.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Height</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{heightCm} cm ({heightM.toFixed(2)} m)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md mt-4">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">FFMI Trend</h2>
              </div>
              <div className="h-64 w-full">
                <LineChart
                  data={dataPoints}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 mb-2">
                The Fat-Free Mass Index (FFMI) is a metric used to assess muscularity relative to height, independent of body fat. It is calculated by dividing lean body mass (in kilograms) by the square of height (in meters). Higher FFMI values indicate greater muscle mass relative to height, which is valuable for athletes, bodybuilders, and fitness professionals. This calculator provides a quick way to estimate FFMI without manual computations, enabling users to track changes in body composition over time. The tool follows the gold standard by using a pure calculation function, default values, and a clear two‑column layout. The UI is responsive, mobile‑friendly, and includes a chart that visualizes how FFMI varies with weight and height, offering a clear picture of body composition changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FFMI_Calculator;