const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');

const polishFiles = [
    'RehabLoan203kEstimatorCalculator.tsx',
    'PonderalIndexCalculator.tsx',
    'SyntaxScoreComplexityCalculator.tsx',
    'LowCarbDietAdherenceScoreCalculator.tsx',
    'ThyroidRiskScoreCalculator.tsx',
    'CardiovascularRiskScoreCalculator.tsx',
    'CalorieToProteinRatioCalculator.tsx',
    'CalorieToNutrientDensityRatioCalculator.tsx',
    'ProteinToCalorieRatioCalculator.tsx',
    'UltraProcessedFoodPercentageCalculator.tsx',
    'CalorieCyclingCalculator.tsx',
    'CuttingCalorieCalculator.tsx',
    'BulkingCalorieCalculator.tsx',
    'MealFrequencyCalorieSplitCalculator.tsx',
    'MaintenanceCalorieCalculator.tsx',
    'CalorieDeficitForWeightLossCalculator.tsx',
    'CalorieSurplusForWeightGainCalculator.tsx',
    'MacronutrientCalorieDistributionCalculator.tsx',
    'RestaurantMealCalorieEstimator.tsx',
    'CarbToInsulinRatioCalculator.tsx',
    'BloodGlucoseToCarbRatioEstimator.tsx',
    'SportsDrinkCarbConcentrationCalculator.tsx',
    'CarbohydrateCalculator.tsx',
    'CarbCyclingCalculator.tsx',
    'LowCarbThresholdCalculator.tsx',
    'BasalMetabolicRateBmrKatchMcardleCalculator.tsx',
    'CarbohydrateGramsCalculator.tsx',
    'NetCarbsCalculator.tsx',
    'CarbohydrateLoadingCalculator.tsx',
    'PercentageBasedVolumeCalculator.tsx',
    'RpeToPercentageCalculator.tsx',
    'RepetitionMaxPercentageCalculator.tsx',
    'BodyAdiposityIndexBaiCalculator.tsx',
    'WaistToHeightRatioCalculator.tsx',
    'ChildPughScoreCalculator.tsx',
    'FfmiFatFreeMassIndexCalculator.tsx',
    'IdealWeightCalculatorForWomen.tsx',
];

let successCount = 0;
let failCount = 0;

for (const file of polishFiles) {
    const filePath = path.join(COMPONENTS_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.log('NOT FOUND: ' + file);
        failCount++;
        continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern: <div className="flex gap-3 mt-4..."> <button ... onClick={handleReset} ...> <RotateCcw .../> Reset XXX </button> </div>
    // Replace with Calculate + icon-only Reset

    const resetButtonRegex = /<div className="flex gap-3 mt-4[^"]*">\s*<button type="button" onClick=\{handleReset\} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">\s*<RotateCcw className="h-4 w-4 mr-2" \/>\s*[^<]+\s*<\/button>\s*<\/div>/;

    const newBlock = `<div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>`;

    if (resetButtonRegex.test(content)) {
        content = content.replace(resetButtonRegex, newBlock);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('FIXED: ' + file);
        successCount++;
    } else {
        console.log('PATTERN NOT MATCHED: ' + file);
        failCount++;
    }
}

console.log('\n=== SUMMARY ===');
console.log('Success: ' + successCount);
console.log('Failed: ' + failCount);