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
export interface DebtToEquityRatioInput {
  totalDebt: number;
  totalShareholderEquity: number;
}

// Pure calculation function — zero React, fully typed
export function calculateDebtToEquityRatio(
  input: DebtToEquityRatioInput
): number {
  // Avoid division by zero
  if (input.totalShareholderEquity === 0) {
    return 0;
  }
  
  // Calculate debt-to-equity ratio
  const ratio = input.totalDebt / input.totalShareholderEquity;
  
  return Math.round(ratio * 100); // Return as percentage, rounded to whole number
}

// DEFAULTS object — realistic values
const DEFAULTS: DebtToEquityRatioInput = {
  totalDebt: 500000,
  totalShareholderEquity: 1000000
};

// Component
import { useState, useEffect } from 'react';

export default function DebtToEquityRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateDebtToEquityRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateDebtToEquityRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateDebtToEquityRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateDebtToEquityRatio(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="totalDebt"
            defaultValue={inputs.totalDebt}
            onChange={(e) => setInputs({...inputs, totalDebt: parseFloat(e.target.value)})}
            placeholder="Total Debt ($)"
            min="0"
          />
          <input
            type="number"
            name="totalShareholderEquity"
            defaultValue={inputs.totalShareholderEquity}
            onChange={(e) => setInputs({...inputs, totalShareholderEquity: parseFloat(e.target.value)})}
            placeholder="Total Shareholder Equity ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.totalDebt || !inputs.totalShareholderEquity}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.totalDebt || !inputs.totalShareholderEquity}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result}%
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Debt-to-Equity Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 100)}%`, 
              backgroundColor: result >= 50 ? 'green' : result >= 30 ? 'orange' : 'red'
            }}>
              {result}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Total Debt: ${inputs.totalDebt.toLocaleString()}</div>
            <div>Total Shareholder Equity: ${inputs.totalShareholderEquity.toLocaleString()}</div>
            <div>Debt-to-Equity Ratio: {result}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Debt-to-Equity: {result}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}