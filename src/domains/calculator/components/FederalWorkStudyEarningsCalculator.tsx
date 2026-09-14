"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const DEFAULTS = {
  hourlyRate: 15,
  hoursWorked: 40,
  weeks: 12,
};

const FederalWorkStudyEarningsCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [hoursWorked, setHoursWorked] = useState(DEFAULTS.hoursWorked);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [hourlyRateDisplayed, setHourlyRateDisplayed] = useState(0);
  const [hoursWorkedDisplayed, setHoursWorkedDisplayed] = useState(0);
  const [weeksDisplayed, setWeeksDisplayed] = useState(0);
  const [effectiveRate, setEffectiveRate] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const calculate = () => {
    const rate = Number(hourlyRate);
    const hours = Number(hoursWorked);
    const weeksCount = Number(weeks);
    const earnings = rate * hours * weeksCount;

    setTotalEarnings(earnings);
    setHourlyRateDisplayed(rate);
    setHoursWorkedDisplayed(hours);
    setWeeksDisplayed(weeksCount);
    setEffectiveRate(rate);

    // Build chart data
    const data = [];
    for (let w = 1; w <= weeksCount; w++) {
      data.push({ week: w, earnings: rate * hours * w });
    }
    setChartData(data);
  };

  useEffect(() => {
    calculate();
  }, []);

  return (
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Federal Work-Study Earnings Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* Left Column - Inputs */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Hours Worked</label>
              <input
                type="number"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Weeks</label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
          <button
            onClick={calculate}
            className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Calculate
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {/* Primary Result Card */}  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Earnings</div>
  <p className="text-4xl font-bold text-primary">${totalEarnings.toLocaleString()}</p>
  </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="text-gray-600 mb-2">Hourly Rate</h3>
                <p className="text-2xl font-bold">${hourlyRateDisplayed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Hours Worked</h3>
                <p className="text-2xl font-bold">{hoursWorkedDisplayed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Weeks</h3>
                <p className="text-2xl font-bold">{weeksDisplayed}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
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
                      <td className="px-6 py-4 text-sm text-gray-900">Total Earnings</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${totalEarnings.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Hourly Rate</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${hourlyRateDisplayed}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Hours Worked</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{hoursWorkedDisplayed}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Weeks</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{weeksDisplayed}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Effective Rate</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${effectiveRate}/hr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md mt-4">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Earnings Trend</h2>
              </div>
              <div className="h-64 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SEO Content */}
            <div className="mt-8 pt-4 border-t">
              <p className="text-sm text-gray-600">
                The Federal Work-Study Earnings Calculator is a specialized tool for students participating in work-study programs to estimate their total earnings based on hourly wage, hours worked, and duration of employment.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default FederalWorkStudyEarningsCalculator;