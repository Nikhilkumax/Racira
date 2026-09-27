import { listPosts } from "@/domains/finance/data/posts";
import { listCategories } from "@/domains/finance/data/taxonomy";
import { PageShell } from "@/domains/finance/blog/page-shell";
import { BlogList } from "./blog-list";

// ISR replaces the Phase-5 force-dynamic: the published set is cached and
// re-rendered every 5 minutes, so newly published/scheduled posts surface
// automatically. No cron-based invalidation.
export const revalidate = 300;

export default async function BlogIndex() {
  const [posts, categories] = await Promise.all([
    listPosts({ status: "published" }),
    listCategories(),
  ]);
  return (
    <PageShell>
      <BlogList initialPosts={posts} categories={categories} />
    </PageShell>
  );
}
