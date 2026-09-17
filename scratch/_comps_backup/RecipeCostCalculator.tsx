"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart as RBar, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

type UnitFamily = "weight" | "volume" | "count";
type Unit = "lb" | "oz" | "kg" | "g" | "gal" | "qt" | "cup" | "floz" | "l" | "ml" | "each";

interface UnitDef {
  key: Unit;
  label: string;
  family: UnitFamily;
  /** Amount of the family base unit (grams, millilitres, or items) in one of this unit. */
  base: number;
}

const UNITS: UnitDef[] = [
  { key: "lb", label: "pounds (lb)", family: "weight", base: 453.592 },
  { key: "oz", label: "ounces (oz)", family: "weight", base: 28.3495 },
  { key: "kg", label: "kilograms (kg)", family: "weight", base: 1000 },
  { key: "g", label: "grams (g)", family: "weight", base: 1 },
  { key: "gal", label: "gallons (gal)", family: "volume", base: 3785.41 },
  { key: "qt", label: "quarts (qt)", family: "volume", base: 946.353 },
  { key: "cup", label: "cups", family: "volume", base: 236.588 },
  { key: "floz", label: "fluid ounces (fl oz)", family: "volume", base: 29.5735 },
  { key: "l", label: "litres (L)", family: "volume", base: 1000 },
  { key: "ml", label: "millilitres (ml)", family: "volume", base: 1 },
  { key: "each", label: "each / item", family: "count", base: 1 },
];

const UNIT_MAP: Record<Unit, UnitDef> = UNITS.reduce((acc, u) => {
  acc[u.key] = u;
  return acc;
}, {} as Record<Unit, UnitDef>);

interface Ingredient {
  id: number;
  name: string;
  purchasePrice: string;
  purchaseSize: string;
  purchaseUnit: Unit;
  usedAmount: string;
  usedUnit: Unit;
  wastePercent: string;
}

interface RecipeInputs {
  ingredients: Ingredient[];
  servings: string;
  otherCosts: string;
  proMode: boolean;
  laborHours: string;
  laborRate: string;
  overheadPercent: string;
  targetFoodCostPercent: string;
}

interface IngredientCost {
  id: number;
  name: string;
  unitCost: number;
  effectiveAmount: number;
  cost: number;
  sharePercent: number;
  error: string | null;
}

interface RecipeResult {
  lines: IngredientCost[];
  ingredientTotal: number;
  otherCosts: number;
  laborCost: number;
  overheadCost: number;
  batchTotal: number;
  costPerServing: number;
  servings: number;
  mostExpensive: IngredientCost | null;
  errorCount: number;
  suggestedPrice: number;
  grossProfitPerServing: number;
  marginPercent: number;
  batchRevenue: number;
  batchProfit: number;
  actualFoodCostPercent: number;
}

let nextId = 6;

const DEFAULTS: RecipeInputs = {
  ingredients: [
    { id: 1, name: "All-purpose flour", purchasePrice: "4.50", purchaseSize: "5", purchaseUnit: "lb", usedAmount: "12", usedUnit: "oz", wastePercent: "0" },
    { id: 2, name: "Butter", purchasePrice: "5.20", purchaseSize: "1", purchaseUnit: "lb", usedAmount: "8", usedUnit: "oz", wastePercent: "0" },
    { id: 3, name: "Sugar", purchasePrice: "3.80", purchaseSize: "4", purchaseUnit: "lb", usedAmount: "10", usedUnit: "oz", wastePercent: "0" },
    { id: 4, name: "Eggs", purchasePrice: "4.20", purchaseSize: "12", purchaseUnit: "each", usedAmount: "4", usedUnit: "each", wastePercent: "0" },
    { id: 5, name: "Whole milk", purchasePrice: "3.60", purchaseSize: "1", purchaseUnit: "gal", usedAmount: "1.5", usedUnit: "cup", wastePercent: "0" },
  ],
  servings: "12",
  otherCosts: "0.80",
  proMode: false,
  laborHours: "1.25",
  laborRate: "18",
  overheadPercent: "15",
  targetFoodCostPercent: "30",
};

