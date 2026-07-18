import fs from 'fs';
import path from 'path';

let mdOutput = '';
const log = (msg: string) => { mdOutput += msg + '\n'; };

// This is a rough script. We might need to run it via ts-node or tsx.
const domainsDir = path.join(process.cwd(), 'src/domains');
const dataDir = path.join(process.cwd(), 'src/data');

const getRegistries = () => {
  let files: { domain: string, file: string }[] = [];
  
  if (fs.existsSync(domainsDir)) {
    const domains = fs.readdirSync(domainsDir).filter(d => fs.statSync(path.join(domainsDir, d)).isDirectory());
    for (const d of domains) {
      const regPath = path.join(domainsDir, d, 'registry.ts');
      if (fs.existsSync(regPath)) {
        files.push({ domain: d, file: regPath });
      }
    }
  }

  if (fs.existsSync(dataDir)) {
    const dataDomains = fs.readdirSync(dataDir).filter(d => fs.statSync(path.join(dataDir, d)).isDirectory());
    for (const d of dataDomains) {
      let regPath = path.join(dataDir, d, 'tools.ts');
      if (!fs.existsSync(regPath)) {
        regPath = path.join(dataDir, d, `${d}.ts`);
      }
      if (fs.existsSync(regPath)) {
        files.push({ domain: d, file: regPath });
      }
    }
  }
  return files;
}

const run = async () => {
  const registries = getRegistries();
  
  let mdOutput = '';
  const log = (msg: string) => { mdOutput += msg + '\n'; };

  for (const { domain, file } of registries) {
    try {
      const module = await import(`file://${file.replace(/\\/g, '/')}`);
      let registry = module.SEARCH_REGISTRY || module.default?.SEARCH_REGISTRY || module.calculatorRegistry || module.audioRegistry || module.gamesRegistry || module.TOOLS || module.tools || module.ALL_TOOLS;
      
      if (!registry && module.categories) {
        registry = module.categories.flatMap((c: any) => c.tools.map((t: any) => ({ ...t, category: c.name })));
      } else if (!registry && module.CATEGORIES) {
        registry = module.CATEGORIES.flatMap((c: any) => c.tools.map((t: any) => ({ ...t, category: c.name })));
      }

      if (!registry) {
        log(`No SEARCH_REGISTRY found for ${domain} at ${file}`);
        continue;
      }

      log(`\n### Domain: ${domain}`);
      log(`| Page Type | Old Path | New Path | Indexed? | Redirect Needed? |`);
      log(`| --- | --- | --- | --- | --- |`);

      const categories = new Set<string>();
      const subcategories = new Set<string>();
      const tools = new Set<string>();
      const slugs = new Map<string, string>();

      for (const item of registry) {
        const itemHref = item.href || `/${domain}/${item.slug}`;
        tools.add(JSON.stringify({ name: item.name, slug: item.slug, href: itemHref }));
        if (item.category) categories.add(item.category);
        if (item.subcategory) subcategories.add(JSON.stringify({ category: item.category, subcategory: item.subcategory }));
      }

      const isLiveDomain = domain === 'calculator' || domain === 'voice';

      for (const t of tools) {
        const item = JSON.parse(t);
        const oldPath = item.href;
        const newPath = `/${domain}/${item.slug}`;
        const compliant = oldPath === newPath;
        const redirect = (!compliant && isLiveDomain) ? 'Yes' : 'No';
        log(`| Tool | \`${oldPath}\` | \`${newPath}\` | Yes | ${redirect} |`);
        slugs.set(item.slug, (slugs.get(item.slug) ? slugs.get(item.slug) + ', Tool' : 'Tool'));
      }

      for (const c of categories) {
        const slug = slugify(c);
        let oldPath = `/${domain}/${slug}`;
        if (domain === 'developers') oldPath = `/${domain}/tools/${slug}`;
        const newPath = `/${domain}/${slug}`;
        log(`| Category | \`${oldPath}\` | \`${newPath}\` | No | No |`);
        slugs.set(slug, (slugs.get(slug) ? slugs.get(slug) + ', Category' : 'Category'));
      }

      for (const s of subcategories) {
        const item = JSON.parse(s);
        const catSlug = slugify(item.category);
        const subSlug = slugify(item.subcategory);
        let oldPath = `/${domain}/${catSlug}/${subSlug}`;
        if (domain === 'developers') oldPath = `/${domain}/tools/${catSlug}/${subSlug}`;
        const newPath = `/${domain}/${subSlug}`;
        log(`| Subcategory | \`${oldPath}\` | \`${newPath}\` | No | No |`);
        slugs.set(subSlug, (slugs.get(subSlug) ? slugs.get(subSlug) + ', Subcategory' : 'Subcategory'));
      }
      
      const collisions = [...slugs.entries()].filter(([k, v]) => v.includes(','));
      if (collisions.length > 0) {
        log(`\n> [!WARNING]\n> **Collisions for ${domain}:**\n`);
        for (const [slug, types] of collisions) {
          log(`> - \`${slug}\` is used by: ${types}\n`);
        }
      }
    } catch (e) {
      log(`Error processing ${domain}: ` + (e instanceof Error ? e.message : String(e)));
    }
  }
  fs.writeFileSync('C:\\Users\\nikhi\\.gemini\\antigravity\\scratch\\audit_output.md', mdOutput, 'utf8');
}


function slugify(s: string) {
  if (!s) return '';
  return s.toLowerCase().replace(/&/g, "and").replace(/\//g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

run();
