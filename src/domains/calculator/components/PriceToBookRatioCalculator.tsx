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
export interface PriceToBookRatioInput {
  marketPricePerShare: number;
  bookValuePerShare: number;
}

// Pure calculation function — zero React, fully typed
export function calculatePriceToBookRatio(
  input: PriceToBookRatioInput
): number {
  // Avoid division by zero
  if (input.bookValuePerShare === 0) {
    return 0;
  }
  
  // Calculate price-to-book ratio
  const ratio = input.marketPricePerShare / input.bookValuePerShare;
  
  return Math.round(ratio * 100); // Return as ratio with 2 decimal places
}

// DEFAULTS object — realistic values
const DEFAULTS: PriceToBookRatioInput = {
  marketPricePerShare: 25,
  bookValuePerShare: 20
};

// Component
import { useState, useEffect } from 'react';

export default function PriceToBookRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculatePriceToBookRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculatePriceToBookRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculatePriceToBookRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePriceToBookRatio(DEFAULTS));
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
            name="bookValuePerShare"
            defaultValue={inputs.bookValuePerShare}
            onChange={(e) => setInputs({...inputs, bookValuePerShare: parseFloat(e.target.value)})}
            placeholder="Book Value per Share ($)"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.marketPricePerShare || !inputs.bookValuePerShare}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.marketPricePerShare || !inputs.bookValuePerShare}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result.toFixed(2)}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            P/B Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 10)}%`, 
              backgroundColor: result >= 5 ? 'green' : result >= 3 ? 'orange' : 'red'
            }}>
              {result.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Market Price per Share: $${inputs.marketPricePerShare.toFixed(2)}</div>
            <div>Book Value per Share: $${inputs.bookValuePerShare.toFixed(2)}</div>
            <div>Price/Book Ratio: {result.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>P/B Ratio: {result.toFixed(2)}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}