/**
 * Cost of an ingredient = (price / purchase size in base units) * amount used in base units,
 * scaled up for trim and yield loss. Cross-family conversion (weight to volume) needs a
 * density that varies per ingredient, so it is rejected rather than guessed.
 */
const calculateRecipe = (input: RecipeInputs): RecipeResult => {
  const servings = Math.max(1, Math.round(parseFloat(input.servings) || 1));
  const otherCosts = Math.max(0, parseFloat(input.otherCosts) || 0);

  const lines: IngredientCost[] = input.ingredients.map((ing) => {
    const price = Math.max(0, parseFloat(ing.purchasePrice) || 0);
    const size = parseFloat(ing.purchaseSize) || 0;
    const used = Math.max(0, parseFloat(ing.usedAmount) || 0);
    const waste = Math.min(95, Math.max(0, parseFloat(ing.wastePercent) || 0));

    const pUnit = UNIT_MAP[ing.purchaseUnit];
    const uUnit = UNIT_MAP[ing.usedUnit];

    let error: string | null = null;
    if (pUnit.family !== uUnit.family) {
      error = `Cannot convert ${uUnit.family} to ${pUnit.family}`;
    } else if (size <= 0) {
      error = "Purchase size must be greater than zero";
    }

    if (error) {
      return { id: ing.id, name: ing.name, unitCost: 0, effectiveAmount: 0, cost: 0, sharePercent: 0, error };
    }

    const purchaseBase = size * pUnit.base;
    const usedBase = used * uUnit.base;
    // Waste means you must buy more than the recipe calls for to end up with the usable amount.
    const effectiveBase = usedBase / (1 - waste / 100);
    const costPerBase = price / purchaseBase;
    const cost = costPerBase * effectiveBase;

    return {
      id: ing.id,
      name: ing.name || "Unnamed ingredient",
      unitCost: costPerBase * pUnit.base,
      effectiveAmount: effectiveBase / uUnit.base,
      cost,
      sharePercent: 0,
      error: null,
    };
  });

  const ingredientTotal = lines.reduce((sum, l) => sum + l.cost, 0);
  lines.forEach((l) => {
    l.sharePercent = ingredientTotal > 0 ? (l.cost / ingredientTotal) * 100 : 0;
  });

  const laborCost = input.proMode
    ? Math.max(0, parseFloat(input.laborHours) || 0) * Math.max(0, parseFloat(input.laborRate) || 0)
    : 0;
  const overheadPercent = input.proMode ? Math.max(0, parseFloat(input.overheadPercent) || 0) : 0;
  const overheadCost = ((ingredientTotal + otherCosts + laborCost) * overheadPercent) / 100;

  const batchTotal = ingredientTotal + otherCosts + laborCost + overheadCost;
  const costPerServing = batchTotal / servings;

  const targetPct = input.proMode
    ? Math.min(95, Math.max(1, parseFloat(input.targetFoodCostPercent) || 30))
    : 30;
  // Food cost percentage convention prices against ingredient cost, not fully loaded cost.
  const foodCostPerServing = (ingredientTotal + otherCosts) / servings;
  const suggestedPrice = foodCostPerServing / (targetPct / 100);
  const grossProfitPerServing = suggestedPrice - costPerServing;
  const marginPercent = suggestedPrice > 0 ? (grossProfitPerServing / suggestedPrice) * 100 : 0;
  const batchRevenue = suggestedPrice * servings;
  const batchProfit = batchRevenue - batchTotal;
  const actualFoodCostPercent = suggestedPrice > 0 ? (foodCostPerServing / suggestedPrice) * 100 : 0;

  const valid = lines.filter((l) => !l.error);
  const mostExpensive = valid.length
    ? valid.reduce((max, l) => (l.cost > max.cost ? l : max), valid[0])
    : null;

  return {
    lines,
    ingredientTotal,
    otherCosts,
    laborCost,
    overheadCost,
    batchTotal,
    costPerServing,
    servings,
    mostExpensive,
    errorCount: lines.filter((l) => l.error).length,
    suggestedPrice,
    grossProfitPerServing,
    marginPercent,
    batchRevenue,
    batchProfit,
    actualFoodCostPercent,
  };
};

