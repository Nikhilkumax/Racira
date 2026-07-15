import { SEARCH_REGISTRY } from "./registry";
export const getMapToolBySlug = (slug: string) => SEARCH_REGISTRY.find((t) => t.slug === slug);
