"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// PURE CALCULATION FUNCTION (ZERO REACT, FULLY TYPED)
type Inputs = {
  upstreamInvert: number; // ft
  downstreamInvert: number; // ft
  horizontalDistance: number; // ft
  pipeDiameter: number; // in
  flowRate: number; // cfs
  pipeMaterial: string; // affects Manning's n
  minimumSlope: number; // %
  velocityLimit: number; // fps
};

type ManningRoughness = {
  [key: string]: number;
};

const MANNING_N: ManningRoughness = {
  Concrete: 0.013,
  Concrete_Pipe: 0.013,
  PVC: 0.009,
  HDPE: 0.009,
  Steel: 0.012,
  Clay: 0.013,
  'Cast Iron': 0.013,
  Gravel: 0.022,
  Earth: 0.022,
  Rock: 0.035,
};

type Results = {
  // Primary result
  pipeSlopePercent: number;
  // Intermediate calculations
  drop: number; // ft
  slopeRatio: number; // unitless
  pipeAreaSqFt: number; // ft²
  flowVelocityFps: number; // ft/s
  hydraulicRadiusFt: number; // ft
  manningsN: number;
  manningsVelocityFps: number;
  // Derived checks
  meetsMinimumSlope: boolean;
  meetsVelocityLimit: boolean;
  // Additional useful values
  pipeDiameterFt: number; // ft
};

const calculate = (inputs: Inputs): Results => {
  // Handle invalid/zero/negative inputs gracefully
  const {
    upstreamInvert,
    downstreamInvert,
    horizontalDistance,
    pipeDiameter,
    flowRate,
    pipeMaterial,
    minimumSlope,
    velocityLimit,
  } = inputs;

  // Validate critical inputs to prevent division by zero or invalid math
  const safeHorizontalDistance = Math.max(horizontalDistance, 0.001); // Avoid division by zero
  const safePipeDiameter = Math.max(pipeDiameter, 0.001); // Avoid zero diameter
  const safeFlowRate = Math.max(flowRate, 0); // Flow rate cannot be negative

  // Calculate basic geometry
  const drop = upstreamInvert - downstreamInvert;
  const slopeRatio = drop / safeHorizontalDistance;
  const pipeSlopePercent = slopeRatio * 100;

  // Convert pipe diameter to feet for area calculations
  const pipeDiameterFt = safePipeDiameter / 12;
  const pipeRadiusFt = pipeDiameterFt / 2;
  const pipeAreaSqFt = Math.PI * Math.pow(pipeRadiusFt, 2);

  // Flow velocity (continuity equation)
  const flowVelocityFps = pipeAreaSqFt > 0 ? safeFlowRate / pipeAreaSqFt : 0;

  // Hydraulic radius for full circular pipe (R = D/4)
  const hydraulicRadiusFt = pipeDiameterFt / 4;

  // Manning's roughness coefficient
  const manningsN = MANNING_N[pipeMaterial] || MANNING_N.Concrete;

  // Manning's velocity (English units: V = (1.49/n) * R^(2/3) * S^(1/2))
  // Protect against negative or zero slope (cannot take square root of negative)
  const safeSlopeRatio = Math.max(slopeRatio, 0);
  const manningsVelocityFps =
    manningsN > 0
      ? (1.49 / manningsN) * Math.pow(hydraulicRadiusFt, 2 / 3) * Math.pow(safeSlopeRatio, 1 / 2)
      : 0;

  // Check design criteria
  const meetsMinimumSlope = pipeSlopePercent >= minimumSlope;
  const meetsVelocityLimit = flowVelocityFps <= velocityLimit;

  return {
    pipeSlopePercent,
    drop,
    slopeRatio,
    pipeAreaSqFt,
    flowVelocityFps,
    hydraulicRadiusFt,
    manningsN,
    manningsVelocityFps,
    meetsMinimumSlope,
    meetsVelocityLimit,
    pipeDiameterFt,
  };
};

// DEFAULT VALUES (REALISTIC VALUES FOR STORMWATER/SANITARY DESIGN)
const DEFAULTS: Inputs = {
  upstreamInvert: 100.00, // ft
  downstreamInvert: 95.00, // ft
  horizontalDistance: 200.00, // ft
  pipeDiameter: 12.00, // in
  flowRate: 2.50, // cfs
  pipeMaterial: 'Concrete',
  minimumSlope: 0.50, // %
  velocityLimit: 3.00, // fps
};

const InvertElevationCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Results>(calculate(DEFAULTS));

  // Calculate on mount only — results update when Calculate is pressed
  useEffect(() => {
    setResult(calculate(inputs));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Format numbers for display
  const formatNumber = (value: number, decimals = 2) =>
    parseFloat(value.toFixed(decimals));

  return (
    <div className="racira-page-container py-4">
      <h1 className="text-3xl font-bold">Invert Elevation Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        {/* LEFT COLUMN: INPUTS AND CONTROLS */}
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          {/* PRIMARY INPUTS (2 PER ROW) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Upstream Invert (ft)
              </label>
              <input
                type="number"
                name="upstreamInvert"
                value={inputs.upstreamInvert}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Downstream Invert (ft)
              </label>
              <input
                type="number"
                name="downstreamInvert"
                value={inputs.downstreamInvert}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Horizontal Distance (ft)
              </label>
              <input
                type="number"
                name="horizontalDistance"
                value={inputs.horizontalDistance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Pipe Diameter (in)
              </label>
              <input
                type="number"
                name="pipeDiameter"
                value={inputs.pipeDiameter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0.01"
              />
            </div>
          </div>

          {/* ADVANCED OPTIONS: FLOW CHARACTERISTICS */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Flow Characteristics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Flow Rate (cfs)
                </label>
                <input
                  type="number"
                  name="flowRate"
                  value={inputs.flowRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pipe Material
                </label>
                <select
                  name="pipeMaterial"
                  value={inputs.pipeMaterial}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Concrete">Concrete</option>
                  <option value="Concrete_Pipe">Concrete Pipe</option>
                  <option value="PVC">PVC</option>
                  <option value="HDPE">HDPE</option>
                  <option value="Steel">Steel</option>
                  <option value="Clay">Clay</option>
                  <option value="Cast Iron">Cast Iron</option>
                  <option value="Gravel">Gravel</option>
                  <option value="Earth">Earth</option>
                  <option value="Rock">Rock</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADVANCED OPTIONS: DESIGN CRITERIA */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Design Criteria</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Slope (%)
                </label>
                <input
                  type="number"
                  name="minimumSlope"
                  value={inputs.minimumSlope}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Velocity Limit (fps)
                </label>
                <input
                  type="number"
                  name="velocityLimit"
                  value={inputs.velocityLimit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleCalculate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-6">
          {/* PRIMARY RESULT CARD */}
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4">Primary Result</h2>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(result.pipeSlopePercent)} %
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pipe Slope = (Upstream Invert - Downstream Invert) / Horizontal Distance × 100%
            </p>
          </div>

          {/* 3-STAT BAR */}
          <div className="border p-6 rounded-lg grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Elevation Drop</p>
              <p className="text-2xl font-bold">{formatNumber(result.drop)} ft</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pipe Slope</p>
              <p className="text-2xl font-bold">{formatNumber(result.pipeSlopePercent)} %</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Flow Velocity</p>
              <p className="text-2xl font-bold">{formatNumber(result.flowVelocityFps)} fps</p>
            </div>
          </div>

          {/* BREAKDOWN TABLE */}
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Calculation Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Parameter
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Value
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Formula / Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Elevation Drop
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.drop)} ft
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Upstream Invert - Downstream Invert
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pipe Slope (Ratio)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.slopeRatio, 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Drop / Horizontal Distance
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pipe Slope (%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.pipeSlopePercent)} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Slope Ratio × 100
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pipe Diameter
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(inputs.pipeDiameter)} in
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Input Value
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pipe Cross-Sectional Area
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.pipeAreaSqFt, 4)} ft²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      π × (Diameter/2)²
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Flow Velocity (Continuity)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.flowVelocityFps, 3)} fps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Flow Rate / Pipe Area
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Hydraulic Radius
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.hydraulicRadiusFt, 4)} ft
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Pipe Diameter / 4 (for full pipe)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Manning's Roughness Coefficient (n)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.manningsN, 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Based on Pipe Material: {inputs.pipeMaterial}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Manning's Velocity
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(result.manningsVelocityFps, 3)} fps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      V = (1.49/n) × R<sup>2/3</sup> × S<sup>1/2</sup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Meets Minimum Slope ({formatNumber(
                        inputs.minimumSlope
                      )}% min)?
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.meetsMinimumSlope ? '✓ PASS' : '✗ FAIL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Pipe Slope ≥ Minimum Slope
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Meets Velocity Limit ({formatNumber(
                        inputs.velocityLimit
                      )} fps max)?
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.meetsVelocityLimit ? '✓ PASS' : '✗ FAIL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Flow Velocity ≤ Velocity Limit
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BAR CHART: ELEVATION PROFILE */}
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Elevation Profile</h2>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Upstream Invert',
                      upstream: inputs.upstreamInvert,
                      downstream: 0,
                    },
                    {
                      name: 'Downstream Invert',
                      upstream: 0,
                      downstream: inputs.downstreamInvert,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[0, Math.max(inputs.upstreamInvert, inputs.downstreamInvert) * 1.2]}
                    label={{ value: "Elevation (ft)", position: "insideLeft", angle: -90, offset: -10 }}
                  />
                  <Tooltip
                    labelFormatter={(value) => `${value} ft`}
                    formatter={(value) => `${value} ft`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="upstream"
                    fill="#3b82f6"
                    barSize={40}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      position="insideTop"
                      fill="#ffffff"
                      formatter={(value: number) => `${value} ft`}
                    />
                  </Bar>
                  <Bar
                    dataKey="downstream"
                    fill="#10b981"
                    barSize={40}
                    radius={[0, 0, 4, 4]}
                  >
                    <LabelList
                      position="insideBottom"
                      fill="#ffffff"
                      formatter={(value: number) => `${value} ft`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SUMMARY STATISTICS */}
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Summary Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Design Flow Rate</span>
                <span className="text-sm font-mono">
                  {formatNumber(inputs.flowRate)} cfs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Pipe Diameter</span>
                <span className="text-sm font-mono">
                  {formatNumber(inputs.pipeDiameter)} in
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Material</span>
                <span className="text-sm font-mono">{inputs.pipeMaterial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Design Status</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  result.meetsMinimumSlope && result.meetsVelocityLimit
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.meetsMinimumSlope && result.meetsVelocityLimit
                    ? 'PASS'
                    : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO CONTENT (EXACTLY 3 SECTIONS, ~400 WORDS) */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-3">Invert Elevation Calculator for Stormwater and Sewer Design</h2>
        <p className="mb-4">
          The Invert Elevation Calculator is an essential tool for civil engineers, 
          civil engineering technicians, and drainage designers working on stormwater 
          management, sanitary sewer systems, and civil infrastructure projects. This 
          calculator determines the slope percentage of a pipe segment based on the 
          difference in invert elevations (upstream and downstream) and the horizontal 
          distance between manholes or structures. Proper pipe slope is critical for 
          ensuring adequate flow velocity to prevent sedimentation while avoiding 
          excessive velocities that could cause erosion or pipe damage.
        </p>
        
        <p className="mb-4">
          Invert elevation refers to the elevation of the inside bottom of a pipe 
          or culvert at a specific location. The difference between upstream and 
          downstream invert elevations, divided by the horizontal distance, gives the 
          slope of the pipe. This slope is typically expressed as a percentage and is 
          a fundamental parameter in hydraulic design. Minimum slope requirements 
          ensure self-cleansing velocities (typically 2-3 ft/s for sanitary sewers) 
          to prevent sediment deposition, while maximum slope limits prevent erosion 
          and structural damage from high-flow velocities.
        </p>
        
        <p className="mb-4">
          This calculator incorporates advanced hydraulic calculations including 
          flow velocity via the continuity equation (V = Q/A), hydraulic radius for 
          circular pipes, and Manning's equation for velocity estimation based on 
          pipe material roughness. Users can evaluate whether their design meets 
          minimum slope requirements for self-cleansing and maximum velocity limits 
          to prevent erosion. The elevation profile visualization helps engineers 
          quickly assess the grade of proposed sewer or storm drain lines, making 
          this tool invaluable for preliminary design, plan checking, and construction 
          verification in municipal infrastructure projects.
        </p>
      </div>
    </div>
  );
};

export default InvertElevationCalculator;