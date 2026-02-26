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
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
require("./styles.css");
const useSegments_1 = require("./hooks/useSegments");
const SegmentTable_1 = require("./components/SegmentTable");
const Wheel_1 = require("./components/Wheel");
const lucide_react_1 = require("lucide-react");
const PRESETS = [
    { name: 'Lunch', segments: [
            { id: 'l1', label: 'Pizza', weight: 1, percentage: 33.3, color: '#FF5733' },
            { id: 'l2', label: 'Sushi', weight: 1, percentage: 33.3, color: '#33FF57' },
            { id: 'l3', label: 'Tacos', weight: 1, percentage: 33.3, color: '#3357FF' },
        ] },
    { name: 'Truth or Dare', segments: [
            { id: 'td1', label: 'Truth', weight: 1, percentage: 50, color: '#f43f5e' },
            { id: 'td2', label: 'Dare', weight: 1, percentage: 50, color: '#6366f1' },
        ] },
    { name: 'Monochromatic Blue', segments: [
            { id: 'l1', label: 'Deep Ocean', weight: 10, percentage: 25, color: '#1a5fb4' },
            { id: 'l2', label: 'Electric Sky', weight: 10, percentage: 25, color: '#3584e4' },
            { id: 'l3', label: 'Neon Cobalt', weight: 10, percentage: 25, color: '#62a0ea' },
            { id: 'l4', label: 'Cyan Flash', weight: 10, percentage: 25, color: '#00f2ff' },
        ] },
];
const RECENT_SESSIONS = [
    { id: 1, name: 'Dinner Dash', time: '15 mins ago', icon: lucide_react_1.Utensils },
    { id: 2, name: 'Movie Night', time: '2 hours ago', icon: lucide_react_1.Film },
    { id: 3, name: 'Idea Storm', time: 'Yesterday', icon: lucide_react_1.Lightbulb },
    { id: 4, name: 'Daily Kickoff', time: 'Oct 26', icon: lucide_react_1.Rocket },
];
function App() {
    const { segments, updateWeight, updatePercentage, updateLabel, updateColor, addSegment, removeSegment, setSegments } = (0, useSegments_1.useSegments)();
    const [rotation, setRotation] = (0, react_1.useState)(0);
    const [winner, setWinner] = (0, react_1.useState)(null);
    const [isSpinning, setIsSpinning] = (0, react_1.useState)(false);
    const [isPending, startTransition] = (0, react_1.useTransition)();
    const [soundEnabled, setSoundEnabled] = (0, react_1.useState)(true);
    const [celebrationEnabled, setCelebrationEnabled] = (0, react_1.useState)(true);
    const loadPreset = (0, react_1.useCallback)((presetSegments) => {
        startTransition(() => {
            setSegments(presetSegments);
            setWinner(null);
        });
    }, [setSegments]);
    const spin = (0, react_1.useCallback)(() => {
        if (isSpinning)
            return;
        setIsSpinning(true);
        setWinner(null);
        const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
        const randomWeight = Math.random() * totalWeight;
        let currentWeight = 0;
        let winnerIndex = 0;
        for (let i = 0; i < segments.length; i++) {
            currentWeight += segments[i].weight;
            if (randomWeight <= currentWeight) {
                winnerIndex = i;
                break;
            }
        }
        let winnerStartAngle = 0;
        for (let i = 0; i < winnerIndex; i++) {
            winnerStartAngle += (segments[i].percentage / 100) * 360;
        }
        const winnerAngle = (segments[winnerIndex].percentage / 100) * 360;
        const centerWinnerAngle = winnerStartAngle + winnerAngle / 2;
        const extraSpins = 5 * 360;
        const targetRotation = 270 - centerWinnerAngle;
        const finalRotation = rotation + extraSpins + (targetRotation - (rotation % 360));
        setRotation(finalRotation);
        setTimeout(() => {
            setWinner(segments[winnerIndex].label);
            setIsSpinning(false);
        }, 1500);
    }, [isSpinning, rotation, segments]);
    const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app", children: [(0, jsx_runtime_1.jsxs)("nav", { className: "top-nav", children: [(0, jsx_runtime_1.jsxs)("div", { className: "nav-logo", children: [(0, jsx_runtime_1.jsx)("div", { className: "logo-icon", children: (0, jsx_runtime_1.jsxs)("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2.5", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "10" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 6v6l4 2" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "logo-text", children: ["DECISION", (0, jsx_runtime_1.jsx)("span", { children: "WHEEL" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "nav-links", children: [(0, jsx_runtime_1.jsx)("a", { href: "#", children: "My Wheels" }), (0, jsx_runtime_1.jsx)("a", { href: "#", children: "Templates" }), (0, jsx_runtime_1.jsx)("a", { href: "#", children: "History" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "nav-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "new-wheel-btn", children: "New Wheel" }), (0, jsx_runtime_1.jsx)("button", { className: "avatar-btn", children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: 18 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "page-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "page-header-left", children: [(0, jsx_runtime_1.jsxs)("h1", { className: "page-title", children: ["DECISION ", (0, jsx_runtime_1.jsx)("span", { children: "STUDIO" })] }), (0, jsx_runtime_1.jsx)("p", { className: "page-subtitle", children: "Configure your game-show wheel with custom weightings and neon styles." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "header-actions", children: [(0, jsx_runtime_1.jsxs)("button", { className: "header-btn", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { size: 16 }), "Share"] }), (0, jsx_runtime_1.jsxs)("button", { className: "header-btn", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { size: 16 }), "Settings"] })] })] }), (0, jsx_runtime_1.jsxs)("main", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "wheel-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "wheel-container", children: (0, jsx_runtime_1.jsx)(Wheel_1.Wheel, { segments: segments, rotation: rotation, isSpinning: isSpinning, onSpin: spin, disabled: isSpinning || isPending }) }), (0, jsx_runtime_1.jsx)("button", { className: "spin-button", onClick: spin, disabled: isSpinning || isPending, children: "Spin the Wheel" }), (0, jsx_runtime_1.jsx)("span", { className: "spin-hint", children: "Press space or click to spin" }), winner ? ((0, jsx_runtime_1.jsxs)("div", { className: "winner-overlay", children: ["\uD83C\uDF89 Winner: ", winner] })) : null] }), (0, jsx_runtime_1.jsxs)("div", { className: "segments-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "segments-header", children: [(0, jsx_runtime_1.jsx)("h2", { className: "segments-title", children: "Segments" }), (0, jsx_runtime_1.jsx)("p", { className: "segments-subtitle", children: "Manage labels, colors and winning weights" })] }), (0, jsx_runtime_1.jsx)(SegmentTable_1.SegmentTable, { segments: segments, onUpdateWeight: updateWeight, onUpdatePercentage: updatePercentage, onUpdateLabel: updateLabel, onUpdateColor: updateColor, onAddSegment: addSegment, onRemoveSegment: removeSegment, presets: PRESETS, onLoadPreset: loadPreset }), (0, jsx_runtime_1.jsxs)("div", { className: "table-footer", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Total Weight Sum: ", (0, jsx_runtime_1.jsx)("strong", { children: totalWeight })] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Total %: ", (0, jsx_runtime_1.jsx)("strong", { children: "100.0%" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-row", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "setting-label", children: "Sound Effects" }), (0, jsx_runtime_1.jsx)("span", { className: "setting-value", children: "Game Show Neon" })] }), (0, jsx_runtime_1.jsx)("div", { className: `toggle ${soundEnabled ? 'active' : ''}`, onClick: () => setSoundEnabled(!soundEnabled) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "setting-label", children: "Celebration" }), (0, jsx_runtime_1.jsx)("span", { className: "setting-value", children: "Neon Confetti" })] }), (0, jsx_runtime_1.jsx)("div", { className: `toggle ${celebrationEnabled ? 'active' : ''}`, onClick: () => setCelebrationEnabled(!celebrationEnabled) })] })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "recent-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recent-header", children: [(0, jsx_runtime_1.jsx)("h3", { className: "recent-title", children: "Recent Sessions" }), (0, jsx_runtime_1.jsx)("a", { href: "#", className: "view-history-link", children: "View Full History" })] }), (0, jsx_runtime_1.jsx)("div", { className: "recent-grid", children: RECENT_SESSIONS.map(session => ((0, jsx_runtime_1.jsxs)("div", { className: "session-card", children: [(0, jsx_runtime_1.jsx)("div", { className: "session-icon", children: (0, jsx_runtime_1.jsx)(session.icon, { size: 18 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "session-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "session-name", children: session.name }), (0, jsx_runtime_1.jsx)("span", { className: "session-time", children: session.time })] })] }, session.id))) })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "app-footer", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00A9 2024 Decision Wheel Studio. Gamified Choices." }), (0, jsx_runtime_1.jsxs)("div", { className: "footer-links", children: [(0, jsx_runtime_1.jsx)("a", { href: "#", children: "Privacy" }), (0, jsx_runtime_1.jsx)("a", { href: "#", children: "Terms" }), (0, jsx_runtime_1.jsx)("a", { href: "#", children: "Feedback" })] })] })] }));
}
//# sourceMappingURL=App.js.map