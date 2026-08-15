import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Minimal legal-links row used across every domain footer so that
 * Privacy/Terms/About/Contact are reachable from any page on the site.
 */
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground ${className}`}
    >
      {LEGAL_LINKS.map((l, i) => (
        <span key={l.href} className="inline-flex items-center gap-x-5">
          {i > 0 && <span aria-hidden="true" className="opacity-40">·</span>}
          <Link href={l.href} className="hover:text-foreground transition-colors">
            {l.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
