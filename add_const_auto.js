const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Construction - Materials
  { slug: 'concrete-calculator', name: 'Concrete Calculator', desc: 'Calculate the volume of concrete needed for slabs, footings, and columns.', sub: 'Materials', icon: 'HardHat' },
  { slug: 'gravel-calculator', name: 'Gravel Calculator', desc: 'Calculate the volume and weight of gravel needed for driveways or landscaping.', sub: 'Materials', icon: 'Layers' },
  { slug: 'sand-calculator', name: 'Sand Calculator', desc: 'Estimate the amount of sand required for pavers, sandboxes, and masonry.', sub: 'Materials', icon: 'Layers' },
  { slug: 'mulch-calculator', name: 'Mulch Calculator', desc: 'Calculate how much mulch you need for garden beds by cubic yards or bags.', sub: 'Materials', icon: 'Leaf' },
  { slug: 'soil-calculator', name: 'Soil Calculator', desc: 'Calculate the volume of topsoil needed for raised beds or lawn grading.', sub: 'Materials', icon: 'Leaf' },
  { slug: 'brick-calculator', name: 'Brick Calculator', desc: 'Estimate the number of bricks and mortar needed for a wall.', sub: 'Materials', icon: 'Building' },
  { slug: 'block-calculator', name: 'Concrete Block Calculator', desc: 'Calculate the number of cinder blocks for retaining walls and foundations.', sub: 'Materials', icon: 'Building' },
  { slug: 'drywall-calculator', name: 'Drywall Calculator', desc: 'Estimate the number of drywall sheets, joint compound, and screws needed.', sub: 'Materials', icon: 'Layers' },
  { slug: 'paint-calculator', name: 'Paint Calculator', desc: 'Calculate how many gallons of paint you need for interior or exterior walls.', sub: 'Materials', icon: 'PaintBucket' },
  { slug: 'tile-calculator', name: 'Tile Calculator', desc: 'Calculate the number of tiles needed for floors or walls, including waste.', sub: 'Materials', icon: 'Layers' },
  { slug: 'paver-calculator', name: 'Paver Calculator', desc: 'Estimate the number of pavers required for patios and walkways.', sub: 'Materials', icon: 'Layers' },
  { slug: 'roofing-calculator', name: 'Roofing Calculator', desc: 'Calculate roofing squares and shingles needed based on roof area and pitch.', sub: 'Materials', icon: 'Home' },
  { slug: 'siding-calculator', name: 'Siding Calculator', desc: 'Estimate the amount of vinyl or wood siding needed for a house exterior.', sub: 'Materials', icon: 'Home' },
  { slug: 'flooring-calculator', name: 'Flooring Calculator', desc: 'Calculate square footage and material costs for hardwood, laminate, or vinyl.', sub: 'Materials', icon: 'Layers' },
  { slug: 'carpet-calculator', name: 'Carpet Calculator', desc: 'Calculate the yardage of carpet and padding needed for a room.', sub: 'Materials', icon: 'Layers' },
  { slug: 'decking-calculator', name: 'Decking Calculator', desc: 'Estimate the number of deck boards, joists, and screws for a custom deck.', sub: 'Materials', icon: 'Hammer' },
  { slug: 'fence-calculator', name: 'Fence Calculator', desc: 'Calculate the number of posts, rails, and pickets needed for a fence.', sub: 'Materials', icon: 'Ruler' },
  { slug: 'insulation-calculator', name: 'Insulation Calculator', desc: 'Estimate the number of insulation rolls or batts required for walls and attics.', sub: 'Materials', icon: 'Layers' },
  { slug: 'lumber-calculator', name: 'Lumber Calculator', desc: 'Calculate board feet and total cost of lumber for woodworking projects.', sub: 'Materials', icon: 'Hammer' },
  { slug: 'rebar-calculator', name: 'Rebar Calculator', desc: 'Calculate the total length, weight, and cost of rebar for concrete reinforcement.', sub: 'Materials', icon: 'HardHat' },
  
  // Construction - Measurements & Geometry
  { slug: 'stairs-calculator', name: 'Stairs Calculator', desc: 'Calculate stair rise, run, stringer length, and number of steps.', sub: 'Measurements', icon: 'Ruler' },
  { slug: 'roof-pitch-calculator', name: 'Roof Pitch Calculator', desc: 'Calculate roof pitch, angle, and rafter length from rise and run.', sub: 'Measurements', icon: 'Triangle' },
  { slug: 'board-foot-calculator', name: 'Board Foot Calculator', desc: 'Convert lumber dimensions to board feet for pricing and ordering.', sub: 'Measurements', icon: 'Ruler' },
  { slug: 'square-footage-calculator', name: 'Square Footage Calculator', desc: 'Calculate the total square footage of a room or house with complex shapes.', sub: 'Measurements', icon: 'Ruler' },
  { slug: 'cubic-yard-calculator', name: 'Cubic Yard Calculator', desc: 'Convert length, width, and depth into cubic yards for ordering bulk materials.', sub: 'Measurements', icon: 'Layers' },
  { slug: 'asphalt-calculator', name: 'Asphalt Calculator', desc: 'Calculate the tons of asphalt needed for paving a driveway or parking lot.', sub: 'Materials', icon: 'HardHat' },
  { slug: 'stud-calculator', name: 'Wall Stud Calculator', desc: 'Estimate the number of framing studs needed for a wall based on spacing.', sub: 'Materials', icon: 'Hammer' },
  { slug: 'hvac-calculator', name: 'HVAC Load Calculator', desc: 'Estimate the heating and cooling BTUs required for a specific room size.', sub: 'Measurements', icon: 'Thermometer' },
  { slug: 'btu-calculator', name: 'BTU Calculator', desc: 'Calculate the BTUs needed to heat or cool a space.', sub: 'Measurements', icon: 'Thermometer' },
  { slug: 'water-heater-calculator', name: 'Water Heater Sizing Calculator', desc: 'Determine the right size water heater based on household usage and fixtures.', sub: 'Measurements', icon: 'Droplets' },

  // Construction - Tools & Equipment
  { slug: 'generator-sizing-calculator', name: 'Generator Sizing Calculator', desc: 'Determine the wattage requirements to size a backup generator for your home.', sub: 'Equipment', icon: 'Zap' },
  { slug: 'pump-sizing-calculator', name: 'Pump Sizing Calculator', desc: 'Calculate head pressure and flow rate to select the right water pump.', sub: 'Equipment', icon: 'Droplets' },
  { slug: 'crane-capacity-calculator', name: 'Crane Capacity Calculator', desc: 'Estimate lifting capacity based on boom length, radius, and counterweight.', sub: 'Equipment', icon: 'HardHat' },
  { slug: 'excavation-calculator', name: 'Excavation Calculator', desc: 'Calculate the volume of dirt to be removed for foundations and trenches.', sub: 'Equipment', icon: 'Layers' },
  { slug: 'pipe-volume-calculator', name: 'Pipe Volume Calculator', desc: 'Calculate the interior volume of a pipe for fluid capacity.', sub: 'Measurements', icon: 'Circle' },

  // Automobile - Financing & Costs
  { slug: 'auto-loan-calculator', name: 'Auto Loan Calculator', desc: 'Calculate monthly car payments based on loan amount, term, and interest rate.', sub: 'Financing', icon: 'Car' },
  { slug: 'car-lease-calculator', name: 'Car Lease Calculator', desc: 'Estimate monthly lease payments including depreciation and money factor.', sub: 'Financing', icon: 'Car' },
  { slug: 'auto-refinance-calculator', name: 'Auto Refinance Calculator', desc: 'Determine if refinancing your car loan will save you money.', sub: 'Financing', icon: 'CircleDollarSign' },
  { slug: 'car-depreciation-calculator', name: 'Car Depreciation Calculator', desc: 'Estimate how much a vehicle will lose in value over time.', sub: 'Costs', icon: 'TrendingDown' },
  { slug: 'fuel-cost-calculator', name: 'Fuel Cost Calculator', desc: 'Calculate the total fuel cost for a road trip or daily commute.', sub: 'Costs', icon: 'Fuel' },
  { slug: 'gas-mileage-calculator', name: 'Gas Mileage Calculator', desc: 'Calculate your vehicle’s actual MPG or L/100km based on distance and fuel used.', sub: 'Costs', icon: 'Gauge' },
  { slug: 'ev-charging-cost-calculator', name: 'EV Charging Cost Calculator', desc: 'Calculate the cost to charge an electric vehicle based on electricity rates.', sub: 'Costs', icon: 'Zap' },
  { slug: 'total-cost-of-ownership-calculator', name: 'Car Total Cost of Ownership Calculator', desc: 'Estimate the true cost to own a car including insurance, maintenance, and fuel.', sub: 'Costs', icon: 'Banknote' },

  // Automobile - Performance & Engineering
  { slug: 'horsepower-calculator', name: 'Horsepower Calculator', desc: 'Estimate engine horsepower from vehicle weight and quarter-mile trap speed.', sub: 'Performance', icon: 'Gauge' },
  { slug: '0-60-calculator', name: '0-60 Time Calculator', desc: 'Estimate a car’s 0-60 mph time based on weight and horsepower.', sub: 'Performance', icon: 'Timer' },
  { slug: 'quarter-mile-calculator', name: 'Quarter Mile Calculator', desc: 'Predict quarter-mile elapsed time and trap speed from weight and horsepower.', sub: 'Performance', icon: 'Flag' },
  { slug: 'gear-ratio-calculator', name: 'Gear Ratio Calculator', desc: 'Calculate vehicle speed based on engine RPM, gear ratio, and tire size.', sub: 'Performance', icon: 'Settings' },
  { slug: 'tire-size-calculator', name: 'Tire Size Calculator', desc: 'Compare two tire sizes and calculate differences in diameter, width, and speedometer error.', sub: 'Performance', icon: 'Circle' },
  { slug: 'engine-displacement-calculator', name: 'Engine Displacement Calculator', desc: 'Calculate engine volume (cc or ci) based on bore, stroke, and number of cylinders.', sub: 'Performance', icon: 'Settings' },
  { slug: 'compression-ratio-calculator', name: 'Compression Ratio Calculator', desc: 'Calculate engine compression ratio from cylinder and combustion chamber volumes.', sub: 'Performance', icon: 'Settings' },
  { slug: 'fuel-injector-sizing-calculator', name: 'Fuel Injector Sizing Calculator', desc: 'Determine the correct fuel injector flow rate for your target horsepower.', sub: 'Performance', icon: 'Fuel' },
  { slug: 'carburetor-cfm-calculator', name: 'Carburetor CFM Calculator', desc: 'Calculate the required carburetor airflow (CFM) for your engine.', sub: 'Performance', icon: 'Wind' },
  { slug: 'wheel-offset-calculator', name: 'Wheel Offset Calculator', desc: 'Visualize how changes in wheel width and offset affect suspension clearance and stance.', sub: 'Performance', icon: 'Circle' },
  { slug: 'stopping-distance-calculator', name: 'Stopping Distance Calculator', desc: 'Estimate vehicle braking distance based on initial speed and road conditions.', sub: 'Performance', icon: 'Car' }
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '';
const groups = {};
toAdd.forEach(e => {
  if (!groups[e.category]) groups[e.category] = [];
  groups[e.category].push(e);
});

// Since we map category to the main ones, the above list didn't have category property!
toAdd.forEach(e => {
  if (e.slug.includes('concrete') || e.slug.includes('calculator') && !e.slug.includes('car') && !e.slug.includes('auto') && !e.slug.includes('fuel') && !e.slug.includes('mileage') && !e.slug.includes('ev') && !e.slug.includes('engine') && !e.slug.includes('tire') && !e.slug.includes('gear') && !e.slug.includes('horse') && !e.slug.includes('0-60') && !e.slug.includes('quarter-mile') && !e.slug.includes('wheel') && !e.slug.includes('stopping')) {
      e.category = 'Construction';
  } else {
      e.category = 'Automobile';
  }
});

let entriesStr = '\n\n  // ══════════════════════════════════════════════\n  // 🏗️ CONSTRUCTION & 🚗 AUTOMOBILE\n  // ══════════════════════════════════════════════\n';
toAdd.forEach(e => {
  entriesStr += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "${e.category}", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + entriesStr + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Construction/Auto calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
