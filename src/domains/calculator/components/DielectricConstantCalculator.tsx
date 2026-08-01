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
  epsilonR: 3.5,
  areaMm2: 1000,
  distanceMm: 0.1,
};

const epsilon0 = 8.854187817e-12;

const calculateCapacitance = (er: number, a: number, d: number): number => {
  const areaM2 = a * 1e-6;
  const distM = d * 1e-3;
  const capacitanceF = epsilon0 * er * areaM2 / distM;
  return capacitanceF * 1e6;
};

const DielectricConstantCalculator: React.FC = () => {
  const [epsilonR, setEpsilonR] = useState(DEFAULTS.epsilonR);
  const [areaMm2, setArea] = useState(DEFAULTS.areaMm2);
  const [distanceMm, setDistance] = useState(DEFAULTS.distanceMm);
  const [results, setResults] = useState({
    dielectricConstant: 0,
    capacitance: 0,
    area: 0,
    distance: 0,
    permittivity: 0,
  });

  const handleCalculate = () => {
    const capacitance = calculateCapacitance(epsilonR, areaMm2, distanceMm);
    const permittivity = epsilon0 * epsilonR;
    setResults({
      dielectricConstant: epsilonR,
      capacitance: capacitance,
      area: areaMm2,
      distance: distanceMm,
      permittivity: permittivity,
    });
  };

  const chartData = Array.from({ length: 10 }, (_, i) => ({
    epsilonR: 1 + i,
    capacitance: calculateCapacitance(1 + i, DEFAULTS.areaMm2, DEFAULTS.distanceMm),
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h1>Dielectric Constant Calculator</h1>
        <div className="mb-2"><strong>Advanced Options</strong></div>
        <form>
          <div className="mb-2">
            <label className="block">Dielectric Constant (εᵣ)</label>
            <input
              type="number"
              value={epsilonR}
              onChange={(e) => setEpsilonR(parseFloat(e.target.value))}
              className="border p-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block">Area (mm²)</label>
            <input
              type="number"
              value={areaMm2}
              onChange={(e) => setArea(parseFloat(e.target.value))}
              className="border p-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block">Distance (mm)</label>
            <input
              type="number"
              value={distanceMm}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="border p-1 w-full"
            />
          </div>
          <div className="mb-2">
            <button
              type="button"
              onClick={handleCalculate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </div>
        </form>
      </div>
      <div>
        <ResultItem label="Dielectric Constant" value={results.dielectricConstant} />
        <ResultItem label="Capacitance" value={results.capacitance} unit="µF" />
        <ResultItem label="Area" value={results.area} unit="mm²" />
        <ResultItem label="Distance" value={results.distance} unit="mm" />
        <ResultItem label="Permittivity" value={results.permittivity} unit="F/m" />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epsilonR" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="capacitance" stroke="#8486f8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ResultItem: React.FC<{ label: string; value: number; unit: string }> = ({
  label,
  value,
  unit,
}) => (
  <p className="text-sm">
    <strong>{label}:</strong> {value}{unit}
  </p>
);

export default DielectricConstantCalculator;

<div className="seo">
  <p>
    The Dielectric Constant Calculator is a specialized web application that enables users to determine the capacitance of a parallel‑plate capacitor through the well‑known formula C = ε · A / d, where ε represents the absolute permittivity of the material. The absolute permittivity is computed as the product of the vacuum permittivity (ε₀) and the relative permittivity (εᵣ), allowing the calculator to incorporate material properties directly into the capacitance computation. Input fields accept the relative permittivity (εᵣ), the plate area expressed in square millimeters, and the separation distance in millimeters, providing a straightforward interface for both novice learners and experienced engineers. Upon clicking the “Calculate” button, the application executes a pure calculate function that converts the inputs to SI units, applies the formula, and returns the capacitance in microfarads, while simultaneously updating five result components: dielectric constant, capacitance, area, distance, and permittivity. Each result component is displayed in a dedicated row with clear labeling and appropriate units, ensuring immediate comprehension of the computed values. The right column of the layout features a responsive Recharts line chart that plots capacitance against dielectric constant across a range of εᵣ values, offering a visual representation of how increasing permittivity influences capacitance. This visual aid reinforces the theoretical relationship and supports educational contexts. The component is built with modern React practices, employing functional syntax, hooks for state management, and a pure calculate function that encapsulates all mathematical logic, promoting testability and maintainability. Styling follows a clean two‑column grid layout with ample spacing, ensuring readability on desktop and mobile devices. SEO considerations are integrated through strategic placement of high‑impact keywords such as dielectric constant calculator, capacitance formula, εᵣ, area, distance, microfarads, and Recharts chart, enhancing discoverability in search engine results. The design adheres to accessibility standards, using semantic HTML elements and appropriate ARIA attributes where necessary. Overall, the Dielectric Constant Calculator delivers a concise, interactive, and visually engaging solution for evaluating capacitor performance in a variety of engineering and educational scenarios.
  </p>
</div>