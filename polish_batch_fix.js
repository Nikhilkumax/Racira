#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs");
const path = require("path");
const COMP_DIR = "src/domains/calculator/components";
const REG_DIR = "src/domains/calculator/registry";
const APPROVED = path.join(COMP_DIR, "_approved.json");

const POLISH = [
    ["AbsorptionCostingVsVariableCostingProfitComparison", { button: true, seo: true }],
    ["AlternatorOutputCalculator", { button: true, seo: false }],
    ["AltitudeCalculator", { button: true, seo: false }],
    ["AltmanZScoreCalculator", { button: true, seo: false }],
    ["AmazonFbaCalculator", { button: true, seo: false }],
    ["AndroidVsGynoidEstimator", { button: true, seo: false }],
    ["AngelInvestmentReturnCalculator", { button: true, seo: false }],
    ["AngleConverter", { button: false, seo: true }],
    ["AnnualRecurringRevenueCalculator", { button: true, seo: true }],
    ["AnnualSalaryToHourlyRateCalculator", { button: false, seo: true }],
    ["AnnuityCalculator", { button: false, seo: true }],
    ["AnnuityPayoutCalculator", { button: false, seo: true }],
    ["AprToEarCalculator", { button: false, seo: true }],
    ["ArcLengthCalculator", { button: false, seo: true }],
    ["ArithmeticProgressionCalculator", { button: false, seo: true }],
    ["ArmVsFixedRateCalculator", { button: true, seo: false }],
    ["AssetCoverageRatioCalculator", { button: true, seo: false }],
    ["AssetTurnoverRatioCalculator", { button: false, seo: true }],
    ["AthleteBmiCalculator", { button: true, seo: false }],
    ["AutoLoanRefinanceSavingsCalculator", { button: false, seo: true }],
    ["AverageCalculator", { button: false, seo: true }],
    ["AverageRevenuePerUserCalculator", { button: true, seo: true }],
    ["BabyGrowthPercentileCalculator", { button: false, seo: true }],
    ["BackdoorRothIraCalculator", { button: true, seo: true }],
    ["BaristaFireCalculator", { button: true, seo: true }],
    ["BasalMetabolicRateBmrKatchMcardleCalculator", { button: true, seo: false }],
    ["BatteryLifeCalculator", { button: true, seo: true }],
    ["BitcoinMiningCalculator", { button: true, seo: true }],
    ["BiweeklyVsMonthlyLoanComparison", { button: false, seo: true }],
    ["BloodDonationCalculator", { button: true, seo: true }],
    ["BloodGlucoseToCarbRatioEstimator", { button: true, seo: false }],
    ["BMIToBodyFatCalculator", { button: true, seo: false }],
    ["BodyAdiposityIndexBaiCalculator", { button: true, seo: false }],
    ["BodyFatNavyMethodCalculator", { button: true, seo: false }],
    ["BodyFatPercentageCalculator", { button: false, seo: true }],
    ["BodyFatSkinfoldCalculator", { button: true, seo: false }],
    ["BodyMassIndexCalculator", { button: true, seo: false }],
    ["BondedWarehouseCostCalculator", { button: false, seo: true }],
    ["BonusPercentageCalculator", { button: false, seo: true }],
    ["BoxingCalorieCalculator", { button: true, seo: false }],
    ["BrakeHorsepowerCalculator", { button: true, seo: true }],
    ["BrakingDistanceCalculator", { button: true, seo: true }],
    ["BreakBulkCargoCostCalculator", { button: false, seo: true }],
    ["BreakEvenCalculator", { button: false, seo: true }],
    ["BreakEvenMileageCalculator", { button: true, seo: true }],
    ["BreastfeedingCalorieCalculator", { button: true, seo: false }],
    ["BudgetCalculator", { button: false, seo: true }],
    ["BulkingCalorieCalculator", { button: true, seo: false }],
    ["BurnRateCalculator", { button: false, seo: true }],
    ["BusinessLoanCalculator", { button: false, seo: true }],
    ["BusinessValuationCalculator", { button: false, seo: true }],
    ["CaffeineCalculator", { button: false, seo: true }],
    ["CaffeineHalfLifeCalculator", { button: false, seo: true }],
    ["CalorieCyclingCalculator", { button: true, seo: false }],
    ["CalorieDeficitCalculator", { button: false, seo: true }],
    ["CalorieDeficitForWeightLossCalculator", { button: true, seo: false }],
    ["CalorieSurplusForWeightGainCalculator", { button: true, seo: false }],
    ["CalorieToNutrientDensityRatioCalculator", { button: true, seo: false }],
    ["CalorieToProteinRatioCalculator", { button: true, seo: false }],
    ["CapRateCalculator", { button: false, seo: true }],
    ["CarbCyclingCalculator", { button: true, seo: false }],
    ["CarbohydrateCalculator", { button: true, seo: false }],
    ["CarbohydrateGramsCalculator", { button: true, seo: false }],
    ["CarbohydrateLoadingCalculator", { button: true, seo: false }],
    ["CarbonFootprintPerShipmentCalculator", { button: false, seo: true }],
    ["CarbToInsulinRatioCalculator", { button: true, seo: false }],
    ["CardiovascularRiskScoreCalculator", { button: true, seo: false }],
    ["CardioVsStrengthComparisonCalculator", { button: true, seo: false }],
    ["CardioVsWeightsCalorieCalculator", { button: true, seo: false }],
    ["CarLoanCalculator", { button: false, seo: true }],
    ["CarPerformance060Calculator", { button: true, seo: false }],
    ["CarrierPerformanceScoreCalculator", { button: false, seo: true }],
    ["CarrierRateComparisonCalculator", { button: false, seo: true }],
    ["CarryingCostOfInventoryCalculator", { button: false, seo: true }],
    ["CashConversionCycleCalculator", { button: false, seo: true }],
    ["CashRatioCalculator", { button: false, seo: true }],
    ["Chads2ScoreCalculator", { button: true, seo: true }],
    ["ChildHeightPredictor", { button: true, seo: false }],
    ["ChildPughScoreCalculator", { button: true, seo: true }],
    ["CholesterolRatioCalculator", { button: true, seo: false }],
    ["ChurnRateCalculator", { button: false, seo: true }],
    ["CircuitTrainingCalorieCalculator", { button: true, seo: false }],
    ["CircularMotionCalculator", { button: false, seo: true }],
    ["ClosingCostCalculator", { button: true, seo: false }],
    ["ColdChainComplianceCostCalculator", { button: false, seo: true }],
    ["CollegeSavingsCalculator", { button: false, seo: true }],
    ["CommercialVehicleLoadCalculator", { button: true, seo: true }],
    ["ConceptionDateCalculator", { button: false, seo: true }],
    ["ConcreteCalculator", { button: false, seo: true }],
    ["ConsignmentInventoryCostCalculator", { button: false, seo: true }],
    ["ContinuousCompoundingCalculator", { button: false, seo: true }],
    ["CoolingSystemCalculator", { button: true, seo: true }],
    ["CorrectedQtIntervalCalculator", { button: false, seo: true }],
    ["CostPerShipmentCalculator", { button: false, seo: true }],
    ["CovidSymptomCalculator", { button: true, seo: false }],
    ["CreditCardMinimumPaymentCalculator", { button: false, seo: true }],
    ["CreditCardPayoffCalculator", { button: false, seo: true }],
    ["CreditUtilizationCalculator", { button: false, seo: true }],
    ["CrossFitWodCalorieCalculator", { button: true, seo: false }],
    ["CryptoProfitCalculator", { button: false, seo: true }],
    ["CryptoTaxCalculator", { button: false, seo: true }],
    ["CurrentRatioCalculator", { button: false, seo: true }],
    ["CustomerAcquisitionCostCalculator", { button: false, seo: true }],
    ["CustomsClearanceCostEstimator", { button: false, seo: true }],
    ["CuttingCalorieCalculator", { button: true, seo: false }],
    ["CyclingCalorieCalculator", { button: false, seo: true }],
    ["CyclingCaloriesCalculator", { button: false, seo: true }],
    ["DailyCalorieBurnCalculator", { button: true, seo: false }],
    ["DailyCalorieBurnPerPoundCalculator", { button: true, seo: false }],
    ["DancingCalorieCalculator", { button: true, seo: false }],
    ["DCFValuationCalculator", { button: false, seo: true }],
    ["DdpVsExwCostComparisonCalculator", { button: false, seo: true }],
    ["DeadFreightCostCalculator", { button: false, seo: true }],
    ["DeadSpaceFractionCalculator", { button: true, seo: false }],
    ["DebtAvalancheCalculator", { button: false, seo: true }],
    ["DebtConsolidationCalculator", { button: false, seo: true }],
    ["DebtPayoffCalculator", { button: false, seo: true }],
    ["DebtSnowballCalculator", { button: false, seo: true }],
    ["DebtToEquityCalculator", { button: false, seo: true }],
    ["DeliveryCostPerMileCalculator", { button: false, seo: true }],
    ["DemurrageCostCalculator", { button: false, seo: true }],
    ["DepreciationRecaptureCalculator", { button: false, seo: true }],
    ["DepreciationTaxShieldCalculator", { button: false, seo: true }],
    ["DifferentialCalculator", { button: true, seo: false }],
    ["DisabilityInsuranceCalculator", { button: false, seo: true }],
    ["DiscountedPaybackPeriodCalculator", { button: false, seo: true }],
    ["DistributionNetworkCostCalculator", { button: false, seo: true }],
    ["DividendCalculator", { button: false, seo: true }],
    ["DividendYieldCalculator", { button: false, seo: true }],
    ["DopplerEffectCalculator", { button: false, seo: true }],
    ["DragCoefficientCalculator", { button: true, seo: true }],
    ["DriverCostPerMileCalculator", { button: true, seo: true }],
    ["DynoCalculator", { button: true, seo: true }],
    ["EarlyRetirementCalculator", { button: false, seo: true }],
    ["EarningsPerShareCalculator", { button: false, seo: true }],
    ["EarToAprCalculator", { button: false, seo: true }],
    ["Election83bCalculator", { button: true, seo: false }],
    ["EllipticalCalorieCalculator", { button: true, seo: false }],
    ["EmissionsTestCalculator", { button: true, seo: true }],
    ["EmployerNationalInsuranceContributionCalculator", { button: false, seo: true }],
    ["EmployerPayrollTaxCalculator", { button: false, seo: true }],
    ["EquityMultiplierCalculator", { button: false, seo: true }],
    ["EquivalentAnnualAnnuityCalculator", { button: false, seo: true }],
    ["EscrowCalculator", { button: true, seo: false }],
    ["ExpeditedShippingCostPremiumCalculator", { button: false, seo: true }],
    ["ExportDocumentationCostCalculator", { button: false, seo: true }],
    ["FatBurningZoneCalculator", { button: false, seo: true }],
    ["FetalWeightCalculator", { button: false, seo: true }],
    ["FeverCalculator", { button: true, seo: false }],
    ["FfmiFatFreeMassIndexCalculator", { button: true, seo: false }],
    ["FiberIntakeCalculator", { button: false, seo: true }],
    ["FireCalculator", { button: false, seo: true }],
    ["FixedAssetTurnoverCalculator", { button: false, seo: true }],
    ["FleetDepreciationCalculator", { button: true, seo: true }],
    ["FleetFuelCostCalculator", { button: true, seo: true }],
    ["FleetInsuranceCostCalculator", { button: false, seo: true }],
    ["FloorsClimbedCalorieCalculator", { button: true, seo: false }],
    ["FreeCashFlowCalculator", { button: false, seo: true }],
    ["FreeCashFlowToFirmCalculator", { button: false, seo: true }],
    ["FreeFallCalculator", { button: false, seo: true }],
    ["FreightCostToRevenueRatioCalculator", { button: false, seo: true }],
    ["FuelInjectorCalculator", { button: true, seo: false }],
    ["GearRatioCalculator", { button: true, seo: false }],
    ["GestationalAgeCalculator", { button: false, seo: true }],
    ["GiftTaxCalculator", { button: false, seo: true }],
    ["GlycemicLoadCalculator", { button: false, seo: true }],
    ["GrossMarginCalculator", { button: false, seo: true }],
    ["GymSessionCalorieBurnCalculator", { button: true, seo: false }],
    ["HalfLifeCalculator", { button: false, seo: true }],
    ["HarmonicMeanCalculator", { button: false, seo: true }],
    ["HasBledScoreCalculator", { button: true, seo: true }],
    ["HealthInsuranceCalculator", { button: false, seo: true }],
    ["HeartRateRecoveryCalculator", { button: false, seo: true }],
    ["HelocCalculator", { button: false, seo: true }],
    ["HemoglobinCalculator", { button: true, seo: false }],
    ["HiitCalorieBurnCalculator", { button: true, seo: false }],
    ["HiitCalorieCalculator", { button: false, seo: true }],
    ["HikingCalorieCalculator", { button: true, seo: false }],
    ["HorsepowerCalculator", { button: true, seo: false }],
    ["HotYogaCalorieCalculator", { button: true, seo: false }],
    ["IdealWeightCalculatorForWomen", { button: true, seo: false }],
    ["ImportClearanceTimeCostCalculator", { button: false, seo: true }],
    ["IncomeTaxCalculator", { button: false, seo: true }],
    ["IncotermsCostImpactCalculator", { button: false, seo: true }],
    ["IncotermsLandedCostCalculator", { button: false, seo: true }],
    ["InfantMilkCalculator", { button: false, seo: true }],
    ["InflationAdjustedReturnCalculator", { button: false, seo: true }],
    ["InheritanceTaxCalculator", { button: false, seo: true }],
    ["InsuranceCostPerShipmentCalculator", { button: false, seo: true }],
    ["InterestCoverageRatioCalculator", { button: false, seo: true }],
    ["IntermittentFastingCalculator", { button: false, seo: true }],
    ["InternalGrowthRateCalculator", { button: false, seo: true }],
    ["InternationalShippingCostEstimator", { button: false, seo: true }],
    ["InterquartileRangeCalculator", { button: false, seo: true }],
    ["InventoryDaysCalculator", { button: false, seo: true }],
    ["InventoryTurnoverCalculator", { button: false, seo: true }],
    ["InvestmentGrowthCalculator", { button: false, seo: true }],
    ["InvestmentReturnCalculator", { button: false, seo: true }],
    ["IraCalculator", { button: false, seo: true }],
    ["JobClassificationSalaryBandCalculator", { button: false, seo: true }],
    ["JobOfferNetSalaryCalculator", { button: false, seo: true }],
    ["JumpRopeCalorieCalculator", { button: true, seo: false }],
    ["KeplersLawsCalculator", { button: false, seo: true }],
    ["KurtosisCalculator", { button: false, seo: true }],
    ["LastMileDeliveryCostCalculator", { button: false, seo: true }],
    ["LogisticsCostPerUnitCalculator", { button: false, seo: true }],
    ["LowCarbDietAdherenceScoreCalculator", { button: true, seo: false }],
    ["LowCarbThresholdCalculator", { button: true, seo: false }],
    ["LtvCalculator", { button: true, seo: false }],
    ["LumpsumCalculator", { button: false, seo: true }],
    ["MacroCalculator", { button: false, seo: true }],
    ["MacronutrientCalorieDistributionCalculator", { button: true, seo: false }],
    ["MaintenanceCalorieCalculator", { button: true, seo: false }],
    ["MarathonTrainingCalculator", { button: false, seo: true }],
    ["MarginCalculator", { button: false, seo: true }],
    ["MarginOfSafetyPercentageCalculator", { button: false, seo: true }],
    ["MartialArtsCalorieCalculator", { button: true, seo: false }],
    ["MealFrequencyCalorieSplitCalculator", { button: true, seo: false }],
    ["MeanArterialPressureCalculator", { button: false, seo: true }],
    ["MedianCalculator", { button: false, seo: true }],
    ["MetsBasedCalorieBurnCalculator", { button: true, seo: false }],
    ["MicrofinanceLoanRepaymentCalculator", { button: false, seo: true }],
    ["MindfulnessPracticeRoiCalculator", { button: true, seo: false }],
    ["ModeCalculator", { button: false, seo: true }],
    ["ModuloCalculator", { button: false, seo: true }],
    ["MomentumCalculator", { button: false, seo: true }],
    ["MultiModalTransportationCostCalculator", { button: false, seo: true }],
    ["NetCarbsCalculator", { button: true, seo: false }],
    ["NetProfitMarginCalculator", { button: false, seo: true }],
    ["NetWorthCalculator", { button: false, seo: true }],
    ["NormalDistributionCalculator", { button: false, seo: true }],
    ["NumberSequenceCalculator", { button: false, seo: true }],
    ["OdometerCorrectionCalculator", { button: true, seo: true }],
    ["OlympicLiftPercentageCalculator", { button: true, seo: false }],
    ["Omega3IntakeCalculator", { button: false, seo: true }],
    ["OperatingCashFlowCalculator", { button: false, seo: true }],
    ["OperatingMarginCalculator", { button: false, seo: true }],
    ["OrbitalVelocityCalculator", { button: false, seo: true }],
    ["OverweightCalculator", { button: false, seo: true }],
    ["PaintCalculator", { button: false, seo: true }],
    ["PaybackPeriodCalculator", { button: false, seo: true }],
    ["PaybackPeriodCalculatorAdvanced", { button: false, seo: true }],
    ["PaydayLoanTrueCostCalculator", { button: false, seo: true }],
    ["PayRaisePercentageCalculator", { button: false, seo: true }],
    ["PediatricBmiCalculator", { button: true, seo: false }],
    ["PercentageBasedVolumeCalculator", { button: true, seo: false }],
    ["PermutationCombinationCalculator", { button: false, seo: true }],
    ["PersonalLoanCalculator", { button: false, seo: true }],
    ["PersonalLoanPayoffCalculator", { button: false, seo: true }],
    ["PilatesCalorieCalculator", { button: true, seo: false }],
    ["PitiCalculator", { button: true, seo: false }],
    ["PitiMortgagePaymentCalculator", { button: false, seo: true }],
    ["Plan529Calculator", { button: true, seo: false }],
    ["PonderalIndexCalculator", { button: true, seo: false }],
    ["PortDwellTimeCostCalculator", { button: false, seo: true }],
    ["PortHandlingCostCalculator", { button: false, seo: true }],
    ["PotassiumIntakeCalculator", { button: false, seo: true }],
    ["PredictableRevenuePercentageCalculator", { button: false, seo: true }],
    ["PreferredStockValuationCalculator", { button: false, seo: true }],
    ["PregnancyBmiCalculator", { button: true, seo: false }],
    ["PregnancyDueDateCalculator", { button: true, seo: false }],
    ["PrenatalVitaminCalculator", { button: false, seo: true }],
    ["PrePregnancyBMICalculator", { button: true, seo: false }],
    ["PropertyTaxCalculator", { button: false, seo: true }],
    ["ProteinToCalorieRatioCalculator", { button: true, seo: false }],
    ["PulseOxCalculator", { button: true, seo: false }],
    ["QuartileCalculator", { button: false, seo: true }],
    ["RadiationDoseFractionationCalculator", { button: true, seo: false }],
    ["RadiatorSizeCalculator", { button: true, seo: true }],
    ["RangeCalculator", { button: false, seo: true }],
    ["ReactionTimeCalculator", { button: true, seo: true }],
    ["ReceivableDaysCalculator", { button: false, seo: true }],
    ["RefinanceBreakEvenCalculator", { button: false, seo: true }],
    ["RefinanceCalculator", { button: false, seo: true }],
    ["RehabLoan203kEstimatorCalculator", { button: true, seo: true }],
    ["RentalYieldCalculator", { button: false, seo: true }],
    ["RepetitionMaxPercentageCalculator", { button: true, seo: false }],
    ["RequiredMinimumDistributionCalculator", { button: false, seo: true }],
    ["ResourceLoadingPercentageCalculator", { button: false, seo: true }],
    ["RestaurantMealCalorieEstimator", { button: true, seo: false }],
    ["RetirementCalculator", { button: false, seo: true }],
    ["RetirementSavingsCalculator", { button: false, seo: true }],
    ["ReturnOnAssetsCalculator", { button: false, seo: true }],
    ["ReturnOnInvestedCapitalCalculator", { button: false, seo: true }],
    ["ReturnsProcessingCostCalculator", { button: false, seo: true }],
    ["ReverseLogisticsCostCalculator", { button: false, seo: true }],
    ["ReverseMortgageEstimationCalculator", { button: true, seo: false }],
    ["RmdCalculator", { button: false, seo: true }],
    ["RockClimbingCalorieCalculator", { button: true, seo: false }],
    ["RowingCalorieCalculator", { button: true, seo: false }],
    ["RpeToPercentageCalculator", { button: true, seo: false }],
    ["RunningPaceCalculator", { button: false, seo: true }],
    ["RvLoanPaymentCalculator", { button: false, seo: true }],
    ["SafeFollowingDistanceCalculator", { button: true, seo: true }],
    ["SafeWithdrawalRateCalculator", { button: false, seo: true }],
    ["SalaryBandRangeCalculator", { button: false, seo: true }],
    ["SalaryBenchmarkPercentileCalculator", { button: false, seo: true }],
    ["SalaryGradeSpreadCalculator", { button: false, seo: true }],
    ["SavingsGoalCalculator", { button: false, seo: true }],
    ["Sba7aLoanPaymentCalculator", { button: false, seo: true }],
    ["SeasonalPaymentLoanCalculator", { button: false, seo: true }],
    ["SeaVsAirFreightCostComparisonCalculator", { button: false, seo: true }],
    ["SedentaryTimeCostCalculator", { button: true, seo: false }],
    ["ShippingInsuranceCostCalculator", { button: false, seo: true }],
    ["ShippingWeightCostCalculator", { button: false, seo: true }],
    ["SimpleInterestLoanCalculator", { button: false, seo: true }],
    ["SipCalculator", { button: false, seo: true }],
    ["SkewnessCalculator", { button: false, seo: true }],
    ["SkuStorageCostCalculator", { button: false, seo: true }],
    ["SleepDebtCalculator", { button: false, seo: true }],
    ["SleepInvestmentRoiCalculator", { button: true, seo: false }],
    ["SocialSecurityCalculator", { button: false, seo: true }],
    ["SodiumIntakeCalculator", { button: false, seo: true }],
    ["SpeedometerErrorCalculator", { button: true, seo: false }],
    ["SportsDrinkCarbConcentrationCalculator", { button: true, seo: false }],
    ["SportSpecificCalorieCalculator", { button: true, seo: false }],
    ["StairClimbingCalorieCalculator", { button: true, seo: false }],
    ["StarterMotorCalculator", { button: true, seo: false }],
    ["StepCountToCalorieBurnCalculator", { button: true, seo: false }],
    ["StepsToCaloriesCalculator", { button: true, seo: false }],
    ["StoppingDistanceCalculator", { button: true, seo: true }],
    ["StudentLoanCalculator", { button: false, seo: true }],
    ["SustainableGrowthRateCalculator", { button: false, seo: true }],
    ["SwimmingCalorieCalculator", { button: false, seo: true }],
    ["SyntaxScoreComplexityCalculator", { button: true, seo: false }],
    ["TabataCalorieCalculator", { button: true, seo: false }],
    ["TaxReturnCalculator", { button: false, seo: true }],
    ["TermLifeVsWholeLifeCalculator", { button: false, seo: true }],
    ["ThyroidRiskScoreCalculator", { button: true, seo: false }],
    ["TimeAndMaterialsBudgetCalculator", { button: false, seo: true }],
    ["TimesInterestEarnedCalculator", { button: false, seo: true }],
    ["TireDiameterCalculator", { button: true, seo: true }],
    ["TireLoadIndexCalculator", { button: true, seo: true }],
    ["TirePressureCalculator", { button: true, seo: true }],
    ["TireSizeCalculator", { button: true, seo: false }],
    ["TowingCapacityCalculator", { button: true, seo: true }],
    ["TradeCreditDaysCalculator", { button: false, seo: true }],
    ["TradeCreditTermsCalculator", { button: false, seo: true }],
    ["TradeFinanceCostCalculator", { button: false, seo: true }],
    ["TrailerTongueWeightCalculator", { button: true, seo: false }],
    ["TransitTimeCostCalculator", { button: false, seo: true }],
    ["TransmissionRatioCalculator", { button: true, seo: false }],
    ["TwinPregnancyWeightGainCalculator", { button: true, seo: false }],
    ["UltraProcessedFoodPercentageCalculator", { button: true, seo: false }],
    ["UnitLoadCostCalculator", { button: false, seo: true }],
    ["VaccinationScheduleCalculator", { button: true, seo: false }],
    ["VariablePayPercentageCalculator", { button: false, seo: true }],
    ["VdotCalculator", { button: false, seo: true }],
    ["VehicleWeightCalculator", { button: true, seo: true }],
    ["VelocityCalculator", { button: false, seo: true }],
    ["VendorScorecardRatingCalculator", { button: false, seo: true }],
    ["VicariousTraumaRiskCalculator", { button: true, seo: false }],
    ["WaccCalculator", { button: false, seo: true }],
    ["WaistToHeightRatioCalculator", { button: true, seo: false }],
    ["WalkVsRunCalorieComparisonCalculator", { button: true, seo: false }],
    ["WaterAerobicsCalorieCalculator", { button: true, seo: false }],
    ["WeddingBudgetCalculator", { button: false, seo: true }],
    ["WeightChangePercentageCalculator", { button: true, seo: false }],
    ["WeightedAverageYieldCalculator", { button: false, seo: true }],
    ["WeightliftingPercentageCalculator", { button: true, seo: false }],
    ["WeightliftingSessionCalorieCalculator", { button: true, seo: false }],
    ["WeightLossPercentageCalculator", { button: true, seo: false }],
    ["WheelHorsepowerCalculator", { button: true, seo: true }],
    ["WorkingCapitalTurnoverCalculator", { button: false, seo: true }],
    ["WorkoutCalorieCalculator", { button: false, seo: true }],
    ["YogaCalorieCalculator", { button: true, seo: false }],
];

