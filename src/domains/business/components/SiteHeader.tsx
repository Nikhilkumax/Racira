

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} Racira Business Tools</span>
        <span>53 tools · No signup required</span>
      </div>
    </footer>
  );
}
