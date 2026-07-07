const fs = require('fs');
let c = fs.readFileSync('src/app/developers/page.tsx', 'utf8');
c = c.replace('import { Search } from "lucide-react";', 'import { Search } from "lucide-react";\nimport Header from "@/components/Header";');
c = c.replace('<main>', '<div className="min-h-screen bg-background flex flex-col">\n      <Header mode="category" categoryName="Developers" />\n      <main className="flex-1">');
c = c.replace('</main>', '</main>\n      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">\n        Racira Developers — built for engineers and creators.\n      </footer>\n    </div>');
fs.writeFileSync('src/app/developers/page.tsx', c);
console.log('Fixed developers page');
