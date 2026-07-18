import fs from 'fs';
import path from 'path';

const domains = [
  '3d', 'animator', 'audio', 'business', 'cad', 'calculator', 'colors', 'crypto', 'design', 'developers', 'education', 'engineering', 'finance', 'fitness', 'flowchart', 'games', 'image', 'insight', 'maps', 'music', 'pdf', 'photo', 'presentation', 'productivity', 'security', 'seo', 'travel', 'typography', 'video', 'voice', 'writing'
];

async function checkDomain(domain, retryCount = 0) {
  try {
    const res = await fetch(`http://localhost:3002/${domain}`);
    const html = await res.text();
    
    const regex = new RegExp(`href="(/${domain}/[^"]+)"`);
    const match = html.match(regex);
    
    let href = 'N/A';
    if (match) {
        href = match[1];
    } else {
        const fallbackRegex = /href="(\/[^"]*(?:tool|tools)[^"]*)"/;
        const fbMatch = html.match(fallbackRegex);
        if (fbMatch) {
            href = fbMatch[1];
        } else {
             const subpathRegex = new RegExp(`href="(/${domain}/?[^"]*)"`, "g");
             const allMatches = [...html.matchAll(subpathRegex)];
             if (allMatches.length > 0) {
                 href = allMatches[allMatches.length - 1][1];
             }
        }
    }
    
    if (href === 'N/A' || href === `/${domain}` || href === `/${domain}/`) {
      return { domain, href: 'N/A', status: res.status, result: 'No ToolCard Link Found' };
    }
    
    const toolRes = await fetch(`http://localhost:3002${href}`);
    const toolHtml = await toolRes.text();
    const isComingSoon = toolHtml.includes('ComingSoon') || toolHtml.includes('Coming Soon') || toolHtml.includes('coming-soon');
    const is404 = toolRes.status === 404;
    
    let result = 'Real Tool Rendered';
    if (is404) result = '404 Not Found';
    else if (isComingSoon) result = 'Coming Soon';
    else if (toolRes.status !== 200) result = `HTTP ${toolRes.status}`;
    
    return { domain, href, status: toolRes.status, result };
  } catch (err) {
    if (retryCount < 3) {
      await new Promise(r => setTimeout(r, 5000));
      return checkDomain(domain, retryCount + 1);
    }
    return { domain, href: 'Error', status: 'Error', result: err.message };
  }
}

async function run() {
  console.log('Domain | First Tool Href | Status Code | Render Result');
  console.log('---|---|---|---');
  for (const domain of domains) {
    const res = await checkDomain(domain);
    console.log(`${res.domain} | ${res.href} | ${res.status} | ${res.result}`);
    // Sleep to let Next.js breathe
    await new Promise(r => setTimeout(r, 2000));
  }
}

run();
