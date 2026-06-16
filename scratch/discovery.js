const fs = require('fs');

const db = require('../Calculator_Database_Final.json');
const toSlug = (str) => {
  if (!str) return 'general';
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const explicitMerges = {
  'FINANCE': {
    'loans': 'loans-mortgages',
    'savings': 'savings-banking',
    'crypto': 'crypto-defi',
    'investment': 'investment-wealth',
    'real-estate': 'real-estate-finance',
    'income-tax': 'tax',
    'interest': 'savings-banking',
    'employment': 'personal-finance',
    'growth': 'investment-wealth',
    'general': 'personal-finance',
    'auto': 'loans-mortgages'
  },
  'HEALTH': {
    'body-metrics': 'body-metrics-anthropometry',
    'clinical-dosing': 'pharmacy-dosing',
    'pediatric': 'pediatric-health',
    'nutrition': 'nutrition-diet',
    'pregnancy': 'pregnancy-fertility',
    'mental-health': 'sleep-mental-health',
    'running': 'running-endurance',
    'cycling': 'cycling-water-sports',
    'weightlifting': 'weightlifting-strength',
    'activity': 'fitness-exercise',
    'medical': 'clinical-medical',
    'triathlon': 'running-endurance',
    'bowling': 'ball-sports',
    'baseball': 'ball-sports',
    'basketball': 'ball-sports',
    'football': 'ball-sports',
    'tennis': 'ball-sports',
    'billiards': 'ball-sports',
    'swimming': 'cycling-water-sports',
    'walking': 'running-endurance'
  }
};

const misplacedRules = [
  { source_category: 'FINANCE', slug: 'saas-startup', target_category: 'BUSINESS' },
  { source_category: 'HEALTH', slug: 'fantasy-betting', target_category: 'SPORTS' }, // Or closest equivalent
  { source_category: 'HEALTH', slug: 'motorsports-special', target_category: 'TRANSPORTATION' },
  { source_category: 'HEALTH', slug: 'pets-animals', target_category: 'EVERYDAY_LIFE' }
];

const plan = {
  merges: {},
  relocations: [],
  manual_review: []
};

// Map current state
const state = {};

for (const cat in db) {
  state[cat] = {};
  for (const sub in db[cat]) {
    const slug = toSlug(sub);
    const count = Array.isArray(db[cat][sub]) ? db[cat][sub].length : Object.keys(db[cat][sub]).length;
    state[cat][slug] = { name: sub, count: count };
  }
}

for (const cat in state) {
  plan.merges[cat] = [];
  
  const subcats = Object.keys(state[cat]);
  const activeSubcats = subcats.map(slug => ({
    slug,
    name: state[cat][slug].name,
    count: state[cat][slug].count
  }));

  // Apply explicit merges
  if (explicitMerges[cat]) {
    for (const source in explicitMerges[cat]) {
      const target = explicitMerges[cat][source];
      if (state[cat][source] && state[cat][target]) {
        plan.merges[cat].push({
          source_slug: source,
          target_slug: target,
          source_name: state[cat][source].name,
          target_name: state[cat][target].name,
          source_count: state[cat][source].count,
          target_count: state[cat][target].count,
          action: 'merge_and_redirect',
          reason: 'explicit_rule'
        });
      }
    }
  }

  // Autonomous discovery
  for (let i = 0; i < activeSubcats.length; i++) {
    for (let j = 0; j < activeSubcats.length; j++) {
      if (i === j) continue;
      
      const a = activeSubcats[i];
      const b = activeSubcats[j];

      // Check if already merged explicitly
      const alreadyMerged = plan.merges[cat].some(m => m.source_slug === a.slug || m.source_slug === b.slug);
      if (alreadyMerged) continue;

      let shouldMerge = false;
      let source = null;
      let target = null;

      // Substring logic
      if (b.name.toLowerCase().includes(a.name.toLowerCase()) && b.name.length > a.name.length) {
        shouldMerge = true;
        source = a; target = b;
      } else if (a.name.toLowerCase().includes(b.name.toLowerCase()) && a.name.length > b.name.length) {
        shouldMerge = true;
        source = b; target = a;
      }

      if (shouldMerge) {
        // If both > 50, manual review
        if (source.count > 50 && target.count > 50) {
          plan.manual_review.push({
            category: cat,
            source: source,
            target: target,
            reason: 'both > 50 count'
          });
          continue;
        }

        // Only merge if source is the smaller one or < 15
        if (source.count < target.count || source.count < 15) {
            // Check if this merge is already planned
            const exists = plan.merges[cat].some(m => m.source_slug === source.slug && m.target_slug === target.slug);
            if (!exists) {
                plan.merges[cat].push({
                    source_slug: source.slug,
                    target_slug: target.slug,
                    source_name: source.name,
                    target_name: target.name,
                    source_count: source.count,
                    target_count: target.count,
                    action: 'merge_and_redirect',
                    reason: 'autonomous_discovery'
                });
            }
        }
      }
    }
  }
}

for (const rule of misplacedRules) {
  if (state[rule.source_category] && state[rule.source_category][rule.slug]) {
    plan.relocations.push({
      source_category: rule.source_category,
      target_category: rule.target_category,
      slug: rule.slug,
      name: state[rule.source_category][rule.slug].name,
      count: state[rule.source_category][rule.slug].count
    });
  }
}

fs.writeFileSync('merge_plan.json', JSON.stringify(plan, null, 2));
console.log('Discovery Phase Complete. Written to merge_plan.json');
