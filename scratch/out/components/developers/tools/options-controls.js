"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptRow = OptRow;
exports.OptSelect = OptSelect;
exports.OptSwitch = OptSwitch;
exports.OptNumber = OptNumber;
exports.OptionsBar = OptionsBar;
const jsx_runtime_1 = require("react/jsx-runtime");
const switch_1 = require("@/components/ui/switch");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const utils_1 = require("@/lib/utils");
function OptRow({ label, children, className }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-center gap-3", className), children: [(0, jsx_runtime_1.jsx)(label_1.Label, { className: "text-xs text-muted-foreground min-w-[80px]", children: label }), children] }));
}
function OptSelect({ value, onChange, options, className, }) {
    return ((0, jsx_runtime_1.jsxs)(select_1.Select, { value: value, onValueChange: onChange, children: [(0, jsx_runtime_1.jsx)(select_1.SelectTrigger, { className: (0, utils_1.cn)("h-8 w-[160px]", className), children: (0, jsx_runtime_1.jsx)(select_1.SelectValue, {}) }), (0, jsx_runtime_1.jsx)(select_1.SelectContent, { children: options.map((o) => ((0, jsx_runtime_1.jsx)(select_1.SelectItem, { value: o.value, children: o.label }, o.value))) })] }));
}
function OptSwitch({ checked, onChange, label, }) {
    return ((0, jsx_runtime_1.jsx)(OptRow, { label: label, children: (0, jsx_runtime_1.jsx)(switch_1.Switch, { checked: checked, onCheckedChange: onChange }) }));
}
function OptNumber({ value, onChange, label, min, max, }) {
    return ((0, jsx_runtime_1.jsx)(OptRow, { label: label, children: (0, jsx_runtime_1.jsx)(input_1.Input, { type: "number", value: value, min: min, max: max, onChange: (e) => onChange(Number(e.target.value)), className: "h-8 w-24" }) }));
}
function OptionsBar({ children }) {
    if (!children)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border px-4 py-2.5 sm:px-5 bg-muted/20", children: children }));
}
