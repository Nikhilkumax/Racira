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
export interface BookValuePerShareInput {
  totalShareholderEquity: number;
  sharesOutstanding: number;
}

// Pure calculation function — zero React, fully typed
export function calculateBookValuePerShare(
  input: BookValuePerShareInput
): number {
  // Avoid division by zero
  if (input.sharesOutstanding === 0) {
    return 0;
  }
  
  // Calculate book value per share
  const bookValuePerShare = input.totalShareholderEquity / input.sharesOutstanding;
  
  return Math.round(bookValuePerShare * 100); // Return as dollar amount with 2 decimal places
}

// DEFAULTS object — realistic values
const DEFAULTS: BookValuePerShareInput = {
  totalShareholderEquity: 5000000,
  sharesOutstanding: 1000000
};

// Component
import { useState, useEffect } from 'react';

export default function BookValuePerShareCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateBookValuePerShare(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateBookValuePerShare(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateBookValuePerShare(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateBookValuePerShare(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="totalShareholderEquity"
            defaultValue={inputs.totalShareholderEquity}
            onChange={(e) => setInputs({...inputs, totalShareholderEquity: parseFloat(e.target.value)})}
            placeholder="Total Shareholder Equity ($)"
            min="0"
          />
          <input
            type="number"
            name="sharesOutstanding"
            defaultValue={inputs.sharesOutstanding}
            onChange={(e) => setInputs({...inputs, sharesOutstanding: parseFloat(e.target.value)})}
            placeholder="Shares Outstanding"
            min="1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.totalShareholderEquity || !inputs.sharesOutstanding}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.totalShareholderEquity || !inputs.sharesOutstanding}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            $${result.toFixed(2)}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Book Value per Share
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 100)}%`, 
              backgroundColor: result >= 50 ? 'green' : result >= 25 ? 'orange' : 'red'
            }}>
              $${result.toFixed(2)}
          </div>
        </div>
        </div>

        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Total Shareholder Equity: $${inputs.totalShareholderEquity.toLocaleString()}</div>
            <div>Shares Outstanding: ${inputs.sharesOutstanding.toLocaleString()}</div>
            <div>Book Value per Share: $${result.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Book Value per Share: $${result.toFixed(2)}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}