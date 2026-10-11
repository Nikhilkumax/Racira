import { MetadataRoute } from 'next';

// ROBOTS.TXT — /ads.txt must stay fetchable by every crawler, and in particular
// by the AdSense crawler (Mediapartners-Google) and Googlebot. The wildcard
// rule already allows everything, but the AdSense-relevant user agents are
// listed explicitly so a future edit that adds a Disallow cannot silently stop
// the ads.txt fetch or ad crawling. Nothing here disallows /ads.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: ['Googlebot', 'Mediapartners-Google'], allow: ['/', '/ads.txt'] },
    ],
    sitemap: 'https://racira.com/sitemap.xml',
  };
}
