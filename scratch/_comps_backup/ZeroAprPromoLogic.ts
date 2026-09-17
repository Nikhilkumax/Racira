export interface ZeroAprPromoInputs {
  purchasePrice: number;
  promoMonths: number;
  regularApr: number;
  monthlyPayment: number;
}

export interface ZeroAprPromoResults {
  totalPromoCost: number;
  totalRegularCost: number;
  deferredInterest: number;
  payoffMonths: number;
  interestSaved: number;
}

export const DEFAULTS: ZeroAprPromoInputs = {
  purchasePrice: 1200,
  promoMonths: 12,
  regularApr: 24.99,
  monthlyPayment: 100,
};

export const calculateZeroAprPromo = (inputs: ZeroAprPromoInputs): ZeroAprPromoResults => {
  const { purchasePrice, promoMonths, regularApr, monthlyPayment } = inputs;

  const price = Math.max(0, purchasePrice);
  const months = Math.max(1, Math.min(60, promoMonths));
  const apr = Math.max(0, regularApr);
  const payment = Math.max(0, monthlyPayment);

  const monthlyRate = apr / 100 / 12;

  const totalPromoCost = price;
  const totalRegularCost = price * (1 + monthlyRate * months);
  const deferredInterest = totalRegularCost - totalPromoCost;

  let payoffMonths = 0;
  let balance = price;
  let totalInterest = 0;

  if (monthlyRate === 0) {
    payoffMonths = Math.ceil(price / payment);
  } else {
    for (let m = 1; m <= 120; m++) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const principal = payment - interest;
      balance = Math.max(0, balance - principal);
      payoffMonths = m;
      if (balance <= 0) break;
    }
  }

  const interestSaved = totalRegularCost - totalInterest - price;

  return {
    totalPromoCost: Math.round(totalPromoCost * 100) / 100,
    totalRegularCost: Math.round(totalRegularCost * 100) / 100,
    deferredInterest: Math.round(deferredInterest * 100) / 100,
    payoffMonths,
    interestSaved: Math.round(interestSaved * 100) / 100,
  };
};
