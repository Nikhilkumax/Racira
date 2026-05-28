import {
  Activity, AlertTriangle, Apple, ArrowLeftRight, Atom, Award, Baby, Banknote, BarChart3, BatteryCharging, Beaker, Bike, Binary, Bitcoin, Bone, BookOpen, Box, Briefcase, Building, Calculator, Calendar, Car, Cat, Circle, CircleDollarSign, Clock, Cloud, Code, Coffee, Coins, Cpu, CreditCard, Dice1, DollarSign, Droplets, Dumbbell, Eye, FileText, Flag, Flame, Fuel, Gamepad2, Gauge, Gift, Globe, GraduationCap, Hammer, HardDrive, HardHat, Hash, Heart, Home, Image, Keyboard, Landmark, Layers, Leaf, Link, Lock, LucideIcon, MessageSquare, Mic, Monitor, Moon, MousePointer2, Music, Package, PaintBucket, Palette, Percent, PieChart, PiggyBank, Pizza, Plane, Receipt, RefreshCw, Ruler, School, Scissors, Server, Settings, Shield, ShieldCheck, Ship, ShoppingBag, Share2, Signal, Sigma, Sparkles, Sun, Target, Thermometer, Timer, Trees, TrendingDown, TrendingUp, Triangle, Trophy, Truck, Type, Users, Utensils, Video, Wallet, Wifi, Wind, Wine, Zap
} from "lucide-react";

export interface CalculatorDef {
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  icon: LucideIcon;
  isBuilt?: boolean;
}

