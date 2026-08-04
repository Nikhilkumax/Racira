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
export interface InventoryTurnoverRatioInput {
  costOfGoodsSold: number;
  averageInventory: number;
}

// Pure calculation function — zero React, fully typed
export function calculateInventoryTurnoverRatio(
  input: InventoryTurnoverRatioInput
): number {
  // Avoid division by zero
  if (input.averageInventory === 0) {
    return 0;
  }
  
  // Calculate inventory turnover ratio
  const ratio = input.costOfGoodsSold / input.averageInventory;
  
  return Math.round(ratio * 10); // Return as ratio with 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: InventoryTurnoverRatioInput = {
  costOfGoodsSold: 1200000,
  averageInventory: 200000
};

// Component
import { useState, useEffect } from 'react';

export default function InventoryTurnoverRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateInventoryTurnoverRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateInventoryTurnoverRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateInventoryTurnoverRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateInventoryTurnoverRatio(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="costOfGoodsSold"
            defaultValue={inputs.costOfGoodsSold}
            onChange={(e) => setInputs({...inputs, costOfGoodsSold: parseFloat(e.target.value)})}
            placeholder="Cost of Goods Sold ($)"
            min="0"
          />
          <input
            type="number"
            name="averageInventory"
            defaultValue={inputs.averageInventory}
            onChange={(e) => setInputs({...inputs, averageInventory: parseFloat(e.target.value)})}
            placeholder="Average Inventory ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.costOfGoodsSold || !inputs.averageInventory}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.costOfGoodsSold || !inputs.averageInventory}
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
            Inventory Turnover Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 20)}%`, 
              backgroundColor: result >= 15 ? 'green' : result >= 10 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Cost of Goods Sold: ${inputs.costOfGoodsSold.toLocaleString()}</div>
            <div>Average Inventory: ${inputs.averageInventory.toLocaleString()}</div>
            <div>Inventory Turnover Ratio: {result.toFixed(1)}</div>
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