export type Sex = 'male' | 'female';
export type Unit = 'metric' | 'standard';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'maintain' | 'mild_loss' | 'loss' | 'aggressive_loss' | 'mild_gain' | 'gain';

export interface CalculatorState {
  unit: Unit;
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: Goal;
}

export interface BMRResult {
  value: number;
  formula: string;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
}

export interface CalorieGoal {
  id: Goal;
  label: string;
  description: string;
  delta: number;
  calories: number;
  weeklyChange: string;
  color: string;
}

export interface MacroResult {
  protein: { grams: number; kcal: number; pct: number };
  fat: { grams: number; kcal: number; pct: number };
  carbs: { grams: number; kcal: number; pct: number };
  total: number;
}

export interface BMIResult {
  value: number;
  category: string;
  color: string;
}

export interface IdealWeightRange {
  low: number;
  high: number;
  unit: string;
}

export interface AllResults {
  bmr: BMRResult;
  tdee: TDEEResult;
  goals: CalorieGoal[];
  macros: MacroResult;
  bmi: BMIResult;
  idealWeight: IdealWeightRange;
}
