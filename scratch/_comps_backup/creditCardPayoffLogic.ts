/**
 * creditCardPayoffLogic.ts — calculation core for CreditCardPayoffCalculator.
 *
 * FIXED relative to the previously inlined version: the old implementation
 * pooled minimum payments with the extra payment and dumped the entire budget
 * onto the highest-priority card each month, leaving other cards' minimums
 * unpaid (their balances accrued interest instead of receiving the minimum).
 * The corrected model — which is the canonical avalanche/snowball definition —
 * pays every card's minimum first, then applies the remaining budget
 * (budget − Σ minimums) to the priority card, carrying over freed-up minimums
 * as each card is paid off.
 */
export interface CcCard {
  name: string;
  balance: number;
  rate: number;
  min: number;
}

export interface CcResult {
  totalDebt: number;
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  schedule: { name: string; balance: number; rate: number; min: number; monthsIfSolo: number | null }[];
}

export function calculateCcPayoff(
  cards: { name: string; balance: string; rate: string; min: string }[],
  extra: string,
  strategy: string
): CcResult {
  const extra$ = parseFloat(extra) || 0;
  const parsed = cards
    .map((c) => ({ name: c.name, balance: parseFloat(c.balance) || 0, rate: parseFloat(c.rate) || 0, min: parseFloat(c.min) || 0 }))
    .filter((c) => c.balance > 0);
  const totalDebt = parsed.reduce((s, c) => s + c.balance, 0);
  const totalMin = parsed.reduce((s, c) => s + c.min, 0);
  const totalMonthly = totalMin + extra$;
  const balances = parsed.map((c) => ({ ...c }));

  // Independent months-to-payoff estimate per card if it were the only debt
  // with its minimum as payment (same recursion the old solo code used).
  const monthsIfSolo = (c: { balance: number; rate: number; min: number }): number | null => {
    let bal = c.balance;
    if (c.min <= bal * (c.rate / 100 / 12)) return null; // payment can't cover interest
    let months = 0;
    while (bal > 0 && months < 1000) {
      months++;
      bal = bal + bal * (c.rate / 100 / 12) - c.min;
    }
    return months;
  };

  let months = 0;
  let totalInterest = 0;
  while (balances.some((c) => c.balance > 0.01) && months < 600) {
    months++;
    // 1) Interest accrues on every card with a balance
    for (const c of balances) {
      if (c.balance > 0) {
        const interest = c.balance * (c.rate / 100 / 12);
        totalInterest += interest;
        c.balance += interest;
      }
    }
    // 2) Minimums are paid on every card that still has a balance
    for (const c of balances) {
      if (c.balance > 0) {
        const pay = Math.min(c.min, c.balance);
        c.balance -= pay;
        c.min = Math.max(c.min, 0);
      }
    }
    // 3) All remaining budget (extra + minimums freed by payoff) goes to the
    //    priority card: avalanche = highest rate first; snowball = lowest balance first.
    const sorted = strategy === "avalanche" ? [...balances].sort((a, b) => b.rate - a.rate) : [...balances].sort((a, b) => a.balance - b.balance);
    let remaining = Math.max(0, totalMonthly - parsed.reduce((s, c, idx) => s + (balances[idx].balance > 0 ? c.min : 0), 0));
    for (const target of sorted) {
      const card = balances.find((c) => c.name === target.name)!;
      if (card.balance > 0) {
        const pay = Math.min(card.balance, remaining);
        card.balance -= pay;
        remaining -= pay;
        if (remaining <= 0) break;
      }
    }
  }

  return {
    totalDebt,
    monthlyPayment: totalMonthly,
    monthsToPayoff: months,
    totalInterest: Math.round(totalInterest),
    schedule: parsed.map((c) => ({ ...c, monthsIfSolo: monthsIfSolo(c) })),
  };
}
