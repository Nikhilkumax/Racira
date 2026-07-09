



export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Racira Typography. Free typography tools in your browser.</p>
        <p>No signup required.</p>
      </div>
    </footer>
  );
}