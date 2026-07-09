const fs = require('fs');

const targets = [
  {
    file: 'src/app/education/page.tsx',
    categoryName: 'Education'
  },
  {
    file: 'src/app/image/page.tsx',
    categoryName: 'Image'
  },
  {
    file: 'src/app/maps/page.tsx',
    categoryName: 'Maps & GIS'
  },
  {
    file: 'src/domains/security/components/Layout.tsx',
    categoryName: 'Security'
  },
  {
    file: 'src/app/seo/page.tsx',
    categoryName: 'SEO'
  },
  {
    file: 'src/app/writing/page.tsx',
    categoryName: 'Writing'
  }
];

for (const t of targets) {
  if (!fs.existsSync(t.file)) continue;
  let content = fs.readFileSync(t.file, 'utf8');
  
  // Replace <header>...</header> with <Header mode="category" categoryName="..." />
  const match = content.match(/<header[^>]*>.*?<\/header>/is);
  if (match) {
    content = content.replace(match[0], `<Header mode="category" categoryName="${t.categoryName}" />`);
    
    // Check if Header is imported, if not, add it
    if (!content.includes('import Header from')) {
      content = content.replace(/(import .*?;[\r\n]+)/, `$1import Header from "@/components/Header";\n`);
    }
    
    fs.writeFileSync(t.file, content);
    console.log(`Replaced header in ${t.file}`);
  }
}
