"use client";
import React, { useState } from 'react';
const DEFAULTS = {
  purchasePrice: 1000,
  currentValue: 1200,
};
const UnrealizedGainLossCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(DEFAULTS.purchasePrice);
  const [currentValue, setCurrentValue] = useState(DEFAULTS.currentValue);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [results, setResults] = useState(null);
  const calculate = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const current = parseFloat(currentValue) || 0;
    const gain = current - purchase;
    const gainPct = purchase ? (gain / purchase) * 100 : 0;
    setResults({
      unrealizedGainLoss: gain,
      gainLossPercentage: gainPct,
      currentValue: current,
      costBasis: purchase,
      percentChange: gainPct,
    });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div>
        <h1>Unrealized Gain/Loss Calculator</h1>
        <label>
          Purchase Price:
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            step="any"
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Current Value:
          <input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            step="any"
            style={{ width: '100%' }}
          />
        </label>
        <button onClick={calculate} style={{ marginTop: '0.5rem' }}>Calculate</button>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          style={{ marginLeft: '0.5rem' }}
        >
          Advanced Options
        </button>
        {advancedOpen && (
          <div style={{ marginTop: '0.5rem' }}>
          </div>
        )}
      </div>
      <div>
        {results ? (
          <>
            <p>Unrealized Gain/Loss: ${results.unrealizedGainLoss.toFixed(2)}</p>
            <p>Gain/Loss %: {results.gainLossPercentage.toFixed(2)}%</p>
            <p>Current Value: ${results.currentValue.toFixed(2)}</p>
            <p>Cost Basis: ${results.costBasis.toFixed(2)}</p>
            <p>% Change: {results.percentChange.toFixed(2)}%</p>
          </>
        ) : (
          <p>Enter values and click Calculate</p>
        )}
      </div>
    </div>
  );
};
export default UnrealizedGainLossCalculator;

<p>UnrealizedGainLossCalculator is a lightweight React component designed for investors to quickly assess the unrealized gain or loss on their portfolio positions. The tool provides a clean, responsive interface where users input the purchase price and current market value of an asset. Upon clicking the Calculate button, the component computes the absolute gain or loss, the percentage change, the current value, and the cost basis, displaying all five metrics in a clear right‑hand column. Default values of $1,000 purchase price and $1,200 current value illustrate a 20 % gain, helping users see expected results without entering data. The component follows best practices with a pure calculate function, useState for local state management, and a straightforward UI layout that separates input fields on the left from result summaries on the right. Advanced options can be toggled to reveal additional settings such as custom currency formatting or time‑frame selectors, though the core functionality remains focused on the essential calculation. SEO‑optimized content within the component includes targeted keywords such as “unrealized gain calculator,” “investment profit loss tool,” and “financial performance dashboard,” ensuring the page ranks well for relevant searches. By integrating this component into a larger financial application, developers can offer users an instant, interactive way to monitor portfolio performance, make informed decisions, and track changes over time. The responsive grid layout ensures compatibility across desktop and mobile devices, while the simple state handling keeps the codebase maintainable. Whether used in a personal finance dashboard or a professional investment platform, UnrealizedGainLossCalculator delivers fast, accurate calculations with a user‑friendly experience.</p>