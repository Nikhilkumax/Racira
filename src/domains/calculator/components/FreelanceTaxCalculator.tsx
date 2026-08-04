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
export interface FreelanceTaxInput {
  income: number;
  filingStatus: 'Single' | 'Married Filing Jointly' | 'Head of Household';
  deductions: number;
}

// Pure calculation function — zero React, fully typed
export function calculateFreelanceTax(
  input: FreelanceTaxInput
): number {
  // Simplified tax calculation for demonstration
  let taxableIncome = input.income - input.deductions;
  
  // Apply tax brackets based on filing status
  let taxRate = 0;
  if (input.filingStatus === 'Single') {
    if (taxableIncome <= 10000) {
      taxRate = 0.1;
    } else if (taxableIncome <= 40000) {
      taxRate = 0.15;
    } else {
      taxRate = 0.22;
    }
  } else if (input.filingStatus === 'Married Filing Jointly') {
    if (taxableIncome <= 20000) {
      taxRate = 0.1;
    } else if (taxableIncome <= 80000) {
      taxRate = 0.15;
    } else {
      taxRate = 0.22;
    }
  } else { // Head of Household
    if (taxableIncome <= 15000) {
      taxRate = 0.1;
    } else if (taxableIncome <= 50000) {
      taxRate = 0.15;
    } else {
      taxRate = 0.22;
    }
  }
  
  const taxAmount = taxableIncome * taxRate;
  return Math.round(taxAmount * 100) / 100; // Round to 2 decimal places
}

// DEFAULTS object — realistic values
const DEFAULTS: FreelanceTaxInput = {
  income: 85000,
  filingStatus: 'Married Filing Jointly',
  deductions: 12000
};

// Component
import { useState, useEffect } from 'react';

export default function FreelanceTaxCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<number>(calculateFreelanceTax(DEFAULTS));
  
  useEffect(() => {
    setResult(calculateFreelanceTax(inputs));
  }, [inputs]);
  
  const calculate = () => {
    setResult(calculateFreelanceTax(inputs));
  };
  
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateFreelanceTax(DEFAULTS));
  };
  
  return (
    <div className="calculator-container">
      <div className="input-grid">
        <div className="input-row">
          <input
            type="number"
            name="income"
            defaultValue={inputs.income}
            onChange={(e) => setInputs({...inputs, income: parseFloat(e.target.value)})}
            placeholder="Annual Income ($)"
            min="0"
          />
          <input
            type="text"
            name="filingStatus"
            defaultValue={inputs.filingStatus}
            onChange={(e) => setInputs({...inputs, filingStatus: e.target.value as any})}
            placeholder="Filing Status"
            list="statusOptions"
          />
          <input
            type="number"
            name="deductions"
            defaultValue={inputs.deductions}
            onChange={(e) => setInputs({...inputs, deductions: parseFloat(e.target.value)})}
            placeholder="Deductions ($)"
            min="0"
          />
        </div>
        
        <div className="input-row">
          <button 
            className="calculate-button" 
            onClick={calculate}
            disabled={!inputs.income || !inputs.filingStatus || !inputs.deductions}
          >
            Calculate
          </button>
          <button 
            className="reset-button" 
            onClick={reset}
            disabled={!inputs.income || !inputs.filingStatus || !inputs.deductions}
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
            Estimated Tax Amount
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">3-Stat Bar</div>
          <div className="stat-bar">
            <div className="stat-bar-segment" style={{ 
              width: `${Math.min(100, result / 10000)}%`, 
              backgroundColor: result >= 15000 ? 'green' : result >= 10000 ? 'orange' : 'red'
            }}>
              ${result.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Breakdown</div>
          <div className="breakdown-table">
            <div>Income: ${inputs.income.toLocaleString()}</div>
            <div>Filing Status: {inputs.filingStatus}</div>
            <div>Deductions: ${inputs.deductions.toLocaleString()}</div>
            <div>Taxable Income: ${(inputs.income - inputs.deductions).toLocaleString()}</div>
            <div>Tax Rate: {inputToPercent(calculateFreelanceTax(inputs) / inputs.income)}</div>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Chart</div>
          <div className="chart-placeholder">[Chart will render here]</div>
        </div>
        
        <div className="result-card">
          <div className="result-label">Summary Statistics</div>
          <div className="summary-stats">
            <div>Tax Amount: ${result.toLocaleString()}</div>
            <div>Calculated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert to percentage
function inputToPercent(value: number): string {
  return `${Math.round((value / 85000) * 100)}%`;
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
  color: var(--color-primary);
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

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
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

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
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

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
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

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
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

border-primary {
  border-left-color: var(--color-primary);
}

text-primary {
  color: var(--color-primary);
}
`;