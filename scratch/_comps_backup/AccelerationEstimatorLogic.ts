export interface AccelerationEstimatorInputs {
  horsepower: number;
  weight: number;
  drivetrain: "fwd" | "rwd" | "awd";
  transmission: "manual" | "automatic" | "dct" | "cvt";
  tireType: "summer" | "allseason" | "winter" | "performance";
}

export interface AccelerationEstimatorResults {
  zeroToSixty: number;
  quarterMile: number;
  topSpeed: number;
  powerToWeight: number;
  drivetrainLoss: number;
}

export const DEFAULTS: AccelerationEstimatorInputs = {
  horsepower: 300,
  weight: 3500,
  drivetrain: "rwd",
  transmission: "manual",
  tireType: "summer",
};

export const calculateAccelerationEstimator = (inputs: AccelerationEstimatorInputs): AccelerationEstimatorResults => {
  const { horsepower, weight, drivetrain, transmission, tireType } = inputs;

  const hp = Math.max(50, horsepower);
  const wt = Math.max(1000, weight);

  const drivetrainFactors: Record<string, number> = {
    fwd: 1.08,
    rwd: 1.0,
    awd: 0.96,
  };

  const transmissionFactors: Record<string, number> = {
    manual: 1.0,
    automatic: 1.03,
    dct: 0.98,
    cvt: 1.02,
  };

  const tireFactors: Record<string, number> = {
    summer: 1.0,
    performance: 0.97,
    allseason: 1.04,
    winter: 1.12,
  };

  const df = drivetrainFactors[drivetrain] || 1.0;
  const tf = transmissionFactors[transmission] || 1.0;
  const tireF = tireFactors[tireType] || 1.0;

  const combinedFactor = df * tf * tireF;

  const zeroToSixty = 5.0 * Math.pow(wt / 1000, 0.45) / Math.pow(hp / 100, 0.35) * combinedFactor;
  const quarterMile = zeroToSixty * 1.45 + 1.2;
  const topSpeed = 75 + (hp / wt) * 55;
  const powerToWeight = hp / (wt / 1000);
  const drivetrainLoss = ((combinedFactor - 1.0) * 100);

  return {
    zeroToSixty: Math.round(zeroToSixty * 10) / 10,
    quarterMile: Math.round(quarterMile * 10) / 10,
    topSpeed: Math.round(topSpeed),
    powerToWeight: Math.round(powerToWeight * 10) / 10,
    drivetrainLoss: Math.round(drivetrainLoss * 10) / 10,
  };
};
