"use strict";
/** Shared helpers for tool implementations. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryParseJSON = tryParseJSON;
exports.safeParseJSON = safeParseJSON;
exports.indent = indent;
exports.byteLength = byteLength;
exports.countLines = countLines;
exports.stableStringify = stableStringify;
exports.formatBytes = formatBytes;
exports.bufToHex = bufToHex;
exports.hexToBuf = hexToBuf;
exports.b64Encode = b64Encode;
exports.b64Decode = b64Decode;
exports.downloadBlob = downloadBlob;
function tryParseJSON(input) {
    const trimmed = input.trim();
    if (!trimmed)
        throw new Error("Input is empty");
    try {
        return JSON.parse(trimmed);
    }
    catch (e) {
        throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
}
function safeParseJSON(input) {
    try {
        return { ok: true, value: JSON.parse(input.trim()) };
    }
    catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}
function indent(n) {
    return "  ".repeat(n);
}
/** Estimate byte length of a UTF-8 string. */
function byteLength(s) {
    if (typeof TextEncoder !== "undefined") {
        return new TextEncoder().encode(s).length;
    }
    return s.length;
}
function countLines(s) {
    if (!s)
        return 0;
    return s.split(/\r\n|\r|\n/).length;
}
/** Convert a literal value into a stable, hashable string. */
function stableStringify(value) {
    return JSON.stringify(value, (_k, v) => {
        if (v && typeof v === "object" && !Array.isArray(v)) {
            const sorted = {};
            for (const key of Object.keys(v).sort())
                sorted[key] = v[key];
            return sorted;
        }
        return v;
    });
}
/** Human byte formatting. */
function formatBytes(n) {
    if (n < 1024)
        return `${n} B`;
    if (n < 1024 * 1024)
        return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
/** Hex buffer -> string. */
function bufToHex(buf) {
    const bytes = new Uint8Array(buf);
    let out = "";
    for (let i = 0; i < bytes.length; i++)
        out += bytes[i].toString(16).padStart(2, "0");
    return out;
}
function hexToBuf(hex) {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0)
        throw new Error("Hex string has an odd length");
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++)
        out[i] = parseInt(clean.substr(i * 2, 2), 16);
    return out;
}
/** Base64 helpers that handle UTF-8 correctly. */
function b64Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
function b64Decode(b64) {
    const clean = b64.replace(/\s+/g, "");
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
        bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}
function downloadBlob(content, filename, type = "text/plain;charset=utf-8") {
    const blob = typeof content === "string" ? new Blob([content], { type }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