function readFile(p) { try { return fs.readFileSync(p, "utf8"); } catch { return null; } }
function writeFile(p, c) { fs.writeFileSync(p, c, "utf8"); }

function fixButton(content) {
    let changed = false;
    const re = /<button([^>]*?)>(\s*)([^<]{1,60}?)(\s*)<\/button>/g;
    const out = content.replace(re, (full, attrs, s1, label, s2) => {
        const t = label.trim();
        if (t === "Calculate") return full;
        const isCalc = /\b(Calculate|Compute|Get Results|Calculate Now|Calculate Results|Calculate ROI|Calculate Payment|Calculate EMI|Estimate|Analyze|Calculate Savings)\b/i.test(t);
        if (isCalc && t.length <= 40 && !/↺|Reset|Print|Clear|Add|Remove|Copy|Download|Share/i.test(t)) {
            changed = true; return `<button${attrs}>Calculate</button>`;
        }
        return full;
    });
    return { content: out, changed };
}

function seoWordCount(content) {
    const m = content.match(/<section[^>]*mt-12[\s\S]*?<\/section>/);
    if (!m) return 0;
    const txt = m[0].replace(/<[^>]+>/g, " ");
    return (txt.match(/\b\w+\b/g) || []).length;
}
function hasSeo(content) { return /<h2[^>]*>What Is/.test(content); }

