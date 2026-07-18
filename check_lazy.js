const fs = require('fs');
const registry = fs.readFileSync('src/domains/calculator/registry.ts', 'utf8');
const lazyComps = fs.readFileSync('src/app/calculator/lazyComponents.tsx', 'utf8');

const isBuiltMatch = [...registry.matchAll(/slug:\s*["']([^"']+)["'],[^}]*isBuilt:\s*true/g)].map(m => m[1]);
console.log('isBuilt: true count:', isBuiltMatch.length);

const notInLazy = isBuiltMatch.filter(slug => {
    return !lazyComps.includes(`"${slug}"`) && !lazyComps.includes(`'${slug}'`);
});
console.log('Not in lazyComponents:', notInLazy);

// What about files that DO exist in lazyComponents but point to ComingSoonCalculator?
const stubsInLazy = [];
const lines = lazyComps.split('\n');
for (const line of lines) {
    if (line.includes('ComingSoonCalculator')) {
        const match = line.match(/["']([^"']+)["']:\s*dynamic/);
        if (match) {
            stubsInLazy.push(match[1]);
        }
    }
}
console.log('Stubs in lazyComponents pointing to ComingSoonCalculator:', stubsInLazy);

// Compare stubsInLazy with registry isBuilt:true
const corrupted = stubsInLazy.filter(slug => isBuiltMatch.includes(slug));
console.log('Corrupted (isBuilt:true BUT uses ComingSoonCalculator):', corrupted);
