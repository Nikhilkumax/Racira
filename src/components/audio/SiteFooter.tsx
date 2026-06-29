export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold text-foreground">Racira Audio</p>
          <p className="text-sm text-muted-foreground">
            All Audio Tools You Need — Fast, Simple &amp; Free
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Racira Audio. All audio is processed privately in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