export const calculatorRegistry: CalculatorDef[] = [
  // ══════════════════════════════════════════════
  // 🏦 FINANCIAL & LOAN CALCULATORS
  // ══════════════════════════════════════════════

  // 💰 General Loans & Mortgages
  { slug: "mortgage-calculator", name: "Mortgage Calculator", description: "Advanced mortgage calculator with amortization, PMI, taxes & insurance.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "home-loan-calculator", name: "Home Loan Calculator", description: "Calculate home loan EMI, total interest, and amortization schedule.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "personal-loan-calculator", name: "Personal Loan Calculator", description: "Calculate personal loan EMI, interest costs, and repayment schedule.", category: "Finance", subcategory: "Loans & Mortgages", icon: Banknote, isBuilt: true },
  { slug: "auto-loan-calculator", name: "Auto Loan Calculator", description: "Detailed auto loan with trade-in, taxes, fees, and amortization.", category: "Finance", subcategory: "Loans & Mortgages", icon: Car, isBuilt: true },
  { slug: "bike-loan-calculator", name: "Bike Loan Calculator", description: "Calculate bike loan EMI, total cost, and repayment breakdown.", category: "Finance", subcategory: "Loans & Mortgages", icon: Bike, isBuilt: true },
  { slug: "boat-loan-calculator", name: "Boat Loan Calculator", description: "Estimate boat financing payments, interest, and amortization.", category: "Finance", subcategory: "Loans & Mortgages", icon: Ship, isBuilt: true },
  { slug: "rv-loan-calculator", name: "RV Loan Calculator", description: "Calculate RV loan payments with trade-in and extended terms.", category: "Finance", subcategory: "Loans & Mortgages", icon: Truck, isBuilt: true },
  { slug: "education-loan-calculator", name: "Education Loan Calculator", description: "Estimate education loan EMI with grace period and moratorium.", category: "Finance", subcategory: "Loans & Mortgages", icon: GraduationCap, isBuilt: true },
  { slug: "student-loan-calculator", name: "Student Loan Calculator", description: "Calculate student loan payments with income-driven repayment plans.", category: "Finance", subcategory: "Loans & Mortgages", icon: GraduationCap, isBuilt: true },
  { slug: "business-loan-calculator", name: "Business Loan Calculator", description: "Estimate business loan payments, total cost, and break-even analysis.", category: "Finance", subcategory: "Loans & Mortgages", icon: Briefcase, isBuilt: true },
  { slug: "gold-loan-calculator", name: "Gold Loan Calculator", description: "Calculate gold loan amount based on gold weight, purity, and LTV ratio.", category: "Finance", subcategory: "Loans & Mortgages", icon: Coins, isBuilt: true },
  { slug: "construction-loan-calculator", name: "Construction Loan Calculator", description: "Estimate construction loan payments with draw schedules and conversion.", category: "Finance", subcategory: "Loans & Mortgages", icon: HardHat, isBuilt: true },
  { slug: "fha-loan-calculator", name: "FHA Loan Calculator", description: "Calculate FHA loan payments with MIP, down payment, and qualifying ratios.", category: "Finance", subcategory: "Loans & Mortgages", icon: Shield, isBuilt: true },
  { slug: "va-loan-calculator", name: "VA Loan Calculator", description: "Estimate VA mortgage payments with funding fee and no down payment.", category: "Finance", subcategory: "Loans & Mortgages", icon: Shield, isBuilt: true },
  { slug: "usda-loan-calculator", name: "USDA Loan Calculator", description: "Calculate USDA loan payments with guarantee fee and income eligibility.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "home-equity-loan-calculator", name: "Home Equity Loan Calculator", description: "Estimate home equity loan payments based on your home value and balance.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "heloc-calculator", name: "HELOC Calculator", description: "Calculate HELOC payments during draw and repayment periods.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "loan-calculator", name: "Loan EMI Calculator", description: "Professional EMI calculator with prepayment analysis and effective rate.", category: "Finance", subcategory: "Loans & Mortgages", icon: TrendingDown, isBuilt: true },
  { slug: "loan-against-property-calculator", name: "Loan Against Property Calculator", description: "Calculate LAP EMI based on property value and loan-to-value ratio.", category: "Finance", subcategory: "Loans & Mortgages", icon: Building, isBuilt: true },
  { slug: "repayment-calculator", name: "Repayment Calculator", description: "Plan loan repayment with extra payments and early payoff scenarios.", category: "Finance", subcategory: "Loans & Mortgages", icon: TrendingDown, isBuilt: true },
  { slug: "interest-only-calculator", name: "Interest Only Calculator", description: "Calculate interest-only loan payments and total cost comparison.", category: "Finance", subcategory: "Loans & Mortgages", icon: Percent, isBuilt: true },
  { slug: "payment-calculator", name: "Payment Calculator", description: "Calculate monthly payments for any loan amount, rate, and term.", category: "Finance", subcategory: "Loans & Mortgages", icon: DollarSign, isBuilt: true },
  { slug: "amortization-calculator", name: "Amortization Calculator", description: "Generate detailed amortization schedule for any loan type.", category: "Finance", subcategory: "Loans & Mortgages", icon: BarChart3, isBuilt: true },
  { slug: "mortgage-payoff-calculator", name: "Mortgage Payoff Calculator", description: "Calculate how extra payments accelerate your mortgage payoff date.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "refinance-calculator", name: "Refinance Calculator", description: "Compare current vs refinance mortgage to find break-even point.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "uk-mortgage-calculator", name: "UK Mortgage Calculator", description: "Calculate UK mortgage payments with stamp duty and interest types.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "canadian-mortgage-calculator", name: "Canadian Mortgage Calculator", description: "Calculate Canadian mortgage with semi-annual compounding and CMHC insurance.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "biweekly-mortgage-calculator", name: "Bi-Weekly Mortgage Calculator", description: "See how paying every two weeks saves interest and time.", category: "Finance", subcategory: "Loans & Mortgages", icon: Clock, isBuilt: true },
  { slug: "mortgage-affordability-calculator", name: "Mortgage Affordability Calculator", description: "Find out how much home you can afford based on income and DTI ratios.", category: "Finance", subcategory: "Loans & Mortgages", icon: DollarSign, isBuilt: true },

  // 💳 Debt & Credit Management
  { slug: "credit-card-payoff-calculator", name: "Credit Card Payoff Calculator", description: "Multi-card payoff with avalanche and snowball strategies.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "credit-card-minimum-payment-calculator", name: "Credit Card Minimum Payment Calculator", description: "See how long minimum payments take to clear your credit card debt.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "debt-snowball-calculator", name: "Debt Snowball Calculator", description: "Plan debt payoff using the snowball method — smallest balance first.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "debt-avalanche-calculator", name: "Debt Avalanche Calculator", description: "Plan debt payoff using the avalanche method — highest interest first.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "debt-consolidation-calculator", name: "Debt Consolidation Calculator", description: "Compare consolidating multiple debts into a single loan.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "debt-payoff-calculator", name: "Debt Payoff Calculator", description: "Calculate how fast you can become debt-free with extra payments.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "dti-calculator", name: "DTI Calculator", description: "Calculate your debt-to-income ratio for mortgage qualification.", category: "Finance", subcategory: "Debt & Credit", icon: PieChart, isBuilt: true },
  { slug: "credit-utilization-calculator", name: "Credit Utilization Calculator", description: "Check your credit utilization ratio and its impact on credit score.", category: "Finance", subcategory: "Debt & Credit", icon: PieChart, isBuilt: true },
  { slug: "apr-calculator", name: "APR Calculator", description: "Calculate the true annual percentage rate including fees.", category: "Finance", subcategory: "Debt & Credit", icon: Percent, isBuilt: true },

  // 💵 Salary, Income & Tax
  { slug: "salary-calculator", name: "Salary Calculator", description: "Convert between hourly, weekly, monthly, and annual salary.", category: "Finance", subcategory: "Income & Tax", icon: Wallet, isBuilt: true },
  { slug: "take-home-salary-calculator", name: "Take-Home Salary Calculator", description: "Calculate your net pay after taxes, deductions, and benefits.", category: "Finance", subcategory: "Income & Tax", icon: Wallet, isBuilt: true },
  { slug: "hourly-to-salary-calculator", name: "Hourly to Salary Calculator", description: "Convert hourly wage to annual salary and vice versa.", category: "Finance", subcategory: "Income & Tax", icon: Wallet, isBuilt: true },
  { slug: "overtime-calculator", name: "Overtime Calculator", description: "Calculate overtime pay with regular and overtime hourly rates.", category: "Finance", subcategory: "Income & Tax", icon: Clock, isBuilt: true },
  { slug: "commission-calculator", name: "Commission Calculator", description: "Calculate sales commission with tiered rates and bonuses.", category: "Finance", subcategory: "Income & Tax", icon: DollarSign, isBuilt: true },
  { slug: "bonus-calculator", name: "Bonus Calculator", description: "Estimate your bonus after tax withholding and deductions.", category: "Finance", subcategory: "Income & Tax", icon: Award, isBuilt: true },
  { slug: "inflation-calculator", name: "Inflation Calculator", description: "Calculate purchasing power and inflation-adjusted values.", category: "Finance", subcategory: "Income & Tax", icon: TrendingUp, isBuilt: true },
  { slug: "marriage-tax-calculator", name: "Marriage Tax Calculator", description: "Compare tax liability for married filing jointly vs separately.", category: "Finance", subcategory: "Income & Tax", icon: Heart, isBuilt: true },
  { slug: "estate-tax-calculator", name: "Estate Tax Calculator", description: "Estimate federal estate tax and exemption amounts.", category: "Finance", subcategory: "Income & Tax", icon: Landmark, isBuilt: true },
  { slug: "social-security-calculator", name: "Social Security Calculator", description: "Estimate your Social Security benefits based on earnings history.", category: "Finance", subcategory: "Income & Tax", icon: Shield, isBuilt: true },
  { slug: "pension-calculator", name: "Pension Calculator", description: "Calculate pension income based on years of service and salary.", category: "Finance", subcategory: "Income & Tax", icon: Landmark, isBuilt: true },
  { slug: "income-tax-calculator", name: "Income Tax Calculator", description: "Estimate federal and state taxes and take-home pay.", category: "Finance", subcategory: "Income & Tax", icon: Receipt, isBuilt: true },
  { slug: "sales-tax-calculator", name: "Sales Tax Calculator", description: "Calculate sales tax, before-tax and after-tax prices.", category: "Finance", subcategory: "Income & Tax", icon: DollarSign, isBuilt: true },
  { slug: "net-worth-calculator", name: "Net Worth Calculator", description: "Track your total assets minus liabilities to find your net worth.", category: "Finance", subcategory: "Income & Tax", icon: PieChart, isBuilt: true },

  // 🇮🇳 Indian Finance
  { slug: "sip-calculator", name: "SIP Calculator", description: "Calculate returns on Systematic Investment Plan with step-up SIP option.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "swp-calculator", name: "SWP Calculator", description: "Plan systematic withdrawals from your mutual fund investments.", category: "Finance", subcategory: "Investment", icon: TrendingDown, isBuilt: true },
  { slug: "lumpsum-calculator", name: "Lumpsum Calculator", description: "Calculate returns on one-time lump sum mutual fund investment.", category: "Finance", subcategory: "Investment", icon: PiggyBank, isBuilt: true },
  { slug: "ppf-calculator", name: "PPF Calculator", description: "Calculate Public Provident Fund maturity with yearly deposits.", category: "Finance", subcategory: "Savings", icon: Shield, isBuilt: true },
  { slug: "epf-calculator", name: "EPF Calculator", description: "Estimate Employee Provident Fund corpus at retirement.", category: "Finance", subcategory: "Savings", icon: Landmark, isBuilt: true },
  { slug: "nps-calculator", name: "NPS Calculator", description: "Plan National Pension System contributions and retirement corpus.", category: "Finance", subcategory: "Savings", icon: Target, isBuilt: true },
  { slug: "sukanya-samriddhi-calculator", name: "Sukanya Samriddhi Calculator", description: "Calculate Sukanya Samriddhi Yojana maturity amount for girl child.", category: "Finance", subcategory: "Savings", icon: Heart, isBuilt: true },
  { slug: "gratuity-calculator", name: "Gratuity Calculator", description: "Calculate gratuity amount based on salary and years of service.", category: "Finance", subcategory: "Employment", icon: Award, isBuilt: true },
  { slug: "hra-calculator", name: "HRA Calculator", description: "Calculate HRA exemption under Section 10(13A) of Income Tax Act.", category: "Finance", subcategory: "Income & Tax", icon: Home, isBuilt: true },
  { slug: "da-calculator", name: "DA Calculator", description: "Calculate Dearness Allowance based on latest CPI index.", category: "Finance", subcategory: "Employment", icon: TrendingUp, isBuilt: true },
  { slug: "leave-encashment-calculator", name: "Leave Encashment Calculator", description: "Calculate leave encashment amount with tax exemption.", category: "Finance", subcategory: "Employment", icon: Calendar, isBuilt: true },
  { slug: "income-tax-calculator-india", name: "Income Tax Calculator (India)", description: "Compare old vs new tax regime and find optimal tax-saving strategy.", category: "Finance", subcategory: "Income & Tax", icon: Receipt, isBuilt: true },
  { slug: "gst-calculator", name: "GST Calculator", description: "GST/VAT calculator with CGST, SGST, and IGST split.", category: "Finance", subcategory: "Income & Tax", icon: Globe, isBuilt: true },
  { slug: "tds-calculator", name: "TDS Calculator", description: "Calculate Tax Deducted at Source for salary, FD, and other income.", category: "Finance", subcategory: "Income & Tax", icon: Receipt, isBuilt: true },
  { slug: "professional-tax-calculator", name: "Professional Tax Calculator", description: "Calculate state-wise professional tax deduction from salary.", category: "Finance", subcategory: "Income & Tax", icon: Briefcase, isBuilt: true },
  { slug: "stamp-duty-calculator", name: "Stamp Duty Calculator", description: "Calculate stamp duty and registration charges for property purchase.", category: "Finance", subcategory: "Income & Tax", icon: Building, isBuilt: true },
  { slug: "home-loan-emi-calculator-india", name: "Home Loan EMI Calculator (India)", description: "Calculate home loan EMI with Indian bank rates and tax benefits.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },

  // ══════════════════════════════════════════════
  // 📊 INVESTMENT & RETIREMENT
  // ══════════════════════════════════════════════

  // 📈 Investment Growth
  { slug: "compound-interest-calculator", name: "Compound Interest Calculator", description: "Investment calculator with inflation adjustment and growth projections.", category: "Finance", subcategory: "Growth", icon: PiggyBank, isBuilt: true },
  { slug: "investment-calculator", name: "Investment Calculator", description: "Calculate your investment growth with compound interest and regular contributions.", category: "Finance", subcategory: "Growth", icon: PiggyBank, isBuilt: true },
  { slug: "simple-interest-calculator", name: "Simple Interest Calculator", description: "Calculate simple interest on principal for a given rate and time.", category: "Finance", subcategory: "Growth", icon: Calculator, isBuilt: true },
  { slug: "roi-calculator", name: "ROI Calculator", description: "Calculate return on investment with annualized returns.", category: "Finance", subcategory: "Growth", icon: TrendingUp, isBuilt: true },
  { slug: "cagr-calculator", name: "CAGR Calculator", description: "Calculate Compound Annual Growth Rate for investments.", category: "Finance", subcategory: "Growth", icon: TrendingUp, isBuilt: true },
  { slug: "irr-calculator", name: "IRR Calculator", description: "Calculate Internal Rate of Return for uneven cash flows.", category: "Finance", subcategory: "Growth", icon: BarChart3, isBuilt: true },
  { slug: "dividend-calculator", name: "Dividend Calculator", description: "Estimate dividend income and yield from stock investments.", category: "Finance", subcategory: "Growth", icon: DollarSign, isBuilt: true },
  { slug: "cryptocurrency-profit-calculator", name: "Cryptocurrency Profit Calculator", description: "Calculate crypto trading profit, loss, and ROI.", category: "Finance", subcategory: "Growth", icon: Coins, isBuilt: true },
  { slug: "forex-profit-calculator", name: "Forex Profit Calculator", description: "Calculate forex trading profit with pip value and lot size.", category: "Finance", subcategory: "Growth", icon: Globe, isBuilt: false },
  { slug: "bond-yield-calculator", name: "Bond Yield Calculator", description: "Calculate bond yield to maturity, current yield, and price.", category: "Finance", subcategory: "Growth", icon: Landmark, isBuilt: true },
  { slug: "cd-calculator", name: "CD Calculator", description: "Calculate Certificate of Deposit earnings with compounding.", category: "Finance", subcategory: "Growth", icon: Landmark, isBuilt: true },
  { slug: "present-value-calculator", name: "Present Value Calculator", description: "Calculate the present value of future cash flows.", category: "Finance", subcategory: "Growth", icon: Calculator, isBuilt: true },
  { slug: "future-value-calculator", name: "Future Value Calculator", description: "Calculate the future value of current investments or savings.", category: "Finance", subcategory: "Growth", icon: Calculator, isBuilt: true },
  { slug: "average-return-calculator", name: "Average Return Calculator", description: "Calculate arithmetic and geometric average returns.", category: "Finance", subcategory: "Growth", icon: BarChart3, isBuilt: true },
  { slug: "interest-rate-calculator", name: "Interest Rate Calculator", description: "Find the implied interest rate from payment and loan details.", category: "Finance", subcategory: "Growth", icon: Percent, isBuilt: true },

  // 👴 Retirement & Planning
  { slug: "retirement-calculator", name: "Retirement Calculator", description: "3-module retirement planning with goal, withdrawal, and savings.", category: "Finance", subcategory: "Retirement", icon: Target, isBuilt: true },
  { slug: "401k-calculator", name: "401K Calculator", description: "Estimate 401(k) growth with employer match and contribution limits.", category: "Finance", subcategory: "Retirement", icon: Landmark, isBuilt: true },
  { slug: "roth-ira-calculator", name: "Roth IRA Calculator", description: "Calculate Roth IRA growth with tax-free withdrawal projections.", category: "Finance", subcategory: "Retirement", icon: PiggyBank, isBuilt: true },
  { slug: "traditional-ira-calculator", name: "Traditional IRA Calculator", description: "Estimate Traditional IRA growth with tax-deferred contributions.", category: "Finance", subcategory: "Retirement", icon: PiggyBank, isBuilt: true },
  { slug: "rmd-calculator", name: "RMD Calculator", description: "Calculate Required Minimum Distributions from retirement accounts.", category: "Finance", subcategory: "Retirement", icon: Calendar, isBuilt: true },
  { slug: "annuity-calculator", name: "Annuity Calculator", description: "Calculate annuity payments, present value, and future value.", category: "Finance", subcategory: "Retirement", icon: Coins, isBuilt: true },
  { slug: "annuity-payout-calculator", name: "Annuity Payout Calculator", description: "Estimate periodic payouts from an annuity investment.", category: "Finance", subcategory: "Retirement", icon: Coins, isBuilt: true },
  { slug: "fire-calculator", name: "FIRE Calculator", description: "Calculate your Financial Independence, Retire Early target number.", category: "Finance", subcategory: "Retirement", icon: Target, isBuilt: true },
  { slug: "savings-calculator", name: "Savings Calculator", description: "Calculate savings growth with regular deposits and compound interest.", category: "Finance", subcategory: "Retirement", icon: PiggyBank, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🏠 REAL ESTATE
  // ══════════════════════════════════════════════
  { slug: "rent-vs-buy-calculator", name: "Rent vs Buy Calculator", description: "Compare the true costs of renting versus buying a home.", category: "Finance", icon: Home, isBuilt: true },
  { slug: "rental-yield-calculator", name: "Rental Yield Calculator", description: "Calculate gross and net rental yield on investment property.", category: "Finance", icon: Building, isBuilt: true },
  { slug: "cap-rate-calculator", name: "Cap Rate Calculator", description: "Calculate capitalization rate for real estate investments.", category: "Finance", icon: Building, isBuilt: true },
  { slug: "property-appreciation-calculator", name: "Property Appreciation Calculator", description: "Estimate future property value based on historical appreciation rates.", category: "Finance", icon: TrendingUp, isBuilt: true },
  { slug: "down-payment-calculator", name: "Down Payment Calculator", description: "Calculate how much down payment you need for a home purchase.", category: "Finance", icon: DollarSign, isBuilt: true },
  { slug: "house-affordability-calculator", name: "House Affordability Calculator", description: "Find out how much house you can afford based on income and debts.", category: "Finance", icon: Home, isBuilt: true },
  { slug: "real-estate-calculator", name: "Real Estate Calculator", description: "General real estate investment analysis with ROI and cash flow.", category: "Finance", icon: Building, isBuilt: true },
  { slug: "depreciation-calculator", name: "Depreciation Calculator", description: "Calculate asset depreciation using straight-line or accelerated methods.", category: "Finance", icon: TrendingDown, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🏋️ FITNESS & HEALTH
  // ══════════════════════════════════════════════

  // Body Metrics
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Calculate Body Mass Index and understand your weight category.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "bmr-calculator", name: "BMR Calculator", description: "Calculate Basal Metabolic Rate — calories burned at rest.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "tdee-calculator", name: "TDEE Calculator", description: "Calculate Total Daily Energy Expenditure based on activity level.", category: "Health", subcategory: "Body Metrics", icon: Dumbbell, isBuilt: true },
  { slug: "body-fat-calculator", name: "Body Fat Calculator", description: "Estimate body fat percentage using multiple measurement methods.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "lean-body-mass-calculator", name: "Lean Body Mass Calculator", description: "Calculate lean body mass excluding body fat.", category: "Health", subcategory: "Body Metrics", icon: Dumbbell, isBuilt: true },
  { slug: "ideal-weight-calculator", name: "Ideal Weight Calculator", description: "Find your ideal weight range based on height, age, and gender.", category: "Health", subcategory: "Body Metrics", icon: Target, isBuilt: true },
  { slug: "adjusted-body-weight-calculator", name: "Adjusted Body Weight Calculator", description: "Calculate adjusted body weight for medication dosing.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "waist-to-hip-ratio-calculator", name: "Waist-to-Hip Ratio Calculator", description: "Assess health risk based on waist and hip measurements.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "body-type-calculator", name: "Body Type Calculator", description: "Determine your body type — ectomorph, mesomorph, or endomorph.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "body-surface-area-calculator", name: "Body Surface Area Calculator", description: "Calculate BSA using DuBois, Mosteller, and other formulas.", category: "Health", subcategory: "Body Metrics", icon: Ruler, isBuilt: true },
  { slug: "army-body-fat-calculator", name: "Army Body Fat Calculator", description: "Calculate body fat using US Army standards and tape method.", category: "Health", subcategory: "Body Metrics", icon: Shield, isBuilt: false },
  { slug: "healthy-weight-calculator", name: "Healthy Weight Calculator", description: "Find your healthy weight range based on BMI guidelines.", category: "Health", subcategory: "Body Metrics", icon: Heart, isBuilt: false },
  { slug: "overweight-calculator", name: "Overweight Calculator", description: "Check if your weight is in the overweight range and by how much.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "anorexic-bmi-calculator", name: "Anorexic BMI Calculator", description: "Understand severely underweight BMI ranges and health risks.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "weight-watchers-points-calculator", name: "Weight Watchers Points Calculator", description: "Estimate Weight Watchers points for foods based on nutrition.", category: "Health", subcategory: "Body Metrics", icon: Apple, isBuilt: false },

  // Nutrition & Diet
  { slug: "calorie-calculator", name: "Calorie Calculator", description: "Calculate daily calorie needs for weight loss, gain, or maintenance.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: true },
  { slug: "macro-calculator", name: "Macro Calculator", description: "Calculate protein, carbs, and fat macros for your diet goals.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: true },
  { slug: "protein-intake-calculator", name: "Protein Intake Calculator", description: "Find your optimal daily protein intake based on goals and activity.", category: "Health", subcategory: "Nutrition", icon: Dumbbell, isBuilt: true },
  { slug: "carb-calculator", name: "Carb Calculator", description: "Calculate daily carbohydrate needs based on diet type and goals.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: true },
  { slug: "fat-intake-calculator", name: "Fat Intake Calculator", description: "Determine healthy daily fat intake in grams and calories.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: true },
  { slug: "water-intake-calculator", name: "Water Intake Calculator", description: "Calculate recommended daily water intake based on weight and activity.", category: "Health", subcategory: "Nutrition", icon: Droplets, isBuilt: true },

  // Pregnancy & Fertility
  { slug: "pregnancy-calculator", name: "Pregnancy Calculator", description: "Track pregnancy milestones, due date, and trimester progress.", category: "Health", subcategory: "Pregnancy", icon: Baby, isBuilt: true },
  { slug: "due-date-calculator", name: "Due Date Calculator", description: "Calculate your estimated due date from last menstrual period.", category: "Health", subcategory: "Pregnancy", icon: Baby, isBuilt: true },
  { slug: "ovulation-calculator", name: "Ovulation Calculator", description: "Predict ovulation dates and fertile window for conception.", category: "Health", subcategory: "Pregnancy", icon: Calendar, isBuilt: true },
  { slug: "fertility-calculator", name: "Fertility Calculator", description: "Track fertility window and best days to conceive.", category: "Health", subcategory: "Pregnancy", icon: Heart, isBuilt: true },
  { slug: "conception-calculator", name: "Conception Calculator", description: "Estimate conception date from due date or birth date.", category: "Health", subcategory: "Pregnancy", icon: Baby, isBuilt: true },
  { slug: "pregnancy-weight-gain-calculator", name: "Pregnancy Weight Gain Calculator", description: "Track healthy weight gain during pregnancy by trimester.", category: "Health", subcategory: "Pregnancy", icon: Activity, isBuilt: true },
  { slug: "period-calculator", name: "Period Calculator", description: "Predict your next period date and menstrual cycle length.", category: "Health", subcategory: "Pregnancy", icon: Calendar, isBuilt: true },

  // Activity & Vitals
  { slug: "pace-calculator", name: "Pace Calculator", description: "Calculate running or walking pace, speed, and finish time.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: true },
  { slug: "calories-burned-calculator", name: "Calories Burned Calculator", description: "Estimate calories burned during various exercises and activities.", category: "Health", subcategory: "Activity", icon: Dumbbell, isBuilt: true },
  { slug: "target-heart-rate-calculator", name: "Target Heart Rate Calculator", description: "Calculate target heart rate zones for optimal exercise intensity.", category: "Health", subcategory: "Activity", icon: Heart, isBuilt: true },
  { slug: "vo2-max-calculator", name: "VO2 Max Calculator", description: "Estimate your maximum oxygen uptake and cardiovascular fitness.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: true },
  { slug: "one-rep-max-calculator", name: "One Rep Max Calculator", description: "Calculate your estimated one-rep max for any lift.", category: "Health", subcategory: "Activity", icon: Dumbbell, isBuilt: true },
  { slug: "gfr-calculator", name: "GFR Calculator", description: "Estimate glomerular filtration rate for kidney function assessment.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: true },
  { slug: "bac-calculator", name: "BAC Calculator", description: "Estimate blood alcohol content based on drinks, weight, and time.", category: "Health", subcategory: "Activity", icon: Wine, isBuilt: true },
  { slug: "sleep-calculator", name: "Sleep Calculator", description: "Calculate optimal bedtime and wake time based on sleep cycles.", category: "Health", subcategory: "Activity", icon: Moon, isBuilt: true },

  // ══════════════════════════════════════════════
  // 📐 MATH
  // ══════════════════════════════════════════════

  // Basic & Number
  { slug: "basic-calculator", name: "Basic Calculator", description: "Simple arithmetic calculator for addition, subtraction, multiplication, division.", category: "Math", subcategory: "Basic", icon: Calculator, isBuilt: false },
  { slug: "scientific-calculator", name: "Scientific Calculator", description: "Advanced scientific calculator with trigonometry, logs, and constants.", category: "Math", subcategory: "Basic", icon: Calculator, isBuilt: false },
  { slug: "long-division-calculator", name: "Long Division Calculator", description: "Step-by-step long division with quotient, remainder, and decimal.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "rounding-calculator", name: "Rounding Calculator", description: "Round numbers to any decimal place or significant figure.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "significant-figures-calculator", name: "Significant Figures Calculator", description: "Count and round to the correct number of significant figures.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "random-number-generator", name: "Random Number Generator", description: "Generate random numbers within a specified range.", category: "Math", subcategory: "Basic", icon: Dice1, isBuilt: false },
  { slug: "number-sequence-calculator", name: "Number Sequence Calculator", description: "Find patterns and next terms in arithmetic and geometric sequences.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "scientific-notation-calculator", name: "Scientific Notation Calculator", description: "Convert numbers to and from scientific notation.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: false },
  { slug: "big-number-calculator", name: "Big Number Calculator", description: "Perform arithmetic with extremely large numbers.", category: "Math", subcategory: "Basic", icon: Calculator, isBuilt: false },
  { slug: "prime-factorization-calculator", name: "Prime Factorization Calculator", description: "Find the prime factors of any number.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "lcm-calculator", name: "LCM Calculator", description: "Calculate the Least Common Multiple of two or more numbers.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "gcf-calculator", name: "GCF Calculator", description: "Find the Greatest Common Factor of two or more numbers.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "factor-calculator", name: "Factor Calculator", description: "Find all factors and factor pairs of a number.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "root-calculator", name: "Root Calculator", description: "Calculate square roots, cube roots, and nth roots.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: false },

  // Statistics & Probability
  { slug: "statistics-calculator", name: "Statistics Calculator", description: "Calculate mean, median, mode, range, and standard deviation.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "standard-deviation-calculator", name: "Standard Deviation Calculator", description: "Calculate population and sample standard deviation.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "variance-calculator", name: "Variance Calculator", description: "Calculate population and sample variance from a data set.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "probability-calculator", name: "Probability Calculator", description: "Calculate probability of single and combined events.", category: "Math", subcategory: "Statistics", icon: Dice1, isBuilt: false },
  { slug: "z-score-calculator", name: "Z Score Calculator", description: "Calculate z-score and find probabilities from normal distribution.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "p-value-calculator", name: "P Value Calculator", description: "Calculate p-value for hypothesis testing from test statistics.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "confidence-interval-calculator", name: "Confidence Interval Calculator", description: "Calculate confidence intervals for population parameters.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "sample-size-calculator", name: "Sample Size Calculator", description: "Determine the required sample size for statistical significance.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "permutation-combination-calculator", name: "Permutation & Combination Calculator", description: "Calculate permutations and combinations for probability problems.", category: "Math", subcategory: "Statistics", icon: Sigma, isBuilt: false },

  // Algebra & Geometry
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages, percentage change, and percentage of a number.", category: "Math", subcategory: "Algebra & Geometry", icon: Percent, isBuilt: true },
  { slug: "fraction-calculator", name: "Fraction Calculator", description: "Add, subtract, multiply, and divide fractions with step-by-step solutions.", category: "Math", subcategory: "Algebra & Geometry", icon: Hash, isBuilt: true },
  { slug: "ratio-calculator", name: "Ratio Calculator", description: "Simplify ratios, find equivalent ratios, and solve proportions.", category: "Math", subcategory: "Algebra & Geometry", icon: Hash, isBuilt: true },
  { slug: "quadratic-formula-calculator", name: "Quadratic Formula Calculator", description: "Solve quadratic equations and find roots using the quadratic formula.", category: "Math", subcategory: "Algebra & Geometry", icon: Sigma, isBuilt: true },
  { slug: "log-calculator", name: "Log Calculator", description: "Calculate logarithms with any base — natural, common, and custom.", category: "Math", subcategory: "Algebra & Geometry", icon: Sigma, isBuilt: true },
  { slug: "exponent-calculator", name: "Exponent Calculator", description: "Calculate powers and exponents with step-by-step solutions.", category: "Math", subcategory: "Algebra & Geometry", icon: Sigma, isBuilt: true },
  { slug: "matrix-calculator", name: "Matrix Calculator", description: "Perform matrix operations — addition, multiplication, determinant, inverse.", category: "Math", subcategory: "Algebra & Geometry", icon: Calculator, isBuilt: true },
  { slug: "slope-calculator", name: "Slope Calculator", description: "Calculate slope, distance, and midpoint between two points.", category: "Math", subcategory: "Algebra & Geometry", icon: TrendingUp, isBuilt: true },
  { slug: "polynomial-calculator", name: "Polynomial Calculator", description: "Add, subtract, multiply polynomials and find roots.", category: "Math", subcategory: "Algebra & Geometry", icon: Sigma, isBuilt: true },
  { slug: "linear-equation-calculator", name: "Linear Equation Calculator", description: "Solve linear equations and systems of equations step by step.", category: "Math", subcategory: "Algebra & Geometry", icon: Sigma, isBuilt: true },
  { slug: "area-calculator", name: "Area Calculator", description: "Calculate area of common shapes — circle, triangle, rectangle, and more.", category: "Math", subcategory: "Algebra & Geometry", icon: Triangle, isBuilt: true },
  { slug: "volume-calculator", name: "Volume Calculator", description: "Calculate volume of 3D shapes — sphere, cylinder, cone, and more.", category: "Math", subcategory: "Algebra & Geometry", icon: Layers, isBuilt: true },
  { slug: "surface-area-calculator", name: "Surface Area Calculator", description: "Calculate surface area of 3D shapes with formulas and diagrams.", category: "Math", subcategory: "Algebra & Geometry", icon: Layers, isBuilt: true },
  { slug: "triangle-calculator", name: "Triangle Calculator", description: "Solve triangles — find sides, angles, area, and perimeter.", category: "Math", subcategory: "Algebra & Geometry", icon: Triangle, isBuilt: true },
  { slug: "circle-calculator", name: "Circle Calculator", description: "Calculate circle area, circumference, diameter, and arc length.", category: "Math", subcategory: "Algebra & Geometry", icon: Circle, isBuilt: true },
  { slug: "distance-calculator", name: "Distance Calculator", description: "Calculate distance between two points in 2D or 3D space.", category: "Math", subcategory: "Algebra & Geometry", icon: Ruler, isBuilt: true },
  { slug: "pythagorean-theorem-calculator", name: "Pythagorean Theorem Calculator", description: "Find the missing side of a right triangle using a² + b² = c².", category: "Math", subcategory: "Algebra & Geometry", icon: Triangle, isBuilt: true },
  { slug: "percent-error-calculator", name: "Percent Error Calculator", description: "Calculate percent error between experimental and theoretical values.", category: "Math", subcategory: "Algebra & Geometry", icon: Percent, isBuilt: true },

  // Binary & Hex
  { slug: "binary-calculator", name: "Binary Calculator", description: "Convert and perform arithmetic in binary number system.", category: "Math", subcategory: "Binary & Hex", icon: Binary, isBuilt: false },
  { slug: "hex-calculator", name: "Hex Calculator", description: "Convert and calculate in hexadecimal number system.", category: "Math", subcategory: "Binary & Hex", icon: Binary, isBuilt: false },

  // ══════════════════════════════════════════════
  // 🧪 SCIENCE & ENGINEERING
  // ══════════════════════════════════════════════

  // Physics & Electronics
  { slug: "ohms-law-calculator", name: "Ohm's Law Calculator", description: "Calculate voltage, current, resistance, and power using Ohm's law.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: true },
  { slug: "voltage-drop-calculator", name: "Voltage Drop Calculator", description: "Calculate voltage drop across wire runs for electrical installations.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "resistor-calculator", name: "Resistor Calculator", description: "Decode resistor color bands and calculate resistance values.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "electricity-cost-calculator", name: "Electricity Cost Calculator", description: "Estimate electricity costs for appliances based on usage and rates.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "density-calculator", name: "Density Calculator", description: "Calculate density, mass, or volume given the other two values.", category: "Science", subcategory: "Physics", icon: Atom, isBuilt: true },
  { slug: "speed-calculator", name: "Speed Calculator", description: "Calculate speed, distance, or time given the other two values.", category: "Science", subcategory: "Physics", icon: Gauge, isBuilt: true },
  { slug: "mass-calculator", name: "Mass Calculator", description: "Calculate mass using density and volume or force and acceleration.", category: "Science", subcategory: "Physics", icon: Atom, isBuilt: false },
  { slug: "force-calculator", name: "Force Calculator", description: "Calculate force using Newton's second law — F = ma.", category: "Science", subcategory: "Physics", icon: Atom, isBuilt: true },
  { slug: "engine-horsepower-calculator", name: "Engine Horsepower Calculator", description: "Calculate engine horsepower from torque, RPM, or quarter-mile time.", category: "Science", subcategory: "Physics", icon: Gauge, isBuilt: false },

  // Chemistry
  { slug: "molarity-calculator", name: "Molarity Calculator", description: "Calculate molarity, moles, volume, or dilution for solutions.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: true },
  { slug: "molecular-weight-calculator", name: "Molecular Weight Calculator", description: "Calculate molecular weight from chemical formula.", category: "Science", subcategory: "Chemistry", icon: Atom, isBuilt: false },
  { slug: "half-life-calculator", name: "Half Life Calculator", description: "Calculate radioactive decay, half-life, and remaining quantity.", category: "Science", subcategory: "Chemistry", icon: Atom, isBuilt: false },

  // Weather
  { slug: "btu-calculator", name: "BTU Calculator", description: "Calculate BTU requirements for heating and cooling spaces.", category: "Science", subcategory: "Weather", icon: Thermometer, isBuilt: false },
  { slug: "wind-chill-calculator", name: "Wind Chill Calculator", description: "Calculate wind chill factor from temperature and wind speed.", category: "Science", subcategory: "Weather", icon: Thermometer, isBuilt: false },
  { slug: "heat-index-calculator", name: "Heat Index Calculator", description: "Calculate the feels-like temperature from heat and humidity.", category: "Science", subcategory: "Weather", icon: Thermometer, isBuilt: false },
  { slug: "dew-point-calculator", name: "Dew Point Calculator", description: "Calculate dew point temperature from temperature and humidity.", category: "Science", subcategory: "Weather", icon: Droplets, isBuilt: false },

  // ══════════════════════════════════════════════
  // 🏗 CONSTRUCTION
  // ══════════════════════════════════════════════
  { slug: "concrete-calculator", name: "Concrete Calculator", description: "Calculate concrete volume in cubic yards for slabs, footings, and columns.", category: "Construction", icon: HardHat, isBuilt: false },
  { slug: "cement-calculator", name: "Cement Calculator", description: "Calculate cement, sand, and aggregate quantities for concrete mix.", category: "Construction", icon: HardHat, isBuilt: false },
  { slug: "brick-calculator", name: "Brick Calculator", description: "Estimate number of bricks needed for walls with mortar joints.", category: "Construction", icon: Hammer, isBuilt: false },
  { slug: "steel-weight-calculator", name: "Steel Weight Calculator", description: "Calculate weight of steel bars, plates, and sections.", category: "Construction", icon: Hammer, isBuilt: false },
  { slug: "tile-calculator", name: "Tile Calculator", description: "Calculate number of tiles needed with cutting waste allowance.", category: "Construction", icon: Layers, isBuilt: false },
  { slug: "paint-calculator", name: "Paint Calculator", description: "Estimate gallons of paint needed for rooms and surfaces.", category: "Construction", icon: PaintBucket, isBuilt: false },
  { slug: "roofing-calculator", name: "Roofing Calculator", description: "Calculate roofing materials — shingles, squares, and underlayment.", category: "Construction", icon: Home, isBuilt: false },
  { slug: "gravel-calculator", name: "Gravel Calculator", description: "Calculate gravel volume and weight for landscaping projects.", category: "Construction", icon: Layers, isBuilt: false },
  { slug: "mulch-calculator", name: "Mulch Calculator", description: "Estimate mulch volume needed for garden beds and landscaping.", category: "Construction", icon: Layers, isBuilt: false },
  { slug: "stair-calculator", name: "Stair Calculator", description: "Calculate stair dimensions — rise, run, number of steps, and angles.", category: "Construction", icon: Layers, isBuilt: false },
  { slug: "flooring-calculator", name: "Flooring Calculator", description: "Calculate flooring material needed with waste factor.", category: "Construction", icon: Layers, isBuilt: false },
  { slug: "square-footage-calculator", name: "Square Footage Calculator", description: "Calculate square footage for rooms, yards, and irregular shapes.", category: "Construction", icon: Ruler, isBuilt: false },

  // ══════════════════════════════════════════════
  // 🚗 AUTOMOBILE
  // ══════════════════════════════════════════════
  { slug: "fuel-cost-calculator", name: "Fuel Cost Calculator", description: "Estimate fuel costs for trips based on distance and gas prices.", category: "Automobile", icon: Fuel, isBuilt: false },
  { slug: "gas-mileage-calculator", name: "Gas Mileage Calculator", description: "Calculate MPG and fuel efficiency from distance and fuel used.", category: "Automobile", icon: Gauge, isBuilt: false },
  { slug: "tire-size-calculator", name: "Tire Size Calculator", description: "Compare tire sizes and calculate diameter, width, and sidewall.", category: "Automobile", icon: Car, isBuilt: false },
  { slug: "car-lease-calculator", name: "Car Lease Calculator", description: "Calculate monthly car lease payments with residual and money factor.", category: "Automobile", icon: Car, isBuilt: true },
  { slug: "car-affordability-calculator", name: "Car Affordability Calculator", description: "Find out how much car you can afford based on income and budget.", category: "Automobile", icon: Car, isBuilt: false },
  { slug: "horsepower-calculator", name: "Horsepower Calculator", description: "Convert between horsepower, kilowatts, and brake horsepower.", category: "Automobile", icon: Gauge, isBuilt: false },

  // ══════════════════════════════════════════════
  // 💻 TECH
  // ══════════════════════════════════════════════
  { slug: "ip-subnet-calculator", name: "IP Subnet Calculator", description: "Calculate IP subnets, CIDR notation, and available hosts.", category: "Technology", icon: Cpu, isBuilt: false },
  { slug: "bandwidth-calculator", name: "Bandwidth Calculator", description: "Calculate bandwidth needs and file transfer times.", category: "Technology", icon: Wifi, isBuilt: false },
  { slug: "data-transfer-calculator", name: "Data Transfer Calculator", description: "Estimate data transfer time based on file size and speed.", category: "Technology", icon: HardDrive, isBuilt: false },
  { slug: "storage-converter", name: "Storage Converter", description: "Convert between bytes, KB, MB, GB, TB, and PB.", category: "Technology", icon: HardDrive, isBuilt: false },
  { slug: "password-generator", name: "Password Generator", description: "Generate secure passwords with customizable length and characters.", category: "Technology", icon: Lock, isBuilt: true },
  { slug: "screen-size-calculator", name: "Screen Size Calculator", description: "Calculate screen dimensions, PPI, and aspect ratio.", category: "Technology", icon: Cpu, isBuilt: true },

  // ══════════════════════════════════════════════
  // ⏳ TIME & DATE
  // ══════════════════════════════════════════════
  { slug: "age-calculator", name: "Age Calculator", description: "Calculate exact age in years, months, days from date of birth.", category: "Everyday Life", icon: Calendar, isBuilt: true },
  { slug: "date-calculator", name: "Date Calculator", description: "Add or subtract days, months, and years from a specific date.", category: "Everyday Life", icon: Calendar, isBuilt: true },
  { slug: "time-calculator", name: "Time Calculator", description: "Add or subtract time and calculate duration between times.", category: "Everyday Life", icon: Clock, isBuilt: false },
  { slug: "time-duration-calculator", name: "Time Duration Calculator", description: "Calculate the duration between two specific times.", category: "Everyday Life", icon: Clock, isBuilt: true },
  { slug: "day-counter", name: "Day Counter", description: "Count the number of days between two dates.", category: "Everyday Life", icon: Calendar, isBuilt: true },
  { slug: "hours-calculator", name: "Hours Calculator", description: "Calculate total hours worked with break deductions.", category: "Everyday Life", icon: Timer, isBuilt: false },

  // ══════════════════════════════════════════════
  // 🎓 EDUCATION
  // ══════════════════════════════════════════════
  { slug: "gpa-calculator", name: "GPA Calculator", description: "Calculate semester and cumulative GPA with weighted credits.", category: "Education", icon: GraduationCap, isBuilt: true },
  { slug: "percentage-to-cgpa-converter", name: "Percentage to CGPA Converter", description: "Convert percentage marks to CGPA and vice versa.", category: "Education", icon: Percent, isBuilt: true },
  { slug: "grade-calculator", name: "Grade Calculator", description: "Calculate weighted grades and find what you need on finals.", category: "Education", icon: BookOpen, isBuilt: true },
  { slug: "attendance-calculator", name: "Attendance Calculator", description: "Calculate attendance percentage and find how many classes can be skipped.", category: "Education", icon: Calendar, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🛍 LIFESTYLE
  // ══════════════════════════════════════════════
  { slug: "love-calculator", name: "Love Calculator", description: "Fun love compatibility calculator based on names.", category: "Everyday Life", icon: Heart, isBuilt: false },
  { slug: "tip-calculator", name: "Tip Calculator", description: "Calculate tip amount and split bills between people.", category: "Everyday Life", icon: DollarSign, isBuilt: true },
  { slug: "discount-calculator", name: "Discount Calculator", description: "Calculate discount amount and final price after percent off.", category: "Everyday Life", icon: ShoppingBag, isBuilt: true },
  { slug: "wedding-budget-calculator", name: "Wedding Budget Calculator", description: "Plan and track wedding expenses across categories.", category: "Everyday Life", icon: Heart, isBuilt: false },
  { slug: "bra-size-calculator", name: "Bra Size Calculator", description: "Find your bra size from band and bust measurements.", category: "Everyday Life", icon: Ruler, isBuilt: false },
  { slug: "shoe-size-converter", name: "Shoe Size Converter", description: "Convert shoe sizes between US, UK, EU, and CM.", category: "Everyday Life", icon: Ruler, isBuilt: false },
  { slug: "dice-roller", name: "Dice Roller", description: "Roll virtual dice with customizable number and sides.", category: "Everyday Life", icon: Dice1, isBuilt: false },
  { slug: "golf-handicap-calculator", name: "Golf Handicap Calculator", description: "Calculate golf handicap index from recent scores.", category: "Everyday Life", icon: Target, isBuilt: false },
  { slug: "height-calculator", name: "Height Calculator", description: "Convert height between feet/inches and centimeters.", category: "Everyday Life", icon: Ruler, isBuilt: false },
  { slug: "roman-numeral-converter", name: "Roman Numeral Converter", description: "Convert between Roman numerals and decimal numbers.", category: "Everyday Life", icon: Hash, isBuilt: false },
  { slug: "conversion-calculator", name: "Conversion Calculator", description: "Convert between units of length, weight, temperature, and more.", category: "Everyday Life", icon: Sparkles, isBuilt: false },

  // ══════════════════════════════════════════════
  // 🔄 CONVERSION
  // ══════════════════════════════════════════════
  { slug: "temperature-converter", name: "Temperature Converter", description: "Convert between Celsius, Fahrenheit, Kelvin, and Rankine.", category: "Conversion", icon: Thermometer, isBuilt: true },
  { slug: "length-converter", name: "Length Converter", description: "Convert between metric and imperial length units.", category: "Conversion", icon: Ruler, isBuilt: true },
  { slug: "weight-converter", name: "Weight Converter", description: "Convert between metric and imperial weight units.", category: "Conversion", icon: Gauge, isBuilt: true },
  { slug: "speed-converter", name: "Speed Converter", description: "Convert between m/s, km/h, mph, knots, and Mach.", category: "Conversion", icon: Gauge, isBuilt: true },
  { slug: "currency-converter", name: "Currency Converter", description: "Convert between major world currencies.", category: "Conversion", icon: DollarSign, isBuilt: true },
  { slug: "time-zone-converter", name: "Time Zone Converter", description: "Convert times between different time zones worldwide.", category: "Conversion", icon: Globe, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🏢 BUSINESS
  // ══════════════════════════════════════════════
  { slug: "break-even-calculator", name: "Break Even Calculator", description: "Calculate break-even point in units and revenue.", category: "Finance", icon: BarChart3, isBuilt: true },
  { slug: "profit-margin-calculator", name: "Profit Margin Calculator", description: "Calculate gross, operating, and net profit margins.", category: "Finance", icon: TrendingUp, isBuilt: true },
  { slug: "markup-calculator", name: "Markup Calculator", description: "Calculate markup percentage, selling price, and cost price.", category: "Finance", icon: DollarSign, isBuilt: true },
  { slug: "inventory-turnover-calculator", name: "Inventory Turnover Calculator", description: "Calculate inventory turnover ratio and days to sell inventory.", category: "Finance", icon: Package, isBuilt: true },
  { slug: "working-capital-calculator", name: "Working Capital Calculator", description: "Calculate working capital and current ratio from assets and liabilities.", category: "Finance", icon: Briefcase, isBuilt: true },
  { slug: "ebitda-calculator", name: "EBITDA Calculator", description: "Calculate EBITDA and EBITDA margin from financial statements.", category: "Finance", icon: BarChart3, isBuilt: true },
  { slug: "vat-calculator", name: "VAT Calculator", description: "Calculate Value Added Tax — add or remove VAT from prices.", category: "Finance", icon: Receipt, isBuilt: true },
  { slug: "payback-period-calculator", name: "Payback Period Calculator", description: "Calculate payback period for capital investments.", category: "Finance", icon: Clock, isBuilt: true },
  { slug: "gdp-calculator", name: "GDP Calculator", description: "Calculate GDP using expenditure, income, or production approach.", category: "Finance", icon: Globe, isBuilt: true },
  { slug: "cash-back-vs-low-interest-calculator", name: "Cash Back vs Low Interest Calculator", description: "Compare cash back incentive versus low interest rate financing.", category: "Finance", icon: CircleDollarSign, isBuilt: false },

  // ══════════════════════════════════════════════
  // 💰 FINANCE — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Loans & Mortgages
  { slug: "bridge-loan-calculator", name: "Bridge Loan Calculator", description: "Calculate payments and costs for short-term bridge financing between properties.", category: "Finance", subcategory: "Loans & Mortgages", icon: Landmark, isBuilt: true },
  { slug: "balloon-mortgage-calculator", name: "Balloon Mortgage Calculator", description: "Estimate payments for mortgages with a large lump-sum payment at the end.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "reverse-mortgage-calculator", name: "Reverse Mortgage Calculator", description: "Calculate how much equity you can access through a reverse mortgage.", category: "Finance", subcategory: "Loans & Mortgages", icon: Home, isBuilt: true },
  { slug: "interest-only-mortgage-calculator", name: "Interest-Only Mortgage Calculator", description: "Calculate monthly payments during the interest-only period of your mortgage.", category: "Finance", subcategory: "Loans & Mortgages", icon: Percent, isBuilt: true },
  { slug: "pmi-calculator", name: "PMI Calculator", description: "Estimate your Private Mortgage Insurance cost based on loan-to-value ratio.", category: "Finance", subcategory: "Loans & Mortgages", icon: Shield, isBuilt: true },
  { slug: "points-break-even-calculator", name: "Mortgage Points Break-Even Calculator", description: "Calculate how long it takes to recoup the cost of buying mortgage discount points.", category: "Finance", subcategory: "Loans & Mortgages", icon: Target, isBuilt: true },
  { slug: "hard-money-loan-calculator", name: "Hard Money Loan Calculator", description: "Estimate the cost and payments for short-term hard money real estate loans.", category: "Finance", subcategory: "Loans & Mortgages", icon: DollarSign, isBuilt: true },
  { slug: "commercial-loan-calculator", name: "Commercial Loan Calculator", description: "Calculate monthly payments and amortization for commercial real estate loans.", category: "Finance", subcategory: "Loans & Mortgages", icon: Building, isBuilt: true },
  { slug: "construction-loan-draw-calculator", name: "Construction Loan Draw Calculator", description: "Track and calculate draw schedules and interest on construction loans.", category: "Finance", subcategory: "Loans & Mortgages", icon: HardHat, isBuilt: true },

  // Debt & Credit
  { slug: "debt-to-income-calculator", name: "Debt-to-Income Ratio Calculator", description: "Calculate your DTI ratio to assess mortgage and loan eligibility.", category: "Finance", subcategory: "Debt & Credit", icon: PieChart, isBuilt: true },
  { slug: "balance-transfer-calculator", name: "Balance Transfer Calculator", description: "Compare savings from transferring high-interest credit card balances.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },
  { slug: "loan-payoff-calculator", name: "Loan Payoff Calculator", description: "Find out how much extra you need to pay to become debt-free by a target date.", category: "Finance", subcategory: "Debt & Credit", icon: TrendingDown, isBuilt: true },
  { slug: "credit-score-estimator", name: "Credit Score Estimator", description: "Estimate your credit score range based on payment history and utilization.", category: "Finance", subcategory: "Debt & Credit", icon: Shield, isBuilt: true },
  { slug: "minimum-payment-calculator", name: "Minimum Payment Calculator", description: "See how long it takes to pay off debt making only minimum payments.", category: "Finance", subcategory: "Debt & Credit", icon: CreditCard, isBuilt: true },

  // Income & Tax
  { slug: "self-employment-tax-calculator", name: "Self-Employment Tax Calculator", description: "Calculate self-employment taxes including Social Security and Medicare contributions.", category: "Finance", subcategory: "Income & Tax", icon: Briefcase, isBuilt: true },
  { slug: "capital-gains-tax-calculator", name: "Capital Gains Tax Calculator", description: "Estimate taxes on profits from selling stocks, real estate, or other assets.", category: "Finance", subcategory: "Income & Tax", icon: TrendingUp, isBuilt: true },
  { slug: "tax-refund-calculator", name: "Tax Refund Estimator", description: "Estimate your federal income tax refund or amount owed for the year.", category: "Finance", subcategory: "Income & Tax", icon: Receipt, isBuilt: true },
  { slug: "quarterly-tax-calculator", name: "Quarterly Estimated Tax Calculator", description: "Calculate quarterly tax payments to avoid IRS underpayment penalties.", category: "Finance", subcategory: "Income & Tax", icon: Calendar, isBuilt: true },
  { slug: "tax-bracket-calculator", name: "Tax Bracket Calculator", description: "Find your marginal and effective federal income tax rates by bracket.", category: "Finance", subcategory: "Income & Tax", icon: BarChart3, isBuilt: true },
  { slug: "payroll-tax-calculator", name: "Payroll Tax Calculator", description: "Calculate employer and employee payroll tax obligations by state.", category: "Finance", subcategory: "Income & Tax", icon: Wallet, isBuilt: true },
  { slug: "net-pay-calculator", name: "Net Pay Calculator", description: "Calculate your actual take-home pay after all taxes and deductions.", category: "Finance", subcategory: "Income & Tax", icon: DollarSign, isBuilt: true },
  { slug: "w4-withholding-calculator", name: "W-4 Withholding Calculator", description: "Determine the correct withholding allowances for your W-4 form.", category: "Finance", subcategory: "Income & Tax", icon: FileText, isBuilt: true },

  // Investment
  { slug: "stock-calculator", name: "Stock Return Calculator", description: "Calculate total return on a stock investment including dividends and price appreciation.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "dividend-reinvestment-calculator", name: "Dividend Reinvestment Calculator", description: "Project long-term wealth from automatically reinvesting dividends (DRIP).", category: "Finance", subcategory: "Investment", icon: RefreshCw, isBuilt: true },

  // Savings
  { slug: "emergency-fund-calculator", name: "Emergency Fund Calculator", description: "Calculate how much you need in an emergency fund based on monthly expenses.", category: "Finance", subcategory: "Savings", icon: Shield, isBuilt: true },
  { slug: "savings-goal-calculator", name: "Savings Goal Calculator", description: "Find out how much to save monthly to reach a specific financial goal.", category: "Finance", subcategory: "Savings", icon: Target, isBuilt: true },
  { slug: "rule-of-72-calculator", name: "Rule of 72 Calculator", description: "Estimate how many years it takes to double your money at a given interest rate.", category: "Finance", subcategory: "Savings", icon: Zap, isBuilt: true },

  // Retirement
  { slug: "ira-calculator", name: "IRA Calculator", description: "Project traditional or Roth IRA growth with annual contributions and tax treatment.", category: "Finance", subcategory: "Retirement", icon: Landmark, isBuilt: true },
  { slug: "social-security-benefits-calculator", name: "Social Security Benefits Calculator", description: "Estimate your monthly Social Security benefit at different claiming ages.", category: "Finance", subcategory: "Retirement", icon: Shield, isBuilt: true },
  { slug: "early-retirement-calculator", name: "Early Retirement Calculator", description: "Calculate how much you need to save to retire before the traditional age.", category: "Finance", subcategory: "Retirement", icon: Target, isBuilt: true },
  { slug: "required-minimum-distribution-calculator", name: "Required Minimum Distribution Calculator", description: "Calculate your annual RMD from traditional IRAs and 401(k) accounts.", category: "Finance", subcategory: "Retirement", icon: Calendar, isBuilt: false },
  { slug: "safe-withdrawal-rate-calculator", name: "Safe Withdrawal Rate Calculator", description: "Determine a sustainable annual withdrawal rate from your retirement portfolio.", category: "Finance", subcategory: "Retirement", icon: PiggyBank, isBuilt: true },

  // Business Finance
  { slug: "business-valuation-calculator", name: "Business Valuation Calculator", description: "Estimate the fair market value of a business using earnings-based methods.", category: "Finance", subcategory: "Business Finance", icon: Briefcase, isBuilt: true },
  { slug: "burn-rate-calculator", name: "Startup Burn Rate Calculator", description: "Calculate monthly cash burn and runway for startups and early-stage companies.", category: "Finance", subcategory: "Business Finance", icon: TrendingDown, isBuilt: true },
  { slug: "customer-acquisition-cost-calculator", name: "Customer Acquisition Cost Calculator", description: "Calculate the total cost to acquire one new customer across all channels.", category: "Finance", subcategory: "Business Finance", icon: Target, isBuilt: true },
  { slug: "lifetime-value-calculator", name: "Customer Lifetime Value Calculator", description: "Estimate the total revenue a business can expect from a single customer.", category: "Finance", subcategory: "Business Finance", icon: TrendingUp, isBuilt: true },
  { slug: "net-present-value-calculator", name: "Net Present Value (NPV) Calculator", description: "Evaluate investment profitability by calculating net present value of future cash flows.", category: "Finance", subcategory: "Business Finance", icon: BarChart3, isBuilt: true },
  { slug: "payback-period-calculator-advanced", name: "Payback Period Calculator", description: "Calculate how long it takes to recover the initial cost of an investment.", category: "Finance", subcategory: "Business Finance", icon: Clock, isBuilt: false },
  { slug: "accounts-receivable-calculator", name: "Accounts Receivable Turnover Calculator", description: "Measure how efficiently a company collects revenue from customers.", category: "Finance", subcategory: "Business Finance", icon: RefreshCw, isBuilt: true },
  { slug: "debt-service-coverage-ratio-calculator", name: "Debt Service Coverage Ratio Calculator", description: "Calculate DSCR to assess a company's ability to service its debt.", category: "Finance", subcategory: "Business Finance", icon: Shield, isBuilt: true },
  { slug: "return-on-equity-calculator", name: "Return on Equity (ROE) Calculator", description: "Measure how effectively a company generates profit from shareholders' equity.", category: "Finance", subcategory: "Business Finance", icon: TrendingUp, isBuilt: true },
  { slug: "return-on-assets-calculator", name: "Return on Assets (ROA) Calculator", description: "Calculate how efficiently a company uses its assets to generate earnings.", category: "Finance", subcategory: "Business Finance", icon: BarChart3, isBuilt: true },

  // Crypto
  { slug: "crypto-profit-calculator", name: "Crypto Profit Calculator", description: "Calculate profit or loss on any cryptocurrency trade including fees.", category: "Finance", subcategory: "Crypto", icon: Bitcoin, isBuilt: false },
  { slug: "bitcoin-mining-calculator", name: "Bitcoin Mining Calculator", description: "Estimate Bitcoin mining profitability based on hash rate and electricity cost.", category: "Finance", subcategory: "Crypto", icon: Cpu, isBuilt: false },
  { slug: "crypto-tax-calculator", name: "Crypto Tax Calculator", description: "Estimate capital gains taxes on cryptocurrency trades using FIFO or LIFO.", category: "Finance", subcategory: "Crypto", icon: Receipt, isBuilt: false },
  { slug: "ethereum-gas-calculator", name: "Ethereum Gas Fee Calculator", description: "Calculate Ethereum transaction fees based on gas price and usage.", category: "Finance", subcategory: "Crypto", icon: Zap, isBuilt: false },
  { slug: "staking-rewards-calculator", name: "Staking Rewards Calculator", description: "Estimate annual earnings from staking cryptocurrency tokens.", category: "Finance", subcategory: "Crypto", icon: TrendingUp, isBuilt: false },
  { slug: "crypto-position-size-calculator", name: "Crypto Position Size Calculator", description: "Calculate the correct position size for crypto trades based on risk tolerance.", category: "Finance", subcategory: "Crypto", icon: Target, isBuilt: false },

  // Personal Finance
  { slug: "budget-calculator", name: "Monthly Budget Calculator", description: "Create and track a monthly budget to manage income and expenses effectively.", category: "Finance", subcategory: "Personal Finance", icon: PieChart, isBuilt: true },
  { slug: "50-30-20-budget-calculator", name: "50/30/20 Budget Calculator", description: "Allocate income using the 50/30/20 rule: needs, wants, and savings.", category: "Finance", subcategory: "Personal Finance", icon: PieChart, isBuilt: true },
  { slug: "net-worth-tracker", name: "Net Worth Tracker", description: "Track total assets minus liabilities to calculate and monitor your net worth.", category: "Finance", subcategory: "Personal Finance", icon: TrendingUp, isBuilt: true },
  { slug: "cost-of-living-calculator", name: "Cost of Living Calculator", description: "Compare the cost of living between two cities to plan a relocation.", category: "Finance", subcategory: "Personal Finance", icon: Globe, isBuilt: true },
  { slug: "bill-split-calculator", name: "Bill Split Calculator", description: "Easily split a bill equally or by percentage among any number of people.", category: "Finance", subcategory: "Personal Finance", icon: Users, isBuilt: true },
  { slug: "grocery-budget-calculator", name: "Grocery Budget Calculator", description: "Estimate monthly grocery spending based on household size and diet type.", category: "Finance", subcategory: "Personal Finance", icon: ShoppingBag, isBuilt: false },
  { slug: "subscription-cost-calculator", name: "Subscription Cost Calculator", description: "Calculate the true annual cost of all your recurring subscription services.", category: "Finance", subcategory: "Personal Finance", icon: CreditCard, isBuilt: true },
  { slug: "vacation-budget-calculator", name: "Vacation Budget Calculator", description: "Plan and estimate total costs for your next vacation including travel and hotels.", category: "Finance", subcategory: "Personal Finance", icon: Globe, isBuilt: false },

  // Insurance
  { slug: "life-insurance-calculator", name: "Life Insurance Calculator", description: "Determine how much life insurance coverage your family needs.", category: "Finance", subcategory: "Insurance", icon: Heart, isBuilt: true },
  { slug: "home-insurance-calculator", name: "Home Insurance Calculator", description: "Estimate homeowners insurance premiums based on property value and location.", category: "Finance", subcategory: "Insurance", icon: Home, isBuilt: true },
  { slug: "car-insurance-calculator", name: "Car Insurance Calculator", description: "Estimate auto insurance premiums based on vehicle, driver, and coverage type.", category: "Finance", subcategory: "Insurance", icon: Car, isBuilt: true },
  { slug: "health-insurance-calculator", name: "Health Insurance Premium Calculator", description: "Compare health insurance plan costs including premiums, deductibles, and out-of-pocket maximums.", category: "Finance", subcategory: "Insurance", icon: Activity, isBuilt: false },
  { slug: "disability-insurance-calculator", name: "Disability Insurance Calculator", description: "Calculate how much disability insurance you need to replace lost income.", category: "Finance", subcategory: "Insurance", icon: Shield, isBuilt: false },
  { slug: "term-life-vs-whole-life-calculator", name: "Term Life vs Whole Life Calculator", description: "Compare the long-term costs and benefits of term and whole life insurance policies.", category: "Finance", subcategory: "Insurance", icon: BarChart3, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🏥 HEALTH — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Body Metrics
  { slug: "visceral-fat-calculator", name: "Visceral Fat Calculator", description: "Estimate your visceral fat level and assess metabolic health risk.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "pediatric-bmi-calculator", name: "Pediatric BMI Calculator", description: "Calculate BMI for children and teens aged 2–19 with age and gender percentiles.", category: "Health", subcategory: "Body Metrics", icon: Baby, isBuilt: false },
  { slug: "ponderal-index-calculator", name: "Ponderal Index Calculator", description: "Calculate the Ponderal Index as an alternative to BMI for assessing body composition.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "body-frame-size-calculator", name: "Body Frame Size Calculator", description: "Determine your body frame size (small, medium, large) from wrist circumference.", category: "Health", subcategory: "Body Metrics", icon: Ruler, isBuilt: false },
  { slug: "max-heart-rate-calculator", name: "Maximum Heart Rate Calculator", description: "Calculate your estimated maximum heart rate based on age and fitness level.", category: "Health", subcategory: "Body Metrics", icon: Heart, isBuilt: false },
  { slug: "mean-arterial-pressure-calculator", name: "Mean Arterial Pressure Calculator", description: "Calculate MAP from systolic and diastolic blood pressure readings.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "fitness-age-calculator", name: "Fitness Age Calculator", description: "Estimate your biological fitness age based on cardiovascular capacity and lifestyle.", category: "Health", subcategory: "Body Metrics", icon: Dumbbell, isBuilt: false },
  { slug: "bmi-prime-calculator", name: "BMI Prime Calculator", description: "Calculate BMI Prime — the ratio of your BMI to the upper limit of normal BMI.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },
  { slug: "creatinine-clearance-calculator", name: "Creatinine Clearance Calculator", description: "Estimate kidney function using the Cockcroft-Gault creatinine clearance formula.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: false },

  // Nutrition
  { slug: "glycemic-load-calculator", name: "Glycemic Load Calculator", description: "Calculate the glycemic load of foods to manage blood sugar impact.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: true },
  { slug: "glycemic-index-calculator", name: "Glycemic Index Calculator", description: "Look up and compare glycemic index values across common foods.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: false },
  { slug: "omega-3-calculator", name: "Omega-3 Intake Calculator", description: "Determine your daily omega-3 needs based on age, weight, and health goals.", category: "Health", subcategory: "Nutrition", icon: Droplets, isBuilt: false },
  { slug: "vitamin-d-calculator", name: "Vitamin D Dosage Calculator", description: "Calculate your recommended vitamin D intake based on sun exposure and deficiency risk.", category: "Health", subcategory: "Nutrition", icon: Sparkles, isBuilt: false },
  { slug: "fiber-intake-calculator", name: "Daily Fiber Intake Calculator", description: "Calculate your recommended daily fiber intake based on age and calorie needs.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: false },
  { slug: "sodium-intake-calculator", name: "Sodium Intake Calculator", description: "Estimate daily sodium needs and flag excess intake for heart health.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: false },
  { slug: "potassium-intake-calculator", name: "Potassium Intake Calculator", description: "Calculate daily potassium requirements for blood pressure and muscle health.", category: "Health", subcategory: "Nutrition", icon: Apple, isBuilt: false },
  { slug: "caffeine-calculator", name: "Caffeine Intake Calculator", description: "Track daily caffeine intake from coffee, tea, and supplements with safe limits.", category: "Health", subcategory: "Nutrition", icon: Coffee, isBuilt: false },
  { slug: "alcohol-calories-calculator", name: "Alcohol Calorie Calculator", description: "Calculate the total calories in beer, wine, and spirits per serving.", category: "Health", subcategory: "Nutrition", icon: Wine, isBuilt: false },
  { slug: "intermittent-fasting-calculator", name: "Intermittent Fasting Calculator", description: "Calculate fasting and eating windows for 16:8, 5:2, and other IF protocols.", category: "Health", subcategory: "Nutrition", icon: Clock, isBuilt: true },
  { slug: "nutrient-timing-calculator", name: "Nutrient Timing Calculator", description: "Optimize meal and nutrient timing around workouts for performance and recovery.", category: "Health", subcategory: "Nutrition", icon: Timer, isBuilt: false },
  { slug: "daily-calorie-burn-calculator", name: "Daily Calorie Burn Calculator", description: "Estimate total daily calorie expenditure from resting and active metabolism.", category: "Health", subcategory: "Nutrition", icon: Activity, isBuilt: false },

  // Pregnancy
  { slug: "fetal-weight-calculator", name: "Fetal Weight Calculator", description: "Estimate fetal weight by week of pregnancy using standard growth charts.", category: "Health", subcategory: "Pregnancy", icon: Baby, isBuilt: false },
  { slug: "gestational-age-calculator", name: "Gestational Age Calculator", description: "Calculate gestational age from the last menstrual period or ultrasound date.", category: "Health", subcategory: "Pregnancy", icon: Calendar, isBuilt: false },
  { slug: "breastfeeding-calorie-calculator", name: "Breastfeeding Calorie Calculator", description: "Calculate extra calories needed while breastfeeding based on feeding frequency.", category: "Health", subcategory: "Pregnancy", icon: Heart, isBuilt: false },
  { slug: "baby-growth-percentile-calculator", name: "Baby Growth Percentile Calculator", description: "Track baby weight, height, and head circumference against WHO growth percentiles.", category: "Health", subcategory: "Pregnancy", icon: Baby, isBuilt: false },
  { slug: "postpartum-weight-loss-calculator", name: "Postpartum Weight Loss Calculator", description: "Estimate healthy weight loss timeline after childbirth based on calories and activity.", category: "Health", subcategory: "Pregnancy", icon: Activity, isBuilt: false },
  { slug: "prenatal-vitamin-calculator", name: "Prenatal Vitamin Calculator", description: "Calculate key prenatal nutrient requirements including folic acid and iron by trimester.", category: "Health", subcategory: "Pregnancy", icon: Apple, isBuilt: false },
  { slug: "ivf-due-date-calculator", name: "IVF Due Date Calculator", description: "Calculate the expected due date for pregnancies achieved through IVF.", category: "Health", subcategory: "Pregnancy", icon: Calendar, isBuilt: false },

  // Activity
  { slug: "steps-to-calories-calculator", name: "Steps to Calories Calculator", description: "Convert daily step count to estimated calorie burn based on weight and stride.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: true },
  { slug: "mets-calculator", name: "METs Activity Calculator", description: "Calculate energy expenditure in METs for hundreds of physical activities.", category: "Health", subcategory: "Activity", icon: Dumbbell, isBuilt: false },
  { slug: "calories-burned-walking", name: "Calories Burned Walking Calculator", description: "Estimate calories burned walking based on distance, pace, and body weight.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: false },
  { slug: "cycling-calories-calculator", name: "Cycling Calorie Calculator", description: "Estimate calories burned during cycling based on speed, duration, and terrain.", category: "Health", subcategory: "Activity", icon: Gauge, isBuilt: false },
  { slug: "active-metabolic-rate-calculator", name: "Active Metabolic Rate Calculator", description: "Calculate AMR — total daily calories burned including all physical activities.", category: "Health", subcategory: "Activity", icon: Zap, isBuilt: false },
  { slug: "calorie-deficit-calculator", name: "Calorie Deficit Calculator", description: "Calculate the daily calorie deficit needed to lose a specific amount of weight per week.", category: "Health", subcategory: "Activity", icon: TrendingDown, isBuilt: true },
  { slug: "heart-rate-recovery-calculator", name: "Heart Rate Recovery Calculator", description: "Measure cardiovascular fitness by tracking how fast your heart rate drops after exercise.", category: "Health", subcategory: "Activity", icon: Heart, isBuilt: false },
  { slug: "workout-calorie-calculator", name: "Workout Calorie Calculator", description: "Estimate total calories burned during a full workout session by exercise type.", category: "Health", subcategory: "Activity", icon: Dumbbell, isBuilt: false },
  { slug: "fat-burning-zone-calculator", name: "Fat Burning Zone Calculator", description: "Calculate your optimal heart rate zone for maximum fat burning during exercise.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: true },
  { slug: "marathon-training-calculator", name: "Marathon Training Pace Calculator", description: "Calculate target training paces for long runs, tempo runs, and intervals.", category: "Health", subcategory: "Activity", icon: Activity, isBuilt: false },
  { slug: "swimming-calorie-calculator", name: "Swimming Calorie Calculator", description: "Estimate calories burned swimming different strokes at various intensities.", category: "Health", subcategory: "Activity", icon: Droplets, isBuilt: false },
  { slug: "hiit-calorie-calculator", name: "HIIT Calorie Calculator", description: "Estimate calories burned during high-intensity interval training sessions.", category: "Health", subcategory: "Activity", icon: Zap, isBuilt: false },

  // Medical
  { slug: "sleep-debt-calculator", name: "Sleep Debt Calculator", description: "Calculate accumulated sleep debt and time needed to recover full rest.", category: "Health", subcategory: "Medical", icon: Moon, isBuilt: true },
  { slug: "caffeine-half-life-calculator", name: "Caffeine Half-Life Calculator", description: "Calculate when caffeine will clear your system based on intake time and amount.", category: "Health", subcategory: "Medical", icon: Clock, isBuilt: false },
  { slug: "drug-dosage-calculator", name: "Drug Dosage Calculator", description: "Calculate medication dosage based on patient weight and prescribed mg/kg.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "ibw-calculator", name: "Ideal Body Weight Calculator", description: "Calculate ideal body weight using Devine, Robinson, Miller, and Hamwi formulas.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "heart-attack-risk-calculator", name: "Heart Attack Risk Calculator", description: "Estimate 10-year cardiovascular disease risk using the Framingham risk score.", category: "Health", subcategory: "Medical", icon: Heart, isBuilt: false },
  { slug: "diabetes-risk-calculator", name: "Diabetes Risk Calculator", description: "Assess your risk of developing type 2 diabetes based on lifestyle and family history.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "cholesterol-ratio-calculator", name: "Cholesterol Ratio Calculator", description: "Calculate LDL/HDL ratio and total cholesterol risk from a lipid panel.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "bmi-classification-calculator", name: "BMI Classification Calculator", description: "Classify BMI into underweight, normal, overweight, or obese categories with health context.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: true },
  { slug: "hydration-calculator", name: "Daily Hydration Calculator", description: "Calculate precise daily water needs based on body weight, activity level, and climate.", category: "Health", subcategory: "Medical", icon: Droplets, isBuilt: true },
  { slug: "menstrual-cycle-length-calculator", name: "Menstrual Cycle Length Calculator", description: "Calculate average cycle length and predict next periods from cycle history.", category: "Health", subcategory: "Medical", icon: Calendar, isBuilt: false },
  { slug: "caloric-expenditure-calculator", name: "Daily Caloric Expenditure Calculator", description: "Calculate total daily energy expenditure using Harris-Benedict or Mifflin-St Jeor.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "blood-pressure-category-calculator", name: "Blood Pressure Category Calculator", description: "Classify blood pressure readings and assess hypertension stage and risk.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: true },
  { slug: "covid-symptom-calculator", name: "COVID-19 Symptom Risk Calculator", description: "Assess COVID-19 symptom severity and determine recommended care pathway.", category: "Health", subcategory: "Medical", icon: Shield, isBuilt: false },
  { slug: "vaccination-schedule-calculator", name: "Vaccination Schedule Calculator", description: "Generate a recommended vaccination schedule based on age and health status.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "fertility-window-calculator", name: "Fertility Window Calculator", description: "Calculate peak fertile days and conception window based on cycle length.", category: "Health", subcategory: "Medical", icon: Heart, isBuilt: false },
  { slug: "hemoglobin-calculator", name: "Hemoglobin Level Calculator", description: "Assess hemoglobin levels for anemia classification by age and gender.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "pulse-ox-calculator", name: "Pulse Oximetry Calculator", description: "Interpret SpO2 readings and understand oxygen saturation levels and ranges.", category: "Health", subcategory: "Medical", icon: Activity, isBuilt: false },
  { slug: "fever-calculator", name: "Fever Assessment Calculator", description: "Determine fever severity and recommended treatment based on temperature and age.", category: "Health", subcategory: "Medical", icon: Thermometer, isBuilt: false },



  // ══════════════════════════════════════════════
  // 📐 MATH — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Basic
  { slug: "modulo-calculator", name: "Modulo Calculator", description: "Calculate the remainder of division between any two numbers.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "ceiling-floor-calculator", name: "Ceiling & Floor Calculator", description: "Calculate ceiling and floor values for rounding real numbers.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "absolute-value-calculator", name: "Absolute Value Calculator", description: "Find the absolute value of any number or expression.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "factorial-calculator", name: "Factorial Calculator", description: "Calculate the factorial of any non-negative integer step by step.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: false },
  { slug: "fibonacci-calculator", name: "Fibonacci Sequence Calculator", description: "Generate Fibonacci sequence terms and find any position in the series.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "base-conversion-calculator", name: "Base Conversion Calculator", description: "Convert numbers between binary, octal, decimal, and hexadecimal bases.", category: "Math", subcategory: "Basic", icon: Binary, isBuilt: false },
  { slug: "number-to-words-converter", name: "Number to Words Converter", description: "Convert any number to its English word representation.", category: "Math", subcategory: "Basic", icon: Hash, isBuilt: false },
  { slug: "average-calculator", name: "Average Calculator", description: "Calculate the arithmetic mean of a set of numbers quickly.", category: "Math", subcategory: "Basic", icon: Calculator, isBuilt: false },
  { slug: "median-calculator", name: "Median Calculator", description: "Find the median value in any data set, odd or even count.", category: "Math", subcategory: "Basic", icon: BarChart3, isBuilt: false },
  { slug: "mode-calculator", name: "Mode Calculator", description: "Find the most frequently occurring value in a data set.", category: "Math", subcategory: "Basic", icon: BarChart3, isBuilt: false },
  { slug: "range-calculator", name: "Range Calculator", description: "Calculate the range, minimum, and maximum of a data set.", category: "Math", subcategory: "Basic", icon: BarChart3, isBuilt: false },
  { slug: "antilog-calculator", name: "Antilog Calculator", description: "Calculate the antilogarithm for any base from a given log value.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: false },
  { slug: "cube-root-calculator", name: "Cube Root Calculator", description: "Calculate the cube root of any number with exact or decimal precision.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: false },
  { slug: "nth-root-calculator", name: "Nth Root Calculator", description: "Calculate any nth root of a number for any positive integer n.", category: "Math", subcategory: "Basic", icon: Sigma, isBuilt: true },

  // Algebra
  { slug: "system-of-equations-calculator", name: "System of Equations Calculator", description: "Solve 2×2 and 3×3 systems of linear equations by substitution or elimination.", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },
  { slug: "completing-the-square-calculator", name: "Completing the Square Calculator", description: "Convert quadratic equations to vertex form by completing the square.", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },
  { slug: "complex-numbers-calculator", name: "Complex Numbers Calculator", description: "Add, subtract, multiply, and divide complex numbers in rectangular and polar form.", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },
  { slug: "inequality-calculator", name: "Inequality Calculator", description: "Solve linear and quadratic inequalities and display solution on a number line.", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },
  { slug: "arithmetic-progression-calculator", name: "Arithmetic Progression Calculator", description: "Find nth term and sum of an arithmetic sequence given first term and difference.", category: "Math", subcategory: "Algebra", icon: Hash, isBuilt: false },
  { slug: "geometric-progression-calculator", name: "Geometric Progression Calculator", description: "Find nth term and sum of a geometric sequence given first term and ratio.", category: "Math", subcategory: "Algebra", icon: Hash, isBuilt: false },
  { slug: "exponential-growth-calculator", name: "Exponential Growth Calculator", description: "Model exponential growth for population, bacteria, investments, and more.", category: "Math", subcategory: "Algebra", icon: TrendingUp, isBuilt: false },
  { slug: "exponential-decay-calculator", name: "Exponential Decay Calculator", description: "Model exponential decay for radioactive materials, drug clearance, and depreciation.", category: "Math", subcategory: "Algebra", icon: TrendingDown, isBuilt: false },
  { slug: "logarithm-change-of-base-calculator", name: "Change of Base Calculator", description: "Convert logarithms between different bases using the change of base formula.", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },
  { slug: "direct-variation-calculator", name: "Direct Variation Calculator", description: "Solve direct variation problems and find the constant of proportionality.", category: "Math", subcategory: "Algebra", icon: TrendingUp, isBuilt: false },
  { slug: "inverse-variation-calculator", name: "Inverse Variation Calculator", description: "Solve inverse variation problems where two quantities vary inversely.", category: "Math", subcategory: "Algebra", icon: TrendingDown, isBuilt: false },
  { slug: "function-composition-calculator", name: "Function Composition Calculator", description: "Compute the composition of two or more functions f(g(x)).", category: "Math", subcategory: "Algebra", icon: Sigma, isBuilt: false },

  // Geometry
  { slug: "perimeter-calculator", name: "Perimeter Calculator", description: "Calculate the perimeter of common 2D shapes including polygons and circles.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: true },
  { slug: "right-angle-calculator", name: "Right Angle Triangle Calculator", description: "Solve right triangles by entering any two known values.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "law-of-sines-calculator", name: "Law of Sines Calculator", description: "Solve oblique triangles using the Law of Sines.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "law-of-cosines-calculator", name: "Law of Cosines Calculator", description: "Solve any triangle using the Law of Cosines with SSS or SAS input.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "angle-converter", name: "Angle Converter", description: "Convert angles between degrees, radians, gradians, and turns.", category: "Math", subcategory: "Geometry", icon: Circle, isBuilt: false },
  { slug: "arc-length-calculator", name: "Arc Length Calculator", description: "Calculate the length of an arc given radius and central angle.", category: "Math", subcategory: "Geometry", icon: Circle, isBuilt: false },
  { slug: "sector-area-calculator", name: "Sector Area Calculator", description: "Calculate the area of a circle sector from radius and angle.", category: "Math", subcategory: "Geometry", icon: Circle, isBuilt: false },
  { slug: "ellipse-calculator", name: "Ellipse Calculator", description: "Calculate area, perimeter, and eccentricity of an ellipse.", category: "Math", subcategory: "Geometry", icon: Circle, isBuilt: false },
  { slug: "polygon-calculator", name: "Regular Polygon Calculator", description: "Calculate area, perimeter, and angles of any regular polygon.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "coordinate-geometry-calculator", name: "Coordinate Geometry Calculator", description: "Find distance, midpoint, and equation of a line through two points.", category: "Math", subcategory: "Geometry", icon: Ruler, isBuilt: false },
  { slug: "polygon-area-calculator", name: "Polygon Area Calculator", description: "Calculate the area of any irregular polygon using vertex coordinates.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "cone-calculator", name: "Cone Calculator", description: "Calculate volume, surface area, and slant height of a cone.", category: "Math", subcategory: "Geometry", icon: Triangle, isBuilt: false },
  { slug: "cylinder-calculator", name: "Cylinder Calculator", description: "Calculate volume, surface area, and lateral area of a cylinder.", category: "Math", subcategory: "Geometry", icon: Layers, isBuilt: false },
  { slug: "sphere-calculator", name: "Sphere Calculator", description: "Calculate volume and surface area of a sphere from radius or diameter.", category: "Math", subcategory: "Geometry", icon: Circle, isBuilt: false },

  // Statistics
  { slug: "correlation-coefficient-calculator", name: "Correlation Coefficient Calculator", description: "Calculate Pearson and Spearman correlation coefficients for two data sets.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "linear-regression-calculator", name: "Linear Regression Calculator", description: "Find the best-fit line and R² value for a set of data points.", category: "Math", subcategory: "Statistics", icon: TrendingUp, isBuilt: false },
  { slug: "chi-square-calculator", name: "Chi-Square Test Calculator", description: "Perform chi-square test of independence and goodness of fit.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: true },
  { slug: "t-test-calculator", name: "T-Test Calculator", description: "Perform one-sample, two-sample, and paired t-tests with p-values.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "binomial-distribution-calculator", name: "Binomial Distribution Calculator", description: "Calculate probabilities for binomial distributions with n trials and probability p.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "normal-distribution-calculator", name: "Normal Distribution Calculator", description: "Calculate area under the normal curve and find probabilities for z-scores.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "poisson-distribution-calculator", name: "Poisson Distribution Calculator", description: "Calculate event probabilities using the Poisson distribution formula.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "covariance-calculator", name: "Covariance Calculator", description: "Calculate population and sample covariance for two data sets.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "interquartile-range-calculator", name: "Interquartile Range Calculator", description: "Calculate Q1, Q2, Q3, and IQR from any data set.", category: "Math", subcategory: "Statistics", icon: BarChart3, isBuilt: false },
  { slug: "weighted-average-calculator", name: "Weighted Average Calculator", description: "Calculate the weighted mean of values with different weights or importance.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },

  // Calculus
  { slug: "derivative-calculator", name: "Derivative Calculator", description: "Find the derivative of common functions using differentiation rules.", category: "Math", subcategory: "Calculus", icon: Sigma, isBuilt: false },
  { slug: "integral-calculator", name: "Integral Calculator", description: "Calculate definite and indefinite integrals of standard functions.", category: "Math", subcategory: "Calculus", icon: Sigma, isBuilt: false },
  { slug: "limit-calculator", name: "Limit Calculator", description: "Evaluate the limit of a function as the variable approaches a value.", category: "Math", subcategory: "Calculus", icon: Sigma, isBuilt: false },
  { slug: "riemann-sum-calculator", name: "Riemann Sum Calculator", description: "Approximate definite integrals using left, right, and midpoint Riemann sums.", category: "Math", subcategory: "Calculus", icon: BarChart3, isBuilt: false },
  { slug: "taylor-series-calculator", name: "Taylor Series Calculator", description: "Expand a function as a Taylor series around a given point.", category: "Math", subcategory: "Calculus", icon: Sigma, isBuilt: false },
  { slug: "vector-operations-calculator", name: "Vector Operations Calculator", description: "Calculate dot product, cross product, magnitude, and angles between vectors.", category: "Math", subcategory: "Calculus", icon: Ruler, isBuilt: false },

  // Discrete Math
  { slug: "combinations-calculator", name: "Combinations Calculator", description: "Calculate nCr — the number of ways to choose r items from n without repetition.", category: "Math", subcategory: "Discrete Math", icon: Sigma, isBuilt: false },
  { slug: "permutations-calculator", name: "Permutations Calculator", description: "Calculate nPr — the number of ordered arrangements of r items from n.", category: "Math", subcategory: "Discrete Math", icon: Sigma, isBuilt: false },
  { slug: "set-operations-calculator", name: "Set Operations Calculator", description: "Perform union, intersection, difference, and complement of sets.", category: "Math", subcategory: "Discrete Math", icon: Layers, isBuilt: false },
  { slug: "truth-table-calculator", name: "Truth Table Calculator", description: "Generate truth tables for any logical expression with AND, OR, NOT, XOR.", category: "Math", subcategory: "Discrete Math", icon: Binary, isBuilt: false },
  { slug: "binary-decimal-calculator", name: "Binary to Decimal Calculator", description: "Convert between binary, decimal, octal, and hexadecimal number systems.", category: "Math", subcategory: "Discrete Math", icon: Binary, isBuilt: false },
  { slug: "two-complement-calculator", name: "Two's Complement Calculator", description: "Convert integers to two's complement binary representation and back.", category: "Math", subcategory: "Discrete Math", icon: Binary, isBuilt: false },
  { slug: "bitwise-operations-calculator", name: "Bitwise Operations Calculator", description: "Perform AND, OR, XOR, NOT, and shift operations on binary numbers.", category: "Math", subcategory: "Discrete Math", icon: Binary, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🔬 SCIENCE — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Physics
  { slug: "kinetic-energy-calculator", name: "Kinetic Energy Calculator", description: "Calculate kinetic energy of an object from its mass and velocity.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "potential-energy-calculator", name: "Potential Energy Calculator", description: "Calculate gravitational potential energy from mass, gravity, and height.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "work-power-calculator", name: "Work & Power Calculator", description: "Calculate work done, power output, and energy transfer in mechanical systems.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "momentum-calculator", name: "Momentum Calculator", description: "Calculate linear momentum and impulse from mass and velocity.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "acceleration-calculator", name: "Acceleration Calculator", description: "Calculate linear acceleration from velocity change and time.", category: "Science", subcategory: "Physics", icon: Gauge, isBuilt: false },
  { slug: "projectile-motion-calculator", name: "Projectile Motion Calculator", description: "Calculate range, max height, and flight time for projectile motion problems.", category: "Science", subcategory: "Physics", icon: Triangle, isBuilt: false },
  { slug: "gravitational-force-calculator", name: "Gravitational Force Calculator", description: "Calculate gravitational attraction between two masses using Newton's law.", category: "Science", subcategory: "Physics", icon: Globe, isBuilt: false },
  { slug: "circular-motion-calculator", name: "Circular Motion Calculator", description: "Calculate centripetal force, acceleration, and velocity for circular motion.", category: "Science", subcategory: "Physics", icon: Circle, isBuilt: false },
  { slug: "simple-pendulum-calculator", name: "Simple Pendulum Calculator", description: "Calculate period and frequency of a simple pendulum from its length.", category: "Science", subcategory: "Physics", icon: Clock, isBuilt: false },
  { slug: "spring-constant-calculator", name: "Spring Constant Calculator", description: "Calculate spring constant, force, and displacement using Hooke's Law.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "buoyancy-calculator", name: "Buoyancy Calculator", description: "Calculate buoyant force on an object submerged in a fluid.", category: "Science", subcategory: "Physics", icon: Droplets, isBuilt: false },
  { slug: "pressure-calculator", name: "Pressure Calculator", description: "Calculate pressure from force and area, or fluid depth and density.", category: "Science", subcategory: "Physics", icon: Gauge, isBuilt: false },
  { slug: "specific-heat-calculator", name: "Specific Heat Calculator", description: "Calculate heat transfer using the specific heat capacity formula.", category: "Science", subcategory: "Physics", icon: Thermometer, isBuilt: false },
  { slug: "frequency-wavelength-calculator", name: "Frequency & Wavelength Calculator", description: "Convert between frequency, wavelength, and wave speed for any wave.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "snells-law-calculator", name: "Snell's Law Calculator", description: "Calculate angle of refraction when light passes between two media.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "doppler-effect-calculator", name: "Doppler Effect Calculator", description: "Calculate the apparent frequency shift due to relative motion between source and observer.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "electric-field-calculator", name: "Electric Field Calculator", description: "Calculate electric field strength from charge and distance.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "resistors-in-parallel-calculator", name: "Resistors in Parallel Calculator", description: "Calculate total resistance for resistors connected in parallel.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "resistors-in-series-calculator", name: "Resistors in Series Calculator", description: "Calculate total resistance for resistors connected in series.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },
  { slug: "electric-power-calculator", name: "Electric Power Calculator", description: "Calculate electric power from voltage, current, or resistance combinations.", category: "Science", subcategory: "Physics", icon: Zap, isBuilt: false },

  // Chemistry
  { slug: "ph-calculator", name: "pH Calculator", description: "Calculate the pH of acids and bases from hydrogen ion concentration.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "buffer-solution-calculator", name: "Buffer Solution Calculator", description: "Calculate the pH of buffer solutions using the Henderson-Hasselbalch equation.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "ideal-gas-law-calculator", name: "Ideal Gas Law Calculator", description: "Solve for pressure, volume, temperature, or moles using PV=nRT.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "boyles-law-calculator", name: "Boyle's Law Calculator", description: "Calculate the relationship between pressure and volume at constant temperature.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "charles-law-calculator", name: "Charles's Law Calculator", description: "Calculate the relationship between volume and temperature at constant pressure.", category: "Science", subcategory: "Chemistry", icon: Thermometer, isBuilt: false },
  { slug: "combined-gas-law-calculator", name: "Combined Gas Law Calculator", description: "Solve combined gas law problems with pressure, volume, and temperature variables.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "dilution-calculator", name: "Solution Dilution Calculator", description: "Calculate concentration or volume needed to dilute a solution using C1V1=C2V2.", category: "Science", subcategory: "Chemistry", icon: Droplets, isBuilt: false },
  { slug: "stoichiometry-calculator", name: "Stoichiometry Calculator", description: "Calculate moles, mass, and volume relationships in chemical reactions.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "empirical-formula-calculator", name: "Empirical Formula Calculator", description: "Determine the empirical formula of a compound from percent composition.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "percent-yield-calculator", name: "Percent Yield Calculator", description: "Calculate percent yield of a chemical reaction from actual and theoretical yields.", category: "Science", subcategory: "Chemistry", icon: Percent, isBuilt: false },
  { slug: "limiting-reagent-calculator", name: "Limiting Reagent Calculator", description: "Find the limiting reagent and excess reactant in a chemical reaction.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "concentration-calculator", name: "Concentration Calculator", description: "Calculate solution concentration in molarity, molality, or mass percent.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "activation-energy-calculator", name: "Activation Energy Calculator", description: "Calculate activation energy from rate constants using the Arrhenius equation.", category: "Science", subcategory: "Chemistry", icon: Thermometer, isBuilt: false },
  { slug: "equilibrium-constant-calculator", name: "Equilibrium Constant Calculator", description: "Calculate Kc or Kp from equilibrium concentrations or partial pressures.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "titration-calculator", name: "Titration Calculator", description: "Calculate concentration of unknown solutions from titration data.", category: "Science", subcategory: "Chemistry", icon: Beaker, isBuilt: false },
  { slug: "osmolarity-calculator", name: "Osmolarity Calculator", description: "Calculate osmolarity of a solution from solute concentrations.", category: "Science", subcategory: "Chemistry", icon: Droplets, isBuilt: false },

  // Earth Science
  { slug: "thermal-expansion-calculator", name: "Thermal Expansion Calculator", description: "Calculate linear and volumetric thermal expansion of materials.", category: "Science", subcategory: "Earth Science", icon: Thermometer, isBuilt: false },
  { slug: "fluid-flow-calculator", name: "Fluid Flow Rate Calculator", description: "Calculate volumetric flow rate, velocity, and pipe cross-section area.", category: "Science", subcategory: "Earth Science", icon: Droplets, isBuilt: false },
  { slug: "decibel-calculator", name: "Decibel Calculator", description: "Convert between decibels and power or intensity ratios.", category: "Science", subcategory: "Earth Science", icon: Activity, isBuilt: false },
  { slug: "radioactive-decay-calculator", name: "Radioactive Decay Calculator", description: "Calculate remaining quantity after radioactive decay using half-life.", category: "Science", subcategory: "Earth Science", icon: Atom, isBuilt: false },
  { slug: "humidity-calculator", name: "Relative Humidity Calculator", description: "Calculate relative humidity, dew point, and wet-bulb temperature.", category: "Science", subcategory: "Earth Science", icon: Droplets, isBuilt: false },
  { slug: "barometric-pressure-calculator", name: "Barometric Pressure Calculator", description: "Calculate atmospheric pressure at different altitudes above sea level.", category: "Science", subcategory: "Earth Science", icon: Gauge, isBuilt: false },
  { slug: "uv-index-calculator", name: "UV Index Calculator", description: "Calculate UV exposure risk based on solar angle, altitude, and ozone levels.", category: "Science", subcategory: "Earth Science", icon: Sparkles, isBuilt: false },
  { slug: "altitude-calculator", name: "Altitude Calculator", description: "Calculate altitude from barometric pressure or GPS coordinates.", category: "Science", subcategory: "Earth Science", icon: Triangle, isBuilt: false },
  { slug: "magnetic-field-calculator", name: "Magnetic Field Calculator", description: "Calculate magnetic field strength around a current-carrying conductor.", category: "Science", subcategory: "Earth Science", icon: Zap, isBuilt: false },
  { slug: "power-factor-calculator", name: "Power Factor Calculator", description: "Calculate power factor, apparent power, and reactive power for AC circuits.", category: "Science", subcategory: "Earth Science", icon: Zap, isBuilt: false },
  { slug: "transformer-calculator", name: "Transformer Calculator", description: "Calculate primary/secondary voltage, current, and turns ratio for transformers.", category: "Science", subcategory: "Earth Science", icon: Zap, isBuilt: false },
  { slug: "efficiency-calculator", name: "Energy Efficiency Calculator", description: "Calculate energy efficiency ratio for machines, engines, and systems.", category: "Science", subcategory: "Earth Science", icon: Percent, isBuilt: false },
  { slug: "wind-speed-power-calculator", name: "Wind Speed & Power Calculator", description: "Calculate wind power density and turbine output from wind speed.", category: "Science", subcategory: "Earth Science", icon: Gauge, isBuilt: false },
  { slug: "tidal-prediction-calculator", name: "Tidal Force Calculator", description: "Calculate tidal force exerted by the Moon and Sun on ocean bodies.", category: "Science", subcategory: "Earth Science", icon: Globe, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🌞 EVERYDAY LIFE — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Time & Dates
  { slug: "time-difference-calculator", name: "Time Difference Calculator", description: "Calculate the exact difference between two times in hours, minutes, and seconds.", category: "Everyday Life", subcategory: "Time & Dates", icon: Clock, isBuilt: false },
  { slug: "work-hours-calculator", name: "Work Hours Calculator", description: "Calculate total work hours from clock-in and clock-out times including breaks.", category: "Everyday Life", subcategory: "Time & Dates", icon: Timer, isBuilt: false },
  { slug: "overtime-hours-calculator", name: "Overtime Hours Calculator", description: "Calculate regular and overtime hours worked and total pay for the week.", category: "Everyday Life", subcategory: "Time & Dates", icon: Clock, isBuilt: false },
  { slug: "date-difference-calculator", name: "Date Difference Calculator", description: "Calculate the number of days, weeks, and months between two dates.", category: "Everyday Life", subcategory: "Time & Dates", icon: Calendar, isBuilt: false },
  { slug: "weeks-calculator", name: "Weeks Between Dates Calculator", description: "Calculate the exact number of weeks between any two calendar dates.", category: "Everyday Life", subcategory: "Time & Dates", icon: Calendar, isBuilt: false },
  { slug: "months-calculator", name: "Months Between Dates Calculator", description: "Calculate the number of complete months between two dates.", category: "Everyday Life", subcategory: "Time & Dates", icon: Calendar, isBuilt: false },
  { slug: "leap-year-calculator", name: "Leap Year Calculator", description: "Check if a year is a leap year and find the next or previous leap year.", category: "Everyday Life", subcategory: "Time & Dates", icon: Calendar, isBuilt: false },
  { slug: "countdown-calculator", name: "Countdown Calculator", description: "Calculate days, hours, and minutes remaining until any future date or event.", category: "Everyday Life", subcategory: "Time & Dates", icon: Timer, isBuilt: false },
  { slug: "meeting-time-zone-calculator", name: "Meeting Time Zone Calculator", description: "Find the best meeting time across multiple time zones worldwide.", category: "Everyday Life", subcategory: "Time & Dates", icon: Globe, isBuilt: false },

  // Food & Kitchen
  { slug: "recipe-scale-calculator", name: "Recipe Scale Calculator", description: "Scale any recipe up or down for any number of servings.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Sparkles, isBuilt: false },
  { slug: "cooking-time-calculator", name: "Cooking Time Calculator", description: "Calculate precise cooking times for meats, poultry, and vegetables.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Clock, isBuilt: false },
  { slug: "baking-conversion-calculator", name: "Baking Conversion Calculator", description: "Convert baking ingredients between cups, grams, ounces, and milliliters.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Calculator, isBuilt: false },
  { slug: "food-cost-calculator", name: "Food Cost Calculator", description: "Calculate the cost per serving and food cost percentage for recipes.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: DollarSign, isBuilt: false },
  { slug: "alcohol-unit-calculator", name: "Alcohol Unit Calculator", description: "Calculate alcohol units in drinks and track weekly intake against safe limits.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Wine, isBuilt: false },
  { slug: "coffee-strength-calculator", name: "Coffee Strength Calculator", description: "Calculate the ideal coffee-to-water ratio for your preferred brewing strength.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Coffee, isBuilt: false },
  { slug: "cake-serving-calculator", name: "Cake Serving Calculator", description: "Calculate how many servings a cake yields based on its size and cut style.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Dice1, isBuilt: false },
  { slug: "catering-quantity-calculator", name: "Catering Quantity Calculator", description: "Estimate food quantities needed for events based on guest count and meal type.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Users, isBuilt: false },
  { slug: "cooking-temperature-converter", name: "Cooking Temperature Converter", description: "Convert oven temperatures between Fahrenheit, Celsius, and Gas Mark.", category: "Everyday Life", subcategory: "Food & Kitchen", icon: Thermometer, isBuilt: false },

  // Home & Garden
  { slug: "wallpaper-calculator", name: "Wallpaper Calculator", description: "Calculate how many rolls of wallpaper you need for any room.", category: "Everyday Life", subcategory: "Home & Garden", icon: Home, isBuilt: false },
  { slug: "pool-volume-calculator", name: "Pool Volume Calculator", description: "Calculate water volume of rectangular, circular, and oval pools.", category: "Everyday Life", subcategory: "Home & Garden", icon: Droplets, isBuilt: false },
  { slug: "aquarium-volume-calculator", name: "Aquarium Volume Calculator", description: "Calculate the water volume and weight of rectangular or cylindrical fish tanks.", category: "Everyday Life", subcategory: "Home & Garden", icon: Droplets, isBuilt: false },
  { slug: "solar-panel-calculator", name: "Solar Panel Calculator", description: "Estimate solar panel output and savings based on roof size and location.", category: "Everyday Life", subcategory: "Home & Garden", icon: Sparkles, isBuilt: false },
  { slug: "rainwater-collection-calculator", name: "Rainwater Collection Calculator", description: "Calculate how much rainwater you can collect from your roof annually.", category: "Everyday Life", subcategory: "Home & Garden", icon: Droplets, isBuilt: false },
  { slug: "electricity-bill-calculator", name: "Electricity Bill Calculator", description: "Estimate monthly electricity costs from appliance usage and rate per kWh.", category: "Everyday Life", subcategory: "Home & Garden", icon: Zap, isBuilt: false },
  { slug: "water-bill-calculator", name: "Water Bill Calculator", description: "Estimate your monthly water bill from usage and local rate per gallon.", category: "Everyday Life", subcategory: "Home & Garden", icon: Droplets, isBuilt: false },
  { slug: "lawn-seeding-calculator", name: "Lawn Seeding Calculator", description: "Calculate the amount of grass seed needed to overseed or establish a lawn.", category: "Everyday Life", subcategory: "Home & Garden", icon: Leaf, isBuilt: false },
  { slug: "garden-fertilizer-calculator", name: "Garden Fertilizer Calculator", description: "Calculate the exact amount of fertilizer needed for any garden size and soil type.", category: "Everyday Life", subcategory: "Home & Garden", icon: Leaf, isBuilt: false },
  { slug: "home-heating-cost-calculator", name: "Home Heating Cost Calculator", description: "Estimate annual heating costs based on home size, insulation, and fuel type.", category: "Everyday Life", subcategory: "Home & Garden", icon: Thermometer, isBuilt: false },
  { slug: "home-cooling-cost-calculator", name: "Home Cooling Cost Calculator", description: "Estimate air conditioning electricity costs based on BTU and usage hours.", category: "Everyday Life", subcategory: "Home & Garden", icon: Thermometer, isBuilt: false },
  { slug: "plywood-calculator", name: "Plywood Sheets Calculator", description: "Calculate the number of plywood sheets needed to cover a given area.", category: "Everyday Life", subcategory: "Home & Garden", icon: Layers, isBuilt: false },

  // Shopping & Lifestyle
  { slug: "sales-price-calculator", name: "Sale Price Calculator", description: "Calculate the final sale price after applying a percentage discount.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: ShoppingBag, isBuilt: false },
  { slug: "shopping-budget-calculator", name: "Shopping Budget Calculator", description: "Plan and track a shopping budget across categories to avoid overspending.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: ShoppingBag, isBuilt: false },
  { slug: "clothing-size-converter", name: "Clothing Size Converter", description: "Convert clothing sizes between US, UK, EU, and Asian size charts.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Ruler, isBuilt: false },
  { slug: "ring-size-calculator", name: "Ring Size Calculator", description: "Find your ring size in US, UK, EU, and Asian sizing systems.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Circle, isBuilt: false },
  { slug: "gift-cost-per-person-calculator", name: "Gift Cost Per Person Calculator", description: "Divide a group gift cost fairly among any number of contributors.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Gift, isBuilt: false },
  { slug: "loyalty-points-calculator", name: "Loyalty Points Calculator", description: "Calculate the cash value of loyalty reward points and miles.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Award, isBuilt: false },
  { slug: "moving-cost-estimator", name: "Moving Cost Estimator", description: "Estimate total moving costs including truck, movers, and packing supplies.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Package, isBuilt: false },
  { slug: "pet-food-calculator", name: "Pet Food Calculator", description: "Calculate daily pet food portions based on your pet weight and food type.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Heart, isBuilt: false },
  { slug: "dog-age-calculator", name: "Dog Age Calculator", description: "Convert your dog age to human years based on breed size.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Heart, isBuilt: false },
  { slug: "cat-age-calculator", name: "Cat Age Calculator", description: "Convert your cat age to the equivalent human years.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Heart, isBuilt: false },
  { slug: "candle-burn-time-calculator", name: "Candle Burn Time Calculator", description: "Calculate how long a candle will burn based on wax weight and wick size.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: Sparkles, isBuilt: false },
  { slug: "reading-time-calculator", name: "Reading Time Calculator", description: "Estimate how long it will take to read any book or article at your reading speed.", category: "Everyday Life", subcategory: "Shopping & Lifestyle", icon: BookOpen, isBuilt: false },

  // Travel
  { slug: "flight-time-calculator", name: "Flight Time Calculator", description: "Estimate flight duration between two airports based on distance and speed.", category: "Everyday Life", subcategory: "Travel", icon: Plane, isBuilt: false },
  { slug: "hotel-cost-calculator", name: "Hotel Cost Calculator", description: "Calculate total hotel stay cost including taxes, fees, and room rate.", category: "Everyday Life", subcategory: "Travel", icon: Globe, isBuilt: false },
  { slug: "packing-weight-calculator", name: "Packing Weight Calculator", description: "Track luggage weight and check against airline baggage limits.", category: "Everyday Life", subcategory: "Travel", icon: Package, isBuilt: false },
  { slug: "travel-budget-calculator", name: "Travel Budget Calculator", description: "Plan a complete travel budget including flights, hotels, food, and activities.", category: "Everyday Life", subcategory: "Travel", icon: Globe, isBuilt: false },
  { slug: "road-trip-cost-calculator", name: "Road Trip Cost Calculator", description: "Estimate total road trip costs including fuel, tolls, and accommodation.", category: "Everyday Life", subcategory: "Travel", icon: Car, isBuilt: false },
  { slug: "daylight-saving-calculator", name: "Daylight Saving Time Calculator", description: "Find out when clocks change for any location and the next DST date.", category: "Everyday Life", subcategory: "Travel", icon: Clock, isBuilt: false },
  { slug: "visa-fee-calculator", name: "Visa Fee Calculator", description: "Look up visa application fees and processing times for common destinations.", category: "Everyday Life", subcategory: "Travel", icon: FileText, isBuilt: false },
  { slug: "travel-insurance-calculator", name: "Travel Insurance Estimator", description: "Estimate travel insurance costs based on trip duration, age, and destination.", category: "Everyday Life", subcategory: "Travel", icon: Shield, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🏁 SPORTS & OUTDOORS — NEW ADDITIONS
  // ══════════════════════════════════════════════

  // Running
  { slug: "race-time-predictor", name: "Race Time Predictor", description: "Estimate your finish time for 5K, 10K, half, and full marathons from current times.", category: "Sports", subcategory: "Running", icon: Timer, isBuilt: false },
  { slug: "running-pace-calculator", name: "Running Pace Calculator", description: "Calculate required pace to hit a target race time for any distance.", category: "Sports", subcategory: "Running", icon: Activity, isBuilt: false },
  { slug: "vdot-calculator", name: "VDOT Running Calculator", description: "Find your VDOT score and optimal training intensities based on race performance.", category: "Sports", subcategory: "Running", icon: Zap, isBuilt: false },
  { slug: "running-cadence-calculator", name: "Running Cadence Calculator", description: "Calculate your steps per minute (SPM) based on steps and duration.", category: "Sports", subcategory: "Running", icon: Activity, isBuilt: false },
  { slug: "treadmill-pace-calculator", name: "Treadmill Pace Converter", description: "Convert between treadmill mph/kph and running pace per mile/km.", category: "Sports", subcategory: "Running", icon: RefreshCw, isBuilt: false },
  { slug: "running-stride-length-calculator", name: "Running Stride Length Calculator", description: "Calculate average stride length from distance and step count.", category: "Sports", subcategory: "Running", icon: Ruler, isBuilt: false },

  // Cycling
  { slug: "cycling-speed-calculator", name: "Cycling Speed Calculator", description: "Calculate cycling speed from cadence, gear ratio, and wheel size.", category: "Sports", subcategory: "Cycling", icon: Gauge, isBuilt: false },
  { slug: "cycling-cadence-calculator", name: "Cycling Cadence Calculator", description: "Calculate RPM from speed, gear ratio, and tire circumference.", category: "Sports", subcategory: "Cycling", icon: RefreshCw, isBuilt: false },
  { slug: "cycling-wattage-calculator", name: "Cycling Wattage Calculator", description: "Estimate power output (watts) required to maintain a specific speed on a given gradient.", category: "Sports", subcategory: "Cycling", icon: Zap, isBuilt: false },
  { slug: "tss-calculator", name: "Training Stress Score (TSS) Calculator", description: "Calculate the TSS for a cycling workout based on intensity and duration.", category: "Sports", subcategory: "Cycling", icon: Activity, isBuilt: false },

  // Swimming
  { slug: "swimming-pace-calculator", name: "Swimming Pace Calculator", description: "Calculate swimming pace per 100m or 100y based on time and distance.", category: "Sports", subcategory: "Swimming", icon: Droplets, isBuilt: false },
  { slug: "swimming-split-calculator", name: "Swimming Split Calculator", description: "Generate target split times for swimming events.", category: "Sports", subcategory: "Swimming", icon: Timer, isBuilt: false },
  { slug: "css-swimming-calculator", name: "Critical Swim Speed (CSS) Calculator", description: "Calculate your CSS pace to determine aerobic swimming thresholds.", category: "Sports", subcategory: "Swimming", icon: Droplets, isBuilt: false },
  { slug: "swimming-time-conversion", name: "Swimming Time Conversion", description: "Convert swim times between short course yards, short course meters, and long course meters.", category: "Sports", subcategory: "Swimming", icon: RefreshCw, isBuilt: false },
  { slug: "swolf-calculator", name: "SWOLF Score Calculator", description: "Calculate your SWOLF score to measure swimming efficiency (strokes + time).", category: "Sports", subcategory: "Swimming", icon: Activity, isBuilt: false },

  // Weightlifting
  { slug: "wilks-score-calculator", name: "Wilks Score Calculator", description: "Calculate your Wilks score to compare powerlifting strength across different body weights.", category: "Sports", subcategory: "Weightlifting", icon: Trophy, isBuilt: false },
  { slug: "dots-score-calculator", name: "DOTS Score Calculator", description: "Calculate your DOTS score, the modern standard for comparing powerlifters.", category: "Sports", subcategory: "Weightlifting", icon: Trophy, isBuilt: false },
  { slug: "sinclair-coefficient-calculator", name: "Sinclair Coefficient Calculator", description: "Calculate your Sinclair total for Olympic weightlifting comparisons.", category: "Sports", subcategory: "Weightlifting", icon: Trophy, isBuilt: false },
  { slug: "barbell-plate-calculator", name: "Barbell Plate Calculator", description: "Determine the exact plates needed on each side of the bar for a target weight.", category: "Sports", subcategory: "Weightlifting", icon: Circle, isBuilt: false },
  { slug: "weightlifting-percentage-calculator", name: "Weightlifting Percentage Calculator", description: "Quickly calculate training percentages (e.g., 75%, 85%) of your 1RM.", category: "Sports", subcategory: "Weightlifting", icon: Percent, isBuilt: false },
  { slug: "symmetric-strength-calculator", name: "Symmetric Strength Calculator", description: "Evaluate your strength balance across different muscle groups.", category: "Sports", subcategory: "Weightlifting", icon: Activity, isBuilt: false },

  // Others
  { slug: "triathlon-time-calculator", name: "Triathlon Time Predictor", description: "Estimate your total triathlon finish time based on individual leg paces and transition times.", category: "Sports", subcategory: "Triathlon", icon: Timer, isBuilt: false },
  { slug: "bowling-handicap-calculator", name: "Bowling Handicap Calculator", description: "Calculate your bowling league handicap based on your average and league basis.", category: "Sports", subcategory: "Bowling", icon: Target, isBuilt: false },
  { slug: "baseball-era-calculator", name: "Baseball ERA Calculator", description: "Calculate a pitcher's Earned Run Average (ERA).", category: "Sports", subcategory: "Baseball", icon: Activity, isBuilt: false },
  { slug: "baseball-batting-average-calculator", name: "Batting Average Calculator", description: "Calculate a baseball player's batting average.", category: "Sports", subcategory: "Baseball", icon: Activity, isBuilt: false },
  { slug: "basketball-per-calculator", name: "Basketball PER Calculator", description: "Estimate Player Efficiency Rating for basketball players.", category: "Sports", subcategory: "Basketball", icon: Activity, isBuilt: false },
  { slug: "basketball-shooting-percentage-calculator", name: "Shooting Percentage Calculator", description: "Calculate field goal, 3-point, and true shooting percentages.", category: "Sports", subcategory: "Basketball", icon: Target, isBuilt: false },
  { slug: "qb-rating-calculator", name: "Quarterback Rating Calculator", description: "Calculate NFL and NCAA passer ratings based on passing statistics.", category: "Sports", subcategory: "Football", icon: Activity, isBuilt: false },
  { slug: "tennis-serve-speed-calculator", name: "Tennis Serve Speed Calculator", description: "Estimate tennis serve speed based on flight time and distance.", category: "Sports", subcategory: "Tennis", icon: Zap, isBuilt: false },
  { slug: "billiards-handicap-calculator", name: "Billiards Handicap Calculator", description: "Determine player handicaps for pool leagues (e.g., APA formats).", category: "Sports", subcategory: "Billiards", icon: Target, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🌍 ECOLOGY — NEW ADDITIONS
  // ══════════════════════════════════════════════
  { slug: "carbon-footprint-calculator", name: "Carbon Footprint Calculator", description: "Estimate your personal or household annual carbon dioxide emissions.", category: "Ecology", subcategory: "Footprint", icon: Leaf, isBuilt: true },
  { slug: "flight-emissions-calculator", name: "Flight Emissions Calculator", description: "Calculate the carbon footprint of a specific flight route.", category: "Ecology", subcategory: "Footprint", icon: Plane, isBuilt: true },
  { slug: "vehicle-emissions-calculator", name: "Vehicle Emissions Calculator", description: "Estimate CO2 emissions based on your car's fuel efficiency and miles driven.", category: "Ecology", subcategory: "Footprint", icon: Car, isBuilt: true },
  { slug: "home-energy-emissions-calculator", name: "Home Energy Emissions Calculator", description: "Calculate greenhouse gas emissions from household electricity and gas usage.", category: "Ecology", subcategory: "Footprint", icon: Home, isBuilt: true },
  { slug: "food-carbon-footprint-calculator", name: "Food Carbon Footprint Calculator", description: "Estimate the emissions impact of different diets (e.g., vegan vs. meat-heavy).", category: "Ecology", subcategory: "Footprint", icon: Apple, isBuilt: true },
  { slug: "tree-planting-offset-calculator", name: "Tree Planting Offset Calculator", description: "Calculate how many trees you need to plant to offset your carbon emissions.", category: "Ecology", subcategory: "Offset", icon: Trees, isBuilt: true },
  { slug: "water-footprint-calculator", name: "Water Footprint Calculator", description: "Estimate your direct and indirect water consumption.", category: "Ecology", subcategory: "Footprint", icon: Droplets, isBuilt: true },
  { slug: "plastic-footprint-calculator", name: "Plastic Footprint Calculator", description: "Calculate your annual consumption of single-use plastics.", category: "Ecology", subcategory: "Footprint", icon: Package, isBuilt: true },
  { slug: "solar-energy-savings-calculator", name: "Solar Energy Savings Calculator", description: "Estimate financial savings and CO2 reduction from installing solar panels.", category: "Ecology", subcategory: "Energy", icon: Zap, isBuilt: true },
  { slug: "wind-turbine-energy-calculator", name: "Wind Turbine Energy Calculator", description: "Calculate potential energy generation from a residential wind turbine.", category: "Ecology", subcategory: "Energy", icon: Wind, isBuilt: true },
  { slug: "compost-ratio-calculator", name: "Compost C:N Ratio Calculator", description: "Calculate the optimal carbon-to-nitrogen ratio for your compost pile.", category: "Ecology", subcategory: "Gardening", icon: Leaf, isBuilt: true },
  { slug: "rain-barrel-calculator", name: "Rain Barrel Sizing Calculator", description: "Determine the required rain barrel capacity based on roof area and rainfall.", category: "Ecology", subcategory: "Conservation", icon: Droplets, isBuilt: true },
  { slug: "energy-efficient-appliance-calculator", name: "Energy Efficiency ROI Calculator", description: "Calculate the payback period for upgrading to energy-efficient appliances.", category: "Ecology", subcategory: "Energy", icon: Zap, isBuilt: true },
  { slug: "led-savings-calculator", name: "LED Lighting Savings Calculator", description: "Calculate energy and cost savings from switching to LED bulbs.", category: "Ecology", subcategory: "Energy", icon: Zap, isBuilt: true },
  { slug: "biodiversity-index-calculator", name: "Biodiversity Index Calculator", description: "Calculate Simpson's or Shannon's Diversity Index for a given habitat area.", category: "Ecology", subcategory: "Analysis", icon: Trees, isBuilt: true },
  { slug: "population-growth-ecology-calculator", name: "Population Growth Rate Calculator", description: "Model exponential or logistic population growth in an ecosystem.", category: "Ecology", subcategory: "Analysis", icon: TrendingUp, isBuilt: true },
  { slug: "ecological-footprint-calculator", name: "Ecological Footprint Calculator", description: "Estimate how many \"Earths\" are needed to support your lifestyle.", category: "Ecology", subcategory: "Footprint", icon: Globe, isBuilt: true },
  { slug: "waste-diversion-calculator", name: "Waste Diversion Rate Calculator", description: "Calculate the percentage of waste diverted from landfills via recycling and composting.", category: "Ecology", subcategory: "Conservation", icon: RefreshCw, isBuilt: true },
  { slug: "paper-savings-calculator", name: "Paper Savings Calculator", description: "Calculate the environmental impact (trees, water, energy saved) by going paperless.", category: "Ecology", subcategory: "Conservation", icon: FileText, isBuilt: true },
  { slug: "meatless-monday-impact-calculator", name: "Meatless Diet Impact Calculator", description: "Estimate the environmental benefits of skipping meat for a specific number of days.", category: "Ecology", subcategory: "Footprint", icon: Leaf, isBuilt: true },

  // ══════════════════════════════════════════════
  // 💻 TECHNOLOGY
  // ══════════════════════════════════════════════
  { slug: "subnet-calculator", name: "IP Subnet Calculator", description: "Calculate network, broadcast, and host ranges for IPv4 and IPv6 subnets.", category: "Technology", subcategory: "Networking", icon: Globe, isBuilt: true },
  { slug: "raid-calculator", name: "RAID Capacity Calculator", description: "Determine usable storage capacity and fault tolerance for various RAID configurations (0, 1, 5, 6, 10).", category: "Technology", subcategory: "Storage", icon: HardDrive, isBuilt: true },
  { slug: "pixel-density-calculator", name: "Pixel Density (PPI) Calculator", description: "Calculate Pixels Per Inch (PPI) based on screen resolution and diagonal display size.", category: "Technology", subcategory: "Display", icon: Monitor, isBuilt: true },
  { slug: "aspect-ratio-calculator", name: "Aspect Ratio Calculator", description: "Calculate screen aspect ratios and dimensions for video, images, and monitors.", category: "Technology", subcategory: "Display", icon: Monitor, isBuilt: true },
  { slug: "power-supply-calculator", name: "PC Power Supply Calculator", description: "Estimate required power supply wattage for a custom PC build based on components.", category: "Technology", subcategory: "Hardware", icon: Zap, isBuilt: true },
  { slug: "data-transfer-rate-calculator", name: "Data Transfer Rate Calculator", description: "Convert between different data transfer units (Mbps, MB/s, Gbps, etc.).", category: "Technology", subcategory: "Networking", icon: Wifi, isBuilt: true },
  { slug: "mac-address-generator", name: "MAC Address Generator", description: "Generate random or vendor-specific MAC addresses for network testing.", category: "Technology", subcategory: "Networking", icon: Hash, isBuilt: true },
  { slug: "hash-calculator", name: "Hash Calculator", description: "Generate cryptographic hashes (MD5, SHA-1, SHA-256) for a given text or file.", category: "Technology", subcategory: "Security", icon: Lock, isBuilt: true },
  { slug: "password-entropy-calculator", name: "Password Entropy Calculator", description: "Calculate the strength and entropy of a password to estimate cracking time.", category: "Technology", subcategory: "Security", icon: Shield, isBuilt: true },
  { slug: "uptime-calculator", name: "Server Uptime Calculator", description: "Calculate allowed downtime based on uptime SLA percentages (e.g., 99.9%).", category: "Technology", subcategory: "Infrastructure", icon: Server, isBuilt: true },
  { slug: "vps-pricing-calculator", name: "VPS Pricing Calculator", description: "Estimate monthly cloud hosting costs based on CPU, RAM, and Storage requirements.", category: "Technology", subcategory: "Infrastructure", icon: Cloud, isBuilt: true },
  { slug: "data-storage-converter", name: "Data Storage Converter", description: "Convert between Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, etc.", category: "Technology", subcategory: "Storage", icon: HardDrive, isBuilt: true },
  { slug: "aws-s3-cost-calculator", name: "AWS S3 Cost Calculator", description: "Estimate monthly AWS S3 storage, request, and data transfer costs.", category: "Technology", subcategory: "Infrastructure", icon: Cloud, isBuilt: true },
  { slug: "docker-image-size-calculator", name: "Docker Image Size Calculator", description: "Estimate the final size of a Docker image based on base image and installed packages.", category: "Technology", subcategory: "Software", icon: Layers, isBuilt: true },
  { slug: "git-repo-size-calculator", name: "Git Repository Size Calculator", description: "Estimate the size of a git repository clone based on commit history and file sizes.", category: "Technology", subcategory: "Software", icon: FileText, isBuilt: true },
  { slug: "cron-expression-calculator", name: "Cron Expression Calculator", description: "Generate and decode cron expressions for scheduling tasks.", category: "Technology", subcategory: "Software", icon: Clock, isBuilt: true },
  { slug: "regex-test-calculator", name: "Regex Match Calculator", description: "Calculate the number of matches and capture groups for a given regular expression.", category: "Technology", subcategory: "Software", icon: Code, isBuilt: true },
  { slug: "rgb-to-hex-converter", name: "RGB to HEX Converter", description: "Convert RGB color values to hexadecimal codes for web design.", category: "Technology", subcategory: "Design", icon: Palette, isBuilt: true },
  { slug: "contrast-ratio-calculator", name: "Color Contrast Calculator", description: "Check WCAG contrast ratios between text and background colors for accessibility.", category: "Technology", subcategory: "Design", icon: Eye, isBuilt: true },
  { slug: "font-size-converter", name: "Font Size Converter", description: "Convert font sizes between Points, Pixels, EMs, and REMs.", category: "Technology", subcategory: "Design", icon: Type, isBuilt: true },
  { slug: "image-file-size-calculator", name: "Image File Size Calculator", description: "Estimate uncompressed image file size based on resolution and color depth.", category: "Technology", subcategory: "Storage", icon: Image, isBuilt: true },
  { slug: "video-file-size-calculator", name: "Video File Size Calculator", description: "Estimate video file size based on bitrate, resolution, and duration.", category: "Technology", subcategory: "Storage", icon: Video, isBuilt: true },
  { slug: "audio-file-size-calculator", name: "Audio File Size Calculator", description: "Calculate audio file sizes based on sample rate, bit depth, and channels.", category: "Technology", subcategory: "Storage", icon: Music, isBuilt: true },
  { slug: "3d-print-time-calculator", name: "3D Print Time Calculator", description: "Estimate 3D printing time based on layer height, print speed, and model volume.", category: "Technology", subcategory: "Hardware", icon: Box, isBuilt: true },
  { slug: "stepper-motor-calculator", name: "Stepper Motor Calculator", description: "Calculate steps per millimeter for 3D printers and CNC machines.", category: "Technology", subcategory: "Hardware", icon: Settings, isBuilt: true },
  { slug: "cumulative-gpa-calculator", name: "Cumulative GPA Calculator", description: "Calculate your overall cumulative GPA including past semesters.", category: "Education", subcategory: "Grades", icon: GraduationCap, isBuilt: true },
  { slug: "final-grade-calculator", name: "Final Grade Calculator", description: "Determine what grade you need on a final exam to achieve a target overall class grade.", category: "Education", subcategory: "Grades", icon: Target, isBuilt: true },
  { slug: "weighted-grade-calculator", name: "Weighted Grade Calculator", description: "Calculate a class grade based on weighted assignment categories (e.g., Exams 50%, Homework 30%).", category: "Education", subcategory: "Grades", icon: Percent, isBuilt: true },
  { slug: "test-grade-calculator", name: "Test Grade Calculator", description: "Quickly generate a grading scale for a test based on the total number of questions.", category: "Education", subcategory: "Grades", icon: FileText, isBuilt: true },
  { slug: "college-savings-calculator", name: "College Savings Calculator", description: "Estimate how much you need to save per month to afford college tuition.", category: "Education", subcategory: "Finance", icon: PiggyBank, isBuilt: true },
  { slug: "reading-speed-calculator", name: "Reading Speed Calculator", description: "Calculate your reading speed in words per minute (WPM).", category: "Education", subcategory: "Study Skills", icon: BookOpen, isBuilt: true },
  { slug: "study-time-calculator", name: "Study Time Calculator", description: "Estimate how many hours you should study per week based on credit hours and course difficulty.", category: "Education", subcategory: "Study Skills", icon: Timer, isBuilt: true },
  { slug: "pomodoro-calculator", name: "Pomodoro Cycle Calculator", description: "Calculate the total study time and break time for a given number of Pomodoro sessions.", category: "Education", subcategory: "Study Skills", icon: Clock, isBuilt: false },
  { slug: "student-budget-calculator", name: "Student Budget Calculator", description: "Manage your monthly student budget including tuition, rent, food, and books.", category: "Education", subcategory: "Finance", icon: Wallet, isBuilt: false },
  { slug: "tuition-roi-calculator", name: "Tuition ROI Calculator", description: "Estimate the return on investment of a college degree based on tuition costs and expected salary.", category: "Education", subcategory: "Finance", icon: TrendingUp, isBuilt: false },
  { slug: "sat-score-calculator", name: "SAT Score Calculator", description: "Estimate your SAT score based on raw section scores.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: true },
  { slug: "act-score-calculator", name: "ACT Score Calculator", description: "Estimate your ACT composite score from raw section scores.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: true },
  { slug: "gre-score-calculator", name: "GRE Score Percentile Calculator", description: "Convert your GRE scores into percentile rankings.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: true },
  { slug: "gmat-score-calculator", name: "GMAT Score Percentile Calculator", description: "Convert your GMAT scores into percentile rankings.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: false },
  { slug: "lsat-score-calculator", name: "LSAT Score Predictor", description: "Estimate your LSAT score based on practice test raw scores.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: false },
  { slug: "mcat-score-calculator", name: "MCAT Score Converter", description: "Convert raw MCAT section scores to scaled scores and percentiles.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: false },
  { slug: "ap-score-calculator", name: "AP Score Calculator", description: "Estimate your AP Exam score (1-5) based on multiple-choice and free-response performance.", category: "Education", subcategory: "Standardized Tests", icon: Award, isBuilt: false },
  { slug: "ib-grade-calculator", name: "IB Diploma Grade Calculator", description: "Calculate your projected total IB Diploma points based on subject grades and core components.", category: "Education", subcategory: "Grades", icon: Globe, isBuilt: false },
  { slug: "uc-gpa-calculator", name: "UC GPA Calculator", description: "Calculate your University of California (UC) specific GPA.", category: "Education", subcategory: "Grades", icon: GraduationCap, isBuilt: false },
  { slug: "csu-gpa-calculator", name: "CSU GPA Calculator", description: "Calculate your California State University (CSU) specific GPA.", category: "Education", subcategory: "Grades", icon: GraduationCap, isBuilt: false },
  { slug: "oxbridge-interview-calculator", name: "Oxbridge Interview Probability", description: "Estimate the probability of receiving an Oxbridge interview based on academic profile.", category: "Education", subcategory: "Admissions", icon: School, isBuilt: false },
  { slug: "typing-speed-calculator", name: "Typing Speed (WPM) Calculator", description: "Calculate your typing speed in Words Per Minute, adjusting for errors.", category: "Education", subcategory: "Study Skills", icon: Keyboard, isBuilt: false },



  // ══════════════════════════════════════════════
  // 🔄 CONVERSION & OTHERS
  // ══════════════════════════════════════════════
  { slug: "area-converter", name: "Area Converter", description: "Convert between square meters, square feet, acres, and hectares.", category: "Conversion", subcategory: "Measurement", icon: Triangle, isBuilt: false },
  { slug: "volume-converter", name: "Volume Converter", description: "Convert between liters, gallons, cubic meters, and cubic feet.", category: "Conversion", subcategory: "Measurement", icon: Beaker, isBuilt: false },
  { slug: "time-converter", name: "Time Unit Converter", description: "Convert between seconds, minutes, hours, days, weeks, and years.", category: "Conversion", subcategory: "Measurement", icon: Clock, isBuilt: false },
  { slug: "pressure-converter", name: "Pressure Converter", description: "Convert between psi, bar, pascals, and atmospheres.", category: "Conversion", subcategory: "Measurement", icon: Gauge, isBuilt: false },
  { slug: "energy-converter", name: "Energy Converter", description: "Convert between joules, calories, BTUs, and kilowatt-hours.", category: "Conversion", subcategory: "Measurement", icon: Zap, isBuilt: false },
  { slug: "power-converter", name: "Power Converter", description: "Convert between watts, kilowatts, horsepower, and BTUs per hour.", category: "Conversion", subcategory: "Measurement", icon: Zap, isBuilt: false },
  { slug: "force-converter", name: "Force Converter", description: "Convert between newtons, pounds-force, and kilogram-force.", category: "Conversion", subcategory: "Measurement", icon: Activity, isBuilt: false },
  { slug: "density-converter", name: "Density Converter", description: "Convert between kg/m\u00b3, g/cm\u00b3, and lb/ft\u00b3.", category: "Conversion", subcategory: "Measurement", icon: Droplets, isBuilt: false },
  { slug: "torque-converter", name: "Torque Converter", description: "Convert between Newton-meters, foot-pounds, and inch-pounds.", category: "Conversion", subcategory: "Measurement", icon: Settings, isBuilt: false },
  { slug: "flow-rate-converter", name: "Flow Rate Converter", description: "Convert between gallons per minute, liters per second, and cubic meters per hour.", category: "Conversion", subcategory: "Measurement", icon: Droplets, isBuilt: false },
  { slug: "angle-converter-advanced", name: "Advanced Angle Converter", description: "Convert between degrees, radians, minutes, and seconds.", category: "Conversion", subcategory: "Measurement", icon: Circle, isBuilt: false },
  { slug: "frequency-converter", name: "Frequency Converter", description: "Convert between hertz, kilohertz, megahertz, and rpm.", category: "Conversion", subcategory: "Measurement", icon: Zap, isBuilt: false },
  { slug: "data-size-converter", name: "Data Size Converter", description: "Convert between bytes, kilobytes, megabytes, gigabytes, and terabytes.", category: "Conversion", subcategory: "Data", icon: HardDrive, isBuilt: false },
  { slug: "data-transfer-converter", name: "Data Transfer Rate Converter", description: "Convert between kbps, Mbps, Gbps, MB/s, and GB/s.", category: "Conversion", subcategory: "Data", icon: Wifi, isBuilt: false },
  { slug: "fuel-economy-converter", name: "Fuel Economy Converter", description: "Convert between MPG (US/UK) and Liters per 100km (L/100km).", category: "Conversion", subcategory: "Measurement", icon: Fuel, isBuilt: false },
  { slug: "fraction-to-decimal-converter", name: "Fraction to Decimal Converter", description: "Convert fractions to decimals and percentages.", category: "Conversion", subcategory: "Numbers", icon: Percent, isBuilt: false },
  { slug: "decimal-to-fraction-converter", name: "Decimal to Fraction Converter", description: "Convert decimal numbers to simplified fractions.", category: "Conversion", subcategory: "Numbers", icon: Hash, isBuilt: false },
  { slug: "scientific-notation-converter", name: "Scientific Notation Converter", description: "Convert standard numbers to scientific e-notation and back.", category: "Conversion", subcategory: "Numbers", icon: Sigma, isBuilt: false },
  { slug: "hex-to-decimal-converter", name: "Hex to Decimal Converter", description: "Convert hexadecimal strings to decimal numbers.", category: "Conversion", subcategory: "Numbers", icon: Binary, isBuilt: false },
  { slug: "decimal-to-hex-converter", name: "Decimal to Hex Converter", description: "Convert decimal integers to hexadecimal strings.", category: "Conversion", subcategory: "Numbers", icon: Binary, isBuilt: false },
  { slug: "binary-text-converter", name: "Binary to Text Converter", description: "Convert binary code to ASCII text strings.", category: "Conversion", subcategory: "Text", icon: Binary, isBuilt: false },
  { slug: "text-binary-converter", name: "Text to Binary Converter", description: "Convert ASCII text strings into binary code.", category: "Conversion", subcategory: "Text", icon: Binary, isBuilt: false },
  { slug: "morse-code-translator", name: "Morse Code Translator", description: "Translate text to Morse code and Morse code to text.", category: "Conversion", subcategory: "Text", icon: MessageSquare, isBuilt: false },
  { slug: "base64-encoder", name: "Base64 Encoder", description: "Encode plain text into Base64 format.", category: "Conversion", subcategory: "Text", icon: FileText, isBuilt: false },
  { slug: "base64-decoder", name: "Base64 Decoder", description: "Decode Base64 format back into plain text.", category: "Conversion", subcategory: "Text", icon: FileText, isBuilt: false },
  { slug: "url-encoder", name: "URL Encoder", description: "Encode special characters in a string for safe URL transmission.", category: "Conversion", subcategory: "Text", icon: Link, isBuilt: false },
  { slug: "url-decoder", name: "URL Decoder", description: "Decode a URL-encoded string back into standard text.", category: "Conversion", subcategory: "Text", icon: Link, isBuilt: false },
  { slug: "crypto-currency-converter", name: "Crypto Converter", description: "Convert fiat currencies into cryptocurrencies like Bitcoin and Ethereum.", category: "Conversion", subcategory: "Finance", icon: Bitcoin, isBuilt: false },
  { slug: "epoch-time-converter", name: "Unix Epoch Time Converter", description: "Convert Unix timestamp to human-readable date and time.", category: "Conversion", subcategory: "Time", icon: Clock, isBuilt: false },
  { slug: "timezone-converter", name: "Time Zone Converter", description: "Convert time between different global time zones.", category: "Conversion", subcategory: "Time", icon: Globe, isBuilt: false },
  { slug: "bra-size-converter", name: "Bra Size Converter", description: "Convert bra sizes between international sizing systems.", category: "Conversion", subcategory: "Apparel", icon: Activity, isBuilt: false },
  { slug: "ring-size-converter-advanced", name: "Ring Size Converter", description: "Convert ring sizes between US, UK, EU, and Japanese standards.", category: "Conversion", subcategory: "Apparel", icon: Circle, isBuilt: false },
  { slug: "clothing-size-converter-advanced", name: "Clothing Size Converter", description: "Convert men's, women's, and children's clothing sizes internationally.", category: "Conversion", subcategory: "Apparel", icon: Activity, isBuilt: false },
  { slug: "cooking-measurement-converter", name: "Cooking Measurement Converter", description: "Convert between cups, tablespoons, teaspoons, fluid ounces, and milliliters.", category: "Conversion", subcategory: "Cooking", icon: Beaker, isBuilt: false },
  { slug: "oven-temperature-converter", name: "Oven Temperature Converter", description: "Convert baking temperatures between Fahrenheit, Celsius, and Gas Mark.", category: "Conversion", subcategory: "Cooking", icon: Thermometer, isBuilt: false },
  { slug: "baking-ingredient-converter", name: "Baking Ingredient Weight Converter", description: "Convert volume (cups) to weight (grams) for common baking ingredients.", category: "Conversion", subcategory: "Cooking", icon: Package, isBuilt: false },
  { slug: "yarn-weight-converter", name: "Yarn Weight Converter", description: "Convert yarn weights and terms across different global standards.", category: "Conversion", subcategory: "Crafts", icon: Scissors, isBuilt: false },
  { slug: "knitting-needle-converter", name: "Knitting Needle Size Converter", description: "Convert knitting needle sizes between US, UK, and Metric (mm).", category: "Conversion", subcategory: "Crafts", icon: Scissors, isBuilt: false },
  { slug: "crochet-hook-converter", name: "Crochet Hook Size Converter", description: "Convert crochet hook sizes between US, UK, and Metric (mm).", category: "Conversion", subcategory: "Crafts", icon: Scissors, isBuilt: false },
  { slug: "luminance-converter", name: "Luminance Converter", description: "Convert between candelas per square meter (nits), foot-lamberts, and apostilbs.", category: "Conversion", subcategory: "Measurement", icon: Sun, isBuilt: false },
  { slug: "illuminance-converter", name: "Illuminance Converter", description: "Convert between lux and foot-candles.", category: "Conversion", subcategory: "Measurement", icon: Sun, isBuilt: false },
  { slug: "radioactivity-converter", name: "Radioactivity Converter", description: "Convert between becquerels and curies.", category: "Conversion", subcategory: "Measurement", icon: Atom, isBuilt: false },
  { slug: "radiation-dose-converter", name: "Radiation Dose Converter", description: "Convert between sieverts and rems.", category: "Conversion", subcategory: "Measurement", icon: Atom, isBuilt: false },
  { slug: "viscosity-kinematic-converter", name: "Kinematic Viscosity Converter", description: "Convert between centistokes, square meters per second, and square feet per second.", category: "Conversion", subcategory: "Measurement", icon: Droplets, isBuilt: false },
  { slug: "viscosity-dynamic-converter", name: "Dynamic Viscosity Converter", description: "Convert between centipoise, pascal-seconds, and pound-force seconds per square foot.", category: "Conversion", subcategory: "Measurement", icon: Droplets, isBuilt: false },
  { slug: "dividend-yield-calculator", name: "Dividend Yield Calculator", description: "Calculate the annual dividend yield of a stock based on its current price.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "earnings-per-share-calculator", name: "Earnings Per Share (EPS) Calculator", description: "Calculate a company's profit divided by outstanding shares.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: false },
  { slug: "price-to-book-calculator", name: "Price-to-Book (P/B) Ratio Calculator", description: "Compare a firm's market capitalization to its book value.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: false },
  { slug: "price-to-sales-calculator", name: "Price-to-Sales (P/S) Ratio Calculator", description: "Evaluate a company's stock price against its revenues.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: false },
  { slug: "free-cash-flow-calculator", name: "Free Cash Flow Calculator", description: "Calculate the cash a company generates after accounting for capital expenditures.", category: "Finance", subcategory: "Business Finance", icon: DollarSign, isBuilt: true },
  { slug: "wacc-calculator", name: "WACC Calculator", description: "Calculate the Weighted Average Cost of Capital for a firm.", category: "Finance", subcategory: "Business Finance", icon: Percent, isBuilt: true },
  { slug: "current-ratio-calculator", name: "Current Ratio Calculator", description: "Measure a company's ability to pay short-term obligations.", category: "Finance", subcategory: "Business Finance", icon: PieChart, isBuilt: false },
  { slug: "quick-ratio-calculator", name: "Quick Ratio Calculator", description: "Measure a company's capacity to pay current liabilities without relying on inventory sales.", category: "Finance", subcategory: "Business Finance", icon: PieChart, isBuilt: false },
  { slug: "debt-to-equity-calculator", name: "Debt-to-Equity Ratio Calculator", description: "Evaluate a company's financial leverage.", category: "Finance", subcategory: "Business Finance", icon: PieChart, isBuilt: true },
  { slug: "gross-margin-calculator", name: "Gross Margin Calculator", description: "Calculate the financial health of a company by revealing the proportion of money left over from revenues after accounting for COGS.", category: "Finance", subcategory: "Business Finance", icon: Percent, isBuilt: true },
  { slug: "operating-margin-calculator", name: "Operating Margin Calculator", description: "Measure what proportion of a company's revenue is left over after paying for variable costs of production.", category: "Finance", subcategory: "Business Finance", icon: Percent, isBuilt: true },
  { slug: "net-profit-margin-calculator", name: "Net Profit Margin Calculator", description: "Calculate the percentage of revenue remaining after all operating expenses, interest, taxes and preferred stock dividends.", category: "Finance", subcategory: "Business Finance", icon: Percent, isBuilt: true },
  { slug: "inventory-days-calculator", name: "Days in Inventory Calculator", description: "Measure the number of days a company takes to sell its inventory.", category: "Finance", subcategory: "Business Finance", icon: Calendar, isBuilt: false },
  { slug: "receivable-days-calculator", name: "Days Sales Outstanding Calculator", description: "Estimate the average collection period for receivables.", category: "Finance", subcategory: "Business Finance", icon: Calendar, isBuilt: false },
  { slug: "payable-days-calculator", name: "Days Payable Outstanding Calculator", description: "Estimate the average time a company takes to pay its trade creditors.", category: "Finance", subcategory: "Business Finance", icon: Calendar, isBuilt: false },
  { slug: "cash-conversion-cycle-calculator", name: "Cash Conversion Cycle Calculator", description: "Calculate how long it takes a company to convert its investments in inventory to cash flows.", category: "Finance", subcategory: "Business Finance", icon: RefreshCw, isBuilt: true },
  { slug: "dupont-analysis-calculator", name: "DuPont Analysis Calculator", description: "Break down ROE into profit margin, asset turnover, and financial leverage.", category: "Finance", subcategory: "Business Finance", icon: BarChart3, isBuilt: false },
  { slug: "altman-z-score-calculator", name: "Altman Z-Score Calculator", description: "Predict the probability of a company going into bankruptcy.", category: "Finance", subcategory: "Business Finance", icon: Shield, isBuilt: false },
  { slug: "piotroski-f-score-calculator", name: "Piotroski F-Score Calculator", description: "Determine the strength of a firm's financial position.", category: "Finance", subcategory: "Business Finance", icon: Award, isBuilt: false },
  { slug: "beta-calculator", name: "Stock Beta Calculator", description: "Calculate a stock's volatility relative to the overall market.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: false },
  { slug: "capital-asset-pricing-model-calculator", name: "CAPM Calculator", description: "Calculate the expected return on an asset using CAPM.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: true },
  { slug: "black-scholes-calculator", name: "Black-Scholes Option Pricing Calculator", description: "Calculate the theoretical value of European-style options.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: false },
  { slug: "greeks-calculator", name: "Options Greeks Calculator", description: "Calculate Delta, Gamma, Theta, Vega, and Rho for an option.", category: "Finance", subcategory: "Investment", icon: Sigma, isBuilt: false },
  { slug: "put-call-parity-calculator", name: "Put-Call Parity Calculator", description: "Determine the relationship between European put and call options.", category: "Finance", subcategory: "Investment", icon: RefreshCw, isBuilt: false },
  { slug: "bond-duration-calculator", name: "Macaulay Duration Calculator", description: "Calculate the weighted average time until a bond's cash flows are paid.", category: "Finance", subcategory: "Investment", icon: Clock, isBuilt: true },
  { slug: "modified-duration-calculator", name: "Modified Duration Calculator", description: "Measure a bond's price sensitivity to interest rate changes.", category: "Finance", subcategory: "Investment", icon: TrendingDown, isBuilt: false },
  { slug: "convexity-calculator", name: "Bond Convexity Calculator", description: "Measure the curvature in the relationship between bond prices and yields.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: false },
  { slug: "yield-to-maturity-calculator", name: "Yield to Maturity (YTM) Calculator", description: "Calculate the estimated annual rate of return for a bond held to maturity.", category: "Finance", subcategory: "Investment", icon: Percent, isBuilt: false },
  { slug: "yield-to-call-calculator", name: "Yield to Call (YTC) Calculator", description: "Calculate the return of a callable bond assuming it is called before maturity.", category: "Finance", subcategory: "Investment", icon: Percent, isBuilt: false },
  { slug: "tax-equivalent-yield-calculator", name: "Tax-Equivalent Yield Calculator", description: "Compare the yield of a tax-free municipal bond to a taxable bond.", category: "Finance", subcategory: "Investment", icon: Landmark, isBuilt: false },
  { slug: "zero-coupon-bond-calculator", name: "Zero-Coupon Bond Calculator", description: "Calculate the price, yield, or maturity value of a zero-coupon bond.", category: "Finance", subcategory: "Investment", icon: Circle, isBuilt: false },
  { slug: "margin-calculator", name: "Margin Calculator", description: "Calculate retail margin and markup.", category: "Everyday Life", subcategory: "Finance", icon: Percent, isBuilt: true },
  { slug: "compound-annual-growth-rate-calculator", name: "Compound Annual Growth Rate Calculator", description: "Calculate the CAGR of an investment.", category: "Everyday Life", subcategory: "Finance", icon: TrendingUp, isBuilt: true },
  { slug: "inflation-adjusted-return-calculator", name: "Inflation-Adjusted Return Calculator", description: "Calculate real return after inflation.", category: "Everyday Life", subcategory: "Finance", icon: TrendingDown, isBuilt: true },
  { slug: "hourly-wage-calculator", name: "Hourly Wage Calculator", description: "Convert annual salary to hourly wage.", category: "Everyday Life", subcategory: "Finance", icon: DollarSign, isBuilt: false },
  { slug: "gestation-calculator", name: "Gestation Calculator", description: "Calculate animal gestation periods.", category: "Everyday Life", subcategory: "Animals", icon: Calendar, isBuilt: false },



  // ══════════════════════════════════════════════
  // \u26a1 BATCH 6 ADDITIONS
  // ══════════════════════════════════════════════
  { slug: "rule-of-78-calculator", name: "Rule of 78 Calculator", description: "Calculate interest rebates when paying off pre-computed interest loans early using the Sum of the Digits method.", category: "Finance", subcategory: "Loans", icon: Calculator, isBuilt: true },
  { slug: "amortization-schedule-calculator", name: "Amortization Schedule Calculator", description: "A free amortization schedule calculator to easily calculate your results.", category: "Finance", subcategory: "Loans", icon: Calculator, isBuilt: false },
  { slug: "apr-to-ear-calculator", name: "APR to EAR Calculator", description: "Convert the nominal Annual Percentage Rate (APR) to the true Effective Annual Rate (EAR) for any compounding frequency.", category: "Finance", subcategory: "Interest", icon: Calculator, isBuilt: true },
  { slug: "ear-to-apr-calculator", name: "EAR to APR Calculator", description: "Convert the Effective Annual Rate (EAR/APY) back to the nominal Annual Percentage Rate (APR) for any compounding frequency.", category: "Finance", subcategory: "Interest", icon: Calculator, isBuilt: true },
  { slug: "continuous-compounding-calculator", name: "Continuous Compounding Calculator", description: "Calculate investment growth using the continuous compounding formula A=Pe^(rt) and compare against daily, monthly, and annual compounding.", category: "Finance", subcategory: "Interest", icon: Calculator, isBuilt: true },
  { slug: "discounted-payback-period-calculator", name: "Discounted Payback Period Calculator", description: "Calculate the time to recover an investment using present-value cash flows, with full NPV, IRR, and Profitability Index analysis.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: true },
  { slug: "profitability-index-calculator", name: "Profitability Index Calculator", description: "A free profitability index calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "equivalent-annual-annuity-calculator", name: "Equivalent Annual Annuity Calculator", description: "A free equivalent annual annuity calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "weighted-average-yield-calculator", name: "Weighted Average Yield Calculator", description: "A free weighted average yield calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "preferred-stock-valuation-calculator", name: "Preferred Stock Valuation Calculator", description: "A free preferred stock valuation calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "dividend-payout-ratio-calculator", name: "Dividend Payout Ratio Calculator", description: "A free dividend payout ratio calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "retention-ratio-calculator", name: "Retention Ratio Calculator", description: "A free retention ratio calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "sustainable-growth-rate-calculator", name: "Sustainable Growth Rate Calculator", description: "A free sustainable growth rate calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: true },
  { slug: "internal-growth-rate-calculator", name: "Internal Growth Rate Calculator", description: "A free internal growth rate calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: true },
  { slug: "capital-gains-yield-calculator", name: "Capital Gains Yield Calculator", description: "A free capital gains yield calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: true },
  { slug: "price-to-earnings-growth-peg-calculator", name: "Price to Earnings Growth (PEG) Calculator", description: "A free price to earnings growth (peg) calculator to easily calculate your results.", category: "Finance", subcategory: "Investment", icon: Calculator, isBuilt: false },
  { slug: "enterprise-value-calculator", name: "Enterprise Value Calculator", description: "Calculate a company's total economic value including market cap, debt, preferred equity, and cash. Get EV/EBITDA and other valuation multiples.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "ebitda-margin-calculator", name: "EBITDA Margin Calculator", description: "Calculate EBITDA, EBITDA margin, and full profitability waterfall from your income statement. Includes EV/EBITDA multiple.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "operating-cash-flow-calculator", name: "Operating Cash Flow Calculator", description: "A free operating cash flow calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "free-cash-flow-to-equity-calculator", name: "Free Cash Flow to Equity Calculator", description: "A free free cash flow to equity calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "free-cash-flow-to-firm-calculator", name: "Free Cash Flow to Firm Calculator", description: "A free free cash flow to firm calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "asset-turnover-ratio-calculator", name: "Asset Turnover Ratio Calculator", description: "Measure operational efficiency by calculating revenue generated per dollar of assets, with industry benchmark comparison.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "fixed-asset-turnover-calculator", name: "Fixed Asset Turnover Calculator", description: "A free fixed asset turnover calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: false },
  { slug: "working-capital-turnover-calculator", name: "Working Capital Turnover Calculator", description: "A free working capital turnover calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: false },
  { slug: "return-on-capital-employed-calculator", name: "Return on Capital Employed Calculator", description: "Calculate ROCE to measure how efficiently a company generates profits from its long-term capital base, with industry benchmark comparison.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "return-on-invested-capital-calculator", name: "Return on Invested Capital Calculator", description: "A free return on invested capital calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "equity-multiplier-calculator", name: "Equity Multiplier Calculator", description: "Calculate the equity multiplier to measure financial leverage and analyze the DuPont ROE decomposition.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "times-interest-earned-calculator", name: "Times Interest Earned Calculator", description: "Calculate the Times Interest Earned (TIE) ratio and interest coverage status with industry benchmark comparison.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "cash-ratio-calculator", name: "Cash Ratio Calculator", description: "A free cash ratio calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: true },
  { slug: "defensive-interval-ratio-calculator", name: "Defensive Interval Ratio Calculator", description: "A free defensive interval ratio calculator to easily calculate your results.", category: "Finance", subcategory: "Business", icon: Calculator, isBuilt: false },
  { slug: "margin-of-error-calculator", name: "Margin of Error Calculator", description: "A free margin of error calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "geometric-mean-calculator", name: "Geometric Mean Calculator", description: "A free geometric mean calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "harmonic-mean-calculator", name: "Harmonic Mean Calculator", description: "A free harmonic mean calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "root-mean-square-calculator", name: "Root Mean Square Calculator", description: "A free root mean square calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "coefficient-of-variation-calculator", name: "Coefficient of Variation Calculator", description: "A free coefficient of variation calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "skewness-calculator", name: "Skewness Calculator", description: "A free skewness calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "kurtosis-calculator", name: "Kurtosis Calculator", description: "A free kurtosis calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "percentile-calculator", name: "Percentile Calculator", description: "A free percentile calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "quartile-calculator", name: "Quartile Calculator", description: "A free quartile calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "decile-calculator", name: "Decile Calculator", description: "A free decile calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "anova-calculator", name: "ANOVA Calculator", description: "A free anova calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "f-test-calculator", name: "F-Test Calculator", description: "A free f-test calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "mann-whitney-u-test-calculator", name: "Mann-Whitney U Test Calculator", description: "A free mann-whitney u test calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "kruskal-wallis-test-calculator", name: "Kruskal-Wallis Test Calculator", description: "A free kruskal-wallis test calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "wilcoxon-signed-rank-test-calculator", name: "Wilcoxon Signed-Rank Test Calculator", description: "A free wilcoxon signed-rank test calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "spearman-rank-correlation-calculator", name: "Spearman Rank Correlation Calculator", description: "A free spearman rank correlation calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "kendall-tau-calculator", name: "Kendall Tau Calculator", description: "A free kendall tau calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "logistic-regression-calculator", name: "Logistic Regression Calculator", description: "A free logistic regression calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "multiple-regression-calculator", name: "Multiple Regression Calculator", description: "A free multiple regression calculator to easily calculate your results.", category: "Math", subcategory: "Statistics", icon: Calculator, isBuilt: false },
  { slug: "matrix-multiplication-calculator", name: "Matrix Multiplication Calculator", description: "A free matrix multiplication calculator to easily calculate your results.", category: "Math", subcategory: "Algebra", icon: Calculator, isBuilt: false },
  { slug: "matrix-determinant-calculator", name: "Matrix Determinant Calculator", description: "A free matrix determinant calculator to easily calculate your results.", category: "Math", subcategory: "Algebra", icon: Calculator, isBuilt: false },
  { slug: "matrix-inverse-calculator", name: "Matrix Inverse Calculator", description: "A free matrix inverse calculator to easily calculate your results.", category: "Math", subcategory: "Algebra", icon: Calculator, isBuilt: false },
  { slug: "eigenvalue-calculator", name: "Eigenvalue Calculator", description: "A free eigenvalue calculator to easily calculate your results.", category: "Math", subcategory: "Algebra", icon: Calculator, isBuilt: false },
  { slug: "vector-cross-product-calculator", name: "Vector Cross Product Calculator", description: "A free vector cross product calculator to easily calculate your results.", category: "Math", subcategory: "Algebra", icon: Calculator, isBuilt: false },
  { slug: "fat-free-mass-calculator", name: "Fat Free Mass Calculator", description: "A free fat free mass calculator to easily calculate your results.", category: "Health", subcategory: "Body Metrics", icon: Calculator, isBuilt: false },
  { slug: "healthy-weight-range-calculator", name: "Healthy Weight Range Calculator", description: "A free healthy weight range calculator to easily calculate your results.", category: "Health", subcategory: "Body Metrics", icon: Calculator, isBuilt: false },
  { slug: "body-fat-percentage-calculator", name: "Body Fat Percentage Calculator", description: "A free body fat percentage calculator to easily calculate your results.", category: "Health", subcategory: "Body Metrics", icon: Calculator, isBuilt: false },
  { slug: "navy-body-fat-calculator", name: "Navy Body Fat Calculator", description: "A free navy body fat calculator to easily calculate your results.", category: "Health", subcategory: "Body Metrics", icon: Calculator, isBuilt: false },
  { slug: "waist-to-height-ratio-calculator", name: "Waist to Height Ratio Calculator", description: "A free waist to height ratio calculator to easily calculate your results.", category: "Health", subcategory: "Body Metrics", icon: Calculator, isBuilt: false },
  { slug: "blood-volume-calculator", name: "Blood Volume Calculator", description: "A free blood volume calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "blood-donation-calculator", name: "Blood Donation Calculator", description: "A free blood donation calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "conception-date-calculator", name: "Conception Date Calculator", description: "A free conception date calculator to easily calculate your results.", category: "Health", subcategory: "Pregnancy", icon: Calculator, isBuilt: false },
  { slug: "child-height-predictor", name: "Child Height Predictor", description: "A free child height predictor to easily calculate your results.", category: "Health", subcategory: "Pediatric", icon: Calculator, isBuilt: false },
  { slug: "infant-milk-calculator", name: "Infant Milk Calculator", description: "A free infant milk calculator to easily calculate your results.", category: "Health", subcategory: "Pediatric", icon: Calculator, isBuilt: false },
  { slug: "apgar-score-calculator", name: "Apgar Score Calculator", description: "A free apgar score calculator to easily calculate your results.", category: "Health", subcategory: "Pediatric", icon: Calculator, isBuilt: false },
  { slug: "bishop-score-calculator", name: "Bishop Score Calculator", description: "A free bishop score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "glasgow-coma-scale-calculator", name: "Glasgow Coma Scale Calculator", description: "A free glasgow coma scale calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "chads2-score-calculator", name: "CHADS2 Score Calculator", description: "A free chads2 score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "cha2ds2-vasc-score-calculator", name: "CHA2DS2-VASc Score Calculator", description: "A free cha2ds2-vasc score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "has-bled-score-calculator", name: "HAS-BLED Score Calculator", description: "A free has-bled score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "meld-score-calculator", name: "MELD Score Calculator", description: "A free meld score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "child-pugh-score-calculator", name: "Child-Pugh Score Calculator", description: "A free child-pugh score calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "wells-score-for-dvt-calculator", name: "Wells Score for DVT Calculator", description: "A free wells score for dvt calculator to easily calculate your results.", category: "Health", subcategory: "Medical", icon: Calculator, isBuilt: false },
  { slug: "pizza-size-calculator", name: "Pizza Size Calculator", description: "Compare pizza sizes and prices to find the best value per square inch.", category: "Everyday Life", subcategory: "Food", icon: Pizza, isBuilt: true },
  { slug: "coffee-brewing-calculator", name: "Coffee Brewing Calculator", description: "Calculate the perfect coffee-to-water ratio for any brewing method.", category: "Everyday Life", subcategory: "Food", icon: Coffee, isBuilt: true },
  { slug: "tea-steeping-time-calculator", name: "Tea Steeping Time Calculator", description: "Get optimal steeping times and temperatures for all tea varieties.", category: "Everyday Life", subcategory: "Food", icon: Timer, isBuilt: true },
  { slug: "water-boiling-time-calculator", name: "Water Boiling Time Calculator", description: "Estimate boiling time based on volume, heat source, and altitude.", category: "Everyday Life", subcategory: "Food", icon: Flame, isBuilt: true },
  { slug: "turkey-roasting-time-calculator", name: "Turkey Roasting Time Calculator", description: "Calculate roasting and thawing times for the perfect holiday turkey.", category: "Everyday Life", subcategory: "Food", icon: Utensils, isBuilt: true },
  { slug: "grilling-time-calculator", name: "Grilling Time Calculator", description: "A free grilling time calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Food", icon: Calculator, isBuilt: false },
  { slug: "microwave-wattage-conversion-calculator", name: "Microwave Wattage Conversion Calculator", description: "A free microwave wattage conversion calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Food", icon: Calculator, isBuilt: false },
  { slug: "refrigerator-energy-calculator", name: "Refrigerator Energy Calculator", description: "A free refrigerator energy calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "ac-size-calculator", name: "AC Size Calculator", description: "A free ac size calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "heater-size-calculator", name: "Heater Size Calculator", description: "A free heater size calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "firewood-cord-calculator", name: "Firewood Cord Calculator", description: "A free firewood cord calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "grass-seed-calculator", name: "Grass Seed Calculator", description: "A free grass seed calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "fertilizer-calculator", name: "Fertilizer Calculator", description: "A free fertilizer calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "mulch-cost-calculator", name: "Mulch Cost Calculator", description: "A free mulch cost calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "plant-spacing-calculator", name: "Plant Spacing Calculator", description: "A free plant spacing calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "potting-soil-calculator", name: "Potting Soil Calculator", description: "A free potting soil calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "lawn-mowing-time-calculator", name: "Lawn Mowing Time Calculator", description: "A free lawn mowing time calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Garden", icon: Calculator, isBuilt: false },
  { slug: "snow-shoveling-calculator", name: "Snow Shoveling Calculator", description: "A free snow shoveling calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "roof-shingle-calculator", name: "Roof Shingle Calculator", description: "A free roof shingle calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "gutter-size-calculator", name: "Gutter Size Calculator", description: "A free gutter size calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "driveway-sealer-calculator", name: "Driveway Sealer Calculator", description: "A free driveway sealer calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "wall-area-calculator", name: "Wall Area Calculator", description: "A free wall area calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "floor-area-calculator", name: "Floor Area Calculator", description: "A free floor area calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "room-volume-calculator", name: "Room Volume Calculator", description: "A free room volume calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "tv-viewing-distance-calculator", name: "TV Viewing Distance Calculator", description: "A free tv viewing distance calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "projector-screen-size-calculator", name: "Projector Screen Size Calculator", description: "A free projector screen size calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "speaker-placement-calculator", name: "Speaker Placement Calculator", description: "A free speaker placement calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "lighting-lumens-calculator", name: "Lighting Lumens Calculator", description: "A free lighting lumens calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "window-curtain-calculator", name: "Window Curtain Calculator", description: "A free window curtain calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "blind-size-calculator", name: "Blind Size Calculator", description: "A free blind size calculator to easily calculate your results.", category: "Everyday Life", subcategory: "Home", icon: Calculator, isBuilt: false },
  { slug: "velocity-calculator", name: "Velocity Calculator", description: "A free velocity calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "displacement-calculator", name: "Displacement Calculator", description: "A free displacement calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "free-fall-calculator", name: "Free Fall Calculator", description: "A free free fall calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "escape-velocity-calculator", name: "Escape Velocity Calculator", description: "A free escape velocity calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "orbital-velocity-calculator", name: "Orbital Velocity Calculator", description: "A free orbital velocity calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "keplers-laws-calculator", name: "Keplers Laws Calculator", description: "A free keplers laws calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "coulombs-law-calculator", name: "Coulombs Law Calculator", description: "A free coulombs law calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "ohm-s-law-calculator", name: "Ohm's Law Calculator", description: "A free ohm's law calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "voltage-divider-calculator", name: "Voltage Divider Calculator", description: "A free voltage divider calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "current-divider-calculator", name: "Current Divider Calculator", description: "A free current divider calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "capacitance-calculator", name: "Capacitance Calculator", description: "A free capacitance calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "inductance-calculator", name: "Inductance Calculator", description: "A free inductance calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "rc-time-constant-calculator", name: "RC Time Constant Calculator", description: "A free rc time constant calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "rl-time-constant-calculator", name: "RL Time Constant Calculator", description: "A free rl time constant calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "lc-resonance-calculator", name: "LC Resonance Calculator", description: "A free lc resonance calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "wavelength-calculator", name: "Wavelength Calculator", description: "A free wavelength calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "photon-energy-calculator", name: "Photon Energy Calculator", description: "A free photon energy calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "mass-defect-calculator", name: "Mass Defect Calculator", description: "A free mass defect calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "binding-energy-calculator", name: "Binding Energy Calculator", description: "A free binding energy calculator to easily calculate your results.", category: "Science", subcategory: "Physics", icon: Calculator, isBuilt: false },
  { slug: "carbon-dating-calculator", name: "Carbon Dating Calculator", description: "A free carbon dating calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "molar-mass-calculator", name: "Molar Mass Calculator", description: "A free molar mass calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "avogadros-number-calculator", name: "Avogadros Number Calculator", description: "A free avogadros number calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "molality-calculator", name: "Molality Calculator", description: "A free molality calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "normality-calculator", name: "Normality Calculator", description: "A free normality calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "fractional-distillation-calculator", name: "Fractional Distillation Calculator", description: "A free fractional distillation calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "vapor-pressure-calculator", name: "Vapor Pressure Calculator", description: "A free vapor pressure calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "boiling-point-elevation-calculator", name: "Boiling Point Elevation Calculator", description: "A free boiling point elevation calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "freezing-point-depression-calculator", name: "Freezing Point Depression Calculator", description: "A free freezing point depression calculator to easily calculate your results.", category: "Science", subcategory: "Chemistry", icon: Calculator, isBuilt: false },
  { slug: "upload-time-calculator", name: "Upload Time Calculator", description: "Estimate file upload duration based on file size and connection speed.", category: "Technology", subcategory: "Network", icon: Wifi, isBuilt: true },
  { slug: "download-time-calculator", name: "Download Time Calculator", description: "Calculate download times for large files, games, and high-def media.", category: "Technology", subcategory: "Network", icon: Wifi, isBuilt: true },
  { slug: "ping-time-calculator", name: "Ping Time Calculator", description: "Estimate network latency based on geographical distance and medium.", category: "Technology", subcategory: "Network", icon: Activity, isBuilt: true },
  { slug: "jitter-calculator", name: "Jitter Calculator", description: "Analyze the stability of your network connection and latency variance.", category: "Technology", subcategory: "Network", icon: Signal, isBuilt: true },
  { slug: "packet-loss-calculator", name: "Packet Loss Calculator", description: "Calculate the percentage of data lost during transmission.", category: "Technology", subcategory: "Network", icon: Shield, isBuilt: true },
  { slug: "server-rack-units-calculator", name: "Server Rack Units Calculator", description: "Plan data center layout by calculating rack unit usage and space.", category: "Technology", subcategory: "Hardware", icon: Server, isBuilt: true },
  { slug: "ups-battery-runtime-calculator", name: "UPS Battery Runtime Calculator", description: "Estimate backup power duration for your UPS during a blackout.", category: "Technology", subcategory: "Hardware", icon: BatteryCharging, isBuilt: true },
  { slug: "hard-drive-capacity-calculator", name: "Hard Drive Capacity Calculator", description: "Calculate actual usable storage space as seen by the OS.", category: "Technology", subcategory: "Hardware", icon: HardDrive, isBuilt: true },
  { slug: "ssd-tbw-calculator", name: "SSD TBW Calculator", description: "Estimate SSD lifespan based on TBW rating and daily usage.", category: "Technology", subcategory: "Hardware", icon: Cpu, isBuilt: true },
  { slug: "monitor-dpi-calculator", name: "Monitor DPI Calculator", description: "Calculate pixel density and sharpness for any display.", category: "Technology", subcategory: "Display", icon: Monitor, isBuilt: true },
  { slug: "mouse-sensitivity-calculator", name: "Mouse Sensitivity Calculator", description: "Calculate effective sensitivity (eDPI) and physical movement distance.", category: "Technology", subcategory: "Gaming", icon: MousePointer2, isBuilt: true },
  { slug: "edpi-calculator", name: "eDPI Calculator", description: "Quickly find your Effective Dots Per Inch for competitive gaming.", category: "Technology", subcategory: "Gaming", icon: Target, isBuilt: true },
  { slug: "fov-calculator", name: "FOV Calculator", description: "Convert Field of View settings between different aspect ratios.", category: "Technology", subcategory: "Gaming", icon: Eye, isBuilt: true },
  { slug: "game-download-calculator", name: "Game Download Calculator", description: "Calculate exactly when your game will be ready to play.", category: "Technology", subcategory: "Gaming", icon: Gamepad2, isBuilt: true },
  { slug: "twitch-earnings-calculator", name: "Twitch Earnings Calculator", description: "Estimate monthly and yearly Twitch income from subs, bits, and ads.", category: "Technology", subcategory: "Creator", icon: Video, isBuilt: true },
  { slug: "youtube-revenue-calculator", name: "YouTube Revenue Calculator", description: "Estimate potential YouTube earnings based on views and RPM.", category: "Technology", subcategory: "Creator", icon: Video, isBuilt: true },
  { slug: "tiktok-earnings-calculator", name: "TikTok Earnings Calculator", description: "Estimate potential earnings from the TikTok Creator Fund and deals.", category: "Technology", subcategory: "Creator", icon: Share2, isBuilt: true },
  { slug: "instagram-engagement-calculator", name: "Instagram Engagement Calculator", description: "Measure account health by calculating engagement-to-follower ratio.", category: "Technology", subcategory: "Creator", icon: Heart, isBuilt: true },
  { slug: "podcast-hosting-cost-calculator", name: "Podcast Hosting Cost Calculator", description: "Estimate monthly podcasting infrastructure costs based on episode size and listeners.", category: "Technology", subcategory: "Creator", icon: Mic, isBuilt: true },
  { slug: "website-hosting-cost-calculator", name: "Website Hosting Cost Calculator", description: "Estimate monthly web hosting expenses based on traffic and server type.", category: "Technology", subcategory: "Web", icon: Globe, isBuilt: true },
  { slug: "domain-name-valuation-calculator", name: "Domain Name Valuation Calculator", description: "Estimate the market value of a domain name based on length, TLD, and traffic.", category: "Technology", subcategory: "Web", icon: Globe, isBuilt: true },
  { slug: "ssl-certificate-cost-calculator", name: "SSL Certificate Cost Calculator", description: "Compare costs and features for different types of SSL certificates.", category: "Technology", subcategory: "Web", icon: ShieldCheck, isBuilt: true },
  { slug: "adsense-revenue-calculator", name: "AdSense Revenue Calculator", description: "Estimate potential Google AdSense earnings based on traffic and CTR.", category: "Technology", subcategory: "Web", icon: BarChart3, isBuilt: true },
  { slug: "cpm-calculator", name: "CPM Calculator", description: "Calculate Cost Per Mille (CPM) to analyze ad campaign efficiency.", category: "Technology", subcategory: "Marketing", icon: Percent, isBuilt: true },
  { slug: "cpc-calculator", name: "CPC Calculator", description: "Determine the cost of each visitor from your paid ad campaigns.", category: "Technology", subcategory: "Marketing", icon: MousePointer2, isBuilt: true },
  { slug: "ctr-calculator", name: "CTR Calculator", description: "Measure ad engagement by calculating your click-through rate.", category: "Technology", subcategory: "Marketing", icon: Target, isBuilt: true },
  { slug: "conversion-rate-calculator", name: "Conversion Rate Calculator", description: "Calculate conversion percentage and Cost Per Acquisition (CPA).", category: "Technology", subcategory: "Marketing", icon: TrendingUp, isBuilt: true },
  { slug: "customer-retention-rate-calculator", name: "Customer Retention Rate Calculator", description: "A free customer retention rate calculator to easily calculate your results.", category: "Technology", subcategory: "Marketing", icon: Calculator, isBuilt: false },
  { slug: "churn-rate-calculator", name: "Churn Rate Calculator", description: "A free churn rate calculator to easily calculate your results.", category: "Technology", subcategory: "Marketing", icon: Calculator, isBuilt: false },
  { slug: "net-promoter-score-calculator", name: "Net Promoter Score Calculator", description: "A free net promoter score calculator to easily calculate your results.", category: "Technology", subcategory: "Marketing", icon: Calculator, isBuilt: false },
  { slug: "bounce-rate-calculator", name: "Bounce Rate Calculator", description: "A free bounce rate calculator to easily calculate your results.", category: "Technology", subcategory: "Marketing", icon: Calculator, isBuilt: false },
  { slug: "roas-calculator", name: "ROAS Calculator", description: "Calculate revenue generated per dollar spent on advertising.", category: "Technology", subcategory: "Marketing", icon: BarChart3, isBuilt: true },
  { slug: "email-open-rate-calculator", name: "Email Open Rate Calculator", description: "Measure the percentage of recipients who opened your email campaign.", category: "Technology", subcategory: "Marketing", icon: Calculator, isBuilt: false },
  { slug: "dog-calorie-calculator", name: "Dog Calorie Calculator", description: "Calculate daily caloric needs for your dog based on weight and activity.", category: "Everyday Life", subcategory: "Pets", icon: Bone, isBuilt: true },
  { slug: "cat-calorie-calculator", name: "Cat Calorie Calculator", description: "Determine the exact daily caloric intake your cat needs to stay healthy.", category: "Everyday Life", subcategory: "Pets", icon: Cat, isBuilt: true },
  { slug: "dog-chocolate-toxicity-calculator", name: "Dog Chocolate Toxicity Calculator", description: "Assess toxicity risk based on dog weight, chocolate type, and amount eaten.", category: "Everyday Life", subcategory: "Pets", icon: AlertTriangle, isBuilt: true },
  { slug: "dog-size-predictor", name: "Dog Size Predictor", description: "Predict your puppy's adult weight using current age and breed size.", category: "Everyday Life", subcategory: "Pets", icon: Bone, isBuilt: true },
  { slug: "cat-pregnancy-calculator", name: "Cat Pregnancy Calculator", description: "Calculate your cat's expected due date and current pregnancy stage.", category: "Everyday Life", subcategory: "Pets", icon: Cat, isBuilt: true },
  { slug: "dog-pregnancy-calculator", name: "Dog Pregnancy Calculator", description: "Determine your dog's whelping date and pregnancy milestones.", category: "Everyday Life", subcategory: "Pets", icon: Bone, isBuilt: true },



  // ══════════════════════════════════════════════
  // 🏁 FINAL BATCH
  // ══════════════════════════════════════════════
  { slug: "lease-vs-buy-calculator", name: "Lease vs Buy Calculator", description: "Compare total costs of leasing vs buying a vehicle.", category: "Finance", subcategory: "Auto", icon: Car, isBuilt: true },
  { slug: "home-affordability-calculator", name: "Home Affordability Calculator", description: "Estimate max home price based on income, debts, and down payment.", category: "Finance", subcategory: "Real Estate", icon: Home, isBuilt: true },
  { slug: "rent-affordability-calculator", name: "Rent Affordability Calculator", description: "Find out how much rent you can afford using 30% and 40x rules.", category: "Finance", subcategory: "Real Estate", icon: Wallet, isBuilt: true },
  { slug: "refinance-break-even-calculator", name: "Refinance Break-Even Calculator", description: "Determine months needed for mortgage savings to cover refinance costs.", category: "Finance", subcategory: "Real Estate", icon: RefreshCw, isBuilt: true },
  { slug: "expected-return-calculator", name: "Expected Return Calculator", description: "Calculate weighted average return for probabilistic outcomes.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "rule-of-70-calculator", name: "Rule of 70 Calculator", description: "Estimate how long it will take for an investment to double.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "investment-property-calculator", name: "Investment Property Calculator", description: "Analyze rental property profitability, cash flow, and cap rate.", category: "Finance", subcategory: "Real Estate", icon: Building, isBuilt: true },
  { slug: "property-tax-calculator", name: "Property Tax Calculator", description: "Estimate annual and monthly property tax obligations.", category: "Finance", subcategory: "Real Estate", icon: Landmark, isBuilt: true },
  { slug: "tip-and-split-calculator", name: "Tip and Split Calculator", description: "Calculate tip amounts and split bills evenly among a group.", category: "Everyday Life", subcategory: "Finance", icon: Utensils, isBuilt: true },
  { slug: "bmi-percentile-calculator", name: "BMI Percentile Calculator", description: "Calculate BMI and age-specific percentiles for children and teens.", category: "Health", subcategory: "Body Metrics", icon: Activity, isBuilt: true },
  { slug: "lean-mass-calculator", name: "Lean Mass Calculator", description: "Calculate your lean body mass and fat weight.", category: "Health", subcategory: "Body Metrics", icon: Dumbbell, isBuilt: true },
  { slug: "running-calorie-calculator", name: "Running Calorie Calculator", description: "Calculate calories burned while running based on distance and pace.", category: "Sports", subcategory: "Running", icon: Flame, isBuilt: true },
  { slug: "walking-calorie-calculator", name: "Walking Calorie Calculator", description: "Estimate calories burned during your walk based on weight and speed.", category: "Sports", subcategory: "Walking", icon: Flame, isBuilt: true },
  { slug: "cycling-power-calculator", name: "Cycling Power Calculator", description: "Estimate the power (Watts) required to ride at a certain speed.", category: "Sports", subcategory: "Cycling", icon: Zap, isBuilt: true },
  { slug: "pace-converter", name: "Pace Converter", description: "Convert between running times, distances, paces, and speeds.", category: "Sports", subcategory: "Running", icon: Timer, isBuilt: true },
  { slug: "miles-per-gallon-calculator", name: "Miles Per Gallon Calculator", description: "A free miles per gallon calculator to easily calculate your results.", category: "Automobile", subcategory: "Costs", icon: Calculator, isBuilt: false },
  { slug: "engine-compression-calculator", name: "Engine Compression Calculator", description: "A free engine compression calculator to easily calculate your results.", category: "Automobile", subcategory: "Performance", icon: Calculator, isBuilt: false },
  { slug: "tire-diameter-calculator", name: "Tire Diameter Calculator", description: "A free tire diameter calculator to easily calculate your results.", category: "Automobile", subcategory: "Performance", icon: Calculator, isBuilt: false },


  // ══════════════════════════════════════════════
  // \ud83c\udfc1 EXACTLY 980
  // ══════════════════════════════════════════════
  { slug: "horsepower-to-kilowatts-calculator", name: "Horsepower to Kilowatts Calculator", description: "Convert mechanical or electrical horsepower to kilowatts.", category: "Conversion", subcategory: "Power", icon: Calculator, isBuilt: false },

  // ══════════════════════════════════════════════
  // 📈 INVESTMENT & TRADING CALCULATORS
  // ══════════════════════════════════════════════
  { slug: "options-profit-calculator", name: "Options Profit Calculator", description: "Calculate profit, loss, and break-even for call and put options contracts.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "pe-ratio-calculator", name: "P/E Ratio Calculator", description: "Calculate Price-to-Earnings ratio and compare stock valuation to industry averages.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: true },
  { slug: "dcf-calculator", name: "DCF Calculator", description: "Discounted Cash Flow analysis to find intrinsic value per share.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },
  { slug: "portfolio-rebalancing-calculator", name: "Portfolio Rebalancing Calculator", description: "Calculate exactly how much to buy or sell to restore target asset allocations.", category: "Finance", subcategory: "Investment", icon: PieChart, isBuilt: true },
  { slug: "sharpe-ratio-calculator", name: "Sharpe Ratio Calculator", description: "Measure risk-adjusted returns by calculating excess return per unit of volatility.", category: "Finance", subcategory: "Investment", icon: BarChart3, isBuilt: true },
  { slug: "dollar-cost-averaging-calculator", name: "Dollar Cost Averaging Calculator", description: "See the long-term wealth impact of regular fixed investments using DCA strategy.", category: "Finance", subcategory: "Investment", icon: TrendingUp, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🏦 SAVINGS & BANKING CALCULATORS
  // ══════════════════════════════════════════════
  { slug: "bond-price-calculator", name: "Bond Price Calculator", description: "Calculate the current market price of a bond given coupon rate and yield to maturity.", category: "Finance", subcategory: "Investment", icon: Landmark, isBuilt: true },
  { slug: "treasury-bill-calculator", name: "Treasury Bill Calculator", description: "Calculate purchase price, discount, and annualized yield on U.S. Treasury Bills.", category: "Finance", subcategory: "Savings", icon: Landmark, isBuilt: true },
  { slug: "high-yield-savings-calculator", name: "High-Yield Savings Calculator", description: "Project growth of a high-yield savings account with compound interest and deposits.", category: "Finance", subcategory: "Savings", icon: PiggyBank, isBuilt: true },
  { slug: "money-market-calculator", name: "Money Market Calculator", description: "Calculate interest earned and final balance on a money market account.", category: "Finance", subcategory: "Savings", icon: Coins, isBuilt: true },
  { slug: "certificate-of-deposit-calculator", name: "Certificate of Deposit Calculator", description: "Calculate CD maturity value and interest earned at any term and APY.", category: "Finance", subcategory: "Savings", icon: Shield, isBuilt: true },
  { slug: "apy-calculator", name: "APY Calculator", description: "Convert nominal interest rate (APR) to Annual Percentage Yield for any compounding frequency.", category: "Finance", subcategory: "Savings", icon: Percent, isBuilt: true },

  // ══════════════════════════════════════════════
  // 🧮 MATH CALCULATORS
  // ══════════════════════════════════════════════
  { slug: "lcm-gcd-calculator", name: "LCM and GCD Calculator", description: "Calculate the Least Common Multiple and Greatest Common Divisor of two or three numbers.", category: "Math", subcategory: "Number Theory", icon: Calculator, isBuilt: true },

  // ══════════════════════════════════════════════
  // 💼 BUSINESS CALCULATORS
  // ══════════════════════════════════════════════
  { slug: "freelance-rate-calculator", name: "Freelance Rate Calculator", description: "Calculate your ideal hourly, daily, and monthly freelance rate based on income goals and overhead.", category: "Finance", subcategory: "Business", icon: Briefcase, isBuilt: true },
  { slug: "ecommerce-revenue-calculator", name: "Ecommerce Revenue Calculator", description: "Estimate monthly ecommerce revenue and gross profit from traffic, conversion rate, and order metrics.", category: "Finance", subcategory: "Business", icon: ShoppingBag, isBuilt: true },

];

export const getCategories = () => {
  const cats = new Map<string, CalculatorDef[]>();
  calculatorRegistry.forEach(c => {
    const list = cats.get(c.category) || [];
    list.push(c);
    cats.set(c.category, list);
  });
  return cats;
};

export const getCalculatorBySlug = (slug: string) =>
  calculatorRegistry.find(c => c.slug === slug);

export const getBuiltCalculators = () =>
  calculatorRegistry.filter(c => c.isBuilt);

export const getUnbuiltCalculators = () =>
  calculatorRegistry.filter(c => !c.isBuilt);

export const getCategoryIcon = (category: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    "Finance":      DollarSign,
    "Health":       Heart,
    "Math":         Calculator,
    "Science":      Atom,
    "Everyday Life": Clock,
    "Construction": HardHat,
    "Sports":       Trophy,
    "Ecology":      Leaf,
    "Technology":   Cpu,
    "Education":    GraduationCap,
    "Conversion":   ArrowLeftRight,
    "Automobile":   Car,
  };
  return icons[category] || Calculator;
};
