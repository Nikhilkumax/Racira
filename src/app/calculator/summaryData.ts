import { calculatorRegistry } from "@/domains/calculator/registry";
import { onlyLive } from "@/lib/tools/liveToolFilters";

// Only genuinely-built calculators are counted — stub-tagged "live" entries
// (Value A/B template, no wired component) are excluded from display counts.
const activeCalculators = onlyLive(calculatorRegistry);

export const CATEGORY_SUMMARY = [
  {
    "category": "FINANCE",
    "total": activeCalculators.filter(c => c.category === "FINANCE").length,
    "subcategories": [
      {
        "name": "Investment & Wealth",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Investment & Wealth").length
      },
      {
        "name": "Loans & Mortgages",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Loans & Mortgages").length
      },
      {
        "name": "Tax",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Tax").length
      },
      {
        "name": "Savings & Banking",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Savings & Banking").length
      },
      {
        "name": "Personal Finance",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Personal Finance").length
      },
      {
        "name": "Real Estate Finance",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Real Estate Finance").length
      },
      {
        "name": "Insurance",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Insurance").length
      },
      {
        "name": "Economics",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Economics").length
      },
      {
        "name": "Retirement",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Retirement").length
      },
      {
        "name": "Accounting & Financial Statements",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Accounting & Financial Statements").length
      },
      {
        "name": "Options & Derivatives",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Options & Derivatives").length
      },
      {
        "name": "Law & Legal Finance",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Law & Legal Finance").length
      },
      {
        "name": "Debt & Credit",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Debt & Credit").length
      },
      {
        "name": "Crypto & DeFi",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Crypto & DeFi").length
      },
      {
        "name": "Cryptocurrency (Offline Math)",
        "count": activeCalculators.filter(c => c.category === "FINANCE" && c.subcategory === "Cryptocurrency (Offline Math)").length
      }
    ]
  },
  {
    "category": "BUSINESS",
    "total": activeCalculators.filter(c => c.category === "BUSINESS").length,
    "subcategories": [
      {
        "name": "SaaS & Startups",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "SaaS & Startups").length
      },
      {
        "name": "Business Finance",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Business Finance").length
      },
      {
        "name": "Sales & Marketing",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Sales & Marketing").length
      },
      {
        "name": "HR & Payroll",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "HR & Payroll").length
      },
      {
        "name": "Pricing & Revenue",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Pricing & Revenue").length
      },
      {
        "name": "Logistics & Trade",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Logistics & Trade").length
      },
      {
        "name": "Operations & Supply Chain",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Operations & Supply Chain").length
      },
      {
        "name": "Entrepreneurship & Strategy",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Entrepreneurship & Strategy").length
      },
      {
        "name": "Project Management & Finance",
        "count": activeCalculators.filter(c => c.category === "BUSINESS" && c.subcategory === "Project Management & Finance").length
      }
    ]
  },
  {
    "category": "HEALTH",
    "total": activeCalculators.filter(c => c.category === "HEALTH").length,
    "subcategories": [
      {
        "name": "Nutrition & Diet",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Nutrition & Diet").length
      },
      {
        "name": "Fitness & Exercise",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Fitness & Exercise").length
      },
      {
        "name": "Pharmacy & Dosing",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Pharmacy & Dosing").length
      },
      {
        "name": "Clinical & Medical",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Clinical & Medical").length
      },
      {
        "name": "Body Metrics & Anthropometry",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Body Metrics & Anthropometry").length
      },
      {
        "name": "Sleep & Mental Health",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Sleep & Mental Health").length
      },
      {
        "name": "Medical Risk & Clinical Scores",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Medical Risk & Clinical Scores").length
      },
      {
        "name": "Pediatric Health",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Pediatric Health").length
      },
      {
        "name": "Pregnancy & Fertility",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Pregnancy & Fertility").length
      },
      {
        "name": "Cardiovascular & Metabolic Health",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Cardiovascular & Metabolic Health").length
      },
      {
        "name": "Epidemiology & Public Health",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Epidemiology & Public Health").length
      },
      {
        "name": "Ball Sports",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Ball Sports").length
      },
      {
        "name": "Women",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Women").length
      },
      {
        "name": "Running & Endurance",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Running & Endurance").length
      },
      {
        "name": "Aging & Geriatrics",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Aging & Geriatrics").length
      },
      {
        "name": "Cycling & Water Sports",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Cycling & Water Sports").length
      },
      {
        "name": "Weightlifting & Strength",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Weightlifting & Strength").length
      },
      {
        "name": "Fitness Analytics",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Fitness Analytics").length
      },
      {
        "name": "Track & Field",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Track & Field").length
      },
      {
        "name": "Combat & Individual",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Combat & Individual").length
      },
      {
        "name": "Winter, Water & Extreme",
        "count": activeCalculators.filter(c => c.category === "HEALTH" && c.subcategory === "Winter, Water & Extreme").length
      }
    ]
  },
  {
    "category": "MATH",
    "total": activeCalculators.filter(c => c.category === "MATH").length,
    "subcategories": [
      {
        "name": "Financial Mathematics",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Financial Mathematics").length
      },
      {
        "name": "Geometry",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Geometry").length
      },
      {
        "name": "Algebra",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Algebra").length
      },
      {
        "name": "Number Theory & Discrete Math",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Number Theory & Discrete Math").length
      },
      {
        "name": "Calculus",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Calculus").length
      },
      {
        "name": "Statistics",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Statistics").length
      },
      {
        "name": "Trigonometry",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Trigonometry").length
      },
      {
        "name": "Arithmetic & Number Theory",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Arithmetic & Number Theory").length
      },
      {
        "name": "Basic Arithmetic",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Basic Arithmetic").length
      },
      {
        "name": "Statistics & Probability",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Statistics & Probability").length
      },
      {
        "name": "Linear Algebra",
        "count": activeCalculators.filter(c => c.category === "MATH" && c.subcategory === "Linear Algebra").length
      }
    ]
  },
  {
    "category": "SCIENCE",
    "total": activeCalculators.filter(c => c.category === "SCIENCE").length,
    "subcategories": [
      {
        "name": "Chemistry",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Chemistry").length
      },
      {
        "name": "Biology & Life Sciences",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Biology & Life Sciences").length
      },
      {
        "name": "Physics – Mechanics",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Physics – Mechanics").length
      },
      {
        "name": "Waves, Optics & Nuclear",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Waves, Optics & Nuclear").length
      },
      {
        "name": "Astronomy & Space Science",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Astronomy & Space Science").length
      },
      {
        "name": "Physics – Electricity & Magnetism",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Physics – Electricity & Magnetism").length
      },
      {
        "name": "Thermodynamics & Fluids",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Thermodynamics & Fluids").length
      },
      {
        "name": "Earth, Atmosphere & Geography",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Earth, Atmosphere & Geography").length
      },
      {
        "name": "Earth Science & Geology",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Earth Science & Geology").length
      },
      {
        "name": "Mechanics & Motion",
        "count": activeCalculators.filter(c => c.category === "SCIENCE" && c.subcategory === "Mechanics & Motion").length
      }
    ]
  },
  {
    "category": "ENGINEERING",
    "total": activeCalculators.filter(c => c.category === "ENGINEERING").length,
    "subcategories": [
      {
        "name": "Civil & Structural Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Civil & Structural Engineering").length
      },
      {
        "name": "Mechanical Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Mechanical Engineering").length
      },
      {
        "name": "Electrical Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Electrical Engineering").length
      },
      {
        "name": "Chemical Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Chemical Engineering").length
      },
      {
        "name": "Industrial & Manufacturing",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Industrial & Manufacturing").length
      },
      {
        "name": "Electronics & Embedded Systems",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Electronics & Embedded Systems").length
      },
      {
        "name": "Materials Science",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Materials Science").length
      },
      {
        "name": "Aerospace Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Aerospace Engineering").length
      },
      {
        "name": "Environmental Engineering",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Environmental Engineering").length
      },
      {
        "name": "Piping & Flow",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Piping & Flow").length
      },
      {
        "name": "Structural Connections",
        "count": activeCalculators.filter(c => c.category === "ENGINEERING" && c.subcategory === "Structural Connections").length
      }
    ]
  },
  {
    "category": "TECHNOLOGY",
    "total": activeCalculators.filter(c => c.category === "TECHNOLOGY").length,
    "subcategories": [
      {
        "name": "Programming & Software",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Programming & Software").length
      },
      {
        "name": "Web & Digital",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Web & Digital").length
      },
      {
        "name": "Cloud & DevOps",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Cloud & DevOps").length
      },
      {
        "name": "Data Science & AI/ML",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Data Science & AI/ML").length
      },
      {
        "name": "Networking & Infrastructure",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Networking & Infrastructure").length
      },
      {
        "name": "Database & Storage",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Database & Storage").length
      },
      {
        "name": "Cybersecurity",
        "count": activeCalculators.filter(c => c.category === "TECHNOLOGY" && c.subcategory === "Cybersecurity").length
      }
    ]
  },
  {
    "category": "ENVIRONMENT",
    "total": activeCalculators.filter(c => c.category === "ENVIRONMENT").length,
    "subcategories": [
      {
        "name": "Renewable Energy",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Renewable Energy").length
      },
      {
        "name": "Climate & Carbon",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Climate & Carbon").length
      },
      {
        "name": "Agriculture & Food Systems",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Agriculture & Food Systems").length
      },
      {
        "name": "Water & Waste",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Water & Waste").length
      },
      {
        "name": "Ecology & Biodiversity",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Ecology & Biodiversity").length
      },
      {
        "name": "Forestry & Land Use",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Forestry & Land Use").length
      },
      {
        "name": "Livestock & Food Production",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Livestock & Food Production").length
      },
      {
        "name": "Crops & Soil",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Crops & Soil").length
      },
      {
        "name": "Carbon Footprint",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Carbon Footprint").length
      },
      {
        "name": "Farm Business & Sustainability",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Farm Business & Sustainability").length
      },
      {
        "name": "Water & Resource Use",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Water & Resource Use").length
      },
      {
        "name": "Ecological Impact",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Ecological Impact").length
      },
      {
        "name": "Offset & Sequestration",
        "count": activeCalculators.filter(c => c.category === "ENVIRONMENT" && c.subcategory === "Offset & Sequestration").length
      }
    ]
  },
  {
    "category": "EVERYDAY_LIFE",
    "total": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE").length,
    "subcategories": [
      {
        "name": "Home & Household",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Home & Household").length
      },
      {
        "name": "Food & Cooking",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Food & Cooking").length
      },
      {
        "name": "Consumer & Shopping",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Consumer & Shopping").length
      },
      {
        "name": "Gaming & Hobbies",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Gaming & Hobbies").length
      },
      {
        "name": "Travel & Recreation",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Travel & Recreation").length
      },
      {
        "name": "Time & Productivity",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Time & Productivity").length
      },
      {
        "name": "Personal & Family",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Personal & Family").length
      },
      {
        "name": "Creative & Arts",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Creative & Arts").length
      },
      {
        "name": "DIY & Crafts",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "DIY & Crafts").length
      },
      {
        "name": "Fun & Personal",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Fun & Personal").length
      },
      {
        "name": "Other Utilities",
        "count": activeCalculators.filter(c => c.category === "EVERYDAY_LIFE" && c.subcategory === "Other Utilities").length
      }
    ]
  },
  {
    "category": "TRANSPORTATION",
    "total": activeCalculators.filter(c => c.category === "TRANSPORTATION").length,
    "subcategories": [
      {
        "name": "Automotive",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Automotive").length
      },
      {
        "name": "Electric Vehicles",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Electric Vehicles").length
      },
      {
        "name": "Rail & Transit",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Rail & Transit").length
      },
      {
        "name": "Marine & Boating",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Marine & Boating").length
      },
      {
        "name": "Aviation",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Aviation").length
      },
      {
        "name": "Cycling & Micro-Mobility",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Cycling & Micro-Mobility").length
      },
      {
        "name": "Performance & Engine",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Performance & Engine").length
      },
      {
        "name": "Buying & Selling",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Buying & Selling").length
      },
      {
        "name": "EV & Alternative Fuel",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "EV & Alternative Fuel").length
      },
      {
        "name": "Safety & Driving",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Safety & Driving").length
      },
      {
        "name": "Costs & Ownership",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Costs & Ownership").length
      },
      {
        "name": "Fleet & Motorsports",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Fleet & Motorsports").length
      },
      {
        "name": "Suspension & Handling",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Suspension & Handling").length
      },
      {
        "name": "Electrical & Systems",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Electrical & Systems").length
      },
      {
        "name": "Motorsports & Special",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Motorsports & Special").length
      },
      {
        "name": "Tires & Wheels",
        "count": activeCalculators.filter(c => c.category === "TRANSPORTATION" && c.subcategory === "Tires & Wheels").length
      }
    ]
  },
  {
    "category": "CONSTRUCTION",
    "total": activeCalculators.filter(c => c.category === "CONSTRUCTION").length,
    "subcategories": [
      {
        "name": "Estimating & Costs",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Estimating & Costs").length
      },
      {
        "name": "Materials & Quantities",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Materials & Quantities").length
      },
      {
        "name": "Green Building & Energy Efficiency",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Green Building & Energy Efficiency").length
      },
      {
        "name": "Surveying & Site Work",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Surveying & Site Work").length
      },
      {
        "name": "HVAC & Mechanical Systems",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "HVAC & Mechanical Systems").length
      },
      {
        "name": "Plumbing & Electrical",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Plumbing & Electrical").length
      },
      {
        "name": "MEP — Mechanical, Electrical & Plumbing",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "MEP — Mechanical, Electrical & Plumbing").length
      },
      {
        "name": "Masonry, Walls & Framing",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Masonry, Walls & Framing").length
      },
      {
        "name": "Roofing & Flooring",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Roofing & Flooring").length
      },
      {
        "name": "Concrete & Foundation",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Concrete & Foundation").length
      },
      {
        "name": "Measurement & Layout",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Measurement & Layout").length
      },
      {
        "name": "Insulation & Finishing",
        "count": activeCalculators.filter(c => c.category === "CONSTRUCTION" && c.subcategory === "Insulation & Finishing").length
      }
    ]
  },
  {
    "category": "EDUCATION",
    "total": activeCalculators.filter(c => c.category === "EDUCATION").length,
    "subcategories": [
      {
        "name": "Teaching & Curriculum",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Teaching & Curriculum").length
      },
      {
        "name": "Academic Performance",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Academic Performance").length
      },
      {
        "name": "Financial Aid & Student Costs",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Financial Aid & Student Costs").length
      },
      {
        "name": "Learning & Cognitive",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Learning & Cognitive").length
      },
      {
        "name": "Research & Academic Tools",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Research & Academic Tools").length
      },
      {
        "name": "Standardized Tests",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Standardized Tests").length
      },
      {
        "name": "Education Finance",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Education Finance").length
      },
      {
        "name": "Study Skills & Productivity",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Study Skills & Productivity").length
      },
      {
        "name": "GPA & Grades",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "GPA & Grades").length
      },
      {
        "name": "Academic Planning",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Academic Planning").length
      },
      {
        "name": "Language Learning",
        "count": activeCalculators.filter(c => c.category === "EDUCATION" && c.subcategory === "Language Learning").length
      }
    ]
  }
];
