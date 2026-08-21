const categoryMap: Record<string, string> = {
  "FINANCE": "Finance",
  "BUSINESS": "Business",
  "HEALTH": "Health",
  "MATH": "Math",
  "SCIENCE": "Science",
  "ENGINEERING": "Engineering",
  "TECHNOLOGY": "Technology",
  "ENVIRONMENT": "Environment",
  "EVERYDAY_LIFE": "Everyday Life",
  "TRANSPORTATION": "Transportation",
  "CONSTRUCTION": "Construction",
  "EDUCATION": "Education",
};

export function formatCategory(cat: string) {
  return categoryMap[cat.toUpperCase()] || cat;
}
