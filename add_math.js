const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');
const existingSlugs = new Set([...content.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m => m[1]));

const newEntries = [
  // Basic
  { slug: 'modulo-calculator', name: 'Modulo Calculator', desc: 'Calculate the remainder of division between any two numbers.', sub: 'Basic', icon: 'Hash' },
  { slug: 'ceiling-floor-calculator', name: 'Ceiling & Floor Calculator', desc: 'Calculate ceiling and floor values for rounding real numbers.', sub: 'Basic', icon: 'Hash' },
  { slug: 'absolute-value-calculator', name: 'Absolute Value Calculator', desc: 'Find the absolute value of any number or expression.', sub: 'Basic', icon: 'Hash' },
  { slug: 'factorial-calculator', name: 'Factorial Calculator', desc: 'Calculate the factorial of any non-negative integer step by step.', sub: 'Basic', icon: 'Sigma' },
  { slug: 'fibonacci-calculator', name: 'Fibonacci Sequence Calculator', desc: 'Generate Fibonacci sequence terms and find any position in the series.', sub: 'Basic', icon: 'Hash' },
  { slug: 'base-conversion-calculator', name: 'Base Conversion Calculator', desc: 'Convert numbers between binary, octal, decimal, and hexadecimal bases.', sub: 'Basic', icon: 'Binary' },
  { slug: 'number-to-words-converter', name: 'Number to Words Converter', desc: 'Convert any number to its English word representation.', sub: 'Basic', icon: 'Hash' },
  { slug: 'average-calculator', name: 'Average Calculator', desc: 'Calculate the arithmetic mean of a set of numbers quickly.', sub: 'Basic', icon: 'Calculator' },
  { slug: 'median-calculator', name: 'Median Calculator', desc: 'Find the median value in any data set, odd or even count.', sub: 'Basic', icon: 'BarChart3' },
  { slug: 'mode-calculator', name: 'Mode Calculator', desc: 'Find the most frequently occurring value in a data set.', sub: 'Basic', icon: 'BarChart3' },
  { slug: 'range-calculator', name: 'Range Calculator', desc: 'Calculate the range, minimum, and maximum of a data set.', sub: 'Basic', icon: 'BarChart3' },
  { slug: 'antilog-calculator', name: 'Antilog Calculator', desc: 'Calculate the antilogarithm for any base from a given log value.', sub: 'Basic', icon: 'Sigma' },
  { slug: 'cube-root-calculator', name: 'Cube Root Calculator', desc: 'Calculate the cube root of any number with exact or decimal precision.', sub: 'Basic', icon: 'Sigma' },
  { slug: 'nth-root-calculator', name: 'Nth Root Calculator', desc: 'Calculate any nth root of a number for any positive integer n.', sub: 'Basic', icon: 'Sigma' },
  // Algebra
  { slug: 'system-of-equations-calculator', name: 'System of Equations Calculator', desc: 'Solve 2×2 and 3×3 systems of linear equations by substitution or elimination.', sub: 'Algebra', icon: 'Sigma' },
  { slug: 'completing-the-square-calculator', name: 'Completing the Square Calculator', desc: 'Convert quadratic equations to vertex form by completing the square.', sub: 'Algebra', icon: 'Sigma' },
  { slug: 'complex-numbers-calculator', name: 'Complex Numbers Calculator', desc: 'Add, subtract, multiply, and divide complex numbers in rectangular and polar form.', sub: 'Algebra', icon: 'Sigma' },
  { slug: 'inequality-calculator', name: 'Inequality Calculator', desc: 'Solve linear and quadratic inequalities and display solution on a number line.', sub: 'Algebra', icon: 'Sigma' },
  { slug: 'arithmetic-progression-calculator', name: 'Arithmetic Progression Calculator', desc: 'Find nth term and sum of an arithmetic sequence given first term and difference.', sub: 'Algebra', icon: 'Hash' },
  { slug: 'geometric-progression-calculator', name: 'Geometric Progression Calculator', desc: 'Find nth term and sum of a geometric sequence given first term and ratio.', sub: 'Algebra', icon: 'Hash' },
  { slug: 'exponential-growth-calculator', name: 'Exponential Growth Calculator', desc: 'Model exponential growth for population, bacteria, investments, and more.', sub: 'Algebra', icon: 'TrendingUp' },
  { slug: 'exponential-decay-calculator', name: 'Exponential Decay Calculator', desc: 'Model exponential decay for radioactive materials, drug clearance, and depreciation.', sub: 'Algebra', icon: 'TrendingDown' },
  { slug: 'logarithm-change-of-base-calculator', name: 'Change of Base Calculator', desc: 'Convert logarithms between different bases using the change of base formula.', sub: 'Algebra', icon: 'Sigma' },
  { slug: 'direct-variation-calculator', name: 'Direct Variation Calculator', desc: 'Solve direct variation problems and find the constant of proportionality.', sub: 'Algebra', icon: 'TrendingUp' },
  { slug: 'inverse-variation-calculator', name: 'Inverse Variation Calculator', desc: 'Solve inverse variation problems where two quantities vary inversely.', sub: 'Algebra', icon: 'TrendingDown' },
  { slug: 'function-composition-calculator', name: 'Function Composition Calculator', desc: 'Compute the composition of two or more functions f(g(x)).', sub: 'Algebra', icon: 'Sigma' },
  // Geometry
  { slug: 'perimeter-calculator', name: 'Perimeter Calculator', desc: 'Calculate the perimeter of common 2D shapes including polygons and circles.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'right-angle-calculator', name: 'Right Angle Triangle Calculator', desc: 'Solve right triangles by entering any two known values.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'law-of-sines-calculator', name: 'Law of Sines Calculator', desc: 'Solve oblique triangles using the Law of Sines.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'law-of-cosines-calculator', name: 'Law of Cosines Calculator', desc: 'Solve any triangle using the Law of Cosines with SSS or SAS input.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'angle-converter', name: 'Angle Converter', desc: 'Convert angles between degrees, radians, gradians, and turns.', sub: 'Geometry', icon: 'Circle' },
  { slug: 'arc-length-calculator', name: 'Arc Length Calculator', desc: 'Calculate the length of an arc given radius and central angle.', sub: 'Geometry', icon: 'Circle' },
  { slug: 'sector-area-calculator', name: 'Sector Area Calculator', desc: 'Calculate the area of a circle sector from radius and angle.', sub: 'Geometry', icon: 'Circle' },
  { slug: 'ellipse-calculator', name: 'Ellipse Calculator', desc: 'Calculate area, perimeter, and eccentricity of an ellipse.', sub: 'Geometry', icon: 'Circle' },
  { slug: 'polygon-calculator', name: 'Regular Polygon Calculator', desc: 'Calculate area, perimeter, and angles of any regular polygon.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'coordinate-geometry-calculator', name: 'Coordinate Geometry Calculator', desc: 'Find distance, midpoint, and equation of a line through two points.', sub: 'Geometry', icon: 'Ruler' },
  { slug: 'polygon-area-calculator', name: 'Polygon Area Calculator', desc: 'Calculate the area of any irregular polygon using vertex coordinates.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'cone-calculator', name: 'Cone Calculator', desc: 'Calculate volume, surface area, and slant height of a cone.', sub: 'Geometry', icon: 'Triangle' },
  { slug: 'cylinder-calculator', name: 'Cylinder Calculator', desc: 'Calculate volume, surface area, and lateral area of a cylinder.', sub: 'Geometry', icon: 'Layers' },
  { slug: 'sphere-calculator', name: 'Sphere Calculator', desc: 'Calculate volume and surface area of a sphere from radius or diameter.', sub: 'Geometry', icon: 'Circle' },
  // Statistics
  { slug: 'correlation-coefficient-calculator', name: 'Correlation Coefficient Calculator', desc: 'Calculate Pearson and Spearman correlation coefficients for two data sets.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'linear-regression-calculator', name: 'Linear Regression Calculator', desc: 'Find the best-fit line and R² value for a set of data points.', sub: 'Statistics', icon: 'TrendingUp' },
  { slug: 'chi-square-calculator', name: 'Chi-Square Test Calculator', desc: 'Perform chi-square test of independence and goodness of fit.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 't-test-calculator', name: 'T-Test Calculator', desc: 'Perform one-sample, two-sample, and paired t-tests with p-values.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'binomial-distribution-calculator', name: 'Binomial Distribution Calculator', desc: 'Calculate probabilities for binomial distributions with n trials and probability p.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'normal-distribution-calculator', name: 'Normal Distribution Calculator', desc: 'Calculate area under the normal curve and find probabilities for z-scores.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'poisson-distribution-calculator', name: 'Poisson Distribution Calculator', desc: 'Calculate event probabilities using the Poisson distribution formula.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'covariance-calculator', name: 'Covariance Calculator', desc: 'Calculate population and sample covariance for two data sets.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'interquartile-range-calculator', name: 'Interquartile Range Calculator', desc: 'Calculate Q1, Q2, Q3, and IQR from any data set.', sub: 'Statistics', icon: 'BarChart3' },
  { slug: 'weighted-average-calculator', name: 'Weighted Average Calculator', desc: 'Calculate the weighted mean of values with different weights or importance.', sub: 'Statistics', icon: 'Calculator' },
  // Calculus
  { slug: 'derivative-calculator', name: 'Derivative Calculator', desc: 'Find the derivative of common functions using differentiation rules.', sub: 'Calculus', icon: 'Sigma' },
  { slug: 'integral-calculator', name: 'Integral Calculator', desc: 'Calculate definite and indefinite integrals of standard functions.', sub: 'Calculus', icon: 'Sigma' },
  { slug: 'limit-calculator', name: 'Limit Calculator', desc: 'Evaluate the limit of a function as the variable approaches a value.', sub: 'Calculus', icon: 'Sigma' },
  { slug: 'riemann-sum-calculator', name: 'Riemann Sum Calculator', desc: 'Approximate definite integrals using left, right, and midpoint Riemann sums.', sub: 'Calculus', icon: 'BarChart3' },
  { slug: 'taylor-series-calculator', name: 'Taylor Series Calculator', desc: 'Expand a function as a Taylor series around a given point.', sub: 'Calculus', icon: 'Sigma' },
  { slug: 'vector-operations-calculator', name: 'Vector Operations Calculator', desc: 'Calculate dot product, cross product, magnitude, and angles between vectors.', sub: 'Calculus', icon: 'Ruler' },
  // Discrete Math
  { slug: 'combinations-calculator', name: 'Combinations Calculator', desc: 'Calculate nCr — the number of ways to choose r items from n without repetition.', sub: 'Discrete Math', icon: 'Sigma' },
  { slug: 'permutations-calculator', name: 'Permutations Calculator', desc: 'Calculate nPr — the number of ordered arrangements of r items from n.', sub: 'Discrete Math', icon: 'Sigma' },
  { slug: 'set-operations-calculator', name: 'Set Operations Calculator', desc: 'Perform union, intersection, difference, and complement of sets.', sub: 'Discrete Math', icon: 'Layers' },
  { slug: 'truth-table-calculator', name: 'Truth Table Calculator', desc: 'Generate truth tables for any logical expression with AND, OR, NOT, XOR.', sub: 'Discrete Math', icon: 'Binary' },
  { slug: 'binary-decimal-calculator', name: 'Binary to Decimal Calculator', desc: 'Convert between binary, decimal, octal, and hexadecimal number systems.', sub: 'Discrete Math', icon: 'Binary' },
  { slug: 'two-complement-calculator', name: "Two's Complement Calculator", desc: "Convert integers to two's complement binary representation and back.", sub: 'Discrete Math', icon: 'Binary' },
  { slug: 'bitwise-operations-calculator', name: 'Bitwise Operations Calculator', desc: 'Perform AND, OR, XOR, NOT, and shift operations on binary numbers.', sub: 'Discrete Math', icon: 'Binary' },
];

const toAdd = newEntries.filter(e => !existingSlugs.has(e.slug));
const skipped = newEntries.filter(e => existingSlugs.has(e.slug));
if (skipped.length > 0) console.log('Skipped:', skipped.map(e => e.slug));

let str = '\n\n  // ══════════════════════════════════════════════\n  // 📐 MATH — NEW ADDITIONS\n  // ══════════════════════════════════════════════\n';
const groups = {};
toAdd.forEach(e => { if (!groups[e.sub]) groups[e.sub] = []; groups[e.sub].push(e); });
Object.entries(groups).forEach(([sub, entries]) => {
  str += `\n  // ${sub}\n`;
  entries.forEach(e => {
    str += `  { slug: "${e.slug}", name: "${e.name}", description: "${e.desc}", category: "Math", subcategory: "${e.sub}", icon: ${e.icon}, isBuilt: false },\n`;
  });
});

const insertAt = content.lastIndexOf('];');
content = content.slice(0, insertAt) + str + '\n' + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
const finalCount = [...fs.readFileSync(file, 'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].length;
console.log(`✅ Added ${toAdd.length} Math calculators.`);
console.log(`📊 Total registry count: ${finalCount}`);
