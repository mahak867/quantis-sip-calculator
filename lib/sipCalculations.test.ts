import { calculateSIP, SIPInputs } from './sipCalculations';

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
});
