const fs = require('fs');

const file = 'C:/Racira/racira-nextjs/src/data/calculatorRegistry.ts';
let content = fs.readFileSync(file, 'utf8');

const mapping = {
  'Loans & Mortgages': 'Finance',
  'Debt & Credit': 'Finance',
  'Income & Tax': 'Finance',
  'Investment': 'Finance',
  'Savings': 'Finance',
  'Employment': 'Finance',
  'Tax': 'Finance',
  'Loans': 'Finance',
  'Growth': 'Finance',
  'Retirement': 'Finance',
  'Advanced Loans': 'Finance',
  'Investment Analysis': 'Finance',
  'Business Finance': 'Finance',
  'Investment Math': 'Finance',
  'Crypto': 'Finance',
  'Personal Finance': 'Finance',
  'Body Metrics': 'Health',
  'Nutrition': 'Health',
  'Pregnancy': 'Health',
  'Activity': 'Health',
  'Fitness': 'Health',
  'Medical': 'Health',
  'Basic': 'Math',
  'Statistics': 'Math',
  'Algebra & Geometry': 'Math',
  'Binary & Hex': 'Math',
  'Calculus': 'Math',
  'Logic': 'Math',
  'Algebra': 'Math',
  'Geometry': 'Math',
  'Physics': 'Science',
  'Chemistry': 'Science',
  'Weather': 'Science',
  'Kitchen': 'Everyday Life',
  'Clothing': 'Everyday Life',
  'Personal Care': 'Everyday Life',
  'Family': 'Everyday Life',
  'Pets': 'Everyday Life',
  'Gardening': 'Everyday Life',
  'Organization': 'Everyday Life',
  'Travel': 'Everyday Life',
  'Utility': 'Everyday Life',
  'Gaming': 'Everyday Life',
  'Materials': 'Construction',
  'Finishing': 'Construction',
  'Structure': 'Construction',
  'Environment': 'Ecology',
  'Energy': 'Ecology',
  'Computing': 'Technology',
  'Security': 'Technology',
  'Networking': 'Technology',
  'Media': 'Technology',
  'Academic': 'Education',
  'Testing': 'Education',
  'Maintenance': 'Automobile',
  'Performance': 'Automobile'
};

const allowed = ['Finance', 'Health', 'Math', 'Science', 'Everyday Life', 'Construction', 'Sports', 'Ecology', 'Technology', 'Education', 'Conversion', 'Automobile'];

// Regular expression to match `category: "..."` and capture the category value.
const categoryRegex = /category:\s*"([^"]+)"/g;

let match;
let matchCount = 0;
while ((match = categoryRegex.exec(content)) !== null) {
  const cat = match[1];
  if (!allowed.includes(cat) && mapping[cat]) {
    // we want to move `cat` to `subcategory: "cat"` and set `category: mapping[cat]`
    // However, if the object already has a subcategory, we just replace `category:`
    // First, let's find the object block.
    // simpler approach: just replace the category. We might lose subcategory semantics, but wait, 
    // let's do a string replace for `category: "Invalid"` with `category: "Mapped", subcategory: "Invalid"`
  }
}

content = content.replace(/category:\s*"([^"]+)"(,\s*subcategory:\s*"[^"]+")?/g, (fullMatch, cat, subCatMatch) => {
  if (allowed.includes(cat)) return fullMatch;
  
  let newCat = mapping[cat] || 'Finance'; // fallback
  
  if (subCatMatch) {
    // It already has a subcategory, so just replace category
    return `category: "${newCat}"${subCatMatch}`;
  } else {
    // Move the old invalid category to subcategory
    return `category: "${newCat}", subcategory: "${cat}"`;
  }
});

fs.writeFileSync(file, content);
console.log('Categories updated!');
