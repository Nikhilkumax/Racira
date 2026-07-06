/**
 * In-memory store layered over the mock JSON.
 * Lets the admin UI feel real (create / edit / delete) before Lovable Cloud is enabled.
 * State resets on full page reload — by design.
 *
 * TODO(Cloud): When Lovable Cloud is enabled, delete this module and route data
 * access through the Supabase client in src/integrations/supabase/client.
 */
import {
  authors as seedAuthors,
  categories as seedCategories,
  media as seedMedia,
  posts as seedPosts,
  tags as seedTags,
} from "@/domains/finance/data/mock/data";
import type { Author, Category, MediaItem, Post, Subscriber, Tag } from "@/types/finance/db";

type Store = {
  posts: Post[];
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  media: MediaItem[];
  subscribers: Subscriber[];
};

const g = globalThis as unknown as { __racira_store?: Store };

export function getStore(): Store {
  if (!g.__racira_store) {
    g.__racira_store = {
      posts: [...seedPosts],
      authors: [...seedAuthors],
      categories: [...seedCategories],
      tags: [...seedTags],
      media: [...seedMedia],
      subscribers: [],
    };
  }
  return g.__racira_store;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}