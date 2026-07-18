require('ts-node/register');
const { CATEGORIES } = require('./src/data/productivity/tools.ts');
const count = CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0);
console.log('Total:', count);
