export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Racira Productivity Tools. Made for focused makers.
        </p>
        <p>
          Free, in-browser tools. One mission: <span className="text-foreground font-medium">protect your attention</span>.
        </p>
      </div>
    </footer>
  );
}
