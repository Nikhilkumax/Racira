import Link from "next/link";
import { Clock } from "lucide-react";
import type { PostWithRelations } from "@/types/finance/db";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PostCard({ post, variant = "default" }: { post: PostWithRelations; variant?: "default" | "compact" }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.cover_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <Link
          href={`/category/${post.category.slug}`}
          className="font-semibold uppercase tracking-wider text-primary"
        >
          {post.category.name}
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{fmt(post.published_at)}</span>
      </div>
      <Link href={`/blog/${post.slug}`}>
        <h3
          className={
            "mt-2 font-display font-semibold leading-tight transition-colors group-hover:text-primary " +
            (variant === "compact" ? "text-lg" : "text-xl md:text-2xl")
          }
        >
          {post.title}
        </h3>
      </Link>
      {variant !== "compact" && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      )}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <img src={post.author.avatar_url} alt="" className="h-6 w-6 rounded-full" />
        <Link href={`/authors/${post.author.slug}`} className="font-medium text-foreground hover:text-primary">
          {post.author.name}
        </Link>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {post.reading_time} min read
        </span>
      </div>
    </article>
  );
}