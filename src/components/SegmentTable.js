"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentTable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const SegmentRow = react_1.default.memo(({ segment, index, onUpdateWeight, onUpdatePercentage, onUpdateLabel, onUpdateColor, onRemoveSegment, canRemove }) => {
    const [inputPct, setInputPct] = (0, react_1.useState)(null);
    const inputPctRef = (0, react_1.useRef)(null);
    const setDraft = (v) => {
        inputPctRef.current = v;
        setInputPct(v);
    };
    const commitPercentage = (0, react_1.useCallback)(() => {
        const draft = inputPctRef.current;
        if (draft !== null) {
            const val = parseFloat(draft);
            if (!isNaN(val)) {
                onUpdatePercentage(index, val);
            }
            setDraft(null);
        }
    }, [index, onUpdatePercentage]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", className: "label-input", value: segment.label, onChange: (e) => onUpdateLabel(index, e.target.value) }), (0, jsx_runtime_1.jsx)("input", { type: "color", className: "color-swatch", value: segment.color, onChange: (e) => onUpdateColor(index, e.target.value) }), (0, jsx_runtime_1.jsx)("input", { type: "number", className: "weight-input", value: segment.weight, onChange: (e) => onUpdateWeight(index, Number(e.target.value)), min: "1" }), (0, jsx_runtime_1.jsx)("input", { type: "number", className: "pct-input", value: inputPct !== null ? inputPct : segment.percentage.toFixed(1), onChange: (e) => setDraft(e.target.value), onFocus: () => setDraft(segment.percentage.toFixed(1)), onBlur: commitPercentage, onKeyDown: (e) => { if (e.key === 'Enter') {
                    e.currentTarget.blur();
                } }, min: "0.01", max: "99.99", step: "0.1" }), (0, jsx_runtime_1.jsx)("button", { className: "remove-btn", onClick: () => onRemoveSegment(index), disabled: !canRemove, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 16 }) })] }));
});
SegmentRow.displayName = 'SegmentRow';
const SegmentTable = ({ segments, onUpdateWeight, onUpdatePercentage, onUpdateLabel, onUpdateColor, onAddSegment, onRemoveSegment, presets, onLoadPreset }) => {
    const canRemove = segments.length > 2;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "table-container", children: [presets && presets.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "preset-row", children: presets.map(p => ((0, jsx_runtime_1.jsxs)("button", { className: "preset-btn", onClick: () => onLoadPreset?.(p.segments), children: [p.name, (0, jsx_runtime_1.jsx)(lucide_react_1.Palette, { size: 14 })] }, p.name))) })), (0, jsx_runtime_1.jsxs)("div", { className: "row header", children: [(0, jsx_runtime_1.jsx)("div", { className: "col", children: "Segment" }), (0, jsx_runtime_1.jsx)("div", { className: "col", children: "Color" }), (0, jsx_runtime_1.jsx)("div", { className: "col", children: "Weight" }), (0, jsx_runtime_1.jsx)("div", { className: "col", children: "%" }), (0, jsx_runtime_1.jsx)("div", { className: "col", children: "Action" })] }), segments.map((s, i) => ((0, jsx_runtime_1.jsx)(SegmentRow, { segment: s, index: i, onUpdateWeight: onUpdateWeight, onUpdatePercentage: onUpdatePercentage, onUpdateLabel: onUpdateLabel, onUpdateColor: onUpdateColor, onRemoveSegment: onRemoveSegment, canRemove: canRemove }, s.id))), (0, jsx_runtime_1.jsxs)("button", { className: "add-segment-row", onClick: onAddSegment, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), segments.length === 0 ? 'Add your first segment' : 'Add segment'] })] }));
};
exports.SegmentTable = SegmentTable;
//# sourceMappingURL=SegmentTable.js.map