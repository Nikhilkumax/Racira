const fs = require('fs');
const path = require('path');

// The 341 components that are isBuilt: false — we want to flip their registry entry to live
const TARGET_COMPONENTS = [
  'AquariumVolumeCalculator','AreaConverter','AutoLeaseCalculator','AvogadrosNumberCalculator',
  'BakingConversionCalculator','BakingIngredientConverter','BarbellPlateCalculator','BarometricPressureCalculator',
  'BaseballBattingAverageCalculator','BaseballEraCalculator','BaseballFieldingCalculator','BaseballOBPCalculator',
  'BaseballSluggingCalculator','BaseConversionCalculator','BasketballPerCalculator','BasketballShootingPercentageCalculator',
  'BilliardsHandicapCalculator','BinaryDecimalCalculator','BinaryTextConverter','BinomialDistributionCalculator',
  'BitwiseOperationsCalculator','BlindSizeCalculator','BoilingPointElevationCalculator','BounceRateCalculator',
  'BowlingHandicapCalculator','BoylesLawCalculator','BraSizeConverter','BufferSolutionCalculator',
  'BuoyancyCalculator','CakeServingCalculator','CandleBurnTimeCalculator','CapacitanceCalculator',
  'CarbonDatingCalculator','CarDepreciationCalculator','CatAgeCalculator','CateringQuantityCalculator',
  'CdCalculatorFull','CeilingFloorCalculator','CharlesLawCalculator','ClothingSizeConverter',
  'ClothingSizeConverterAdvanced','CoefficientOfVariationCalculator','CoffeeStrengthCalculator','CombinedGasLawCalculator',
  'CompletingTheSquareCalculator','ComplexNumbersCalculator','ConcentrationCalculator','ConeCalculator',
  'ConversionCalculator','CookingMeasurementConverter','CookingTemperatureConverter','CookingTimeCalculator',
  'CoordinateGeometryCalculator','CorrelationCoefficientCalculator','CoulombsLawCalculator','CountdownCalculator',
  'CovarianceCalculator','CrochetHookConverter','CryptoCurrencyConverter','CssSwimmingCalculator',
  'CsuGpaCalculator','CubeRootCalculator','CurrentDividerCalculator','CustomerLifetimeValueCalculator',
  'CustomerRetentionRateCalculator','CyclingCadenceCalculator','CyclingSpeedCalculator','CyclingWattageCalculator',
  'CylinderCalculator','DataSizeConverter','DataTransferConverter','DateDifferenceCalculator',
  'DaylightSavingCalculator','DebtServiceCoverageCalculator','DecibelCalculator','DecileCalculator',
  'DecimalToFractionConverter','DecimalToHexConverter','DensityConverter','DerivativeCalculator',
  'DiceRoller','DilutionCalculator','DirectVariationCalculator','DisplacementCalculator',
  'DogAgeCalculator','DomainValuationCalculator','DotsScoreCalculator','DrinkingWaterFluorideDoseCalculator',
  'DrivewaySealerCalculator','DupontAnalysisCalculator','EfficiencyCalculator','EigenvalueCalculator',
  'ElectricFieldCalculator','ElectricityBillCalculator','ElectricPowerCalculator','EllipseCalculator',
  'EmailOpenRateCalculator','EmpiricalFormulaCalculator','EnergyConverter','EpochTimeConverter',
  'EquilibriumConstantCalculator','ExponentialDecayCalculator','ExponentialGrowthCalculator','FertilizerCalculator',
  'FhaMipCalculator','FifteenVsThirtyMortgageCalculator','FirewoodCordCalculator','FiveYearOwnershipCostCalculator',
  'FlightTimeCalculator','FloorAreaCalculator','FlowRateConverter','FluidFlowCalculator',
  'FoodCostCalculator','FoodMilesCalculator','ForceConverter','Four01kGrowthCalculator',
  'Four03bGrowthCalculator','Four57bPlanCalculator','FourPercentRuleCalculator','FractionalDistillationCalculator',
  'FractionToDecimalConverter','FreezingPointDepressionCalculator','FrequencyConverter','FrequencyWavelengthCalculator',
  'FuelEconomyConverter','FunctionCompositionCalculator','GardenFertilizerCalculator','GeometricMeanCalculator',
  'GeometricProgressionCalculator','GestationCalculator','GiftCostPerPersonCalculator','GmatScoreCalculator',
  'GolfHandicapCalculator','GrassSeedCalculator','GravitationalForceCalculator','GreeksCalculator',
  'GrillingTimeCalculator','GstCalculator','GutterSizeCalculator','HeaterSizeCalculator',
  'HeightCalculator','HexToDecimalConverter','HomeCoolingCostCalculator','HomeHeatingCostCalculator',
  'HomeLoanEmiIndia','HotelCostCalculator','HpToKwCalculator','HumidityCalculator',
  'HydraulicRetentionTimeCalculator','IbGradeCalculator','IdealGasLawCalculator','IlluminanceConverter',
  'InductanceCalculator','InequalityCalculator','IntegralCalculator','InverseVariationCalculator',
  'JudoPointsCalculator','K401Calculator','KendallTauCalculator','KnittingNeedleConverter',
  'KruskalWallisTestCalculator','LandLoanPaymentCalculator','LawnMowingTimeCalculator','LawnSeedingCalculator',
  'LawOfCosinesCalculator','LawOfSinesCalculator','LcResonanceCalculator','LeanWastePercentageCalculator',
  'LeapYearCalculator','LightingLumensCalculator','LimitCalculator','LimitingReagentCalculator',
  'LinearRegressionCalculator','LoanDefermentInterestCalculator','LoanToCostRatioCalculator','LogarithmChangeOfBaseCalculator',
  'LogisticRegressionCalculator','LoyaltyPointsCalculator','LsatScoreCalculator','LuminanceConverter',
  'MagneticFieldCalculator','MarginOfErrorCalculator','MassDefectCalculator','MatrixDeterminantCalculator',
  'MatrixInverseCalculator','MatrixMultiplicationCalculator','McatScoreCalculator','MeatlessDietImpactCalculator',
  'MeetingTimeZoneCalculator','MicrowaveWattageConversionCalculator','ModifiedDurationCalculator','MolalityCalculator',
  'MolarMassCalculator','MonthsCalculator','MorseCodeTranslator','MpgCalculator',
  'MulchCostCalculator','MultipleRegressionCalculator','NetPromoterScoreCalculator','NetWorthTrackerCalc',
  'NormalityCalculator','NpvCalculator','NumberToWordsConverter','OsmolarityCalculator',
  'OvenTemperatureConverter','OvertimeHoursCalculator','OxbridgeInterviewCalculator','PackingWeightCalculator',
  'PercentileCalculator','PercentYieldCalculator','PetFoodCalculator','PhCalculator',
  'PhotonEnergyCalculator','PlantSpacingCalculator','PlywoodCalculator','PoissonDistributionCalculator',
  'PolygonAreaCalculator','PolygonCalculator','PoolVolumeCalculator','PottingSoilCalculator',
  'PowerConverter','PowerFactorCalculator','PpiCalculator','PregnancyWeightTargetCalculator',
  'PressureCalculator','PressureConverter','ProjectileMotionCalculator','ProjectorScreenSizeCalculator',
  'PsuCalculator','PutCallParityCalculator','QbRatingCalculator','QuarterToSemesterCreditCalculator',
  'RaceTimePredictor','RadiationDoseConverter','RadioactiveDecayCalculator','RadioactivityConverter',
  'RainwaterCollectionCalculator','RcTimeConstantCalculator','ReadingTimeCalculator','RealEstateCalculatorFull',
  'RecipeScaleCalculator','RefrigeratorEnergyCalculator','ReplenishmentLeadTimeCalculator','ResistorsInParallelCalculator',
  'ResistorsInSeriesCalculator','ReturnOnCapitalEmployedCalculator','RiemannSumCalculator','RightAngleCalculator',
  'RingSizeCalculator','RingSizeConverterAdvanced','RlTimeConstantCalculator','RoadTripCostCalculator',
  'RomanNumeralConverter','RoofShingleCalculator','RoomVolumeCalculator','RootMeanSquareCalculator',
  'RunningCadenceCalculator','RunningStrideLengthCalculator','SalesPriceCalculator','SalesTaxCalculator',
  'ScientificNotationConverter','SectorAreaCalculator','SetOperationsCalculator','ShoeSizeConverter',
  'ShoppingBudgetCalculator','SimplePendulumCalculator','SinclairCoefficientCalculator','SnellsLawCalculator',
  'SnowShovelingCalculator','SolarPanelCalculator','SpeakerPlacementCalculator','SpearmanRankCorrelationCalculator',
  'SpecificHeatCalculator','SpeedDistanceTimeCalculator','SphereCalculator','SpringConstantCalculator',
  'SslCostCalculator','StakingRewardsCalculator','StoichiometryCalculator','StudentBudgetCalculator',
  'SwimmingPaceCalculator','SwimmingSplitCalculator','SwimmingTimeConversion','SwolfCalculator',
  'SymmetricStrengthCalculator','SystemOfEquationsCalculator','TaylorSeriesCalculator','TeaSteepingCalculator',
  'TennisFirstServeCalculator','TennisServeSpeedCalculator','TenYearAveragingDistributionCalculator','TenYearOwnershipCostCalculator',
  'TextBinaryConverter','ThermalExpansionCalculator','ThreeDPrintCharts','ThreeDPrintTimeCalculator',
  'TidalPredictionCalculator','TimeConverter','TimeDifferenceCalculator','TitrationCalculator',
  'TorqueConverter','TransformerCalculator','TravelBudgetCalculator','TravelInsuranceCalculator',
  'TreadmillPaceCalculator','TriathlonTimeCalculator','TruthTableCalculator','TssCalculator',
  'TuitionRoiCalculator','TurkeyRoastingCalculator','TvViewingDistanceCalculator','TwoComplementCalculator',
  'TypingSpeedCalculator','UcGpaCalculator','UrlDecoder','UrlEncoder',
  'UvIndexCalculator','VaporPressureCalculator','VatCalculator','VectorCrossProductCalculator',
  'VectorOperationsCalculator','VisaFeeCalculator','ViscerialFatCalculator','ViscosityDynamicConverter',
  'ViscosityKinematicConverter','VoltageDividerCalculator','VolumeConverter','WallAreaCalculator',
  'WallpaperCalculator','WaterBillCalculator','WavelengthCalculator','WeeksCalculator',
  'WeightedAverageCalculator','WellsScoreForDvtCalculator','WilcoxonSignedRankTestCalculator','WilksScoreCalculator',
  'WindowCurtainCalculator','WindSpeedPowerCalculator','WorkHoursCalculator','WorkPowerCalculator',
  'YarnWeightConverter'
];

