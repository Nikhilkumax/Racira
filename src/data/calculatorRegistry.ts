import { 
  LucideIcon, 
  DollarSign, 
  Heart, 
  Calculator, 
  Atom, 
  Clock, 
  HardHat, 
  Trophy, 
  Leaf, 
  Cpu, 
  GraduationCap, 
  ArrowLeftRight, 
  Car,
  Briefcase,
  Settings
} from "lucide-react";

export interface CalculatorDef {
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  icon?: LucideIcon;
  isBuilt: boolean;
  tier?: string;
  priorityScore?: number;
  updatedAt?: string;
}

import { financeCalculators } from "./calculators/finance";
import { businessCalculators } from "./calculators/business";
import { healthCalculators } from "./calculators/health";
import { mathCalculators } from "./calculators/math";
import { scienceCalculators } from "./calculators/science";
import { engineeringCalculators } from "./calculators/engineering";
import { technologyCalculators } from "./calculators/technology";
import { environmentCalculators } from "./calculators/environment";
import { everydaylifeCalculators } from "./calculators/everyday-life";
import { transportationCalculators } from "./calculators/transportation";
import { constructionCalculators } from "./calculators/construction";
import { educationCalculators } from "./calculators/education";

export const calculatorRegistry: CalculatorDef[] = [
  ...financeCalculators,
  ...businessCalculators,
  ...healthCalculators,
  ...mathCalculators,
  ...scienceCalculators,
  ...engineeringCalculators,
  ...technologyCalculators,
  ...environmentCalculators,
  ...everydaylifeCalculators,
  ...transportationCalculators,
  ...constructionCalculators,
  ...educationCalculators
];

export const getBuiltCalculators = () =>
  calculatorRegistry.filter(c => c.isBuilt);

export const getUnbuiltCalculators = () =>
  calculatorRegistry.filter(c => !c.isBuilt);

export const getCategoryIcon = (category: string): LucideIcon => {
  const upper = category.toUpperCase().replace(/ /g, '_');
  const icons: Record<string, LucideIcon> = {
    "FINANCE": DollarSign,
    "BUSINESS": Briefcase,
    "HEALTH": Heart,
    "MATH": Calculator,
    "SCIENCE": Atom,
    "ENGINEERING": Settings,
    "TECHNOLOGY": Cpu,
    "ENVIRONMENT": Leaf,
    "EVERYDAY_LIFE": Clock,
    "TRANSPORTATION": Car,
    "CONSTRUCTION": HardHat,
    "EDUCATION": GraduationCap
  };
  return icons[upper] || Calculator;
};

export const getCategories = () => {
  const cats = new Map<string, CalculatorDef[]>();
  calculatorRegistry.forEach(c => {
    const list = cats.get(c.category) || [];
    list.push(c);
    cats.set(c.category, list);
  });
  return cats;
};

export const getCalculatorBySlug = (slug: string): CalculatorDef | undefined => {
  return calculatorRegistry.find(c => c.slug === slug);
};
