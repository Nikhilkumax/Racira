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
export interface LogisticsCostAsOfRevenueInput {
  revenue: number;
  logisticsCosts: number;
  transportationCosts: number;
  warehousingCosts: number;
  inventoryHoldingCosts: number;
}

// Pure calculation function — zero React, fully typed
export function calculateLogisticsCostAsOfRevenue(
  input: LogisticsCostAsOfRevenueInput
): number {
  // Calculate total logistics costs
  const totalLogisticsCosts = input.logisticsCosts + input.transportationCosts + input.warehousingCosts + input.inventoryHoldingCosts;
  
  // Calculate logistics cost as percentage of revenue
  const logisticsCostPercentage = (totalLogisticsCosts / input.revenue) * 100;
  
  return Math.round(logisticsCostPercentage * 10); // Round to 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: LogisticsCostAsOfRevenueInput = {
  revenue: 2000000,
  logisticsCosts: 200000,
  transportationCosts: 300000,
  warehousingCosts: 150000,
  inventoryHoldingCosts: 100000
};

// Component
import { useState, useEffect } from 'react';

export default function LogisticsCostAsOfRevenueCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateLogisticsCostAsOfRevenue(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateLogisticsCostAsOfRevenue(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateLogisticsCostAsOfRevenue(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateLogisticsCostAsOfRevenue(DEFAULTS));
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
            name="logisticsCosts"
            defaultValue={inputs.logisticsCosts}
            onChange={(e) => setInputs({...inputs, logisticsCosts: parseFloat(e.target.value)})}
            placeholder="Logistics Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="transportationCosts"
            defaultValue={inputs.transportationCosts}
            onChange={(e) => setInputs({...inputs, transportationCosts: parseFloat(e.target.value)})}
            placeholder="Transportation Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="warehousingCosts"
            defaultValue={inputs.warehousingCosts}
            onChange={(e) => setInputs({...inputs, warehousingCosts: parseFloat(e.target.value)})}
            placeholder="Warehousing Costs ($)"
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
            disabled={!inputs.revenue || !inputs.logisticsCosts || !inputs.transportationCosts || !inputs.warehousingCosts || !inputs.inventoryHoldingCosts}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.revenue || !inputs.logisticsCosts || !inputs.transportationCosts || !inputs.warehousingCosts || !inputs.inventoryHoldingCosts}
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
            Logistics Cost as % of Revenue
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 5)}%`, 
              backgroundColor: result >= 30 ? 'green' : result >= 20 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Revenue: ${inputs.revenue.toLocaleString()}</div>
            <div>Logistics Costs: ${inputs.logisticsCosts.toLocaleString()}</div>
            <div>Transportation Costs: ${inputs.transportationCosts.toLocaleString()}</div>
            <div>Warehousing Costs: ${inputs.warehousingCosts.toLocaleString()}</div>
            <div>Inventory Holding Costs: ${inputs.inventoryHoldingCosts.toLocaleString()}</div>
            <div>Total Logistics Costs: ${(inputs.logisticsCosts + inputs.transportationCosts + inputs.warehousingCosts + inputs.inventoryHoldingCosts).toLocaleString()}</div>
            <div>Logistics Cost %: {result.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Logistics Cost %: {result.toFixed(1)}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}