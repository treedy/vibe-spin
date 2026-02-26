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
exports.Wheel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const RADIUS = 100;
const CENTER_X = 100;
const CENTER_Y = 100;
exports.Wheel = react_1.default.memo(({ segments, rotation, isSpinning, onSpin, disabled }) => {
    const slices = (0, react_1.useMemo)(() => {
        let currentAngle = 0;
        return segments.map((segment) => {
            const sliceAngle = (segment.percentage / 100) * 360;
            const x1 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
            const y1 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);
            currentAngle += sliceAngle;
            const x2 = (CENTER_X + RADIUS * Math.cos((Math.PI * currentAngle) / 180)).toFixed(2);
            const y2 = (CENTER_Y + RADIUS * Math.sin((Math.PI * currentAngle) / 180)).toFixed(2);
            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
            const pathData = `M ${CENTER_X} ${CENTER_Y} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            return {
                id: segment.id,
                pathData,
                color: segment.color,
            };
        });
    }, [segments]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "wheel-wrapper", children: [(0, jsx_runtime_1.jsx)("div", { className: "ticker", children: (0, jsx_runtime_1.jsx)("svg", { width: "16", height: "40", viewBox: "0 0 16 40", fill: "none", children: (0, jsx_runtime_1.jsx)("rect", { x: "0", y: "0", width: "16", height: "40", rx: "8", fill: "white" }) }) }), (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { animate: { rotate: rotation }, transition: { type: 'spring', damping: 20, stiffness: 60 }, style: { width: '100%', height: '100%' }, children: (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 200 200", style: { width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 0 20px rgba(37, 123, 244, 0.3))' }, children: slices.map((slice) => ((0, jsx_runtime_1.jsx)("path", { d: slice.pathData, fill: slice.color, stroke: "rgba(255,255,255,0.1)", strokeWidth: "0.5" }, slice.id))) }) }), (0, jsx_runtime_1.jsxs)("button", { className: "wheel-center-btn", onClick: onSpin, disabled: disabled, children: [(0, jsx_runtime_1.jsx)("span", { className: "wheel-center-label", children: "Ready" }), (0, jsx_runtime_1.jsx)("span", { className: "wheel-center-text", children: isSpinning ? '...' : 'SPIN' })] })] }));
});
exports.Wheel.displayName = 'Wheel';
//# sourceMappingURL=Wheel.js.map