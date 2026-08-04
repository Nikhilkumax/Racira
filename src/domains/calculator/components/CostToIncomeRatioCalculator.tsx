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
export interface CostToIncomeRatioInput {
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
}

// Pure calculation function — zero React, fully typed
export function calculateCostToIncomeRatio(
  input: CostToIncomeRatioInput
): number {
  // Calculate total costs
  const totalCosts = input.costOfGoodsSold + input.operatingExpenses;
  
  // Calculate cost-to-income ratio
  const ratio = totalCosts / input.revenue;
  
  // Return as percentage
  return Math.round(ratio * 100);
}

// DEFAULTS object — realistic values
const DEFAULTS: CostToIncomeRatioInput = {
  revenue: 500000,
  costOfGoodsSold: 300000,
  operatingExpenses: 150000
};

// Component
import { useState, useEffect } from 'react';

export default function CostToIncomeRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateCostToIncomeRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateCostToIncomeRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateCostToIncomeRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCostToIncomeRatio(DEFAULTS));
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
            {result}%
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Cost-to-Income Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 30)}%`, 
              backgroundColor: result >= 60 ? 'green' : result >= 40 ? 'orange' : 'red'
            }}>
              {result}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Revenue: ${inputs.revenue.toLocaleString()}</div>
            <div>COGS: ${inputs.costOfGoodsSold.toLocaleString()}</div>
            <div>Operating Expenses: ${inputs.operatingExpenses.toLocaleString()}</div>
            <div>Total Costs: ${(inputs.costOfGoodsSold + inputs.operatingExpenses).toLocaleString()}</div>
            <div>Cost-to-Income Ratio: {result}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Ratio: {result}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}