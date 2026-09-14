/**
 * LOGIC AUDIT HARNESS — Auto-Calc (Bug A) + Ghost Field (Bug B) scan
 *
 * Phase 1  : static scan of every .tsx in src/domains/calculator/components
 *            - useEffect / useLayoutEffect with non-empty (or missing) deps that link to calculate/setResult
 *            - onChange/onValueChange/onSelect/onInput/onBlur/onKeyDown/onKeyUp handlers calling calculate/setResult
 * Phase 1.5: behavioral verification — extracts the calculate() function (plus every declaration it references,
 *            resolving local imports recursively) and executes it in an isolated vm sandbox with stubbed React
 *            hooks. Runs calculate(defaults) and calculate(defaults with one key altered) for every input key
 *            and compares the JSON output. No React, no app boot, no build.
 *
 * Usage: node _scripts/logic-audit.cjs
 * Outputs: logic_audit_report.md, logic_autocalc_violations.txt, logic_ghost_fields.txt,
 *          logic_audit_results.json, logic_audit_summary.json
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createRequire } = require("module");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");
const COMPONENTS = path.join(ROOT, "src", "domains", "calculator", "components");

// ─────────────────────────────────────────────────────────────────────────────
// text helpers
// ─────────────────────────────────────────────────────────────────────────────

function lineOf(src, idx) {
  let line = 1;
  for (let i = 0; i < idx; i++) if (src.charCodeAt(i) === 10) line++;
  return line;
}

function oneLine(text, max = 220) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function findMatching(src, openIdx, openCh, closeCh) {
  let depth = 0;
  let inStr = null;
  let inTpl = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (lineComment) { if (c === "\n") lineComment = false; continue; }
    if (blockComment) { if (c === "*" && n === "/") blockComment = false; continue; }
    if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (inTpl) { if (c === "\\") { i++; continue; } if (c === "`") inTpl = false; continue; }
    if (c === "/" && n === "/") { lineComment = true; i++; continue; }
    if (c === "/" && n === "*") { blockComment = true; i++; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "`") { inTpl = true; continue; }
    if (c === openCh) depth++;
    else if (c === closeCh) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function splitTopLevelArgs(text) {
  const parts = [];
  let depth = 0;
  let inStr = null;
  let inTpl = false;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inStr) { cur += c; if (c === "\\") { cur += n || ""; i++; continue; } if (c === inStr) inStr = null; continue; }
    if (inTpl) { cur += c; if (c === "\\") { cur += n || ""; i++; continue; } if (c === "`") inTpl = false; continue; }
    if (c === '"' || c === "'") { inStr = c; cur += c; continue; }
    if (c === "`") { inTpl = true; cur += c; continue; }
    if (c === "(" || c === "[" || c === "{") { depth++; cur += c; continue; }
    if (c === ")" || c === "]" || c === "}") { depth--; cur += c; continue; }
    if (c === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/** true if idx is inside actual code (not a comment or string) */
