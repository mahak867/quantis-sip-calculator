export interface SIPInputs {
  investment: number;  // Monthly SIP amount (₹)
  rate: number;        // Expected annual return (%)
  years: number;       // Investment duration (years)
  stepUp: number;      // Annual SIP increase (%)
  inflation: number;   // Inflation rate (%)
  goal: number;        // Target corpus (₹)
  taxRate: number;     // LTCG tax rate (%)
}

export interface SIPResults {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  realValue: number;
  estimatedTax: number;
  postTaxValue: number;
  goalProgress: number;
}

export function calculateSIP(inputs: SIPInputs): SIPResults {
  const { investment, rate, years, stepUp, inflation, goal, taxRate } = inputs;

  const monthlyRate = rate / 12 / 100;
  const totalMonths = years * 12;

  let totalInvested = 0;
  let futureValue = 0;

  if (stepUp === 0) {
    // Standard SIP formula: FV = P * [((1+r)^n - 1) / r] * (1+r)
    totalInvested = investment * totalMonths;
    if (monthlyRate === 0) {
      futureValue = totalInvested;
    } else {
      futureValue =
        investment *
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate));
    }
  } else {
    // Year-by-year step-up calculation
    for (let y = 0; y < years; y++) {
      const sipForYear = investment * Math.pow(1 + stepUp / 100, y);
      totalInvested += sipForYear * 12;

      const monthsLeftAfterYear = totalMonths - y * 12;

      if (monthlyRate === 0) {
        futureValue += sipForYear * 12;
      } else {
        const fvAnnuity =
          sipForYear *
          (((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) *
            (1 + monthlyRate));
        futureValue += fvAnnuity * Math.pow(1 + monthlyRate, monthsLeftAfterYear - 12);
      }
    }
  }

  const wealthGained = Math.round(futureValue - totalInvested);
  const realValue = Math.round(
    futureValue / Math.pow(1 + inflation / 100, years)
  );
  const estimatedTax = Math.round(wealthGained * (taxRate / 100));
  const postTaxValue = Math.round(futureValue - estimatedTax);
  const goalProgress = Math.min(100, (futureValue / goal) * 100);

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    wealthGained,
    realValue,
    estimatedTax,
    postTaxValue,
    goalProgress,
  };
}
