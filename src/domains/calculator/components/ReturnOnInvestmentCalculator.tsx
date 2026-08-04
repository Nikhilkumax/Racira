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
export interface ReturnOnInvestmentInput {
  initialInvestment: number;
  finalValue: number;
  investmentPeriodYears: number;
}

// Pure calculation function — zero React, fully typed
export function calculateReturnOnInvestment(
  input: ReturnOnInvestmentInput
): number {
  // Calculate ROI (Return on Investment)
  const roi = ((input.finalValue - input.initialInvestment) / input.initialInvestment) * 100;
  
  return Math.round(roi * 10); // Round to 1 decimal place
}

// DEFAULTS object — realistic values
const DEFAULTS: ReturnOnInvestmentInput = {
  initialInvestment: 10000,
  finalValue: 15000,
  investmentPeriodYears: 3
};

// Component
import { useState, useEffect } from 'react';

export default function ReturnOnInvestmentCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateReturnOnInvestment(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateReturnOnInvestment(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateReturnOnInvestment(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateReturnOnInvestment(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="initialInvestment"
            defaultValue={inputs.initialInvestment}
            onChange={(e) => setInputs({...inputs, initialInvestment: parseFloat(e.target.value)})}
            placeholder="Initial Investment ($)"
            min="0"
          />
          <input
            type="number"
            name="finalValue"
            defaultValue={inputs.finalValue}
            onChange={(e) => setInputs({...inputs, finalValue: parseFloat(e.target.value)})}
            placeholder="Final Value ($)"
            min="0"
          />
          <input
            type="number"
            name="investmentPeriodYears"
            defaultValue={inputs.investmentPeriodYears}
            onChange={(e) => setInputs({...inputs, investmentPeriodYears: parseFloat(e.target.value)})}
            placeholder="Investment Period (Years)"
            min="1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.initialInvestment || !inputs.finalValue || !inputs.investmentPeriodYears}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.initialInvestment || !inputs.finalValue || !inputs.investmentPeriodYears}
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
            Return on Investment (%)
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 50)}%`, 
              backgroundColor: result >= 100 ? 'green' : result >= 50 ? 'orange' : 'red'
            }}>
              {result.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Initial Investment: ${inputs.initialInvestment.toLocaleString()}</div>
            <div>Final Value: ${inputs.finalValue.toLocaleString()}</div>
            <div>Investment Period: {inputs.investmentPeriodYears} years</div>
            <div>Total Return: ${(inputs.finalValue - inputs.initialInvestment).toLocaleString()}</div>
            <div>ROI: {result.toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>ROI: {result.toFixed(1)}%</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}