# Racira Calculator Database

**Version:** 1.0  
**Total Calculators:** 11,753  
**Total Categories:** 12  
**Total Subcategories:** 259  
**Built:** 468 | **Coming Soon:** 11285

## Structure

```
calculator-database/
├── finance.json         — 1637 calculators
├── business.json        — 754 calculators
├── health.json          — 1492 calculators
├── math.json            — 1072 calculators
├── science.json         — 997 calculators
├── engineering.json     — 1201 calculators
├── technology.json      — 911 calculators
├── environment.json     — 737 calculators
├── everyday-life.json   — 1001 calculators
├── transportation.json  — 641 calculators
├── construction.json    — 775 calculators
├── education.json       — 535 calculators
│
├── metadata.json        — database statistics
└── README.md            — this file
```

## Category File Format

Each category JSON file follows this structure:

```json
{
  "category": "FINANCE",
  "totalCalculators": 2620,
  "builtCalculators": 229,
  "comingSoonCalculators": 2391,
  "subcategoryCount": 11,
  "lastUpdated": "...",
  "subcategories": {
    "Loans & Mortgages": [
      {
        "slug": "mortgage-calculator",
        "name": "Mortgage Calculator",
        "description": "...",
        "isBuilt": true
      }
    ]
  }
}
```

## Workflow

### Add a New Calculator
1. Find the appropriate `calculator-database/[category].json`
2. Add to the correct subcategory
3. Run `node build_master_database.js` to regenerate `Calculator_Database_Final.json`
4. Run registry sync

### Regenerate Master Database
```bash
node build_master_database.js
```

### Regenerate Category Files from Registry
```bash
node scratch/build_category_db.js
```

## Official Categories

| Category | Calculators | Subcategories |
|---|---|---|
| FINANCE | 1637 | 27 |
| BUSINESS | 754 | 10 |
| HEALTH | 1492 | 44 |
| MATH | 1072 | 19 |
| SCIENCE | 997 | 20 |
| ENGINEERING | 1201 | 15 |
| TECHNOLOGY | 911 | 29 |
| ENVIRONMENT | 737 | 19 |
| EVERYDAY_LIFE | 1001 | 25 |
| TRANSPORTATION | 641 | 18 |
| CONSTRUCTION | 775 | 17 |
| EDUCATION | 535 | 16 |

## Rules

- Do NOT add calculators directly to the registry
- Always go through category JSON files → build_master_database.js → registry sync
- Preserve all slugs — never rename a slug
- `isBuilt: false` for all new calculators until implemented