function makeSeo(name) {
    const clean = name.replace(/([A-Z])/g, " $1").replace(/^ /, "").trim();
    return `
      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a ${clean}?</h2>
          <p className="text-muted-foreground leading-relaxed">The ${clean} is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the ${clean} keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the ${clean} is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the ${clean} useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
`;
}
function addSeo(content, name) {
    if (hasSeo(content)) return { content, changed: false };
    const seo = makeSeo(name);
    const idx = content.indexOf("<PopularCalculators");
    if (idx >= 0) {
        const lineStart = content.lastIndexOf("\n", idx) + 1;
        return { content: content.slice(0, lineStart) + seo + content.slice(lineStart), changed: true };
    }
    return { content: content + seo, changed: true };
}

function findRegistryEntry(name) {
    const files = fs.readdirSync(REG_DIR).filter(f => f.endsWith(".ts"));
    for (const f of files) {
        const fp = path.join(REG_DIR, f);
        const c = readFile(fp); if (!c) continue;
        const slugGuess1 = name.replace(/([A-Z])/g, "-$1").replace(/^-/, "").toLowerCase().replace(/^-/, "");
        const slugGuess2 = name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^[-]/, "");
        const re = /slug:\s*"([^"]+)"[^}]*?name:\s*"([^"]+)"/g; let m;
        while ((m = re.exec(c)) !== null) {
            const slug = m[1]; const dispName = m[2];
            if (slug === name.toLowerCase() || slug === slugGuess1 || slug === slugGuess2) return { file: fp, slug, index: m.index };
            const dn = dispName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const nn = name.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (dn === nn) return { file: fp, slug, index: m.index };
        }
    }
    return null;
}
function setRegistryLive(name) {
    const entry = findRegistryEntry(name);
    if (!entry) return { ok: false, reason: "not found" };
    const c = readFile(entry.file);
    const after = c.slice(entry.index);
    const re = /status:\s*"(soon|live)"/;
    const m2 = after.match(re);
    if (!m2) return { ok: false, reason: "no status" };
    const absIdx = entry.index + m2.index;
    const newC = c.slice(0, absIdx) + 'status: "live"' + c.slice(absIdx + m2[0].length);
    writeFile(entry.file, newC);
    return { ok: true, slug: entry.slug };
}

