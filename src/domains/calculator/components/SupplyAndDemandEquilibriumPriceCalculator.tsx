"use client";
import React, { useState } from 'react';

const SupplyAndDemandEquilibriumPriceCalculator: React.FC = () => {
  const [a, setA] = useState(100);
  const [b, setB] = useState(2);
  const [c, setC] = useState(20);
  const [d, setD] = useState(1.5);
  const [result, setResult] = useState<{ price: number; quantity: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateEquilibrium = () => {
    setError(null);
    if (b + d === 0) {
      setError('Division by zero: b + d cannot be zero.');
      return;
    }
    const price = (a - c) / (b + d);
    const quantity = a - b * price; // or c + d * price
    setResult({ price, quantity });
  };

  return (
    <div>
      <h1>Supply and Demand Equilibrium Price Calculator</h1>
      <div>
        <label>
          Demand intercept (a):{' '}
          <input
            type="number"
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value))}
            step="any"
          />
        </label>
      </div>
      <div>
        <label>
          Demand slope (b):{' '}
          <input
            type="number"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            step="any"
          />
        </label>
      </div>
      <div>
        <label>
          Supply intercept (c):{' '}
          <input
            type="number"
            value={c}
            onChange={(e) => setC(parseFloat(e.target.value))}
            step="any"
          />
        </label>
      </div>
      <div>
        <label>
          Supply slope (d):{' '}
          <input
            type="number"
            value={d}
            onChange={(e) => setD(parseFloat(e.target.value))}
            step="any"
          />
        </label>
      </div>
      <button onClick={calculateEquilibrium}>Calculate</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div>
          <h2>Equilibrium Result</h2>
          <p>Equilibrium Price (P*): {result.price.toFixed(2)}</p>
          <p>Equilibrium Quantity (Q*): {result.quantity.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default SupplyAndDemandEquilibriumPriceCalculator;