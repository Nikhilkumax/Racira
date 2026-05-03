const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Conversion - Length & Area
  { slug: 'length-converter', name: 'Length Converter', desc: 'Convert between metric and imperial length units (meters, feet, inches, miles).', cat: 'Conversion', sub: 'Measurement', icon: 'Ruler' },
  { slug: 'area-converter', name: 'Area Converter', desc: 'Convert between square meters, square feet, acres, and hectares.', cat: 'Conversion', sub: 'Measurement', icon: 'Triangle' },
  { slug: 'volume-converter', name: 'Volume Converter', desc: 'Convert between liters, gallons, cubic meters, and cubic feet.', cat: 'Conversion', sub: 'Measurement', icon: 'Beaker' },
  { slug: 'weight-converter', name: 'Weight & Mass Converter', desc: 'Convert between kilograms, pounds, ounces, and grams.', cat: 'Conversion', sub: 'Measurement', icon: 'Activity' },
  { slug: 'temperature-converter', name: 'Temperature Converter', desc: 'Convert temperatures between Celsius, Fahrenheit, and Kelvin.', cat: 'Conversion', sub: 'Measurement', icon: 'Thermometer' },
  { slug: 'speed-converter', name: 'Speed Converter', desc: 'Convert speed between mph, km/h, m/s, and knots.', cat: 'Conversion', sub: 'Measurement', icon: 'Gauge' },
  { slug: 'time-converter', name: 'Time Unit Converter', desc: 'Convert between seconds, minutes, hours, days, weeks, and years.', cat: 'Conversion', sub: 'Measurement', icon: 'Clock' },
  { slug: 'pressure-converter', name: 'Pressure Converter', desc: 'Convert between psi, bar, pascals, and atmospheres.', cat: 'Conversion', sub: 'Measurement', icon: 'Gauge' },
  { slug: 'energy-converter', name: 'Energy Converter', desc: 'Convert between joules, calories, BTUs, and kilowatt-hours.', cat: 'Conversion', sub: 'Measurement', icon: 'Zap' },
  { slug: 'power-converter', name: 'Power Converter', desc: 'Convert between watts, kilowatts, horsepower, and BTUs per hour.', cat: 'Conversion', sub: 'Measurement', icon: 'Zap' },
  { slug: 'force-converter', name: 'Force Converter', desc: 'Convert between newtons, pounds-force, and kilogram-force.', cat: 'Conversion', sub: 'Measurement', icon: 'Activity' },
  { slug: 'density-converter', name: 'Density Converter', desc: 'Convert between kg/m³, g/cm³, and lb/ft³.', cat: 'Conversion', sub: 'Measurement', icon: 'Droplets' },
  { slug: 'torque-converter', name: 'Torque Converter', desc: 'Convert between Newton-meters, foot-pounds, and inch-pounds.', cat: 'Conversion', sub: 'Measurement', icon: 'Settings' },
  { slug: 'flow-rate-converter', name: 'Flow Rate Converter', desc: 'Convert between gallons per minute, liters per second, and cubic meters per hour.', cat: 'Conversion', sub: 'Measurement', icon: 'Droplets' },
  { slug: 'angle-converter-advanced', name: 'Advanced Angle Converter', desc: 'Convert between degrees, radians, minutes, and seconds.', cat: 'Conversion', sub: 'Measurement', icon: 'Circle' },
  { slug: 'frequency-converter', name: 'Frequency Converter', desc: 'Convert between hertz, kilohertz, megahertz, and rpm.', cat: 'Conversion', sub: 'Measurement', icon: 'Zap' },
  { slug: 'data-size-converter', name: 'Data Size Converter', desc: 'Convert between bytes, kilobytes, megabytes, gigabytes, and terabytes.', cat: 'Conversion', sub: 'Data', icon: 'HardDrive' },
  { slug: 'data-transfer-converter', name: 'Data Transfer Rate Converter', desc: 'Convert between kbps, Mbps, Gbps, MB/s, and GB/s.', cat: 'Conversion', sub: 'Data', icon: 'Wifi' },
  { slug: 'fuel-economy-converter', name: 'Fuel Economy Converter', desc: 'Convert between MPG (US/UK) and Liters per 100km (L/100km).', cat: 'Conversion', sub: 'Measurement', icon: 'Fuel' },
  { slug: 'roman-numeral-converter', name: 'Roman Numeral Converter', desc: 'Convert Arabic numerals to Roman numerals and vice versa.', cat: 'Conversion', sub: 'Numbers', icon: 'Hash' },
  { slug: 'fraction-to-decimal-converter', name: 'Fraction to Decimal Converter', desc: 'Convert fractions to decimals and percentages.', cat: 'Conversion', sub: 'Numbers', icon: 'Percent' },
  { slug: 'decimal-to-fraction-converter', name: 'Decimal to Fraction Converter', desc: 'Convert decimal numbers to simplified fractions.', cat: 'Conversion', sub: 'Numbers', icon: 'Hash' },
  { slug: 'scientific-notation-converter', name: 'Scientific Notation Converter', desc: 'Convert standard numbers to scientific e-notation and back.', cat: 'Conversion', sub: 'Numbers', icon: 'Sigma' },
  { slug: 'hex-to-decimal-converter', name: 'Hex to Decimal Converter', desc: 'Convert hexadecimal strings to decimal numbers.', cat: 'Conversion', sub: 'Numbers', icon: 'Binary' },
  { slug: 'decimal-to-hex-converter', name: 'Decimal to Hex Converter', desc: 'Convert decimal integers to hexadecimal strings.', cat: 'Conversion', sub: 'Numbers', icon: 'Binary' },
  { slug: 'binary-text-converter', name: 'Binary to Text Converter', desc: 'Convert binary code to ASCII text strings.', cat: 'Conversion', sub: 'Text', icon: 'Binary' },
  { slug: 'text-binary-converter', name: 'Text to Binary Converter', desc: 'Convert ASCII text strings into binary code.', cat: 'Conversion', sub: 'Text', icon: 'Binary' },
  { slug: 'morse-code-translator', name: 'Morse Code Translator', desc: 'Translate text to Morse code and Morse code to text.', cat: 'Conversion', sub: 'Text', icon: 'MessageSquare' },
  { slug: 'base64-encoder', name: 'Base64 Encoder', desc: 'Encode plain text into Base64 format.', cat: 'Conversion', sub: 'Text', icon: 'FileText' },
  { slug: 'base64-decoder', name: 'Base64 Decoder', desc: 'Decode Base64 format back into plain text.', cat: 'Conversion', sub: 'Text', icon: 'FileText' },
  { slug: 'url-encoder', name: 'URL Encoder', desc: 'Encode special characters in a string for safe URL transmission.', cat: 'Conversion', sub: 'Text', icon: 'Link' },
  { slug: 'url-decoder', name: 'URL Decoder', desc: 'Decode a URL-encoded string back into standard text.', cat: 'Conversion', sub: 'Text', icon: 'Link' },
  { slug: 'currency-converter', name: 'Currency Converter', desc: 'Convert between global currencies using live exchange rates.', cat: 'Conversion', sub: 'Finance', icon: 'Globe' },
  { slug: 'crypto-currency-converter', name: 'Crypto Converter', desc: 'Convert fiat currencies into cryptocurrencies like Bitcoin and Ethereum.', cat: 'Conversion', sub: 'Finance', icon: 'Bitcoin' },
  { slug: 'epoch-time-converter', name: 'Unix Epoch Time Converter', desc: 'Convert Unix timestamp to human-readable date and time.', cat: 'Conversion', sub: 'Time', icon: 'Clock' },
  { slug: 'timezone-converter', name: 'Time Zone Converter', desc: 'Convert time between different global time zones.', cat: 'Conversion', sub: 'Time', icon: 'Globe' },
  { slug: 'shoe-size-converter', name: 'Shoe Size Converter', desc: 'Convert shoe sizes between US, UK, EU, and Asian scales.', cat: 'Conversion', sub: 'Apparel', icon: 'Activity' },
  { slug: 'bra-size-converter', name: 'Bra Size Converter', desc: 'Convert bra sizes between international sizing systems.', cat: 'Conversion', sub: 'Apparel', icon: 'Activity' },
  { slug: 'ring-size-converter-advanced', name: 'Ring Size Converter', desc: 'Convert ring sizes between US, UK, EU, and Japanese standards.', cat: 'Conversion', sub: 'Apparel', icon: 'Circle' },
  { slug: 'clothing-size-converter-advanced', name: 'Clothing Size Converter', desc: 'Convert men\'s, women\'s, and children\'s clothing sizes internationally.', cat: 'Conversion', sub: 'Apparel', icon: 'Activity' },
  { slug: 'cooking-measurement-converter', name: 'Cooking Measurement Converter', desc: 'Convert between cups, tablespoons, teaspoons, fluid ounces, and milliliters.', cat: 'Conversion', sub: 'Cooking', icon: 'Beaker' },
  { slug: 'oven-temperature-converter', name: 'Oven Temperature Converter', desc: 'Convert baking temperatures between Fahrenheit, Celsius, and Gas Mark.', cat: 'Conversion', sub: 'Cooking', icon: 'Thermometer' },
  { slug: 'baking-ingredient-converter', name: 'Baking Ingredient Weight Converter', desc: 'Convert volume (cups) to weight (grams) for common baking ingredients.', cat: 'Conversion', sub: 'Cooking', icon: 'Package' },
  { slug: 'yarn-weight-converter', name: 'Yarn Weight Converter', desc: 'Convert yarn weights and terms across different global standards.', cat: 'Conversion', sub: 'Crafts', icon: 'Scissors' },
  { slug: 'knitting-needle-converter', name: 'Knitting Needle Size Converter', desc: 'Convert knitting needle sizes between US, UK, and Metric (mm).', cat: 'Conversion', sub: 'Crafts', icon: 'Scissors' },
  { slug: 'crochet-hook-converter', name: 'Crochet Hook Size Converter', desc: 'Convert crochet hook sizes between US, UK, and Metric (mm).', cat: 'Conversion', sub: 'Crafts', icon: 'Scissors' },
  { slug: 'luminance-converter', name: 'Luminance Converter', desc: 'Convert between candelas per square meter (nits), foot-lamberts, and apostilbs.', cat: 'Conversion', sub: 'Measurement', icon: 'Sun' },
  { slug: 'illuminance-converter', name: 'Illuminance Converter', desc: 'Convert between lux and foot-candles.', cat: 'Conversion', sub: 'Measurement', icon: 'Sun' },
  { slug: 'radioactivity-converter', name: 'Radioactivity Converter', desc: 'Convert between becquerels and curies.', cat: 'Conversion', sub: 'Measurement', icon: 'Atom' },
  { slug: 'radiation-dose-converter', name: 'Radiation Dose Converter', desc: 'Convert between sieverts and rems.', cat: 'Conversion', sub: 'Measurement', icon: 'Atom' },
  { slug: 'viscosity-kinematic-converter', name: 'Kinematic Viscosity Converter', desc: 'Convert between centistokes, square meters per second, and square feet per second.', cat: 'Conversion', sub: 'Measurement', icon: 'Droplets' },
  { slug: 'viscosity-dynamic-converter', name: 'Dynamic Viscosity Converter', desc: 'Convert between centipoise, pascal-seconds, and pound-force seconds per square foot.', cat: 'Conversion', sub: 'Measurement', icon: 'Droplets' },

  // Let's add more to other categories to hit 980.
  // We need roughly 270 - 52 = 218 more. Let's do batches.
  // Add 100 Math/Science/Finance niche tools.
  // Finance
  { slug: 'dividend-yield-calculator', name: 'Dividend Yield Calculator', desc: 'Calculate the annual dividend yield of a stock based on its current price.', cat: 'Finance', sub: 'Investment', icon: 'TrendingUp' },
  { slug: 'earnings-per-share-calculator', name: 'Earnings Per Share (EPS) Calculator', desc: 'Calculate a company\'s profit divided by outstanding shares.', cat: 'Finance', sub: 'Investment', icon: 'BarChart3' },
  { slug: 'price-to-book-calculator', name: 'Price-to-Book (P/B) Ratio Calculator', desc: 'Compare a firm\'s market capitalization to its book value.', cat: 'Finance', sub: 'Investment', icon: 'BarChart3' },
  { slug: 'price-to-sales-calculator', name: 'Price-to-Sales (P/S) Ratio Calculator', desc: 'Evaluate a company\'s stock price against its revenues.', cat: 'Finance', sub: 'Investment', icon: 'BarChart3' },
  { slug: 'free-cash-flow-calculator', name: 'Free Cash Flow Calculator', desc: 'Calculate the cash a company generates after accounting for capital expenditures.', cat: 'Finance', sub: 'Business Finance', icon: 'DollarSign' },
  { slug: 'wacc-calculator', name: 'WACC Calculator', desc: 'Calculate the Weighted Average Cost of Capital for a firm.', cat: 'Finance', sub: 'Business Finance', icon: 'Percent' },
  { slug: 'current-ratio-calculator', name: 'Current Ratio Calculator', desc: 'Measure a company\'s ability to pay short-term obligations.', cat: 'Finance', sub: 'Business Finance', icon: 'PieChart' },
  { slug: 'quick-ratio-calculator', name: 'Quick Ratio Calculator', desc: 'Measure a company\'s capacity to pay current liabilities without relying on inventory sales.', cat: 'Finance', sub: 'Business Finance', icon: 'PieChart' },
  { slug: 'debt-to-equity-calculator', name: 'Debt-to-Equity Ratio Calculator', desc: 'Evaluate a company\'s financial leverage.', cat: 'Finance', sub: 'Business Finance', icon: 'PieChart' },
  { slug: 'gross-margin-calculator', name: 'Gross Margin Calculator', desc: 'Calculate the financial health of a company by revealing the proportion of money left over from revenues after accounting for COGS.', cat: 'Finance', sub: 'Business Finance', icon: 'Percent' },
  { slug: 'operating-margin-calculator', name: 'Operating Margin Calculator', desc: 'Measure what proportion of a company\'s revenue is left over after paying for variable costs of production.', cat: 'Finance', sub: 'Business Finance', icon: 'Percent' },
  { slug: 'net-profit-margin-calculator', name: 'Net Profit Margin Calculator', desc: 'Calculate the percentage of revenue remaining after all operating expenses, interest, taxes and preferred stock dividends.', cat: 'Finance', sub: 'Business Finance', icon: 'Percent' },
  { slug: 'inventory-days-calculator', name: 'Days in Inventory Calculator', desc: 'Measure the number of days a company takes to sell its inventory.', cat: 'Finance', sub: 'Business Finance', icon: 'Calendar' },
  { slug: 'receivable-days-calculator', name: 'Days Sales Outstanding Calculator', desc: 'Estimate the average collection period for receivables.', cat: 'Finance', sub: 'Business Finance', icon: 'Calendar' },
  { slug: 'payable-days-calculator', name: 'Days Payable Outstanding Calculator', desc: 'Estimate the average time a company takes to pay its trade creditors.', cat: 'Finance', sub: 'Business Finance', icon: 'Calendar' },
  { slug: 'cash-conversion-cycle-calculator', name: 'Cash Conversion Cycle Calculator', desc: 'Calculate how long it takes a company to convert its investments in inventory to cash flows.', cat: 'Finance', sub: 'Business Finance', icon: 'RefreshCw' },
  { slug: 'dupont-analysis-calculator', name: 'DuPont Analysis Calculator', desc: 'Break down ROE into profit margin, asset turnover, and financial leverage.', cat: 'Finance', sub: 'Business Finance', icon: 'BarChart3' },
  { slug: 'altman-z-score-calculator', name: 'Altman Z-Score Calculator', desc: 'Predict the probability of a company going into bankruptcy.', cat: 'Finance', sub: 'Business Finance', icon: 'Shield' },
  { slug: 'piotroski-f-score-calculator', name: 'Piotroski F-Score Calculator', desc: 'Determine the strength of a firm\'s financial position.', cat: 'Finance', sub: 'Business Finance', icon: 'Award' },
  { slug: 'beta-calculator', name: 'Stock Beta Calculator', desc: 'Calculate a stock\'s volatility relative to the overall market.', cat: 'Finance', sub: 'Investment', icon: 'TrendingUp' },
  { slug: 'capital-asset-pricing-model-calculator', name: 'CAPM Calculator', desc: 'Calculate the expected return on an asset using CAPM.', cat: 'Finance', sub: 'Investment', icon: 'BarChart3' },
  { slug: 'black-scholes-calculator', name: 'Black-Scholes Option Pricing Calculator', desc: 'Calculate the theoretical value of European-style options.', cat: 'Finance', sub: 'Investment', icon: 'TrendingUp' },
  { slug: 'greeks-calculator', name: 'Options Greeks Calculator', desc: 'Calculate Delta, Gamma, Theta, Vega, and Rho for an option.', cat: 'Finance', sub: 'Investment', icon: 'Sigma' },
  { slug: 'put-call-parity-calculator', name: 'Put-Call Parity Calculator', desc: 'Determine the relationship between European put and call options.', cat: 'Finance', sub: 'Investment', icon: 'RefreshCw' },
  { slug: 'bond-duration-calculator', name: 'Macaulay Duration Calculator', desc: 'Calculate the weighted average time until a bond\'s cash flows are paid.', cat: 'Finance', sub: 'Investment', icon: 'Clock' },
  { slug: 'modified-duration-calculator', name: 'Modified Duration Calculator', desc: 'Measure a bond\'s price sensitivity to interest rate changes.', cat: 'Finance', sub: 'Investment', icon: 'TrendingDown' },
  { slug: 'convexity-calculator', name: 'Bond Convexity Calculator', desc: 'Measure the curvature in the relationship between bond prices and yields.', cat: 'Finance', sub: 'Investment', icon: 'TrendingUp' },
  { slug: 'yield-to-maturity-calculator', name: 'Yield to Maturity (YTM) Calculator', desc: 'Calculate the estimated annual rate of return for a bond held to maturity.', cat: 'Finance', sub: 'Investment', icon: 'Percent' },
  { slug: 'yield-to-call-calculator', name: 'Yield to Call (YTC) Calculator', desc: 'Calculate the return of a callable bond assuming it is called before maturity.', cat: 'Finance', sub: 'Investment', icon: 'Percent' },
  { slug: 'tax-equivalent-yield-calculator', name: 'Tax-Equivalent Yield Calculator', desc: 'Compare the yield of a tax-free municipal bond to a taxable bond.', cat: 'Finance', sub: 'Investment', icon: 'Landmark' },
  { slug: 'zero-coupon-bond-calculator', name: 'Zero-Coupon Bond Calculator', desc: 'Calculate the price, yield, or maturity value of a zero-coupon bond.', cat: 'Finance', sub: 'Investment', icon: 'Circle' },

  // Everyday Life additions
  { slug: 'bmi-calculator', name: 'BMI Calculator', desc: 'Calculate your Body Mass Index.', cat: 'Everyday Life', sub: 'Health', icon: 'Activity' },
  { slug: 'age-calculator', name: 'Age Calculator', desc: 'Calculate your exact age in years, months, and days.', cat: 'Everyday Life', sub: 'Time & Dates', icon: 'Calendar' },
  { slug: 'percentage-calculator', name: 'Percentage Calculator', desc: 'Calculate percentages, increases, and decreases.', cat: 'Everyday Life', sub: 'Finance', icon: 'Percent' },
  { slug: 'margin-calculator', name: 'Margin Calculator', desc: 'Calculate retail margin and markup.', cat: 'Everyday Life', sub: 'Finance', icon: 'Percent' },
  { slug: 'discount-calculator', name: 'Discount Calculator', desc: 'Calculate price after discount.', cat: 'Everyday Life', sub: 'Shopping', icon: 'Percent' },
  { slug: 'compound-annual-growth-rate-calculator', name: 'Compound Annual Growth Rate Calculator', desc: 'Calculate the CAGR of an investment.', cat: 'Everyday Life', sub: 'Finance', icon: 'TrendingUp' },
  { slug: 'inflation-adjusted-return-calculator', name: 'Inflation-Adjusted Return Calculator', desc: 'Calculate real return after inflation.', cat: 'Everyday Life', sub: 'Finance', icon: 'TrendingDown' },
  { slug: 'hourly-wage-calculator', name: 'Hourly Wage Calculator', desc: 'Convert annual salary to hourly wage.', cat: 'Everyday Life', sub: 'Finance', icon: 'DollarSign' },
  { slug: 'time-card-calculator', name: 'Time Card Calculator', desc: 'Calculate weekly hours and pay.', cat: 'Everyday Life', sub: 'Time & Dates', icon: 'Timer' },
  { slug: 'gestation-calculator', name: 'Gestation Calculator', desc: 'Calculate animal gestation periods.', cat: 'Everyday Life', sub: 'Animals', icon: 'Calendar' },
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 🔄 CONVERSION & OTHERS\n  // ══════════════════════════════════════════════\n';
toAdd.forEach(e => {
  str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "${e.cat}", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Conversion/Other calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
