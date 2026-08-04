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
export interface OperatingProfitMarginInput {
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
}

// Pure calculation function — zero React, fully typed
export function calculateOperatingProfitMargin(
  input: OperatingProfitMarginInput
): number {
  // Calculate operating profit
  const operatingProfit = input.revenue - input.costOfGoodsSold - input.operatingExpenses;
  
  // Calculate profit margin percentage
  const profitMargin = (operatingProfit / input.revenue) * 100;
  
  return Math.round(profitMargin * 10); // Round to 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: OperatingProfitMarginInput = {
  revenue: 100000,
  costOfGoodsSold: 60000,
  operatingExpenses: 25000
};

// Component
import { useState, useEffect } from 'react';

export default function OperatingProfitMarginCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateOperatingProfitMargin(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateOperatingProfitMargin(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateOperatingProfitMargin(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateOperatingProfitMargin(DEFAULTS));
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
          <input
            type="number"
            name="operatingExpenses"
            defaultValue={inputs.operatingExpenses}
            onChange={(e) => setInputs({...inputs, operatingExpenses: parseFloat(e.target.value)})}
            placeholder="Operating Expenses ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.revenue || !inputs.costOfGoodsSold || !inputs.operatingExpenses}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.revenue || !inputs.costOfGoodsSold || !inputs.operatingExpenses}
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
            Operating Profit Margin
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 20)}%`, 
              backgroundColor: result >= 25 ? 'green' : result >= 15 ? 'orange' : 'red'
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
            <div>Operating Expenses: ${inputs.operatingExpenses.toLocaleString()}</div>
            <div>Operating Profit: ${(inputs.revenue - inputs.costOfGoodsSold - inputs.operatingExpenses).toLocaleString()}</div>
            <div>Profit Margin: {result.toFixed(1)}%</div>
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