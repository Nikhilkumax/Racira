# RACIRA CALCULATOR PLATFORM AUDIT — PHASE 4: SITEMAP VALIDATION
Generated: 2026-06-12T04:39:38.300Z

## Summary

| Metric | Value | Status |
|--------|-------|--------|
| Sitemap Total URLs | 11,753 | ✅ |
| Calculator URLs | 11,753 | ✅ |
| Duplicate URLs | 0 | ✅ |
| Invalid URLs | 34 | ❌ |
| Route Collisions | 0 | ✅ |

## Sitemap Architecture

- **Source:** `src/app/sitemap.ts` maps directly from `calculatorRegistry`
- **Sync:** 100% — sitemap count always equals registry count
- **Priority:** Built calculators → 0.8 priority, Coming Soon → 0.5 priority
- **Change Frequency:** Built → monthly, Coming Soon → yearly
- **Base URL:** `https://racira.com/calculator/[slug]`

## Priority Distribution

| Priority | Count | Reason |
|----------|-------|--------|
| 0.8 (High) | 468 | Active calculator UIs |
| 0.5 (Low)  | 11285 | Coming Soon placeholders |