const money = (n: number, d = 2): string =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

const fmt = (n: number, d = 1): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "How do I calculate the cost of a recipe?",
    answer:
      "Work out what each ingredient costs per unit, then multiply by the amount the recipe actually uses. The step people skip is the unit conversion. You buy flour in a five pound bag but the recipe calls for twelve ounces, so you cannot simply divide the bag price by the number of recipes. Convert both figures to a common unit, divide the purchase price by the purchase quantity to get a cost per gram or per millilitre, then multiply by the quantity used. Add every ingredient together for the batch cost and divide by the number of servings. This calculator does all of that conversion for you and shows the per-ingredient contribution so you can see where the money actually goes.",
  },
  {
    question: "Why can't I convert cups to pounds?",
    answer:
      "Because the conversion depends entirely on what is in the cup. A cup of flour weighs roughly 120 grams, a cup of sugar roughly 200 grams, and a cup of honey roughly 340 grams. Converting between volume and weight requires the density of that specific ingredient, and there is no single factor that works across a pantry. Rather than silently applying a wrong number, this calculator flags the mismatch and asks you to enter both the purchase size and the amount used in the same family of units. If your recipe is in cups and the bag is in pounds, weigh a cup on a kitchen scale once and use that to enter both figures in grams.",
  },
  {
    question: "What is food cost percentage and what should mine be?",
    answer:
      "Food cost percentage is the cost of ingredients divided by the menu price, expressed as a percentage. It is the standard yardstick in the restaurant industry. Most full service restaurants target somewhere between twenty eight and thirty five percent, meaning a dish costing three dollars in ingredients sells for roughly nine to eleven dollars. Bakeries and dessert operations often run lower, in the twenty to twenty five percent range, because ingredient costs are modest relative to labour. Steakhouses and seafood restaurants frequently run higher, sometimes above forty percent, and make the economics work through volume and beverage sales. The right target depends on your labour cost, rent and service model, not on a universal number.",
  },
  {
    question: "Should I include waste in my ingredient costs?",
    answer:
      "Yes, and it is one of the most common reasons a costed recipe understates reality. If a recipe calls for one pound of trimmed vegetables and you lose thirty percent to peel and trim, you must buy roughly one and a half pounds to end up with the pound you need. The same applies to boning meat, hulling berries, and the last unusable portion of a container. This calculator applies waste as a yield adjustment, dividing the amount used by one minus the waste fraction, which correctly scales up the purchase quantity rather than merely adding a percentage to the price. Typical trim losses run around fifteen to twenty percent for root vegetables, twenty five to thirty five percent for leafy greens, and can exceed forty percent for whole fish.",
  },
  {
    question: "How do I price a recipe I want to sell?",
    answer:
      "Start with the ingredient cost per serving, then divide by your target food cost percentage. A dessert costing one dollar eighty in ingredients, at a thirty percent target, prices at six dollars. That is a starting point, not an answer. Check it against what comparable products actually sell for in your market, because a mathematically correct price that nobody will pay is worthless. Then verify that the price still covers your fully loaded cost including labour, packaging and overhead with an acceptable margin left over. Professional Mode does exactly this: it suggests a price from your target percentage and then shows the gross profit and margin once labour and overhead are subtracted.",
  },
  {
    question: "Why is my calculated cost higher than what I expected?",
    answer:
      "Usually because a full costing includes things an informal estimate does not. Small quantities of expensive items add up quickly, and spices, vanilla, good chocolate and speciality flours often turn out to be a larger share of the total than the bulk ingredients. Waste and trim are frequently ignored. Packaging, parchment, energy for a long bake and the cost of a failed batch all belong somewhere. And labour is almost always the largest single omission for anyone selling: an hour and a quarter of work at eighteen dollars adds more than twenty dollars to a batch, which can dwarf the ingredients. The per-ingredient breakdown in the results shows you which items dominate, which is usually the first surprise.",
  },
  {
    question: "How often should I re-cost my recipes?",
    answer:
      "At minimum every quarter, and immediately after any noticeable price movement in a major ingredient. Commodity items such as butter, eggs, flour and cooking oil can move twenty percent or more within a single season, and a recipe costed a year ago may have quietly slipped from a thirty percent food cost to well above forty. Businesses that re-cost regularly catch the drift while it is still a small adjustment. Those that do not tend to discover the problem only when the monthly figures no longer make sense. Keeping purchase prices current in a saved costing sheet takes minutes and is one of the highest return habits in a small food operation.",
  },
  {
    question: "Does this calculator include nutrition information?",
    answer:
      "No. It is purely a cost tool and carries no nutritional database, no calorie or macronutrient data, and no allergen information. It also does not fetch live grocery prices, which means the figures are only as current as the purchase prices you type in. For nutrition labelling, particularly where regulatory compliance is involved, use a dedicated nutrition analysis service or a laboratory. For pricing decisions, combine these numbers with your own market research on what comparable items sell for locally.",
  },
];

