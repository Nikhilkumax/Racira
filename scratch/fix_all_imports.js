const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

let files = walk('src/app').filter(f => f.match(/src\/app\/[a-zA-Z0-9-]+\/page\.tsx/));
files.push('src/domains/pdf/tools/Index.tsx');
files.push('src/domains/colors/components/home-client.tsx');

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    if (c.includes('<Search') && !c.match(/import\s+{([^}]*Search[^}]*)}\s+from\s+['"]lucide-react['"]/)) {
        console.log('Fixing ' + f);
        c = c.replace(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/, 'import { Search, $1 } from "lucide-react"');
        fs.writeFileSync(f, c);
    }
});
