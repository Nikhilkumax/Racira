import Link from "next/link";
import { ROOT_SITE, type SiteIdentity } from "@/lib/site-identity";

const Footer = ({
  /** Override the copyright line for domain contexts (e.g. "© 2026 Racira PDF. …"). */
  copyright,
  site = ROOT_SITE as unknown as SiteIdentity,
}: {
  copyright?: string;
  site?: SiteIdentity;
} = {}) => {
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
              <li><Link href="/pdf" className="text-foreground/80 hover:text-foreground">PDF</Link></li>
              <li><Link href="/finance" className="text-foreground/80 hover:text-foreground">Finance</Link></li>
              <li><Link href="/image" className="text-foreground/80 hover:text-foreground">Image</Link></li>
              <li><Link href="/#categories" className="text-foreground/80 hover:text-foreground">All Categories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-foreground/80 hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="text-foreground/80 hover:text-foreground">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-foreground/80 hover:text-foreground">Privacy</Link></li>
              <li><Link href="/terms-of-service" className="text-foreground/80 hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>{copyright ?? `© ${new Date().getFullYear()} ${site.copyrightName}. All rights reserved.`}</p>
          <p>One platform. Every essential tool.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