export default function RecipeCostCalculator() {
  const [inputs, setInputs] = useState<RecipeInputs>(DEFAULTS);
  const [result, setResult] = useState<RecipeResult>(calculateRecipe(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateRecipe(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof RecipeInputs>(key: K, val: RecipeInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const setIngredient = <K extends keyof Ingredient>(id: number, key: K, val: Ingredient[K]) =>
    setInputs((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) => (i.id === id ? { ...i, [key]: val } : i)),
    }));

  const addIngredient = () =>
    setInputs((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: nextId++,
          name: "",
          purchasePrice: "0",
          purchaseSize: "1",
          purchaseUnit: "lb",
          usedAmount: "0",
          usedUnit: "oz",
          wastePercent: "0",
        },
      ],
    }));

  const removeIngredient = (id: number) =>
    setInputs((prev) => ({
      ...prev,
      ingredients: prev.ingredients.length > 1 ? prev.ingredients.filter((i) => i.id !== id) : prev.ingredients,
    }));

  const tableRows: { rowId: string; label: string; value: string; key?: boolean }[] = [
    ...result.lines.map((l) => ({
      rowId: `ing-${l.id}`,
      label: l.name,
      value: l.error ? l.error : `${money(l.cost)} (${fmt(l.sharePercent, 0)}%)`,
      key: !!result.mostExpensive && l.id === result.mostExpensive.id,
    })),
    { rowId: "subtotal", label: "Ingredient subtotal", value: money(result.ingredientTotal) },
    { rowId: "other", label: "Packaging and other costs", value: money(result.otherCosts) },
    ...(inputs.proMode
      ? [
          { rowId: "labour", label: "Labour", value: money(result.laborCost) },
          { rowId: "overhead", label: "Overhead", value: money(result.overheadCost) },
        ]
      : []),
    { rowId: "servings", label: "Servings per batch", value: `${result.servings}` },
  ];

  const chartData = result.lines
    .filter((l) => !l.error && l.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      name: l.name.length > 14 ? `${l.name.slice(0, 13)}…` : l.name,
      cost: parseFloat(l.cost.toFixed(2)),
    }));

  const costColor = (i: number): string => {
    if (i === 0) return "hsl(0 84% 60%)";
    if (i < 3) return "hsl(25 95% 53%)";
    return "hsl(217 91% 60%)";
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/category/everyday-life" },
          { label: "Recipe Cost Calculator" },
        ]}
      />

      <div className="racira-page-container">
        <h1 className="text-3xl font-bold text-foreground mb-6">Recipe Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ---------------- INPUT PANEL ---------------- */}
          <div className="card-calculator !p-5">
            <div className="space-y-4">
              <div>
                <div className={groupLabel}>Ingredients</div>
                <div className="space-y-3">
                  {inputs.ingredients.map((ing, idx) => (
                    <div key={ing.id} className="rounded-md border border-border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label={`Ingredient ${idx + 1} name`}
                          placeholder={`Ingredient ${idx + 1}`}
                          className={inp}
                          value={ing.name}
                          onChange={(e) => setIngredient(ing.id, "name", e.target.value)}
                        />
                        <button
                          type="button"
                          aria-label="Remove ingredient"
                          title="Remove ingredient"
                          onClick={() => removeIngredient(ing.id)}
                          className="h-10 w-10 shrink-0 rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block" htmlFor={`price-${ing.id}`}>
                            Price paid ($)
                          </label>
                          <input
                            id={`price-${ing.id}`}
                            type="number"
                            step="0.01"
                            className={inp}
                            value={ing.purchasePrice}
                            onChange={(e) => setIngredient(ing.id, "purchasePrice", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block" htmlFor={`size-${ing.id}`}>
                            For this much
                          </label>
                          <div className="flex gap-1">
                            <input
                              id={`size-${ing.id}`}
                              type="number"
                              step="0.01"
                              className={inp}
                              value={ing.purchaseSize}
                              onChange={(e) => setIngredient(ing.id, "purchaseSize", e.target.value)}
                            />
                            <select
                              aria-label="Purchase unit"
                              className={`${inp} w-24`}
                              value={ing.purchaseUnit}
                              onChange={(e) => setIngredient(ing.id, "purchaseUnit", e.target.value as Unit)}
                            >
                              {UNITS.map((un) => (
                                <option key={un.key} value={un.key}>
                                  {un.key}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block" htmlFor={`used-${ing.id}`}>
                          Amount used in recipe
                        </label>
                        <div className="flex gap-1">
                          <input
                            id={`used-${ing.id}`}
                            type="number"
                            step="0.01"
                            className={inp}
                            value={ing.usedAmount}
                            onChange={(e) => setIngredient(ing.id, "usedAmount", e.target.value)}
                          />
                          <select
                            aria-label="Used unit"
                            className={`${inp} w-24`}
                            value={ing.usedUnit}
                            onChange={(e) => setIngredient(ing.id, "usedUnit", e.target.value as Unit)}
                          >
                            {UNITS.filter((un) => un.family === UNIT_MAP[ing.purchaseUnit].family).map((un) => (
                              <option key={un.key} value={un.key}>
                                {un.key}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {showAdvanced && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block" htmlFor={`waste-${ing.id}`}>
                            Trim / yield loss (%)
                          </label>
                          <input
                            id={`waste-${ing.id}`}
                            type="number"
                            className={inp}
                            value={ing.wastePercent}
                            onChange={(e) => setIngredient(ing.id, "wastePercent", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-3 h-10 w-full rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition text-sm font-medium"
                >
                  + Add ingredient
                </button>
              </div>

              <div>
                <label className={lbl} htmlFor="servings">
                  Servings per batch
                </label>
                <input
                  id="servings"
                  type="number"
                  className={inp}
                  value={inputs.servings}
                  onChange={(e) => set("servings", e.target.value)}
                />
              </div>

              {/* -------- TIER 2A -------- */}
              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
              </button>

              {showAdvanced && (
                <div className="space-y-4 border-l-2 border-border pl-4">
                  <div>
                    <div className={groupLabel}>Other Batch Costs</div>
                    <div>
                      <label className={lbl} htmlFor="otherCosts">
                        Packaging, energy, disposables ($)
                      </label>
                      <input
                        id="otherCosts"
                        type="number"
                        step="0.01"
                        className={inp}
                        value={inputs.otherCosts}
                        onChange={(e) => set("otherCosts", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Per-ingredient trim loss fields appear above while Advanced Options is open.
                      </p>
                    </div>
                  </div>

                  {/* -------- TIER 2B -------- */}
                  <div>
                    <div className={groupLabel}>Professional Mode</div>
                    <label className="flex items-center gap-2 text-sm text-foreground mb-3">
                      <input
                        type="checkbox"
                        checked={inputs.proMode}
                        onChange={(e) => set("proMode", e.target.checked)}
                        className="h-4 w-4"
                      />
                      Enable labour, overhead and menu pricing
                    </label>

                    {inputs.proMode && (
                      <div className="space-y-3">
                        <div>
                          <label className={lbl} htmlFor="laborHours">
                            Labour hours per batch
                          </label>
                          <input
                            id="laborHours"
                            type="number"
                            step="0.25"
                            className={inp}
                            value={inputs.laborHours}
                            onChange={(e) => set("laborHours", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="laborRate">
                            Labour rate ($/hour)
                          </label>
                          <input
                            id="laborRate"
                            type="number"
                            step="0.5"
                            className={inp}
                            value={inputs.laborRate}
                            onChange={(e) => set("laborRate", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="overheadPercent">
                            Overhead (% of direct cost)
                          </label>
                          <input
                            id="overheadPercent"
                            type="number"
                            className={inp}
                            value={inputs.overheadPercent}
                            onChange={(e) => set("overheadPercent", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="targetFoodCostPercent">
                            Target food cost (%)
                          </label>
                          <input
                            id="targetFoodCostPercent"
                            type="number"
                            className={inp}
                            value={inputs.targetFoodCostPercent}
                            onChange={(e) => set("targetFoodCostPercent", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Restaurants commonly target 28–35%. Bakeries often 20–25%.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResult(calculateRecipe(inputs))}
                  className="h-10 w-full rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  aria-label="Reset"
                  title="Reset"
                  onClick={() => {
                    setInputs(DEFAULTS);
                    setResult(calculateRecipe(DEFAULTS));
                  }}
                  className="h-10 w-10 shrink-0 rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition flex items-center justify-center"
                >
                  ↺
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- RESULTS ---------------- */}
          <div className="space-y-5">
            {/* 1. PRIMARY */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-medium text-muted-foreground mb-1">Cost per serving</div>
              <div className="text-4xl font-bold text-primary">{money(result.costPerServing)}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {money(result.batchTotal)} for the whole batch of {result.servings} servings
              </div>
            </div>

            {result.errorCount > 0 && (
              <div className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4 text-sm text-foreground">
                {result.errorCount} ingredient{result.errorCount > 1 ? "s" : ""} could not be costed. Weight and volume
                cannot be converted without a density, so enter both the purchase size and the amount used in the same
                family of units.
              </div>
            )}

            {/* 2. STAT BAR */}
            <div className="flex items-stretch bg-muted/30 rounded-lg divide-x divide-border">
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Ingredients</div>
                <div className="text-lg font-bold text-green-600">{money(result.ingredientTotal)}</div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Batch total</div>
                <div className="text-lg font-bold text-orange-500">{money(result.batchTotal)}</div>
              </div>
              <div className="flex-1 p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Priciest item</div>
                <div className="text-lg font-bold text-red-500">
                  {result.mostExpensive ? money(result.mostExpensive.cost) : "—"}
                </div>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="card-calculator !p-0 overflow-hidden">
              <div className="px-5 pt-4 pb-2 text-sm font-bold text-foreground">Cost Breakdown</div>
              <table className="w-full text-base">
                <tbody>
                  {tableRows.map((r) => (
                    <tr
                      key={r.rowId}
                      className={`border-t border-border ${r.key ? "bg-secondary/20 font-semibold" : ""}`}
                    >
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{r.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5 px-3 text-foreground">Total cost per serving</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{money(result.costPerServing)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="card-calculator !p-4">
              <div className="text-sm font-bold text-foreground mb-3">Where the Money Goes</div>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RBar data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 85%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RTooltip formatter={(v: number) => money(v)} />
                      <Bar dataKey="cost" name="Ingredient cost" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={d.id} fill={costColor(i)} />
                        ))}
                      </Bar>
                    </RBar>
                  </ResponsiveContainer>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(0 84% 60%)" }} />
                  Largest cost
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(25 95% 53%)" }} />
                  Top three
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                  Remaining ingredients
                </span>
              </div>
            </div>

            {/* PRO MODE SECTION */}
            {inputs.proMode && (
              <div className="card-calculator !p-5">
                <div className="text-sm font-bold text-foreground mb-3">Menu Pricing &amp; Margin</div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-base">
                  <span className="text-muted-foreground">Suggested menu price</span>
                  <span className="text-right text-foreground">{money(result.suggestedPrice)}</span>
                  <span className="text-muted-foreground">Food cost achieved</span>
                  <span className="text-right text-foreground">{fmt(result.actualFoodCostPercent, 1)}%</span>
                  <span className="text-muted-foreground">Gross profit per serving</span>
                  <span
                    className={`text-right ${
                      result.grossProfitPerServing >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {money(result.grossProfitPerServing)}
                  </span>
                  <span className="text-muted-foreground">Margin after labour and overhead</span>
                  <span className="text-right text-foreground">{fmt(result.marginPercent, 1)}%</span>
                  <span className="text-muted-foreground">Batch revenue at this price</span>
                  <span className="text-right text-foreground">{money(result.batchRevenue)}</span>
                  <span className="font-semibold text-foreground">Batch profit</span>
                  <span
                    className={`text-right font-semibold ${
                      result.batchProfit >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {money(result.batchProfit)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  The suggested price applies your target percentage to ingredient and packaging cost, following
                  standard food cost convention. The margin line then subtracts labour and overhead so you can see
                  what actually remains.
                </p>
              </div>
            )}

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold text-foreground mb-3">Summary Statistics</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                {tableRows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-foreground font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-3 sm:col-span-2 border-t border-border pt-2 mt-1">
                  <span className="font-bold text-foreground">Total cost per serving</span>
                  <span className="font-bold text-foreground">{money(result.costPerServing)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SEO ---------------- */}
        <div className="prose-finance text-[15.75px] max-w-[1180px] mt-10 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">How to Cost a Recipe Properly</h2>
            <p>
              Costing a recipe accurately comes down to one principle: the price you paid and the quantity you used
              are almost never expressed in the same unit, and the gap between them is where most errors live. You buy
              flour in a five pound bag, butter by the pound, milk by the gallon and eggs by the dozen, but a recipe
              asks for twelve ounces, one stick, a cup and a half, and four eggs. Every one of those needs converting
              before the arithmetic works.
            </p>
            <p>
              The method is to reduce each ingredient to a cost per base unit. Divide what you paid by the quantity
              you received, both converted to grams for weight items or millilitres for liquids, and you have a cost
              per gram or per millilitre. Multiply that by the quantity the recipe consumes, converted the same way,
              and you have the true cost of that ingredient in this dish. Repeat for every line, sum them, and divide
              by the number of servings.
            </p>
            <p>
              This calculator performs those conversions automatically across eleven common units. It deliberately
              refuses to convert between weight and volume, because that conversion requires the density of the
              specific ingredient and no universal factor exists. A cup of flour and a cup of honey differ in weight
              by nearly a factor of three, so guessing would produce a confidently wrong answer rather than an honest
              prompt to enter matching units.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Yield Loss, Trim and the Costs People Forget</h2>
            <p>
              A recipe that calls for one pound of diced onion does not mean you buy one pound of onions. Peel, root
              and the outer layer account for roughly ten to fifteen percent of the weight, so you need to purchase
              closer to one and a sixth pounds to end up with the pound the recipe needs. Leafy greens can lose a
              quarter to a third of their purchased weight to stems and damaged leaves, and whole fish routinely lose
              more than forty percent between the counter and the pan.
            </p>
            <p>
              The correct treatment is to divide the required quantity by one minus the loss fraction, which scales
              the purchase quantity up. Adding a percentage to the price instead is a common shortcut that produces a
              slightly different and slightly wrong answer, understating the true cost. Advanced Options exposes a
              yield loss field for each ingredient so you can apply the appropriate figure item by item rather than
              guessing at a blanket allowance.
            </p>
            <p>
              Beyond trim, several costs habitually go missing. Packaging and disposables, the energy for a long bake
              or a slow braise, the small quantities of expensive items such as vanilla, saffron or good chocolate
              that feel negligible individually, and the occasional failed batch that still consumed ingredients. The
              per-ingredient breakdown makes the first of these visible immediately, and the other batch costs field
              gives the rest a home.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Pricing for a Food Business</h2>
            <p>
              Anyone selling what they cook needs two numbers, not one. The first is food cost per serving, which
              covers ingredients and packaging and drives the menu price through the food cost percentage convention.
              Divide the food cost by your target percentage to get the price: a serving costing one dollar eighty at
              a thirty percent target prices at six dollars. Most full service restaurants sit between twenty eight
              and thirty five percent, bakeries often lower at twenty to twenty five, and steak or seafood operations
              frequently higher.
            </p>
            <p>
              The second number is fully loaded cost, which adds labour and overhead. This is where many small food
              businesses discover their problem. An hour and a quarter of preparation at eighteen dollars an hour adds
              more than twenty two dollars to a batch, which for a twelve serving recipe is nearly two dollars per
              serving, potentially exceeding the ingredient cost entirely. Professional Mode calculates both, showing
              the suggested price from your food cost target alongside the margin that actually remains once labour
              and overhead are subtracted.
            </p>
            <p>
              A price that satisfies the arithmetic but exceeds what your market will pay is not a viable price. Use
              the suggested figure as a floor for what you can afford to charge, then check it against comparable
              products locally. If the market price sits below your calculated floor, the answer is to change the
              recipe, the portion size or the process, not to sell at a loss and hope volume compensates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">Keeping Costings Current</h2>
            <p>
              Ingredient prices move, sometimes sharply. Butter, eggs, flour and cooking oil have each seen swings
              well beyond twenty percent within a single year in recent memory. A recipe costed twelve months ago and
              never revisited may have drifted from a healthy thirty percent food cost to something well above forty
              without anyone noticing, and the first visible symptom is usually a month of disappointing figures with
              no obvious cause.
            </p>
            <p>
              Re-costing quarterly, and immediately after any significant price movement in a major ingredient, keeps
              the drift small enough to correct with a modest price adjustment or a recipe tweak. It takes only a few
              minutes once the ingredient list is set up, and it is among the highest return habits available to a
              small food operation.
            </p>
            <p>
              Note the boundaries of this tool. It carries no nutritional data, no allergen information and no live
              grocery pricing, so the figures reflect exactly the purchase prices you enter and nothing more. For
              nutrition labelling, particularly where regulation applies, use a dedicated analysis service. For
              pricing, combine these numbers with real observation of what comparable items sell for in your market.
            </p>
          </section>
        </div>

        <div className="max-w-[1180px] mt-10">
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/recipe-cost-calculator" />
        </div>

        <div className="max-w-[1180px] mt-10">
          <PopularCalculators exclude="/calculator/recipe-cost-calculator" />
        </div>

        <div className="max-w-[1180px] mt-8 text-sm text-muted-foreground">
          Related:{" "}
          <Link href="/category/everyday-life" className="text-primary hover:underline">
            more everyday life calculators
          </Link>
        </div>
      </div>
    </>
  );
}
