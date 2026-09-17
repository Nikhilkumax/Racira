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
export interface ReceivablesTurnoverRatioInput {
  netCreditSales: number;
  averageAccountsReceivable: number;
}

// Pure calculation function — zero React, fully typed
export function calculateReceivablesTurnoverRatio(
  input: ReceivablesTurnoverRatioInput
): number {
  // Avoid division by zero
  if (input.averageAccountsReceivable === 0) {
    return 0;
  }
  
  // Calculate receivables turnover ratio
  const ratio = input.netCreditSales / input.averageAccountsReceivable;
  
  return Math.round(ratio * 10); // Return as ratio with 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: ReceivablesTurnoverRatioInput = {
  netCreditSales: 2000000,
  averageAccountsReceivable: 250000
};

// Component
import { useState, useEffect } from 'react';

export default function ReceivablesTurnoverRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateReceivablesTurnoverRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateReceivablesTurnoverRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateReceivablesTurnoverRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateReceivablesTurnoverRatio(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="netCreditSales"
            defaultValue={inputs.netCreditSales}
            onChange={(e) => setInputs({...inputs, netCreditSales: parseFloat(e.target.value)})}
            placeholder="Net Credit Sales ($)"
            min="0"
          />
          <input
            type="number"
            name="averageAccountsReceivable"
            defaultValue={inputs.averageAccountsReceivable}
            onChange={(e) => setInputs({...inputs, averageAccountsReceivable: parseFloat(e.target.value)})}
            placeholder="Average Accounts Receivable ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.netCreditSales || !inputs.averageAccountsReceivable}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.netCreditSales || !inputs.averageAccountsReceivable}
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
            Receivables Turnover Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 30)}%`, 
              backgroundColor: result >= 20 ? 'green' : result >= 15 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Net Credit Sales: ${inputs.netCreditSales.toLocaleString()}</div>
            <div>Average Accounts Receivable: ${inputs.averageAccountsReceivable.toLocaleString()}</div>
            <div>Receivables Turnover Ratio: {result.toFixed(1)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Turnover Ratio: {result.toFixed(1)}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}