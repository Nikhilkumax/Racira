const ts = require('typescript');
const fs = require('fs');

function parse(file, label) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ES2020, true);
  let arr = null;
  sf.forEachChild(node => {
    if (ts.isVariableStatement(node)) {
      const decl = node.declarationList.declarations[0];
      const name = decl.name.getText();
      if (name === 'financeCalculators' || name === 'educationCalculators') {
        arr = decl.initializer;
      }
    }
  });
  const out = [];
  arr.elements.forEach(el => {
    const obj = {};
    el.properties.forEach(p => {
      if (ts.isPropertyAssignment(p)) {
        const k = p.name.getText();
        const v = p.initializer;
        if (ts.isStringLiteral(v)) obj[k] = v.text;
        else if (ts.isNumericLiteral(v)) obj[k] = Number(v.text);
        else if (v.kind === ts.SyntaxKind.TrueKeyword) obj[k] = true;
        else if (v.kind === ts.SyntaxKind.FalseKeyword) obj[k] = false;
        else obj[k] = '<expr:' + v.getText().slice(0, 40) + '>';
      } else if (ts.isShorthandPropertyAssignment(p)) {
        obj[p.name.getText()] = '<shorthand:' + p.initializer && p.initializer.getText ? p.initializer.getText() : '' + '>';
      }
    });
    out.push(obj);
  });
  console.log(label, 'entries parsed:', out.length);
  const live = out.filter(o => o.status === 'live');
  const soon = out.filter(o => o.status === 'soon');
  console.log(label, 'live:', live.length, 'soon:', soon.length, 'other:', out.length - live.length - soon.length);
  console.log(label, 'isBuilt:true:', out.filter(o => o.isBuilt === true).length, 'isBuilt:false:', out.filter(o => o.isBuilt === false).length);
  console.log(label, 'missing status:', out.filter(o => o.status === undefined).map(o => o.slug).slice(0, 10));
  fs.writeFileSync('scratch/_audit_' + label + '.json', JSON.stringify(out, null, 1));
  return out;
}

parse('src/domains/calculator/registry/finance.ts', 'FINANCE');
parse('src/domains/calculator/registry/education.ts', 'EDUCATION');