function isInCode(src, idx) {
  let lineComment = false, blockComment = false, inStr = null, inTpl = false;
  for (let i = 0; i < idx; i++) {
    const c = src[i], n = src[i + 1];
    if (lineComment) { if (c === "\n") lineComment = false; continue; }
    if (blockComment) { if (c === "*" && n === "/") blockComment = false; continue; }
    if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (inTpl) { if (c === "\\") { i++; continue; } if (c === "`") inTpl = false; continue; }
    if (c === "/" && n === "/") { lineComment = true; i++; continue; }
    if (c === "/" && n === "*") { blockComment = true; i++; continue; }
    if (c === '"' || c === "'") inStr = c;
    if (c === "`") inTpl = true;
  }
  return !lineComment && !blockComment && !inStr && !inTpl;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — static Bug A scan
// ─────────────────────────────────────────────────────────────────────────────

function scanAutoCalc(src) {
  const hits = [];

  const effectRe = /use(?:Layout)?Effect\s*\(/g;
  let m;
  while ((m = effectRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatching(src, openParen, "(", ")");
    if (closeParen === -1) continue;
    const inner = src.slice(openParen + 1, closeParen);
    const args = splitTopLevelArgs(inner);
    const body = args[0] || "";
    const calcLinked = /[Cc]alculate\s*\(|setResult\s*\(/.test(body);
    if (!calcLinked) continue;
    const depsRaw = args.length >= 2 ? args[1].trim() : null;
    let violation = false;
    let reason = "";
    if (depsRaw === null) {
      violation = true;
      reason = "no deps array — effect re-runs after every render";
    } else if (!depsRaw.startsWith("[")) {
      violation = true;
      reason = "deps argument is not an array: " + oneLine(depsRaw, 140);
    } else {
      const innerDeps = depsRaw.slice(1, depsRaw.lastIndexOf("]")).trim();
      if (innerDeps.length > 0) {
        violation = true;
        reason = "non-empty deps [" + oneLine(innerDeps, 140) + "] — recalculates when inputs change";
      }
    }
    if (violation) {
      hits.push({ kind: "useEffect", line: lineOf(src, m.index), code: oneLine(src.slice(m.index, closeParen + 1)), reason });
    }
  }

  const handlerRe = /(onChange|onValueChange|onSelect|onInput|onBlur|onKeyDown|onKeyUp)\s*=\s*\{/g;
  while ((m = handlerRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const prop = m[1];
    const openBrace = m.index + m[0].length - 1;
    const closeBrace = findMatching(src, openBrace, "{", "}");
    if (closeBrace === -1) continue;
    const handler = src.slice(openBrace + 1, closeBrace).trim();
    if (handler.length === 0) continue;

    let effectiveLinked = /[Cc]alculate\s*\(|setResult\s*\(/.test(handler);
    let effectiveLine = lineOf(src, m.index);
    let effectiveCode = handler;

    if (!effectiveLinked && /^[A-Za-z_$][\w$]*$/.test(handler)) {
      const def = findFunctionDef(src, handler);
      if (def && /[Cc]alculate\s*\(|setResult\s*\(/.test(def.body)) {
        effectiveLinked = true;
        effectiveLine = lineOf(src, def.idx);
        effectiveCode = def.body;
      }
    }
    if (!effectiveLinked) continue;

    if (prop === "onKeyDown" || prop === "onKeyUp") {
      if (/Enter|keyCode\s*===\s*13|\.key\b|which\s*===\s*13/.test(effectiveCode)) continue;
      hits.push({ kind: prop, line: effectiveLine, code: oneLine(effectiveCode), reason: prop + " calls calculate/setResult with no Enter gate — fires on every key" });
    } else {
      hits.push({ kind: prop, line: effectiveLine, code: oneLine(effectiveCode), reason: prop + " handler calls calculate/setResult directly (auto-calc without pressing Calculate)" });
    }
  }

  const memoRe = /use(?:Memo|Callback)\s*\(/g;
  while ((m = memoRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatching(src, openParen, "(", ")");
    if (closeParen === -1) continue;
    const inner = src.slice(openParen + 1, closeParen);
    const args = splitTopLevelArgs(inner);
    const body = args[0] || "";
    if (!/[Cc]alculate\s*\(/.test(body)) continue;
    const depsRaw = args.length >= 2 ? args[1].trim() : null;
    if (depsRaw === null) continue;
    const innerDeps = depsRaw.startsWith("[") ? depsRaw.slice(1, depsRaw.lastIndexOf("]")).trim() : "";
    if (innerDeps.length > 0) {
      hits.push({ kind: m[0].trim().replace(/\($/, ""), line: lineOf(src, m.index), code: oneLine(src.slice(m.index, closeParen + 1)), reason: "recomputes with non-empty deps [" + oneLine(innerDeps, 140) + "] without a Calculate press" });
    }
  }

  // 4) render-body calculations (Bug A-adjacent): calc-ish calls NOT inside a handler, hook,
  //    handle*/reset function, or calculate definition — these recompute on every render
  const ranges = [];
  const addRange = (a, b) => { if (b > a) ranges.push([a, b]); };
  const hRe = /on[A-Z]\w*\s*=\s*\{/g;
  while ((m = hRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const close = findMatching(src, m.index + m[0].length - 1, "{", "}");
    if (close !== -1) addRange(m.index, close);
  }
  const hkRe = /use(?:State|Ref|Reducer|Effect|Memo|Callback|LayoutEffect)(?:<[^>]*>)?\s*\(/g;
  while ((m = hkRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const close = findMatching(src, m.index + m[0].length - 1, "(", ")");
    if (close !== -1) addRange(m.index, close);
  }
  const fnRe = /(?:const\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)(?:\s*:\s*[A-Za-z_$][\w$.<>\[\], ]*)?\s*=>|function\s+[A-Za-z_$][\w$]*\s*\(|(?:const|export\s+const)\s+calculate[A-Za-z0-9_]*\s*=|function\s+calculate[A-Za-z0-9_]*\s*\()/g;
  while ((m = fnRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const brace = src.indexOf("{", m.index);
    if (brace === -1) continue;
    const close = findMatching(src, brace, "{", "}");
    if (close !== -1) addRange(m.index, close);
  }
  const cRe = CALC_CALL_RE;
  while ((m = cRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    if (ranges.some(([a, b]) => m.index >= a && m.index <= b)) continue;
    hits.push({ kind: "render-body-calc", line: lineOf(src, m.index), code: oneLine(src.slice(m.index, Math.min(m.index + 90, src.length))), reason: "calc-style call outside any handler/hook — executes on every render without a Calculate press" });
  }

  return hits;
}

function findFunctionDef(src, name) {
  const re = new RegExp("(?:const\\s+" + name + "\\s*=\\s*(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>|function\\s+" + name + "\\s*\\()", "g");
  const m = re.exec(src);
  if (!m) return null;
  let brace = src.indexOf("{", m.index);
  if (brace === -1) return null;
  const close = findMatching(src, brace, "{", "}");
  if (close === -1) return null;
  return { idx: m.index, body: src.slice(m.index, close + 1) };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1.5 — TS-based extraction
// ─────────────────────────────────────────────────────────────────────────────

const GLOBALS = new Set([
  "Math", "JSON", "Number", "String", "Boolean", "Object", "Array", "Date", "RegExp",
  "Error", "TypeError", "RangeError", "SyntaxError", "ReferenceError", "EvalError",
  "URIError", "AggregateError", "parseInt", "parseFloat", "isNaN", "isFinite",
  "encodeURI", "encodeURIComponent", "decodeURI", "decodeURIComponent", "escape",
  "unescape", "console", "Infinity", "NaN", "undefined", "BigInt", "Intl", "Set",
  "Map", "WeakMap", "WeakSet", "Promise", "Symbol", "Reflect", "Proxy", "globalThis",
  "Buffer", "TextEncoder", "TextDecoder", "structuredClone", "URL", "URLSearchParams",
  "atob", "btoa", "AbortController", "AbortSignal", "Event", "CustomEvent",
  "EventTarget", "Blob", "File", "FormData", "Headers", "Request", "Response",
  "fetch", "queueMicrotask", "setTimeout", "clearTimeout", "setInterval",
  "clearInterval", "setImmediate", "clearImmediate", "crypto", "performance",
  "Iterator", "Generator", "AsyncFunction", "Number", "parseFloat", "isFinite",
  "Uint8Array", "Uint8ClampedArray", "Int8Array", "Uint16Array", "Int16Array",
  "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "BigInt64Array",
  "BigUint64Array", "DataView", "ArrayBuffer", "SharedArrayBuffer", "Uint8Array",
]);

const BROWSER_ONLY = new Set([
  "window", "document", "navigator", "localStorage", "sessionStorage", "history",
  "location", "screen", "HTMLElement", "HTMLInputElement", "HTMLDivElement",
  "Node", "Element", "MouseEvent", "KeyboardEvent", "requestAnimationFrame",
  "cancelAnimationFrame", "matchMedia", "getComputedStyle", "innerWidth", "innerHeight",
]);

const INTERNAL_STATE = /^(result|results|output|outputs|mounted|loading|error|errors|activeTab|tab|view|open|expanded|isOpen|copied|printing|isPrinting|showAdvanced|showAdvancedFields|showBreakdown|showChart|showTable|showSummary|showDetails|showAll|isMobile|mobile)$/i;

const CALC_NAME_RE = /^(?:calculate|calc|compute|estimate|get)[A-Za-z0-9_]*$/i;
// call-site regex — `calc` must not match `Calculator(`
const CALC_CALL_RE = /\b(?:calculate|calc(?!ulator|ify|ified|ifies|ification)|compute|estimate)[A-Za-z0-9_]*\s*\(/gi;

const parseCache = new Map();
function parseFile(filePath) {
  if (parseCache.has(filePath)) return parseCache.get(filePath);
  const src = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const info = { src, sf, file: filePath };
  parseCache.set(filePath, info);
  return info;
}

function resolvePath(baseFile, spec) {
  let p = spec;
  if (p.startsWith("@/")) p = p.slice(2);
  let full = path.resolve(path.dirname(baseFile), p);
  if (!path.extname(full)) {
    for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]) {
      if (fs.existsSync(full + ext)) return full + ext;
    }
    if (fs.existsSync(path.join(full, "index.ts"))) return path.join(full, "index.ts");
    if (fs.existsSync(path.join(full, "index.tsx"))) return path.join(full, "index.tsx");
    return null;
  }
  return fs.existsSync(full) ? full : null;
}

function forEachBindingName(pattern, cb) {
  if (ts.isIdentifier(pattern)) { cb(pattern.text); return; }
  if (ts.isObjectBindingPattern(pattern) || ts.isArrayBindingPattern(pattern)) {
    for (const el of pattern.elements) {
      if (el && !el.dotDotDotToken && el.name) forEachBindingName(el.name, cb);
    }
  }
}

function collectDecls(node, out) {
  for (const st of node.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) out.set(st.name.text, st);
    else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) out.set(d.name.text, d);
        else forEachBindingName(d.name, (n) => out.set(n, d));
      }
    } else if (ts.isEnumDeclaration(st) && st.name) out.set(st.name.text, st);
    else if (ts.isClassDeclaration(st) && st.name) out.set(st.name.text, st);
  }
}

function collectImports(sf) {
  const map = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st)) continue;
    const spec = st.moduleSpecifier.text;
    const clause = st.importClause;
    if (!clause) continue;
    if (clause.name) map.set(clause.name.text, { spec, imported: "default", isDefault: true });
    const nb = clause.namedBindings;
    if (!nb) continue;
    if (ts.isNamespaceImport(nb)) map.set(nb.name.text, { spec, imported: "*" });
    else if (ts.isNamedImports(nb)) {
      for (const el of nb.elements) {
        map.set(el.name.text, { spec, imported: el.propertyName ? el.propertyName.text : el.name.text });
      }
    }
  }
  return map;
}

function collectRefs(node, out) {
  if (!node) return;
  switch (node.kind) {
    case ts.SyntaxKind.Identifier: out.add(node.text); return;
    case ts.SyntaxKind.PropertyAccessExpression: collectRefs(node.expression, out); return;
    case ts.SyntaxKind.ElementAccessExpression: collectRefs(node.expression, out); collectRefs(node.argumentExpression, out); return;
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.NewExpression:
      collectRefs(node.expression, out);
      if (node.arguments) node.arguments.forEach((a) => collectRefs(a, out));
      return;
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.FunctionExpression:
      node.parameters.forEach((p) => { if (p.initializer) collectRefs(p.initializer, out); });
      collectRefs(node.body, out);
      return;
    case ts.SyntaxKind.FunctionDeclaration:
      node.parameters.forEach((p) => { if (p.initializer) collectRefs(p.initializer, out); });
      collectRefs(node.body, out);
      return;
    case ts.SyntaxKind.Block: node.statements.forEach((s) => collectRefs(s, out)); return;
    case ts.SyntaxKind.VariableStatement: node.declarationList.declarations.forEach((d) => collectRefs(d, out)); return;
    case ts.SyntaxKind.VariableDeclaration: if (node.initializer) collectRefs(node.initializer, out); return;
    case ts.SyntaxKind.BinaryExpression: collectRefs(node.left, out); collectRefs(node.right, out); return;
    case ts.SyntaxKind.ConditionalExpression: collectRefs(node.condition, out); collectRefs(node.whenTrue, out); collectRefs(node.whenFalse, out); return;
    case ts.SyntaxKind.PrefixUnaryExpression:
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.TypeOfExpression:
    case ts.SyntaxKind.VoidExpression:
    case ts.SyntaxKind.DeleteExpression:
      collectRefs(node.operand, out);
      return;
    case ts.SyntaxKind.ParenthesizedExpression:
    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
    case ts.SyntaxKind.NonNullExpression:
    case ts.SyntaxKind.SatisfiesExpression:
    case ts.SyntaxKind.AwaitExpression:
    case ts.SyntaxKind.YieldExpression:
      collectRefs(node.expression, out);
      return;
    case ts.SyntaxKind.ObjectLiteralExpression:
      node.properties.forEach((p) => {
        if (ts.isPropertyAssignment(p)) collectRefs(p.initializer, out);
        else if (ts.isShorthandPropertyAssignment(p)) out.add(p.name.text);
        else if (ts.isSpreadAssignment(p)) collectRefs(p.expression, out);
        else if (ts.isMethodDeclaration(p) || ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)) {
          p.parameters.forEach((pr) => { if (pr.initializer) collectRefs(pr.initializer, out); });
          collectRefs(p.body, out);
        }
      });
      return;
    case ts.SyntaxKind.ArrayLiteralExpression: node.elements.forEach((e) => collectRefs(e, out)); return;
    case ts.SyntaxKind.TemplateExpression: node.templateSpans.forEach((s) => collectRefs(s.expression, out)); return;
    case ts.SyntaxKind.ReturnStatement: collectRefs(node.expression, out); return;
    case ts.SyntaxKind.ExpressionStatement: collectRefs(node.expression, out); return;
    case ts.SyntaxKind.IfStatement: collectRefs(node.expression, out); collectRefs(node.thenStatement, out); collectRefs(node.elseStatement, out); return;
    case ts.SyntaxKind.ForStatement: collectRefs(node.initializer, out); collectRefs(node.condition, out); collectRefs(node.incrementor, out); collectRefs(node.statement, out); return;
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement:
      collectRefs(node.expression, out);
      collectRefs(node.statement, out);
      return;
    case ts.SyntaxKind.WhileStatement:
    case ts.SyntaxKind.DoStatement:
      collectRefs(node.expression, out);
      collectRefs(node.statement, out);
      return;
    case ts.SyntaxKind.SwitchStatement:
      collectRefs(node.expression, out);
      node.caseBlock.clauses.forEach((c) => { collectRefs(c.expression, out); c.statements.forEach((s) => collectRefs(s, out)); });
      return;
    case ts.SyntaxKind.TryStatement:
      collectRefs(node.tryBlock, out);
      if (node.catchClause) collectRefs(node.catchClause.block, out);
      collectRefs(node.finallyBlock, out);
      return;
    case ts.SyntaxKind.ThrowStatement: collectRefs(node.expression, out); return;
    case ts.SyntaxKind.TaggedTemplateExpression: collectRefs(node.tag, out); collectRefs(node.template, out); return;
    case ts.SyntaxKind.SpreadElement: collectRefs(node.expression, out); return;
    case ts.SyntaxKind.JsxExpression: if (node.expression) collectRefs(node.expression, out); return;
    case ts.SyntaxKind.CommaListExpression: node.elements.forEach((e) => collectRefs(e, out)); return;
    default: return;
  }
}

function collectBindings(node, out) {
  const visit = (n) => {
    if (!n) return;
    if (ts.isFunctionLike(n)) {
      n.parameters.forEach((p) => {
        if (p.name) forEachBindingName(p.name, (nm) => out.add(nm));
        if (p.initializer) visit(p.initializer);
      });
      if (ts.isFunctionDeclaration(n) && n.name) out.add(n.name.text);
      visit(n.body);
      return;
    }
    if (ts.isVariableDeclaration(n)) {
      forEachBindingName(n.name, (nm) => out.add(nm));
      visit(n.initializer);
      return;
    }
    if (ts.isClassDeclaration(n) && n.name) out.add(n.name.text);
    if (ts.isCatchClause(n) && n.variableDeclaration) forEachBindingName(n.variableDeclaration.name, (nm) => out.add(nm));
    ts.forEachChild(n, visit);
  };
  visit(node);
}

function isCalcDecl(st) {
  if (ts.isFunctionDeclaration(st) && st.name && st.name.text === "calculate") return true;
  if (ts.isVariableStatement(st)) {
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === "calculate") return true;
    }
  }
  return false;
}

function unwrapEntry(node) {
  if (ts.isFunctionDeclaration(node)) return { node, kind: "function" };
  if (ts.isVariableDeclaration(node)) {
    let init = node.initializer;
    if (init && ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === "useCallback" && init.arguments.length >= 1) {
      init = init.arguments[0];
    }
    if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) return { node, kind: "const" };
  }
  return null;
}

function staticEvalObjectLiteral(objNode, ctx, depth) {
  const out = {};
  if (!objNode || !ts.isObjectLiteralExpression(objNode)) return out;
  for (const p of objNode.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    let key = null;
    if (ts.isIdentifier(p.name)) key = p.name.text;
    else if (ts.isStringLiteral(p.name)) key = p.name.text;
    if (!key) continue;
    out[key] = staticEvalValue(p.initializer, ctx, depth);
  }
  return out;
}

function staticEvalValue(node, ctx, depth) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || node.kind === ts.SyntaxKind.RegularExpressionLiteral) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && (node.operator === ts.SyntaxKind.MinusToken || node.operator === ts.SyntaxKind.PlusToken)) {
    const v = staticEvalValue(node.operand, ctx, depth);
    if (typeof v === "string" && !isNaN(parseFloat(v))) return node.operator === ts.SyntaxKind.MinusToken ? -parseFloat(v) : parseFloat(v);
  }
  if (ts.isIdentifier(node) && depth > 0) {
    const decl = ctx.topMap.get(node.text);
    if (decl && ts.isVariableDeclaration(decl) && decl.initializer) return staticEvalValue(decl.initializer, ctx, depth - 1);
  }
  return null;
}

const topDeclCache = new WeakMap();
function collectAllTopDecls(sf) {
  if (topDeclCache.has(sf)) return topDeclCache.get(sf);
  const map = new Map();
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) map.set(st.name.text, st);
    else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) map.set(d.name.text, d);
        else forEachBindingName(d.name, (n) => map.set(n, d));
      }
    } else if (ts.isEnumDeclaration(st) && st.name) map.set(st.name.text, st);
    else if (ts.isClassDeclaration(st) && st.name) map.set(st.name.text, st);
  }
  topDeclCache.set(sf, map);
  return map;
}

function findDefaultExportBodies(sf) {
  const bodies = [];
  const seen = new Set();
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.body) {
      const isDefault = st.modifiers && st.modifiers.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword);
      if (isDefault) bodies.push(st.body);
    }
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const init = d.initializer;
        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.body && ts.isBlock(init.body)) bodies.push(init.body);
      }
    }
    if (ts.isExportAssignment(st) && st.expression && ts.isIdentifier(st.expression)) {
      const decl = collectAllTopDecls(sf).get(st.expression.text);
      if (decl) {
        const init = ts.isVariableDeclaration(decl) ? decl.initializer : null;
        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.body && ts.isBlock(init.body)) bodies.push(init.body);
      }
    }
  }
  return bodies.filter((b) => {
    if (seen.has(b)) return false;
    seen.add(b);
    return true;
  });
}

