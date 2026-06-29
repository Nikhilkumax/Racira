/**
 * Database types — mirror the SQL schema in /supabase/schema.sql.
 * When Lovable Cloud is enabled these become the row shapes returned by Supabase.
 */

export type PostStatus = "draft" | "published";

export interface Author {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatar_url: string;
  role: string;
  twitter?: string;
  linkedin?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown
  cover_url: string;
  author_id: string;
  category_id: string;
  tag_ids: string[];
  status: PostStatus;
  meta_title: string;
  meta_description: string;
  reading_time: number;
  published_at: string;
  updated_at: string;
  featured?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  created_at: string;
}

export interface PostWithRelations extends Post {
  author: Author;
  category: Category;
  tags: Tag[];
}