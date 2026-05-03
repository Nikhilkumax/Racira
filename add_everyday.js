const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Time & Dates
  { slug: 'time-difference-calculator', name: 'Time Difference Calculator', desc: 'Calculate the exact difference between two times in hours, minutes, and seconds.', sub: 'Time & Dates', icon: 'Clock' },
  { slug: 'work-hours-calculator', name: 'Work Hours Calculator', desc: 'Calculate total work hours from clock-in and clock-out times including breaks.', sub: 'Time & Dates', icon: 'Timer' },
  { slug: 'overtime-hours-calculator', name: 'Overtime Hours Calculator', desc: 'Calculate regular and overtime hours worked and total pay for the week.', sub: 'Time & Dates', icon: 'Clock' },
  { slug: 'date-difference-calculator', name: 'Date Difference Calculator', desc: 'Calculate the number of days, weeks, and months between two dates.', sub: 'Time & Dates', icon: 'Calendar' },
  { slug: 'weeks-calculator', name: 'Weeks Between Dates Calculator', desc: 'Calculate the exact number of weeks between any two calendar dates.', sub: 'Time & Dates', icon: 'Calendar' },
  { slug: 'months-calculator', name: 'Months Between Dates Calculator', desc: 'Calculate the number of complete months between two dates.', sub: 'Time & Dates', icon: 'Calendar' },
  { slug: 'leap-year-calculator', name: 'Leap Year Calculator', desc: 'Check if a year is a leap year and find the next or previous leap year.', sub: 'Time & Dates', icon: 'Calendar' },
  { slug: 'countdown-calculator', name: 'Countdown Calculator', desc: 'Calculate days, hours, and minutes remaining until any future date or event.', sub: 'Time & Dates', icon: 'Timer' },
  { slug: 'meeting-time-zone-calculator', name: 'Meeting Time Zone Calculator', desc: 'Find the best meeting time across multiple time zones worldwide.', sub: 'Time & Dates', icon: 'Globe' },
  // Food & Kitchen
  { slug: 'recipe-scale-calculator', name: 'Recipe Scale Calculator', desc: 'Scale any recipe up or down for any number of servings.', sub: 'Food & Kitchen', icon: 'Sparkles' },
  { slug: 'cooking-time-calculator', name: 'Cooking Time Calculator', desc: 'Calculate precise cooking times for meats, poultry, and vegetables.', sub: 'Food & Kitchen', icon: 'Clock' },
  { slug: 'baking-conversion-calculator', name: 'Baking Conversion Calculator', desc: 'Convert baking ingredients between cups, grams, ounces, and milliliters.', sub: 'Food & Kitchen', icon: 'Calculator' },
  { slug: 'food-cost-calculator', name: 'Food Cost Calculator', desc: 'Calculate the cost per serving and food cost percentage for recipes.', sub: 'Food & Kitchen', icon: 'DollarSign' },
  { slug: 'alcohol-unit-calculator', name: 'Alcohol Unit Calculator', desc: 'Calculate alcohol units in drinks and track weekly intake against safe limits.', sub: 'Food & Kitchen', icon: 'Wine' },
  { slug: 'coffee-strength-calculator', name: 'Coffee Strength Calculator', desc: 'Calculate the ideal coffee-to-water ratio for your preferred brewing strength.', sub: 'Food & Kitchen', icon: 'Coffee' },
  { slug: 'cake-serving-calculator', name: 'Cake Serving Calculator', desc: 'Calculate how many servings a cake yields based on its size and cut style.', sub: 'Food & Kitchen', icon: 'Dice1' },
  { slug: 'catering-quantity-calculator', name: 'Catering Quantity Calculator', desc: 'Estimate food quantities needed for events based on guest count and meal type.', sub: 'Food & Kitchen', icon: 'Users' },
  { slug: 'cooking-temperature-converter', name: 'Cooking Temperature Converter', desc: 'Convert oven temperatures between Fahrenheit, Celsius, and Gas Mark.', sub: 'Food & Kitchen', icon: 'Thermometer' },
  // Home & Garden
  { slug: 'wallpaper-calculator', name: 'Wallpaper Calculator', desc: 'Calculate how many rolls of wallpaper you need for any room.', sub: 'Home & Garden', icon: 'Home' },
  { slug: 'pool-volume-calculator', name: 'Pool Volume Calculator', desc: 'Calculate water volume of rectangular, circular, and oval pools.', sub: 'Home & Garden', icon: 'Droplets' },
  { slug: 'aquarium-volume-calculator', name: 'Aquarium Volume Calculator', desc: 'Calculate the water volume and weight of rectangular or cylindrical fish tanks.', sub: 'Home & Garden', icon: 'Droplets' },
  { slug: 'solar-panel-calculator', name: 'Solar Panel Calculator', desc: 'Estimate solar panel output and savings based on roof size and location.', sub: 'Home & Garden', icon: 'Sparkles' },
  { slug: 'rainwater-collection-calculator', name: 'Rainwater Collection Calculator', desc: 'Calculate how much rainwater you can collect from your roof annually.', sub: 'Home & Garden', icon: 'Droplets' },
  { slug: 'electricity-bill-calculator', name: 'Electricity Bill Calculator', desc: 'Estimate monthly electricity costs from appliance usage and rate per kWh.', sub: 'Home & Garden', icon: 'Zap' },
  { slug: 'water-bill-calculator', name: 'Water Bill Calculator', desc: 'Estimate your monthly water bill from usage and local rate per gallon.', sub: 'Home & Garden', icon: 'Droplets' },
  { slug: 'lawn-seeding-calculator', name: 'Lawn Seeding Calculator', desc: 'Calculate the amount of grass seed needed to overseed or establish a lawn.', sub: 'Home & Garden', icon: 'Leaf' },
  { slug: 'garden-fertilizer-calculator', name: 'Garden Fertilizer Calculator', desc: 'Calculate the exact amount of fertilizer needed for any garden size and soil type.', sub: 'Home & Garden', icon: 'Leaf' },
  { slug: 'home-heating-cost-calculator', name: 'Home Heating Cost Calculator', desc: 'Estimate annual heating costs based on home size, insulation, and fuel type.', sub: 'Home & Garden', icon: 'Thermometer' },
  { slug: 'home-cooling-cost-calculator', name: 'Home Cooling Cost Calculator', desc: 'Estimate air conditioning electricity costs based on BTU and usage hours.', sub: 'Home & Garden', icon: 'Thermometer' },
  { slug: 'plywood-calculator', name: 'Plywood Sheets Calculator', desc: 'Calculate the number of plywood sheets needed to cover a given area.', sub: 'Home & Garden', icon: 'Layers' },
  // Shopping & Lifestyle
  { slug: 'sales-price-calculator', name: 'Sale Price Calculator', desc: 'Calculate the final sale price after applying a percentage discount.', sub: 'Shopping & Lifestyle', icon: 'ShoppingBag' },
  { slug: 'shopping-budget-calculator', name: 'Shopping Budget Calculator', desc: 'Plan and track a shopping budget across categories to avoid overspending.', sub: 'Shopping & Lifestyle', icon: 'ShoppingBag' },
  { slug: 'clothing-size-converter', name: 'Clothing Size Converter', desc: 'Convert clothing sizes between US, UK, EU, and Asian size charts.', sub: 'Shopping & Lifestyle', icon: 'Ruler' },
  { slug: 'ring-size-calculator', name: 'Ring Size Calculator', desc: 'Find your ring size in US, UK, EU, and Asian sizing systems.', sub: 'Shopping & Lifestyle', icon: 'Circle' },
  { slug: 'gift-cost-per-person-calculator', name: 'Gift Cost Per Person Calculator', desc: 'Divide a group gift cost fairly among any number of contributors.', sub: 'Shopping & Lifestyle', icon: 'Gift' },
  { slug: 'loyalty-points-calculator', name: 'Loyalty Points Calculator', desc: 'Calculate the cash value of loyalty reward points and miles.', sub: 'Shopping & Lifestyle', icon: 'Award' },
  { slug: 'moving-cost-estimator', name: 'Moving Cost Estimator', desc: 'Estimate total moving costs including truck, movers, and packing supplies.', sub: 'Shopping & Lifestyle', icon: 'Package' },
  { slug: 'pet-food-calculator', name: 'Pet Food Calculator', desc: 'Calculate daily pet food portions based on your pet weight and food type.', sub: 'Shopping & Lifestyle', icon: 'Heart' },
  { slug: 'dog-age-calculator', name: 'Dog Age Calculator', desc: 'Convert your dog age to human years based on breed size.', sub: 'Shopping & Lifestyle', icon: 'Heart' },
  { slug: 'cat-age-calculator', name: 'Cat Age Calculator', desc: 'Convert your cat age to the equivalent human years.', sub: 'Shopping & Lifestyle', icon: 'Heart' },
  { slug: 'candle-burn-time-calculator', name: 'Candle Burn Time Calculator', desc: 'Calculate how long a candle will burn based on wax weight and wick size.', sub: 'Shopping & Lifestyle', icon: 'Sparkles' },
  { slug: 'reading-time-calculator', name: 'Reading Time Calculator', desc: 'Estimate how long it will take to read any book or article at your reading speed.', sub: 'Shopping & Lifestyle', icon: 'BookOpen' },
  // Travel
  { slug: 'flight-time-calculator', name: 'Flight Time Calculator', desc: 'Estimate flight duration between two airports based on distance and speed.', sub: 'Travel', icon: 'Plane' },
  { slug: 'hotel-cost-calculator', name: 'Hotel Cost Calculator', desc: 'Calculate total hotel stay cost including taxes, fees, and room rate.', sub: 'Travel', icon: 'Globe' },
  { slug: 'packing-weight-calculator', name: 'Packing Weight Calculator', desc: 'Track luggage weight and check against airline baggage limits.', sub: 'Travel', icon: 'Package' },
  { slug: 'travel-budget-calculator', name: 'Travel Budget Calculator', desc: 'Plan a complete travel budget including flights, hotels, food, and activities.', sub: 'Travel', icon: 'Globe' },
  { slug: 'road-trip-cost-calculator', name: 'Road Trip Cost Calculator', desc: 'Estimate total road trip costs including fuel, tolls, and accommodation.', sub: 'Travel', icon: 'Car' },
  { slug: 'daylight-saving-calculator', name: 'Daylight Saving Time Calculator', desc: 'Find out when clocks change for any location and the next DST date.', sub: 'Travel', icon: 'Clock' },
  { slug: 'visa-fee-calculator', name: 'Visa Fee Calculator', desc: 'Look up visa application fees and processing times for common destinations.', sub: 'Travel', icon: 'Globe' },
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 🌞 EVERYDAY LIFE — NEW ADDITIONS\n  // ══════════════════════════════════════════════\n';
const groups = {};
toAdd.forEach(e => { if (!groups[e.sub]) groups[e.sub] = []; groups[e.sub].push(e); });
Object.entries(groups).forEach(([sub, entries]) => {
  str += `\n  // ${sub}\n`;
  entries.forEach(e => {
    str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "Everyday Life", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
  });
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Everyday Life calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
