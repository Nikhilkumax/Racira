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
export interface SupplyChainCostAsOfSalesInput {
  salesRevenue: number;
  costOfGoodsSold: number;
  logisticsCosts: number;
  inventoryHoldingCosts: number;
}

// Pure calculation function — zero React, fully typed
export function calculateSupplyChainCostAsOfSales(
  input: SupplyChainCostAsOfSalesInput
): number {
  // Calculate total supply chain costs
  const totalSupplyChainCosts = input.costOfGoodsSold + input.logisticsCosts + input.inventoryHoldingCosts;
  
  // Calculate cost as percentage of sales revenue
  const costAsPercentage = (totalSupplyChainCosts / input.salesRevenue) * 100;
  
  return Math.round(costAsPercentage * 10); // Round to 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: SupplyChainCostAsOfSalesInput = {
  salesRevenue: 1000000,
  costOfGoodsSold: 600000,
  logisticsCosts: 100000,
  inventoryHoldingCosts: 50000
};

// Component
import { useState, useEffect } from 'react';

export default function SupplyChainCostAsOfSalesCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateSupplyChainCostAsOfSales(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateSupplyChainCostAsOfSales(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateSupplyChainCostAsOfSales(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateSupplyChainCostAsOfSales(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="salesRevenue"
            defaultValue={inputs.salesRevenue}
            onChange={(e) => setInputs({...inputs, salesRevenue: parseFloat(e.target.value)})}
            placeholder="Sales Revenue ($)"
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
            name="logisticsCosts"
            defaultValue={inputs.logisticsCosts}
            onChange={(e) => setInputs({...inputs, logisticsCosts: parseFloat(e.target.value)})}
            placeholder="Logistics Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="inventoryHoldingCosts"
            defaultValue={inputs.inventoryHoldingCosts}
            onChange={(e) => setInputs({...inputs, inventoryHoldingCosts: parseFloat(e.target.value)})}
            placeholder="Inventory Holding Costs ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.salesRevenue || !inputs.costOfGoodsSold || !inputs.logisticsCosts || !inputs.inventoryHoldingCosts}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.salesRevenue || !inputs.costOfGoodsSold || !inputs.logisticsCosts || !inputs.inventoryHoldingCosts}
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
            Cost as % of Sales
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 10)}%`, 
              backgroundColor: result >= 30 ? 'green' : result >= 20 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Sales Revenue: ${inputs.salesRevenue.toLocaleString()}</div>
            <div>COGS: ${inputs.costOfGoodsSold.toLocaleString()}</div>
            <div>Logistics Costs: ${inputs.logisticsCosts.toLocaleString()}</div>
            <div>Inventory Holding Costs: ${inputs.inventoryHoldingCosts.toLocaleString()}</div>
            <div>Total Supply Chain Costs: ${(inputs.costOfGoodsSold + inputs.logisticsCosts + inputs.inventoryHoldingCosts).toLocaleString()}</div>
            <div>Cost as % of Sales: {result.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Cost %: {result.toFixed(1)}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}