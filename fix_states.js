
const fs = require('fs');
const path = require('path');

const dir = 'src/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix the mess I made in AgeCalculator (and potentially others)
    if (content.includes('const [showResults, setShowResults] = useState(false); months: number;')) {
        content = content.replace('const [showResults, setShowResults] = useState(false); months: number;', 'months: number;');
        // I will re-insert it properly later in the same loop
    }

    // Correct insertion logic: find the end of the useState call
    if ((content.includes('setShowResults(true)') || content.includes('{showResults &&')) && !content.includes('const [showResults, setShowResults]')) {
        const useStateMatches = [...content.matchAll(/useState/g)];
        if (useStateMatches.length > 0) {
            const lastMatch = useStateMatches[useStateMatches.length - 1];
            // Find the first ); after useState
            const endOfStatement = content.indexOf(');', lastMatch.index);
            if (endOfStatement !== -1) {
                const insertPos = endOfStatement + 2; // after );
                content = content.slice(0, insertPos) + '\n  const [showResults, setShowResults] = useState(false);' + content.slice(insertPos);
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Re-fixed state issues in ${file}`);
    }
});
