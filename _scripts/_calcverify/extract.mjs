/**
 * extract.mjs — pull a calculator's math function(s) out of a client component
 * and run them in an isolated vm sandbox, with no React and no app boot.
 *
 * Why: the math lives inline inside `const X = () => { const calculate = ... }`
 * (client component). We transpile TS/JSX with sucrase, locate the named
 * function via AST, brace-match its source, and eval it in a vm with only the
 * globals the math actually needs.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { transform } from "sucrase";
import * as acorn from "acorn";
import vm from "vm";

const COMPONENTS = "src/domains/calculator/components";

function parse(file) {
  const src = readFileSync(resolve(COMPONENTS, file), "utf-8");
  const js = transform(src, { transforms: ["typescript", "jsx"], filePath: file }).code;
  return { js, ast: acorn.parse(js, { ecmaVersion: 2022, sourceType: "module" }) };
}

/** Find a top-level or component-nested arrow/function decl by name; return its source slice. */
export function findFnSource(js, name) {
  for (const marker of [`const ${name} = `, `function ${name}(`, `const ${name}=`]) {
    const idx = js.indexOf(marker);
    if (idx === -1) continue;
    if (marker.startsWith("function")) {
      let d = 0, k = js.indexOf("{", idx);
      for (let i = k; i < js.length; i++) {
        if (js[i] === "{") d++;
        else if (js[i] === "}") { d--; if (d === 0) return js.slice(idx, i + 1); }
      }
      continue;
    }
    // arrow fn: match parens of params, then braces of body
    const pStart = js.indexOf("(", idx);
    let d1 = 0, j = pStart;
    for (; j < js.length; j++) { if (js[j] === "(") d1++; else if (js[j] === ")") { d1--; if (d1 === 0) break; } }
    const bStart = js.indexOf("{", j);
    if (bStart === -1) return js.slice(idx, j + 1); // expression-bodied
    let d2 = 0, k = bStart;
    for (; k < js.length; k++) { if (js[k] === "{") d2++; else if (js[k] === "}") { d2--; if (d2 === 0) { k++; break; } } }
    return js.slice(idx, k);
  }
  return null;
}

/** Load one function by name into a vm context with the supplied globals. */
export function loadFn(file, name, globals = {}) {
  const { js } = parse(file);
  const fnSrc = findFnSource(js, name);
  if (!fnSrc) throw new Error(`function ${name} not found in ${file}`);
  const sandbox = { console, Math, Number, String, JSON, parseFloat, parseInt, isNaN, Boolean, Array, Object, Date, ...globals };
  vm.createContext(sandbox);
  vm.runInContext(fnSrc + `\n;globalThis.__fn = ${name};`, sandbox);
  return sandbox.__fn;
}

/** Load ALL top-level helper declarations before the component, so nested calc fns can reference them. */
export function loadModule(file, names, globals = {}) {
  const { js, ast } = parse(file);
  const out = {};
  const sandbox = { console, Math, Number, String, JSON, parseFloat, parseInt, isNaN, Boolean, Array, Object, Date, ...globals };
  vm.createContext(sandbox);
  for (const n of names) {
    const fnSrc = findFnSource(js, n);
    if (!fnSrc) throw new Error(`function ${n} not found in ${file}`);
    vm.runInContext(fnSrc, sandbox);
  }
  for (const n of names) out[n] = sandbox[n];
  return out;
}
