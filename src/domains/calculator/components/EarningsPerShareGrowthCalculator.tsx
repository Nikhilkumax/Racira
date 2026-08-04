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
export interface EarningsPerShareGrowthInput {
  currentEPS: number;
  previousEPS: number;
}

// Pure calculation function — zero React, fully typed
export function calculateEarningsPerShareGrowth(
  input: EarningsPerShareGrowthInput
): number {
  // Avoid division by zero
  if (input.previousEPS === 0) {
    return 0;
  }
  
  // Calculate EPS growth rate
  const growthRate = ((input.currentEPS - input.previousEPS) / Math.abs(input.previousEPS)) * 100;
  
  return Math.round(growthRate * 100); // Return as percentage with 2 decimal places
}

// DEFAULTS object — realistic values
const DEFAULTS: EarningsPerShareGrowthInput = {
  currentEPS: 5.5,
  previousEPS: 4.5
};

// Component
import { useState, useEffect } from 'react';

export default function EarningsPerShareGrowthCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateEarningsPerShareGrowth(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateEarningsPerShareGrowth(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateEarningsPerShareGrowth(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateEarningsPerShareGrowth(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="currentEPS"
            defaultValue={inputs.currentEPS}
            onChange={(e) => setInputs({...inputs, currentEPS: parseFloat(e.target.value)})}
            placeholder="Current EPS ($)"
            step="0.01"
          />
          <input
            type="number"
            name="previousEPS"
            defaultValue={inputs.previousEPS}
            onChange={(e) => setInputs({...inputs, previousEPS: parseFloat(e.target.value)})}
            placeholder="Previous EPS ($)"
            step="0.01"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.currentEPS || !inputs.previousEPS}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.currentEPS || !inputs.previousEPS}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result.toFixed(2)}%
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            EPS Growth Rate
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, Math.abs(result) / 50)}%`, 
              backgroundColor: result >= 15 ? 'green' : result >= 5 ? 'orange' : 'red'
            }}>
              {result.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Current EPS: $${inputs.currentEPS.toFixed(2)}</div>
            <div>Previous EPS: $${inputs.previousEPS.toFixed(2)}</div>
            <div>EPS Change: $${(inputs.currentEPS - inputs.previousEPS).toFixed(2)}</div>
            <div>EPS Growth Rate: {result.toFixed(2)}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>EPS Growth: {result.toFixed(2)}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}