const { CATEGORIES } = require('../src/data/games/games');

function slugify(name) {
  return name.toLowerCase().replace(/['"']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Print all category/subcategory slugs
CATEGORIES.forEach(cat => {
  const catSlug = slugify(cat.name);
  cat.subcategories.forEach(sub => {
    const subSlug = slugify(sub.name);
    console.log(`/games/${catSlug}/${subSlug}`);
  });
});
