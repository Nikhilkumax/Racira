export interface ZeroSixtyInputs {
  horsepower: number;
  weight: number;
  driveType: "fwd" | "rwd" | "awd";
  tireCondition: "new" | "good" | "worn";
}

export interface ZeroSixtyResults {
  zeroToSixty: number;
  quarterMile: number;
  topSpeed: number;
  brakingDistance: number;
  powerToWeight: number;
}

export const DEFAULTS: ZeroSixtyInputs = {
  horsepower: 280,
  weight: 3200,
  driveType: "rwd",
  tireCondition: "good",
};

export const calculateZeroSixty = (inputs: ZeroSixtyInputs): ZeroSixtyResults => {
  const { horsepower, weight, driveType, tireCondition } = inputs;

  const hp = Math.max(50, horsepower);
  const wt = Math.max(1000, weight);

  const driveFactors: Record<string, number> = {
    fwd: 1.06,
    rwd: 1.0,
    awd: 0.94,
  };

  const tireFactors: Record<string, number> = {
    new: 1.0,
    good: 1.03,
    worn: 1.08,
  };

  const df = driveFactors[driveType] || 1.0;
  const tf = tireFactors[tireCondition] || 1.0;
  const combinedFactor = df * tf;

  const zeroToSixty = 4.2 * Math.pow(wt / 1000, 0.42) / Math.pow(hp / 100, 0.38) * combinedFactor;
  const quarterMile = zeroToSixty * 1.52 + 0.8;
  const topSpeed = 70 + Math.pow(hp / (wt / 1000), 0.65) * 18;
  const brakingDistance = (wt / 1000) * 3.5 + (hp / 100) * 0.5;
  const powerToWeight = hp / (wt / 1000);

  return {
    zeroToSixty: Math.round(zeroToSixty * 10) / 10,
    quarterMile: Math.round(quarterMile * 10) / 10,
    topSpeed: Math.round(topSpeed),
    brakingDistance: Math.round(brakingDistance * 10) / 10,
    powerToWeight: Math.round(powerToWeight * 10) / 10,
  };
};
