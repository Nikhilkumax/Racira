export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="racira-page-container py-10 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          <span className="font-semibold text-foreground">Racira Video</span> — All-in-one video tools, free and private.
        </p>
        <p>© {new Date().getFullYear()} Racira Video. Runs entirely in your browser.</p>
      </div>
    </footer>
  );
}