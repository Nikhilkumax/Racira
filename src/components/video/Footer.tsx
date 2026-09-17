import { LegalLinks } from "@/components/LegalLinks";
import { VIDEO_SITE } from "@/domains/video/site";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="racira-page-container py-10 text-sm text-muted-foreground flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p>
          <span className="font-semibold text-foreground">{VIDEO_SITE.copyrightName}</span> — All-in-one video tools, free and private.
        </p>
        <p>© {new Date().getFullYear()} {VIDEO_SITE.copyrightName}. Runs entirely in your browser.</p>
        <LegalLinks />
      </div>
    </footer>
  );
}