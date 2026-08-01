"use client";
import React, { useState, useEffect } from 'react';
const DEFAULTS = {
  totalHours: 5,
  sessions: 5,
  breakMinutes: 15,
};

const ELearningSeatTimeCalculator = () => {
  const [totalHours, setTotalHours] = useState(DEFAULTS.totalHours);
  const [sessions, setSessions] = useState(DEFAULTS.sessions);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [effectiveHours, setEffectiveHours] = useState(0);
  const [effectiveMinutes, setEffectiveMinutes] = useState(0);
  const [avgSessionMinutes, setAvgSessionMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  const calculate = () => {
    const totalBreakMinutes = sessions * breakMinutes;
    const effectiveMinutesTotal = totalHours * 60 - totalBreakMinutes;
    const effectiveHours = effectiveMinutesTotal / 60;
    const avgSessionMinutes = effectiveMinutesTotal / sessions;
    setEffectiveHours(effectiveHours);
    setEffectiveMinutes(effectiveMinutesTotal);
    setAvgSessionMinutes(avgSessionMinutes);
    setTotalSessions(sessions);
  };

  useEffect(() => {
    calculate();
  }, [totalHours, sessions, breakMinutes]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Total Hours</label>
              <input
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Number of Sessions</label>
              <input
                type="number"
                value={sessions}
                onChange={(e) => setSessions(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Break Minutes per Session</label>
              <input
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
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
                  Advanced options allow you to model different session lengths and break frequencies to optimize learning efficiency.
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
              <h2 className="text-xl font-bold mb-4">Effective Learning Time</h2>
              <p className="text-4xl font-bold text-indigo-600">${effectiveHours.toFixed(2)} hours</p>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Effective Hours</h3>
                <p className="text-2xl font-bold">{effectiveHours.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Effective Minutes</h3>
                <p className="text-2xl font-bold">{effectiveMinutes.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <h3 className="font-medium text-gray-600 mb-2">Avg Session Minutes</h3>
                <p className="text-2xl font-bold">{avgSessionMinutes.toFixed(1)}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Session Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration (min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataPoints.map((point, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{point.session}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{point.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold mb-0">Learning Curve</h2>
              </div>
              <div className="h-64 w-full overflow-x-auto">
                <LineChart
                  data={dataPoints}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => value + ' min'} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="duration" stroke="#4361ee" strokeWidth={2} dot={false} />
                </LineChart>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <p className="text-gray-700">
                The E‑Learning Seat Time Calculator helps instructional designers and educators quantify the actual learning time
                students spend engaged with content, accounting for breaks and session structure. By analyzing effective hours
                and session length, educators can optimize course design, improve engagement, and ensure that learning objectives
                are met within realistic time frames. This tool supports evidence‑based instructional design and helps institutions
                allocate resources efficiently, ultimately enhancing student outcomes and satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ELearningSeatTimeCalculator;