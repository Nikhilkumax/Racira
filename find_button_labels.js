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

for (const file of polishFiles) {
    const filePath = path.join(COMPONENTS_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.log('NOT FOUND: ' + file);
        continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Find lines with "Reset" or "Calculate" button text (not in comments/SEO)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for button onClick handlers
        if (line.includes('onClick={handleCalculate') || line.includes('onClick={handleReset') || line.includes('onClick={() => handleCalculate') || line.includes('onClick={() => handleReset')) {
            // Print this line and next 3 lines for context
            console.log('\n=== ' + file + ' (L' + (i + 1) + ') ===');
            for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 4); j++) {
                console.log('  L' + (j + 1) + ': ' + lines[j].trim().substring(0, 200));
            }
        }
    }
}