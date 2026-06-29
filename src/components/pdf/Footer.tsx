import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-primary">Racira</span>{" "}
              <span className="text-foreground">PDF</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Fast, free and professional PDF tools for everyone.
            </p>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Popular Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["merge", "split", "compress", "protect", "image-to-pdf", "extract-pages"].map((slug) => (
                <li key={slug}>
                  <Link href={`/pdf/${slug}`} className="hover:text-foreground transition-colors capitalize">
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Tools */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">More Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["ocr", "add-watermark", "unlock", "redact"].map((slug) => (
                <li key={slug}>
                  <Link href={`/pdf/${slug}`} className="hover:text-foreground transition-colors capitalize">
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Privacy Policy", "Terms of Service", "Disclaimer", "About Us", "Contact"].map((item) => (
                <li key={item}>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 Racira PDF. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
