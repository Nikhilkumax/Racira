"use client";
import React, { useState } from 'react';

const SirdEpidemicModelCalculator: React.FC = () => {
  const [S, setS] = useState(990);
  const [I, setI] = useState(10);
  const [R, setR] = useState(0);
  const [D, setD] = useState(0);
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [delta, setDelta] = useState(0.05);
  const [days, setDays] = useState(30);
  const [results, setResults] = useState<Array<{ day: number; S: number; I: number; R: number; D: number }>>([]);

  const calculate = () => {
    const N = S + I + R + D;
    let _S = S;
    let _I = I;
    let _R = R;
    let _D = D;
    const results: Array<{ day: number; S: number; I: number; R: number; D: number }> = [];
    results.push({ day: 0, S: _S, I: _I, R: _R, D: _D });

    for (let day = 1; day <= days; day++) {
      const dS = (-beta * _S * _I) / N;
      const dI = (beta * _S * _I) / N - gamma * _I - delta * _I;
      const dR = gamma * _I;
      const dD = delta * _I;

      _S += dS;
      _I += dI;
      _R += dR;
      _D += dD;

      // Ensure non-negative values
      _S = Math.max(0, _S);
      _I = Math.max(0, _I);
      _R = Math.max(0, _R);
      _D = Math.max(0, _D);

      results.push({ day, S: _S, I: _I, R: _R, D: _D });
    }

    setResults(results);
  };

  return (
    <div>
      <h1>SIRD Epidemic Model Calculator</h1>
      <div>
        <div>
          <label>Susceptible (S): </label>
          <input
            type="number"
            value={S}
            onChange={(e) => setS(Number(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <label>Infected (I): </label>
          <input
            type="number"
            value={I}
            onChange={(e) => setI(Number(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <label>Recovered (R): </label>
          <input
            type="number"
            value={R}
            onChange={(e) => setR(Number(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <label>Deceased (D): </label>
          <input
            type="number"
            value={D}
            onChange={(e) => setD(Number(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <label>Beta (β): </label>
          <input
            type="number"
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label>Gamma (γ): </label>
          <input
            type="number"
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label>Delta (δ): </label>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label>Days: </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            min="0"
          />
        </div>
        <button onClick={calculate}>Calculate</button>
      </div>
      {results.length > 0 && (
        <div>
          <h2>Results</h2>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Susceptible</th>
                <th>Infected</th>
                <th>Recovered</th>
                <th>Deceased</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{row.S.toFixed(2)}</td>
                  <td>{row.I.toFixed(2)}</td>
                  <td>{row.R.toFixed(2)}</td>
                  <td>{row.D.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SirdEpidemicModelCalculator;