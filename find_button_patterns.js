const fs = require('fs');
const path = require('path');

const dir = 'src/domains/calculator/components';

const polishList = [
    'AbsorptionCostingVsVariableCostingProfitComparison', 'AlternatorOutputCalculator', 'AltitudeCalculator', 'AltmanZScoreCalculator',
    'AmazonFbaCalculator', 'AndroidVsGynoidEstimator', 'AngelInvestmentReturnCalculator', 'AngleConverter',
    'AnnualRecurringRevenueCalculator', 'AnnualSalaryToHourlyRateCalculator', 'AnnuityCalculator', 'AnnuityPayoutCalculator',
    'AprToEarCalculator', 'ArcLengthCalculator', 'ArithmeticProgressionCalculator', 'ArmVsFixedRateCalculator',
    'AssetCoverageRatioCalculator', 'AssetTurnoverRatioCalculator', 'AthleteBmiCalculator', 'AutoLoanRefinanceSavingsCalculator',
    'AverageCalculator', 'AverageRevenuePerUserCalculator', 'BabyGrowthPercentileCalculator', 'BackdoorRothIraCalculator',
    'BaristaFireCalculator', 'BasalMetabolicRateBmrKatchMcardleCalculator', 'BatteryLifeCalculator', 'BitcoinMiningCalculator',
    'BiweeklyVsMonthlyLoanComparison', 'BloodDonationCalculator', 'BloodGlucoseToCarbRatioEstimator', 'BMIToBodyFatCalculator',
    'BodyAdiposityIndexBaiCalculator', 'BodyFatNavyMethodCalculator', 'BodyFatPercentageCalculator', 'BodyFatSkinfoldCalculator',
    'BodyMassIndexCalculator', 'BondedWarehouseCostCalculator', 'BonusPercentageCalculator', 'BoxingCalorieCalculator',
    'BrakeHorsepowerCalculator', 'BrakingDistanceCalculator', 'BreakBulkCargoCostCalculator', 'BreakEvenCalculator',
    'BreakEvenMileageCalculator', 'BreastfeedingCalorieCalculator', 'BudgetCalculator', 'BulkingCalorieCalculator',
    'BurnRateCalculator', 'BusinessLoanCalculator', 'BusinessValuationCalculator', 'CaffeineCalculator',
    'CaffeineHalfLifeCalculator', 'CalorieCyclingCalculator', 'CalorieDeficitCalculator', 'CalorieDeficitForWeightLossCalculator',
    'CalorieSurplusForWeightGainCalculator', 'CalorieToNutrientDensityRatioCalculator', 'CalorieToProteinRatioCalculator', 'CapRateCalculator',
    'CarbCyclingCalculator', 'CarbohydrateCalculator', 'CarbohydrateGramsCalculator', 'CarbohydrateLoadingCalculator',
    'CarbonFootprintPerShipmentCalculator', 'CarbToInsulinRatioCalculator', 'CardiovascularRiskScoreCalculator', 'CardioVsStrengthComparisonCalculator',
    'CardioVsWeightsCalorieCalculator', 'CarLoanCalculator', 'CarPerformance060Calculator', 'CarrierPerformanceScoreCalculator',
    'CarrierRateComparisonCalculator', 'CarryingCostOfInventoryCalculator', 'CashConversionCycleCalculator', 'CashRatioCalculator',
    'Chads2ScoreCalculator', 'ChildHeightPredictor', 'ChildPughScoreCalculator', 'CholesterolRatioCalculator',
    'ChurnRateCalculator', 'CircuitTrainingCalorieCalculator', 'CircularMotionCalculator', 'ClosingCostCalculator',
    'ColdChainComplianceCostCalculator', 'CollegeSavingsCalculator', 'CommercialVehicleLoadCalculator', 'ConceptionDateCalculator',
    'ConcreteCalculator', 'ConsignmentInventoryCostCalculator', 'ContinuousCompoundingCalculator', 'CoolingSystemCalculator',
    'CorrectedQtIntervalCalculator', 'CostPerShipmentCalculator', 'CovidSymptomCalculator', 'CreditCardMinimumPaymentCalculator',
    'CreditCardPayoffCalculator', 'CreditUtilizationCalculator', 'CrossFitWodCalorieCalculator', 'CryptoProfitCalculator',
    'CryptoTaxCalculator', 'CurrentRatioCalculator', 'CustomerAcquisitionCostCalculator', 'CustomsClearanceCostEstimator',
    'CuttingCalorieCalculator', 'CyclingCalorieCalculator', 'CyclingCaloriesCalculator', 'DailyCalorieBurnCalculator',
    'DailyCalorieBurnPerPoundCalculator', 'DancingCalorieCalculator', 'DCFValuationCalculator', 'DdpVsExwCostComparisonCalculator',
    'DeadFreightCostCalculator', 'DeadSpaceFractionCalculator', 'DebtAvalancheCalculator', 'DebtConsolidationCalculator',
    'DebtPayoffCalculator', 'DebtSnowballCalculator', 'DebtToEquityCalculator', 'DeliveryCostPerMileCalculator',
    'DemurrageCostCalculator', 'DepreciationRecaptureCalculator', 'DepreciationTaxShieldCalculator', 'DifferentialCalculator',
    'DisabilityInsuranceCalculator', 'DiscountedPaybackPeriodCalculator', 'DistributionNetworkCostCalculator', 'DividendCalculator',
    'DividendYieldCalculator', 'DopplerEffectCalculator', 'DragCoefficientCalculator', 'DriverCostPerMileCalculator',
    'DynoCalculator', 'EarlyRetirementCalculator', 'EarningsPerShareCalculator', 'EarToAprCalculator',
    'Election83bCalculator', 'EllipticalCalorieCalculator', 'EmissionsTestCalculator', 'EmployerNationalInsuranceContributionCalculator',
    'EmployerPayrollTaxCalculator', 'EquityMultiplierCalculator', 'EquivalentAnnualAnnuityCalculator', 'EscrowCalculator',
    'ExpeditedShippingCostPremiumCalculator', 'ExportDocumentationCostCalculator', 'FatBurningZoneCalculator', 'FetalWeightCalculator',
    'FeverCalculator', 'FfmiFatFreeMassIndexCalculator', 'FiberIntakeCalculator', 'FireCalculator',
    'FixedAssetTurnoverCalculator', 'FleetDepreciationCalculator', 'FleetFuelCostCalculator', 'FleetInsuranceCostCalculator',
    'FloorsClimbedCalorieCalculator', 'FreeCashFlowCalculator', 'FreeCashFlowToFirmCalculator', 'FreeFallCalculator',
    'FreightCostToRevenueRatioCalculator', 'FuelInjectorCalculator', 'GearRatioCalculator', 'GestationalAgeCalculator',
    'GiftTaxCalculator', 'GlycemicLoadCalculator', 'GrossMarginCalculator', 'GymSessionCalorieBurnCalculator',
    'HalfLifeCalculator', 'HarmonicMeanCalculator', 'HasBledScoreCalculator', 'HealthInsuranceCalculator',
    'HeartRateRecoveryCalculator', 'HelocCalculator', 'HemoglobinCalculator', 'HiitCalorieBurnCalculator',
    'HiitCalorieCalculator', 'HikingCalorieCalculator', 'HorsepowerCalculator', 'HotYogaCalorieCalculator',
    'IdealWeightCalculatorForWomen', 'ImportClearanceTimeCostCalculator', 'IncomeTaxCalculator', 'IncotermsCostImpactCalculator',
    'IncotermsLandedCostCalculator', 'InfantMilkCalculator', 'InflationAdjustedReturnCalculator', 'InheritanceTaxCalculator',
    'InsuranceCostPerShipmentCalculator', 'InterestCoverageRatioCalculator', 'IntermittentFastingCalculator', 'InternalGrowthRateCalculator',
    'InternationalShippingCostEstimator', 'InterquartileRangeCalculator', 'InventoryDaysCalculator', 'InventoryTurnoverCalculator',
    'InvestmentGrowthCalculator', 'InvestmentReturnCalculator', 'IraCalculator', 'JobClassificationSalaryBandCalculator',
    'JobOfferNetSalaryCalculator', 'JumpRopeCalorieCalculator', 'KeplersLawsCalculator', 'KurtosisCalculator',
    'LastMileDeliveryCostCalculator', 'LogisticsCostPerUnitCalculator', 'LowCarbDietAdherenceScoreCalculator', 'LowCarbThresholdCalculator',
    'LtvCalculator', 'LumpsumCalculator', 'MacroCalculator', 'MacronutrientCalorieDistributionCalculator',
    'MaintenanceCalorieCalculator', 'MarathonTrainingCalculator', 'MarginCalculator', 'MarginOfSafetyPercentageCalculator',
    'MartialArtsCalorieCalculator', 'MealFrequencyCalorieSplitCalculator', 'MeanArterialPressureCalculator', 'MedianCalculator',
    'MetsBasedCalorieBurnCalculator', 'MicrofinanceLoanRepaymentCalculator', 'MindfulnessPracticeRoiCalculator', 'ModeCalculator',
    'ModuloCalculator', 'MomentumCalculator', 'MultiModalTransportationCostCalculator', 'NetCarbsCalculator',
    'NetProfitMarginCalculator', 'NetWorthCalculator', 'NormalDistributionCalculator', 'NumberSequenceCalculator',
    'OdometerCorrectionCalculator', 'OlympicLiftPercentageCalculator', 'Omega3IntakeCalculator', 'OperatingCashFlowCalculator',
    'OperatingMarginCalculator', 'OrbitalVelocityCalculator', 'OverweightCalculator', 'PaintCalculator',
    'PaybackPeriodCalculator', 'PaybackPeriodCalculatorAdvanced', 'PaydayLoanTrueCostCalculator', 'PayRaisePercentageCalculator',
    'PediatricBmiCalculator', 'PercentageBasedVolumeCalculator', 'PermutationCombinationCalculator', 'PersonalLoanCalculator',
    'PersonalLoanPayoffCalculator', 'PilatesCalorieCalculator', 'PitiCalculator', 'PitiMortgagePaymentCalculator',
    'Plan529Calculator', 'PonderalIndexCalculator', 'PortDwellTimeCostCalculator', 'PortHandlingCostCalculator',
    'PotassiumIntakeCalculator', 'PredictableRevenuePercentageCalculator', 'PreferredStockValuationCalculator', 'PregnancyBmiCalculator',
    'PregnancyDueDateCalculator', 'PrenatalVitaminCalculator', 'PrePregnancyBMICalculator', 'PropertyTaxCalculator',
    'ProteinToCalorieRatioCalculator', 'PulseOxCalculator', 'QuartileCalculator', 'RadiationDoseFractionationCalculator',
    'RadiatorSizeCalculator', 'RangeCalculator', 'ReactionTimeCalculator', 'ReceivableDaysCalculator',
    'RefinanceBreakEvenCalculator', 'RefinanceCalculator', 'RehabLoan203kEstimatorCalculator', 'RentalYieldCalculator',
    'RepetitionMaxPercentageCalculator', 'RequiredMinimumDistributionCalculator', 'ResourceLoadingPercentageCalculator', 'RestaurantMealCalorieEstimator',
    'RetirementCalculator', 'RetirementSavingsCalculator', 'ReturnOnAssetsCalculator', 'ReturnOnInvestedCapitalCalculator',
    'ReturnsProcessingCostCalculator', 'ReverseLogisticsCostCalculator', 'ReverseMortgageEstimationCalculator', 'RmdCalculator',
    'RockClimbingCalorieCalculator', 'RowingCalorieCalculator', 'RpeToPercentageCalculator', 'RunningPaceCalculator',
    'RvLoanPaymentCalculator', 'SafeFollowingDistanceCalculator', 'SafeWithdrawalRateCalculator', 'SalaryBandRangeCalculator',
    'SalaryBenchmarkPercentileCalculator', 'SalaryGradeSpreadCalculator', 'SavingsGoalCalculator', 'Sba7aLoanPaymentCalculator',
    'SeasonalPaymentLoanCalculator', 'SeaVsAirFreightCostComparisonCalculator', 'SedentaryTimeCostCalculator', 'ShippingInsuranceCostCalculator',
    'ShippingWeightCostCalculator', 'SimpleInterestLoanCalculator', 'SipCalculator', 'SkewnessCalculator',
    'SkuStorageCostCalculator', 'SleepDebtCalculator', 'SleepInvestmentRoiCalculator', 'SocialSecurityCalculator',
    'SodiumIntakeCalculator', 'SpeedometerErrorCalculator', 'SportsDrinkCarbConcentrationCalculator', 'SportSpecificCalorieCalculator',
    'StairClimbingCalorieCalculator', 'StarterMotorCalculator', 'StepCountToCalorieBurnCalculator', 'StepsToCaloriesCalculator',
    'StoppingDistanceCalculator', 'StudentLoanCalculator', 'SustainableGrowthRateCalculator', 'SwimmingCalorieCalculator',
    'SyntaxScoreComplexityCalculator', 'TabataCalorieCalculator', 'TaxReturnCalculator', 'TermLifeVsWholeLifeCalculator',
    'ThyroidRiskScoreCalculator', 'TimeAndMaterialsBudgetCalculator', 'TimesInterestEarnedCalculator', 'TireDiameterCalculator',
    'TireLoadIndexCalculator', 'TirePressureCalculator', 'TireSizeCalculator', 'TowingCapacityCalculator',
    'TradeCreditDaysCalculator', 'TradeCreditTermsCalculator', 'TradeFinanceCostCalculator', 'TrailerTongueWeightCalculator',
    'TransitTimeCostCalculator', 'TransmissionRatioCalculator', 'TwinPregnancyWeightGainCalculator', 'UltraProcessedFoodPercentageCalculator',
    'UnitLoadCostCalculator', 'VaccinationScheduleCalculator', 'VariablePayPercentageCalculator', 'VdotCalculator',
    'VehicleWeightCalculator', 'VelocityCalculator', 'VendorScorecardRatingCalculator', 'VicariousTraumaRiskCalculator',
    'WaccCalculator', 'WaistToHeightRatioCalculator', 'WalkVsRunCalorieComparisonCalculator', 'WaterAerobicsCalorieCalculator',
    'WeddingBudgetCalculator', 'WeightChangePercentageCalculator', 'WeightedAverageYieldCalculator', 'WeightliftingPercentageCalculator',
    'WeightliftingSessionCalorieCalculator', 'WeightLossPercentageCalculator', 'WheelHorsepowerCalculator', 'WorkingCapitalTurnoverCalculator',
    'WorkoutCalorieCalculator', 'YogaCalorieCalculator',
];

