const fs = require('fs');
const path = require('path');

const calcDir = path.join(__dirname, 'src', 'calculators');
const files = [
  "ACTScoreCalculator.tsx",
  "AudioFileSizeCalculator.tsx",
  "AwsS3CostCalculator.tsx",
  "BalanceTransferCalculator.tsx",
  "BalloonMortgageCalculator.tsx",
  "BiodiversityIndexCalculator.tsx",
  "BridgeLoanCalculator.tsx",
  "CapitalGainsTaxCalculator.tsx",
  "CollegeSavingsCalculator.tsx",
  "CommercialLoanCalculator.tsx",
  "ConstructionLoanDrawCalculator.tsx",
  "CreditScoreEstimator.tsx",
  "CumulativeGPACalculator.tsx",
  "DataStorageConverter.tsx",
  "DensityCalculator.tsx",
  "DtiCalculator.tsx",
  "EcologicalFootprintCalculator.tsx",
  "EnergyEfficientApplianceCalculator.tsx",
  "EstateTaxCalculator.tsx",
  "FinalGradeCalculator.tsx",
  "FontSizeConverter.tsx",
  "ForceCalculator.tsx",
  "GitRepoSizeCalculator.tsx",
  "GREScoreCalculator.tsx",
  "HardMoneyLoanCalculator.tsx",
  "HourlyToSalaryCalculator.tsx",
  "ImageFileSizeCalculator.tsx",
  "InterestOnlyMortgageCalculator.tsx",
  "IrrCalculator.tsx",
  "JitterCalculator.tsx",
  "LedSavingsCalculator.tsx",
  "MarriageTaxCalculator.tsx",
  "MeatlessDietImpactCalculator.tsx",
  "MinimumPaymentCalculator.tsx",
  "NetPayCalculator.tsx",
  "NetWorthCalculator.tsx",
  "OhmsLawCalculator.tsx",
  "PaperSavingsCalculator.tsx",
  "PayrollTaxCalculator.tsx",
  "PensionCalculator.tsx",
  "PmiCalculator.tsx",
  "PointsBreakEvenCalculator.tsx",
  "PomodoroCalculator.tsx",
  "PopulationGrowthEcologyCalculator.tsx",
  "QuarterlyTaxCalculator.tsx",
  "RegexTestCalculator.tsx",
  "ReverseMortgageCalculator.tsx",
  "RoasCalculator.tsx",
  "SATScoreCalculator.tsx",
  "SelfEmploymentTaxCalculator.tsx",
  "SocialSecurityCalculator.tsx",
  "SpeedDistanceTimeCalculator.tsx",
  "StepperMotorCalculator.tsx",
  "StudentLoanPayoffCalculator.tsx",
  "StudyTimeCalculator.tsx",
  "TaxBracketCalculator.tsx",
  "TaxRefundCalculator.tsx",
  "ThreeDPrintTimeCalculator.tsx",
  "TimeDurationCalculator.tsx",
  "VideoFileSizeCalculator.tsx",
  "VpsPricingCalculator.tsx",
  "W4WithholdingCalculator.tsx",
  "WasteDiversionCalculator.tsx",
  "WeightedGradeCalculator.tsx"
];

for (const file of files) {
    const filePath = path.join(calcDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Look for the div containing the reset button
    // Common pattern: <div className="mt-8 flex gap-3 items-center pt-4 border-t border-border">
    // or similar
    
    const divMatch = content.match(/<div className="mt-8 flex gap-3[^>]*>/);
    if (divMatch) {
        const divIndex = divMatch.index + divMatch[0].length;
        
        // Determine button text based on file name or default to "Calculate"
        let btnText = "Calculate";
        if (file.includes("Score")) btnText = "Calculate Score";
        else if (file.includes("Tax")) btnText = "Calculate Tax";
        else if (file.includes("Loan")) btnText = "Calculate Loan";
        else if (file.includes("Grade")) btnText = "Calculate Grade";
        
        const newButton = `\n                <button onClick={handleCalculate} className="btn-calculate flex-1">${btnText}</button>`;
        
        // Check if button is already there (paranoia)
        if (!content.includes('onClick={handleCalculate}')) {
             content = content.slice(0, divIndex) + newButton + content.slice(divIndex);
             fs.writeFileSync(filePath, content, 'utf8');
             console.log(`✓ Restored button in ${file}`);
        } else {
             console.log(`! Button already exists in ${file}`);
        }
    } else {
        console.log(`? Could not find insertion point in ${file}`);
    }
}