/** candidates inside the component: nested `calculate`, then handle* calc functions, then top-level `calculate`, then calc-ish named functions */
function findLocalCandidates(info) {
  const { sf, src } = info;
  const candidates = [];
  const calcCallRe = /setResult\w*\s*\(|\b(?:calculate|calc(?!ulator)|compute|estimate)[A-Za-z0-9_]*\s*\(/i;
  for (const body of findDefaultExportBodies(sf)) {
    const bodyMap = new Map();
    collectDecls(body, bodyMap);
    for (const st of body.statements) {
      if (!isCalcDecl(st)) continue;
      let declNode = st;
      if (ts.isVariableStatement(st)) declNode = st.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === "calculate");
      const entry = unwrapEntry(declNode);
      if (entry) candidates.push({ file: info.file, node: declNode, entry, scope: "component", bodyMap });
    }
    // handle* functions that produce results (e.g. handleCalculate = () => setResults(calcPmi(...)))
    for (const st of body.statements) {
      let declNode = null;
      let name = null;
      let fnBodyText = null;
      if (ts.isFunctionDeclaration(st) && st.name && /^handle[A-Z]/.test(st.name.text)) {
        name = st.name.text;
        declNode = st;
        fnBodyText = st.body ? st.body.getText() : "";
      } else if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && /^handle[A-Z]/.test(d.name.text) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) {
            name = d.name.text;
            declNode = d;
            fnBodyText = d.initializer.body ? d.initializer.body.getText() : "";
            break;
          }
        }
      }
      if (!name || !declNode) continue;
      if (!calcCallRe.test(fnBodyText)) continue;
      const entry = unwrapEntry(declNode);
      if (entry) candidates.push({ file: info.file, node: declNode, entry, scope: "component-handle", bodyMap, name });
    }
  }
  const topMap = collectAllTopDecls(sf);
  for (const st of sf.statements) {
    if (!isCalcDecl(st)) continue;
    let declNode = st;
    if (ts.isVariableStatement(st)) declNode = st.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === "calculate");
    const entry = unwrapEntry(declNode);
    if (entry) candidates.push({ file: info.file, node: declNode, entry, scope: "top", bodyMap: null });
  }
  const referenced = new Set();
  const callRe = /([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = callRe.exec(src)) !== null) if (isInCode(src, m.index)) referenced.add(m[1]);
  for (const [name, declNode] of topMap) {
    if (!CALC_NAME_RE.test(name) || name === "calculate") continue;
    if (!referenced.has(name)) continue;
    const entry = unwrapEntry(declNode);
    if (entry) candidates.push({ file: info.file, node: declNode, entry, scope: "top-named", bodyMap: null, name });
  }
  return candidates;
}

