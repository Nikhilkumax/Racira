export interface OneThreeFiveInputs {
  availableHours: number;
  bigTaskHours: number;
  mediumTaskHours: number;
  smallTaskHours: number;
}

export interface OneThreeFiveResults {
  bigTasks: number;
  mediumTasks: number;
  smallTasks: number;
  totalTasks: number;
  productivityScore: number;
  remainingHours: number;
}

export const DEFAULTS: OneThreeFiveInputs = {
  availableHours: 8,
  bigTaskHours: 3,
  mediumTaskHours: 1.5,
  smallTaskHours: 0.5,
};

export const calculateOneThreeFive = (inputs: OneThreeFiveInputs): OneThreeFiveResults => {
  const { availableHours, bigTaskHours, mediumTaskHours, smallTaskHours } = inputs;

  const avail = Math.max(0.5, availableHours);
  const bigH = Math.max(0.5, bigTaskHours);
  const medH = Math.max(0.25, mediumTaskHours);
  const smallH = Math.max(0.1, smallTaskHours);

  const maxBig = Math.floor(avail / bigH);
  const remainingAfterBig = avail - maxBig * bigH;
  const maxMedium = Math.floor(remainingAfterBig / medH);
  const remainingAfterMedium = remainingAfterBig - maxMedium * medH;
  const maxSmall = Math.floor(remainingAfterMedium / smallH);
  const remainingHours = Math.round((remainingAfterMedium - maxSmall * smallH) * 100) / 100;

  const totalTasks = maxBig + maxMedium + maxSmall;
  const maxPossible = 1 + 3 + 5;
  const productivityScore = Math.round((totalTasks / maxPossible) * 100);

  return {
    bigTasks: Math.min(maxBig, 1),
    mediumTasks: Math.min(maxMedium, 3),
    smallTasks: Math.min(maxSmall, 5),
    totalTasks,
    productivityScore,
    remainingHours,
  };
};
