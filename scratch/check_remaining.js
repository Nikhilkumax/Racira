const fs = require('fs');
const categories = fs.readdirSync('src/app').filter(d => fs.statSync('src/app/'+d).isDirectory() && !d.startsWith('(') && !d.startsWith('site') && d !== 'calculator');
const remaining = [];
for (const cat of categories) {
    const pagePath = 'src/app/' + cat + '/page.tsx';
    if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        if (content.includes('<input') && content.includes('placeholder="Search')) {
            remaining.push(pagePath);
        }
    }
    const domainsPath = 'src/domains/' + cat + '/components/';
    if (fs.existsSync(domainsPath)) {
        const files = fs.readdirSync(domainsPath);
        for (const file of files) {
            if (file.endsWith('.tsx')) {
                const content = fs.readFileSync(domainsPath + file, 'utf8');
                if (content.includes('<input') && content.includes('placeholder="Search')) {
                    remaining.push(domainsPath + file);
                }
            }
        }
    }
}
console.log(remaining.join('\n'));
