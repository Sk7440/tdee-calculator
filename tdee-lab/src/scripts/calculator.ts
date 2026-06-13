import { calculateAll, isValidState, formatCalories, lbsToKg, ftInToCm, cmToFtIn } from '../utils/calculator';
import type { CalculatorState, Sex, Unit, ActivityLevel } from '../utils/types';

const LS_KEY = 'tdee_lab_settings';

let state: CalculatorState = {
  unit: 'standard',
  sex: 'male',
  age: 25,
  weightKg: 74.8,
  heightCm: 177.8,
  activity: 'moderate',
  goal: 'maintain',
};

function loadState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) state = { ...state, ...JSON.parse(saved) };
  } catch {}
  syncInputsFromState();
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function setVal(id: string, val: number | string) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.value = String(val);
}

function setText(id: string, val: number | string) {
  const el = document.getElementById(id) as HTMLElement | null;
  if (el) el.textContent = String(val);
}

function getVal(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? parseFloat(el.value) || 0 : 0;
}

function syncInputsFromState() {
  // Unit tabs
  document.querySelectorAll('.unit-tab').forEach(tab => {
    const el = tab as HTMLButtonElement;
    el.classList.toggle('active', el.dataset.unit === state.unit);
  });
  toggleUnitVisibility();

  // Gender radios
  const genderRadio = document.querySelector(`input[name="gender"][value="${state.sex}"]`) as HTMLInputElement | null;
  if (genderRadio) genderRadio.checked = true;

  // Activity select
  const activitySelect = document.getElementById('input-activity') as HTMLSelectElement | null;
  if (activitySelect) {
    const activityMap: Record<ActivityLevel, string> = {
      sedentary: '1.2',
      light: '1.375',
      moderate: '1.55',
      active: '1.725',
      very_active: '1.9',
    };
    activitySelect.value = activityMap[state.activity] || '1.55';
  }

  // Age
  setVal('input-age', state.age);

  // Weight and Height
  if (state.unit === 'standard') {
    const lbs = Math.round(state.weightKg / 0.453592);
    setVal('input-weight-lbs', lbs);
    const { ft, inches } = cmToFtIn(state.heightCm);
    setVal('input-height-ft', ft);
    setVal('input-height-in', inches);
  } else {
    setVal('input-weight-kg', Math.round(state.weightKg));
    setVal('input-height-cm', Math.round(state.heightCm));
  }
}

function toggleUnitVisibility() {
  const standard = document.getElementById('standard-inputs');
  const metric = document.getElementById('metric-inputs');
  if (state.unit === 'standard') {
    if (standard) standard.style.display = '';
    if (metric) metric.style.display = 'none';
  } else {
    if (standard) standard.style.display = 'none';
    if (metric) metric.style.display = '';
  }
}

function readInputsFromDOM() {
  state.age = getVal('input-age');

  const genderRadio = document.querySelector('input[name="gender"]:checked') as HTMLInputElement | null;
  if (genderRadio) state.sex = genderRadio.value as Sex;

  const activitySelect = document.getElementById('input-activity') as HTMLSelectElement | null;
  if (activitySelect) {
    const val = parseFloat(activitySelect.value);
    if (val <= 1.2) state.activity = 'sedentary';
    else if (val <= 1.375) state.activity = 'light';
    else if (val <= 1.55) state.activity = 'moderate';
    else if (val <= 1.725) state.activity = 'active';
    else state.activity = 'very_active';
  }

  if (state.unit === 'standard') {
    state.weightKg = lbsToKg(getVal('input-weight-lbs'));
    const ft = getVal('input-height-ft');
    const inches = getVal('input-height-in');
    state.heightCm = ftInToCm(ft, inches);
  } else {
    state.weightKg = getVal('input-weight-kg');
    state.heightCm = getVal('input-height-cm');
  }
}

