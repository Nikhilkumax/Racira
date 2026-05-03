const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Sports - General
  { slug: 'vo2-max-calculator', name: 'VO2 Max Calculator', desc: 'Estimate your maximal oxygen uptake to determine cardiovascular fitness.', cat: 'Sports', sub: 'Performance', icon: 'HeartPulse' },
  { slug: 'target-heart-rate-calculator', name: 'Target Heart Rate Calculator', desc: 'Find your target heart rate zones for different training intensities.', cat: 'Sports', sub: 'Training', icon: 'Heart' },
  { slug: 'resting-heart-rate-calculator', name: 'Resting Heart Rate Calculator', desc: 'Determine your resting heart rate and fitness baseline.', cat: 'Sports', sub: 'Health', icon: 'Heart' },
  { slug: 'calories-burned-by-heart-rate', name: 'Calories Burned by Heart Rate Calculator', desc: 'Estimate calorie expenditure based on average heart rate during exercise.', cat: 'Sports', sub: 'Performance', icon: 'Activity' },
  { slug: 'sweat-rate-calculator', name: 'Sweat Rate Calculator', desc: 'Calculate fluid loss during exercise to plan hydration strategies.', cat: 'Sports', sub: 'Health', icon: 'Droplets' },
  { slug: 'hydration-during-exercise-calculator', name: 'Exercise Hydration Calculator', desc: 'Estimate fluid replacement needs based on sweat rate and workout duration.', cat: 'Sports', sub: 'Health', icon: 'Droplets' },
  { slug: 'bmr-for-athletes-calculator', name: 'Athlete BMR Calculator', desc: 'Calculate Basal Metabolic Rate using athlete-specific formulas like Katch-McArdle.', cat: 'Sports', sub: 'Nutrition', icon: 'Activity' },
  { slug: 'tdee-for-athletes-calculator', name: 'Athlete TDEE Calculator', desc: 'Estimate total daily energy expenditure factoring in specific athletic training volumes.', cat: 'Sports', sub: 'Nutrition', icon: 'Zap' },
  { slug: 'macro-ratio-for-athletes-calculator', name: 'Athlete Macro Ratio Calculator', desc: 'Determine optimal carbohydrate, protein, and fat ratios for your specific sport.', cat: 'Sports', sub: 'Nutrition', icon: 'PieChart' },
  { slug: 'carb-loading-calculator', name: 'Carb Loading Calculator', desc: 'Calculate the amount of carbohydrates needed leading up to an endurance event.', cat: 'Sports', sub: 'Nutrition', icon: 'Apple' },
  { slug: 'protein-requirements-calculator', name: 'Protein Requirements Calculator', desc: 'Find your daily protein needs based on training type, intensity, and goals.', cat: 'Sports', sub: 'Nutrition', icon: 'Dumbbell' },
  { slug: 'creatine-dosing-calculator', name: 'Creatine Dosing Calculator', desc: 'Calculate loading and maintenance doses for creatine supplementation.', cat: 'Sports', sub: 'Nutrition', icon: 'Beaker' },

  // Sports - Running
  { slug: 'running-pace-calculator', name: 'Running Pace Calculator', desc: 'Calculate running pace per mile or kilometer based on time and distance.', cat: 'Sports', sub: 'Running', icon: 'Timer' },
  { slug: 'running-split-calculator', name: 'Running Split Calculator', desc: 'Generate split times for races of any distance based on your target finish time.', cat: 'Sports', sub: 'Running', icon: 'Timer' },
  { slug: 'race-time-predictor', name: 'Race Time Predictor', desc: 'Predict finish times for different race distances based on a recent race performance.', cat: 'Sports', sub: 'Running', icon: 'Trophy' },
  { slug: 'age-graded-running-calculator', name: 'Age-Graded Running Calculator', desc: 'Compare your race times across different ages and genders using WMA standards.', cat: 'Sports', sub: 'Running', icon: 'Activity' },
  { slug: 'treadmill-pace-converter', name: 'Treadmill Pace Converter', desc: 'Convert treadmill speed (mph or km/h) to running pace per mile or kilometer.', cat: 'Sports', sub: 'Running', icon: 'Settings' },
  { slug: 'treadmill-incline-calculator', name: 'Treadmill Incline Equivalent Calculator', desc: 'Calculate the equivalent outdoor pace for different treadmill incline settings.', cat: 'Sports', sub: 'Running', icon: 'TrendingUp' },
  { slug: 'run-walk-pace-calculator', name: 'Run/Walk Pace Calculator', desc: 'Calculate overall average pace when using a run-walk-run strategy (Galloway method).', cat: 'Sports', sub: 'Running', icon: 'Timer' },
  { slug: 'yasso-800s-calculator', name: 'Yasso 800s Calculator', desc: 'Determine your target times for Yasso 800m repeats based on your marathon goal.', cat: 'Sports', sub: 'Running', icon: 'Timer' },
  { slug: 'vdot-calculator', name: 'VDOT Running Calculator', desc: 'Calculate your Jack Daniels VDOT value and equivalent training paces.', cat: 'Sports', sub: 'Running', icon: 'Activity' },

  // Sports - Cycling
  { slug: 'cycling-power-zones-calculator', name: 'Cycling Power Zones Calculator', desc: 'Determine your cycling power training zones based on your Functional Threshold Power (FTP).', cat: 'Sports', sub: 'Cycling', icon: 'Zap' },
  { slug: 'cycling-heart-rate-zones-calculator', name: 'Cycling Heart Rate Zones Calculator', desc: 'Calculate heart rate zones specific to cycling training (e.g., Friel or Coggan zones).', cat: 'Sports', sub: 'Cycling', icon: 'Heart' },
  { slug: 'bike-gear-calculator', name: 'Bike Gear Ratio Calculator', desc: 'Calculate gear ratios, gear inches, and development for different chainring and cassette combinations.', cat: 'Sports', sub: 'Cycling', icon: 'Settings' },
  { slug: 'pedal-speed-calculator', name: 'Pedal Speed (Cadence) Calculator', desc: 'Calculate bicycle speed based on cadence, gear ratio, and wheel size.', cat: 'Sports', sub: 'Cycling', icon: 'Gauge' },
  { slug: 'bike-size-calculator', name: 'Bike Size Calculator', desc: 'Estimate the ideal frame size for road, mountain, or hybrid bikes based on your height and inseam.', cat: 'Sports', sub: 'Cycling', icon: 'Ruler' },
  { slug: 'cycling-wattage-calculator', name: 'Cycling Wattage Calculator', desc: 'Estimate power output (watts) required to maintain a specific speed on a given gradient.', cat: 'Sports', sub: 'Cycling', icon: 'Zap' },
  { slug: 'tss-calculator', name: 'Training Stress Score (TSS) Calculator', desc: 'Calculate the TSS for a cycling workout based on intensity and duration.', cat: 'Sports', sub: 'Cycling', icon: 'Activity' },

  // Sports - Swimming
  { slug: 'swimming-pace-calculator', name: 'Swimming Pace Calculator', desc: 'Calculate swimming pace per 100m or 100y based on time and distance.', cat: 'Sports', sub: 'Swimming', icon: 'Droplets' },
  { slug: 'swimming-split-calculator', name: 'Swimming Split Calculator', desc: 'Generate target split times for swimming events.', cat: 'Sports', sub: 'Swimming', icon: 'Timer' },
  { slug: 'css-swimming-calculator', name: 'Critical Swim Speed (CSS) Calculator', desc: 'Calculate your CSS pace to determine aerobic swimming thresholds.', cat: 'Sports', sub: 'Swimming', icon: 'Droplets' },
  { slug: 'swimming-time-conversion', name: 'Swimming Time Conversion', desc: 'Convert swim times between short course yards, short course meters, and long course meters.', cat: 'Sports', sub: 'Swimming', icon: 'RefreshCw' },
  { slug: 'swolf-calculator', name: 'SWOLF Score Calculator', desc: 'Calculate your SWOLF score to measure swimming efficiency (strokes + time).', cat: 'Sports', sub: 'Swimming', icon: 'Activity' },

  // Sports - Weightlifting
  { slug: 'one-rep-max-calculator', name: 'One-Rep Max (1RM) Calculator', desc: 'Estimate your one-rep max for any lift using standard formulas (Epley, Brzycki, etc.).', cat: 'Sports', sub: 'Weightlifting', icon: 'Dumbbell' },
  { slug: 'wilks-score-calculator', name: 'Wilks Score Calculator', desc: 'Calculate your Wilks score to compare powerlifting strength across different body weights.', cat: 'Sports', sub: 'Weightlifting', icon: 'Trophy' },
  { slug: 'dots-score-calculator', name: 'DOTS Score Calculator', desc: 'Calculate your DOTS score, the modern standard for comparing powerlifters.', cat: 'Sports', sub: 'Weightlifting', icon: 'Trophy' },
  { slug: 'sinclair-coefficient-calculator', name: 'Sinclair Coefficient Calculator', desc: 'Calculate your Sinclair total for Olympic weightlifting comparisons.', cat: 'Sports', sub: 'Weightlifting', icon: 'Trophy' },
  { slug: 'barbell-plate-calculator', name: 'Barbell Plate Calculator', desc: 'Determine the exact plates needed on each side of the bar for a target weight.', cat: 'Sports', sub: 'Weightlifting', icon: 'Circle' },
  { slug: 'weightlifting-percentage-calculator', name: 'Weightlifting Percentage Calculator', desc: 'Quickly calculate training percentages (e.g., 75%, 85%) of your 1RM.', cat: 'Sports', sub: 'Weightlifting', icon: 'Percent' },
  { slug: 'symmetric-strength-calculator', name: 'Symmetric Strength Calculator', desc: 'Evaluate your strength balance across different muscle groups.', cat: 'Sports', sub: 'Weightlifting', icon: 'Activity' },
  
  // Sports - Various
  { slug: 'triathlon-time-calculator', name: 'Triathlon Time Predictor', desc: 'Estimate your total triathlon finish time based on individual leg paces and transition times.', cat: 'Sports', sub: 'Triathlon', icon: 'Timer' },
  { slug: 'golf-handicap-calculator', name: 'Golf Handicap Calculator', desc: 'Estimate your golf handicap index based on recent scores, course rating, and slope.', cat: 'Sports', sub: 'Golf', icon: 'Flag' },
  { slug: 'bowling-handicap-calculator', name: 'Bowling Handicap Calculator', desc: 'Calculate your bowling league handicap based on your average and league basis.', cat: 'Sports', sub: 'Bowling', icon: 'Target' },
  { slug: 'baseball-era-calculator', name: 'Baseball ERA Calculator', desc: 'Calculate a pitcher\'s Earned Run Average (ERA).', cat: 'Sports', sub: 'Baseball', icon: 'Activity' },
  { slug: 'baseball-batting-average-calculator', name: 'Batting Average Calculator', desc: 'Calculate a baseball player\'s batting average.', cat: 'Sports', sub: 'Baseball', icon: 'Activity' },
  { slug: 'basketball-per-calculator', name: 'Basketball PER Calculator', desc: 'Estimate Player Efficiency Rating for basketball players.', cat: 'Sports', sub: 'Basketball', icon: 'Activity' },
  { slug: 'basketball-shooting-percentage-calculator', name: 'Shooting Percentage Calculator', desc: 'Calculate field goal, 3-point, and true shooting percentages.', cat: 'Sports', sub: 'Basketball', icon: 'Target' },
  { slug: 'qb-rating-calculator', name: 'Quarterback Rating Calculator', desc: 'Calculate NFL and NCAA passer ratings based on passing statistics.', cat: 'Sports', sub: 'Football', icon: 'Activity' },
  { slug: 'tennis-serve-speed-calculator', name: 'Tennis Serve Speed Calculator', desc: 'Estimate tennis serve speed based on flight time and distance.', cat: 'Sports', sub: 'Tennis', icon: 'Zap' },
  { slug: 'billiards-handicap-calculator', name: 'Billiards Handicap Calculator', desc: 'Determine player handicaps for pool leagues (e.g., APA formats).', cat: 'Sports', sub: 'Billiards', icon: 'Target' },

  // Ecology
  { slug: 'carbon-footprint-calculator', name: 'Carbon Footprint Calculator', desc: 'Estimate your personal or household annual carbon dioxide emissions.', cat: 'Ecology', sub: 'Footprint', icon: 'Leaf' },
  { slug: 'flight-emissions-calculator', name: 'Flight Emissions Calculator', desc: 'Calculate the carbon footprint of a specific flight route.', cat: 'Ecology', sub: 'Footprint', icon: 'Plane' },
  { slug: 'vehicle-emissions-calculator', name: 'Vehicle Emissions Calculator', desc: 'Estimate CO2 emissions based on your car\'s fuel efficiency and miles driven.', cat: 'Ecology', sub: 'Footprint', icon: 'Car' },
  { slug: 'home-energy-emissions-calculator', name: 'Home Energy Emissions Calculator', desc: 'Calculate greenhouse gas emissions from household electricity and gas usage.', cat: 'Ecology', sub: 'Footprint', icon: 'Home' },
  { slug: 'food-carbon-footprint-calculator', name: 'Food Carbon Footprint Calculator', desc: 'Estimate the emissions impact of different diets (e.g., vegan vs. meat-heavy).', cat: 'Ecology', sub: 'Footprint', icon: 'Apple' },
  { slug: 'tree-planting-offset-calculator', name: 'Tree Planting Offset Calculator', desc: 'Calculate how many trees you need to plant to offset your carbon emissions.', cat: 'Ecology', sub: 'Offset', icon: 'Trees' },
  { slug: 'water-footprint-calculator', name: 'Water Footprint Calculator', desc: 'Estimate your direct and indirect water consumption.', cat: 'Ecology', sub: 'Footprint', icon: 'Droplets' },
  { slug: 'plastic-footprint-calculator', name: 'Plastic Footprint Calculator', desc: 'Calculate your annual consumption of single-use plastics.', cat: 'Ecology', sub: 'Footprint', icon: 'Package' },
  { slug: 'solar-energy-savings-calculator', name: 'Solar Energy Savings Calculator', desc: 'Estimate financial savings and CO2 reduction from installing solar panels.', cat: 'Ecology', sub: 'Energy', icon: 'Zap' },
  { slug: 'wind-turbine-energy-calculator', name: 'Wind Turbine Energy Calculator', desc: 'Calculate potential energy generation from a residential wind turbine.', cat: 'Ecology', sub: 'Energy', icon: 'Wind' },
  { slug: 'compost-ratio-calculator', name: 'Compost C:N Ratio Calculator', desc: 'Calculate the optimal carbon-to-nitrogen ratio for your compost pile.', cat: 'Ecology', sub: 'Gardening', icon: 'Leaf' },
  { slug: 'rain-barrel-calculator', name: 'Rain Barrel Sizing Calculator', desc: 'Determine the required rain barrel capacity based on roof area and rainfall.', cat: 'Ecology', sub: 'Conservation', icon: 'Droplets' },
  { slug: 'energy-efficient-appliance-calculator', name: 'Energy Efficiency ROI Calculator', desc: 'Calculate the payback period for upgrading to energy-efficient appliances.', cat: 'Ecology', sub: 'Energy', icon: 'Zap' },
  { slug: 'led-savings-calculator', name: 'LED Lighting Savings Calculator', desc: 'Calculate energy and cost savings from switching to LED bulbs.', cat: 'Ecology', sub: 'Energy', icon: 'Zap' },
  { slug: 'biodiversity-index-calculator', name: 'Biodiversity Index Calculator', desc: 'Calculate Simpson\'s or Shannon\'s Diversity Index for a given habitat area.', cat: 'Ecology', sub: 'Analysis', icon: 'Trees' },
  { slug: 'population-growth-ecology-calculator', name: 'Population Growth Rate Calculator', desc: 'Model exponential or logistic population growth in an ecosystem.', cat: 'Ecology', sub: 'Analysis', icon: 'TrendingUp' },
  { slug: 'ecological-footprint-calculator', name: 'Ecological Footprint Calculator', desc: 'Estimate how many "Earths" are needed to support your lifestyle.', cat: 'Ecology', sub: 'Footprint', icon: 'Globe' },
  { slug: 'waste-diversion-calculator', name: 'Waste Diversion Rate Calculator', desc: 'Calculate the percentage of waste diverted from landfills via recycling and composting.', cat: 'Ecology', sub: 'Conservation', icon: 'RefreshCw' },
  { slug: 'paper-savings-calculator', name: 'Paper Savings Calculator', desc: 'Calculate the environmental impact (trees, water, energy saved) by going paperless.', cat: 'Ecology', sub: 'Conservation', icon: 'FileText' },
  { slug: 'meatless-monday-impact-calculator', name: 'Meatless Diet Impact Calculator', desc: 'Estimate the environmental benefits of skipping meat for a specific number of days.', cat: 'Ecology', sub: 'Footprint', icon: 'Leaf' }
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 🏅 SPORTS & 🌿 ECOLOGY\n  // ══════════════════════════════════════════════\n';
toAdd.forEach(e => {
  str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "${e.cat}", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Sports/Ecology calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