// Convert PascalCase component name → kebab-case slug
function toSlug(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const REGISTRY_DIR = path.join(__dirname, '../src/domains/calculator/registry');
const registryFiles = fs.readdirSync(REGISTRY_DIR).filter(f => f.endsWith('.ts'));

let totalFlipped = 0;
let notFound = [];

for (const comp of TARGET_COMPONENTS) {
  const slug = toSlug(comp);
  let found = false;

  for (const file of registryFiles) {
    const filePath = path.join(REGISTRY_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Look for this slug with status: 'soon' and flip to 'live'
    // Pattern: slug: 'some-slug', ... status: 'soon'
    // We use a regex that matches the slug and then the nearest status: 'soon'
    const slugPattern = new RegExp(
      `(slug:\\s*['"\`]${slug}['"\`][^}]*?status:\\s*['"\`])soon(['"\`])`,
      's'
    );

    if (slugPattern.test(content)) {
      const updated = content.replace(slugPattern, '$1live$2');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`✅ Flipped: ${comp} (${slug}) in ${file}`);
      totalFlipped++;
      found = true;
      break;
    }
  }

  if (!found) {
    notFound.push(comp);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Flipped to live: ${totalFlipped}`);
console.log(`❌ Not found in any registry: ${notFound.length}`);
if (notFound.length > 0) {
  console.log('\nNot found:');
  notFound.forEach(n => console.log(`  • ${n}`));
}