function calculate() {
  readInputsFromDOM();
  if (!isValidState(state)) return;

  const results = calculateAll(state);

  // Show results section
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) resultsSection.style.display = '';

  // Update result values
  const tdeeEl = document.getElementById('result-tdee');
  const bmrEl = document.getElementById('result-bmr');
  if (tdeeEl) tdeeEl.textContent = formatCalories(results.tdee.tdee);
  if (bmrEl) bmrEl.textContent = formatCalories(results.bmr.value);

  // Goals table
  const goalsBody = document.getElementById('goals-body');
  if (goalsBody) {
    goalsBody.innerHTML = results.goals.map(g => {
      const badgeClass = g.id.includes('loss') ? 'goal-loss' :
                         g.id === 'mild_loss' ? 'goal-mild-loss' :
                         g.id === 'maintain' ? 'goal-maintain' :
                         g.id === 'mild_gain' ? 'goal-mild-gain' : 'goal-gain';
      return `
        <tr>
          <td><span class="goal-badge ${badgeClass}">${g.label}</span></td>
          <td>${formatCalories(g.calories)} kcal</td>
          <td>${g.delta > 0 ? '+' : ''}${g.delta}</td>
          <td>${g.weeklyChange}</td>
        </tr>
      `;
    }).join('');
  }

  // Macros
  const m = results.macros;
  setText('macro-protein-g', m.protein.grams);
  setText('macro-protein-kcal', formatCalories(m.protein.kcal));
  setText('macro-fat-g', m.fat.grams);
  setText('macro-fat-kcal', formatCalories(m.fat.kcal));
  setText('macro-carbs-g', m.carbs.grams);
  setText('macro-carbs-kcal', formatCalories(m.carbs.kcal));

  const barProtein = document.getElementById('bar-protein');
  const barFat = document.getElementById('bar-fat');
  const barCarbs = document.getElementById('bar-carbs');
  if (barProtein) barProtein.style.width = `${m.protein.pct}%`;
  if (barFat) barFat.style.width = `${m.fat.pct}%`;
  if (barCarbs) barCarbs.style.width = `${m.carbs.pct}%`;

  const pctProtein = document.getElementById('macro-pct-protein');
  const pctFat = document.getElementById('macro-pct-fat');
  const pctCarbs = document.getElementById('macro-pct-carbs');
  if (pctProtein) pctProtein.textContent = `${m.protein.pct}%`;
  if (pctFat) pctFat.textContent = `${m.fat.pct}%`;
  if (pctCarbs) pctCarbs.textContent = `${m.carbs.pct}%`;

  // BMI
  const bmiEl = document.getElementById('result-bmi');
  const bmiCatEl = document.getElementById('result-bmi-cat');
  if (bmiEl) bmiEl.textContent = String(results.bmi.value);
  if (bmiCatEl) {
    bmiCatEl.textContent = results.bmi.category;
    bmiCatEl.style.color = results.bmi.color;
  }

  const bmiMarker = document.getElementById('bmi-marker');
  if (bmiMarker) {
    const bmiPct = Math.min(100, Math.max(0, ((results.bmi.value - 14) / 26) * 100));
    bmiMarker.style.left = `${bmiPct}%`;
  }

  saveState();
}

function clearForm() {
  state = {
    unit: 'standard',
    sex: 'male',
    age: 25,
    weightKg: 74.8,
    heightCm: 177.8,
    activity: 'moderate',
    goal: 'maintain',
  };
  syncInputsFromState();
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) resultsSection.style.display = 'none';
}

function bindEvents() {
  // Unit tabs
  document.querySelectorAll('.unit-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.unit = (tab as HTMLButtonElement).dataset.unit as Unit;
      syncInputsFromState();
    });
  });

  // Settings toggle
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsContent = document.getElementById('settings-content');
  if (settingsToggle && settingsContent) {
    settingsToggle.addEventListener('click', () => {
      const isVisible = settingsContent.classList.contains('visible');
      settingsContent.classList.toggle('visible');
      settingsToggle.textContent = isVisible ? '+ Settings' : '- Settings';
    });
  }

  // Body fat input visibility
  const formulaRadios = document.querySelectorAll('input[name="formula"]');
  const bodyFatInput = document.getElementById('body-fat-input');
  formulaRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = (radio as HTMLInputElement).value;
      if (bodyFatInput) {
        bodyFatInput.style.display = val === 'katch' ? '' : 'none';
      }
    });
  });

  // Calculate button
  const calculateBtn = document.getElementById('btn-calculate');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculate);
  }

  // Clear button
  const clearBtn = document.getElementById('btn-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
  }

  // Auto-calculate on input change
  const inputs = ['input-age', 'input-weight-lbs', 'input-height-ft', 'input-height-in', 'input-weight-kg', 'input-height-cm'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculate);
    }
  });

  // Auto-calculate on select/radio change
  const activitySelect = document.getElementById('input-activity');
  if (activitySelect) {
    activitySelect.addEventListener('change', calculate);
  }

  const genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(radio => {
    radio.addEventListener('change', calculate);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  bindEvents();
});
