require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
const { findTool, ALL_TOOLS } = require('./src/domains/photo/registry.ts');
console.log('findTool result:', findTool('histogram-editor'));
