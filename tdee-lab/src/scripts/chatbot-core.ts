// Lightweight, UI-free rule-based chatbot core (used as offline fallback)
// Extracted from chatbot.ts so the AI widget never fails silently.

type ChatCategory = 'health' | 'finance' | 'math' | 'general';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

// ============ FORMULA EXECUTION ENGINE ============

function calculateBMR(gender: string, weightKg: number, heightCm: number, age: number): number {
    if (gender === 'male') {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    }
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
}

function calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };
    return bmr * (multipliers[activityLevel] || 1.55);
}

function calculateBMI(weightKg: number, heightCm: number): { value: number; category: string } {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    return { value: Math.round(bmi * 10) / 10, category };
}

function calculateCompoundInterest(
    principal: number,
    rate: number,
    compoundsPerYear: number,
    years: number,
): { total: number; interest: number } {
    const r = rate / 100;
    const total = principal * Math.pow(1 + r / compoundsPerYear, compoundsPerYear * years);
    return {
        total: Math.round(total * 100) / 100,
        interest: Math.round((total - principal) * 100) / 100,
    };
}

function calculateLoanPayment(principal: number, annualRate: number, years: number): { monthly: number; total: number; interest: number } {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) {
        const monthly = principal / n;
        return { monthly: Math.round(monthly * 100) / 100, total: principal, interest: 0 };
    }
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    return {
        monthly: Math.round(monthly * 100) / 100,
        total: Math.round(total * 100) / 100,
        interest: Math.round((total - principal) * 100) / 100,
    };
}

function calculateAge(birthday: string): { years: number; months: number; days: number; totalDays: number } {
    const birth = new Date(birthday);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDays };
}

// ============ UNIT CONVERSIONS ============

function lbsToKg(lbs: number): number {
    return lbs * 0.453592;
}
function kgToLbs(kg: number): number {
    return kg / 0.453592;
}
function ftInToCm(ft: number, inches: number): number {
    return (ft * 12 + inches) * 2.54;
}
function cmToFtIn(cm: number): { ft: number; inches: number } {
    const totalInches = cm / 2.54;
    let ft = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);
    if (inches === 12) { ft += 1; inches = 0; }
    return { ft, inches };
}

// ============ CONVERSATION STATE ============

interface ConversationContext {
    pendingCalculation: string | null;
    collectedData: Record<string, string | number>;
}

const context: ConversationContext = {
    pendingCalculation: null,
    collectedData: {},
};

// ============ SMART INTENT DETECTION ============

function detectIntent(message: string): { category: ChatCategory; intent: string } {
    const lower = message.toLowerCase();

    if (lower.match(/(tdee|total daily energy)/)) return { category: 'health', intent: 'tdee' };
    if (lower.match(/(bmr|basal metabolic)/)) return { category: 'health', intent: 'bmr' };
    if (lower.match(/\bbmi\b|body mass index/)) return { category: 'health', intent: 'bmi' };

    if (lower.match(/(calorie|kcal|calories)/)) return { category: 'health', intent: 'calorie' };
    if (lower.match(/(protein|macro|carb|fat)/)) return { category: 'health', intent: 'macro' };

    if (lower.match(/(compound interest|compound)/)) return { category: 'finance', intent: 'compound_interest' };
    if (lower.match(/(loan|mortgage|payment|emi)/)) return { category: 'finance', intent: 'loan' };

    if (lower.match(/(fraction|divide|division)/)) return { category: 'math', intent: 'fraction' };
    if (lower.match(/(percent|percentage|%)/)) return { category: 'math', intent: 'percentage' };
    if (lower.match(/(average|mean|median|mode)/)) return { category: 'math', intent: 'average' };

    if (lower.match(/(age|birthday|born|how old)/)) return { category: 'general', intent: 'age' };

    if (lower.match(/^(hi|hello|hey|howdy)/)) return { category: 'general', intent: 'greeting' };
    if (lower.match(/(thank|thanks|thx)/)) return { category: 'general', intent: 'thanks' };
    if (lower.match(/(help|what can you do|features)/)) return { category: 'general', intent: 'help' };

    return { category: 'general', intent: 'unknown' };
}

// ============ EXTRACT VARIABLES FROM MESSAGE ============

