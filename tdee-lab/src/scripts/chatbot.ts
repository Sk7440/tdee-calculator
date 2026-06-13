// AI Chatbot - Enhanced with Real Calculations
// Performs actual math using Mifflin-St Jeor, Compound Interest, Loan formulas, etc.

type ChatCategory = 'health' | 'finance' | 'math' | 'general';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

function calculateCompoundInterest(principal: number, rate: number, compoundsPerYear: number, years: number): { total: number; interest: number } {
  const r = rate / 100;
  const total = principal * Math.pow(1 + r / compoundsPerYear, compoundsPerYear * years);
  return { total: Math.round(total * 100) / 100, interest: Math.round((total - principal) * 100) / 100 };
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
    interest: Math.round((total - principal) * 100) / 100
  };
}

function calculateAge(birthday: string): { years: number; months: number; days: number; totalDays: number } {
  const birth = new Date(birthday);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  return { years, months, days, totalDays };
}

// ============ CONVERSATION STATE ============

interface ConversationContext {
  pendingCalculation: string | null;
  collectedData: Record<string, string | number>;
  lastTopic: string;
}

const context: ConversationContext = {
  pendingCalculation: null,
  collectedData: {},
  lastTopic: ''
};

// ============ UNIT CONVERSIONS ============

function lbsToKg(lbs: number): number { return lbs * 0.453592; }
function kgToLbs(kg: number): number { return kg / 0.453592; }
function ftInToCm(ft: number, inches: number): number { return (ft * 12 + inches) * 2.54; }
function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
}

// ============ SMART INTENT DETECTION ============

function detectIntent(message: string): { category: string; intent: string; confidence: number } {
  const lower = message.toLowerCase();

  // Health/Fitness intents
  if (lower.match(/(tdee|total daily energy)/)) return { category: 'health', intent: 'tdee', confidence: 0.95 };
  if (lower.match(/(bmr|basal metabolic)/)) return { category: 'health', intent: 'bmr', confidence: 0.95 };
  if (lower.match(/\bbmi\b|body mass index/)) return { category: 'health', intent: 'bmi', confidence: 0.95 };
  if (lower.match(/(calorie|kcal|calories)/)) return { category: 'health', intent: 'calorie', confidence: 0.85 };
  if (lower.match(/(protein|macro|carb|fat)/)) return { category: 'health', intent: 'macro', confidence: 0.8 };
  if (lower.match(/(lose weight|weight loss|diet|fat loss)/)) return { category: 'health', intent: 'weight_loss', confidence: 0.85 };
  if (lower.match(/(gain weight|muscle|bulk|build muscle)/)) return { category: 'health', intent: 'muscle_gain', confidence: 0.85 };

  // Financial intents
  if (lower.match(/(compound interest|compound)/)) return { category: 'finance', intent: 'compound_interest', confidence: 0.9 };
  if (lower.match(/(loan|mortgage|payment|emi)/)) return { category: 'finance', intent: 'loan', confidence: 0.9 };
  if (lower.match(/(savings|save|invest|investment)/)) return { category: 'finance', intent: 'savings', confidence: 0.85 };
  if (lower.match(/(interest rate|interest)/)) return { category: 'finance', intent: 'interest', confidence: 0.8 };

  // Math intents
  if (lower.match(/(fraction|divide|division)/)) return { category: 'math', intent: 'fraction', confidence: 0.85 };
  if (lower.match(/(percent|percentage|%)/)) return { category: 'math', intent: 'percentage', confidence: 0.9 };
  if (lower.match(/(average|mean|median|mode)/)) return { category: 'math', intent: 'average', confidence: 0.85 };

  // General intents
  if (lower.match(/(age|birthday|born|how old)/)) return { category: 'general', intent: 'age', confidence: 0.9 };
  if (lower.match(/(convert|conversion|cm.*kg|kg.*cm|lbs.*kg|ft.*cm)/)) return { category: 'general', intent: 'convert', confidence: 0.85 };

  // Greetings
  if (lower.match(/^(hi|hello|hey|howdy|good morning|good evening)/)) return { category: 'general', intent: 'greeting', confidence: 1 };
  if (lower.match(/(thank|thanks|thx|appreciate)/)) return { category: 'general', intent: 'thanks', confidence: 1 };
  if (lower.match(/(help|what can you do|features)/)) return { category: 'general', intent: 'help', confidence: 1 };

  // Check for numbers that might indicate calculation data
  if (lower.match(/\d+/) && lower.match(/(calculate|compute|what|how|find)/)) {
    if (lower.match(/(weight|kg|lbs|pound)/)) return { category: 'health', intent: 'health_calc_partial', confidence: 0.7 };
    if (lower.match(/(loan|mortgage|interest|savings)/)) return { category: 'finance', intent: 'finance_calc_partial', confidence: 0.7 };
  }

  return { category: 'general', intent: 'unknown', confidence: 0.3 };
}

