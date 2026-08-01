"use client";
import React, { useState } from 'react';

const MarketNeutralReturnCalculator: React.FC = () => {
  const [stockReturn, setStockReturn] = useState(12.0);
  const [marketReturn, setMarketReturn] = useState(10.0);
  const [beta, setBeta] = useState(1.0);
  const [riskFree, setRiskFree] = useState(4.5);
  const [alpha, setAlpha] = useState<number | null>(null);

  const handleCalculate = () => {
    const riskPremium = marketReturn - riskFree;
    const expectedReturn = riskFree + beta * riskPremium;
    const alphaValue = stockReturn - expectedReturn;
    setAlpha(alphaValue);
  };

  return (
    <div>
      <h1>Market Neutral Return Calculator</h1>
      <div>
        <label>
          Stock Return (%):
          <input
            type="number"
            value={stockReturn}
            onChange={(e) => setStockReturn(parseFloat(e.target.value))}
            step="0.01"
          />
        </label>
      </div>
      <div>
        <label>
          Market Return (%):
          <input
            type="number"
            value={marketReturn}
            onChange={(e) => setMarketReturn(parseFloat(e.target.value))}
            step="0.01"
          />
        </label>
      </div>
      <div>
        <label>
          Beta:
          <input
            type="number"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            step="0.01"
          />
        </label>
      </div>
      <div>
        <label>
          Risk Free Rate (%):
          <input
            type="number"
            value={riskFree}
            onChange={(e) => setRiskFree(parseFloat(e.target.value))}
            step="0.01"
          />
        </label>
      </div>
      <button onClick={handleCalculate}>Calculate</button>
      {alpha !== null && (
        <div>
          <p>Alpha (Market Neutral Return): {alpha.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default MarketNeutralReturnCalculator;