"use client";

/**
 * Canvas can't resolve CSS var() in fill/stroke styles, so read the theme's
 * --primary components from the document root and wrap them in hsl() here.
 * Every Easy-tier canvas tool draws through this helper so the charts follow
 * the active theme. Falls back to a plain blue if the variable is missing.
 */
export function primaryCanvasColor(alpha = 1): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  return raw ? `hsl(${raw} / ${alpha})` : `hsl(217 91% 60% / ${alpha})`;
}
