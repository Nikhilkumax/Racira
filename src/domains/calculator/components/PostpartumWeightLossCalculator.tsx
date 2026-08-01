"use client";
import React, { useState, useEffect } from 'react';
const DEFAULTS = {
  currentWeight: 180,
  goalWeight: 150,
  weeksPostpartum: 12,
  recommendedLossPerWeek: 1.5,
};

const PostpartumWeightLossCalculator = () => {
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [goalWeight, setGoalWeight] = useState(DEFAULTS.goalWeight);
  const [weeksPostpartum, setWeeksPostpartum] = useState(DEFAULTS.weeksPostpartum);
  const [recommendedLoss, setRecommendedLoss] = useState(DEFAULTS.recommendedLoss);
  const [weeklyLoss, setWeeklyLoss] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);
  const [weeksRemaining, setWeeksRemaining] = useState(0);

  const calculate = () => {
    const targetLoss = DEFAULTS.currentWeight - DEFAULTS.goalWeight;
    const weeksNeeded = Math.ceil(targetLoss / DEFAULTS.recommendedLoss);
    const weeksRemaining = Math.max(0, weeksPostpartum - weeksNeeded);
    const weeklyLoss = DEFAULTS.recommendedLoss;
    const totalLoss = targetLoss;

    setWeeklyLoss(weeklyLoss);
    setTotalLoss(totalLoss);
    setWeeksRemaining(weeksRemaining);
  };

  useEffect(() => {
    calculate();
  }, [currentWeight, goalWeight, weeksPostpartum, recommendedLoss]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Current Weight (lbs)</label>
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Goal Weight (lbs)</label>
              <input
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Weeks Postpartum</label>
              <input
                type="number"
                value={weeksPostpartum}
                onChange={(e) => setWeeksPostpartum(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Recommended Loss (lbs/week)</label>
              <input
                type="number"
                value={recommendedLoss}
                onChange={(e) => setRecommendedLoss(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.1"
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
                  Advanced options let you customize the postpartum weight loss plan, including adjusting the recommended rate, setting a custom goal weight, and tracking progress over time. This flexibility supports personalized postpartum care.
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
              <h2 className="text-xl font-bold mb-4">Weight Loss Summary</h2>
              <p className="text-4xl font-bold text-indigo-600">${currentWeight.toLocaleString()}</p>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Current Weight</h3>
                <p className="text-2xl font-bold">{currentWeight.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Goal Weight</h3>
                <p className="text-2xl font-bold">${goalWeight.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Weekly Loss</h3>
                <p className="text-2xl font-bold">${weeklyLoss.toFixed(1)} lbs</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Weight Loss Timeline</h2>
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
                      <td className="px-6 py-4 text-sm text-gray-900">Current Weight</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${currentWeight.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Goal Weight</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${goalWeight.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Recommended Loss</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${weeklyLoss.toFixed(1)} lbs/week</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Total Loss</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${totalLoss.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Weeks Remaining</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{weeksRemaining}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Weight Loss Trend</h2>
              </div>
              <div className="h-64 w-full overflow-x-auto">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="loss" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Guidance for Postpartum Weight Loss</h2>
              <p className="text-gray-700 mb-2">
                Healthy postpartum weight loss typically ranges from 0.5 to 1.5 pounds per week. Rapid weight loss can be unsafe and may lead to nutrient deficiencies. This calculator helps you set realistic expectations based on your current weight, goal weight, and the recommended safe rate of loss. By tracking weekly progress and staying consistent with nutrition and exercise, you can achieve sustainable results while protecting your health.
              </p>
              <p className="text-gray-700">
                Remember that individual results vary based on genetics, hormone levels, and lifestyle factors. Always consult a healthcare provider before starting any weight loss program, especially after childbirth. Consistent, gradual weight loss supports hormonal balance, breastfeeding success, and overall well‑being.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostpartumWeightLossCalculator;