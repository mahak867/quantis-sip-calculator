export interface SIPInputs {
  investment: number;  // Monthly SIP amount (₹)
  rate: number;        // Expected annual return (%)
  years: number;       // Investment duration (years)
  stepUp: number;      // Annual SIP increase (%)
  inflation: number;   // Inflation rate (%)
  goal: number;        // Target corpus (₹)
  taxRate: number;     // LTCG tax rate (%)
}

export interface ValidationError {
  field: keyof SIPInputs;
  message: string;
}

/**
 * Validates SIP inputs and returns an array of validation errors.
 * Returns an empty array when all inputs are valid.
 */
export function validateSIPInputs(inputs: SIPInputs): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(inputs.investment) || inputs.investment <= 0) {
    errors.push({ field: 'investment', message: 'Monthly investment must be greater than 0.' });
  }

  if (!Number.isFinite(inputs.rate) || inputs.rate < 0) {
    errors.push({ field: 'rate', message: 'Expected return rate must be 0 or greater.' });
  }

  if (!Number.isFinite(inputs.years) || !Number.isInteger(inputs.years) || inputs.years < 1) {
    errors.push({ field: 'years', message: 'Investment duration must be a whole number of at least 1 year.' });
  }

  if (!Number.isFinite(inputs.stepUp) || inputs.stepUp < 0) {
    errors.push({ field: 'stepUp', message: 'Annual step-up must be 0 or greater.' });
  }

  if (!Number.isFinite(inputs.inflation) || inputs.inflation < 0) {
    errors.push({ field: 'inflation', message: 'Inflation rate must be 0 or greater.' });
  }

  if (!Number.isFinite(inputs.goal) || inputs.goal <= 0) {
    errors.push({ field: 'goal', message: 'Target goal must be greater than 0.' });
  }

  if (!Number.isFinite(inputs.taxRate) || inputs.taxRate < 0 || inputs.taxRate > 100) {
    errors.push({ field: 'taxRate', message: 'Tax rate must be between 0 and 100.' });
  }

  return errors;
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
  const errors = validateSIPInputs(inputs);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(' '));
  }

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
