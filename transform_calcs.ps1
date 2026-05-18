
$files = @(
  "ACTScoreCalculator","AgeCalculator","AudioFileSizeCalculator","AwsS3CostCalculator",
  "BalanceTransferCalculator","BalloonMortgageCalculator","BiodiversityIndexCalculator",
  "BridgeLoanCalculator","CapitalGainsTaxCalculator","CollegeSavingsCalculator",
  "CommercialLoanCalculator","ConstructionLoanDrawCalculator","ContrastRatioCalculator",
  "CreditScoreEstimator","CronExpressionCalculator","CumulativeGPACalculator",
  "DataStorageConverter","DividendReinvestmentCalculator",
  "DockerImageSizeCalculator","DtiCalculator","EcologicalFootprintCalculator",
  "EnergyEfficientApplianceCalculator","EstateTaxCalculator","FinalGradeCalculator",
  "FontSizeConverter","GitRepoSizeCalculator","GREScoreCalculator",
  "HardMoneyLoanCalculator","HashCalculator","HourlyToSalaryCalculator",
  "ImageFileSizeCalculator","InterestOnlyMortgageCalculator","LedSavingsCalculator",
  "MarriageTaxCalculator","MeatlessDietImpactCalculator","MinimumPaymentCalculator",
  "NetPayCalculator","NetWorthCalculator","PaperSavingsCalculator",
  "PasswordEntropyCalculator","PasswordGenerator","PayrollTaxCalculator",
  "PensionCalculator","PmiCalculator","PointsBreakEvenCalculator",
  "PomodoroCalculator","PopulationGrowthEcologyCalculator","QuarterlyTaxCalculator",
  "ReadingSpeedCalculator","RegexTestCalculator","ReverseMortgageCalculator",
  "SATScoreCalculator","SelfEmploymentTaxCalculator","SocialSecurityCalculator",
  "StepperMotorCalculator","StudentLoanPayoffCalculator","StudyTimeCalculator",
  "TaxBracketCalculator","TaxRefundCalculator","ThreeDPrintTimeCalculator",
  "VideoFileSizeCalculator","VpsPricingCalculator","W4WithholdingCalculator",
  "WasteDiversionCalculator","WeightedGradeCalculator"
)

$calcBtn = @"

              <button
                onClick={handleCalculate}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Calculate
              </button>
"@

$updated = 0
$skipped = 0
$errors = @()

foreach ($name in $files) {
  $path = "src/calculators/$name.tsx"
  
  if (-not (Test-Path $path)) {
    $errors += "$($name): file not found"
    continue
  }
  
  $content = [System.IO.File]::ReadAllText($path)
  
  # Skip if already has the calculate button pattern
  if ($content -match "showResults" -or $content -match "handleCalculate") {
    $skipped++
    continue
  }

  $original = $content

  # --- Step 1: Add showResults state ---
  # Insert after: const [results, setResults] = useState<...>(...);
  if ($content -match 'const \[results, setResults\] = useState') {
    $content = [regex]::Replace(
      $content,
      '(const \[results, setResults\] = useState[^\n]+\n)',
      { param($m) $m.Value + "  const [showResults, setShowResults] = useState(false);`n" }
    )
  }

  # --- Step 2: Rename calculate() -> handleCalculate, add setShowResults(true) at top ---
  if ($content -match 'const calculate = \(\) => \{') {
    $content = [regex]::Replace(
      $content,
      'const calculate = \(\) => \{',
      "const handleCalculate = () => {`n    setShowResults(true);"
    )
    # Update internal calls to calculate() -> handleCalculate()
    $content = $content -replace '\bcalculate\(\)', 'handleCalculate()'
  }

  # --- Step 3: Remove useEffect auto-triggers (with deps) ---
  $content = [regex]::Replace(
    $content,
    '(?s)\s+useEffect\(\(\) => \{\s*handleCalculate\(\);\s*\}, \[[^\]]+\]\);',
    ''
  )
  # Also handle: useEffect(() => { calculate(); }, [...])
  $content = [regex]::Replace(
    $content,
    '(?s)\s+useEffect\(\(\) => \{\s*calculate\(\);\s*\}, \[[^\]]+\]\);',
    ''
  )

  # --- Step 4: Add Calculate button before the Reset button ---
  # Change "flex justify-end" to "flex gap-3" and insert calculate btn before reset
  $content = $content -replace 'className="mt-8 flex justify-end"', 'className="mt-8 flex gap-3 items-center"'
  
  # Insert calculate button just before the reset button
  if ($content -match '<button onClick=\{reset\}') {
    $content = $content -replace '(<button onClick=\{reset\})', ($calcBtn + '$1')
  }

  # --- Step 5: Wrap result blocks in showResults check ---
  $content = $content -replace '\{results && \(', '{showResults && results && ('
  $content = $content -replace '\{results && <', '{showResults && results && <'

  # --- Step 6: Reset clears showResults ---
  if ($content -match 'const reset = \(\) => \{') {
    $content = $content -replace 'const reset = \(\) => \{', "const reset = () => {`n    setShowResults(false);"
  }

  if ($content -ne $original) {
    [System.IO.File]::WriteAllText($path, $content)
    $updated++
  } else {
    $skipped++
  }
}

Write-Host "Updated: $updated"
Write-Host "Skipped: $skipped"
if ($errors.Count -gt 0) {
  Write-Host "Errors:"
  $errors | ForEach-Object { Write-Host "  $_" }
}