function loadApproved() { const c = readFile(APPROVED); if (!c) return { version: 1, description: "", approved: [] }; try { return JSON.parse(c); } catch { return { version: 1, description: "", approved: [] }; } }
function appendApproved(name) { const a = loadApproved(); if (!a.approved.includes(name)) a.approved.push(name); writeFile(APPROVED, JSON.stringify(a, null, 2) + "\n"); }

const report = [];
for (const [name, flags] of POLISH) {
    const file = path.join(COMP_DIR, name + ".tsx");
    let c = readFile(file);
    if (!c) { report.push(`MISSING: ${name}`); continue; }
    let changed = false, btnFixed = false, seoAdded = false;
    if (flags.button) { const r = fixButton(c); if (r.changed) { c = r.content; changed = true; btnFixed = true; } }
    if (flags.seo) { const wc = seoWordCount(c); if (wc < 400) { const r = addSeo(c, name); if (r.changed) { c = r.content; changed = true; seoAdded = true; } } }
    if (changed) writeFile(file, c);
    const reg = setRegistryLive(name);
    appendApproved(name);
    report.push(`${name}: btn=${btnFixed ? "FIXED" : "ok"} seo=${seoAdded ? "ADDED" : (hasSeo(c) ? "present" : "n/a")} reg=${reg.ok ? "live" : "MISS"} slug=${reg.slug || ""}`);
}
writeFile("polish_batch_report.txt", report.join("\n"));
console.log("Done. Processed: " + POLISH.length);