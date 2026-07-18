const fs = require('fs');
const execSync = require('child_process').execSync;
let content = fs.readFileSync('scratch-detect-finance.js', 'utf8');
content += `
const execSync = require('child_process').execSync;
financeRebuild.forEach(f => { 
    console.log("Resetting " + f); 
    execSync("git checkout src/domains/calculator/components/" + f); 
});
`;
fs.writeFileSync('scratch-detect-finance7.js', content);
