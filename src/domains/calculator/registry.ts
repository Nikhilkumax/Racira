import { ArrowLeftRight, Atom, Briefcase, Calculator, Car, Clock, Cpu, DollarSign, GraduationCap, HardHat, Heart, Leaf, LucideIcon, Settings, Trophy } from "lucide-react";

export interface CalculatorDef {
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  icon?: LucideIcon;
  status: "live" | "soon";
  tier?: string;
  priorityScore?: number;
  updatedAt?: string;
}

import { financeCalculators } from "./registry/finance";
import { businessCalculators } from "./registry/business";
import { healthCalculators } from "./registry/health";
import { mathCalculators } from "./registry/math";
import { scienceCalculators } from "./registry/science";
import { engineeringCalculators } from "./registry/engineering";
import { technologyCalculators } from "./registry/technology";
import { environmentCalculators } from "./registry/environment";
import { everydaylifeCalculators } from "./registry/everyday-life";
import { transportationCalculators } from "./registry/transportation";
import { constructionCalculators } from "./registry/construction";
import { educationCalculators } from "./registry/education";
import { utilityCalculators } from "./registry/utilities";
import { orphanedCalculators } from "./registry/orphans";

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
  ...educationCalculators,
  ...utilityCalculators,
  ...orphanedCalculators
];

export const getBuiltCalculators = () =>
  calculatorRegistry.filter(c => c.status === "live");

export const getUnbuiltCalculators = () =>
  calculatorRegistry.filter(c => c.status === "soon");

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