function extractHealthData(message: string): Record<string, any> {
    const lower = message.toLowerCase();
    const data: Record<string, any> = {};

    if (lower.match(/\b(male|man|boy|he|him)\b/)) data.gender = 'male';
    if (lower.match(/\b(female|woman|girl|she|her)\b/)) data.gender = 'female';

    const ageMatch = lower.match(/(\d+)\s*(years?\s*old|yrs?|age)/);
    if (ageMatch) data.age = parseInt(ageMatch[1]);
    if (!data.age) {
        const numMatch = lower.match(/age\s*(\d+)/);
        if (numMatch) data.age = parseInt(numMatch[1]);
    }

    const kgMatch = lower.match(/(\d+\.?\d*)\s*kg/);
    if (kgMatch) data.weightKg = parseFloat(kgMatch[1]);

    const lbsMatch = lower.match(/(\d+\.?\d*)\s*(lbs?|pounds?)/);
    if (lbsMatch && !data.weightKg) data.weightKg = lbsToKg(parseFloat(lbsMatch[1]));

    const cmMatch = lower.match(/(\d+\.?\d*)\s*cm/);
    if (cmMatch) data.heightCm = parseFloat(cmMatch[1]);

    const ftMatch = lower.match(/(\d+)\s*(?:feet|foot|ft|')\s*(\d+)?\s*(?:inches|inch|in|\")?/);
    if (ftMatch && !data.heightCm) {
        const inches = ftMatch[2] ? parseInt(ftMatch[2]) : 0;
        data.heightCm = ftInToCm(parseInt(ftMatch[1]), inches);
    }

    if (lower.match(/(sedentary|desk|no exercise|little exercise)/)) data.activity = 'sedentary';
    if (lower.match(/(lightly active|light exercise|1-3 times)/)) data.activity = 'light';
    if (lower.match(/(moderately active|moderate|3-5 times)/)) data.activity = 'moderate';
    if (lower.match(/(very active|intense|6-7 times)/)) data.activity = 'active';
    if (lower.match(/(extremely active|athlete|heavy)/)) data.activity = 'very_active';

    // Accept a common shorthand
    if (lower.match(/(very active|athlete)/) && !data.activity) data.activity = 'very_active';

    return data;
}

function extractFinanceData(message: string): Record<string, any> {
    const lower = message.toLowerCase();
    const data: Record<string, any> = {};

    const dollarMatch = lower.match(/\$?([\d,]+\.?\d*)/);
    if (dollarMatch) data.amount = parseFloat(dollarMatch[1].replace(/,/g, ''));

    const pctMatch = lower.match(/(\d+\.?\d*)\s*%/);
    if (pctMatch) data.rate = parseFloat(pctMatch[1]);

    const yearMatch = lower.match(/(\d+)\s*(?:years?|yrs?)/);
    if (yearMatch) data.years = parseInt(yearMatch[1]);

    const monthMatch = lower.match(/(\d+)\s*months?/);
    if (monthMatch) data.months = parseInt(monthMatch[1]);

    return data;
}

// ============ RESPONSE GENERATORS ============

function generateHealthResponse(intent: string, data: Record<string, any>): string {
    if (data.gender && data.age && data.weightKg && data.heightCm && data.activity) {
        const bmr = calculateBMR(data.gender, data.weightKg, data.heightCm, data.age);
        const heightFtIn = cmToFtIn(data.heightCm);
        const weightLbs = Math.round(kgToLbs(data.weightKg));
        const bmi = calculateBMI(data.weightKg, data.heightCm);

        const activities = [
            { key: 'sedentary', label: 'Sedentary', mult: 1.2, desc: 'Desk job, little exercise' },
            { key: 'light', label: 'Lightly Active', mult: 1.375, desc: 'Exercise 1-3 days/week' },
            { key: 'moderate', label: 'Moderately Active', mult: 1.55, desc: 'Exercise 3-5 days/week' },
            { key: 'active', label: 'Very Active', mult: 1.725, desc: 'Exercise 6-7 days/week' },
            { key: 'very_active', label: 'Extremely Active', mult: 1.9, desc: 'Athlete / heavy labor' },
        ];

        const selected = activities.find((a) => a.key === data.activity) || activities[2];
        const tdeeSelected = Math.round(bmr * selected.mult);

        return (
            `**TDEE breakdown (offline)**\n\n` +
            `**Profile**\n` +
            `* ${data.gender === 'male' ? 'Male' : 'Female'}\n` +
            `* Age: ${data.age}y\n` +
            `* Weight: ${Math.round(data.weightKg)}kg (${weightLbs} lbs)\n` +
            `* Height: ${Math.round(data.heightCm)}cm (${heightFtIn.ft}'${heightFtIn.inches}")\n\n` +
            `**BMR**\n` +
            `* ${Math.round(bmr)} kcal/day\n\n` +
            `**TDEE (${selected.label})**\n` +
            `* **${tdeeSelected.toLocaleString()} kcal/day**\n\n` +
            `**BMI**\n` +
            `* **${bmi.value}** (${bmi.category})\n\n` +
            `Want calorie goals? Tell me: **cut / maintain / bulk**.`
        );
    }

    if (intent === 'tdee' || intent === 'bmr' || intent === 'bmi') {
        const missing: string[] = [];
        if (!data.gender) missing.push('Gender (male/female)');
        if (!data.age) missing.push('Age');
        if (!data.weightKg) missing.push('Weight (kg or lbs)');
        if (!data.heightCm) missing.push('Height (cm or ft/in)');
        if (!data.activity) missing.push('Activity (sedentary/light/moderate/active/very active)');

        if (missing.length > 0) {
            return (
                `**To calculate your TDEE, I need 4-5 quick details**\n\n` +
                missing.slice(0, 5).map((m) => `* ${m}`).join('\n') +
                `\n\n**Example:** "28 male, 85kg, 180cm, very active"`
            );
        }
    }

    return (
        `**Ask me for your TDEE/BMR/BMI**\n\n` +
        `Give me: gender, age, weight, height, and activity.`
    );
}

function generateFinanceResponse(intent: string, data: Record<string, any>): string {
  if (intent === 'compound_interest') {
    if (data.amount && data.rate && (data.years || data.months)) {
      const years = data.years || (data.months ? data.months / 12 : 1);
      const result = calculateCompoundInterest(data.amount, data.rate, 12, years);
      return (
        `**Compound interest (offline)**\n\n` +
        `* Principal: $${data.amount.toLocaleString()}\n` +
        `* Rate: ${data.rate}%\n` +
        `* Time: ${data.years || `${data.months} months`}\n\n` +
        `**Result:**\n` +
        `* Final: **$${result.total.toLocaleString()}**\n` +
        `* Interest: **$${result.interest.toLocaleString()}**`
      );
    }

    return `**Compound interest**\n\nTell me: principal, interest rate(%), and time(years or months).`;
  }

  if (intent === 'loan') {
    if (data.amount && data.rate && (data.years || data.months)) {
      const years = data.years || (data.months ? data.months / 12 : 1);
      const result = calculateLoanPayment(data.amount, data.rate, years);
      return (
        `**Loan payment (offline)**\n\n` +
        `* Monthly: **$${result.monthly.toLocaleString()}**\n` +
        `* Total: **$${result.total.toLocaleString()}**\n` +
        `* Interest: **$${result.interest.toLocaleString()}**`
      );
    }

    return `**Loan calculator**\n\nTell me: loan amount, interest rate(%), and term(years or months).`;
  }

  return `**Finance help**\n\nTry: "compound interest on $10000 at 7% for 10 years"`;
}

function generateMathResponse(intent: string, data: Record<string, any>, message: string): string {
  const lower = message.toLowerCase();
  const numbers = lower.match(/\d+\.?\d*/g)?.map(Number) || [];

  if (intent === 'percentage' && numbers.length >= 2) {
    const pct = numbers[0];
    const value = numbers[1];
    const result = (pct / 100) * value;
    return `**${pct}% of ${value} = ${result}**`;
  }

  if (intent === 'fraction' && numbers.length >= 2) {
    const a = numbers[0];
    const b = numbers[1];
    const result = a / b;
    return `**${a}/${b} = ${result.toFixed(4)}**`;
  }

  if (intent === 'average' && numbers.length > 0) {
    const sum = numbers.reduce((x, y) => x + y, 0);
    const avg = sum / numbers.length;
    return `**Average = ${avg.toFixed(2)}**`;
  }

  return `**Math helper (offline)**\n\nAsk me: percentages, fractions, or averages.`;
}

function generateGeneralResponse(intent: string, data: Record<string, any>, message: string): string {
    const lower = message.toLowerCase();

    if (intent === 'greeting') {
        return `Hey — I’m **TDEE Bot**. Hit me with your stats and I’ll do the math. ⚡`;
    }

    if (intent === 'help') {
        return `I can calculate:\n• **TDEE / BMR / BMI**\n• **Calorie goals**\n• **Compound interest / loan payments**\n\nTry: "Calculate my TDEE".`;
    }

    if (intent === 'thanks') {
        return `Anytime. 💪 Want calorie goals next?`;
    }

    if (intent === 'age') {
        const dateMatch = lower.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (dateMatch) {
            const birthday = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
            const age = calculateAge(birthday);
            return `**Age** 🎂\n\nBorn: ${birthday}\nYou are **${age.years} years** (+${age.months} months).`;
        }
        return `**Age calculator** 🎂\n\nSend your birthday (e.g., 1990-05-15).`;
    }

    return `**TDEE Lab AI (offline)** ⚡\n\nTry: "Calculate my TDEE" or "What is my BMI?"`;
}

// ============ MAIN RESPONSE GENERATOR ============

export function generateOfflineResponse(userMessage: string): string {
    const { category, intent } = detectIntent(userMessage) as { category: ChatCategory; intent: string };

    let extractedData: Record<string, any> = {};

    if (category === 'health') {
        extractedData = extractHealthData(userMessage);
        if (Object.keys(extractedData).length > 0) context.pendingCalculation = 'health';
        return generateHealthResponse(intent, extractedData);
    }

    if (category === 'finance') {
        extractedData = extractFinanceData(userMessage);
        if (Object.keys(extractedData).length > 0) context.pendingCalculation = 'finance';
        return generateFinanceResponse(intent, extractedData);
    }

    if (category === 'math') {
        return generateMathResponse(intent, extractedData, userMessage);
    }

    return generateGeneralResponse(intent, extractedData, userMessage);
}

