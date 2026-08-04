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
export interface PriceEarningsRatioInput {
  marketPricePerShare: number;
  earningsPerShare: number;
}

// Pure calculation function — zero React, fully typed
export function calculatePriceEarningsRatio(
  input: PriceEarningsRatioInput
): number {
  // Avoid division by zero
  if (input.earningsPerShare === 0) {
    return 0;
  }
  
  // Calculate price-to-earnings ratio
  const ratio = input.marketPricePerShare / input.earningsPerShare;
  
  return Math.round(ratio * 10); // Return as ratio with 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: PriceEarningsRatioInput = {
  marketPricePerShare: 50,
  earningsPerShare: 5
};

// Component
import { useState, useEffect } from 'react';

export default function PriceEarningsRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculatePriceEarningsRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculatePriceEarningsRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculatePriceEarningsRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePriceEarningsRatio(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="marketPricePerShare"
            defaultValue={inputs.marketPricePerShare}
            onChange={(e) => setInputs({...inputs, marketPricePerShare: parseFloat(e.target.value)})}
            placeholder="Market Price per Share ($)"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            name="earningsPerShare"
            defaultValue={inputs.earningsPerShare}
            onChange={(e) => setInputs({...inputs, earningsPerShare: parseFloat(e.target.value)})}
            placeholder="Earnings per Share ($)"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.marketPricePerShare || !inputs.earningsPerShare}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.marketPricePerShare || !inputs.earningsPerShare}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result.toFixed(1)}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            P/E Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 100)}%`, 
              backgroundColor: result >= 25 ? 'green' : result >= 15 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Market Price per Share: $${inputs.marketPricePerShare.toFixed(2)}</div>
            <div>Earnings per Share: $${inputs.earningsPerShare.toFixed(2)}</div>
            <div>Price/Earnings Ratio: {result.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>P/E Ratio: {result.toFixed(1)}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}