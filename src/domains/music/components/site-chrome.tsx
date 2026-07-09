

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-display font-semibold text-foreground">Racira Music</span> — free
            browser tools for musicians.
          </p>
          <p>© {new Date().getFullYear()} Racira</p>
        </div>
      </div>
    </footer>
  );
}
