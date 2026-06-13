import type {
  Sex, ActivityLevel, Goal, CalculatorState,
  BMRResult, TDEEResult, CalorieGoal, MacroResult,
  BMIResult, IdealWeightRange, AllResults
} from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job)',
  light: 'Light (1–3 days/wk)',
  moderate: 'Moderate (3–5 days/wk)',
  active: 'Active (6–7 days/wk)',
  very_active: 'Very Active (athlete)',
};

export const GOAL_CONFIG: { id: Goal; label: string; description: string; delta: number; weeklyChange: string; color: string }[] = [
  { id: 'aggressive_loss', label: 'Aggressive Loss', description: 'Fast weight loss', delta: -1100, weeklyChange: '−1.0 kg/wk', color: '#ef4444' },
  { id: 'loss', label: 'Loss', description: 'Steady weight loss', delta: -550, weeklyChange: '−0.5 kg/wk', color: '#f97316' },
  { id: 'mild_loss', label: 'Mild Loss', description: 'Slow & sustainable', delta: -275, weeklyChange: '−0.25 kg/wk', color: '#eab308' },
  { id: 'maintain', label: 'Maintain', description: 'Keep current weight', delta: 0, weeklyChange: '0 kg/wk', color: '#22c55e' },
  { id: 'mild_gain', label: 'Mild Gain', description: 'Lean bulk', delta: 275, weeklyChange: '+0.25 kg/wk', color: '#3b82f6' },
  { id: 'gain', label: 'Gain', description: 'Muscle building', delta: 550, weeklyChange: '+0.5 kg/wk', color: '#a855f7' },
];

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

export function ftInToCm(ft: number, inches: number): number {
  return (ft * 12 + inches) * 2.54;
}

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { ft += 1; inches = 0; }
  return { ft, inches };
}

export function calculateBMR(state: CalculatorState): BMRResult {
  const { sex, age, weightKg, heightCm } = state;

  // Mifflin-St Jeor
  const mifflin = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  return { value: Math.round(mifflin), formula: 'Mifflin-St Jeor' };
}

export function calculateTDEE(state: CalculatorState): TDEEResult {
  const bmr = calculateBMR(state);
  const multiplier = ACTIVITY_MULTIPLIERS[state.activity];
  return {
    bmr: bmr.value,
    tdee: Math.round(bmr.value * multiplier),
    activityMultiplier: multiplier,
  };
}

export function calculateBMI(heightCm: number, weightKg: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  let category: string;
  let color: string;

  if (bmi < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
  else if (bmi < 25) { category = 'Normal'; color = '#22c55e'; }
  else if (bmi < 30) { category = 'Overweight'; color = '#eab308'; }
  else { category = 'Obese'; color = '#ef4444'; }

  return { value: rounded, category, color };
}

export function calculateIdealWeight(heightCm: number, sex: Sex): IdealWeightRange {
  const heightIn = heightCm / 2.54;
  const base = sex === 'male' ? 52 : 49;
  const low = Math.round(base + 2.3 * (heightIn - 60));
  const high = Math.round(low + 27);
  return { low, high, unit: 'kg' };
}

export function calculateMacros(calories: number, weightKg: number): MacroResult {
  const proteinG = Math.round(weightKg * 2.2);
  const proteinKcal = proteinG * 4;
  const fatKcal = Math.round(calories * 0.25);
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = calories - proteinKcal - fatKcal;
  const carbsG = Math.max(0, Math.round(carbsKcal / 4));

  const totalKcal = proteinKcal + fatKcal + carbsKcal;

  return {
    protein: {
      grams: proteinG,
      kcal: proteinKcal,
      pct: Math.round((proteinKcal / totalKcal) * 100),
    },
    fat: {
      grams: fatG,
      kcal: fatKcal,
      pct: Math.round((fatKcal / totalKcal) * 100),
    },
    carbs: {
      grams: carbsG,
      kcal: carbsKcal,
      pct: Math.round((carbsKcal / totalKcal) * 100),
    },
    total: totalKcal,
  };
}

export function calculateGoals(tdee: number): CalorieGoal[] {
  return GOAL_CONFIG.map(g => ({
    ...g,
    calories: Math.max(0, tdee + g.delta),
  }));
}

export function calculateAll(state: CalculatorState): AllResults {
  const bmr = calculateBMR(state);
  const tdee = calculateTDEE(state);
  const goals = calculateGoals(tdee.tdee);
  const selectedGoal = goals.find(g => g.id === state.goal) || goals[3];
  const macros = calculateMacros(selectedGoal.calories, state.weightKg);
  const bmi = calculateBMI(state.heightCm, state.weightKg);
  const idealWeight = calculateIdealWeight(state.heightCm, state.sex);

  return { bmr, tdee, goals, macros, bmi, idealWeight };
}

export function isValidState(state: CalculatorState): boolean {
  return state.age >= 10 && state.age <= 120
    && state.weightKg > 0 && state.weightKg < 500
    && state.heightCm > 50 && state.heightCm < 300;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatCalories(n: number): string {
  return formatNumber(Math.round(n));
}
