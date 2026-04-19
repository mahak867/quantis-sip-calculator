import { calculateSIP, validateSIPInputs, SIPInputs } from './sipCalculations';

const baseInputs: SIPInputs = {
  investment: 25000,
  rate: 12,
  years: 15,
  stepUp: 0,
  inflation: 6,
  goal: 10000000,
  taxRate: 10,
};

describe('calculateSIP', () => {
  describe('standard SIP (no step-up)', () => {
    it('returns correct futureValue for standard inputs', () => {
      const result = calculateSIP(baseInputs);
      // Monthly rate: 1%, 180 months
      // FV = 25000 * [((1.01^180 - 1) / 0.01) * 1.01]
      const monthlyRate = 0.01;
      const expected = Math.round(
        25000 * (((Math.pow(1.01, 180) - 1) / monthlyRate) * 1.01)
      );
      expect(result.futureValue).toBe(expected);
    });

    it('totalInvested equals investment * months', () => {
      const result = calculateSIP(baseInputs);
      expect(result.totalInvested).toBe(25000 * 15 * 12);
    });

    it('wealthGained equals futureValue minus totalInvested', () => {
      const result = calculateSIP(baseInputs);
      expect(result.wealthGained).toBe(result.futureValue - result.totalInvested);
    });

    it('handles zero interest rate correctly', () => {
      const result = calculateSIP({ ...baseInputs, rate: 0 });
      expect(result.futureValue).toBe(25000 * 15 * 12);
      expect(result.wealthGained).toBe(0);
    });

    it('calculates realValue adjusted for inflation', () => {
      const result = calculateSIP(baseInputs);
      const expected = Math.round(result.futureValue / Math.pow(1.06, 15));
      expect(result.realValue).toBe(expected);
    });

    it('calculates estimatedTax on wealth gained', () => {
      const result = calculateSIP(baseInputs);
      expect(result.estimatedTax).toBe(Math.round(result.wealthGained * 0.1));
    });

    it('postTaxValue equals futureValue minus estimatedTax', () => {
      const result = calculateSIP(baseInputs);
      expect(result.postTaxValue).toBe(result.futureValue - result.estimatedTax);
    });

    it('goalProgress is capped at 100 when futureValue exceeds goal', () => {
      const result = calculateSIP({ ...baseInputs, goal: 1000 });
      expect(result.goalProgress).toBe(100);
    });

    it('goalProgress is proportional when below goal', () => {
      const result = calculateSIP({ ...baseInputs, goal: 1e12 });
      expect(result.goalProgress).toBeGreaterThan(0);
      expect(result.goalProgress).toBeLessThan(100);
    });

    it('zero taxRate results in zero estimatedTax', () => {
      const result = calculateSIP({ ...baseInputs, taxRate: 0 });
      expect(result.estimatedTax).toBe(0);
      expect(result.postTaxValue).toBe(result.futureValue);
    });

    it('zero inflation returns same futureValue as realValue when years=0 would give 1 multiplier', () => {
      const result = calculateSIP({ ...baseInputs, inflation: 0 });
      expect(result.realValue).toBe(result.futureValue);
    });
  });

  describe('step-up SIP', () => {
    it('step-up futureValue is greater than non-step-up for positive stepUp', () => {
      const withStepUp = calculateSIP({ ...baseInputs, stepUp: 10 });
      const withoutStepUp = calculateSIP(baseInputs);
      expect(withStepUp.futureValue).toBeGreaterThan(withoutStepUp.futureValue);
    });

    it('step-up totalInvested is greater than non-step-up for positive stepUp', () => {
      const withStepUp = calculateSIP({ ...baseInputs, stepUp: 10 });
      const withoutStepUp = calculateSIP(baseInputs);
      expect(withStepUp.totalInvested).toBeGreaterThan(withoutStepUp.totalInvested);
    });

    it('handles zero interest rate with step-up', () => {
      const result = calculateSIP({ ...baseInputs, rate: 0, stepUp: 10 });
      // With 0% rate, futureValue equals totalInvested
      expect(result.futureValue).toBe(result.totalInvested);
      expect(result.wealthGained).toBe(0);
    });

    it('1-year step-up matches non-step-up when both use same investment', () => {
      const withStepUp = calculateSIP({ ...baseInputs, years: 1, stepUp: 5 });
      const withoutStepUp = calculateSIP({ ...baseInputs, years: 1, stepUp: 0 });
      // Both start at same investment; for 1 year step-up has no effect on amount
      expect(withStepUp.futureValue).toBe(withoutStepUp.futureValue);
    });

    it('step-up totalInvested for 1 year equals investment * 12', () => {
      const result = calculateSIP({ ...baseInputs, years: 1, stepUp: 10 });
      expect(result.totalInvested).toBe(25000 * 12);
    });
  });

  describe('validateSIPInputs', () => {
    it('returns no errors for valid base inputs', () => {
      expect(validateSIPInputs(baseInputs)).toHaveLength(0);
    });

    it('returns error when investment is zero', () => {
      const errors = validateSIPInputs({ ...baseInputs, investment: 0 });
      expect(errors.some((e) => e.field === 'investment')).toBe(true);
    });

    it('returns error when investment is negative', () => {
      const errors = validateSIPInputs({ ...baseInputs, investment: -1000 });
      expect(errors.some((e) => e.field === 'investment')).toBe(true);
    });

    it('returns error when investment is NaN', () => {
      const errors = validateSIPInputs({ ...baseInputs, investment: NaN });
      expect(errors.some((e) => e.field === 'investment')).toBe(true);
    });

    it('returns error when rate is negative', () => {
      const errors = validateSIPInputs({ ...baseInputs, rate: -1 });
      expect(errors.some((e) => e.field === 'rate')).toBe(true);
    });

    it('accepts zero rate', () => {
      const errors = validateSIPInputs({ ...baseInputs, rate: 0 });
      expect(errors.some((e) => e.field === 'rate')).toBe(false);
    });

    it('returns error when years is zero', () => {
      const errors = validateSIPInputs({ ...baseInputs, years: 0 });
      expect(errors.some((e) => e.field === 'years')).toBe(true);
    });

    it('returns error when years is a fraction', () => {
      const errors = validateSIPInputs({ ...baseInputs, years: 1.5 });
      expect(errors.some((e) => e.field === 'years')).toBe(true);
    });

    it('returns error when stepUp is negative', () => {
      const errors = validateSIPInputs({ ...baseInputs, stepUp: -5 });
      expect(errors.some((e) => e.field === 'stepUp')).toBe(true);
    });

    it('returns error when inflation is negative', () => {
      const errors = validateSIPInputs({ ...baseInputs, inflation: -1 });
      expect(errors.some((e) => e.field === 'inflation')).toBe(true);
    });

    it('returns error when goal is zero', () => {
      const errors = validateSIPInputs({ ...baseInputs, goal: 0 });
      expect(errors.some((e) => e.field === 'goal')).toBe(true);
    });

    it('returns error when taxRate is negative', () => {
      const errors = validateSIPInputs({ ...baseInputs, taxRate: -1 });
      expect(errors.some((e) => e.field === 'taxRate')).toBe(true);
    });

    it('returns error when taxRate exceeds 100', () => {
      const errors = validateSIPInputs({ ...baseInputs, taxRate: 101 });
      expect(errors.some((e) => e.field === 'taxRate')).toBe(true);
    });

    it('accepts taxRate of exactly 100', () => {
      const errors = validateSIPInputs({ ...baseInputs, taxRate: 100 });
      expect(errors.some((e) => e.field === 'taxRate')).toBe(false);
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const errors = validateSIPInputs({ ...baseInputs, investment: -1, years: 0 });
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateSIP input validation', () => {
    it('throws when investment is zero', () => {
      expect(() => calculateSIP({ ...baseInputs, investment: 0 })).toThrow();
    });

    it('throws when years is less than 1', () => {
      expect(() => calculateSIP({ ...baseInputs, years: 0 })).toThrow();
    });

    it('throws when taxRate exceeds 100', () => {
      expect(() => calculateSIP({ ...baseInputs, taxRate: 150 })).toThrow();
    });

    it('does not throw for all-valid boundary values', () => {
      expect(() =>
        calculateSIP({ investment: 1, rate: 0, years: 1, stepUp: 0, inflation: 0, goal: 1, taxRate: 0 })
      ).not.toThrow();
    });
  });
});
