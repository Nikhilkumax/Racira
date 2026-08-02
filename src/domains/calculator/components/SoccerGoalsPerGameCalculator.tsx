"use client";
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const DEFAULTS = {
  totalGoals: 20,
  gamesPlayed: 10,
};

interface TrendPoint {
  day: number;
  goals: number;
}

interface Results {
  goalsPerGame: number;
  totalGoals: number;
  gamesPlayed: number;
  averageGoalsPerGame: number;
  trendData: TrendPoint[];
}

const SoccerGoalsPerGameCalculator = () => {
  const [totalGoals, setTotalGoals] = useState(DEFAULTS.totalGoals);
  const [gamesPlayed, setGamesPlayed] = useState(DEFAULTS.gamesPlayed);
  const [results, setResults] = useState<Results>({
    goalsPerGame: 0,
    totalGoals: DEFAULTS.totalGoals,
    gamesPlayed: DEFAULTS.gamesPlayed,
    averageGoalsPerGame: 0,
    trendData: [],
  });

  const calculate = () => {
    const goalsPerGame = gamesPlayed > 0 ? totalGoals / gamesPlayed : 0;
    const trendData: TrendPoint[] = Array.from({ length: gamesPlayed }, (_, i) => ({
      day: i + 1,
      goals: parseFloat((totalGoals * (i + 1) / gamesPlayed).toFixed(2)),
    }));
    setResults({
      goalsPerGame,
      totalGoals,
      gamesPlayed,
      averageGoalsPerGame: goalsPerGame,
      trendData,
    });
  };

  useEffect(() => {
    if (totalGoals && gamesPlayed) {
      calculate();
    }
  }, [totalGoals, gamesPlayed]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Soccer Goals Per Game Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4 border rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium mb-1">Total Goals</label>
            <input
              type="number"
              value={totalGoals}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalGoals(Number(e.target.value))}
              min={0}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Games Played</label>
            <input
              type="number"
              value={gamesPlayed}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGamesPlayed(Number(e.target.value))}
              min={1}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calculate
          </button>
        </div>

        {/* Results */}
        <div className="space-y-3 border rounded-lg p-4">
          <h2 className="text-lg font-semibold">Results</h2>
          <div>
            <p className="font-bold">Goals Per Game</p>
            <p>{results.goalsPerGame.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-bold">Total Goals</p>
            <p>{results.totalGoals}</p>
          </div>
          <div>
            <p className="font-bold">Games Played</p>
            <p>{results.gamesPlayed}</p>
          </div>
          <div>
            <p className="font-bold">Average Goals Per Game</p>
            <p>{results.averageGoalsPerGame.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Goals Per Game Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="goals" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SoccerGoalsPerGameCalculator;