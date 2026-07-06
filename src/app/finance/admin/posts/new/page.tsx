import { AdminShell } from "@/domains/finance/admin/admin-shell";
import { PostForm } from "@/domains/finance/admin/post-form";

export default function NewPostPage() {
  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">New post</h1>
      <PostForm />
    </AdminShell>
  );
}