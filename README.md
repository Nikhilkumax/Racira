# Racira - Unified Calculator & Tools Platform

Racira is a professional, SEO-optimized platform built with **Next.js 14 (App Router)**. It features over 300+ specialized calculators across various domains including finance, health, math, and more.

## 🚀 Features

- **300+ Tools**: Comprehensive suite of calculators (Financial, Health, Mathematical, Unit Converters).
- **SEO Optimized**: Dynamic metadata generation, clean URL structures, and sitemap support for maximum search visibility.
- **Modern UI/UX**: Built with React, Tailwind CSS, and Shadcn UI for a premium, responsive experience.
- **Fast Performance**: Leveraging Next.js 14 features like Server Components and optimized static generation.
- **Categorized Navigation**: Easy-to-use directory structure for finding tools quickly.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

- `/src/app`: App Router pages and route groups.
- `/src/components`: Reusable UI components and specific tool logic.
- `/src/pages`: Legacy/Template calculator components.
- `/src/data`: Tool registry and metadata configuration.

## 🚦 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Protect /public/ads.txt

`public/ads.txt` is the AdSense site-verification record for racira.com. Do not
delete, rename, reformat, or git-ignore it: nothing in the app imports it, so
losing it is invisible locally and only surfaces as ads failing to serve in
production. It must remain this single line, in `public/`, committed:

    google.com, pub-3924503352309890, DIRECT, f08c47fec0942fa0

It is the single source of truth: no route handler, rewrite, or generated copy
serves this path, and next.config.mjs sends `text/plain; charset=utf-8` with
`Cache-Control: public, max-age=3600` (never immutable). `.gitattributes` pins
it to LF so the served bytes are exact on every OS.

`npm run check:ads` (node _scripts/adsense-verify-check.mjs) fails the build and
the pre-push hook when the file is missing, not byte-exact, git-ignored, or
untracked — or when the old publisher id lingers anywhere, a second ads.txt is
introduced, a route/rewrite shadows the path, or the middleware matcher would
intercept it. `npx playwright test e2e/adsense-verification.test.ts` additionally
asserts the served response (200, text/plain, exact body, no redirect).

## 📄 License

This project is proprietary.
