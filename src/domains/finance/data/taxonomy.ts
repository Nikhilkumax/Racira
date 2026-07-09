/**
 * Categories, tags, authors data access.
 * TODO(Cloud): swap for Supabase queries when Cloud is enabled.
 */
import { getStore, uid } from "./store";
import type { Author, Category, Tag } from "@/types/finance/db";

export const listCategories = (): Category[] => getStore().categories.slice();
export const getCategoryBySlug = (slug: string) => getStore().categories.find((c) => c.slug === slug) ?? null;
export function createCategory(input: Omit<Category, "id">): Category {
  const c: Category = { id: uid("c"), ...input };
  getStore().categories.push(c);
  return c;
}
export function updateCategory(id: string, patch: Partial<Category>): Category | null {
  const s = getStore();
  const i = s.categories.findIndex((c) => c.id === id);
  if (i < 0) return null;
  s.categories[i] = { ...s.categories[i], ...patch };
  return s.categories[i];
}
export function deleteCategory(id: string): boolean {
  const s = getStore();
  const before = s.categories.length;
  s.categories = s.categories.filter((c) => c.id !== id);
  return s.categories.length < before;
}

export const listTags = (): Tag[] => getStore().tags.slice();
export const getTagBySlug = (slug: string) => getStore().tags.find((t) => (t as any).slug === slug) ?? null;
export function createTag(input: Omit<Tag, "id">): Tag {
  const t: Tag = { id: uid("t"), ...input };
  getStore().tags.push(t);
  return t;
}
export function deleteTag(id: string): boolean {
  const s = getStore();
  const before = s.tags.length;
  s.tags = s.tags.filter((t) => t.id !== id);
  return s.tags.length < before;
}

export const listAuthors = (): Author[] => getStore().authors.slice();
export const getAuthorBySlug = (slug: string) => getStore().authors.find((a) => a.slug === slug) ?? null;
export const getAuthorById = (id: string) => getStore().authors.find((a) => a.id === id) ?? null;