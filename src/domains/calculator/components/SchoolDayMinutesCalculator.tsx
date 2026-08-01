"use client";
import React, { useState } from 'react';

const SchoolDayMinutesCalculator: React.FC = () => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('15:00');
  const [lunchMinutes, setLunchMinutes] = useState(60);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [numBreaks, setNumBreaks] = useState(2);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateMinutes = () => {
    setError(null);
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid time format');
      return;
    }
    let diffMs = end.getTime() - start.getTime();
    // If end time is earlier than start time, assume next day? For school day, end should be after start.
    if (diffMs < 0) {
      // Add 24 hours
      diffMs += 24 * 60 * 60 * 1000;
    }
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const totalBreakMinutes = breakMinutes * numBreaks;
    const resultMinutes = diffMinutes - lunchMinutes - totalBreakMinutes;
    if (resultMinutes < 0) {
      setError('Calculated time is negative; check inputs');
      return;
    }
    setResult(resultMinutes);
  };

  return (
    <div>
      <h1>School Day Minutes Calculator</h1>
      <div>
        <label>
          Start Time:
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          End Time:
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Lunch Duration (minutes):
          <input type="number" value={lunchMinutes} onChange={(e) => setLunchMinutes(parseInt(e.target.value) || 0)} min={0} />
        </label>
      </div>
      <div>
        <label>
          Break Duration (minutes):
          <input type="number" value={breakMinutes} onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)} min={0} />
        </label>
      </div>
      <div>
        <label>
          Number of Breaks:
          <input type="number" value={numBreaks} onChange={(e) => setNumBreaks(parseInt(e.target.value) || 0)} min={0} />
        </label>
      </div>
      <button onClick={calculateMinutes}>Calculate</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result !== null && (
        <p>
          Total instructional minutes: <strong>{result}</strong> minutes ({Math.floor(result / 60)} hours {result % 60} minutes)
        </p>
      )}
    </div>
  );
};

export default SchoolDayMinutesCalculator;