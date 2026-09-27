import { notFound } from "next/navigation";
import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { PostForm } from "@/domains/finance/admin/post-form";
import { getPostById } from "@/domains/finance/data/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Edit post</h1>
      <PostForm initial={post} />
    </AdminShell>
  );
}
