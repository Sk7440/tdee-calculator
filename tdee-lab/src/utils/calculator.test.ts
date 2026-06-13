import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  calculateIdealWeight,
  calculateMacros,
  calculateGoals,
  calculateAll,
  isValidState,
  lbsToKg,
  kgToLbs,
  ftInToCm,
  cmToFtIn,
  formatCalories,
} from './calculator';
import type { CalculatorState } from './types';

const defaultState: CalculatorState = {
  unit: 'metric',
  sex: 'female',
  age: 30,
  weightKg: 70,
  heightCm: 170,
  activity: 'light',
  goal: 'maintain',
};

describe('Unit conversions', () => {
  it('lbsToKg converts correctly', () => {
    expect(lbsToKg(154)).toBeCloseTo(69.85, 0);
  });

  it('kgToLbs converts correctly', () => {
    expect(kgToLbs(70)).toBeCloseTo(154.32, 0);
  });

  it('ftInToCm converts correctly', () => {
    expect(ftInToCm(5, 7)).toBeCloseTo(170.18, 0);
  });

  it('cmToFtIn converts correctly', () => {
    const result = cmToFtIn(170);
    expect(result.ft).toBe(5);
    expect(result.inches).toBeGreaterThanOrEqual(6);
    expect(result.inches).toBeLessThanOrEqual(8);
  });
});

describe('BMR Calculation (Mifflin-St Jeor)', () => {
  it('calculates female BMR correctly', () => {
    const result = calculateBMR(defaultState);
    // 10*70 + 6.25*170 - 5*30 - 161 = 1451.5
    expect(result.value).toBe(1452);
    expect(result.formula).toBe('Mifflin-St Jeor');
  });

  it('calculates male BMR correctly', () => {
    const result = calculateBMR({ ...defaultState, sex: 'male' });
    // 10*70 + 6.25*170 - 5*30 + 5 = 1617.5
    expect(result.value).toBe(1618);
  });
});

describe('TDEE Calculation', () => {
  it('calculates TDEE with light activity', () => {
    const result = calculateTDEE(defaultState);
    expect(result.bmr).toBe(1452);
    expect(result.tdee).toBe(Math.round(1452 * 1.375));
    expect(result.activityMultiplier).toBe(1.375);
  });

  it('calculates TDEE with very active', () => {
    const result = calculateTDEE({ ...defaultState, activity: 'very_active' });
    expect(result.tdee).toBe(Math.round(1452 * 1.9));
  });
});

describe('BMI Calculation', () => {
  it('calculates normal BMI', () => {
    const result = calculateBMI(170, 70);
    expect(result.value).toBe(24.2);
    expect(result.category).toBe('Normal');
  });

  it('identifies overweight BMI', () => {
    const result = calculateBMI(170, 80);
    expect(result.category).toBe('Overweight');
  });

  it('identifies underweight BMI', () => {
    const result = calculateBMI(170, 50);
    expect(result.category).toBe('Underweight');
  });
});

describe('Ideal Weight', () => {
  it('calculates female ideal range', () => {
    const result = calculateIdealWeight(170, 'female');
    expect(result.low).toBeGreaterThan(40);
    expect(result.high).toBeGreaterThan(result.low);
    expect(result.unit).toBe('kg');
  });

  it('calculates male ideal range', () => {
    const result = calculateIdealWeight(170, 'male');
    expect(result.low).toBeGreaterThan(40);
  });
});

describe('Macros', () => {
  it('calculates macros for 2000 kcal', () => {
    const result = calculateMacros(2000, 70);
    expect(result.protein.grams).toBe(154); // 70 * 2.2
    expect(result.protein.kcal).toBe(616);  // 154 * 4
    expect(result.fat.kcal).toBe(500);       // 25% of 2000
    expect(result.fat.grams).toBe(56);       // 500 / 9
    expect(result.carbs.kcal).toBeGreaterThan(0);
    expect(result.total).toBe(2000);
  });

  it('macros sum to total', () => {
    const result = calculateMacros(2500, 80);
    const sum = result.protein.kcal + result.fat.kcal + result.carbs.kcal;
    expect(sum).toBe(2500);
  });
});

describe('Goals', () => {
  it('generates 6 goals', () => {
    const goals = calculateGoals(2500);
    expect(goals).toHaveLength(6);
  });

  it('maintain equals TDEE', () => {
    const goals = calculateGoals(2500);
    const maintain = goals.find(g => g.id === 'maintain');
    expect(maintain?.calories).toBe(2500);
  });

  it('loss is below TDEE', () => {
    const goals = calculateGoals(2500);
    const loss = goals.find(g => g.id === 'loss');
    expect(loss?.calories).toBe(1950);
  });
});

describe('State validation', () => {
  it('validates correct state', () => {
    expect(isValidState(defaultState)).toBe(true);
  });

  it('rejects invalid age', () => {
    expect(isValidState({ ...defaultState, age: 5 })).toBe(false);
  });

  it('rejects zero weight', () => {
    expect(isValidState({ ...defaultState, weightKg: 0 })).toBe(false);
  });

  it('rejects invalid height', () => {
    expect(isValidState({ ...defaultState, heightCm: 40 })).toBe(false);
  });
});

describe('formatCalories', () => {
  it('formats with comma separators', () => {
    expect(formatCalories(2450)).toBe('2,450');
  });

  it('rounds decimal values', () => {
    expect(formatCalories(2450.7)).toBe('2,451');
  });
});

describe('calculateAll', () => {
  it('returns all result types', () => {
    const results = calculateAll(defaultState);
    expect(results.bmr).toBeDefined();
    expect(results.tdee).toBeDefined();
    expect(results.goals).toHaveLength(6);
    expect(results.macros).toBeDefined();
    expect(results.bmi).toBeDefined();
    expect(results.idealWeight).toBeDefined();
  });
});