const results = [];

for (const name of polishList) {
    const file = path.join(dir, name + '.tsx');
    if (!fs.existsSync(file)) {
        results.push({ name, missing: true });
        continue;
    }
    const content = fs.readFileSync(file, 'utf8');

    const buttonLabelMatches = [];
    const labelRegex = />([^<]{1,40})<\/(?:Button|button)>/g;
    let m;
    while ((m = labelRegex.exec(content)) !== null) {
        const label = m[1].trim();
        if (label && label !== '↺' && label !== 'Reset' && !/^[↺\s]*$/.test(label)) {
            buttonLabelMatches.push(label);
        }
    }

    const hasExactCalculate = />\s*Calculate\s*<\/(?:Button|button)>/.test(content);

    const seoMatch = content.match(/<section[^>]*mt-12[^>]*>([\s\S]*?)<\/section>/);
    let seoWords = 0;
    if (seoMatch) {
        const text = seoMatch[1].replace(/<[^>]+>/g, ' ').trim();
        seoWords = text.split(/\s+/).filter(w => w.length > 0).length;
    }

    results.push({ name, buttonLabels: buttonLabelMatches, hasExactCalculate, seoWords, hasSeoSection: !!seoMatch });
}

console.log('=== BUTTON LABEL ISSUES (non-Calculate) ===');
for (const r of results) {
    if (r.missing) { console.log(`MISSING: ${r.name}`); continue; }
    if (!r.hasExactCalculate && r.buttonLabels.length > 0) {
        console.log(`${r.name}: labels=[${r.buttonLabels.join(', ')}]`);
    }
}

console.log('\n=== SEO WORD COUNT (< 400) ===');
for (const r of results) {
    if (r.missing) continue;
    if (r.seoWords > 0 && r.seoWords < 400) {
        console.log(`${r.name}: ${r.seoWords} words`);
    } else if (r.seoWords === 0) {
        console.log(`${r.name}: NO SEO SECTION FOUND`);
    }
}

console.log('\n=== TOTAL FILES CHECKED ===');
console.log(`Total: ${results.length}, Missing: ${results.filter(r => r.missing).length}`);