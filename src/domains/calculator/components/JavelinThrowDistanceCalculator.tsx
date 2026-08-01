"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const JavelinThrowDistanceCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    velocity: 25,
    angle: 35,
    height: 2,
    mass: 0.8,
    diameter: 0.025,
    dragCoeff: 0.1,
    airDensity: 1.225
  });

  const [results, setResults] = useState({
    range: 0,
    maxHeight: 0,
    timeOfFlight: 0,
    impactSpeed: 0,
    launchAngle: 35
  });

  const [trajectory, setTrajectory] = useState<Array<{ x: number; y: number }>>([]);

  const handleCalculate = () => {
    const { velocity: v0, angle: angleDeg, height: h0, mass: m, diameter: d, dragCoeff: cd, airDensity: rho } = inputs;
    const g = 9.81;
    const angle = angleDeg * Math.PI / 180;
    const area = Math.PI * Math.pow(d / 2, 2);
    const dt = 0.01;

    let x = 0;
    let y = h0;
    let vx = v0 * Math.cos(angle);
    let vy = v0 * Math.sin(angle);
    let t = 0;

    const trajectoryPoints: Array<{ x: number; y: number }> = [];
    let maxH = h0;

    while (true) {
      // Store current point
      trajectoryPoints.push({ x, y });
      if (y > maxH) maxH = y;
      if (y < 0) break;

      // Calculate velocity magnitude
      const v = Math.sqrt(vx * vx + vy * vy);
      // Calculate drag force
      let dragForce = 0;
      let vxOverV = 0;
      let vyOverV = 0;
      if (v > 0) {
        dragForce = 0.5 * rho * cd * area * v * v;
        vxOverV = vx / v;
        vyOverV = vy / v;
      }

      // Calculate accelerations
      const ax = -(dragForce / m) * vxOverV;
      const ay = -g - (dragForce / m) * vyOverV;

      // Update velocity (Euler integration)
      vx += ax * dt;
      vy += ay * dt;
      // Update position
      x += vx * dt;
      y += vy * dt;
      // Update time
      t += dt;
    }

    // Interpolate to get exact ground impact point
    const pointA = trajectoryPoints[trajectoryPoints.length - 2];
    const pointB = trajectoryPoints[trajectoryPoints.length - 1];
    const tB = t; // time of pointB (current time after last update)
    const tA = tB - dt; // time of pointA
    const yA = pointA.y;
    const yB = pointB.y;
    const fraction = -yA / (yB - yA);
    const t0 = tA + fraction * (tB - tA);
    const x0 = pointA.x + fraction * (pointB.x - pointA.x);
    const impactSpeed = Math.sqrt(vx * vx + vy * vy);

    setResults({
      range: x0,
      maxHeight: maxH,
      timeOfFlight: t0,
      impactSpeed,
      launchAngle: angleDeg
    });
    setTrajectory(trajectoryPoints);
  };

  return (
    <div className="flex">
      {/* Left column: Inputs */}
      <div className="w-1/2 p-4">
        <h1 className="text-2xl font-bold mb-4">Javelin Throw Distance Calculator</h1>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Initial Velocity (m/s)</label>
            <input
              type="number"
              value={inputs.velocity}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  velocity: parseFloat(e.target.value) || 0
                })
              }
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Launch Angle (degrees)</label>
            <input
              type="number"
              value={inputs.angle}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  angle: parseFloat(e.target.value) || 0
                })
              }
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Height (m)</label>
            <input
              type="number"
              value={inputs.height}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  height: parseFloat(e.target.value) || 0
                })
              }
              className="border p-2 w-full"
            />
          </div>
          <details className="border p-4">
            <summary className="cursor-pointer font-medium">Advanced Options</summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block mb-1">Mass (kg)</label>
                <input
                  type="number"
                  value={inputs.mass}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      mass: parseFloat(e.target.value) || 0
                    })
                  }
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Diameter (m)</label>
                <input
                  type="number"
                  value={inputs.diameter}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      diameter: parseFloat(e.target.value) || 0
                    })
                  }
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Drag Coefficient</label>
                <input
                  type="number"
                  value={inputs.dragCoeff}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      dragCoeff: parseFloat(e.target.value) || 0
                    })
                  }
                  className="border p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Air Density (kg/m³)</label>
                <input
                  type="number"
                  value={inputs.airDensity}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      airDensity: parseFloat(e.target.value) || 0
                    })
                  }
                  className="border p-2 w-full"
                />
              </div>
            </div>
          </details>
          <button
            onClick={handleCalculate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Right column: Results and Chart */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-1">Range</h3>
            <p className="text-2xl font-bold">{results.range.toFixed(2)} m</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-1">Max Height</h3>
            <p className="text-2xl font-bold">{results.maxHeight.toFixed(2)} m</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-1">Time of Flight</h3>
            <p className="text-2xl font-bold">{results.timeOfFlight.toFixed(2)} s</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-1">Impact Speed</h3>
            <p className="text-2xl font-bold">{results.impactSpeed.toFixed(2)} m/s</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-1">Launch Angle</h3>
            <p className="text-2xl font-bold">{results.launchAngle}°</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold mb-4">Trajectory</h2>
          {trajectory.length > 0 ? (
            <LineChart
              width={500}
              height={400}
              data={trajectory}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: 'Distance (m)', position: 'insideBottom' }} />
              <YAxis dataKey="y" label={{ value: 'Height (m)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="x" dataKey="y" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          ) : (
            <p className="text-center text-gray-500">Click Calculate to see trajectory</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JavelinThrowDistanceCalculator;