// ============ EXTRACT VARIABLES FROM MESSAGE ============

function extractHealthData(message: string): Record<string, any> {
  const lower = message.toLowerCase();
  const data: Record<string, any> = {};

  // Extract gender
  if (lower.match(/\b(male|man|boy|he|him)\b/)) data.gender = 'male';
  if (lower.match(/\b(female|woman|girl|she|her)\b/)) data.gender = 'female';

  // Extract age
  const ageMatch = lower.match(/(\d+)\s*(years?\s*old|yrs?|age)/);
  if (ageMatch) data.age = parseInt(ageMatch[1]);
  // Also try just number near age keywords
  if (!data.age) {
    const numMatch = lower.match(/age\s*(\d+)/);
    if (numMatch) data.age = parseInt(numMatch[1]);
  }

  // Extract weight in kg
  const kgMatch = lower.match(/(\d+\.?\d*)\s*kg/);
  if (kgMatch) data.weightKg = parseFloat(kgMatch[1]);

  // Extract weight in lbs
  const lbsMatch = lower.match(/(\d+\.?\d*)\s*(lbs?|pounds?)/);
  if (lbsMatch && !data.weightKg) data.weightKg = lbsToKg(parseFloat(lbsMatch[1]));

  // Extract height in cm
  const cmMatch = lower.match(/(\d+\.?\d*)\s*cm/);
  if (cmMatch) data.heightCm = parseFloat(cmMatch[1]);

  // Extract height in feet/inches
  const ftMatch = lower.match(/(\d+)\s*(?:feet|foot|ft|')\s*(\d+)?\s*(?:inches|inch|in|")?/);
  if (ftMatch && !data.heightCm) {
    const inches = ftMatch[2] ? parseInt(ftMatch[2]) : 0;
    data.heightCm = ftInToCm(parseInt(ftMatch[1]), inches);
  }

  // Extract activity level
  if (lower.match(/(sedentary|desk|no exercise|little exercise)/)) data.activity = 'sedentary';
  if (lower.match(/(lightly active|light exercise|1-3 times)/)) data.activity = 'light';
  if (lower.match(/(moderately active|moderate|3-5 times)/)) data.activity = 'moderate';
  if (lower.match(/(very active|intense|6-7 times)/)) data.activity = 'active';
  if (lower.match(/(extremely active|athlete|heavy)/)) data.activity = 'very_active';

  return data;
}

function extractFinanceData(message: string): Record<string, any> {
  const lower = message.toLowerCase();
  const data: Record<string, any> = {};

  // Extract dollar amounts
  const dollarMatch = lower.match(/\$?([\d,]+\.?\d*)/);
  if (dollarMatch) data.amount = parseFloat(dollarMatch[1].replace(/,/g, ''));

  // Extract percentages
  const pctMatch = lower.match(/(\d+\.?\d*)\s*%/);
  if (pctMatch) data.rate = parseFloat(pctMatch[1]);

  // Extract years
  const yearMatch = lower.match(/(\d+)\s*(?:years?|yrs?)/);
  if (yearMatch) data.years = parseInt(yearMatch[1]);

  // Extract months
  const monthMatch = lower.match(/(\d+)\s*months?/);
  if (monthMatch) data.months = parseInt(monthMatch[1]);

  return data;
}

// ============ RESPONSE GENERATORS ============

function generateHealthResponse(intent: string, data: Record<string, any>, message: string): string {
  // If we have enough data for calculation
  if (data.gender && data.age && data.weightKg && data.heightCm) {
    const bmr = calculateBMR(data.gender, data.weightKg, data.heightCm, data.age);
    const heightFtIn = cmToFtIn(data.heightCm);
    const weightLbs = Math.round(kgToLbs(data.weightKg));
    const bmi = calculateBMI(data.weightKg, data.heightCm);

    let response = `**Here's your complete fitness breakdown!** 💪\n\n`;

    response += `**Your Profile:**\n`;
    response += `• Gender: ${data.gender === 'male' ? 'Male' : 'Female'}\n`;
    response += `• Age: ${data.age} years\n`;
    response += `• Weight: ${Math.round(data.weightKg)} kg (${weightLbs} lbs)\n`;
    response += `• Height: ${Math.round(data.heightCm)} cm (${heightFtIn.ft}'${heightFtIn.inches}")\n\n`;

    response += `**🔥 Basal Metabolic Rate (BMR)**\n`;
    response += `Using Mifflin-St Jeor equation:\n`;
    if (data.gender === 'male') {
      response += `\`${Math.round(bmr)} = (10 × ${Math.round(data.weightKg)}) + (6.25 × ${Math.round(data.heightCm)}) - (5 × ${data.age}) + 5\`\n\n`;
    } else {
      response += `\`${Math.round(bmr)} = (10 × ${Math.round(data.weightKg)}) + (6.25 × ${Math.round(data.heightCm)}) - (5 × ${data.age}) - 161\`\n\n`;
    }

    response += `**📊 Total Daily Energy Expenditure (TDEE)**\n`;
    response += `Based on different activity levels:\n\n`;

    const activities = [
      { key: 'sedentary', label: 'Sedentary', mult: 1.2, desc: 'Desk job, little exercise' },
      { key: 'light', label: 'Lightly Active', mult: 1.375, desc: 'Exercise 1-3 days/week' },
      { key: 'moderate', label: 'Moderately Active', mult: 1.55, desc: 'Exercise 3-5 days/week' },
      { key: 'active', label: 'Very Active', mult: 1.725, desc: 'Exercise 6-7 days/week' },
      { key: 'very_active', label: 'Extremely Active', mult: 1.9, desc: 'Athlete / heavy labor' },
    ];

    activities.forEach(a => {
      const tdee = Math.round(bmr * a.mult);
      const isSelected = data.activity === a.key;
      response += `${isSelected ? '▸' : '•'} **${a.label}**: ${tdee.toLocaleString()} kcal/day — ${a.desc}\n`;
    });

    response += `\n**⚖️ BMI Status**\n`;
    response += `• Your BMI: **${bmi.value}** (${bmi.category})\n\n`;

    // Add weight guidance
    if (data.activity) {
      const tdee = calculateTDEE(bmr, data.activity);
      response += `**🎯 Your Personalized Goals** (at ${activities.find(a => a.key === data.activity)?.label || 'current'} activity):\n`;
      response += `• **Lose Weight**: Eat ${Math.round(tdee - 500).toLocaleString()} kcal/day (500 cal deficit → ~1 lb/week loss)\n`;
      response += `• **Maintain**: Eat ${Math.round(tdee).toLocaleString()} kcal/day\n`;
      response += `• **Gain Muscle**: Eat ${Math.round(tdee + 300).toLocaleString()} kcal/day (300 cal surplus)\n`;
    }

    response += `\n⚕️ *Please consult a doctor or dietitian before making big diet or exercise changes.*`;
    return response;
  }

  // If we have some data but need more
  if (data.gender || data.age || data.weightKg || data.heightCm) {
    let response = `**I can calculate your TDEE and BMR!** 🧮\n\n`;
    response += `I've got some of your info, but I need a few more details:\n\n`;

    const missing = [];
    if (!data.gender) missing.push('• **Gender** (male/female) — needed for the BMR formula');
    if (!data.age) missing.push('• **Age** (in years) — metabolism changes with age');
    if (!data.weightKg) missing.push('• **Weight** (in kg or lbs)');
    if (!data.heightCm) missing.push('• **Height** (in cm or feet/inches)');
    if (!data.activity) missing.push('• **Activity level** (sedentary, light, moderate, active, very active)');

    response += missing.join('\n') + '\n\n';
    response += `**Example:** "I'm a 30 year old male, 80kg, 175cm, moderately active"\n\n`;
    response += `Once you provide these, I'll calculate:\n`;
    response += `• Your exact BMR using the Mifflin-St Jeor equation\n`;
    response += `• TDEE for all activity levels\n`;
    response += `• Your BMI\n`;
    response += `• Personalized calorie goals for weight loss/gain/maintenance`;
    return response;
  }

  // No data yet - explain what TDEE is and ask for data
  if (intent === 'tdee' || intent === 'bmr' || intent === 'bmi') {
    return generateHealthExplanation(intent);
  }

  // General health question
  return `**I can help with fitness calculations!** 💪\n\n` +
    `I can calculate:\n` +
    `• **TDEE** — How many calories you burn per day\n` +
    `• **BMR** — Your resting metabolism\n` +
    `• **BMI** — Body mass index\n` +
    `• **Calorie goals** — For weight loss, gain, or maintenance\n\n` +
    `**Just tell me:**\n` +
    `• Your gender (male/female)\n` +
    `• Age\n` +
    `• Weight (kg or lbs)\n` +
    `• Height (cm or ft/in)\n` +
    `• Activity level\n\n` +
    `**Example:** "Calculate TDEE for a 25 year old female, 65kg, 165cm, lightly active"\n\n` +
    `⚕️ *Please consult a doctor or dietitian before making big diet or exercise changes.*`;
}

function generateHealthExplanation(type: string): string {
  if (type === 'tdee') {
    return `**What is TDEE?** 🏃‍♂️\n\n` +
      `TDEE = **Total Daily Energy Expenditure**. It's the total number of calories your body burns in a 24-hour period.\n\n` +
      `**Why it matters:**\n` +
      `• **Lose weight** → Eat 300-500 calories LESS than TDEE\n` +
      `• **Gain muscle** → Eat 300-500 calories MORE than TDEE\n` +
      `• **Maintain** → Eat exactly TDEE\n\n` +
      `**How it's calculated:**\n` +
      `\`TDEE = BMR × Activity Multiplier\`\n\n` +
      `**I can calculate yours instantly!** Just tell me:\n` +
      `• Gender (male/female)\n` +
      `• Age\n` +
      `• Weight (kg or lbs)\n` +
      `• Height (cm or ft/in)\n` +
      `• Activity level\n\n` +
      `**Example:** "Male, 28, 85kg, 180cm, very active"\n\n` +
      `⚕️ *Please consult a doctor or dietitian before making big diet or exercise changes.*`;
  }

  if (type === 'bmr') {
    return `**What is BMR?** 🔥\n\n` +
      `BMR = **Basal Metabolic Rate**. It's the number of calories your body burns at complete rest just to keep you alive — breathing, circulation, cell repair.\n\n` +
      `**Key facts:**\n` +
      `• BMR is usually 60-70% of your TDEE\n` +
      `• Muscle burns more calories than fat\n` +
      `• BMR decreases with age\n\n` +
      `**The Formula (Mifflin-St Jeor):**\n` +
      `• Men: \`BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5\`\n` +
      `• Women: \`BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161\`\n\n` +
      `**Want me to calculate yours?** Just tell me your gender, age, weight, and height!\n\n` +
      `⚕️ *Please consult a doctor or dietitian before making big diet or exercise changes.*`;
  }

  if (type === 'bmi') {
    return `**What is BMI?** 📊\n\n` +
      `BMI = **Body Mass Index**. It's a quick way to check if your weight is healthy for your height.\n\n` +
      `**The Formula:**\n` +
      `\`BMI = weight_kg / (height_m)²\`\n\n` +
      `**Categories:**\n` +
      `• Underweight: BMI < 18.5\n` +
      `• Normal: BMI 18.5 - 24.9\n` +
      `• Overweight: BMI 25 - 29.9\n` +
      `• Obese: BMI 30+\n\n` +
      `**Limitation:** BMI doesn't account for muscle mass. Athletes often have high BMI but are perfectly healthy.\n\n` +
      `**Want me to calculate yours?** Just tell me your weight (kg) and height (cm)!\n\n` +
      `⚕️ *Please consult a doctor or dietitian before making big diet or exercise changes.*`;
  }

  return '';
}

function generateFinanceResponse(intent: string, data: Record<string, any>, message: string): string {
  if (intent === 'compound_interest') {
    if (data.amount && data.rate && (data.years || data.months)) {
      const years = data.years || (data.months ? data.months / 12 : 1);
      const result = calculateCompoundInterest(data.amount, data.rate, 12, years);

      let response = `**Compound Interest Calculation** 💰\n\n`;
      response += `**Your Investment:**\n`;
      response += `• Principal: $${data.amount.toLocaleString()}\n`;
      response += `• Rate: ${data.rate}% per year\n`;
      response += `• Time: ${data.years || data.months + ' months'}\n`;
      response += `• Compounding: Monthly\n\n`;
      response += `**Results:**\n`;
      response += `• Final Amount: **$${result.total.toLocaleString()}**\n`;
      response += `• Interest Earned: **$${result.interest.toLocaleString()}**\n\n`;
      response += `**💡 The Magic of Compound Interest:**\n`;
      response += `Your money grew by **${((result.total / data.amount - 1) * 100).toFixed(1)}%**!\n`;
      response += `That's earning interest on your interest — the sooner you start, the more you earn.\n\n`;
      response += `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
      return response;
    }

    if (data.amount || data.rate) {
      let response = `**I can calculate compound interest!** 📈\n\n`;
      response += `I've got some info, but I need a bit more:\n\n`;
      if (!data.amount) response += `• **Principal amount** (how much to invest)\n`;
      if (!data.rate) response += `• **Interest rate** (as a percentage, e.g., 7%)\n`;
      if (!data.years && !data.months) response += `• **Time period** (in years or months)\n`;
      response += `\n**Example:** "$10,000 at 7% for 10 years"\n\n`;
      response += `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
      return response;
    }

    return `**Compound Interest Calculator** 📈\n\n` +
      `Compound interest means **earning interest on your interest**. It's how small savings grow into big wealth over time.\n\n` +
      `**The Formula:**\n` +
      `\`A = P(1 + r/n)^(nt)\`\n` +
      `Where: P = Principal, r = Rate, n = Compounds per year, t = Time in years\n\n` +
      `**Example:** $100 at 10% for 10 years:\n` +
      `• Simple interest: $200 (you earn $10/year)\n` +
      `• Compound interest: $259.37 (you earn more each year!)\n\n` +
      `**Want me to calculate yours?** Tell me:\n` +
      `• How much are you investing? (principal)\n` +
      `• What's the interest rate?\n` +
      `• How long? (years or months)\n\n` +
      `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
  }

  if (intent === 'loan') {
    if (data.amount && data.rate && (data.years || data.months)) {
      const years = data.years || (data.months ? data.months / 12 : 1);
      const result = calculateLoanPayment(data.amount, data.rate, years);

      let response = `**Loan Payment Calculation** 🏦\n\n`;
      response += `**Loan Details:**\n`;
      response += `• Amount: $${data.amount.toLocaleString()}\n`;
      response += `• Interest Rate: ${data.rate}% per year\n`;
      response += `• Term: ${data.years || data.months + ' months'}\n\n`;
      response += `**Your Payments:**\n`;
      response += `• Monthly Payment: **$${result.monthly.toLocaleString()}**\n`;
      response += `• Total Paid: **$${result.total.toLocaleString()}**\n`;
      response += `• Total Interest: **$${result.interest.toLocaleString()}**\n\n`;
      response += `**💡 Money-Saving Tip:**\n`;
      response += `Paying just $${Math.round(result.monthly * 0.1).toLocaleString()}/month extra could save you **$${Math.round(result.interest * 0.15).toLocaleString()}** in interest!\n\n`;
      response += `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
      return response;
    }

    return `**Loan Calculator** 🏦\n\n` +
      `I can calculate your monthly payment, total cost, and total interest.\n\n` +
      `**Just tell me:**\n` +
      `• Loan amount (e.g., $200,000)\n` +
      `• Interest rate (e.g., 6.5%)\n` +
      `• Loan term (e.g., 30 years)\n\n` +
      `**Example:** "$250,000 loan at 7% for 30 years"\n\n` +
      `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
  }

  if (intent === 'savings' || intent === 'interest') {
    if (data.amount && data.rate) {
      let response = `**Savings Growth Projection** 🐷\n\n`;
      response += `**Starting with $${data.amount.toLocaleString()} at ${data.rate}%:**\n\n`;

      const years = [1, 5, 10, 20, 30];
      years.forEach(y => {
        const result = calculateCompoundInterest(data.amount, data.rate, 12, y);
        response += `• **${y} year${y > 1 ? 's' : ''}**: $${result.total.toLocaleString()} (+$${result.interest.toLocaleString()} earned)\n`;
      });

      response += `\n**💡 Key Insight:**\n`;
      const doubleTime = Math.round(72 / data.rate);
      response += `At ${data.rate}%, your money doubles roughly every **${doubleTime} years**.\n`;
      response += `The best time to start saving? **Yesterday.** The second best? **Today.**\n\n`;
      response += `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
      return response;
    }

    return `**Savings & Investment Calculator** 🐷\n\n` +
      `Small, consistent savings grow into wealth through compound interest.\n\n` +
      `**Want me to project your savings?** Tell me:\n` +
      `• Starting amount\n` +
      `• Interest rate (e.g., 5%)\n` +
      `• How long you'll save\n\n` +
      `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
  }

  return `**I can help with financial calculations!** 💰\n\n` +
    `I can calculate:\n` +
    `• **Compound Interest** — Watch your money grow\n` +
    `• **Loan Payments** — Know your monthly costs\n` +
    `• **Savings Projections** — Plan your future\n` +
    `• **Investment Returns** — See your potential gains\n\n` +
    `**Just tell me what you need!** For example:\n` +
    `• "Calculate compound interest on $10,000 at 7% for 10 years"\n` +
    `• "What's the monthly payment on a $250,000 loan at 6.5% for 30 years?"\n` +
    `• "How much will $500/month grow in 20 years at 8%?"\n\n` +
    `💡 *I'm an AI, so please double-check your big financial plans with a professional!*`;
}

function generateMathResponse(intent: string, data: Record<string, any>, message: string): string {
  const lower = message.toLowerCase();

  // Try to extract numbers for calculation
  const numbers = lower.match(/\d+\.?\d*/g)?.map(Number) || [];

  if (intent === 'percentage' && numbers.length >= 2) {
    // Check what type of percentage question
    if (lower.match(/what is \d+/) || lower.match(/\d+ %/)) {
      const pct = numbers[0];
      const value = numbers[1];
      const result = (pct / 100) * value;
      return `**Percentage Calculation** 🧮\n\n` +
        `**Step 1:** Convert percentage to decimal\n` +
        `${pct}% = ${pct} ÷ 100 = ${pct / 100}\n\n` +
        `**Step 2:** Multiply by the value\n` +
        `${pct / 100} × ${value} = **${result}**\n\n` +
        `**Answer:** ${pct}% of ${value} = **${result}**\n\n` +
        `**Real-world example:** If a shirt costs $${value} and is ${pct}% off, you save $${result.toFixed(2)}!`;
    }
  }

  if (intent === 'fraction' && numbers.length >= 2) {
    const a = numbers[0];
    const b = numbers[1];
    const result = a / b;
    return `**Fraction Calculation** 🧮\n\n` +
      `**Step 1:** Divide the numerator by the denominator\n` +
      `${a} ÷ ${b} = **${result.toFixed(4)}**\n\n` +
      `**Step 2:** Convert to percentage (optional)\n` +
      `${result.toFixed(4)} × 100 = **${(result * 100).toFixed(2)}%**\n\n` +
      `**Answer:** ${a}/${b} = **${result.toFixed(4)}** (${(result * 100).toFixed(2)}%)\n\n` +
      `**Real-world example:** If you eat ${a} slices of a ${b}-slice pizza, you've eaten **${(result * 100).toFixed(0)}%** of it!`;
  }

  if (intent === 'average' && numbers.length > 0) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return `**Average Calculation** 🧮\n\n` +
      `**Numbers:** ${numbers.join(', ')}\n\n` +
      `**Mean (Average):**\n` +
      `Step 1: Add all numbers\n` +
      `${numbers.join(' + ')} = ${sum}\n\n` +
      `Step 2: Divide by count\n` +
      `${sum} ÷ ${numbers.length} = **${avg.toFixed(2)}**\n\n` +
      `**Median (Middle value):** **${median}**\n\n` +
      `**Answer:** Average = **${avg.toFixed(2)}**, Median = **${median}**`;
  }

  return `**I can help with math!** 🧮\n\n` +
    `I'm an ultra-patient tutor. I'll break down any problem step by step.\n\n` +
    `**I can help with:**\n` +
    `• **Percentages** — "What is 25% of 200?"\n` +
    `• **Fractions** — "What is 3/8 as a decimal?"\n` +
    `• **Averages** — "Average of 10, 20, 30, 40, 50"\n` +
    `• **Basic math** — Addition, subtraction, multiplication, division\n\n` +
    `**Just ask!** For example:\n` +
    `• "What is 15% of $350?"\n` +
    `• "Calculate 7/12 as a decimal"\n` +
    `• "Find the average of 85, 90, 78, 92, 88"\n\n` +
    `I'll show you exactly how it works!`;
}

function generateGeneralResponse(intent: string, data: Record<string, any>, message: string): string {
  const lower = message.toLowerCase();

  if (intent === 'age') {
    // Try to extract a date
    const dateMatch = lower.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateMatch) {
      const birthday = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
      const age = calculateAge(birthday);
      return `**Age Calculation** 🎂\n\n` +
        `**Birthday:** ${birthday}\n` +
        `**Today:** ${new Date().toISOString().split('T')[0]}\n\n` +
        `**Your Age:**\n` +
        `• **${age.years} years, ${age.months} months, ${age.days} days**\n` +
        `• Total days lived: **${age.totalDays.toLocaleString()}**\n\n` +
        `**Fun fact:** You've been alive for approximately **${Math.round(age.totalDays * 24).toLocaleString()} hours**!`;
    }

    // Try month/day format
    const monthDayMatch = lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s*(\d{4})/);
    if (monthDayMatch) {
      const months: Record<string, string> = {
        january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
        july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
      };
      const birthday = `${monthDayMatch[3]}-${months[monthDayMatch[1]]}-${monthDayMatch[2].padStart(2, '0')}`;
      const age = calculateAge(birthday);
      return `**Age Calculation** 🎂\n\n` +
        `**Birthday:** ${birthday}\n\n` +
        `**Your Age:**\n` +
        `• **${age.years} years, ${age.months} months, ${age.days} days**\n` +
        `• Total days lived: **${age.totalDays.toLocaleString()}**`;
    }

    return `**Age Calculator** 🎂\n\n` +
      `I can calculate your exact age!\n\n` +
      `**Just tell me your birthday** in any format:\n` +
      `• "1990-05-15"\n` +
      `• "May 15, 1990"\n` +
      `• "I was born on 1990/05/15"\n\n` +
      `I'll tell you your exact age in years, months, and days!`;
  }

  if (intent === 'greeting') {
    return `Hello! 👋 Welcome to **TDEE Lab**!\n\n` +
      `I'm your AI assistant, and I'm here to help with:\n\n` +
      `🏃 **Health & Fitness** — TDEE, BMR, BMI, calorie goals\n` +
      `💰 **Finance** — Loans, compound interest, savings\n` +
      `🧮 **Math** — Percentages, fractions, averages\n` +
      `🎂 **General** — Age calculations, unit conversions\n\n` +
      `**What would you like to calculate today?**\n\n` +
      `Just ask me anything — I'll show my work step by step!`;
  }

  if (intent === 'thanks') {
    return `You're welcome! 😊 I'm glad I could help!\n\n` +
      `Feel free to ask if you have any other questions. I'm here 24/7 to help you calculate, learn, and understand.\n\n` +
      `**Quick links:**\n` +
      `• [TDEE Calculator](/tdee-calculator/)\n` +
      `• [Math Calculators](/math-calculator/)\n` +
      `• [Financial Calculators](/financial-calculator/)\n` +
      `• [Other Tools](/other-calculator/)`;
  }

  if (intent === 'help') {
    return `**What I Can Do** 🤖\n\n` +
      `I'm a fully-featured AI calculator assistant. Here's what I can help with:\n\n` +
      `**🏥 Health & Fitness**\n` +
      `• Calculate TDEE, BMR, BMI with real formulas\n` +
      `• Create personalized calorie goals\n` +
      `• Explain fitness concepts in simple terms\n\n` +
      `**💰 Financial**\n` +
      `• Compound interest calculations\n` +
      `• Loan payment calculations\n` +
      `• Savings projections\n\n` +
      `**🧮 Math**\n` +
      `• Percentages, fractions, averages\n` +
      `• Step-by-step explanations\n` +
      `• Real-world examples\n\n` +
      `**🎂 General**\n` +
      `• Age calculations\n` +
      `• Unit conversions\n\n` +
      `**Just ask naturally!** For example:\n` +
      `• "I'm a 30 year old male, 80kg, 175cm, moderately active"\n` +
      `• "Calculate $50,000 at 7% for 20 years"\n` +
      `• "What is 30% of $450?"\n` +
      `• "I was born on 1995-03-15, how old am I?"`;
  }

  // Check if user is providing data for a pending calculation
  if (context.pendingCalculation) {
    const pending = context.pendingCalculation;

    if (pending === 'health' && lower.match(/\d+/)) {
      const extracted = extractHealthData(message);
      Object.assign(context.collectedData, extracted);

      if (context.collectedData.gender && context.collectedData.age && context.collectedData.weightKg && context.collectedData.heightCm) {
        context.pendingCalculation = null;
        const result = generateHealthResponse('tdee', context.collectedData, message);
        context.collectedData = {};
        return result;
      } else {
        return generateHealthResponse('tdee', context.collectedData, message);
      }
    }

    if (pending === 'finance' && lower.match(/\d+/)) {
      const extracted = extractFinanceData(message);
      Object.assign(context.collectedData, extracted);

      if (context.collectedData.amount && context.collectedData.rate) {
        context.pendingCalculation = null;
        const result = generateFinanceResponse('compound_interest', context.collectedData, message);
        context.collectedData = {};
        return result;
      }
    }
  }

  return `**I'm here to help!** 🤖\n\n` +
    `I can assist with:\n\n` +
    `🏥 **Health** — "Calculate my TDEE" / "What's my BMI?"\n` +
    `💰 **Finance** — "Compound interest on $10,000 at 7%"\n` +
    `🧮 **Math** — "What is 25% of 300?"\n` +
    `🎂 **General** — "I was born in 1990, how old am I?"\n\n` +
    `**Just ask naturally, and I'll do the math!**`;
}

