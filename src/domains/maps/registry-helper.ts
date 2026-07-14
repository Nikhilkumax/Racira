export const getMapToolBySlug = (slug: string) => SEARCH_REGISTRY.find((t) => t.slug === slug);
