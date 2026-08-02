"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const DEFAULTS = {
  pingCount: 10,
  avgPing: 50,
  minPing: 10,
  maxPing: 200,
};

const PingTimeCalculator = () => {
  const [pingCount, setPingCount] = useState(DEFAULTS.pingCount);
  const [avgPing, setAvgPing] = useState(DEFAULTS.avgPing);
  const [minPing, setMinPing] = useState(DEFAULTS.minPing);
  const [maxPing, setMaxPing] = useState(DEFAULTS.maxPing);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [effectiveRate, setEffectiveRate] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const calculate = () => {
    const count = pingCount;
    const avg = avgPing;
    const min = minPing;
    const max = maxPing;
    const total = count * avg;
    const effectiveRate = count / (total / 3600 / 24 / 3600); // pings per hour
    setTotalTime(total);
    setEffectiveRate(effectiveRate);
    // generate chart data for ping over time (simulate)
    const data = [];
    for (let i = 1; i <= count; i++) {
      const value = min + Math.random() * (max - min);
      data.push({ x: i, y: value });
    }
    setChartData(data);
  };

  useEffect(() => {
    calculate();
  }, [pingCount, avgPing, minPing, maxPing]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Number of Packets</label>
              <input
                type="number"
                value={pingCount}
                onChange={(e) => setPingCount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Average Ping (ms)</label>
              <input
                type="number"
                value={avgPing}
                onChange={(e) => setAvgPing(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Min Ping (ms)</label>
              <input
                type="number"
                value={minPing}
                onChange={(e) => setMinPing(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Max Ping (ms)</label>
              <input
                type="number"
                value={maxPing}
                onChange={(e) => setMaxPing(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
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
                  Advanced options let you model network variability, set realistic min/max ranges, and analyze latency trends for performance tuning.
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
              <h2 className="text-xl font-bold mb-4">Ping Time Summary</h2>
              <p className="text-4xl font-bold text-indigo-600">{totalTime.toFixed(0)} ms</p>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Average Ping</h3>
                <p className="text-2xl font-bold text-indigo-600">{avgPing.toFixed(1)} ms</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Total Time (ms)</h3>
                <p className="text-2xl font-bold">{totalTime.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Effective Rate</h3>
                <p className="text-2xl font-bold">{effectiveRate.toFixed(2)} pings/hour</p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="flex justify-between">
              <p className="font-semibold">Min Ping:</p>
              <p className="text-xl font-bold">{minPing}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-semibold">Max Ping:</p>
              <p className="text-xl font-bold">{maxPing}</p>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md mt-4">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Ping Variability</h2>
              </div>
              <div className="h-96 w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="y" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <p className="text-gray-700">
                The Ping Time Calculator provides a quick way to assess network latency performance. By entering the number of packets sent and the average round-trip time, you can instantly see the total latency experienced, the effective transmission rate, and the variability across measurements. This information is crucial for network administrators, developers, and IT professionals who need to monitor and improve network performance, troubleshoot latency spikes, and ensure reliable communication for applications such as video conferencing, online gaming, and real-time data transfer. The visual chart helps identify trends and outliers, enabling proactive optimization and more accurate capacity planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingTimeCalculator;