"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const useSegments_1 = require("./useSegments");
const vitest_1 = require("vitest");
(0, vitest_1.describe)('useSegments', () => {
    (0, vitest_1.it)('recalculates percentages when weight changes', () => {
        const { result } = (0, react_1.renderHook)(() => (0, useSegments_1.useSegments)());
        (0, react_1.act)(() => {
            result.current.updateWeight(0, 2); // Change first segment weight to 2
        });
        // Total weight 2+10+10+10=32. First segment should be 6.25%
        (0, vitest_1.expect)(result.current.segments[0].percentage).toBeCloseTo(6.25, 2);
    });
    (0, vitest_1.describe)('updatePercentage', () => {
        (0, vitest_1.it)('sets the target segment to the specified percentage', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useSegments_1.useSegments)());
            (0, react_1.act)(() => {
                result.current.updatePercentage(0, 25);
            });
            (0, vitest_1.expect)(result.current.segments[0].percentage).toBeCloseTo(25, 1);
            // With four equal-weight segments, the remaining 75% is split
            // evenly across the other three segments => 25% each.
            (0, vitest_1.expect)(result.current.segments[1].percentage).toBeCloseTo(25, 1);
        });
        (0, vitest_1.it)('all percentages still sum to 100 after update', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useSegments_1.useSegments)());
            (0, react_1.act)(() => {
                result.current.updatePercentage(0, 40);
            });
            const total = result.current.segments.reduce((sum, s) => sum + s.percentage, 0);
            (0, vitest_1.expect)(total).toBeCloseTo(100, 5);
        });
        (0, vitest_1.it)('clamps percentage to a minimum of 0.01', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useSegments_1.useSegments)());
            (0, react_1.act)(() => {
                result.current.updatePercentage(0, 0);
            });
            (0, vitest_1.expect)(result.current.segments[0].percentage).toBeCloseTo(0.01, 1);
        });
        (0, vitest_1.it)('clamps percentage to a maximum of 99.99', () => {
            const { result } = (0, react_1.renderHook)(() => (0, useSegments_1.useSegments)());
            (0, react_1.act)(() => {
                result.current.updatePercentage(0, 100);
            });
            (0, vitest_1.expect)(result.current.segments[0].percentage).toBeCloseTo(99.99, 1);
        });
    });
});
//# sourceMappingURL=useSegments.test.js.map