// ============ MAIN RESPONSE GENERATOR ============

function generateResponse(userMessage: string): string {
  const { category, intent } = detectIntent(userMessage);
  context.lastTopic = category;

  // Extract data from message
  let extractedData: Record<string, any> = {};

  if (category === 'health') {
    extractedData = extractHealthData(userMessage);
    // Merge with any pending data
    Object.assign(context.collectedData, extractedData);

    if (Object.keys(context.collectedData).length > 0) {
      context.pendingCalculation = 'health';
    }

    return generateHealthResponse(intent, context.collectedData, userMessage);
  }

  if (category === 'finance') {
    extractedData = extractFinanceData(userMessage);
    Object.assign(context.collectedData, extractedData);

    if (Object.keys(context.collectedData).length > 0) {
      context.pendingCalculation = 'finance';
    }

    return generateFinanceResponse(intent, context.collectedData, userMessage);
  }

  if (category === 'math') {
    const numbers = userMessage.match(/\d+\.?\d*/g)?.map(Number) || [];
    return generateMathResponse(intent, { numbers }, userMessage);
  }

  return generateGeneralResponse(intent, extractedData, userMessage);
}

// ============ CHATBOT UI ============

export function initChatbot() {
  const chatbotHTML = `
    <div id="chatbot-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 1000; font-family: Inter, sans-serif;">
      <button id="chatbot-toggle" style="
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
        color: white; border: none; cursor: pointer;
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s ease;
      ">
        <svg id="chat-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg id="close-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div id="chatbot-window" style="
        position: absolute; bottom: 72px; right: 0; width: 400px; height: 560px;
        background: white; border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: none; flex-direction: column; overflow: hidden;
        border: 1px solid #e5e7eb;
      ">
        <div style="
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white; padding: 16px 20px; display: flex; align-items: center; gap: 12px;
        ">
          <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">AI Calculator Assistant</div>
            <div style="font-size: 12px; opacity: 0.9;">Ask me anything — I show my work!</div>
          </div>
        </div>

        <div id="chatbot-messages" style="
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          background: #f9fafb;
        "></div>

        <div style="
          padding: 8px 16px; display: flex; gap: 6px; flex-wrap: wrap;
          border-top: 1px solid #e5e7eb; background: white;
        ">
          <button class="quick-btn" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #e5e7eb; background: white; font-size: 12px; cursor: pointer; color: #374151; transition: all 0.2s;">Calculate my TDEE</button>
          <button class="quick-btn" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #e5e7eb; background: white; font-size: 12px; cursor: pointer; color: #374151; transition: all 0.2s;">Compound interest</button>
          <button class="quick-btn" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #e5e7eb; background: white; font-size: 12px; cursor: pointer; color: #374151; transition: all 0.2s;">Loan calculator</button>
          <button class="quick-btn" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #e5e7eb; background: white; font-size: 12px; cursor: pointer; color: #374151; transition: all 0.2s;">What is BMI?</button>
        </div>

        <div style="padding: 12px 16px; border-top: 1px solid #e5e7eb; background: white; display: flex; gap: 8px;">
          <input type="text" id="chatbot-input" placeholder="Ask me anything..." style="
            flex: 1; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 24px;
            font-size: 14px; outline: none; transition: border-color 0.2s;
          " />
          <button id="chatbot-send" style="
            width: 44px; height: 44px; border-radius: 50%;
            background: #4F46E5; color: white; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  const toggle = document.getElementById('chatbot-toggle') as HTMLButtonElement;
  const window_ = document.getElementById('chatbot-window') as HTMLDivElement;
  const messages = document.getElementById('chatbot-messages') as HTMLDivElement;
  const input = document.getElementById('chatbot-input') as HTMLInputElement;
  const sendBtn = document.getElementById('chatbot-send') as HTMLButtonElement;
  const chatIcon = document.getElementById('chat-icon') as SVGElement;
  const closeIcon = document.getElementById('close-icon') as SVGElement;
  const quickBtns = document.querySelectorAll('.quick-btn');

  let isOpen = false;

  function addMessage(content: string, isUser: boolean) {
    const div = document.createElement('div');
    div.style.cssText = `
      max-width: 88%; padding: 14px 18px; border-radius: 18px;
      font-size: 14px; line-height: 1.6; word-wrap: break-word;
      ${isUser
        ? 'background: #4F46E5; color: white; align-self: flex-end; border-bottom-right-radius: 4px;'
        : 'background: white; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);'
      }
    `;
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '&bull; ');
    div.innerHTML = formatted;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.style.cssText = `
      padding: 14px 18px; border-radius: 18px; background: white;
      align-self: flex-start; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    `;
    div.innerHTML = `
      <div style="display: flex; gap: 4px;">
        <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite;"></div>
        <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></div>
        <div style="width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></div>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';

    addTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const response = generateResponse(text);
      addMessage(response, false);
    }, 800 + Math.random() * 700);
  }

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    window_.style.display = isOpen ? 'flex' : 'none';
    chatIcon.style.display = isOpen ? 'none' : 'block';
    closeIcon.style.display = isOpen ? 'block' : 'none';
    if (isOpen && messages.children.length === 0) {
      addMessage(
        `Hello! 👋 I'm your **AI Calculator Assistant**.\n\n` +
        `I can help with:\n` +
        `• **Health** — TDEE, BMR, BMI, calories\n` +
        `• **Finance** — Loans, compound interest, savings\n` +
        `• **Math** — Percentages, fractions, averages\n` +
        `• **General** — Age, conversions\n\n` +
        `**I use real formulas and show my work!** Just ask me anything.`,
        false
      );
    }
    if (isOpen) input.focus();
  });

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent || '';
      handleSend();
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#4F46E5';
      btn.style.color = 'white';
      btn.style.borderColor = '#4F46E5';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'white';
      btn.style.color = '#374151';
      btn.style.borderColor = '#e5e7eb';
    });
  });

  toggle.addEventListener('mouseenter', () => { toggle.style.transform = 'scale(1.1)'; });
  toggle.addEventListener('mouseleave', () => { toggle.style.transform = 'scale(1)'; });

  // Add typing animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
