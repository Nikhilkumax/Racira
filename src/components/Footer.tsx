import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">R</span>
              </span>
              <span className="text-lg font-bold tracking-tight">Racira</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              A unified platform for the everyday tools you actually use — fast, private,
              and built for the browser.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Categories
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/calculator" className="text-foreground/80 hover:text-foreground">Calculator</Link></li>
              <li><Link href="/pdf-tools" className="text-foreground/80 hover:text-foreground">PDF</Link></li>
              <li><Link href="/image-tools" className="text-foreground/80 hover:text-foreground">Image</Link></li>
              <li><Link href="/ai-tools" className="text-foreground/80 hover:text-foreground">Voice</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="text-foreground/80 hover:text-foreground">About</a></li>
              <li><a href="#contact" className="text-foreground/80 hover:text-foreground">Contact</a></li>
              <li><a href="#privacy" className="text-foreground/80 hover:text-foreground">Privacy</a></li>
              <li><a href="#terms" className="text-foreground/80 hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Racira. All rights reserved.</p>
          <p>One platform. Every essential tool.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
