import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { calculatorRegistry, getCalculatorBySlug } from "@/data/calculatorRegistry";
import ComingSoonPage from "@/components/ComingSoonPage";
import { Suspense } from "react";

const calculatorComponents: Record<string, () => Promise<any>> = {
  "mortgage-calculator": () => import("@/calculators/MortgageCalculator"),
  "auto-loan-calculator": () => import("@/calculators/AutoLoanCalculator"),
  "loan-calculator": () => import("@/calculators/LoanCalculator"),
  "credit-card-payoff-calculator": () => import("@/calculators/CreditCardPayoffCalculator"),
  "salary-calculator": () => import("@/calculators/SalaryCalculator"),
  "inflation-calculator": () => import("@/calculators/InflationCalculator"),
  "income-tax-calculator": () => import("@/calculators/IncomeTaxCalculator"),
  "sales-tax-calculator": () => import("@/calculators/SalesTaxCalculator"),
  "sip-calculator": () => import("@/calculators/SipCalculator"),
  "swp-calculator": () => import("@/calculators/SwpCalculator"),
  "lumpsum-calculator": () => import("@/calculators/LumpsumCalculator"),
  "ppf-calculator": () => import("@/calculators/PpfCalculator"),
  "epf-calculator": () => import("@/calculators/EpfCalculator"),
  "nps-calculator": () => import("@/calculators/NpsCalculator"),
  "sukanya-samriddhi-calculator": () => import("@/calculators/SukanyaSamriddhiCalculator"),
  "gratuity-calculator": () => import("@/calculators/GratuityCalculator"),
  "hra-calculator": () => import("@/calculators/HraCalculator"),
  "da-calculator": () => import("@/calculators/DaCalculator"),
  "leave-encashment-calculator": () => import("@/calculators/LeaveEncashmentCalculator"),
  "income-tax-calculator-india": () => import("@/calculators/IncomeTaxCalculatorIndia"),
  "gst-calculator": () => import("@/calculators/GstCalculator"),
  "tds-calculator": () => import("@/calculators/TdsCalculator"),
  "professional-tax-calculator": () => import("@/calculators/ProfessionalTaxCalculator"),
  "stamp-duty-calculator": () => import("@/calculators/StampDutyCalculator"),
  "compound-interest-calculator": () => import("@/calculators/CompoundInterestCalculator"),
  "investment-calculator": () => import("@/calculators/CompoundInterestCalculator"),
  "roi-calculator": () => import("@/calculators/RoiCalculator"),
  "interest-rate-calculator": () => import("@/calculators/InterestRateCalculator"),
  "retirement-calculator": () => import("@/calculators/RetirementCalculator"),
  "bmi-calculator": () => import("@/calculators/BmiCalculator"),
  "bmr-calculator": () => import("@/calculators/BmrCalculator"),
  "tdee-calculator": () => import("@/calculators/TdeeCalculator"),
  "body-fat-calculator": () => import("@/calculators/BodyFatCalculator"),
  "ideal-weight-calculator": () => import("@/calculators/IdealWeightCalculator"),
  "calorie-calculator": () => import("@/calculators/CalorieCalculator"),
  "macro-calculator": () => import("@/calculators/MacroCalculator"),
  "statistics-calculator": () => import("@/calculators/StatisticsCalculator"),
  "standard-deviation-calculator": () => import("@/calculators/StandardDeviationCalculator"),
  "percentage-calculator": () => import("@/calculators/PercentageCalculator"),
  "fraction-calculator": () => import("@/calculators/FractionCalculator"),
  "ratio-calculator": () => import("@/calculators/RatioCalculator"),
  "quadratic-formula-calculator": () => import("@/calculators/QuadraticFormulaCalculator"),
  "log-calculator": () => import("@/calculators/LogCalculator"),
  "exponent-calculator": () => import("@/calculators/ExponentCalculator"),
  "matrix-calculator": () => import("@/calculators/MatrixCalculator"),
  "slope-calculator": () => import("@/calculators/SlopeCalculator"),
  "polynomial-calculator": () => import("@/calculators/PolynomialCalculator"),
  "linear-equation-calculator": () => import("@/calculators/LinearEquationCalculator"),
  "area-calculator": () => import("@/calculators/AreaCalculator"),
  "volume-calculator": () => import("@/calculators/VolumeCalculator"),
  "surface-area-calculator": () => import("@/calculators/SurfaceAreaCalculator"),
  "triangle-calculator": () => import("@/calculators/TriangleCalculator"),
  "circle-calculator": () => import("@/calculators/CircleCalculator"),
  "distance-calculator": () => import("@/calculators/DistanceCalculator"),
  "pythagorean-theorem-calculator": () => import("@/calculators/PythagoreanTheoremCalculator"),
  "percent-error-calculator": () => import("@/calculators/PercentErrorCalculator"),
  "ohms-law-calculator": () => import("@/calculators/OhmsLawCalculator"),
  "density-calculator": () => import("@/calculators/DensityCalculator"),
  "speed-calculator": () => import("@/calculators/SpeedDistanceTimeCalculator"),
  "force-calculator": () => import("@/calculators/ForceCalculator"),
  "molarity-calculator": () => import("@/calculators/MolarityCalculator"),
  "age-calculator": () => import("@/calculators/AgeCalculator"),
  "date-calculator": () => import("@/calculators/DateCalculator"),
  "time-duration-calculator": () => import("@/calculators/TimeDurationCalculator"),
  "day-counter": () => import("@/calculators/DayCounter"),
  "temperature-converter": () => import("@/calculators/TemperatureConverter"),
  "length-converter": () => import("@/calculators/LengthConverter"),
  "weight-converter": () => import("@/calculators/WeightConverter"),
  "speed-converter": () => import("@/calculators/SpeedConverter"),
  "currency-converter": () => import("@/calculators/CurrencyConverter"),
  "time-zone-converter": () => import("@/calculators/TimeZoneConverter"),
  "break-even-calculator": () => import("@/calculators/BreakEvenCalculator"),
  "profit-margin-calculator": () => import("@/calculators/ProfitMarginCalculator"),
  "markup-calculator": () => import("@/calculators/MarkupCalculator"),
  "working-capital-calculator": () => import("@/calculators/WorkingCapitalCalculator"),
  "ebitda-calculator": () => import("@/calculators/EbitdaCalculator"),
};

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return calculatorRegistry.map((calc) => ({
    slug: calc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calc = getCalculatorBySlug(params.slug);
  if (!calc) return { title: "Calculator Not Found" };

  const title = `${calc.name} — Free Online Calculator`;
  const description = calc.description;
  const url = `https://racira.com/calculator/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Racira",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CalculatorPage({ params }: Props) {
  const { slug } = params;
  const calc = getCalculatorBySlug(slug);

  if (!calc) {
    notFound();
  }

  if (!calc.isBuilt) {
    return <ComingSoonPage />;
  }

  const importFn = calculatorComponents[slug];

  if (!importFn) {
    return <ComingSoonPage />;
  }

  const CalculatorComponent = dynamic(importFn, {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading Calculator...
      </div>
    ),
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalculatorComponent />
    </Suspense>
  );
}
