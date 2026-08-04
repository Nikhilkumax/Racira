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
export interface GrossProfitMarginInput {
  revenue: number;
  costOfGoodsSold: number;
}

// Pure calculation function — zero React, fully typed
export function calculateGrossProfitMargin(
  input: GrossProfitMarginInput
): number {
  // Calculate gross profit
  const grossProfit = input.revenue - input.costOfGoodsSold;
  
  // Calculate gross profit margin percentage
  const grossProfitMargin = (grossProfit / input.revenue) * 100;
  
  return Math.round(grossProfitMargin * 10); // Round to 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: GrossProfitMarginInput = {
  revenue: 100000,
  costOfGoodsSold: 60000
};

// Component
import { useState, useEffect } from 'react';

export default function GrossProfitMarginCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateGrossProfitMargin(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateGrossProfitMargin(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateGrossProfitMargin(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateGrossProfitMargin(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="revenue"
            defaultValue={inputs.revenue}
            onChange={(e) => setInputs({...inputs, revenue: parseFloat(e.target.value)})}
            placeholder="Revenue ($)"
            min="0"
          />
          <input
            type="number"
            name="costOfGoodsSold"
            defaultValue={inputs.costOfGoodsSold}
            onChange={(e) => setInputs({...inputs, costOfGoodsSold: parseFloat(e.target.value)})}
            placeholder="COGS ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.revenue || !inputs.costOfGoodsSold}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.revenue || !inputs.costOfGoodsSold}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result.toFixed(1)}%
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Gross Profit Margin
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 15)}%`, 
              backgroundColor: result >= 35 ? 'green' : result >= 25 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Revenue: ${inputs.revenue.toLocaleString()}</div>
            <div>COGS: ${inputs.costOfGoodsSold.toLocaleString()}</div>
            <div>Gross Profit: ${(inputs.revenue - inputs.costOfGoodsSold).toLocaleString()}</div>
            <div>Gross Profit Margin: {result.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Margin: {result.toFixed(1)}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}