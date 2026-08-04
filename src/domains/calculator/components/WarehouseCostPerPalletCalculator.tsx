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
export interface WarehouseCostPerPalletInput {
  palletCount: number;
  palletValue: number;
  storageCostPerPallet: number;
  handlingCostPerPallet: number;
  rentalDurationDays: number;
}

// Pure calculation function — zero React, fully typed
export function calculateWarehouseCostPerPallet(
  input: WarehouseCostPerPalletInput
): number {
  // Calculate total storage cost
  const storageCost = input.storageCostPerPallet * input.palletCount * input.rentalDurationDays;
  
  // Calculate total handling cost
  const handlingCost = input.handlingCostPerPallet * input.palletCount;
  
  // Calculate total cost
  const totalCost = storageCost + handlingCost;
  
  // Calculate cost per pallet
  const costPerPallet = totalCost / input.palletCount;
  
  return Math.round(costPerPallet * 100); // Round to nearest cent
}

// DEFAULTS object — realistic values
const DEFAULTS: WarehouseCostPerPalletInput = {
  palletCount: 1000,
  palletValue: 500,
  storageCostPerPallet: 0.5,
  handlingCostPerPallet: 2.0,
  rentalDurationDays: 30
};

// Component
import { useState, useEffect } from 'react';

export default function WarehouseCostPerPalletCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateWarehouseCostPerPallet(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateWarehouseCostPerPallet(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateWarehouseCostPerPallet(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateWarehouseCostPerPallet(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="palletCount"
            defaultValue={inputs.palletCount}
            onChange={(e) => setInputs({...inputs, palletCount: parseFloat(e.target.value)})}
            placeholder="Pallet Count"
            min="1"
          />
          <input
            type="number"
            name="palletValue"
            defaultValue={inputs.palletValue}
            onChange={(e) => setInputs({...inputs, palletValue: parseFloat(e.target.value)})}
            placeholder="Pallet Value ($)"
            min="0"
          />
          <input
            type="number"
            name="storageCostPerPallet"
            defaultValue={inputs.storageCostPerPallet}
            onChange={(e) => setInputs({...inputs, storageCostPerPallet: parseFloat(e.target.value)})}
            placeholder="Storage Cost/Pallet ($)"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            name="handlingCostPerPallet"
            defaultValue={inputs.handlingCostPerPallet}
            onChange={(e) => setInputs({...inputs, handlingCostPerPallet: parseFloat(e.target.value)})}
            placeholder="Handling Cost/Pallet ($)"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            name="rentalDurationDays"
            defaultValue={inputs.rentalDurationDays}
            onChange={(e) => setInputs({...inputs, rentalDurationDays: parseFloat(e.target.value)})}
            placeholder="Rental Duration (Days)"
            min="1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.palletCount || !inputs.palletValue || !inputs.storageCostPerPallet || !inputs.handlingCostPerPallet || !inputs.rentalDurationDays}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.palletCount || !inputs.palletValue || !inputs.storageCostPerPallet || !inputs.handlingCostPerPallet || !inputs.rentalDurationDays}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            ${result.toFixed(2)}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Cost Per Pallet (USD)
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 50)}%`, 
              backgroundColor: result >= 150 ? 'green' : result >= 100 ? 'orange' : 'red'
            }}>
              ${result.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Pallet Count: {inputs.palletCount}</div>
            <div>Pallet Value: ${inputs.palletValue.toLocaleString()}</div>
            <div>Storage Cost/Pallet: ${inputs.storageCostPerPallet.toFixed(2)}</div>
            <div>Handling Cost/Pallet: ${inputs.handlingCostPerPallet.toFixed(2)}</div>
            <div>Rental Duration: {inputs.rentalDurationDays} days</div>
            <div>Total Storage Cost: ${(inputs.storageCostPerPallet * inputs.palletCount * inputs.rentalDurationDays).toLocaleString()}</div>
            <div>Total Handling Cost: ${(inputs.handlingCostPerPallet * inputs.palletCount).toLocaleString()}</div>
            <div>Total Cost: ${(inputs.storageCostPerPallet * inputs.palletCount * inputs.rentalDurationDays + inputs.handlingCostPerPallet * inputs.palletCount).toLocaleString()}</div>
            <div>Cost Per Pallet: ${result.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Cost Per Pallet: ${result.toFixed(2)}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}