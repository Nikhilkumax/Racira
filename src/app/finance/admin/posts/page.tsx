import { listPosts } from "@/domains/finance/data/posts";
import { PostsTable } from "./posts-table";

export const dynamic = "force-dynamic";

export default async function PostsList() {
  const posts = await listPosts();
  return <PostsTable initialPosts={posts} />;
}
