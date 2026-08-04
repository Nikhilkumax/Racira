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
export interface ReturnOnMarketingInvestmentInput {
  campaignCost: number;
  campaignRevenue: number;
  campaignDurationWeeks: number;
}

// Pure calculation function — zero React, fully typed
export function calculateReturnOnMarketingInvestment(
  input: ReturnOnMarketingInvestmentInput
): number {
  // Calculate total revenue over campaign duration
  const totalRevenue = input.campaignRevenue * input.campaignDurationWeeks;
  
  // Calculate total cost over campaign duration
  const totalCost = input.campaignCost * input.campaignDurationWeeks;
  
  // Calculate ROI (Return on Investment)
  const roi = (totalRevenue - totalCost) / totalCost;
  
  return Math.round(roi * 100); // Round to nearest whole number (percentage)
}

// DEFAULTS object — realistic values
const DEFAULTS: ReturnOnMarketingInvestmentInput = {
  campaignCost: 5000,
  campaignRevenue: 15000,
  campaignDurationWeeks: 4
};

// Component
import { useState, useEffect } from 'react';

export default function ReturnOnMarketingInvestmentCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateReturnOnMarketingInvestment(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateReturnOnMarketingInvestment(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateReturnOnMarketingInvestment(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateReturnOnMarketingInvestment(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="campaignCost"
            defaultValue={inputs.campaignCost}
            onChange={(e) => setInputs({...inputs, campaignCost: parseFloat(e.target.value)})}
            placeholder="Campaign Cost ($)"
            min="0"
          />
          <input
            type="number"
            name="campaignRevenue"
            defaultValue={inputs.campaignRevenue}
            onChange={(e) => setInputs({...inputs, campaignRevenue: parseFloat(e.target.value)})}
            placeholder="Campaign Revenue ($/week)"
            min="0"
          />
          <input
            type="number"
            name="campaignDurationWeeks"
            defaultValue={inputs.campaignDurationWeeks}
            onChange={(e) => setInputs({...inputs, campaignDurationWeeks: parseFloat(e.target.value)})}
            placeholder="Duration (Weeks)"
            min="1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.campaignCost || !inputs.campaignRevenue || !inputs.campaignDurationWeeks}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.campaignCost || !inputs.campaignRevenue || !inputs.campaignDurationWeeks}
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
            ROI (%)
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 50)}%`, 
              backgroundColor: result >= 100 ? 'green' : result >= 50 ? 'orange' : 'red'
            }}>
              {result}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Campaign Cost: ${inputs.campaignCost.toLocaleString()}</div>
            <div>Campaign Revenue: ${inputs.campaignRevenue.toLocaleString()}/week</div>
            <div>Duration: {inputs.campaignDurationWeeks} weeks</div>
            <div>Total Revenue: ${(inputs.campaignRevenue * inputs.campaignDurationWeeks).toLocaleString()}</div>
            <div>Total Cost: ${(inputs.campaignCost * inputs.campaignDurationWeeks).toLocaleString()}</div>
            <div>Net Profit: ${(inputs.campaignRevenue * inputs.campaignDurationWeeks - inputs.campaignCost * inputs.campaignDurationWeeks).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>ROI: {result}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}