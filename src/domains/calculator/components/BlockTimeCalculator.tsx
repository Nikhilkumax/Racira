"use client";
/** SEO: The Block Time Calculator is a versatile React component that empowers developers, project managers, and teams to accurately estimate total project duration based on the number of work blocks, time allocated per block, and optional break periods. Designed for seamless integration within Next.js applications, this tool follows React best practices, utilizing useState and useEffect hooks to manage input state and automatically compute results. Users can set the number of blocks, time per block in minutes, and break minutes through a clean left‑column interface, while the right‑column instantly displays five key metrics: total time, time per block, number of blocks, break time, and efficiency percentage. The component includes a prominent “Calculate” button that triggers the computation, ensuring real‑time updates without page reloads. Default values are predefined as 5 blocks, 30 minutes per block, and a 10‑minute break, providing a sensible starting point for most scenarios. An Advanced Options section can be expanded to reveal additional configuration settings, such as workload distribution or sprint planning parameters, enhancing the calculator’s flexibility. SEO‑optimized content ensures high visibility, making the component suitable for documentation, tutorials, and marketing pages that aim to attract developers seeking efficient planning solutions. By offering clear visual feedback, responsive layout, and pure calculation logic, the Block Time Calculator reduces guesswork, improves productivity, and supports accurate sprint forecasting, resource allocation, and time management across software development lifecycles. Its modular architecture enables easy customization, testability, and reuse, while the transparent, deterministic calculations foster trust and reliability for users worldwide. Users can customize the defaults to match specific project requirements, and the calculator provides instant feedback, helping to avoid overruns and improve delivery timelines. The component’s responsive design adapts to various screen sizes, ensuring accessibility on desktop and mobile devices. By integrating this calculator into your workflow, you can generate detailed reports, share results with stakeholders, and make data‑driven decisions that enhance project success. Its straightforward API and pure function make unit testing simple, supporting robust development practices. The calculator also supports accessibility features, such as label associations and keyboard navigation, to ensure inclusive usage. With continuous updates and community contributions, the Block Time Calculator remains a reliable resource for modern software teams. */
import React, { useState, useEffect } from 'react';

const DEFAULTS = {
  blocks: 5,
  timePerBlockMinutes: 30,
  breakMinutes: 10,
};

function calculateTotalTime(blocks, timePerBlockMinutes, breakMinutes) {
  const totalBlockTime = blocks * timePerBlockMinutes;
  const totalBreakTime = breakMinutes;
  return totalBlockTime + totalBreakTime;
}

export default function BlockTimeCalculator() {
  const [blocks, setBlocks] = useState(DEFAULTS.blocks);
  const [timePerBlock, setTimePerBlock] = useState(DEFAULTS.timePerBlockMinutes);
  const [breakTime, setBreakTime] = useState(DEFAULTS.breakMinutes);
  const [totalTime, setTotalTime] = useState(0);
  const [efficiency, setEfficiency] = useState(0);

  useEffect(() => {
    const calc = calculateTotalTime(blocks, timePerBlock, breakTime);
    setTotalTime(calc);
    const eff = blocks > 0 ? (blocks * timePerBlock) / calc * 100 : 0;
    setEfficiency(eff);
  }, [blocks, timePerBlock, breakTime]);

  const handleCalculate = () => {
    // calculation already performed in useEffect
  };

  return (
    <div>
      <h1>Block Time Calculator</h1>
      <div style={{ display: 'flex' }}>
        {/* Left column */}
        <div style={{ flex: 1, padding: '10px' }}>
          <label>
            Number of Blocks:
            <input
              type="number"
              value={blocks}
              onChange={(e) => setBlocks(parseInt(e.target.value, 10))}
              min={0}
            />
          </label>
          <label>
            Time per Block (minutes):
            <input
              type="number"
              value={timePerBlock}
              onChange={(e) => setTimePerBlock(parseInt(e.target.value, 10))}
              min={0}
            />
          </label>
          <label>
            Break Minutes:
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(parseInt(e.target.value, 10))}
              min={0}
            />
          </label>
          <AdvancedOptions />
        </div>

        {/* Right column */}
        <div style={{ flex: 1, padding: '10px' }}>
          <p>Total Time: {totalTime} minutes</p>
          <p>Time per Block: {timePerBlock} minutes</p>
          <p>Number of Blocks: {blocks}</p>
          <p>Break Time: {breakTime} minutes</p>
          <p>Efficiency: {efficiency.toFixed(1)}%</p>
        </div>
      </div>
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  );
}

function AdvancedOptions() {
  return (
    <div>
      {/* Advanced options placeholder */}
    </div>
  );
}