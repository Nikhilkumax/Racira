const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Physics
  { slug: 'kinetic-energy-calculator', name: 'Kinetic Energy Calculator', desc: 'Calculate kinetic energy of an object from its mass and velocity.', sub: 'Physics', icon: 'Zap' },
  { slug: 'potential-energy-calculator', name: 'Potential Energy Calculator', desc: 'Calculate gravitational potential energy from mass, gravity, and height.', sub: 'Physics', icon: 'Zap' },
  { slug: 'work-power-calculator', name: 'Work & Power Calculator', desc: 'Calculate work done, power output, and energy transfer in mechanical systems.', sub: 'Physics', icon: 'Zap' },
  { slug: 'momentum-calculator', name: 'Momentum Calculator', desc: 'Calculate linear momentum and impulse from mass and velocity.', sub: 'Physics', icon: 'Zap' },
  { slug: 'acceleration-calculator', name: 'Acceleration Calculator', desc: 'Calculate linear acceleration from velocity change and time.', sub: 'Physics', icon: 'Gauge' },
  { slug: 'projectile-motion-calculator', name: 'Projectile Motion Calculator', desc: 'Calculate range, max height, and flight time for projectile motion problems.', sub: 'Physics', icon: 'Triangle' },
  { slug: 'gravitational-force-calculator', name: 'Gravitational Force Calculator', desc: "Calculate gravitational attraction between two masses using Newton's law.", sub: 'Physics', icon: 'Globe' },
  { slug: 'circular-motion-calculator', name: 'Circular Motion Calculator', desc: 'Calculate centripetal force, acceleration, and velocity for circular motion.', sub: 'Physics', icon: 'Circle' },
  { slug: 'simple-pendulum-calculator', name: 'Simple Pendulum Calculator', desc: 'Calculate period and frequency of a simple pendulum from its length.', sub: 'Physics', icon: 'Clock' },
  { slug: 'spring-constant-calculator', name: 'Spring Constant Calculator', desc: "Calculate spring constant, force, and displacement using Hooke's Law.", sub: 'Physics', icon: 'Zap' },
  { slug: 'buoyancy-calculator', name: 'Buoyancy Calculator', desc: 'Calculate buoyant force on an object submerged in a fluid.', sub: 'Physics', icon: 'Droplets' },
  { slug: 'pressure-calculator', name: 'Pressure Calculator', desc: 'Calculate pressure from force and area, or fluid depth and density.', sub: 'Physics', icon: 'Gauge' },
  { slug: 'specific-heat-calculator', name: 'Specific Heat Calculator', desc: 'Calculate heat transfer using the specific heat capacity formula.', sub: 'Physics', icon: 'Thermometer' },
  { slug: 'frequency-wavelength-calculator', name: 'Frequency & Wavelength Calculator', desc: 'Convert between frequency, wavelength, and wave speed for any wave.', sub: 'Physics', icon: 'Zap' },
  { slug: 'snells-law-calculator', name: "Snell's Law Calculator", desc: 'Calculate angle of refraction when light passes between two media.', sub: 'Physics', icon: 'Zap' },
  { slug: 'doppler-effect-calculator', name: 'Doppler Effect Calculator', desc: 'Calculate the apparent frequency shift due to relative motion between source and observer.', sub: 'Physics', icon: 'Zap' },
  { slug: 'electric-field-calculator', name: 'Electric Field Calculator', desc: 'Calculate electric field strength from charge and distance.', sub: 'Physics', icon: 'Zap' },
  { slug: 'resistors-in-parallel-calculator', name: 'Resistors in Parallel Calculator', desc: 'Calculate total resistance for resistors connected in parallel.', sub: 'Physics', icon: 'Zap' },
  { slug: 'resistors-in-series-calculator', name: 'Resistors in Series Calculator', desc: 'Calculate total resistance for resistors connected in series.', sub: 'Physics', icon: 'Zap' },
  { slug: 'electric-power-calculator', name: 'Electric Power Calculator', desc: 'Calculate electric power from voltage, current, or resistance combinations.', sub: 'Physics', icon: 'Zap' },
  // Chemistry
  { slug: 'ph-calculator', name: 'pH Calculator', desc: 'Calculate the pH of acids and bases from hydrogen ion concentration.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'buffer-solution-calculator', name: 'Buffer Solution Calculator', desc: 'Calculate the pH of buffer solutions using the Henderson-Hasselbalch equation.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'ideal-gas-law-calculator', name: 'Ideal Gas Law Calculator', desc: 'Solve for pressure, volume, temperature, or moles using PV=nRT.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'boyles-law-calculator', name: "Boyle's Law Calculator", desc: 'Calculate the relationship between pressure and volume at constant temperature.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'charles-law-calculator', name: "Charles's Law Calculator", desc: 'Calculate the relationship between volume and temperature at constant pressure.', sub: 'Chemistry', icon: 'Thermometer' },
  { slug: 'combined-gas-law-calculator', name: 'Combined Gas Law Calculator', desc: 'Solve combined gas law problems with pressure, volume, and temperature variables.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'dilution-calculator', name: 'Solution Dilution Calculator', desc: 'Calculate concentration or volume needed to dilute a solution using C1V1=C2V2.', sub: 'Chemistry', icon: 'Droplets' },
  { slug: 'stoichiometry-calculator', name: 'Stoichiometry Calculator', desc: 'Calculate moles, mass, and volume relationships in chemical reactions.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'empirical-formula-calculator', name: 'Empirical Formula Calculator', desc: 'Determine the empirical formula of a compound from percent composition.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'percent-yield-calculator', name: 'Percent Yield Calculator', desc: 'Calculate percent yield of a chemical reaction from actual and theoretical yields.', sub: 'Chemistry', icon: 'Percent' },
  { slug: 'limiting-reagent-calculator', name: 'Limiting Reagent Calculator', desc: 'Find the limiting reagent and excess reactant in a chemical reaction.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'concentration-calculator', name: 'Concentration Calculator', desc: 'Calculate solution concentration in molarity, molality, or mass percent.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'activation-energy-calculator', name: 'Activation Energy Calculator', desc: 'Calculate activation energy from rate constants using the Arrhenius equation.', sub: 'Chemistry', icon: 'Thermometer' },
  { slug: 'equilibrium-constant-calculator', name: 'Equilibrium Constant Calculator', desc: 'Calculate Kc or Kp from equilibrium concentrations or partial pressures.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'titration-calculator', name: 'Titration Calculator', desc: 'Calculate concentration of unknown solutions from titration data.', sub: 'Chemistry', icon: 'Beaker' },
  { slug: 'osmolarity-calculator', name: 'Osmolarity Calculator', desc: 'Calculate osmolarity of a solution from solute concentrations.', sub: 'Chemistry', icon: 'Droplets' },
  // Earth Science & Engineering
  { slug: 'thermal-expansion-calculator', name: 'Thermal Expansion Calculator', desc: 'Calculate linear and volumetric thermal expansion of materials.', sub: 'Earth Science', icon: 'Thermometer' },
  { slug: 'fluid-flow-calculator', name: 'Fluid Flow Rate Calculator', desc: 'Calculate volumetric flow rate, velocity, and pipe cross-section area.', sub: 'Earth Science', icon: 'Droplets' },
  { slug: 'decibel-calculator', name: 'Decibel Calculator', desc: 'Convert between decibels and power or intensity ratios.', sub: 'Earth Science', icon: 'Activity' },
  { slug: 'radioactive-decay-calculator', name: 'Radioactive Decay Calculator', desc: 'Calculate remaining quantity after radioactive decay using half-life.', sub: 'Earth Science', icon: 'Atom' },
  { slug: 'humidity-calculator', name: 'Relative Humidity Calculator', desc: 'Calculate relative humidity, dew point, and wet-bulb temperature.', sub: 'Earth Science', icon: 'Droplets' },
  { slug: 'barometric-pressure-calculator', name: 'Barometric Pressure Calculator', desc: 'Calculate atmospheric pressure at different altitudes above sea level.', sub: 'Earth Science', icon: 'Gauge' },
  { slug: 'uv-index-calculator', name: 'UV Index Calculator', desc: 'Calculate UV exposure risk based on solar angle, altitude, and ozone levels.', sub: 'Earth Science', icon: 'Sparkles' },
  { slug: 'altitude-calculator', name: 'Altitude Calculator', desc: 'Calculate altitude from barometric pressure or GPS coordinates.', sub: 'Earth Science', icon: 'Triangle' },
  { slug: 'magnetic-field-calculator', name: 'Magnetic Field Calculator', desc: 'Calculate magnetic field strength around a current-carrying conductor.', sub: 'Earth Science', icon: 'Zap' },
  { slug: 'power-factor-calculator', name: 'Power Factor Calculator', desc: 'Calculate power factor, apparent power, and reactive power for AC circuits.', sub: 'Earth Science', icon: 'Zap' },
  { slug: 'transformer-calculator', name: 'Transformer Calculator', desc: 'Calculate primary/secondary voltage, current, and turns ratio for transformers.', sub: 'Earth Science', icon: 'Zap' },
  { slug: 'efficiency-calculator', name: 'Energy Efficiency Calculator', desc: 'Calculate energy efficiency ratio for machines, engines, and systems.', sub: 'Earth Science', icon: 'Percent' },
  { slug: 'wind-speed-power-calculator', name: 'Wind Speed & Power Calculator', desc: 'Calculate wind power density and turbine output from wind speed.', sub: 'Earth Science', icon: 'Gauge' },
  { slug: 'tidal-prediction-calculator', name: 'Tidal Force Calculator', desc: 'Calculate tidal force exerted by the Moon and Sun on ocean bodies.', sub: 'Earth Science', icon: 'Globe' },
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 🔬 SCIENCE — NEW ADDITIONS\n  // ══════════════════════════════════════════════\n';
const groups = {};
toAdd.forEach(e => { if (!groups[e.sub]) groups[e.sub] = []; groups[e.sub].push(e); });
Object.entries(groups).forEach(([sub, entries]) => {
  str += `\n  // ${sub}\n`;
  entries.forEach(e => {
    str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "Science", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
  });
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Science calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
