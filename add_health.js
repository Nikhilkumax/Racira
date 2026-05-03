const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Body Metrics
  { slug: 'visceral-fat-calculator', name: 'Visceral Fat Calculator', desc: 'Estimate your visceral fat level and assess metabolic health risk.', sub: 'Body Metrics', icon: 'Activity' },
  { slug: 'pediatric-bmi-calculator', name: 'Pediatric BMI Calculator', desc: 'Calculate BMI for children and teens aged 2–19 with age and gender percentiles.', sub: 'Body Metrics', icon: 'Baby' },
  { slug: 'ponderal-index-calculator', name: 'Ponderal Index Calculator', desc: 'Calculate the Ponderal Index as an alternative to BMI for assessing body composition.', sub: 'Body Metrics', icon: 'Activity' },
  { slug: 'body-frame-size-calculator', name: 'Body Frame Size Calculator', desc: 'Determine your body frame size (small, medium, large) from wrist circumference.', sub: 'Body Metrics', icon: 'Ruler' },
  { slug: 'max-heart-rate-calculator', name: 'Maximum Heart Rate Calculator', desc: 'Calculate your estimated maximum heart rate based on age and fitness level.', sub: 'Body Metrics', icon: 'Heart' },
  { slug: 'mean-arterial-pressure-calculator', name: 'Mean Arterial Pressure Calculator', desc: 'Calculate MAP from systolic and diastolic blood pressure readings.', sub: 'Body Metrics', icon: 'Activity' },
  { slug: 'fitness-age-calculator', name: 'Fitness Age Calculator', desc: 'Estimate your biological fitness age based on cardiovascular capacity and lifestyle.', sub: 'Body Metrics', icon: 'Dumbbell' },
  { slug: 'bmi-prime-calculator', name: 'BMI Prime Calculator', desc: 'Calculate BMI Prime — the ratio of your BMI to the upper limit of normal BMI.', sub: 'Body Metrics', icon: 'Activity' },
  { slug: 'creatinine-clearance-calculator', name: 'Creatinine Clearance Calculator', desc: 'Estimate kidney function using the Cockcroft-Gault creatinine clearance formula.', sub: 'Body Metrics', icon: 'Activity' },
  // Nutrition
  { slug: 'glycemic-load-calculator', name: 'Glycemic Load Calculator', desc: 'Calculate the glycemic load of foods to manage blood sugar impact.', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'glycemic-index-calculator', name: 'Glycemic Index Calculator', desc: 'Look up and compare glycemic index values across common foods.', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'omega-3-calculator', name: 'Omega-3 Intake Calculator', desc: 'Determine your daily omega-3 needs based on age, weight, and health goals.', sub: 'Nutrition', icon: 'Droplets' },
  { slug: 'vitamin-d-calculator', name: 'Vitamin D Dosage Calculator', desc: 'Calculate your recommended vitamin D intake based on sun exposure and deficiency risk.', sub: 'Nutrition', icon: 'Sparkles' },
  { slug: 'fiber-intake-calculator', name: 'Daily Fiber Intake Calculator', desc: 'Calculate your recommended daily fiber intake based on age and calorie needs.', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'sodium-intake-calculator', name: 'Sodium Intake Calculator', desc: 'Estimate daily sodium needs and flag excess intake for heart health.', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'potassium-intake-calculator', name: 'Potassium Intake Calculator', desc: 'Calculate daily potassium requirements for blood pressure and muscle health.', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'caffeine-calculator', name: 'Caffeine Intake Calculator', desc: 'Track daily caffeine intake from coffee, tea, and supplements with safe limits.', sub: 'Nutrition', icon: 'Coffee' },
  { slug: 'alcohol-calories-calculator', name: 'Alcohol Calorie Calculator', desc: 'Calculate the total calories in beer, wine, and spirits per serving.', sub: 'Nutrition', icon: 'Wine' },
  { slug: 'intermittent-fasting-calculator', name: 'Intermittent Fasting Calculator', desc: 'Calculate fasting and eating windows for 16:8, 5:2, and other IF protocols.', sub: 'Nutrition', icon: 'Clock' },
  { slug: 'nutrient-timing-calculator', name: 'Nutrient Timing Calculator', desc: 'Optimize meal and nutrient timing around workouts for performance and recovery.', sub: 'Nutrition', icon: 'Timer' },
  { slug: 'daily-calorie-burn-calculator', name: 'Daily Calorie Burn Calculator', desc: 'Estimate total daily calorie expenditure from resting and active metabolism.', sub: 'Nutrition', icon: 'Activity' },
  // Pregnancy
  { slug: 'fetal-weight-calculator', name: 'Fetal Weight Calculator', desc: 'Estimate fetal weight by week of pregnancy using standard growth charts.', sub: 'Pregnancy', icon: 'Baby' },
  { slug: 'gestational-age-calculator', name: 'Gestational Age Calculator', desc: 'Calculate gestational age from the last menstrual period or ultrasound date.', sub: 'Pregnancy', icon: 'Calendar' },
  { slug: 'breastfeeding-calorie-calculator', name: 'Breastfeeding Calorie Calculator', desc: 'Calculate extra calories needed while breastfeeding based on feeding frequency.', sub: 'Pregnancy', icon: 'Heart' },
  { slug: 'baby-growth-percentile-calculator', name: 'Baby Growth Percentile Calculator', desc: 'Track baby weight, height, and head circumference against WHO growth percentiles.', sub: 'Pregnancy', icon: 'Baby' },
  { slug: 'postpartum-weight-loss-calculator', name: 'Postpartum Weight Loss Calculator', desc: 'Estimate healthy weight loss timeline after childbirth based on calories and activity.', sub: 'Pregnancy', icon: 'Activity' },
  { slug: 'prenatal-vitamin-calculator', name: 'Prenatal Vitamin Calculator', desc: 'Calculate key prenatal nutrient requirements including folic acid and iron by trimester.', sub: 'Pregnancy', icon: 'Apple' },
  { slug: 'ivf-due-date-calculator', name: 'IVF Due Date Calculator', desc: 'Calculate the expected due date for pregnancies achieved through IVF.', sub: 'Pregnancy', icon: 'Calendar' },
  // Activity
  { slug: 'steps-to-calories-calculator', name: 'Steps to Calories Calculator', desc: 'Convert daily step count to estimated calorie burn based on weight and stride.', sub: 'Activity', icon: 'Activity' },
  { slug: 'mets-calculator', name: 'METs Activity Calculator', desc: 'Calculate energy expenditure in METs for hundreds of physical activities.', sub: 'Activity', icon: 'Dumbbell' },
  { slug: 'calories-burned-walking', name: 'Calories Burned Walking Calculator', desc: 'Estimate calories burned walking based on distance, pace, and body weight.', sub: 'Activity', icon: 'Activity' },
  { slug: 'cycling-calories-calculator', name: 'Cycling Calorie Calculator', desc: 'Estimate calories burned during cycling based on speed, duration, and terrain.', sub: 'Activity', icon: 'Gauge' },
  { slug: 'active-metabolic-rate-calculator', name: 'Active Metabolic Rate Calculator', desc: 'Calculate AMR — total daily calories burned including all physical activities.', sub: 'Activity', icon: 'Zap' },
  { slug: 'calorie-deficit-calculator', name: 'Calorie Deficit Calculator', desc: 'Calculate the daily calorie deficit needed to lose a specific amount of weight per week.', sub: 'Activity', icon: 'TrendingDown' },
  { slug: 'heart-rate-recovery-calculator', name: 'Heart Rate Recovery Calculator', desc: 'Measure cardiovascular fitness by tracking how fast your heart rate drops after exercise.', sub: 'Activity', icon: 'Heart' },
  { slug: 'workout-calorie-calculator', name: 'Workout Calorie Calculator', desc: 'Estimate total calories burned during a full workout session by exercise type.', sub: 'Activity', icon: 'Dumbbell' },
  { slug: 'fat-burning-zone-calculator', name: 'Fat Burning Zone Calculator', desc: 'Calculate your optimal heart rate zone for maximum fat burning during exercise.', sub: 'Activity', icon: 'Activity' },
  { slug: 'marathon-training-calculator', name: 'Marathon Training Pace Calculator', desc: 'Calculate target training paces for long runs, tempo runs, and intervals.', sub: 'Activity', icon: 'Activity' },
  { slug: 'swimming-calorie-calculator', name: 'Swimming Calorie Calculator', desc: 'Estimate calories burned swimming different strokes at various intensities.', sub: 'Activity', icon: 'Droplets' },
  { slug: 'hiit-calorie-calculator', name: 'HIIT Calorie Calculator', desc: 'Estimate calories burned during high-intensity interval training sessions.', sub: 'Activity', icon: 'Zap' },
  // Medical
  { slug: 'sleep-debt-calculator', name: 'Sleep Debt Calculator', desc: 'Calculate accumulated sleep debt and time needed to recover full rest.', sub: 'Medical', icon: 'Moon' },
  { slug: 'caffeine-half-life-calculator', name: 'Caffeine Half-Life Calculator', desc: 'Calculate when caffeine will clear your system based on intake time and amount.', sub: 'Medical', icon: 'Clock' },
  { slug: 'drug-dosage-calculator', name: 'Drug Dosage Calculator', desc: 'Calculate medication dosage based on patient weight and prescribed mg/kg.', sub: 'Medical', icon: 'Activity' },
  { slug: 'ibw-calculator', name: 'Ideal Body Weight Calculator', desc: 'Calculate ideal body weight using Devine, Robinson, Miller, and Hamwi formulas.', sub: 'Medical', icon: 'Activity' },
  { slug: 'heart-attack-risk-calculator', name: 'Heart Attack Risk Calculator', desc: 'Estimate 10-year cardiovascular disease risk using the Framingham risk score.', sub: 'Medical', icon: 'Heart' },
  { slug: 'diabetes-risk-calculator', name: 'Diabetes Risk Calculator', desc: 'Assess your risk of developing type 2 diabetes based on lifestyle and family history.', sub: 'Medical', icon: 'Activity' },
  { slug: 'cholesterol-ratio-calculator', name: 'Cholesterol Ratio Calculator', desc: 'Calculate LDL/HDL ratio and total cholesterol risk from a lipid panel.', sub: 'Medical', icon: 'Activity' },
  { slug: 'bmi-classification-calculator', name: 'BMI Classification Calculator', desc: 'Classify BMI into underweight, normal, overweight, or obese categories with health context.', sub: 'Medical', icon: 'Activity' },
  { slug: 'hydration-calculator', name: 'Daily Hydration Calculator', desc: 'Calculate precise daily water needs based on body weight, activity level, and climate.', sub: 'Medical', icon: 'Droplets' },
  { slug: 'menstrual-cycle-length-calculator', name: 'Menstrual Cycle Length Calculator', desc: 'Calculate average cycle length and predict next periods from cycle history.', sub: 'Medical', icon: 'Calendar' },
  { slug: 'caloric-expenditure-calculator', name: 'Daily Caloric Expenditure Calculator', desc: 'Calculate total daily energy expenditure using Harris-Benedict or Mifflin-St Jeor.', sub: 'Medical', icon: 'Activity' },
  { slug: 'blood-pressure-category-calculator', name: 'Blood Pressure Category Calculator', desc: 'Classify blood pressure readings and assess hypertension stage and risk.', sub: 'Medical', icon: 'Activity' },
  { slug: 'covid-symptom-calculator', name: 'COVID-19 Symptom Risk Calculator', desc: 'Assess COVID-19 symptom severity and determine recommended care pathway.', sub: 'Medical', icon: 'Shield' },
  { slug: 'vaccination-schedule-calculator', name: 'Vaccination Schedule Calculator', desc: 'Generate a recommended vaccination schedule based on age and health status.', sub: 'Medical', icon: 'Activity' },
  { slug: 'fertility-window-calculator', name: 'Fertility Window Calculator', desc: 'Calculate peak fertile days and conception window based on cycle length.', sub: 'Medical', icon: 'Heart' },
  { slug: 'hemoglobin-calculator', name: 'Hemoglobin Level Calculator', desc: 'Assess hemoglobin levels for anemia classification by age and gender.', sub: 'Medical', icon: 'Activity' },
  { slug: 'pulse-ox-calculator', name: 'Pulse Oximetry Calculator', desc: 'Interpret SpO2 readings and understand oxygen saturation levels and ranges.', sub: 'Medical', icon: 'Activity' },
  { slug: 'fever-calculator', name: 'Fever Assessment Calculator', desc: 'Determine fever severity and recommended treatment based on temperature and age.', sub: 'Medical', icon: 'Thermometer' },
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped (already exist):', skipped.map(e => e.slug));

let entriesStr = '\n\n  // ══════════════════════════════════════════════\n  // 🏥 HEALTH — NEW ADDITIONS\n  // ══════════════════════════════════════════════\n';
const groups = {};
toAdd.forEach(e => { if (!groups[e.sub]) groups[e.sub] = []; groups[e.sub].push(e); });
Object.entries(groups).forEach(([sub, entries]) => {
  entriesStr += `\n  // ${sub}\n`;
  entries.forEach(e => {
    entriesStr += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "Health", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
  });
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + entriesStr + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Health calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