/** inline candidates: calc-linked useEffect callbacks and Calculate-button onClick handlers */
function findInlineCandidates(info) {
  const { src } = info;
  const out = [];
  const bodies = findDefaultExportBodies(info.sf);
  const bodyMap = bodies.length > 0 ? (() => { const m = new Map(); collectDecls(bodies[0], m); return m; })() : null;
  const calcCallRe = /\b(?:calculate|calc(?!ulator)|compute|estimate)[A-Za-z0-9_]*\s*\(/i;
  const setResultRe = /setResult\w*\s*\(/i;

  const parseArrow = (text, scope) => {
    const tmp = ts.createSourceFile("__inline__.tsx", "const __h = " + text + ";", ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const st of tmp.statements) {
      if (!ts.isVariableStatement(st)) continue;
      const init = st.declarationList.declarations[0] && st.declarationList.declarations[0].initializer;
      if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
        out.push({ file: info.file, node: init, entry: { node: init, kind: "const" }, scope, bodyMap, name: "__entry__" });
        return;
      }
    }
  };

  const effRe = /use(?:Layout)?Effect\s*\(/g;
  let m;
  while ((m = effRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openP = m.index + m[0].length - 1;
    const closeP = findMatching(src, openP, "(", ")");
    if (closeP === -1) continue;
    const args = splitTopLevelArgs(src.slice(openP + 1, closeP));
    const cb = (args[0] || "").trim();
    if (!calcCallRe.test(cb)) continue;
    parseArrow(cb, "effect-callback");
  }

  // useMemo callbacks that call a calc function (press-gated memo pattern)
  const mmRe = /useMemo\s*\(/g;
  while ((m = mmRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openP = m.index + m[0].length - 1;
    const closeP = findMatching(src, openP, "(", ")");
    if (closeP === -1) continue;
    const args = splitTopLevelArgs(src.slice(openP + 1, closeP));
    const cb = (args[0] || "").trim();
    if (!calcCallRe.test(cb)) continue;
    parseArrow(cb, "useMemo-callback");
  }

  // useState lazy initializers that call a calc function (mount default result)
  const stRe = /useState(?:<[^>]*>)?\s*\(/g;
  while ((m = stRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openP = m.index + m[0].length - 1;
    const closeP = findMatching(src, openP, "(", ")");
    if (closeP === -1) continue;
    const args = splitTopLevelArgs(src.slice(openP + 1, closeP));
    const init = (args[0] || "").trim();
    if (!/^\(?\s*[\(\w]/.test(init)) continue;
    if (!calcCallRe.test(init)) continue;
    parseArrow(init, "useState-init");
  }

  const clickRe = /onClick\s*=\s*\{/g;
  while ((m = clickRe.exec(src)) !== null) {
    if (!isInCode(src, m.index)) continue;
    const openB = m.index + m[0].length - 1;
    const closeB = findMatching(src, openB, "{", "}");
    if (closeB === -1) continue;
    const body = src.slice(openB + 1, closeB).trim();
    if (!calcCallRe.test(body) || !setResultRe.test(body)) continue;
    parseArrow(body, "onClick-handler");
  }

  return out;
}

/** candidates from imported local logic files (ZeroSixtyLogic style) */
function findLogicCandidates(info) {
  const { sf } = info;
  const out = [];
  const imports = collectImports(sf);
  const seenFiles = new Set();
  for (const [localName, imp] of imports) {
    if (!imp.spec.startsWith(".") && !imp.spec.startsWith("@/")) continue;
    const full = resolvePath(info.file, imp.spec);
    if (!full) continue;
    if (seenFiles.has(full)) continue;
    if (!/logic/i.test(path.basename(full))) continue;
    seenFiles.add(full);
    const target = parseFile(full);
    const topMap = collectAllTopDecls(target.sf);
    for (const [name, declNode] of topMap) {
      if (!CALC_NAME_RE.test(name)) continue;
      const entry = unwrapEntry(declNode);
      if (entry) out.push({ file: full, node: declNode, entry, scope: "logic:" + path.basename(full), bodyMap: null, name });
    }
  }
  return out;
}

function buildFactory(filePath, candidate) {
  const info = parseFile(filePath);
  const { sf, src } = info;
  const topMap = collectAllTopDecls(sf);
  const imports = collectImports(sf);
  const bodyMap = candidate.bodyMap;
  const entryName = candidate.name || "calculate";

  const pieces = [];
  const emitted = new Set();
  const requirePieces = [];
  const stubPieces = [];
  const browserPieces = [];
  const setterPieces = new Set();
  const unresolved = [];
  const duplicateNames = [];

  function declText(node) {
    // VariableDeclaration text excludes the `const`/`let`/`var` keyword — take the list text
    let text;
    if (ts.isVariableDeclaration(node) && node.parent && ts.isVariableDeclarationList(node.parent)) {
      text = node.parent.getText();
    } else {
      text = node.getText();
    }
    return text.replace(/^export\s+/, "").trim();
  }

  function transformStateDecl(text) {
    let out = text;
    const stRe = /\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=\s*useState(?:<[^>]*>)?\(/;
    if (stRe.test(out)) {
      out = out.replace(stRe, (mm, a, b) => `[${a}, ${b}] = __state("${a}", `);
    }
    out = out.replace(/=\s*useRef(?:<[^>]*>)?\(/g, "= { current: null } /*useRef*/");
    return out;
  }

  function topLevelRefs(node) {
    // identifier references evaluated at module top level (object-literal keys excluded,
    // nested function bodies treated as non-top-level)
    const refs = new Set();
    const visit = (n, top) => {
      if (!n) return;
      switch (n.kind) {
        case ts.SyntaxKind.Identifier:
          if (top) refs.add(n.text);
          return;
        case ts.SyntaxKind.PropertyAccessExpression:
          visit(n.expression, top);
          return;
        case ts.SyntaxKind.ElementAccessExpression:
          visit(n.expression, top);
          visit(n.argumentExpression, top);
          return;
        case ts.SyntaxKind.CallExpression:
        case ts.SyntaxKind.NewExpression:
          visit(n.expression, top);
          if (n.arguments) n.arguments.forEach((a) => visit(a, top));
          return;
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.FunctionDeclaration:
          n.parameters.forEach((p) => { if (p.initializer) visit(p.initializer, false); });
          visit(n.body, false);
          return;
        case ts.SyntaxKind.Block:
          n.statements.forEach((s) => visit(s, top));
          return;
        case ts.SyntaxKind.VariableStatement:
          n.declarationList.declarations.forEach((d) => visit(d, top));
          return;
        case ts.SyntaxKind.VariableDeclaration:
          visit(n.initializer, top);
          return;
        case ts.SyntaxKind.BinaryExpression:
          visit(n.left, top);
          visit(n.right, top);
          return;
        case ts.SyntaxKind.ConditionalExpression:
          visit(n.condition, top);
          visit(n.whenTrue, top);
          visit(n.whenFalse, top);
          return;
        case ts.SyntaxKind.ParenthesizedExpression:
        case ts.SyntaxKind.AsExpression:
        case ts.SyntaxKind.TypeAssertionExpression:
        case ts.SyntaxKind.NonNullExpression:
        case ts.SyntaxKind.AwaitExpression:
        case ts.SyntaxKind.TypeOfExpression:
        case ts.SyntaxKind.VoidExpression:
        case ts.SyntaxKind.DeleteExpression:
          visit(n.expression, top);
          return;
        case ts.SyntaxKind.ObjectLiteralExpression:
          n.properties.forEach((p) => {
            if (ts.isPropertyAssignment(p)) visit(p.initializer, top);
            else if (ts.isShorthandPropertyAssignment(p)) refs.add(p.name.text);
            else if (ts.isSpreadAssignment(p)) visit(p.expression, top);
            else if (ts.isMethodDeclaration(p)) visit(p.body, false);
          });
          return;
        case ts.SyntaxKind.ArrayLiteralExpression:
          n.elements.forEach((e) => visit(e, top));
          return;
        case ts.SyntaxKind.TemplateExpression:
          n.templateSpans.forEach((s) => visit(s.expression, top));
          return;
        case ts.SyntaxKind.ReturnStatement:
        case ts.SyntaxKind.ExpressionStatement:
        case ts.SyntaxKind.ThrowStatement:
        case ts.SyntaxKind.SpreadElement:
        case ts.SyntaxKind.TaggedTemplateExpression:
        case ts.SyntaxKind.JsxExpression:
          visit(n.expression, top);
          return;
        case ts.SyntaxKind.IfStatement:
          visit(n.expression, top);
          visit(n.thenStatement, top);
          visit(n.elseStatement, top);
          return;
        case ts.SyntaxKind.ForStatement:
          visit(n.initializer, top);
          visit(n.condition, top);
          visit(n.incrementor, top);
          visit(n.statement, top);
          return;
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          visit(n.expression, top);
          visit(n.statement, top);
          return;
        default:
          return;
      }
    };
    visit(node, true);
    return refs;
  }

  function resolveImport(file, imp, direct, fromName) {
    const { spec, imported } = imp;
    if (spec === "react" || spec === "react-dom" || spec === "next/navigation" || spec === "next/router") {
      requirePieces.push({ localName: fromName, spec, imported, isDefault: imp.isDefault, isNamespace: imported === "*" });
      return true;
    }
    if (!spec.startsWith(".") && !spec.startsWith("@/")) {
      if (!direct && /^[A-Z]/.test(fromName)) stubPieces.push({ localName: fromName });
      else requirePieces.push({ localName: fromName, spec, imported, isDefault: imp.isDefault, isNamespace: imported === "*" });
      return true;
    }
    const full = resolvePath(file, spec);
    if (!full) {
      if (!direct && /^[A-Z]/.test(fromName)) { stubPieces.push({ localName: fromName }); return true; }
      unresolved.push(fromName + " (unresolvable import " + spec + ")");
      return false;
    }
    const target = parseFile(full);
    const targetTop = collectAllTopDecls(target.sf);
    let targetNode = null;
    if (imported === "default") {
      for (const st of target.sf.statements) {
        if (ts.isExportAssignment(st) && st.expression && ts.isIdentifier(st.expression)) { targetNode = targetTop.get(st.expression.text); break; }
        if (ts.isFunctionDeclaration(st) && st.modifiers && st.modifiers.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword)) { targetNode = st; break; }
        if (ts.isVariableStatement(st) && st.modifiers && st.modifiers.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword)) { targetNode = st.declarationList.declarations[0]; break; }
      }
    } else if (imported === "*") {
      requirePieces.push({ localName: fromName, spec, imported: "*", isNamespace: true });
      return true;
    } else {
      targetNode = targetTop.get(imported);
    }
    if (!targetNode) {
      if (!direct && /^[A-Z]/.test(fromName)) { stubPieces.push({ localName: fromName }); return true; }
      unresolved.push(fromName + " (no export " + imported + " in " + full + ")");
      return false;
    }
    collectPiece(full, fromName, targetNode, direct);
    return true;
  }

  const candidateFile = filePath;

  function collectPiece(file, name, node, direct) {
    const key = file + "#" + name;
    if (emitted.has(key)) {
      if (pieces.some((p) => p.name === name && p.filePath !== file)) duplicateNames.push(name);
      return;
    }
    emitted.add(key);
    const piece = { name, node, filePath: file, direct };
    pieces.push(piece);

    const bindings = new Set();
    collectBindings(node, bindings);
    const refs = new Set();
    collectRefs(node, refs);

    for (const r of refs) {
      if (bindings.has(r)) continue;
      if (r === name && file === filePath) continue; // self-reference
      if (GLOBALS.has(r)) continue;
      if (r === "__state" || r === "__inputs" || r === "__record" || r === "__cap" || r === "require") continue;
      if (r === "setResult" || /^set[A-Z]/.test(r)) {
        if (!bindings.has(r)) setterPieces.add(r);
        continue;
      }
      if (BROWSER_ONLY.has(r)) { browserPieces.push({ localName: r }); continue; }

      const fileInfo = parseFile(file);
      const fileTop = collectAllTopDecls(fileInfo.sf);
      const fileImports = collectImports(fileInfo.sf);

      let resolved = null;
      if (direct) {
        resolved = fileTop.get(r);
        if (!resolved && bodyMap && file === candidateFile) resolved = bodyMap.get(r);
      } else {
        resolved = fileTop.get(r);
        if (!resolved && bodyMap && file === candidateFile) resolved = bodyMap.get(r);
      }
      if (resolved) { collectPiece(file, r, resolved, false); continue; }
      const imp = fileImports.get(r);
      if (imp) { resolveImport(file, imp, direct, r); continue; }
      if (!direct && /^[A-Z]/.test(r)) { stubPieces.push({ localName: r }); continue; }
      unresolved.push(r);
    }
  }

  // entry first, then force-include DEFAULTS-like consts from the entry file
  collectPiece(filePath, entryName, candidate.node, true);
  const DEFAULTS_LIKE = /^(DEFAULTS|DEFAULT_INPUTS|DEFAULT_VALUES|INITIAL_INPUTS|defaultInputs|initialInputs|defaultValues)$/;
  for (const [name, declNode] of topMap) {
    if (DEFAULTS_LIKE.test(name) && !emitted.has(filePath + "#" + name)) {
      collectPiece(filePath, name, declNode, false);
    }
  }

  // drop setter stubs that are bound by pieces (destructured setters capture via __state);
  // setResult-like names get a capture stub in the preamble instead of a no-op
  const allBound = new Set();
  for (const p of pieces) collectBindings(p.node, allBound);
  const captureStubs = new Set();
  for (const s of [...setterPieces]) {
    if (allBound.has(s)) setterPieces.delete(s);
    else if (/^setResult/i.test(s)) { setterPieces.delete(s); captureStubs.add(s); }
  }

  let staticDefaults = {};
  for (const [name, declNode] of topMap) {
    if (!DEFAULTS_LIKE.test(name)) continue;
    const dInit = ts.isVariableDeclaration(declNode) ? declNode.initializer : null;
    staticDefaults = staticEvalObjectLiteral(dInit, { topMap }, 3);
    break;
  }

  // topo-sort by top-level initializer deps (name-based lookup — works across files)
  const pieceIndex = new Map();
  pieces.forEach((p, i) => { if (!pieceIndex.has(p.name)) pieceIndex.set(p.name, i); });
  const edges = new Map();
  pieces.forEach((p, i) => {
    const deps = [];
    for (const r of topLevelRefs(p.node)) {
      if (GLOBALS.has(r) || /^set[A-Z]/.test(r) || BROWSER_ONLY.has(r)) continue;
      const j = pieceIndex.get(r);
      if (j !== undefined && j !== i) deps.push(j);
    }
    edges.set(i, deps);
  });
  const order = [];
  const visited = new Set();
  const visiting = new Set();
  function topo(i) {
    if (visited.has(i)) return;
    if (visiting.has(i)) return;
    visiting.add(i);
    for (const j of edges.get(i) || []) topo(j);
    visiting.delete(i);
    visited.add(i);
    order.push(i);
  }
  pieces.forEach((_, i) => topo(i));
  const sortedPieces = order.map((i) => pieces[i]);

  // invocation args strategy
  let fn = null;
  if (ts.isFunctionDeclaration(candidate.node)) fn = candidate.node;
  else if (ts.isVariableDeclaration(candidate.node)) {
    let init = candidate.node.initializer;
    if (init && ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === "useCallback") init = init.arguments[0];
    if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) fn = init;
  }
  let argText = "";
  let argTextReplicated = null;
  if (fn && fn.parameters.length > 0) {
    const p0 = fn.parameters[0];
    const p0name = p0.name && ts.isIdentifier(p0.name) ? p0.name.text : null;
    const fnText = fn.getText();
    const objectStyleNames = new Set(["inputs", "input", "values", "data", "form", "params", "config", "settings", "state", "calc", "args", "options"]);
    let objectStyle = false;
    if (p0name) {
      if (objectStyleNames.has(p0name)) objectStyle = true;
      else {
        const accessRe = new RegExp("\\b" + p0name + "\\s*(\\.|\\[|\\s*=\\s*\\{)", "g");
        if (accessRe.test(fnText)) objectStyle = true;
      }
    }
    if (objectStyle) {
      argText = fn.parameters.map((p, i) => (i === 0 ? "__inputs" : "undefined")).join(", ");
    } else {
      const callRe2 = new RegExp("\\b" + entryName + "\\s*\\(", "g");
      let m2;
      while ((m2 = callRe2.exec(src)) !== null) {
        if (!isInCode(src, m2.index)) continue;
        const openP = m2.index + m2[0].length - 1;
        const closeP = findMatching(src, openP, "(", ")");
        if (closeP === -1) continue;
        const argSrc = src.slice(openP + 1, closeP).trim();
        if (argSrc.length === 0) continue;
        const argIds = argSrc.split(",").map((a) => a.trim());
        if (argIds.every((a) => /^[A-Za-z_$][\w$]*$/.test(a))) { argTextReplicated = argSrc; break; }
      }
      argText = fn.parameters
        .map((p) => {
          const nm = p.name && ts.isIdentifier(p.name) ? p.name.text : null;
          if (p.initializer) return "undefined";
          return nm ? "__inputs[" + JSON.stringify(nm) + "]" : "undefined";
        })
        .join(", ");
    }
  }

  // assemble factory source
  const out = [];
  out.push("(function (__inputs) {");
  out.push('"use strict";');
  out.push("var __cap = null;");
  out.push("var __record = __inputs === null ? {} : null;");
  out.push("function __state(name, init) {");
  out.push("  var v = typeof init === 'function' ? init() : init;");
  out.push("  if (__inputs && v === null) { v = __inputs; }");
  out.push("  else if (__inputs && typeof v === 'object' && !Array.isArray(v)) { v = Object.assign({}, v, __inputs); }");
  out.push("  else if (__inputs && __inputs[name] !== undefined) { v = __inputs[name]; }");
  out.push("  if (__record) { __record[name] = v; }");
  out.push("  return [v, function (val) { __cap = val; }];");
  out.push("}");
  for (const s of captureStubs) out.push("function " + s + "(v) { __cap = v; }");
  for (const s of setterPieces) out.push("function " + s + "() {}");
  for (const b of browserPieces) out.push("var " + b.localName + " = void 0;");
  for (const s of stubPieces) out.push("var " + s.localName + " = function () { return null; };");
  for (const r of requirePieces) {
    if (r.isNamespace || r.imported === "*") {
      out.push("var " + r.localName + " = require(" + JSON.stringify(r.spec) + ");");
    } else if (r.isDefault) {
      out.push("var " + r.localName + " = (function(m){ return m && m.default !== undefined ? m.default : m; })(require(" + JSON.stringify(r.spec) + "));");
    } else {
      out.push("var " + r.localName + " = require(" + JSON.stringify(r.spec) + ")[" + JSON.stringify(r.imported) + "];");
    }
  }
  for (const p of sortedPieces) {
    if (p.name === entryName && p.filePath === filePath) continue;
    out.push(transformStateDecl(declText(p.node)) + ";");
  }
  const isDeclStyle = ts.isVariableDeclaration(candidate.node) || ts.isFunctionDeclaration(candidate.node);
  const entryEmit = isDeclStyle
    ? transformStateDecl(declText(candidate.node)).replace(/;?\s*$/, "") + ";"
    : "var " + entryName + " = " + transformStateDecl(candidate.node.getText()).replace(/;?\s*$/, "") + ";";
  out.push(entryEmit);
  out.push("return {");
  out.push("  record: __record,");
  out.push("  run: function () {");
  out.push("    __cap = null;");
  out.push("    var ret = " + entryName + "(__ARG__);");
  out.push("    return { cap: __cap, ret: ret };");
  out.push("  }");
  out.push("};");  out.push("})");

  const transpiled = ts.transpileModule(out.join("\n"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.Preserve,
      isolatedModules: true,
    },
  }).outputText;

  return {
    factorySrc: transpiled,
    staticDefaults,
    unresolved,
    duplicateNames,
    entryText: declText(candidate.node),
    argText,
    argTextReplicated,
    pieces: pieces.map((p) => p.name),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// perturbation + normalization
// ─────────────────────────────────────────────────────────────────────────────

function perturbCandidates(key, value, src) {
  const out = [];
  if (typeof value === "number") {
    if (value === 0) out.push(1);
    else {
      const v1 = Math.round(value * 1.7 * 10000) / 10000;
      const v2 = Math.round(value * 2.5 * 10000) / 10000;
      out.push(v1);
      if (v2 !== v1) out.push(v2);
      if (Number.isInteger(value) && value >= 1 && value <= 10) {
        out.push(value - 1);
        if (value < 10) out.push(value + 1);
      }
    }
  } else if (typeof value === "boolean") {
    out.push(!value);
  } else if (typeof value === "string") {
    const s = value.trim();
    if (/^-?[\d]+([.,]\d+)?$/.test(s)) {
      const n = parseFloat(s.replace(",", "."));
      if (n === 0) out.push("1");
      else {
        const v1 = Math.round(n * 1.7 * 10000) / 10000;
        const v2 = Math.round(n * 2.5 * 10000) / 10000;
        out.push(String(v1));
        if (v2 !== v1) out.push(String(v2));
        // small-integer candidates (clamped ranges like Apgar 0-2)
        if (Number.isInteger(n) && n >= 1 && n <= 10) {
          out.push(String(n - 1));
          if (n < 10) out.push(String(n + 1));
        }
      }
    } else if (/^-?[\d.]+(\s*,\s*-?[\d.]+)+$/.test(s)) {
      // comma-separated list (ANOVA groups) — alter the first number
      const parts = s.split(",");
      const first = parseFloat(parts[0]);
      parts[0] = String(first === 0 ? 1 : Math.round(first * 1.7 * 10000) / 10000);
      out.push(parts.join(","));
    } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      out.push(s.replace(/^(\d{4})/, (mm, y) => String(parseInt(y, 10) + 2)));
    } else if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
      const parts = s.split(":");
      parts[0] = String((parseInt(parts[0], 10) + 1) % 24);
      out.push(parts.join(":"));
    } else {
      // collect valid alternatives first (option arrays / selects / toggle handlers)
      const opts = [];
      const seen = new Set();
      const arrRe = /\[([^\[\]]*)\]/g;
      let m;
      while ((m = arrRe.exec(src)) !== null) {
        const arrText = m[1];
        if (arrText.includes(JSON.stringify(value)) || arrText.includes('"' + value + '"') || arrText.includes("'" + value + "'")) {
          const strRe = /["'`]([^"'`]{1,40})["'`]/g;
          let sm;
          while ((sm = strRe.exec(arrText)) !== null) {
            const cand = sm[1];
            if (cand !== value && !seen.has(cand)) { seen.add(cand); opts.push(cand); }
            if (seen.size >= 3) break;
          }
        }
      }
      const selRe = /<select[^>]*>([\s\S]*?)<\/select>/gi;
      let sm2;
      while ((sm2 = selRe.exec(src)) !== null) {
        if (sm2[1].includes(JSON.stringify(value)) || sm2[1].includes('"' + value + '"') || sm2[1].includes("'" + value + "'")) {
          const ovRe = /<option[^>]*\svalue=["'`]([^"'`]{1,40})["'`]/gi;
          let om2;
          while ((om2 = ovRe.exec(sm2[1])) !== null) {
            const cand = om2[1];
            if (cand !== value && !seen.has(cand)) { seen.add(cand); opts.push(cand); }
            if (seen.size >= 3) break;
          }
          break;
        }
      }
      const hcRe = /(?:handle|set)[A-Za-z0-9_]*\s*\(\s*["'`]([^"'`]{1,30})["'`]\s*\)/g;
      let hm;
      while ((hm = hcRe.exec(src)) !== null) {
        const cand = hm[1];
        if (cand !== value && !seen.has(cand)) { seen.add(cand); opts.push(cand); }
        if (seen.size >= 3) break;
      }
      if (opts.length > 0) {
        out.push(...opts);
      } else {
        // no valid alternatives found — fall back to junk variants
        if (s.length <= 14 && !s.endsWith("x")) out.push(s + "x");
        if (s.length <= 14) out.push(s === s.toLowerCase() ? s.toUpperCase() : s.toLowerCase());
      }
      // common unit-pair alternatives for short unit tokens
      const UNIT_PAIRS = [
        ["in", "cm"], ["cm", "in"], ["ft", "m"], ["m", "ft"], ["km", "mi"], ["mi", "km"],
        ["kg", "lb"], ["lb", "kg"], ["g", "oz"], ["oz", "g"], ["l", "gal"], ["gal", "l"],
        ["ml", "fl oz"], ["fl oz", "ml"], ["mph", "kmh"], ["kmh", "mph"], ["f", "c"], ["c", "f"],
        ["inches", "centimeters"], ["centimeters", "inches"], ["feet", "meters"], ["meters", "feet"],
        ["metric", "imperial"], ["imperial", "metric"], ["us", "metric"], ["metric", "us"],
      ];
      for (const [a, b] of UNIT_PAIRS) {
        if (value === a && !seen.has(b)) { seen.add(b); out.push(b); break; }
      }
    }
  }
  const uniq = [];
  for (const c of out) {
    const kc = typeof c === "string" ? c : String(c);
    const orig = typeof value === "string" ? value : String(value);
    if (kc === orig) continue;
    if (!uniq.some((u) => (typeof u === "string" ? u : String(u)) === kc)) uniq.push(c);
    if (uniq.length >= 4) break;
  }
  return uniq;
}

function normalizeOutput(res) {
  let val = res.cap !== null ? res.cap : res.ret;
  if (val === undefined || val === null) return { text: String(val), raw: val };
  if (typeof val === "number" && !isFinite(val)) return { text: String(val), raw: val };
  let text;
  try {
    text = JSON.stringify(val, (k, v) => (typeof v === "number" && !isFinite(v) ? String(v) : v));
  } catch (e) {
    text = String(val);
  }
  return { text: text === undefined ? String(val) : text, raw: val };
}

// ─────────────────────────────────────────────────────────────────────────────
// per-file analysis
// ─────────────────────────────────────────────────────────────────────────────

function analyzeFile(filePath) {
  const baseName = path.basename(filePath);
  const info = parseFile(filePath);
  const src = info.src;
  const record = {
    file: baseName,
    autocalc: scanAutoCalc(src),
    unverified: null,
    keys: [],
    ghostKeys: [],
    liveKeys: [],
    skippedKeys: [],
    beforeOutput: null,
    spotCheck: null,
    noDefaultOutput: false,
    unresolved: [],
    candidateScope: null,
    entryArgText: null,
    entryPieces: null,
  };

  const candidates = [...findLocalCandidates(info), ...findInlineCandidates(info), ...findLogicCandidates(info)];
  if (candidates.length === 0) {
    record.unverified = "no calculate() found";
    return record;
  }

  const requireLocal = createRequire(path.resolve(filePath));
  const sandboxBase = Object.assign({}, globalThis, { require: requireLocal });

  let lastErr = null;
  let sawNoDefaultOutput = false;
  for (const cand of candidates) {
    try {
      const built = buildFactory(cand.file, cand);
      if (built.unresolved.length > 0) {
        record.unresolved = built.unresolved;
        lastErr = "unresolved identifiers: " + built.unresolved.slice(0, 8).join(", ");
        continue;
      }
      let script = new vm.Script(built.factorySrc, { filename: baseName });

      const probe = script.runInNewContext(sandboxBase, { timeout: 3000 })(null);
      const recordData = probe.record || {};

      const inputs = {};
      for (const [k, v] of Object.entries(built.staticDefaults)) inputs[k] = v;
      const stateVars = [];
      for (const [name, val] of Object.entries(recordData)) {
        if (val && typeof val === "object" && !Array.isArray(val)) {
          for (const [k2, v2] of Object.entries(val)) {
            if (typeof v2 !== "object" || v2 === null) inputs[k2] = v2;
          }
        } else if (typeof val !== "object") {
          inputs[name] = val;
          stateVars.push(name);
        }
      }
      const keySet = new Set([...Object.keys(built.staticDefaults), ...stateVars]);
      const keys = [...keySet].filter((k) => !INTERNAL_STATE.test(k) && typeof inputs[k] !== "object");
      if (keys.length === 0) continue;

      // choose invocation arg text
      let argText = built.argText;
      if (built.argTextReplicated) {
        const argIds = built.argTextReplicated.split(",").map((s) => s.trim());
        if (argIds.every((a) => Object.prototype.hasOwnProperty.call(inputs, a))) argText = built.argTextReplicated;
      }
      const factorySrc = built.factorySrc.replace("__ARG__", argText);
      if (process.env.DEBUG_FILE === baseName) console.log("[debug] argText =", argText);
      script = new vm.Script(factorySrc, { filename: baseName });
      const before = normalizeOutput(script.runInNewContext(sandboxBase, { timeout: 3000 })(inputs).run());
      record.beforeOutput = before.text;
      if (process.env.DEBUG_FILE === baseName) console.log("[debug] candidate", cand.scope, "before:", String(before.raw).slice(0, 80));
      if (before.raw === undefined || before.raw === null || (typeof before.raw === "number" && !isFinite(before.raw))) {
        sawNoDefaultOutput = true;
        continue;
      }

      const ghostKeys = [];
      const liveKeys = [];
      const skippedKeys = [];
      const crashedKeys = [];
      const entryTextForStatic = built.entryText;

      for (const key of keys) {
        const cands = perturbCandidates(key, inputs[key], src);
        if (cands.length === 0) {
          skippedKeys.push(key + " (un-perturbable value " + JSON.stringify(inputs[key]) + ")");
          continue;
        }
        const staticPresent = new RegExp("\\b" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(entryTextForStatic);
        let identical = true;
        let sawCrash = false;
        const afters = [];
        for (const c of cands) {
          const variant = Object.assign({}, inputs);
          variant[key] = c;
          let after = null;
          try {
            after = normalizeOutput(script.runInNewContext(sandboxBase, { timeout: 3000 })(variant).run());
          } catch (e) {
            sawCrash = true;
            continue;
          }
          afters.push(after.text);
          if (after.text !== before.text) { identical = false; break; }
        }
        if (sawCrash && afters.length === 0) {
          crashedKeys.push(key + " (crashes on candidate values " + cands.map((c) => (typeof c === "string" ? c : String(c))).join(",") + ")");
          continue;
        }
        if (identical) {
          ghostKeys.push({
            key,
            staticPresent,
            before: before.text.slice(0, 300),
            after: afters[0].slice(0, 300),
            candidates: cands.map((c) => (typeof c === "string" ? c : String(c))),
            likelyCosmetic: /^(label|name|title|note|notes|description|desc|comment|currencySymbol|displayUnit|unitLabel|fieldLabel|showAdvanced|showChart|showTable|showBreakdown|showSummary|includeChart|includeTable|theme|color|darkMode)/i.test(key),
          });
        } else {
          liveKeys.push(key);
          if (!record.spotCheck) record.spotCheck = { key, before: before.text.slice(0, 200), after: afters[afters.length - 1].slice(0, 200) };
        }
      }

      record.keys = keys;
      record.ghostKeys = ghostKeys;
      record.liveKeys = liveKeys;
      record.skippedKeys = skippedKeys;
      record.crashedKeys = crashedKeys;
      record.candidateScope = cand.scope;
      record.entryArgText = argText;
      record.entryPieces = built.pieces.slice(0, 12);
      record.unverified = null;
      return record;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (process.env.DEBUG_FILE === baseName) console.log("[debug] candidate", cand.scope, "FAILED:", msg.slice(0, 200));
      lastErr = msg;
    }
  }
  if (sawNoDefaultOutput && !lastErr) {
    record.noDefaultOutput = true;
    record.unverified = "no default output produced by any candidate";
  } else {
    record.unverified = lastErr || "evaluation failed";
  }
  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const files = fs.readdirSync(COMPONENTS).filter((f) => f.endsWith(".tsx") && !f.startsWith("_"));
  files.sort();
  const results = {};
  const t0 = Date.now();

  let i = 0;
  for (const f of files) {
    i++;
    try {
      results[f] = analyzeFile(path.join(COMPONENTS, f));
    } catch (e) {
      results[f] = { file: f, autocalc: [], unverified: "harness crash: " + (e && e.message ? e.message : e), ghostKeys: [], keys: [] };
    }
    if (i % 100 === 0) process.stderr.write(`scanned ${i}/${files.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }

  const out = { scanned: files.length, generatedAt: new Date().toISOString(), results };
  fs.writeFileSync(path.join(ROOT, "logic_audit_results.json"), JSON.stringify(out, null, 1));

  const autocalcFiles = Object.values(results).filter((r) => r.autocalc.length > 0);
  const ghostFiles = Object.values(results).filter((r) => r.ghostKeys.length > 0);
  const unverifiedFiles = Object.values(results).filter((r) => r.unverified);
  const cleanFiles = Object.values(results).filter((r) => !r.unverified && r.autocalc.length === 0 && r.ghostKeys.length === 0);
  const noDefaultOutputFiles = Object.values(results).filter((r) => r.noDefaultOutput && !r.unverified);

  let vOut = "";
  for (const r of autocalcFiles) {
    for (const h of r.autocalc) {
      vOut += `${r.file}:${h.line} [${h.kind}] ${h.reason}\n    ${h.code}\n`;
    }
  }
  fs.writeFileSync(path.join(ROOT, "logic_autocalc_violations.txt"), vOut);

  let gOut = "";
  for (const r of ghostFiles) {
    for (const g of r.ghostKeys) {
      gOut += `${r.file} — "${g.key}" (static presence in calculate(): ${g.staticPresent}${g.likelyCosmetic ? ", likely-cosmetic name" : ""}; candidates: ${g.candidates.join(", ")})\n  before: ${g.before}\n  after:  ${g.after} (identical)\n`;
    }
  }
  fs.writeFileSync(path.join(ROOT, "logic_ghost_fields.txt"), gOut);

  const summary = {
    scanned: files.length,
    autocalcFiles: autocalcFiles.length,
    autocalcHits: autocalcFiles.reduce((n, r) => n + r.autocalc.length, 0),
    ghostFiles: ghostFiles.length,
    ghostKeys: ghostFiles.reduce((n, r) => n + r.ghostKeys.length, 0),
    cleanFiles: cleanFiles.length,
    unverifiedFiles: unverifiedFiles.length,
    noDefaultOutputFiles: noDefaultOutputFiles.length,
  };
  fs.writeFileSync(path.join(ROOT, "logic_audit_summary.json"), JSON.stringify(summary, null, 2));

  console.log("SCANNED", summary.scanned);
  console.log("AUTOCALC_FILES", summary.autocalcFiles, "HITS", summary.autocalcHits);
  console.log("GHOST_FILES", summary.ghostFiles, "GHOST_KEYS", summary.ghostKeys);
  console.log("CLEAN", summary.cleanFiles);
  console.log("UNVERIFIED", summary.unverifiedFiles);
  console.log("NO_DEFAULT_OUTPUT", summary.noDefaultOutputFiles);
  console.log("ELAPSED_S", ((Date.now() - t0) / 1000).toFixed(0));
}

module.exports = { analyzeFile, buildFactory, findLocalCandidates, findLogicCandidates, findInlineCandidates };

if (require.main === module) {
  main();
}