/**
 * Indexability switch for /calculator "soon" pages.
 *
 * `true`  — soon pages are indexable (no robots noindex). They keep their
 *           self-referencing canonical and on-demand rendering.
 * `false` — restore the previous behaviour: soon pages emit
 *           `robots: { index: false, follow: true }`.
 *
 * Single source of truth so reverting is a one-line change.
 */
export const INDEX_SOON_PAGES = true;
