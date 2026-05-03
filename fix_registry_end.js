const fs = require('fs');
const file = 'src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

// Find the last instance of '];' that looks like the end of the registry
const lastBracketIndex = content.lastIndexOf('];');
if (lastBracketIndex === -1) {
  console.error('Could not find ];');
  process.exit(1);
}

const before = content.substring(0, lastBracketIndex + 2);

const newEnd = `

export const getCategories = () => {
  const cats = new Map<string, CalculatorDef[]>();
  calculatorRegistry.forEach(c => {
    const list = cats.get(c.category) || [];
    list.push(c);
    cats.set(c.category, list);
  });
  return cats;
};

export const getCalculatorBySlug = (slug: string) =>
  calculatorRegistry.find(c => c.slug === slug);

export const getBuiltCalculators = () =>
  calculatorRegistry.filter(c => c.isBuilt);

export const getUnbuiltCalculators = () =>
  calculatorRegistry.filter(c => !c.isBuilt);

export const getCategoryIcon = (category: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    "Finance":      DollarSign,
    "Health":       Heart,
    "Math":         Calculator,
    "Science":      Atom,
    "Everyday Life": Clock,
    "Construction": HardHat,
    "Sports":       Trophy,
    "Ecology":      Leaf,
    "Technology":   Cpu,
    "Education":    GraduationCap,
    "Conversion":   ArrowLeftRight,
    "Automobile":   Car,
  };
  return icons[category] || Calculator;
};
`;

fs.writeFileSync(file, before + newEnd, 'utf8');
console.log('Fixed calculatorRegistry.ts end and restored helper functions.');
