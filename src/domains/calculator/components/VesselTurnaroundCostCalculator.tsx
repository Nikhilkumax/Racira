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
export interface VesselTurnaroundCostInput {
  vesselType: string;
  portFees: number;
  crewCosts: number;
  cargoHandlingCosts: number;
  maintenanceCosts: number;
  turnaroundTimeDays: number;
}

// Pure calculation function — zero React, fully typed
export function calculateVesselTurnaroundCost(
  input: VesselTurnaroundCostInput
): number {
  // Calculate total costs
  const totalCosts = input.portFees + input.crewCosts + input.cargoHandlingCosts + input.maintenanceCosts;
  
  // Calculate cost per day
  const costPerDay = totalCosts / input.turnaroundTimeDays;
  
  return Math.round(costPerDay * 100); // Round to nearest whole number
}

// DEFAULTS object — realistic values
const DEFAULTS: VesselTurnaroundCostInput = {
  vesselType: "Container Ship",
  portFees: 25000,
  crewCosts: 15000,
  cargoHandlingCosts: 30000,
  maintenanceCosts: 10000,
  turnaroundTimeDays: 7
};

// Component
import { useState, useEffect } from 'react';

export default function VesselTurnaroundCostCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateVesselTurnaroundCost(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateVesselTurnaroundCost(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateVesselTurnaroundCost(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateVesselTurnaroundCost(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="text"
            name="vesselType"
            defaultValue={inputs.vesselType}
            onChange={(e) => setInputs({...inputs, vesselType: e.target.value})}
            placeholder="Vessel Type"
            minLength={1}
            maxLength={50}
          />
          <input
            type="number"
            name="portFees"
            defaultValue={inputs.portFees}
            onChange={(e) => setInputs({...inputs, portFees: parseFloat(e.target.value)})}
            placeholder="Port Fees ($)"
            min="0"
          />
          <input
            type="number"
            name="crewCosts"
            defaultValue={inputs.crewCosts}
            onChange={(e) => setInputs({...inputs, crewCosts: parseFloat(e.target.value)})}
            placeholder="Crew Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="cargoHandlingCosts"
            defaultValue={inputs.cargoHandlingCosts}
            onChange={(e) => setInputs({...inputs, cargoHandlingCosts: parseFloat(e.target.value)})}
            placeholder="Cargo Handling Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="maintenanceCosts"
            defaultValue={inputs.maintenanceCosts}
            onChange={(e) => setInputs({...inputs, maintenanceCosts: parseFloat(e.target.value)})}
            placeholder="Maintenance Costs ($)"
            min="0"
          />
          <input
            type="number"
            name="turnaroundTimeDays"
            defaultValue={inputs.turnaroundTimeDays}
            onChange={(e) => setInputs({...inputs, turnaroundTimeDays: parseFloat(e.target.value)})}
            placeholder="Turnaround Time (Days)"
            min="1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.vesselType || !inputs.portFees || !inputs.crewCosts || !inputs.cargoHandlingCosts || !inputs.maintenanceCosts || !inputs.turnaroundTimeDays}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.vesselType || !inputs.portFees || !inputs.crewCosts || !inputs.cargoHandlingCosts || !inputs.maintenanceCosts || !inputs.turnaroundTimeDays}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            ${result.toLocaleString()}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Cost Per Day (USD)
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 10000)}%`, 
              backgroundColor: result >= 5000 ? 'green' : result >= 3000 ? 'orange' : 'red'
            }}>
              ${result.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Vessel Type: {inputs.vesselType}</div>
            <div>Port Fees: ${inputs.portFees.toLocaleString()}</div>
            <div>Crew Costs: ${inputs.crewCosts.toLocaleString()}</div>
            <div>Cargo Handling: ${inputs.cargoHandlingCosts.toLocaleString()}</div>
            <div>Maintenance: ${inputs.maintenanceCosts.toLocaleString()}</div>
            <div>Turnaround Time: {inputs.turnaroundTimeDays} days</div>
            <div>Total Costs: ${(inputs.portFees + inputs.crewCosts + inputs.cargoHandlingCosts + inputs.maintenanceCosts).toLocaleString()}</div>
            <div>Cost Per Day: ${result.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Cost Per Day: ${result.toLocaleString()}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}