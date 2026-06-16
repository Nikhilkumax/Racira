const fs = require('fs');
const path = require('path');

const NEXT_CONFIG = path.join(__dirname, '..', 'next.config.mjs');

const redirects = [
  "{ source: '/calculator/business/saas-startup', destination: '/calculator/business/saas-startups', permanent: true }",
  "{ source: '/calculator/math/algebra-geometry', destination: '/calculator/math/algebra', permanent: true }",
  "{ source: '/calculator/math/binary-hex', destination: '/calculator/math/number-theory-discrete-math', permanent: true }",
  "{ source: '/calculator/math/applied-financial-math', destination: '/calculator/math/financial-mathematics', permanent: true }",
  "{ source: '/calculator/math/applied-mathematics', destination: '/calculator/math/financial-mathematics', permanent: true }",
  "{ source: '/calculator/math/discrete-math-logic', destination: '/calculator/math/number-theory-discrete-math', permanent: true }",
  "{ source: '/calculator/science/biology-genetics', destination: '/calculator/science/biology-life-sciences', permanent: true }",
  "{ source: '/calculator/science/physics-waves-optics', destination: '/calculator/science/waves-optics-nuclear', permanent: true }",
  "{ source: '/calculator/science/physics-thermodynamics', destination: '/calculator/science/thermodynamics-fluids', permanent: true }",
  "{ source: '/calculator/science/astrophysics-relativity', destination: '/calculator/science/astronomy-space-science', permanent: true }",
  "{ source: '/calculator/science/kinematics-dynamics', destination: '/calculator/science/mechanics-motion', permanent: true }",
  "{ source: '/calculator/science/aquatics-marine-science', destination: '/calculator/science/earth-atmosphere-geography', permanent: true }",
  "{ source: '/calculator/engineering/civil-engineering', destination: '/calculator/engineering/civil-structural-engineering', permanent: true }",
  "{ source: '/calculator/engineering/process-industrial', destination: '/calculator/engineering/industrial-manufacturing', permanent: true }",
  "{ source: '/calculator/engineering/materials-vibration', destination: '/calculator/engineering/materials-science', permanent: true }",
  "{ source: '/calculator/technology/software-development', destination: '/calculator/technology/programming-software', permanent: true }",
  "{ source: '/calculator/technology/ai-machine-learning', destination: '/calculator/technology/data-science-ai-ml', permanent: true }",
  "{ source: '/calculator/technology/web-seo', destination: '/calculator/technology/web-digital', permanent: true }",
  "{ source: '/calculator/technology/cloud-infrastructure', destination: '/calculator/technology/cloud-devops', permanent: true }",
  "{ source: '/calculator/technology/performance-devops', destination: '/calculator/technology/cloud-devops', permanent: true }",
  "{ source: '/calculator/technology/storage-hardware', destination: '/calculator/technology/database-storage', permanent: true }",
  "{ source: '/calculator/technology/marketing-analytics', destination: '/calculator/technology/web-digital', permanent: true }",
  "{ source: '/calculator/technology/gaming-display', destination: '/calculator/technology/programming-software', permanent: true }",
  "{ source: '/calculator/everyday-life/food-kitchen-cooking', destination: '/calculator/everyday-life/food-cooking', permanent: true }",
  "{ source: '/calculator/everyday-life/home-garden', destination: '/calculator/everyday-life/home-household', permanent: true }",
  "{ source: '/calculator/everyday-life/time-dates-productivity', destination: '/calculator/everyday-life/time-productivity', permanent: true }",
  "{ source: '/calculator/everyday-life/shopping-personal-finance', destination: '/calculator/everyday-life/consumer-shopping', permanent: true }",
  "{ source: '/calculator/everyday-life/fantasy-betting', destination: '/calculator/everyday-life/gaming-hobbies', permanent: true }",
  "{ source: '/calculator/everyday-life/pets-animals', destination: '/calculator/everyday-life/gaming-hobbies', permanent: true }",
  "{ source: '/calculator/construction/surveying-gis', destination: '/calculator/construction/surveying-site-work', permanent: true }",
  "{ source: '/calculator/construction/project-management-estimating', destination: '/calculator/construction/estimating-costs', permanent: true }"
];

let nextConfigContent = fs.readFileSync(NEXT_CONFIG, 'utf-8');

// The file has a section:
//       { source: '/calculator/health/pets-animals', destination: '/calculator/everyday-life/pets-animals', permanent: true }
//     ];
//   },

let newContent = nextConfigContent.replace(
  /(\{\s*source:\s*['"]\/calculator\/health\/pets-animals['"],\s*destination:\s*['"]\/calculator\/everyday-life\/pets-animals['"],\s*permanent:\s*true\s*\})\s*\n\s*\];/,
  "$1,\n      // ── ROUND 2 REDIRECTS ────────────────────────────────────────\n      " + redirects.join(",\n      ") + "\n    ];"
);

fs.writeFileSync(NEXT_CONFIG, newContent, 'utf-8');
console.log("Appended Round 2 redirects to next.config.mjs");
