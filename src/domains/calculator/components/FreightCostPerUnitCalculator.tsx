"use client"

// 1. TypeScript interfaces — no 'any'
// 2. Pure calculation function — zero React, fully typed
// 3. DEFAULTS object — realistic values
// 4. Component:
//    → useState(DEFAULTS)
//    → useState<Result>(calculate(DEFAULTS))
//    → useEffect(() => setResult(calculate(inputs)), [])
//    → LEFT col: inputs (2 per row) + second tier + Calculate + Reset
//    → RIGHT col: 4 result components
//    → PopularCalculators

// Domain-specific interfaces
export interface FreightCostPerUnitInput {
  distanceMiles: number;
  weightTons: number;
  ratePerMilePerTon: number;
}

// Pure calculation function — zero React, fully typed
export function calculateFreightCostPerUnit(
  input: FreightCostPerUnitInput
): number {
  // Calculate total freight cost
  const totalCost = input.distanceMiles * input.weightTons * input.ratePerMilePerTon;
  
  return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
}

// DEFAULTS object — realistic values
const DEFAULTS: FreightCostPerUnitInput = {
  distanceMiles: 1000,
  weightTons: 10,
  ratePerMilePerTon: 0.5
};

// Component
import { useState, useEffect } from 'react';

export default function FreightCostPerUnitCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateFreightCostPerUnit(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateFreightCostPerUnit(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateFreightCostPerUnit(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateFreightCostPerUnit(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="distanceMiles"
            defaultValue={inputs.distanceMiles}
            onChange={(e) => setInputs({...inputs, distanceMiles: parseFloat(e.target.value)})}
            placeholder="Distance (Miles)"
            min="0"
          />
          <input
            type="number"
            name="weightTons"
            defaultValue={inputs.weightTons}
            onChange={(e) => setInputs({...inputs, weightTons: parseFloat(e.target.value)})}
            placeholder="Weight (Tons)"
            min="0"
          />
          <input
            type="number"
            name="ratePerMilePerTon"
            defaultValue={inputs.ratePerMilePerTon}
            onChange={(e) => setInputs({...inputs, ratePerMilePerTon: parseFloat(e.target.value)})}
            placeholder="Rate ($/mile/ton)"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.distanceMiles || !inputs.weightTons || !inputs.ratePerMilePerTon}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.distanceMiles || !inputs.weightTons || !inputs.ratePerMilePerTon}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            ${result.toLocaleString()}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Total Freight Cost (USD)
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 5000)}%`, 
              backgroundColor: result >= 10000 ? 'green' : result >= 5000 ? 'orange' : 'red'
            }}>
              ${result.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Distance: {inputs.distanceMiles} miles</div>
            <div>Weight: {inputs.weightTons} tons</div>
            <div>Rate: ${inputs.ratePerMilePerTon}/mile/ton</div>
            <div>Total Distance: {inputs.distanceMiles} miles</div>
            <div>Total Weight: {inputs.weightTons} tons</div>
            <div>Total Cost: ${result.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Freight Cost: ${result.toLocaleString()}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}