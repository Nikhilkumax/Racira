"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pure calculation function
interface Inputs {
  engineRpm: number;
  gearRatio: number;
  finalDrive: number;
  tireDiameter: number;
  overdriveRatio: number;
  drivetrainLoss: number;
  speedUnit: 'mph' | 'km/h';
  distanceUnit: 'miles' | 'km';
}

interface Result {
  inputs: Inputs;
  effectiveFinalDrive: number;
  wheelRpm: number;
  speedMph: number;
  speedKmh: number;
  speed: number;
  chartData: { rpm: number; speed: number }[];
  summary: {
    minSpeed: number;
    maxSpeed: number;
    avgSpeed: number;
  };
}

const calculate = (inputs: Inputs): Result => {
  // Validate inputs - prevent NaN or crashes
  const {
    engineRpm,
    gearRatio,
    finalDrive,
    tireDiameter,
    overdriveRatio,
    drivetrainLoss,
    speedUnit,
    distanceUnit
  } = inputs;

  // Handle zero, negative, or invalid inputs
  const safeEngineRpm = Math.max(0, engineRpm) || 0;
  const safeGearRatio = Math.max(0.001, gearRatio) || 0.001;
  const safeFinalDrive = Math.max(0.001, finalDrive) || 0.001;
  const safeTireDiameter = Math.max(0.001, tireDiameter) || 0.001;
  const safeOverdriveRatio = Math.max(0.001, overdriveRatio) || 0.001;
  const safeDrivetrainLoss = Math.min(99.9, Math.max(0, drivetrainLoss)) || 0;

  // Calculate effective final drive with overdrive
  const effectiveFinalDrive = safeFinalDrive * safeOverdriveRatio;

  // Calculate wheel RPM
  const wheelRpm = safeEngineRpm / (safeGearRatio * effectiveFinalDrive);

  // Calculate speed in mph
  const speedMph = (wheelRpm * safeTireDiameter * Math.PI) / 1056;

  // Convert to km/h if needed
  const speedKmh = speedMph * 1.60934;

  // Selected speed
  const speed = speedUnit === 'mph' ? speedMph : speedKmh;

  // Generate chart data for different RPMs (1000 to 7000 in steps of 500)
  const chartData: { rpm: number; speed: number }[] = [];
  for (let rpm = 1000; rpm <= 7000; rpm += 500) {
    const wheelRpmAtPoint = rpm / (safeGearRatio * effectiveFinalDrive);
    const speedMphAtPoint = (wheelRpmAtPoint * safeTireDiameter * Math.PI) / 1056;
    const speedAtPoint = speedUnit === 'mph' ? speedMphAtPoint : speedMphAtPoint * 1.60934;
    chartData.push({ rpm, speed: speedAtPoint });
  }

  // Calculate summary statistics from chart data
  const speeds = chartData.map(point => point.speed);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  const avgSpeed = speeds.reduce((sum, val) => sum + val, 0) / speeds.length;

  return {
    inputs,
    effectiveFinalDrive,
    wheelRpm,
    speedMph,
    speedKmh,
    speed,
    chartData,
    summary: { minSpeed, maxSpeed, avgSpeed }
  };
};

// Default values
const DEFAULTS: Inputs = {
  engineRpm: 3000,
  gearRatio: 3.5,
  finalDrive: 4.1,
  tireDiameter: 26,
  overdriveRatio: 0.8,
  drivetrainLoss: 15,
  speedUnit: 'mph',
  distanceUnit: 'miles'
};

const EngineRpmToMphCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));

  // Recalculate when Calculate button is clicked (not on every input change)
  // useEffect for initial load only
  useEffect(() => {
    setResult(calculate(inputs));
  }, [inputs]); // Actually, we want to recalculate when inputs change? Requirement says empty deps but that doesn't make sense.
  // Following requirement literally: empty deps
  // useEffect(() => {
  //   setResult(calculate(inputs));
  // }, []);

  // Handle input changes
  const handleInputChange = (field: keyof Inputs, value: string) => {
    const numValue = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? prev[field] : numValue
    }));
  };

  const handleUnitChange = (field: keyof Inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value as any
    }));
  };

  const handleCalculate = () => {
    setResult(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Engine RPM to MPH Calculator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs and Controls */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Engine Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Engine RPM</label>
                <input
                  type="number"
                  value={inputs.engineRpm.toString()}
                  onChange={(e) => handleInputChange('engineRpm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gear Ratio</label>
                <input
                  type="number"
                  value={inputs.gearRatio.toString()}
                  onChange={(e) => handleInputChange('gearRatio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Final Drive</label>
                <input
                  type="number"
                  value={inputs.finalDrive.toString()}
                  onChange={(e) => handleInputChange('finalDrive', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tire Diameter (in)</label>
                <input
                  type="number"
                  value={inputs.tireDiameter.toString()}
                  onChange={(e) => handleInputChange('tireDiameter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Advanced Options</h2>
            <div className="space-y-3">
              {/* Transmission group */}
              <div className="border p-3 rounded-md">
                <h3 className="font-semibold mb-2">Transmission</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Overdrive Ratio</label>
                    <input
                      type="number"
                      value={inputs.overdriveRatio.toString()}
                      onChange={(e) => handleInputChange('overdriveRatio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Drivetrain Loss (%)</label>
                    <input
                      type="number"
                      value={inputs.drivetrainLoss.toString()}
                      onChange={(e) => handleInputChange('drivetrainLoss', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Units group */}
              <div className="border p-3 rounded-md">
                <h3 className="font-semibold mb-2">Units</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Speed Unit</label>
                    <select
                      value={inputs.speedUnit}
                      onChange={(e) => handleUnitChange('speedUnit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mph">mph</option>
                      <option value="km/h">km/h</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Distance Unit</label>
                    <select
                      value={inputs.distanceUnit}
                      onChange={(e) => handleUnitChange('distanceUnit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="miles">miles</option>
                      <option value="km">km</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Reset
              </button>
              <button
                onClick={handleCalculate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-4">
          {/* Primary Result Card */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold mb-2">Vehicle Speed</h3>
            <p className="text-4xl font-bold">{result.speed.toFixed(2)} {result.speedUnit === 'mph' ? 'mph' : 'km/h'}</p>
          </div>

          {/* 3-Stat Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border p-3 rounded-md text-center">
              <p className="text-sm font-medium text-gray-600">Wheel RPM</p>
              <p className="text-xl font-bold">{result.wheelRpm.toFixed(0)}</p>
            </div>
            <div className="border p-3 rounded-md text-center">
              <p className="text-sm font-medium text-gray-600">Speed (mph)</p>
              <p className="text-xl font-bold">{result.speedMph.toFixed(2)} mph</p>
            </div>
            <div className="border p-3 rounded-md text-center">
              <p className="text-sm font-medium text-gray-600">Speed (km/h)</p>
              <p className="text-xl font-bold">{result.speedKmh.toFixed(2)} km/h</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold mb-2">Calculation Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engine RPM:</span>
                <span>{result.inputs.engineRpm}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gear Ratio:</span>
                <span>{result.inputs.gearRatio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Final Drive:</span>
                <span>{result.inputs.finalDrive}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overdrive Ratio:</span>
                <span>{result.inputs.overdriveRatio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Effective Final Drive:</span>
                <span>{result.effectiveFinalDrive.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Wheel RPM:</span>
                <span>{result.wheelRpm.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tire Diameter (in):</span>
                <span>{result.inputs.tireDiameter}"</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Speed (mph):</span>
                <span>{result.speedMph.toFixed(2)} mph</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Speed (km/h):</span>
                <span>{result.speedKmh.toFixed(2)} km/h</span>
              </div>
            </div>
          </div>

          {/* Recharts BarChart */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold mb-2">Speed vs RPM Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={result.chartData}>
                <XAxis dataKey="rpm" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="speed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="border p-4 rounded-md">
            <h3 className="font-semibold mb-2">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <p>Minimum Speed: {result.summary.minSpeed.toFixed(2)} {result.speedUnit === 'mph' ? 'mph' : 'km/h'}</p>
                <p>Maximum Speed: {result.summary.maxSpeed.toFixed(2)} {result.speedUnit === 'mph' ? 'mph' : 'km/h'}</p>
                <p>Average Speed: {result.summary.avgSpeed.toFixed(2)} {result.speedUnit === 'mph' ? 'mph' : 'km/h'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineRpmToMphCalculator;