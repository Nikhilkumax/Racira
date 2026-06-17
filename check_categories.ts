import { calculatorRegistry } from "./src/data/calculatorRegistry";
import { CATEGORY_SUMMARY } from "./src/app/calculator/summaryData";
import { toSlug } from "./src/lib/utils/slug";

const allCalcCategories = new Set(calculatorRegistry.filter(c => c).map(c => toSlug(c.category || "general")));
const zeroEntryCategories = CATEGORY_SUMMARY.filter(c => !allCalcCategories.has(toSlug(c.category)));

console.log("Zero entry categories:", zeroEntryCategories.map(c => c.category));
