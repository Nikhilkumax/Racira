const fs = require('fs');
let c = fs.readFileSync('src/app/colors/page.tsx', 'utf8');
c = c.replace('import { HomeClient } from "@/domains/colors/components/home-client";', 'import { HomeClient } from "@/domains/colors/components/home-client";\nimport Header from "@/components/Header";');
c = c.replace('export default function Home() {', 'export default function Home() {\n  return (\n    <div className="min-h-screen bg-background flex flex-col">\n      <Header mode="category" categoryName="Colors" />\n      <main className="flex-1">\n        <HomeClient />\n      </main>\n    </div>\n  );\n}\n/*');
c = c.replace('return <HomeClient />;', '');
c = c.replace('}', '} */');
fs.writeFileSync('src/app/colors/page.tsx', c);
console.log('Fixed colors page');
