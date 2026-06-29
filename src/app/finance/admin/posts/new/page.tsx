import { AdminShell } from "@/components/finance/admin/admin-shell";
import { PostForm } from "@/components/finance/admin/post-form";

export default function NewPostPage() {
  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">New post</h1>
      <PostForm />
    </AdminShell>
  );
}