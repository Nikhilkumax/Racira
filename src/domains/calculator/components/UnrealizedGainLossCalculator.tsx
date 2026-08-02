"use client";
import React, { useState } from 'react';

const DEFAULTS = {
  purchasePrice: 1000,
  currentValue: 1200,
};

interface GainLossResult {
  unrealizedGainLoss: number;
  gainLossPercentage: number;
  currentValue: number;
  costBasis: number;
  percentChange: number;
}

const UnrealizedGainLossCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState<number>(DEFAULTS.purchasePrice);
  const [currentValue, setCurrentValue] = useState<number>(DEFAULTS.currentValue);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [results, setResults] = useState<GainLossResult | null>(null);

  const calculate = () => {
    const purchase = purchasePrice || 0;
    const current = currentValue || 0;
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
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
            step="any"
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Current Value:
          <input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(Number(e.target.value))}
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