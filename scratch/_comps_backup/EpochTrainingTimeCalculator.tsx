"use client";
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EpochTrainingTimeCalculator: React.FC = () => {
  const [goalDate, setGoalDate] = useState('2025-01-01');
  const [currentDate, setCurrentDate] = useState('2024-01-01');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(4);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60);
  const [weeksRemaining, setWeeksRemaining] = useState<number | null>(null);
  const [sessionsRemaining, setSessionsRemaining] = useState<number | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [weeksProgress, setWeeksProgress] = useState<number[]>([]);
  const [totalHoursProgress, setTotalHoursProgress] = useState<number[]>([]);
  const [restDaysPerWeek, setRestDaysPerWeek] = useState(1);
  const [deloadWeeks, setDeloadWeeks] = useState(0);
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState<number | null>(null);
  const [targetGap, setTargetGap] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ week: number; hours: number }>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculate = () => {
    const goal = new Date(goalDate);
    const current = new Date(currentDate);
    const timeDiff = goal.getTime() - current.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const weeks = Math.max(1, Math.ceil(daysDiff / 7));

    const effectiveTrainingDays = Math.max(1, trainingDaysPerWeek - restDaysPerWeek);
    const baseSessions = weeks * effectiveTrainingDays;
    const baseHours = baseSessions * sessionDurationMinutes / 60;

    const deloadWeeksCount = Math.min(deloadWeeks, weeks);
    const deloadMultiplier = 1 - deloadWeeksCount * 0.2;
    const computedTotalHours = baseHours * deloadMultiplier;
    const weeklyHoursValue = effectiveTrainingDays * sessionDurationMinutes / 60;
    const targetValue = Number(targetHoursPerWeek) || 0;

    setWeeksRemaining(weeks);
    setSessionsRemaining(baseSessions);
    setTotalHours(computedTotalHours);
    setWeeklyHours(weeklyHoursValue);
    setTargetGap(targetValue > 0 ? weeklyHoursValue - targetValue : null);

    const weeksArray: number[] = [];
    const cumulativeHoursArray: number[] = [];
    let cumulativeHours = 0;
    for (let i = 1; i <= weeks; i++) {
      weeksArray.push(i);
      cumulativeHours += effectiveTrainingDays * sessionDurationMinutes / 60;
      cumulativeHoursArray.push(cumulativeHours);
    }

    setWeeksProgress(weeksArray);
    setTotalHoursProgress(cumulativeHoursArray);
    setChartData(weeksArray.map((week, i) => ({ week, hours: cumulativeHoursArray[i] })));
  };

  useEffect(() => {
    calculate();
  }, []);

  return (
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Epoch Training Time Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* Left Column - Inputs */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
          <div className="input-group">
            <label className="block text-sm font-medium text-gray-700">Goal Date (YYYY-MM-DD)</label>
            <input 
              type="date" 
              value={goalDate} 
              onChange={(e) => setGoalDate(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2024-01-01"
            />
          </div>
          
          <div className="input-group">
            <label className="block text-sm font-medium text-gray-700">Current Date (YYYY-MM-DD)</label>
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2024-01-01"
            />
          </div>
          
          <div className="input-group">
            <label className="block text-sm font-medium text-gray-700">Training Days per Week</label>
            <input 
              type="number" 
              min="1" 
              max="7" 
              value={trainingDaysPerWeek} 
              onChange={(e) => setTrainingDaysPerWeek(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="input-group">
            <label className="block text-sm font-medium text-gray-700">Session Duration (minutes)</label>
            <input 
              type="number" 
              min="1" 
              value={sessionDurationMinutes} 
              onChange={(e) => setSessionDurationMinutes(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="input-group">
            <label className="block text-sm font-medium text-gray-700">Rest Days per Week</label>
            <input 
              type="number" 
              min="0" 
              max="6" 
              value={restDaysPerWeek} 
              onChange={(e) => setRestDaysPerWeek(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          </div>
          
          <div className="flex items-center mt-1">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>
          
          {showAdvanced && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Deload Settings</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deload Weeks</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={deloadWeeks} 
                      onChange={(e) => setDeloadWeeks(Number(e.target.value))} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Volume Targets</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Hours per Week</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.1" 
                      value={targetHoursPerWeek} 
                      onChange={(e) => setTargetHoursPerWeek(Number(e.target.value))} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
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
        <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
          {/* Primary Results */}
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <h2 className="text-base font-bold mb-3 text-foreground">Training Timeline Summary</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-muted-foreground">Remaining Time:</span>
              <span className="text-2xl font-bold text-primary">{weeksRemaining !== null ? weeksRemaining.toFixed(0) + ' weeks' : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-muted-foreground">Sessions:</span>
              <span className="text-2xl font-bold text-primary">{sessionsRemaining !== null ? sessionsRemaining.toFixed(0) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-muted-foreground">Total Hours:</span>
              <span className="text-2xl font-bold text-primary">{totalHours !== null ? totalHours.toFixed(2) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-muted-foreground">Weekly Hours:</span>
              <span className="text-2xl font-bold text-primary">{weeklyHours !== null ? weeklyHours.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-muted-foreground">vs Target:</span>
              <span className="text-2xl font-bold text-primary">{targetGap !== null ? (targetGap >= 0 ? '+' : '') + targetGap.toFixed(1) + ' hrs' : 'N/A'}</span>
            </div>
          </div>
          
          {/* Progress Visualization */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold mb-0">Training Progress Visualization</h2>
            </div>
            <div className="h-64 w-full p-4">
              {weeksRemaining !== null && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="#8450E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Detailed Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Detailed Breakdown</h2>
            <div className="overflow-x-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cumul. Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weeksRemaining !== null && weeksProgress.length > 0 && (
                    weeksProgress.map((week, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{week}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{totalHoursProgress[index].toFixed(1)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Training Recommendations</h2>
            <p className="text-gray-700 mb-2">
              Maintain consistent training frequency to build endurance. Consider incorporating rest days and deload weeks to prevent overtraining. 
              Gradually increase session duration as your fitness improves.
            </p>
            <p className="text-gray-700">
              Remember that consistency is more important than intensity for long-term success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpochTrainingTimeCalculator;