/**
 * site-identity.ts — the platform-wide factory for per-domain site-identity
 * constants (brand name, default titles).
 *
 * Why this exists: every domain used to hand-type its <title>, og:title,
 * twitter:title and footer copyright independently. That is exactly how
 * commit 84247bc1 ("CAD Started") shipped the dev-status string "CAD is fixed"
 * into all four CAD identity surfaces at once — four independent literals,
 * edited in one sweep, no single place to fix and no single assertion to hold.
 *
 * The fix is structural: each domain instantiates ONE typed identity object
 * (src/domains/<domain>/site.ts) and every identity surface reads from it.
 * e2e/platform-site-identity.test.ts then locks the rendered values across
 * every domain, so a placeholder string can never ship silently again.
 *
 * Rules for a good identity object:
 *  - copyrightName is the exact brand token used in footer copyright lines and
 *    title suffixes ("Racira CAD", "Racira PDF", …). It must match the header
 *    brand mark for that domain.
 *  - title is the default <title> / og:title / twitter:title for the domain's
 *    landing page. Titles that embed a tool count should derive that count
 *    from the domain's registry, never hardcode it (see domains/games/site.ts).
 */
export interface SiteIdentity {
  /** URL route segment for the domain, e.g. "cad", "pdf" ("" = site home). */
  domain: string;
  /** Brand token for footer copyright lines and title suffixes. */
  copyrightName: string;
  /**
   * Optional compact display name for nav surfaces where the shared <Header/>
   * prepends "Racira" (e.g. "Fonts" → "Racira Fonts") and for the root of a
   * breadcrumb trail. Set it whenever the nav/breadcrumb label differs from
   * the full brand token (copyrightName).
   */
  shortName?: string;
  /** Default <title> / og:title / twitter:title for the domain's landing page. */
  title: string;
  /** Optional sentence after the copyright name in footer lines (e.g. "Built for engineers and designers."). */
  footerTagline?: string;
}

/**
 * Factory — gives every domain the same shape and a single place to define it.
 * The generic return type keeps fields a domain actually provides non-optional
 * (e.g. typography's shortName is `string`, not `string | undefined`), so call
 * sites can consume them without non-null assertions.
 */
export function defineSiteIdentity<T extends SiteIdentity>(identity: T): Readonly<T> {
  return Object.freeze({ ...identity });
}

/** Standard footer copyright line: "© 2026 Racira CAD. Built for engineers and designers." */
export function copyrightLine(
  site: SiteIdentity,
  year: number = new Date().getFullYear()
): string {
  return `© ${year} ${site.copyrightName}.${site.footerTagline ? ` ${site.footerTagline}.` : ""}`;
}

/** Site-wide identity (platform home page, global footer, /voice chrome). */
export const ROOT_SITE = defineSiteIdentity({
  domain: "",
  copyrightName: "Racira",
  title: "Racira | All Your Essential Tools. One Platform.",
});
