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
export interface DebtServiceCoverageRatioInput {
  loanAmount: number;
  loanTermYears: number;
  annualInterestRate: number;
}

// Pure calculation function — zero React, fully typed
export function calculateDebtServiceCoverageRatio(
  input: DebtServiceCoverageRatioInput
): number {
  // Standard mortgage payment formula
  const monthlyRate = input.annualInterestRate / 12 / 100;
  const n = input.loanTermYears * 12;

  if (input.loanAmount <= 0 || monthlyRate <= 0 || n <= 0) {
    return 0;
  }

  const payment = (input.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
                 (Math.pow(1 + monthlyRate, n) - 1);

  // Debt Service Coverage Ratio = Net Operating Income / Debt Service
  // For this calculator, we assume NOI = loanAmount (simplified for demonstration)
  const dscRatio = input.loanAmount / payment;
  
  return Math.round(dscRatio * 100); // Round to nearest whole number
}

// DEFAULTS object — realistic values
const DEFAULTS: DebtServiceCoverageRatioInput = {
  loanAmount: 500000,
  loanTermYears: 30,
  annualInterestRate: 6.5
};

// Component
import { useState, useEffect } from 'react';

export default function DebtServiceCoverageRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateDebtServiceCoverageRatio(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateDebtServiceCoverageRatio(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateDebtServiceCoverageRatio(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateDebtServiceCoverageRatio(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="loanAmount"
            defaultValue={inputs.loanAmount}
            onChange={(e) => setInputs({...inputs, loanAmount: parseFloat(e.target.value)})}
            placeholder="Loan Amount ($)"
            min="0"
          />
          <input
            type="number"
            name="loanTermYears"
            defaultValue={inputs.loanTermYears}
            onChange={(e) => setInputs({...inputs, loanTermYears: parseFloat(e.target.value)})}
            placeholder="Term (Years)"
            min="1"
          />
          <input
            type="number"
            name="annualInterestRate"
            defaultValue={inputs.annualInterestRate}
            onChange={(e) => setInputs({...inputs, annualInterestRate: parseFloat(e.target.value)})}
            placeholder="Interest Rate (%)"
            min="0"
            step="0.1"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.loanAmount || !inputs.loanTermYears || !inputs.annualInterestRate}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.loanAmount || !inputs.loanTermYears || !inputs.annualInterestRate}
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-card">
          <div className="result-label">Primary Result</div>
          <div className="result-value text-4xl font-bold text-primary">
            {result.toLocaleString()}
          </div>
          <div className="result-subtext text-sm text-muted-foreground">
            Debt Service Coverage Ratio
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 50)}%`, 
              backgroundColor: result >= 2.0 ? 'green' : result >= 1.5 ? 'orange' : 'red'
            }}>
              {result}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Loan Amount: ${inputs.loanAmount.toLocaleString()}</div>
            <div>Term: {inputs.loanTermYears} years</div>
            <div>Rate: {inputs.annualInterestRate}%</div>
            <div>Monthly Payment: ${calculateMonthlyPayment(inputs).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Primary Result: {result}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate monthly payment
function calculateMonthlyPayment(input: DebtServiceCoverageRatioInput): number {
  const monthlyRate = input.annualInterestRate / 12 / 100;
  const n = input.loanTermYears * 12;

  if (input.loanAmount <= 0 || monthlyRate <= 0 || n <= 0) {
    return 0;
  }

  return (input.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
         (Math.pow(1 + monthlyRate, n) - 1);
}

// Add CSS styles for the calculator
const style = `
/* Base styling */
.calculator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.input-row > div {
  display: flex;
  flex-direction: column;
}

input {
  padding: 8px;
  border: 1px solid var(--border-input);
  background-color: var(--bg-background);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: 2px solid var(--border-primary);
  border-color: var(--border-primary);
}

.calculate-button {
  grid-column: 1 / -1;
  padding: 10px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calculate-button:hover {
  background-color: var(--color-primary-dark);
}

.reset-button {
  grid-column: 1 / -1;
  padding: 10px;
  background-color: var(--bg-background);
  border: 1px solid var(--border-input);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 32px;
}

.result-card {
  background-color: var(--bg-muted);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.result-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted-foreground);
  margin-bottom: 4px;
}

.result-value {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
}

.result-subtext {
  font-size: 0.8rem;
  color: var(--text-muted-foreground);
  text-align: center;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.summary-stats > div {
  background-color: var(--bg-muted/30);
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}

input[type="number"] {
  padding: 8px;
  height: 36px;
  border-radius: 4px;
}

.calculate-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calculate-button:hover {
  background-color: var(--color-primary-dark);
}

.reset-button {
  background-color: var(--bg-background);
  border: 1px solid var(--border-input);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.result-card {
  background-color: var(--bg-muted/10);
  border-left: 4px solid var(--color-primary);
  border-radius: 4px;
  padding: 16px;
}

.result-value {
  font-size: 4xl;
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
}

.result-subtext {
  font-size: 0.8rem;
  color: var(--text-muted-foreground);
  margin-top: 4px;
}

input {
  h-10;
  text-base;
}

label {
  text-sm;
  font-medium;
  mb-1;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
}

gap-3 {
  gap: 3px;
}

p-4 {
  padding: 4px;
}

text-sm {
  font-size: 0.875rem;
}

text-muted-foreground {
  color: var(--text-muted-foreground);
}

bg-primary/10 {
  background-color: var(--color-primary/10);
}

border-l-4 {
  border-left-width: 4px;
}

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
}

text-muted-foreground {
  color: var(--text-muted-foreground);
}

bg-background {
  background-color: var(--background);
}

border-input {
  border-color: var(--border-input);
}

bg-primary {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
}

bg-background {
  --background: #f9fafb;
}

border-input {
  --border-input: #e5e7eb;
}

text-muted-foreground {
  --text-muted-foreground: #6b7280;
}

text-primary {
  --text-primary: #111827;
}

bg-muted {
  --bg-muted: #f3f4f6;
}

bg-muted/30 {
  background-color: var(--bg-muted/30);
}

bg-primary/10 {
  background-color: var(--color-primary/10);
}

border-l-4 {
  border-left-width: 4px;
}
`;