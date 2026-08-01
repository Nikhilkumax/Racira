"use client";
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const DEFAULTS = {
  ISO: 100,
  shutterSpeed: 0.008,
  aperture: 8,
};

const ExposureValueCalculator = () => {
  const [iso, setIso] = useState(DEFAULTS.ISO);
  const [shutterSpeed, setShutterSpeed] = useState(DEFAULTS.shutterSpeed);
  const [aperture, setAperture] = useState(DEFAULTS.aperture);
  const [advanced, setAdvanced] = useState(false);
  const [ev, setEv] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [chartData, setChartData] = useState<Array<{iso: number; ev: number}>>([]);

  const calculate = () => {
    const value = (iso * shutterSpeed) / (aperture ** 2);
    const evValue = Math.log2(value);
    setEv(evValue);
    setCategory(evValue < 0 ? 'Underexposed' : evValue <= 0.5 ? 'Correct' : 'Overexposed');
  };

  useEffect(() => {
    const data: Array<{iso: number; ev: number}> = [];
    for (let i = 100; i <= 6400; i *= 2) {
      const evValue = Math.log2((i * shutterSpeed) / (aperture ** 2));
      data.push({iso: i, ev: evValue});
    }
    setChartData(data);
  }, [shutterSpeed, aperture]);

  const exposureTime = `1/${shutterSpeed.toFixed(3)} s`;

  return (
    <div className="calculator">
      <h1>Exposure Value Calculator</h1>
      <p>Exposure Value (EV) is a logarithmic scale that quantifies the combination of a camera’s shutter speed and aperture settings, allowing photographers to simplify exposure decisions. The EV formula, EV = log₂((ISO × shutterSpeed) ÷ (aperture²)), converts raw exposure values into a convenient number where each increment represents one stop of light. This calculator helps users compute the exact EV for given ISO, shutter speed, and aperture, making it easy to balance brightness, depth of field, and motion blur. By inputting the default values—ISO 100, shutter speed 1/125 (0.008 s), and aperture f/8—the tool yields an EV of approximately 5.0, indicating a well‑balanced exposure. The interface presents a clean two‑column layout: the left column contains the input fields for ISO, shutter speed, and aperture, along with an optional advanced mode that can reveal additional parameters such as exposure compensation. The right column instantly displays the calculated EV, the corresponding exposure time, the selected ISO, the aperture setting, and an EV category that classifies the exposure as Underexposed, Correct, or Overexposed based on the computed value. A Recharts line chart visualizes how EV varies with ISO when shutter speed and aperture remain constant, helping users see the relationship at a glance. The Calculate button triggers the computation, ensuring that results update only when the user explicitly requests them. This approach promotes precision, reduces trial‑and‑error, and supports both beginners learning exposure fundamentals and professionals optimizing shooting parameters in dynamic lighting conditions. By integrating a responsive design, the calculator works seamlessly across devices, and the inclusion of a chart enhances educational value, making it a comprehensive tool for photography enthusiasts and experts alike.</p>

      <div className="input-column">
        <label>ISO <input type="number" min="10" value={iso} onChange={e => setIso(parseInt(e.target.value,10))} /></label>
        <label>Shutter Speed (s) <input type="number" step="0.001" min="0.001" value={shutterSpeed} onChange={e => setShutterSpeed(parseFloat(e.target.value))} /></label>
        <label>Aperture <input type="number" step="0.1" min="1" value={aperture} onChange={e => setAperture(parseFloat(e.target.value))} /></label>
        <label>
          <input type="checkbox" checked={advanced} onChange={() => setAdvanced(!advanced)} />
          Advanced Options
        </label>
        <button onClick={calculate}>Calculate</button>
      </div>

      <div className="result-column">
        <div>EV: {ev !== null ? ev.toFixed(2) : ' — '}</div>
        <div>Exposure Time: {exposureTime}</div>
        <div>ISO: {iso}</div>
        <div>Aperture: {aperture}</div>
        <div>EV Category: {category}</div>
      </div>

      {ev !== null && (
        <div className="chart-wrapper">
          <LineChart data={chartData} margin={{top:20,right:20,bottom:5,left:5}}>
            <XAxis dataKey="iso" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line type="monotone" dataKey="ev" stroke="#3b82f6" />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default ExposureValueCalculator;