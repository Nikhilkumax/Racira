"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTool = registerTool;
exports.registerMany = registerMany;
exports.getTool = getTool;
const registry = new Map();
function registerTool(def) {
    registry.set(def.slug, def);
}
function registerMany(defs) {
    for (const d of defs)
        registerTool(d);
}
function getTool(slug) {
    return registry.get(slug);
}
