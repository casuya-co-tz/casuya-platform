"use strict";
var CasuyaBlackboard = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browser-core.ts
  var browser_core_exports = {};
  __export(browser_core_exports, {
    Blackboard: () => Blackboard,
    createToolbar: () => createToolbar,
    updateToolbarState: () => updateToolbarState
  });

  // ../node_modules/.pnpm/perfect-freehand@1.2.3/node_modules/perfect-freehand/dist/esm/index.mjs
  var { PI: e } = Math;
  var t = e + 1e-4;
  var n = 0.5;
  var r = [1, 1];
  function i(e2, t2, n2, r2 = (e3) => e3) {
    return e2 * r2(0.5 - t2 * (0.5 - n2));
  }
  var { min: a } = Math;
  function o(e2, t2, n2) {
    let r2 = a(1, t2 / n2);
    return a(1, e2 + (a(1, 1 - r2) - e2) * (r2 * 0.275));
  }
  function s(e2) {
    return [-e2[0], -e2[1]];
  }
  function c(e2, t2) {
    return [e2[0] + t2[0], e2[1] + t2[1]];
  }
  function l(e2, t2, n2) {
    return e2[0] = t2[0] + n2[0], e2[1] = t2[1] + n2[1], e2;
  }
  function u(e2, t2) {
    return [e2[0] - t2[0], e2[1] - t2[1]];
  }
  function d(e2, t2, n2) {
    return e2[0] = t2[0] - n2[0], e2[1] = t2[1] - n2[1], e2;
  }
  function f(e2, t2) {
    return [e2[0] * t2, e2[1] * t2];
  }
  function p(e2, t2, n2) {
    return e2[0] = t2[0] * n2, e2[1] = t2[1] * n2, e2;
  }
  function m(e2, t2) {
    return [e2[0] / t2, e2[1] / t2];
  }
  function h(e2) {
    return [e2[1], -e2[0]];
  }
  function g(e2, t2) {
    let n2 = t2[0];
    return e2[0] = t2[1], e2[1] = -n2, e2;
  }
  function ee(e2, t2) {
    return e2[0] * t2[0] + e2[1] * t2[1];
  }
  function _(e2, t2) {
    return e2[0] === t2[0] && e2[1] === t2[1];
  }
  function v(e2) {
    return Math.hypot(e2[0], e2[1]);
  }
  function y(e2, t2) {
    let n2 = e2[0] - t2[0], r2 = e2[1] - t2[1];
    return n2 * n2 + r2 * r2;
  }
  function b(e2) {
    return m(e2, v(e2));
  }
  function x(e2, t2) {
    return Math.hypot(e2[1] - t2[1], e2[0] - t2[0]);
  }
  function S(e2, t2, n2) {
    let r2 = Math.sin(n2), i2 = Math.cos(n2), a2 = e2[0] - t2[0], o2 = e2[1] - t2[1], s2 = a2 * i2 - o2 * r2, c2 = a2 * r2 + o2 * i2;
    return [s2 + t2[0], c2 + t2[1]];
  }
  function C(e2, t2, n2, r2) {
    let i2 = Math.sin(r2), a2 = Math.cos(r2), o2 = t2[0] - n2[0], s2 = t2[1] - n2[1], c2 = o2 * a2 - s2 * i2, l2 = o2 * i2 + s2 * a2;
    return e2[0] = c2 + n2[0], e2[1] = l2 + n2[1], e2;
  }
  function w(e2, t2, n2) {
    return c(e2, f(u(t2, e2), n2));
  }
  function te(e2, t2, n2, r2) {
    let i2 = n2[0] - t2[0], a2 = n2[1] - t2[1];
    return e2[0] = t2[0] + i2 * r2, e2[1] = t2[1] + a2 * r2, e2;
  }
  function T(e2, t2, n2) {
    return c(e2, f(t2, n2));
  }
  var E = [0, 0];
  var D = [0, 0];
  var O = [0, 0];
  function k(e2, n2) {
    let r2 = T(e2, b(h(u(e2, c(e2, [1, 1])))), -n2), i2 = [], a2 = 1 / 13;
    for (let n3 = a2; n3 <= 1; n3 += a2) i2.push(S(r2, e2, t * 2 * n3));
    return i2;
  }
  function A(e2, n2, r2) {
    let i2 = [], a2 = 1 / r2;
    for (let r3 = a2; r3 <= 1; r3 += a2) i2.push(S(n2, e2, t * r3));
    return i2;
  }
  function j(e2, t2, n2) {
    let r2 = u(t2, n2), i2 = f(r2, 0.5), a2 = f(r2, 0.51);
    return [u(e2, i2), u(e2, a2), c(e2, a2), c(e2, i2)];
  }
  function M(e2, n2, r2, i2) {
    let a2 = [], o2 = T(e2, n2, r2), s2 = 1 / i2;
    for (let n3 = s2; n3 < 1; n3 += s2) a2.push(S(o2, e2, t * 3 * n3));
    return a2;
  }
  function ne(e2, t2, n2) {
    return [c(e2, f(t2, n2)), c(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2))];
  }
  function N(e2, t2, n2) {
    return e2 === false || e2 === void 0 ? 0 : e2 === true ? Math.max(t2, n2) : e2;
  }
  function re(e2, t2, n2) {
    return e2.slice(0, 10).reduce((e3, r2) => {
      let i2 = r2.pressure;
      return t2 && (i2 = o(e3, r2.distance, n2)), (e3 + i2) / 2;
    }, e2[0].pressure);
  }
  function P(e2, n2 = {}) {
    let { size: r2 = 16, smoothing: a2 = 0.5, thinning: f2 = 0.5, simulatePressure: m2 = true, easing: _2 = (e3) => e3, start: v2 = {}, end: b2 = {}, last: x2 = false } = n2, { cap: S2 = true, easing: w2 = (e3) => e3 * (2 - e3) } = v2, { cap: T2 = true, easing: P2 = (e3) => --e3 * e3 * e3 + 1 } = b2;
    if (e2.length === 0 || r2 <= 0) return [];
    let F2 = e2[e2.length - 1].runningLength, I2 = N(v2.taper, r2, F2), L2 = N(b2.taper, r2, F2), R2 = (r2 * a2) ** 2, z = [], B = [], V = re(e2, m2, r2), H = i(r2, f2, e2[e2.length - 1].pressure, _2), U, W = e2[0].vector, G = e2[0].point, K = G, q = G, J = K, Y = false;
    for (let n3 = 0; n3 < e2.length; n3++) {
      let { pressure: a3 } = e2[n3], { point: s2, vector: h2, distance: v3, runningLength: b3 } = e2[n3], x3 = n3 === e2.length - 1;
      if (!x3 && F2 - b3 < 3) continue;
      f2 ? (m2 && (a3 = o(V, v3, r2)), H = i(r2, f2, a3, _2)) : H = r2 / 2, U === void 0 && (U = H);
      let S3 = b3 < I2 ? w2(b3 / I2) : 1, T3 = F2 - b3 < L2 ? P2((F2 - b3) / L2) : 1;
      H = Math.max(0.01, H * Math.min(S3, T3));
      let k2 = (x3 ? e2[n3] : e2[n3 + 1]).vector, A2 = x3 ? 1 : ee(h2, k2), j2 = ee(h2, W) < 0 && !Y, M2 = A2 !== null && A2 < 0;
      if (j2 || M2) {
        g(E, W), p(E, E, H);
        for (let e3 = 0; e3 <= 1; e3 += 0.07692307692307693) d(D, s2, E), C(D, D, s2, t * e3), q = [D[0], D[1]], z.push(q), l(O, s2, E), C(O, O, s2, t * -e3), J = [O[0], O[1]], B.push(J);
        G = q, K = J, M2 && (Y = true);
        continue;
      }
      if (Y = false, x3) {
        g(E, h2), p(E, E, H), z.push(u(s2, E)), B.push(c(s2, E));
        continue;
      }
      te(E, k2, h2, A2), g(E, E), p(E, E, H), d(D, s2, E), q = [D[0], D[1]], (n3 <= 1 || y(G, q) > R2) && (z.push(q), G = q), l(O, s2, E), J = [O[0], O[1]], (n3 <= 1 || y(K, J) > R2) && (B.push(J), K = J), V = a3, W = h2;
    }
    let X = [e2[0].point[0], e2[0].point[1]], Z = e2.length > 1 ? [e2[e2.length - 1].point[0], e2[e2.length - 1].point[1]] : c(e2[0].point, [1, 1]), Q = [], $ = [];
    if (e2.length === 1) {
      if (!(I2 || L2) || x2) return k(X, U || H);
    } else {
      I2 || L2 && e2.length === 1 || (S2 ? Q.push(...A(X, B[0], 13)) : Q.push(...j(X, z[0], B[0])));
      let t2 = h(s(e2[e2.length - 1].vector));
      L2 || I2 && e2.length === 1 ? $.push(Z) : T2 ? $.push(...M(Z, t2, H, 29)) : $.push(...ne(Z, t2, H));
    }
    return z.concat($, B.reverse(), Q);
  }
  var F = [0, 0];
  function I(e2) {
    return e2 != null && e2 >= 0;
  }
  function L(e2, t2 = {}) {
    let { streamline: i2 = 0.5, size: a2 = 16, last: o2 = false } = t2;
    if (e2.length === 0) return [];
    let s2 = 0.15 + (1 - i2) * 0.85, l2 = Array.isArray(e2[0]) ? e2 : e2.map(({ x: e3, y: t3, pressure: r2 = n }) => [e3, t3, r2]);
    if (l2.length === 2) {
      let e3 = l2[1];
      l2 = l2.slice(0, -1);
      for (let t3 = 1; t3 < 5; t3++) l2.push(w(l2[0], e3, t3 / 4));
    }
    l2.length === 1 && (l2 = [...l2, [...c(l2[0], r), ...l2[0].slice(2)]]);
    let u2 = [{ point: [l2[0][0], l2[0][1]], pressure: I(l2[0][2]) ? l2[0][2] : 0.25, vector: [...r], distance: 0, runningLength: 0 }], f2 = false, p2 = 0, m2 = u2[0], h2 = l2.length - 1;
    for (let e3 = 1; e3 < l2.length; e3++) {
      let t3 = o2 && e3 === h2 ? [l2[e3][0], l2[e3][1]] : w(m2.point, l2[e3], s2);
      if (_(m2.point, t3)) continue;
      let r2 = x(t3, m2.point);
      if (p2 += r2, e3 < h2 && !f2) {
        if (p2 < a2) continue;
        f2 = true;
      }
      d(F, m2.point, t3), m2 = { point: t3, pressure: I(l2[e3][2]) ? l2[e3][2] : n, vector: b(F), distance: r2, runningLength: p2 }, u2.push(m2);
    }
    return u2[0].vector = u2[1]?.vector || [0, 0], u2;
  }
  function R(e2, t2 = {}) {
    return P(L(e2, t2), t2);
  }

  // src/toolbar.ts
  var TOOLBAR_THEMES = {
    light: { barBg: "#f8fafc", barBorder: "#e2e8f0", btnColor: "#64748b", btnHover: "#334155", btnHoverBg: "#e2e8f0", activeBg: "#dbeafe", activeColor: "#2563eb", activeBorder: "#93c5fd", sep: "#e2e8f0", tipBg: "#f1f5f9", tipBorder: "#e2e8f0", tipColor: "#64748b" },
    dark: { barBg: "#1e1e2e", barBorder: "#313244", btnColor: "#6c7086", btnHover: "#cdd6f4", btnHoverBg: "#313244", activeBg: "#313244", activeColor: "#89b4fa", activeBorder: "#45475a", sep: "#313244", tipBg: "#181825", tipBorder: "#313244", tipColor: "#6c7086" }
  };
  var TOOL_ICONS = {
    select: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`,
    hand: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V4a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
    pen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
    highlighter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`,
    text: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    line: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="19" x2="19" y2="5"/></svg>`,
    rect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
    circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
    arrow: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    eraser: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`
  };
  var COLORS = [
    "#1e293b",
    "#dc2626",
    "#2563eb",
    "#16a34a",
    "#ca8a04",
    "#9333ea",
    "#ea580c",
    "#0891b2"
  ];
  var TOOL_ORDER = ["select", "hand", "pen", "highlighter", "text", "line", "rect", "circle", "arrow", "eraser"];
  var TOOL_LABELS = {
    select: "Select",
    hand: "Hand",
    pen: "Pen",
    highlighter: "Highlight",
    text: "Text",
    line: "Line",
    rect: "Rect",
    circle: "Circle",
    arrow: "Arrow",
    eraser: "Eraser"
  };
  var TOOL_DESCRIPTIONS = {
    select: "Select, move, and resize elements (V)",
    hand: "Pan the canvas (H / Space+drag)",
    pen: "Freehand drawing with pressure sensitivity (P)",
    highlighter: "Semi-transparent highlighting marker (M)",
    text: "Add text labels and notes (T)",
    line: "Draw a straight line (L)",
    rect: "Draw a rectangle \u2014 hold Shift for square (R)",
    circle: "Draw an ellipse \u2014 hold Shift for circle (O)",
    arrow: "Draw an arrow (A)",
    eraser: "Remove elements from your drawing (E)"
  };
  var TOOLBAR_STYLES = `
.casuya-toolbar-sep { width: 1px; height: 32px; margin: 0 6px; flex-shrink: 0; transition: background 0.15s ease; }
.casuya-toolbar-btn {
  min-width: 48px; height: 48px; border: 2px solid transparent; border-radius: 8px;
  background: transparent; cursor: pointer; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px; padding: 4px 6px;
  transition: all 0.15s ease; font-family: inherit;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.casuya-toolbar-btn:active { transform: scale(0.95); }
.casuya-toolbar-btn svg { flex-shrink: 0; }
.casuya-toolbar-label {
  font-size: 9px; line-height: 1; color: inherit; letter-spacing: 0.02em;
  max-width: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.casuya-action-btn {
  width: 40px; height: 40px; border: none; border-radius: 8px;
  background: transparent; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  font-size: 16px; transition: all 0.15s ease; flex-shrink: 0;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.casuya-action-btn:active { transform: scale(0.95); }
.casuya-swatch {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: all 0.15s ease; padding: 0; flex-shrink: 0;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.casuya-swatch:active { transform: scale(0.9); }
.casuya-color-picker {
  width: 28px; height: 28px; border: none; border-radius: 50%; padding: 0;
  cursor: pointer; flex-shrink: 0; overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}
.casuya-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.casuya-color-picker::-webkit-color-swatch { border-radius: 50%; transition: border 0.15s ease; }
.casuya-tooltip {
  width: 100%; padding: 6px 10px; font-size: 11px; min-height: 28px;
  box-sizing: border-box; line-height: 1.4; transition: all 0.15s ease;
}
.casuya-tooltip:empty { display: none; }
.casuya-zoom-btn {
  width: 32px; height: 32px; border: none; background: transparent; cursor: pointer;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; transition: all 0.15s ease; flex-shrink: 0;
}
.casuya-zoom-btn:active { transform: scale(0.95); }
.casuya-zoom-label {
  cursor: pointer; font-size: 11px; min-width: 40px; text-align: center; user-select: none;
  padding: 0 4px; transition: color 0.15s ease;
}
.casuya-tool-group, .casuya-color-group, .casuya-action-group { display: flex; flex-wrap: wrap; }
@media (max-width: 640px) {
  .casuya-toolbar-row {
    flex-wrap: nowrap !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px 6px !important;
    gap: 3px !important;
    scrollbar-width: none;
  }
  .casuya-toolbar-row::-webkit-scrollbar { display: none; }
  .casuya-toolbar-row > .casuya-toolbar-sep { display: none; }
  .casuya-tool-group, .casuya-color-group, .casuya-action-group { flex-wrap: nowrap !important; }
  .casuya-toolbar-btn { min-width: 34px; min-height: 34px; height: 34px; padding: 2px !important; }
  .casuya-toolbar-label { display: none !important; }
  .casuya-action-btn { width: 30px; height: 30px; font-size: 13px; }
  .casuya-swatch { width: 20px; height: 20px; }
  .casuya-color-picker { width: 20px; height: 20px; }
  .casuya-width-group { gap: 4px !important; }
  .casuya-width-group input[type="range"] { width: 48px !important; }
  .casuya-zoom-group { gap: 0 !important; }
  .casuya-zoom-btn { width: 26px; height: 26px; font-size: 14px; }
  .casuya-zoom-label { font-size: 10px; min-width: 32px; }
  .casuya-tooltip { display: none !important; }
}
`;
  function injectStyles() {
    if (document.getElementById("casuya-toolbar-styles")) return;
    const style = document.createElement("style");
    style.id = "casuya-toolbar-styles";
    style.textContent = TOOLBAR_STYLES;
    document.head.appendChild(style);
  }
  function sep() {
    const s2 = document.createElement("div");
    s2.className = "casuya-toolbar-sep casuya-separator";
    return s2;
  }
  function createToolbar(board) {
    injectStyles();
    const bar = document.createElement("div");
    bar.style.cssText = `
    display: flex; flex-direction: column; transition: all 0.15s ease;
    border-bottom-width: 1px; border-bottom-style: solid;
  `;
    const row = document.createElement("div");
    row.className = "casuya-toolbar-row";
    row.style.cssText = `
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px;
  `;
    const tooltipEl = document.createElement("div");
    tooltipEl.className = "casuya-tooltip";
    const toolButtons = /* @__PURE__ */ new Map();
    const toolGroup = document.createElement("div");
    toolGroup.className = "casuya-tool-group";
    toolGroup.style.cssText = "display: flex; gap: 4px;";
    for (const tool of TOOL_ORDER) {
      const btn = document.createElement("button");
      btn.className = "casuya-toolbar-btn";
      btn.innerHTML = `${TOOL_ICONS[tool]}<span class="casuya-toolbar-label">${TOOL_LABELS[tool]}</span>`;
      btn.addEventListener("mouseenter", () => {
        if (board.getTool() !== tool) {
          const themeDef = TOOLBAR_THEMES[board.getTheme()];
          btn.style.background = themeDef.btnHoverBg;
          btn.style.color = themeDef.btnHover;
        }
        tooltipEl.textContent = TOOL_DESCRIPTIONS[tool];
      });
      btn.addEventListener("mouseleave", () => {
        if (board.getTool() !== tool) {
          const themeDef = TOOLBAR_THEMES[board.getTheme()];
          btn.style.background = "transparent";
          btn.style.color = themeDef.btnColor;
        }
        tooltipEl.textContent = "";
      });
      btn.addEventListener("focus", () => {
        tooltipEl.textContent = TOOL_DESCRIPTIONS[tool];
      });
      btn.addEventListener("blur", () => {
        tooltipEl.textContent = "";
      });
      btn.addEventListener("click", () => board.setTool(tool));
      toolButtons.set(tool, btn);
      toolGroup.appendChild(btn);
    }
    row.appendChild(toolGroup);
    row.appendChild(sep());
    const colorGroup = document.createElement("div");
    colorGroup.className = "casuya-color-group";
    colorGroup.style.cssText = "display: flex; gap: 4px; align-items: center;";
    for (const color of COLORS) {
      const swatch = document.createElement("button");
      swatch.className = "casuya-swatch";
      swatch.dataset.color = color;
      swatch.style.background = color;
      swatch.addEventListener("mouseenter", () => {
        swatch.style.transform = "scale(1.2)";
      });
      swatch.addEventListener("mouseleave", () => {
        swatch.style.transform = "scale(1)";
      });
      swatch.addEventListener("click", () => {
        board.setColor(color);
        colorInput.value = color;
      });
      colorGroup.appendChild(swatch);
    }
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "casuya-color-picker";
    colorInput.value = board.getColor();
    colorInput.title = "Custom color";
    colorInput.addEventListener("input", () => board.setColor(colorInput.value));
    colorGroup.appendChild(colorInput);
    row.appendChild(colorGroup);
    row.appendChild(sep());
    const widthGroup = document.createElement("div");
    widthGroup.className = "casuya-width-group";
    widthGroup.style.cssText = "display: flex; align-items: center; gap: 8px;";
    const widthLabel = document.createElement("span");
    widthLabel.style.cssText = "font-size: 11px; min-width: 22px; text-align: center; transition: color 0.15s ease;";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.value = String(board.getWidth());
    slider.style.cssText = "width: 72px; height: 4px; -webkit-appearance: none; appearance: none; border-radius: 2px; outline: none; cursor: pointer; transition: background 0.15s ease;";
    slider.addEventListener("input", () => {
      if (board.getTool() === "text") {
        board.setFontSize(Number(slider.value));
      } else {
        board.setWidth(Number(slider.value));
      }
    });
    const widthPreview = document.createElement("div");
    widthPreview.style.cssText = "width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;";
    const widthDot = document.createElement("div");
    widthDot.style.cssText = `background: ${board.getColor()}; border-radius: 50%; transition: all 0.15s ease;`;
    widthPreview.appendChild(widthDot);
    widthGroup.appendChild(widthLabel);
    widthGroup.appendChild(slider);
    widthGroup.appendChild(widthPreview);
    row.appendChild(widthGroup);
    row.appendChild(sep());
    const undoBtn = createActionBtn("\u21A9", "Undo (Ctrl+Z)", tooltipEl, () => board.undo(), board);
    const redoBtn = createActionBtn("\u21AA", "Redo (Ctrl+Shift+Z)", tooltipEl, () => board.redo(), board);
    const clearBtn = createActionBtn("\u2715", "Clear all", tooltipEl, () => board.clear(), board);
    const graphBtn = createActionBtn("\u229E", "Toggle graph paper", tooltipEl, () => {
      if (board.isGraphEnabled()) {
        board.disableGraph();
      } else {
        board.enableGraph();
      }
    }, board);
    const fillBtn = createActionBtn("\u25A3", "Fill: off", tooltipEl, () => {
      board.setFill(!board.getFill());
    }, board);
    const roughnessLabels = ["Clean", "Light", "Medium", "Heavy"];
    let roughnessIdx = board.getRoughness();
    const roughnessBtn = createActionBtn("\u2734", `Roughness: ${roughnessLabels[roughnessIdx]}`, tooltipEl, () => {
      roughnessIdx = (roughnessIdx + 1) % 4;
      board.setRoughness(roughnessIdx);
      roughnessBtn.textContent = "\u2734";
      roughnessBtn.title = `Roughness: ${roughnessLabels[roughnessIdx]}`;
    }, board);
    const groupBtn = createActionBtn("\u2261", "Group (Ctrl+G)", tooltipEl, () => board.groupSelected(), board);
    const ungroupBtn = createActionBtn("\u2262", "Ungroup (Ctrl+Shift+G)", tooltipEl, () => board.ungroupSelected(), board);
    const rotateBtn = createActionBtn("\u21BB", "Rotate 15\xB0 (Shift+R)", tooltipEl, () => board.rotateSelected(Math.PI / 12), board);
    const svgBtn = createActionBtn("\u2B1A", "Export SVG (Ctrl+Shift+S)", tooltipEl, () => {
      const svg = board.exportSVG();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = url;
      a2.download = "blackboard.svg";
      a2.click();
      URL.revokeObjectURL(url);
    }, board);
    const themeBtn = createActionBtn(board.getTheme() === "light" ? "\u263E" : "\u2600", "Toggle Theme", tooltipEl, () => {
      board.setTheme(board.getTheme() === "light" ? "dark" : "light");
    }, board);
    const saveBtn = createActionBtn("\u2193", "Save to browser", tooltipEl, () => {
      board.saveToStorage();
      board.showToast("\u2713 Saved");
    }, board);
    const applyStyleBtn = createActionBtn("\u270E", "Apply style to selection (Ctrl+Shift+F)", tooltipEl, () => {
      board.applyStyleToSelected();
    }, board);
    const actionGroup = document.createElement("div");
    actionGroup.className = "casuya-action-group";
    actionGroup.style.cssText = "display: flex; gap: 4px;";
    actionGroup.appendChild(undoBtn);
    actionGroup.appendChild(redoBtn);
    actionGroup.appendChild(clearBtn);
    actionGroup.appendChild(graphBtn);
    actionGroup.appendChild(fillBtn);
    actionGroup.appendChild(roughnessBtn);
    actionGroup.appendChild(groupBtn);
    actionGroup.appendChild(ungroupBtn);
    actionGroup.appendChild(rotateBtn);
    actionGroup.appendChild(svgBtn);
    actionGroup.appendChild(themeBtn);
    actionGroup.appendChild(saveBtn);
    actionGroup.appendChild(applyStyleBtn);
    row.appendChild(actionGroup);
    row.appendChild(sep());
    const zoomGroup = document.createElement("div");
    zoomGroup.className = "casuya-zoom-group";
    zoomGroup.style.cssText = "display: flex; align-items: center; gap: 2px;";
    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.className = "casuya-zoom-btn";
    zoomOutBtn.textContent = "\u2212";
    zoomOutBtn.title = "Zoom Out";
    zoomOutBtn.addEventListener("click", () => board.zoomTo(board.getZoom() / 1.25));
    bindActionHover(zoomOutBtn, "Zoom Out", tooltipEl, board);
    const zoomLabel = document.createElement("span");
    zoomLabel.className = "casuya-zoom-label";
    zoomLabel.textContent = Math.round(board.getZoom() * 100) + "%";
    zoomLabel.title = "Reset Zoom";
    zoomLabel.addEventListener("click", () => board.resetView());
    const zoomInBtn = document.createElement("button");
    zoomInBtn.className = "casuya-zoom-btn";
    zoomInBtn.textContent = "+";
    zoomInBtn.title = "Zoom In";
    zoomInBtn.addEventListener("click", () => board.zoomTo(board.getZoom() * 1.25));
    bindActionHover(zoomInBtn, "Zoom In", tooltipEl, board);
    zoomGroup.appendChild(zoomOutBtn);
    zoomGroup.appendChild(zoomLabel);
    zoomGroup.appendChild(zoomInBtn);
    row.appendChild(zoomGroup);
    bar.appendChild(row);
    bar.appendChild(tooltipEl);
    return { bar, toolButtons, undoBtn, redoBtn, graphBtn, fillBtn, themeBtn, roughnessBtn, groupBtn, ungroupBtn, rotateBtn, svgBtn, widthLabel, widthDot, colorInput, zoomLabel, applyStyleBtn };
  }
  function bindActionHover(btn, title, tooltipEl, board) {
    btn.addEventListener("mouseenter", () => {
      tooltipEl.textContent = title;
      const themeDef = TOOLBAR_THEMES[board.getTheme()];
      if (!btn.dataset.active) {
        btn.style.background = themeDef.btnHoverBg;
        btn.style.color = themeDef.btnHover;
      }
    });
    btn.addEventListener("mouseleave", () => {
      tooltipEl.textContent = "";
      const themeDef = TOOLBAR_THEMES[board.getTheme()];
      if (!btn.dataset.active) {
        btn.style.background = "transparent";
        btn.style.color = themeDef.btnColor;
      }
    });
    btn.addEventListener("focus", () => {
      tooltipEl.textContent = title;
    });
    btn.addEventListener("blur", () => {
      tooltipEl.textContent = "";
    });
  }
  function createActionBtn(icon, title, tooltipEl, onClick, board) {
    const btn = document.createElement("button");
    btn.className = "casuya-action-btn";
    btn.textContent = icon;
    btn.title = title;
    bindActionHover(btn, title, tooltipEl, board);
    btn.addEventListener("click", onClick);
    return btn;
  }
  function updateToolbarState(tb, activeTool, color, width, fillEnabled, theme, zoom, fontSize, roughness, graphEnabled) {
    const themeDef = TOOLBAR_THEMES[theme];
    tb.bar.style.background = themeDef.barBg;
    tb.bar.style.borderColor = themeDef.barBorder;
    for (const [tool, btn] of tb.toolButtons) {
      const active = tool === activeTool;
      btn.style.background = active ? themeDef.activeBg : "transparent";
      btn.style.color = active ? themeDef.activeColor : themeDef.btnColor;
      btn.style.borderColor = active ? themeDef.activeBorder : "transparent";
    }
    const slider = tb.widthLabel.nextElementSibling;
    if (activeTool === "text") {
      tb.widthLabel.textContent = `${fontSize ?? 18}px`;
      if (slider) {
        slider.min = "8";
        slider.max = "72";
        slider.value = String(fontSize ?? 18);
      }
    } else {
      tb.widthLabel.textContent = `${width}px`;
      if (slider) {
        slider.min = "1";
        slider.max = "20";
        slider.value = String(width);
      }
    }
    tb.widthLabel.style.color = themeDef.btnColor;
    if (slider) slider.style.background = themeDef.sep;
    tb.widthDot.style.background = color;
    tb.widthDot.style.width = `${Math.max(4, width)}px`;
    tb.widthDot.style.height = `${Math.max(4, width)}px`;
    tb.colorInput.value = color;
    tb.colorInput.style.borderColor = themeDef.sep;
    if (fillEnabled) {
      tb.fillBtn.style.background = themeDef.activeBg;
      tb.fillBtn.style.color = themeDef.activeColor;
      tb.fillBtn.title = "Fill: on";
      tb.fillBtn.dataset.active = "true";
    } else {
      tb.fillBtn.style.background = "transparent";
      tb.fillBtn.style.color = themeDef.btnColor;
      tb.fillBtn.title = "Fill: off";
      delete tb.fillBtn.dataset.active;
    }
    if (roughness !== void 0) {
      const roughnessLabels = ["Clean", "Light", "Medium", "Heavy"];
      tb.roughnessBtn.title = `Roughness: ${roughnessLabels[roughness]}`;
      if (roughness > 0) {
        tb.roughnessBtn.style.background = themeDef.activeBg;
        tb.roughnessBtn.style.color = themeDef.activeColor;
        tb.roughnessBtn.dataset.active = "true";
      } else {
        tb.roughnessBtn.style.background = "transparent";
        tb.roughnessBtn.style.color = themeDef.btnColor;
        delete tb.roughnessBtn.dataset.active;
      }
    }
    tb.themeBtn.textContent = theme === "light" ? "\u263E" : "\u2600";
    tb.themeBtn.style.color = themeDef.btnColor;
    tb.themeBtn.style.background = "transparent";
    if (graphEnabled) {
      tb.graphBtn.style.background = themeDef.activeBg;
      tb.graphBtn.style.color = themeDef.activeColor;
      tb.graphBtn.dataset.active = "true";
    } else {
      tb.graphBtn.style.background = "transparent";
      tb.graphBtn.style.color = themeDef.btnColor;
      delete tb.graphBtn.dataset.active;
    }
    tb.zoomLabel.textContent = Math.round(zoom * 100) + "%";
    tb.zoomLabel.style.color = themeDef.btnColor;
    const zoomBtns = tb.zoomLabel.parentElement?.querySelectorAll("button") || [];
    zoomBtns.forEach((b2) => {
      b2.style.color = themeDef.btnColor;
      b2.style.background = "transparent";
    });
    const actionBtns = [tb.undoBtn, tb.redoBtn, tb.graphBtn, tb.fillBtn, tb.roughnessBtn, tb.groupBtn, tb.ungroupBtn, tb.rotateBtn, tb.svgBtn, tb.themeBtn, tb.applyStyleBtn];
    for (const btn of actionBtns) {
      if (!btn) continue;
      if (!btn.dataset.active) {
        btn.style.color = themeDef.btnColor;
        btn.style.background = "transparent";
      }
    }
    const seps = tb.bar.querySelectorAll(".casuya-toolbar-sep");
    seps.forEach((s2) => {
      s2.style.background = themeDef.sep;
    });
    const tooltip = tb.bar.querySelector(".casuya-tooltip");
    if (tooltip) {
      tooltip.style.background = themeDef.tipBg;
      tooltip.style.borderColor = themeDef.tipBorder;
      tooltip.style.color = themeDef.tipColor;
    }
  }

  // src/Blackboard.ts
  var IS_MOBILE = () => window.innerWidth <= 640;
  function uid() {
    try {
      return crypto.randomUUID();
    } catch {
      return "xxxx-xxxx-xxxx".replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
    }
  }
  function isInInput(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    return el.closest('input, textarea, [contenteditable="true"], select') !== null;
  }
  var MOBILE_STYLES = `
.casuya-blackboard { border-radius: 8px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; }
.casuya-blackboard .casuya-toast { font-size: 11px !important; padding: 6px 12px !important; bottom: 8px !important; }
.casuya-blackboard .casuya-hint { font-size: 11px !important; }
.casuya-blackboard textarea { font-size: 16px !important; }
`;
  function injectMobileStyles() {
    if (document.getElementById("casuya-blackboard-mobile")) return;
    const style = document.createElement("style");
    style.id = "casuya-blackboard-mobile";
    style.textContent = MOBILE_STYLES;
    document.head.appendChild(style);
  }
  var THEMES = {
    light: { canvasBg: "#ffffff", gridColor: "#e2e8f0", gridAxisColor: "#94a3b8", gridLabelColor: "#64748b", hintColor: "#cbd5e1", selectionColor: "#3b82f6", selectionFill: "rgba(59, 130, 246, 0.1)" },
    dark: { canvasBg: "#1e1e2e", gridColor: "#313244", gridAxisColor: "#585b70", gridLabelColor: "#6c7086", hintColor: "#45475a", selectionColor: "#89b4fa", selectionFill: "rgba(137, 180, 250, 0.1)" }
  };
  function getSvgPathFromStroke(points) {
    if (points.length < 2) return "";
    const max = points.length - 1;
    let d2 = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
    for (let i2 = 1; i2 < max; i2++) {
      const p0 = points[i2];
      const p1 = points[i2 + 1];
      d2 += ` Q${p0[0].toFixed(2)},${p0[1].toFixed(2)} ${((p0[0] + p1[0]) / 2).toFixed(2)},${((p0[1] + p1[1]) / 2).toFixed(2)}`;
    }
    if (points.length > 1) {
      const last = points[points.length - 1];
      d2 += ` L${last[0].toFixed(2)},${last[1].toFixed(2)}`;
    }
    return d2;
  }
  var Blackboard = class _Blackboard {
    container;
    root;
    canvasWrapper;
    staticCanvas;
    liveCanvas;
    staticCtx;
    liveCtx;
    width;
    height;
    dpr;
    activeTool = "pen";
    strokeColor = "#1e293b";
    strokeWidth = 2;
    strokeOpacity = 1;
    fillEnabled = false;
    elements = [];
    undoStack = [];
    redoStack = [];
    static MAX_UNDO = 50;
    currentElement = null;
    isDrawing = false;
    graph;
    animFrameId = null;
    dirty = false;
    toolbar;
    listeners = /* @__PURE__ */ new Map();
    theme = "light";
    camera = { x: 0, y: 0, zoom: 1 };
    selectedIds = /* @__PURE__ */ new Set();
    dragState = null;
    isSpaceDown = false;
    isPanning = false;
    panStart = { x: 0, y: 0 };
    panCameraStart = { x: 0, y: 0 };
    textInput = null;
    editingTextId = null;
    editingTextOriginal = null;
    activePointerId = null;
    activePointerType = "mouse";
    lastPointerWorld = null;
    activePointers = /* @__PURE__ */ new Map();
    pinchStartDist = 0;
    pinchStartZoom = 1;
    pinchCenter = { x: 0, y: 0 };
    pinchStartCamera = { x: 0, y: 0 };
    contextMenu = null;
    longPressTimer = null;
    longPressStart = null;
    boundHandleImagePaste;
    boundHandleDragOver;
    boundHandleFileDrop;
    fontSize = 18;
    clipboard = [];
    roughness = 0;
    alignmentGuides = {};
    imageCache = /* @__PURE__ */ new Map();
    resizeObserver = null;
    marqueeStart = null;
    marqueeEnd = null;
    autosaveTimer = null;
    autosaveKey = "casuya-blackboard";
    dirtySinceSave = false;
    boundBeforeUnload = null;
    toastTimeout = null;
    usePressure = false;
    contextMenuKeyHandler = null;
    constructor(options) {
      this.container = options.container;
      this.width = options.width || this.container.clientWidth || 800;
      this.height = options.height || this.container.clientHeight || 600;
      this.dpr = window.devicePixelRatio || 1;
      this.theme = options.theme || "light";
      injectMobileStyles();
      this.boundHandleImagePaste = this.handleImagePaste.bind(this);
      this.boundHandleDragOver = this.handleDragOver.bind(this);
      this.boundHandleFileDrop = this.handleFileDrop.bind(this);
      this.graph = {
        enabled: options.graph?.enabled ?? false,
        spacing: options.graph?.spacing ?? 25,
        color: options.graph?.color ?? "#e2e8f0",
        showAxes: options.graph?.showAxes ?? true,
        showLabels: options.graph?.showLabels ?? true
      };
      this.strokeColor = options.color || this.strokeColor;
      this.strokeWidth = options.strokeWidth || this.strokeWidth;
      if (options.width) this.width = options.width;
      if (options.height) this.height = options.height;
      this.dpr = window.devicePixelRatio || 1;
      const mobile = IS_MOBILE();
      this.root = document.createElement("div");
      this.root.className = "casuya-blackboard";
      this.root.style.cssText = `
      display: flex;
      flex-direction: column;
      border-radius: ${mobile ? 8 : 12}px;
      overflow: hidden;
      box-shadow: ${mobile ? "0 2px 8px rgba(0,0,0,0.06)" : "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)"};
      background: ${THEMES[this.theme].canvasBg};
      font-family: system-ui, -apple-system, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      width: 100%;
      height: 100%;
      touch-action: none;
      -webkit-touch-callout: none;
    `;
      this.canvasWrapper = document.createElement("div");
      this.canvasWrapper.style.cssText = "position: relative; overflow: hidden; flex: 1;";
      this.staticCanvas = document.createElement("canvas");
      this.liveCanvas = document.createElement("canvas");
      [this.staticCanvas, this.liveCanvas].forEach((c2) => {
        c2.style.cssText = `
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        touch-action: none;
      `;
      });
      this.staticCanvas.style.zIndex = "0";
      this.liveCanvas.style.zIndex = "1";
      this.canvasWrapper.appendChild(this.staticCanvas);
      this.canvasWrapper.appendChild(this.liveCanvas);
      this.toolbar = createToolbar(this);
      this.root.appendChild(this.toolbar.bar);
      this.root.appendChild(this.canvasWrapper);
      this.container.appendChild(this.root);
      if (!this.container.style.position) {
        this.container.style.position = "relative";
      }
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width: w2, height: h2 } = entry.contentRect;
            if (w2 > 0 && h2 > 0) {
              this.resize(Math.floor(w2), Math.floor(h2));
            }
          }
        });
        this.resizeObserver.observe(this.container);
      }
      this.staticCtx = this.staticCanvas.getContext("2d");
      this.liveCtx = this.liveCanvas.getContext("2d");
      this.setupCanvases();
      this.attachEvents();
      this.setTool("pen");
      this.renderAll();
      this.updateToolbar();
      this.autosaveTimer = setInterval(() => {
        if (this.dirtySinceSave) {
          this.saveToStorage(this.autosaveKey);
          this.dirtySinceSave = false;
        }
      }, 3e4);
      this.boundBeforeUnload = (e2) => {
        if (this.dirtySinceSave) {
          this.saveToStorage(this.autosaveKey);
          e2.preventDefault();
          e2.returnValue = "";
        }
      };
      window.addEventListener("beforeunload", this.boundBeforeUnload);
      this.loadFromStorage(this.autosaveKey);
      setTimeout(() => this.showToast("Select a tool and start drawing"), 600);
    }
    pushUndo() {
      this.undoStack.push(JSON.parse(JSON.stringify(this.elements)));
      if (this.undoStack.length > _Blackboard.MAX_UNDO) this.undoStack.shift();
      this.redoStack = [];
    }
    commitUndo() {
    }
    screenToWorld(screenX, screenY) {
      return { x: screenX / this.camera.zoom + this.camera.x, y: screenY / this.camera.zoom + this.camera.y };
    }
    worldToScreen(wx, wy) {
      return { x: (wx - this.camera.x) * this.camera.zoom, y: (wy - this.camera.y) * this.camera.zoom };
    }
    snapToGrid(point) {
      if (!this.graph.enabled) return point;
      const s2 = this.graph.spacing;
      return { x: Math.round(point.x / s2) * s2, y: Math.round(point.y / s2) * s2 };
    }
    findNearestConnectionPoint(point, excludeId) {
      let bestDist = 30 / this.camera.zoom;
      let bestPoint = null;
      for (const el of this.elements) {
        if (el.id === excludeId) continue;
        const bounds = this.getElementBounds(el);
        const cx = bounds.x + bounds.w / 2;
        const cy = bounds.y + bounds.h / 2;
        const dist = Math.hypot(point.x - cx, point.y - cy);
        if (dist < bestDist) {
          bestDist = dist;
          bestPoint = { x: cx, y: cy };
        }
      }
      return bestPoint;
    }
    catmullRomInterpolate(points, tension = 0.5) {
      if (points.length < 2) return [...points];
      const result = [points[0]];
      const alpha = 0.5 + tension * 0.5;
      for (let i2 = 0; i2 < points.length - 1; i2++) {
        const p0 = points[Math.max(0, i2 - 1)];
        const p1 = points[i2];
        const p2 = points[Math.min(points.length - 1, i2 + 1)];
        const p3 = points[Math.min(points.length - 1, i2 + 2)];
        const steps = 3;
        for (let t2 = 1; t2 <= steps; t2++) {
          const tt = t2 / steps;
          const tt2 = tt * tt;
          const tt3 = tt2 * tt;
          const x2 = alpha * (2 * p1.x + (-p0.x + p2.x) * tt + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3);
          const y2 = alpha * (2 * p1.y + (-p0.y + p2.y) * tt + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3);
          result.push({ x: x2, y: y2 });
        }
      }
      return result;
    }
    findNearestEdgePoint(point, excludeId) {
      let bestDist = 30 / this.camera.zoom;
      let bestPoint = null;
      for (const el of this.elements) {
        if (el.id === excludeId) continue;
        if (el.tool === "pen" || el.tool === "eraser") continue;
        const bounds = this.getElementBounds(el);
        const rx = bounds.x;
        const ry = bounds.y;
        const rw = bounds.w;
        const rh = bounds.h;
        if (rw <= 0 && rh <= 0) continue;
        const candidates = [];
        if (rw > 0) {
          candidates.push({ x: rx, y: this.clamp(point.y, ry, ry + rh) });
          candidates.push({ x: rx + rw, y: this.clamp(point.y, ry, ry + rh) });
        }
        if (rh > 0) {
          candidates.push({ x: this.clamp(point.x, rx, rx + rw), y: ry });
          candidates.push({ x: this.clamp(point.x, rx, rx + rw), y: ry + rh });
        }
        for (const c2 of candidates) {
          const dist = Math.hypot(point.x - c2.x, point.y - c2.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestPoint = c2;
          }
        }
      }
      return bestPoint;
    }
    clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }
    findAlignmentGuides(movingBounds, excludeId) {
      const guides = {};
      const threshold = 5 / this.camera.zoom;
      const movingEdges = {
        left: movingBounds.x,
        right: movingBounds.x + movingBounds.w,
        cx: movingBounds.x + movingBounds.w / 2,
        top: movingBounds.y,
        bottom: movingBounds.y + movingBounds.h,
        cy: movingBounds.y + movingBounds.h / 2
      };
      let bestXDist = threshold;
      let bestYDist = threshold;
      for (const el of this.elements) {
        if (excludeId && el.id === excludeId) continue;
        if (this.selectedIds.has(el.id) && el.id !== excludeId) continue;
        const b2 = this.getElementBounds(el);
        const otherEdges = {
          left: b2.x,
          right: b2.x + b2.w,
          cx: b2.x + b2.w / 2,
          top: b2.y,
          bottom: b2.y + b2.h,
          cy: b2.y + b2.h / 2
        };
        const xChecks = [otherEdges.left, otherEdges.right, otherEdges.cx];
        const movingXChecks = [movingEdges.left, movingEdges.right, movingEdges.cx];
        for (const ox of xChecks) {
          for (const mx of movingXChecks) {
            const d2 = Math.abs(mx - ox);
            if (d2 < bestXDist) {
              bestXDist = d2;
              guides.x = ox - (mx - movingBounds.x);
            }
          }
        }
        const yChecks = [otherEdges.top, otherEdges.bottom, otherEdges.cy];
        const movingYChecks = [movingEdges.top, movingEdges.bottom, movingEdges.cy];
        for (const oy of yChecks) {
          for (const my of movingYChecks) {
            const d2 = Math.abs(my - oy);
            if (d2 < bestYDist) {
              bestYDist = d2;
              guides.y = oy - (my - movingBounds.y);
            }
          }
        }
      }
      return guides;
    }
    drawAlignmentGuides(ctx) {
      if (!this.alignmentGuides.x && !this.alignmentGuides.y) return;
      const vl = this.camera.x;
      const vt = this.camera.y;
      const vr = this.camera.x + this.width / this.camera.zoom;
      const vb = this.camera.y + this.height / this.camera.zoom;
      ctx.save();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1 / this.camera.zoom;
      ctx.setLineDash([4 / this.camera.zoom, 4 / this.camera.zoom]);
      if (this.alignmentGuides.x !== void 0) {
        const x2 = this.alignmentGuides.x;
        ctx.beginPath();
        ctx.moveTo(x2, vt);
        ctx.lineTo(x2, vb);
        ctx.stroke();
      }
      if (this.alignmentGuides.y !== void 0) {
        const y2 = this.alignmentGuides.y;
        ctx.beginPath();
        ctx.moveTo(vl, y2);
        ctx.lineTo(vr, y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }
    setupCanvases() {
      [this.staticCanvas, this.liveCanvas].forEach((c2) => {
        c2.width = this.width * this.dpr;
        c2.height = this.height * this.dpr;
        c2.getContext("2d").scale(this.dpr, this.dpr);
      });
    }
    onScrollDismiss = () => {
      this.dismissContextMenu();
    };
    onResizeDismiss = () => {
      this.dismissContextMenu();
    };
    attachEvents() {
      this.liveCanvas.addEventListener("pointerdown", this.onPointerDown);
      this.liveCanvas.addEventListener("pointermove", this.onPointerMove);
      this.liveCanvas.addEventListener("pointerup", this.onPointerUp);
      this.liveCanvas.addEventListener("pointerleave", this.onPointerUp);
      this.liveCanvas.addEventListener("pointercancel", this.onPointerUp);
      this.liveCanvas.addEventListener("wheel", this.onWheel, { passive: false });
      this.liveCanvas.addEventListener("contextmenu", this.onContextMenu);
      this.liveCanvas.addEventListener("dragover", this.boundHandleDragOver);
      this.liveCanvas.addEventListener("drop", this.boundHandleFileDrop);
      window.addEventListener("paste", this.boundHandleImagePaste);
      window.addEventListener("click", this.onWindowClick);
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("keyup", this.onKeyUp);
      window.addEventListener("scroll", this.onScrollDismiss, { capture: true, passive: true });
      window.addEventListener("resize", this.onResizeDismiss);
    }
    detachEvents() {
      this.liveCanvas.removeEventListener("pointerdown", this.onPointerDown);
      this.liveCanvas.removeEventListener("pointermove", this.onPointerMove);
      this.liveCanvas.removeEventListener("pointerup", this.onPointerUp);
      this.liveCanvas.removeEventListener("pointerleave", this.onPointerUp);
      this.liveCanvas.removeEventListener("pointercancel", this.onPointerUp);
      this.liveCanvas.removeEventListener("wheel", this.onWheel);
      this.liveCanvas.removeEventListener("contextmenu", this.onContextMenu);
      this.liveCanvas.removeEventListener("dragover", this.boundHandleDragOver);
      this.liveCanvas.removeEventListener("drop", this.boundHandleFileDrop);
      window.removeEventListener("paste", this.boundHandleImagePaste);
      window.removeEventListener("click", this.onWindowClick);
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
      window.removeEventListener("scroll", this.onScrollDismiss);
      window.removeEventListener("resize", this.onResizeDismiss);
    }
    getPoint = (e2) => {
      const rect = this.liveCanvas.getBoundingClientRect();
      const sx = e2.clientX - rect.left;
      const sy = e2.clientY - rect.top;
      return { ...this.screenToWorld(sx, sy), pressure: e2.pressure };
    };
    hitTest(worldPoint) {
      for (let i2 = this.elements.length - 1; i2 >= 0; i2--) {
        const el = this.elements[i2];
        const bounds = this.getElementBounds(el);
        const pad = (IS_MOBILE() ? 12 : 8) / this.camera.zoom;
        if (worldPoint.x >= bounds.x - pad && worldPoint.x <= bounds.x + bounds.w + pad && worldPoint.y >= bounds.y - pad && worldPoint.y <= bounds.y + bounds.h + pad) {
          if ((el.tool === "pen" || el.tool === "highlighter") && "points" in el) {
            const hitDist = Math.max(el.width * 2, 10) / this.camera.zoom;
            const rotation = el.rotation ?? 0;
            const center = this.getRotationCenter(el);
            const testPoint = rotation !== 0 ? this.rotatePoint(worldPoint, center, -rotation) : worldPoint;
            const hit = el.points.some(
              (p2) => Math.hypot(p2.x - testPoint.x, p2.y - testPoint.y) < hitDist
            );
            if (hit) return el;
            continue;
          }
          return el;
        }
      }
      return null;
    }
    getHandleAtPoint(worldPoint) {
      if (this.selectedIds.size !== 1) return null;
      const id = this.selectedIds.values().next().value;
      const el = this.elements.find((e2) => e2.id === id);
      if (!el) return null;
      const bounds = this.getElementBounds(el);
      const local = this.getLocalBounds(el);
      const rotation = el.rotation ?? 0;
      const pad = 6 / this.camera.zoom;
      const handleSize = (IS_MOBILE() ? 14 : 10) / this.camera.zoom;
      let handleDefs;
      if (rotation !== 0) {
        const corners = this.getRotatedCorners({ x: local.x - pad, y: local.y - pad, w: local.w + pad * 2, h: local.h + pad * 2 }, rotation);
        handleDefs = {
          "nw": corners[0],
          "ne": corners[1],
          "se": corners[2],
          "sw": corners[3],
          "n": { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 },
          "e": { x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2 },
          "s": { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 },
          "w": { x: (corners[3].x + corners[0].x) / 2, y: (corners[3].y + corners[0].y) / 2 }
        };
      } else {
        handleDefs = {
          "nw": { x: bounds.x - pad, y: bounds.y - pad },
          "n": { x: bounds.x + bounds.w / 2, y: bounds.y - pad },
          "ne": { x: bounds.x + bounds.w + pad, y: bounds.y - pad },
          "e": { x: bounds.x + bounds.w + pad, y: bounds.y + bounds.h / 2 },
          "se": { x: bounds.x + bounds.w + pad, y: bounds.y + bounds.h + pad },
          "s": { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h + pad },
          "sw": { x: bounds.x - pad, y: bounds.y + bounds.h + pad },
          "w": { x: bounds.x - pad, y: bounds.y + bounds.h / 2 }
        };
      }
      for (const [name, pos] of Object.entries(handleDefs)) {
        if (Math.abs(worldPoint.x - pos.x) < handleSize && Math.abs(worldPoint.y - pos.y) < handleSize) {
          return name;
        }
      }
      return null;
    }
    getElementBounds(el) {
      const local = this.getLocalBounds(el);
      const rotation = el.rotation ?? 0;
      if (rotation === 0) return local;
      const corners = this.getRotatedCorners(local, rotation);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p2 of corners) {
        if (p2.x < minX) minX = p2.x;
        if (p2.y < minY) minY = p2.y;
        if (p2.x > maxX) maxX = p2.x;
        if (p2.y > maxY) maxY = p2.y;
      }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    onPointerDown = (e2) => {
      this.dismissContextMenu();
      this.activePointers.set(e2.pointerId, { x: e2.clientX, y: e2.clientY, type: e2.pointerType });
      if (this.activePointers.size === 2) {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.currentElement = null;
          this.flushLive();
        }
        this.startPinch();
        return;
      }
      if (this.activePointers.size > 2) {
        return;
      }
      if (this.activePointerId !== null && this.activePointerId !== e2.pointerId) {
        if (e2.pointerType === "pen" && this.activePointerType === "touch") {
          this.releasePointerCapture();
        } else {
          return;
        }
      }
      e2.preventDefault();
      try {
        this.liveCanvas.setPointerCapture(e2.pointerId);
      } catch {
      }
      this.activePointerId = e2.pointerId;
      this.activePointerType = e2.pointerType;
      const point = this.getPoint(e2);
      if (e2.pointerType === "touch" && this.activeTool === "select") {
        this.longPressStart = point;
        this.longPressTimer = setTimeout(() => {
          if (this.longPressStart) {
            const hit = this.hitTest(this.longPressStart);
            if (hit) {
              if (!this.selectedIds.has(hit.id)) {
                this.selectedIds.clear();
                this.selectedIds.add(hit.id);
                this.renderAll();
              }
              this.isDrawing = false;
              this.currentElement = null;
              this.showContextMenu(e2.clientX, e2.clientY);
            }
          }
        }, 500);
      }
      if (this.activeTool === "hand" || this.isSpaceDown && !this.isPanning) {
        this.isPanning = true;
        this.panStart = { x: e2.clientX, y: e2.clientY };
        this.panCameraStart = { x: this.camera.x, y: this.camera.y };
        return;
      }
      if (this.activeTool === "select") {
        const handle = this.getHandleAtPoint(point);
        if (handle) {
          this.pushUndo();
          this.dragState = { type: "resize", startWorld: point, origElements: JSON.parse(JSON.stringify(this.elements)), handle };
          this.renderAll();
          return;
        }
        const hit = this.hitTest(point);
        if (hit) {
          if (e2.shiftKey) {
            if (this.selectedIds.has(hit.id)) {
              this.selectedIds.delete(hit.id);
            } else {
              if (hit.groupId) {
                for (const el of this.elements) {
                  if (el.groupId === hit.groupId) this.selectedIds.add(el.id);
                }
              } else {
                this.selectedIds.add(hit.id);
              }
            }
            this.renderAll();
            return;
          }
          if (!this.selectedIds.has(hit.id)) {
            this.selectedIds.clear();
            if (hit.groupId) {
              for (const el of this.elements) {
                if (el.groupId === hit.groupId) this.selectedIds.add(el.id);
              }
            } else {
              this.selectedIds.add(hit.id);
            }
          }
          this.pushUndo();
          this.dragState = { type: "move", startWorld: point, origElements: JSON.parse(JSON.stringify(this.elements)) };
        } else {
          if (!e2.shiftKey) this.selectedIds.clear();
          this.marqueeStart = point;
          this.marqueeEnd = point;
        }
        this.renderAll();
        return;
      }
      if (this.activeTool === "text") {
        const hit = this.hitTest(point);
        if (hit && hit.tool === "text") {
          this.startTextEdit(hit.position.x, hit.position.y, hit);
        } else {
          this.startTextEdit(point.x, point.y);
        }
        return;
      }
      if (this.activeTool === "eraser") {
        this.pushUndo();
        this.isDrawing = true;
        this.lastPointerWorld = point;
        this.renderAll();
        return;
      }
      this.isDrawing = true;
      if (e2.pointerType === "pen") this.usePressure = true;
      if (this.activeTool === "pen" || this.activeTool === "highlighter") {
        this.currentElement = {
          id: uid(),
          tool: this.activeTool === "highlighter" ? "highlighter" : "pen",
          points: [point],
          color: this.strokeColor,
          width: this.activeTool === "highlighter" ? this.strokeWidth * 3 : this.strokeWidth,
          opacity: this.activeTool === "highlighter" ? 0.3 : this.strokeOpacity
        };
      } else {
        const snapped = this.snapToGrid(point);
        this.currentElement = {
          id: uid(),
          tool: this.activeTool,
          start: snapped,
          end: snapped,
          color: this.strokeColor,
          width: this.strokeWidth,
          opacity: this.strokeOpacity,
          filled: this.fillEnabled,
          roughness: this.roughness
        };
      }
    };
    moveSingleElement(el, orig, dx, dy) {
      if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
        const s2 = el;
        const o2 = orig;
        s2.points = o2.points.map((p2) => ({ x: p2.x + dx, y: p2.y + dy, pressure: p2.pressure }));
      } else if (el.tool === "text") {
        const t2 = el;
        const o2 = orig;
        t2.position = { x: o2.position.x + dx, y: o2.position.y + dy };
      } else if (el.tool === "image") {
        const img = el;
        const o2 = orig;
        img.position = { x: o2.position.x + dx, y: o2.position.y + dy };
      } else {
        const s2 = el;
        const o2 = orig;
        s2.start = { x: o2.start.x + dx, y: o2.start.y + dy };
        s2.end = { x: o2.end.x + dx, y: o2.end.y + dy };
      }
    }
    getRotationCenter(el) {
      const bounds = this.getLocalBounds(el);
      return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
    }
    rotatePoint(point, center, angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos };
    }
    getLocalBounds(el) {
      if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
        const stroke = el;
        if (stroke.points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p2 of stroke.points) {
          if (p2.x < minX) minX = p2.x;
          if (p2.y < minY) minY = p2.y;
          if (p2.x > maxX) maxX = p2.x;
          if (p2.y > maxY) maxY = p2.y;
        }
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
      if (el.tool === "text") {
        const t2 = el;
        const ctx = this.staticCtx;
        ctx.font = `${t2.fontSize}px ${t2.fontFamily}`;
        const lines = t2.content.split("\n");
        const lineHeight = t2.fontSize * 1.4;
        let maxW = 0;
        for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line).width);
        return { x: t2.position.x, y: t2.position.y, w: Math.max(maxW, 20), h: Math.max(lines.length * lineHeight, t2.fontSize) };
      }
      if (el.tool === "image") {
        const img = el;
        return { x: img.position.x, y: img.position.y, w: img.width, h: img.height };
      }
      const s2 = el;
      const x2 = Math.min(s2.start.x, s2.end.x);
      const y2 = Math.min(s2.start.y, s2.end.y);
      return { x: x2, y: y2, w: Math.abs(s2.end.x - s2.start.x), h: Math.abs(s2.end.y - s2.start.y) };
    }
    getRotatedCorners(bounds, rotation) {
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const corners = [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.w, y: bounds.y },
        { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
        { x: bounds.x, y: bounds.y + bounds.h }
      ];
      return corners.map((p2) => {
        const dx = p2.x - cx;
        const dy = p2.y - cy;
        return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
      });
    }
    moveSelectedElements(dx, dy) {
      if (!this.dragState) return;
      const origMap = new Map(this.dragState.origElements.map((e2) => [e2.id, e2]));
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        const orig = origMap.get(id);
        if (!el || !orig) continue;
        this.moveSingleElement(el, orig, dx, dy);
      }
    }
    resizeSelected(handle, currentWorld) {
      if (!this.dragState) return;
      const origMap = new Map(this.dragState.origElements.map((e2) => [e2.id, e2]));
      const rawDx = currentWorld.x - this.dragState.startWorld.x;
      const rawDy = currentWorld.y - this.dragState.startWorld.y;
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        const orig = origMap.get(id);
        if (!el || !orig) continue;
        const rotation = el.rotation ?? 0;
        let dx = rawDx;
        let dy = rawDy;
        if (rotation !== 0) {
          const cos = Math.cos(-rotation);
          const sin = Math.sin(-rotation);
          dx = rawDx * cos - rawDy * sin;
          dy = rawDx * sin + rawDy * cos;
        }
        if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter" || el.tool === "text") {
          this.moveSingleElement(el, orig, dx, dy);
          continue;
        }
        if (el.tool === "image") {
          const img = el;
          const o3 = orig;
          let newX = o3.position.x;
          let newY = o3.position.y;
          let newW = o3.width;
          let newH = o3.height;
          if (handle === "nw") {
            newX = o3.position.x + dx;
            newY = o3.position.y + dy;
            newW = o3.width - dx;
            newH = o3.height - dy;
          } else if (handle === "ne") {
            newY = o3.position.y + dy;
            newW = o3.width + dx;
            newH = o3.height - dy;
          } else if (handle === "sw") {
            newX = o3.position.x + dx;
            newW = o3.width - dx;
            newH = o3.height + dy;
          } else if (handle === "se") {
            newW = o3.width + dx;
            newH = o3.height + dy;
          } else if (handle === "n") {
            newY = o3.position.y + dy;
            newH = o3.height - dy;
          } else if (handle === "s") {
            newH = o3.height + dy;
          } else if (handle === "e") {
            newW = o3.width + dx;
          } else if (handle === "w") {
            newX = o3.position.x + dx;
            newW = o3.width - dx;
          }
          if (newW > 0 && newH > 0) {
            img.position = { x: newX, y: newY };
            img.width = newW;
            img.height = newH;
          }
          continue;
        }
        const s2 = el;
        const o2 = orig;
        let newStart = { x: o2.start.x, y: o2.start.y };
        let newEnd = { x: o2.end.x, y: o2.end.y };
        if (handle === "nw") {
          newStart.x = o2.start.x + dx;
          newStart.y = o2.start.y + dy;
        }
        if (handle === "ne") {
          newEnd.x = o2.end.x + dx;
          newStart.y = o2.start.y + dy;
        }
        if (handle === "sw") {
          newStart.x = o2.start.x + dx;
          newEnd.y = o2.end.y + dy;
        }
        if (handle === "se") {
          newEnd.x = o2.end.x + dx;
          newEnd.y = o2.end.y + dy;
        }
        if (handle === "n") {
          newStart.y = o2.start.y + dy;
        }
        if (handle === "s") {
          newEnd.y = o2.end.y + dy;
        }
        if (handle === "e") {
          newEnd.x = o2.end.x + dx;
        }
        if (handle === "w") {
          newStart.x = o2.start.x + dx;
        }
        if (newStart.x > newEnd.x) {
          const tmp = newStart.x;
          newStart.x = newEnd.x;
          newEnd.x = tmp;
        }
        if (newStart.y > newEnd.y) {
          const tmp = newStart.y;
          newStart.y = newEnd.y;
          newEnd.y = tmp;
        }
        if (Math.abs(newEnd.x - newStart.x) < 5 || Math.abs(newEnd.y - newStart.y) < 5) continue;
        s2.start = newStart;
        s2.end = newEnd;
      }
    }
    startPinch() {
      const pts = Array.from(this.activePointers.values());
      this.pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      this.pinchStartZoom = this.camera.zoom;
      this.pinchStartCamera = { x: this.camera.x, y: this.camera.y };
      const rect = this.liveCanvas.getBoundingClientRect();
      this.pinchCenter = {
        x: (pts[0].x + pts[1].x) / 2 - rect.left,
        y: (pts[0].y + pts[1].y) / 2 - rect.top
      };
    }
    onPointerMove = (e2) => {
      if (this.activePointers.has(e2.pointerId)) {
        this.activePointers.set(e2.pointerId, { x: e2.clientX, y: e2.clientY, type: e2.pointerType });
      }
      if (this.longPressTimer && this.longPressStart) {
        const dx = e2.clientX - (this.activePointers.get(e2.pointerId)?.x ?? e2.clientX);
        const dy = e2.clientY - (this.activePointers.get(e2.pointerId)?.y ?? e2.clientY);
        if (Math.hypot(dx, dy) > 10) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
          this.longPressStart = null;
        }
      }
      if (this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const rect = this.liveCanvas.getBoundingClientRect();
        const curCenter = {
          x: (pts[0].x + pts[1].x) / 2 - rect.left,
          y: (pts[0].y + pts[1].y) / 2 - rect.top
        };
        if (this.pinchStartDist > 0) {
          const newZoom = this.pinchStartZoom * (dist / this.pinchStartDist);
          this.zoomTo(newZoom, this.pinchCenter);
          const panDx = (curCenter.x - this.pinchCenter.x) / this.camera.zoom;
          const panDy = (curCenter.y - this.pinchCenter.y) / this.camera.zoom;
          this.camera.x = this.pinchStartCamera.x - panDx;
          this.camera.y = this.pinchStartCamera.y - panDy;
          this.renderAll();
          this.updateToolbar();
        }
        return;
      }
      if (this.activePointerId !== null && this.activePointerId !== e2.pointerId) return;
      if (this.isPanning) {
        const dx = (e2.clientX - this.panStart.x) / this.camera.zoom;
        const dy = (e2.clientY - this.panStart.y) / this.camera.zoom;
        this.camera.x = this.panCameraStart.x - dx;
        this.camera.y = this.panCameraStart.y - dy;
        this.renderAll();
        return;
      }
      if (this.activeTool === "select" && this.dragState?.type === "resize") {
        const point = this.getPoint(e2);
        this.resizeSelected(this.dragState.handle, point);
        this.renderAll();
        return;
      }
      if (this.activeTool === "select" && this.dragState?.type === "move") {
        const point = this.getPoint(e2);
        const dx = point.x - this.dragState.startWorld.x;
        const dy = point.y - this.dragState.startWorld.y;
        this.moveSelectedElements(dx, dy);
        let combinedBounds = { x: Infinity, y: Infinity, w: 0, h: 0 };
        let hasBounds = false;
        for (const id of this.selectedIds) {
          const el = this.elements.find((e3) => e3.id === id);
          if (!el) continue;
          const b2 = this.getElementBounds(el);
          if (!hasBounds) {
            combinedBounds = { x: b2.x, y: b2.y, w: b2.w, h: b2.h };
            hasBounds = true;
          } else {
            const nx = Math.min(combinedBounds.x, b2.x);
            const ny = Math.min(combinedBounds.y, b2.y);
            combinedBounds = {
              x: nx,
              y: ny,
              w: Math.max(combinedBounds.x + combinedBounds.w, b2.x + b2.w) - nx,
              h: Math.max(combinedBounds.y + combinedBounds.h, b2.y + b2.h) - ny
            };
          }
        }
        if (hasBounds) {
          this.alignmentGuides = this.findAlignmentGuides(combinedBounds);
        }
        this.renderAll();
        return;
      }
      if (this.activeTool === "select" && this.marqueeStart) {
        this.marqueeEnd = this.getPoint(e2);
        this.renderAll();
        return;
      }
      if (this.activeTool === "eraser" && this.isDrawing) {
        const point = this.getPoint(e2);
        this.lastPointerWorld = point;
        const hitDist = IS_MOBILE() ? this.strokeWidth * 4 : this.strokeWidth * 2.5;
        const toRemove = [];
        for (const el of this.elements) {
          if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
            const stroke = el;
            const rotation = stroke.rotation ?? 0;
            const center = this.getRotationCenter(stroke);
            const localPoint = rotation !== 0 ? this.rotatePoint(point, center, -rotation) : point;
            const hit = stroke.points.some((p2) => Math.hypot(p2.x - localPoint.x, p2.y - localPoint.y) < hitDist);
            if (hit) toRemove.push(el.id);
          } else {
            const bounds = this.getElementBounds(el);
            const pad = hitDist;
            if (point.x >= bounds.x - pad && point.x <= bounds.x + bounds.w + pad && point.y >= bounds.y - pad && point.y <= bounds.y + bounds.h + pad) {
              toRemove.push(el.id);
            }
          }
        }
        if (toRemove.length > 0) {
          this.elements = this.elements.filter((e3) => !toRemove.includes(e3.id));
          this.renderStatic();
          this.emit("change");
        }
        this.dirty = true;
        if (!this.animFrameId) this.animFrameId = requestAnimationFrame(this.flush);
        return;
      }
      if (!this.isDrawing || !this.currentElement) return;
      e2.preventDefault();
      if (this.currentElement.tool === "pen" || this.currentElement.tool === "highlighter") {
        const events = e2.getCoalescedEvents?.() ?? [e2];
        for (const ce of events) {
          const p2 = this.getPoint(ce);
          const pts = this.currentElement.points;
          const last = pts[pts.length - 1];
          if (Math.hypot(p2.x - last.x, p2.y - last.y) >= 1) {
            pts.push(p2);
          }
        }
      } else {
        const point = this.getPoint(e2);
        const shape = this.currentElement;
        let endPoint = this.snapToGrid(point);
        if (shape.tool === "arrow") {
          const conn = this.findNearestEdgePoint(endPoint, this.currentElement?.id);
          if (conn) endPoint = conn;
        }
        shape.end = endPoint;
        if (e2.shiftKey && "start" in this.currentElement) {
          const dx = shape.end.x - shape.start.x;
          const dy = shape.end.y - shape.start.y;
          if (shape.tool === "rect") {
            const size = Math.max(Math.abs(dx), Math.abs(dy));
            shape.end = { x: shape.start.x + size * Math.sign(dx || 1), y: shape.start.y + size * Math.sign(dy || 1) };
          } else if (shape.tool === "circle") {
            const size = Math.max(Math.abs(dx), Math.abs(dy));
            shape.end = { x: shape.start.x + size * Math.sign(dx || 1), y: shape.start.y + size * Math.sign(dy || 1) };
          } else if (shape.tool === "line" || shape.tool === "arrow") {
            const angle = Math.atan2(dy, dx);
            const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            const len = Math.hypot(dx, dy);
            shape.end = { x: shape.start.x + len * Math.cos(snapped), y: shape.start.y + len * Math.sin(snapped) };
          }
        }
      }
      this.dirty = true;
      if (!this.animFrameId) {
        this.animFrameId = requestAnimationFrame(this.flush);
      }
    };
    onPointerUp = (e2) => {
      this.activePointers.delete(e2.pointerId);
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.longPressStart = null;
      if (this.activePointerId !== null && this.activePointerId !== e2.pointerId) return;
      this.activePointerId = null;
      this.activePointerType = "mouse";
      if (this.isPanning) {
        this.isPanning = false;
        return;
      }
      if (this.activeTool === "select" && this.dragState) {
        this.alignmentGuides = {};
        this.dragState = null;
        this.emit("change");
        return;
      }
      if (this.activeTool === "select" && this.marqueeStart && this.marqueeEnd) {
        const mx = Math.min(this.marqueeStart.x, this.marqueeEnd.x);
        const my = Math.min(this.marqueeStart.y, this.marqueeEnd.y);
        const mw = Math.abs(this.marqueeEnd.x - this.marqueeStart.x);
        const mh = Math.abs(this.marqueeEnd.y - this.marqueeStart.y);
        if (mw > 2 / this.camera.zoom || mh > 2 / this.camera.zoom) {
          for (const el of this.elements) {
            const b2 = this.getElementBounds(el);
            if (b2.x >= mx && b2.y >= my && b2.x + b2.w <= mx + mw && b2.y + b2.h <= my + mh) {
              this.selectedIds.add(el.id);
            }
          }
        }
        this.marqueeStart = null;
        this.marqueeEnd = null;
        this.renderAll();
        return;
      }
      this.marqueeStart = null;
      this.marqueeEnd = null;
      if (this.activeTool === "eraser" && this.isDrawing) {
        this.isDrawing = false;
        this.lastPointerWorld = null;
        this.renderAll();
        this.updateToolbar();
        return;
      }
      if (!this.isDrawing || !this.currentElement) return;
      this.isDrawing = false;
      if (this.currentElement.tool === "pen" || this.currentElement.tool === "highlighter") {
        if (this.currentElement.points.length < 2) {
          const p2 = this.currentElement.points[0];
          this.currentElement.points = [
            { x: p2.x, y: p2.y, pressure: 0.5 },
            { x: p2.x + 0.5, y: p2.y + 0.5, pressure: 0.5 }
          ];
        } else {
          this.currentElement.points = this.catmullRomInterpolate(this.currentElement.points, 0.5);
        }
      }
      this.commitUndo();
      this.elements.push(this.currentElement);
      this.currentElement = null;
      this.flushLive();
      this.renderStatic();
      this.updateToolbar();
      this.emit("change");
    };
    onWheel = (e2) => {
      e2.preventDefault();
      const rect = this.liveCanvas.getBoundingClientRect();
      const sx = e2.clientX - rect.left;
      const sy = e2.clientY - rect.top;
      const worldBefore = this.screenToWorld(sx, sy);
      const delta = -e2.deltaY;
      const factor = Math.pow(1.001, delta);
      this.camera.zoom = Math.max(0.1, Math.min(10, this.camera.zoom * factor));
      const worldAfter = this.screenToWorld(sx, sy);
      this.camera.x += worldBefore.x - worldAfter.x;
      this.camera.y += worldBefore.y - worldAfter.y;
      this.renderAll();
      this.updateToolbar();
    };
    onKeyDown = (e2) => {
      if (this.textInput) return;
      if (isInInput(e2.target)) return;
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "z") {
        e2.preventDefault();
        e2.shiftKey ? this.redo() : this.undo();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "y") {
        e2.preventDefault();
        this.redo();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && (e2.key === "=" || e2.key === "+")) {
        e2.preventDefault();
        this.zoomTo(this.camera.zoom * 1.1);
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "-") {
        e2.preventDefault();
        this.zoomTo(this.camera.zoom * 0.9);
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "0") {
        e2.preventDefault();
        this.resetView();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "d") {
        e2.preventDefault();
        this.duplicateSelected();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "c") {
        e2.preventDefault();
        this.copySelected();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "v") {
        e2.preventDefault();
        this.pasteClipboard();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "x") {
        e2.preventDefault();
        this.copySelected();
        this.deleteSelected();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "a") {
        e2.preventDefault();
        this.selectAll();
        return;
      }
      if (e2.key === "Escape") {
        e2.preventDefault();
        if (this.contextMenu) {
          this.dismissContextMenu();
          return;
        }
        if (this.selectedIds.size > 0) {
          this.selectedIds.clear();
          this.renderAll();
        } else if (this.isDrawing && this.currentElement) {
          this.isDrawing = false;
          this.currentElement = null;
          this.flushLive();
        }
        return;
      }
      if (e2.key === " ") {
        e2.preventDefault();
        if (!this.isSpaceDown) {
          this.isSpaceDown = true;
          this.liveCanvas.style.cursor = "grab";
        }
        return;
      }
      if (e2.key === "Delete" || e2.key === "Backspace") {
        e2.preventDefault();
        this.deleteSelected();
        return;
      }
      if (!e2.ctrlKey && !e2.metaKey && !e2.altKey) {
        const nudge = e2.shiftKey ? 10 : 1;
        if (e2.key === "ArrowLeft") {
          e2.preventDefault();
          this.nudgeSelected(-nudge, 0);
          return;
        }
        if (e2.key === "ArrowRight") {
          e2.preventDefault();
          this.nudgeSelected(nudge, 0);
          return;
        }
        if (e2.key === "ArrowUp") {
          e2.preventDefault();
          this.nudgeSelected(0, -nudge);
          return;
        }
        if (e2.key === "ArrowDown") {
          e2.preventDefault();
          this.nudgeSelected(0, nudge);
          return;
        }
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "]") {
        e2.preventDefault();
        if (e2.shiftKey) this.bringToFront();
        else this.bringForward();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "[") {
        e2.preventDefault();
        if (e2.shiftKey) this.sendToBack();
        else this.sendBackward();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "g" && !e2.shiftKey) {
        e2.preventDefault();
        this.groupSelected();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.shiftKey && e2.key === "G") {
        e2.preventDefault();
        this.ungroupSelected();
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.shiftKey && e2.key === "S") {
        e2.preventDefault();
        const svg = this.exportSVG();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a2 = document.createElement("a");
        a2.href = url;
        a2.download = "blackboard.svg";
        a2.click();
        URL.revokeObjectURL(url);
        return;
      }
      if ((e2.ctrlKey || e2.metaKey) && e2.shiftKey && e2.key === "F") {
        e2.preventDefault();
        this.applyStyleToSelected();
        return;
      }
      if (e2.shiftKey && e2.key === "R") {
        e2.preventDefault();
        this.rotateSelected(Math.PI / 12);
        return;
      }
      if (e2.key === "?") {
        e2.preventDefault();
        this.showShortcutHelp();
        return;
      }
      const keyToolMap = {
        "v": "select",
        "h": "hand",
        "p": "pen",
        "m": "highlighter",
        "t": "text",
        "l": "line",
        "r": "rect",
        "o": "circle",
        "a": "arrow",
        "e": "eraser"
      };
      if ((e2.ctrlKey || e2.metaKey) && !["z", "+", "-", "0", "d", "c", "v", "x", "a", "g", "]", "["].includes(e2.key.toLowerCase())) {
        return;
      }
      const tool = keyToolMap[e2.key.toLowerCase()];
      if (tool) {
        this.commitText();
        this.setTool(tool);
      }
    };
    onKeyUp = (e2) => {
      if (e2.key === " ") {
        this.isSpaceDown = false;
        this.setTool(this.activeTool);
      }
    };
    onContextMenu = (e2) => {
      e2.preventDefault();
      const point = this.getPoint(e2);
      const hit = this.hitTest(point);
      if (hit) {
        if (!this.selectedIds.has(hit.id)) {
          this.selectedIds.clear();
          this.selectedIds.add(hit.id);
          this.renderAll();
        }
      }
      this.showContextMenu(e2.clientX, e2.clientY);
    };
    showContextMenu(clientX, clientY) {
      this.dismissContextMenu();
      const mobile = IS_MOBILE();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const menuW = mobile ? 150 : 160;
      let left = clientX;
      let top = clientY;
      if (left + menuW > vw) left = vw - menuW - 8;
      if (left < 8) left = 8;
      if (top < 8) top = 8;
      const hasSelection = this.selectedIds.size > 0;
      const hasOne = this.selectedIds.size === 1;
      const menu = document.createElement("div");
      menu.setAttribute("role", "menu");
      menu.style.cssText = `
      position: fixed; left: ${left}px; top: ${top}px;
      background: ${THEMES[this.theme].canvasBg}; border: 1px solid ${THEMES[this.theme].gridColor};
      border-radius: 8px; padding: 4px; z-index: 1000; min-width: ${menuW}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: system-ui, sans-serif;
      max-height: ${vh - 16}px; overflow-y: auto;
    `;
      const items = [
        { label: "Delete", shortcut: "Del", action: () => this.deleteSelected(), disabled: !hasSelection },
        { label: "Duplicate", shortcut: "Ctrl+D", action: () => this.duplicateSelected(), disabled: !hasSelection },
        { label: "Group", shortcut: "Ctrl+G", action: () => this.groupSelected(), disabled: this.selectedIds.size < 2 },
        { label: "Ungroup", shortcut: "Ctrl+Shift+G", action: () => this.ungroupSelected(), disabled: !hasSelection },
        { type: "separator" },
        { label: "Bring Forward", shortcut: "]", action: () => this.bringForward(), disabled: !hasOne },
        { label: "Send Backward", shortcut: "[", action: () => this.sendBackward(), disabled: !hasOne },
        { label: "Bring to Front", shortcut: "Ctrl+]", action: () => this.bringToFront(), disabled: !hasOne },
        { label: "Send to Back", shortcut: "Ctrl+[", action: () => this.sendToBack(), disabled: !hasOne },
        { type: "separator" },
        { label: "Select All", shortcut: "Ctrl+A", action: () => this.selectAll(), disabled: this.elements.length === 0 }
      ];
      let firstItem = null;
      for (const item of items) {
        if (item.type === "separator") {
          const sep2 = document.createElement("div");
          sep2.style.cssText = `height: 1px; background: ${THEMES[this.theme].gridColor}; margin: 4px 0;`;
          menu.appendChild(sep2);
          continue;
        }
        const btn = document.createElement("button");
        btn.setAttribute("role", "menuitem");
        if (item.disabled) {
          btn.disabled = true;
          btn.style.cssText = `
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: ${mobile ? 10 : 6}px 12px; border: none; background: transparent;
          cursor: default; font-size: ${mobile ? 15 : 13}px; border-radius: 4px;
          color: ${THEMES[this.theme].gridLabelColor}; opacity: 0.35; font-family: inherit;
        `;
        } else {
          btn.style.cssText = `
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: ${mobile ? 10 : 6}px 12px; border: none; background: transparent;
          cursor: pointer; font-size: ${mobile ? 15 : 13}px; border-radius: 4px;
          color: ${THEMES[this.theme].gridLabelColor}; font-family: inherit;
        `;
          btn.addEventListener("mouseenter", () => {
            btn.style.background = THEMES[this.theme].gridColor;
          });
          btn.addEventListener("mouseleave", () => {
            btn.style.background = "transparent";
          });
          btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            item.action();
            this.dismissContextMenu();
          });
          if (!firstItem) firstItem = btn;
        }
        btn.innerHTML = `<span>${item.label}</span><span style="font-size: 11px; opacity: 0.5;">${item.shortcut}</span>`;
        menu.appendChild(btn);
      }
      document.body.appendChild(menu);
      this.contextMenu = menu;
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.bottom > vh - 8) {
        menu.style.top = Math.max(8, vh - menuRect.height - 8) + "px";
      }
      if (!firstItem) firstItem = menu.querySelector("button:not([disabled])");
      if (firstItem) firstItem.focus();
      const onKey = (e2) => {
        if (e2.key === "Escape") {
          this.dismissContextMenu();
          return;
        }
        const btns = [...menu.querySelectorAll("button:not([disabled])")];
        const idx = btns.indexOf(document.activeElement);
        if (e2.key === "ArrowDown") {
          e2.preventDefault();
          btns[(idx + 1) % btns.length]?.focus();
        }
        if (e2.key === "ArrowUp") {
          e2.preventDefault();
          btns[(idx - 1 + btns.length) % btns.length]?.focus();
        }
      };
      menu.addEventListener("keydown", onKey);
      this.contextMenuKeyHandler = onKey;
    }
    dismissContextMenu() {
      if (this.contextMenu) {
        if (this.contextMenuKeyHandler) {
          this.contextMenu.removeEventListener("keydown", this.contextMenuKeyHandler);
          this.contextMenuKeyHandler = null;
        }
        this.contextMenu.remove();
        this.contextMenu = null;
      }
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.longPressStart = null;
    }
    onWindowClick = () => {
      this.dismissContextMenu();
    };
    deleteSelected() {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      this.commitUndo();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (el && el.tool === "image") this.imageCache.delete(el.src);
      }
      this.elements = this.elements.filter((e2) => !this.selectedIds.has(e2.id));
      this.selectedIds.clear();
      this.renderAll();
      this.emit("change");
    }
    releasePointerCapture() {
      if (this.activePointerId !== null) {
        try {
          this.liveCanvas.releasePointerCapture(this.activePointerId);
        } catch {
        }
        const upEvt = new PointerEvent("pointerup", { pointerId: this.activePointerId });
        this.onPointerUp(upEvt);
      }
    }
    startTextEdit(worldX, worldY, existing) {
      this.commitText();
      this.editingTextOriginal = existing ? JSON.parse(JSON.stringify(existing)) : null;
      const screen = this.worldToScreen(worldX, worldY);
      const ta = document.createElement("textarea");
      const mobile = IS_MOBILE();
      const fontSize = existing?.fontSize ?? this.fontSize;
      const taFontSize = Math.max(mobile ? 16 : 0, fontSize * this.camera.zoom);
      ta.style.cssText = `
      position: absolute; left: ${screen.x}px; top: ${screen.y}px;
      min-width: ${mobile ? 80 : 60}px; min-height: 28px;
      background: transparent; border: 2px solid ${THEMES[this.theme].selectionColor};
      border-radius: 4px; padding: 4px 6px;
      font-size: ${taFontSize}px;
      font-family: ${existing?.fontFamily ?? "system-ui, -apple-system, sans-serif"};
      color: ${existing?.color ?? this.strokeColor};
      outline: none; resize: none; overflow: hidden;
      z-index: 10; box-sizing: border-box;
      line-height: 1.4; white-space: pre-wrap;
    `;
      ta.value = existing?.content ?? "";
      ta.addEventListener("blur", () => this.commitText());
      ta.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          this.cancelText();
          return;
        }
        ev.stopPropagation();
      });
      ta.addEventListener("input", () => {
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
        ta.style.width = Math.max(60, ta.scrollWidth + 10) + "px";
      });
      this.canvasWrapper.appendChild(ta);
      this.textInput = ta;
      this.editingTextId = existing?.id ?? null;
      if (existing) {
        this.elements = this.elements.filter((e2) => e2.id !== existing.id);
        this.renderStatic();
      }
      setTimeout(() => {
        ta.focus();
        ta.style.height = ta.scrollHeight + "px";
      }, 0);
    }
    cancelText() {
      if (!this.textInput) return;
      const ta = this.textInput;
      this.textInput = null;
      ta.remove();
      if (this.editingTextOriginal) {
        this.elements.push(this.editingTextOriginal);
        this.renderStatic();
        this.emit("change");
      }
      this.editingTextId = null;
      this.editingTextOriginal = null;
    }
    commitText() {
      if (!this.textInput) return;
      const ta = this.textInput;
      const content = ta.value.trim();
      this.textInput = null;
      ta.remove();
      this.editingTextOriginal = null;
      if (content) {
        const screenX = parseFloat(ta.style.left);
        const screenY = parseFloat(ta.style.top);
        const world = this.screenToWorld(screenX, screenY);
        const prevEl = this.editingTextId ? this.elements.find((e2) => e2.id === this.editingTextId) : null;
        const el = {
          id: this.editingTextId ?? uid(),
          tool: "text",
          position: world,
          content,
          fontSize: prevEl && "fontSize" in prevEl ? prevEl.fontSize : this.fontSize,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: ta.style.color,
          width: 1,
          opacity: this.strokeOpacity
        };
        this.commitUndo();
        this.elements.push(el);
        this.renderStatic();
        this.emit("change");
      }
      this.editingTextId = null;
    }
    flush = () => {
      this.animFrameId = null;
      if (!this.dirty) return;
      this.dirty = false;
      this.flushLive();
    };
    renderAll() {
      this.renderStatic();
      this.flushLive();
    }
    hintEl = null;
    renderStatic() {
      const ctx = this.staticCtx;
      const t2 = THEMES[this.theme];
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = t2.canvasBg;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.save();
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, -this.camera.y);
      if (this.graph.enabled) this.drawGraph(ctx);
      for (const el of this.elements) this.drawElement(ctx, el);
      ctx.restore();
      if (this.elements.length === 0 && !this.currentElement) {
        if (!this.hintEl) {
          this.hintEl = document.createElement("div");
          this.hintEl.className = "casuya-hint";
          this.hintEl.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;user-select:none;font-family:system-ui,sans-serif;`;
          this.canvasWrapper.appendChild(this.hintEl);
        }
        const hintSize = IS_MOBILE() ? 11 : 14;
        this.hintEl.textContent = IS_MOBILE() ? "Tap a tool to start" : "Choose a tool and start drawing";
        this.hintEl.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;user-select:none;font-family:system-ui,sans-serif;font-size:${hintSize}px;color:${t2.hintColor};`;
        this.hintEl.style.display = "";
      } else if (this.hintEl) {
        this.hintEl.style.display = "none";
      }
    }
    flushLive() {
      const ctx = this.liveCtx;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.save();
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, -this.camera.y);
      if (this.currentElement) this.drawElement(ctx, this.currentElement);
      this.drawSelectionIndicators(ctx);
      this.drawAlignmentGuides(ctx);
      if (this.marqueeStart && this.marqueeEnd) {
        const t2 = THEMES[this.theme];
        const x2 = Math.min(this.marqueeStart.x, this.marqueeEnd.x);
        const y2 = Math.min(this.marqueeStart.y, this.marqueeEnd.y);
        const w2 = Math.abs(this.marqueeEnd.x - this.marqueeStart.x);
        const h2 = Math.abs(this.marqueeEnd.y - this.marqueeStart.y);
        ctx.fillStyle = t2.selectionFill;
        ctx.fillRect(x2, y2, w2, h2);
        ctx.strokeStyle = t2.selectionColor;
        ctx.lineWidth = 1 / this.camera.zoom;
        ctx.setLineDash([4 / this.camera.zoom, 4 / this.camera.zoom]);
        ctx.strokeRect(x2, y2, w2, h2);
        ctx.setLineDash([]);
      }
      if (this.activeTool === "eraser" && this.lastPointerWorld) {
        const eraserRadius = IS_MOBILE() ? this.strokeWidth * 3.5 : this.strokeWidth * 2.5;
        ctx.beginPath();
        ctx.arc(this.lastPointerWorld.x, this.lastPointerWorld.y, eraserRadius, 0, Math.PI * 2);
        ctx.strokeStyle = THEMES[this.theme].selectionColor;
        ctx.lineWidth = 1 / this.camera.zoom;
        ctx.stroke();
      }
      ctx.restore();
    }
    drawGraph(ctx) {
      const { spacing, showAxes, showLabels } = this.graph;
      const t2 = THEMES[this.theme];
      const vl = this.camera.x;
      const vt = this.camera.y;
      const vr = this.camera.x + this.width / this.camera.zoom;
      const vb = this.camera.y + this.height / this.camera.zoom;
      const startX = Math.floor(vl / spacing) * spacing;
      const endX = Math.ceil(vr / spacing) * spacing;
      const startY = Math.floor(vt / spacing) * spacing;
      const endY = Math.ceil(vb / spacing) * spacing;
      ctx.strokeStyle = this.graph.color || t2.gridColor;
      ctx.lineWidth = 0.5 / this.camera.zoom;
      ctx.beginPath();
      for (let x2 = startX; x2 <= endX; x2 += spacing) {
        ctx.moveTo(x2, vt);
        ctx.lineTo(x2, vb);
      }
      for (let y2 = startY; y2 <= endY; y2 += spacing) {
        ctx.moveTo(vl, y2);
        ctx.lineTo(vr, y2);
      }
      ctx.stroke();
      if (showAxes) {
        ctx.strokeStyle = t2.gridAxisColor;
        ctx.lineWidth = 1.5 / this.camera.zoom;
        ctx.beginPath();
        if (0 >= vt && 0 <= vb) {
          ctx.moveTo(vl, 0);
          ctx.lineTo(vr, 0);
        }
        if (0 >= vl && 0 <= vr) {
          ctx.moveTo(0, vt);
          ctx.lineTo(0, vb);
        }
        ctx.stroke();
        if (showLabels) {
          ctx.fillStyle = t2.gridLabelColor;
          ctx.font = `${10 / this.camera.zoom}px system-ui, sans-serif`;
          const labelOffset = spacing;
          ctx.textAlign = "center";
          if (0 >= vt && 0 <= vb) {
            for (let x2 = startX; x2 <= endX; x2 += spacing * 2) {
              if (Math.abs(x2) < labelOffset) continue;
              ctx.fillText(String(x2 / spacing), x2, 14 / this.camera.zoom);
            }
          }
          ctx.textAlign = "right";
          if (0 >= vl && 0 <= vr) {
            for (let y2 = startY; y2 <= endY; y2 += spacing * 2) {
              if (Math.abs(y2) < labelOffset) continue;
              ctx.fillText(String(-y2 / spacing), -6 / this.camera.zoom, y2 + 4 / this.camera.zoom);
            }
          }
        }
      }
    }
    drawElement(ctx, el) {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      const rotation = el.rotation ?? 0;
      if (rotation !== 0) {
        const center = this.getRotationCenter(el);
        ctx.translate(center.x, center.y);
        ctx.rotate(rotation);
        ctx.translate(-center.x, -center.y);
      }
      if (el.tool === "pen" || el.tool === "eraser") {
        this.drawFreehand(ctx, el);
      } else if (el.tool === "text") {
        this.drawText(ctx, el);
      } else if (el.tool === "image") {
        this.drawImage(ctx, el);
      } else {
        this.drawShape(ctx, el);
      }
      ctx.restore();
    }
    drawFreehand(ctx, stroke) {
      const { points, color, width, tool } = stroke;
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
      } else if (tool === "highlighter") {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = color;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = color;
      }
      const outlinePoints = R(
        points.map((p2) => [p2.x, p2.y, p2.pressure ?? 0.5]),
        { size: width, thinning: tool === "highlighter" ? 0 : 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: tool === "highlighter" ? false : !this.usePressure }
      );
      const pathData = getSvgPathFromStroke(outlinePoints);
      if (pathData) ctx.fill(new Path2D(pathData));
      ctx.globalCompositeOperation = "source-over";
    }
    drawText(ctx, el) {
      ctx.fillStyle = el.color;
      ctx.font = `${el.fontSize}px ${el.fontFamily}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const maxWidth = el.width > 1 ? el.width : 300;
      const rawLines = el.content.split("\n");
      const wrappedLines = [];
      for (const rawLine of rawLines) {
        if (rawLine === "") {
          wrappedLines.push("");
          continue;
        }
        const words = rawLine.split(" ");
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        wrappedLines.push(currentLine);
      }
      const lineHeight = el.fontSize * 1.4;
      for (let i2 = 0; i2 < wrappedLines.length; i2++) {
        ctx.fillText(wrappedLines[i2], el.position.x, el.position.y + i2 * lineHeight);
      }
    }
    roundRect(ctx, x2, y2, w2, h2, r2) {
      r2 = Math.min(r2, w2 / 2, h2 / 2);
      ctx.beginPath();
      ctx.moveTo(x2 + r2, y2);
      ctx.lineTo(x2 + w2 - r2, y2);
      ctx.quadraticCurveTo(x2 + w2, y2, x2 + w2, y2 + r2);
      ctx.lineTo(x2 + w2, y2 + h2 - r2);
      ctx.quadraticCurveTo(x2 + w2, y2 + h2, x2 + w2 - r2, y2 + h2);
      ctx.lineTo(x2 + r2, y2 + h2);
      ctx.quadraticCurveTo(x2, y2 + h2, x2, y2 + h2 - r2);
      ctx.lineTo(x2, y2 + r2);
      ctx.quadraticCurveTo(x2, y2, x2 + r2, y2);
      ctx.closePath();
    }
    drawShape(ctx, shape) {
      if (shape.roughness !== void 0 && shape.roughness > 0 || this.roughness > 0) {
        this.drawRoughShape(ctx, shape);
        return;
      }
      const { start, end, color, width } = shape;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      switch (shape.tool) {
        case "line":
          if (shape.dashPattern) ctx.setLineDash(shape.dashPattern);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          if (shape.dashPattern) ctx.setLineDash([]);
          break;
        case "rect": {
          const rx = Math.min(start.x, end.x);
          const ry = Math.min(start.y, end.y);
          const rw = Math.abs(end.x - start.x);
          const rh = Math.abs(end.y - start.y);
          const cr = shape.cornerRadius ?? 0;
          if (shape.filled) {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.25 * shape.opacity;
            if (cr > 0) {
              this.roundRect(ctx, rx, ry, rw, rh, cr);
              ctx.fill();
            } else ctx.fillRect(rx, ry, rw, rh);
            ctx.globalAlpha = shape.opacity;
          }
          if (shape.dashPattern) ctx.setLineDash(shape.dashPattern);
          if (cr > 0) {
            this.roundRect(ctx, rx, ry, rw, rh, cr);
            ctx.stroke();
          } else ctx.strokeRect(rx, ry, rw, rh);
          if (shape.dashPattern) ctx.setLineDash([]);
          break;
        }
        case "circle": {
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          const rrx = Math.abs(end.x - start.x) / 2;
          const rry = Math.abs(end.y - start.y) / 2;
          if (shape.dashPattern) ctx.setLineDash(shape.dashPattern);
          ctx.beginPath();
          ctx.ellipse(cx, cy, rrx, rry, 0, 0, Math.PI * 2);
          if (shape.filled) {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.25 * shape.opacity;
            ctx.fill();
            ctx.globalAlpha = shape.opacity;
          }
          ctx.stroke();
          if (shape.dashPattern) ctx.setLineDash([]);
          break;
        }
        case "arrow": {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) break;
          if (shape.dashPattern) ctx.setLineDash(shape.dashPattern);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          if (shape.dashPattern) ctx.setLineDash([]);
          const headLen = Math.min(15, len * 0.3);
          const angle = Math.atan2(dy, dx);
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
        }
      }
    }
    seededRandom(seed) {
      let s2 = seed;
      return () => {
        s2 = (s2 * 16807 + 0) % 2147483647;
        return (s2 - 1) / 2147483646;
      };
    }
    drawRoughShape(ctx, shape) {
      const roughLevel = shape.roughness ?? this.roughness;
      const maxOffset = roughLevel * 1.5;
      const passes = roughLevel + 1;
      const seedVal = shape.id.split("").reduce((a2, c2) => a2 + c2.charCodeAt(0), 0);
      const rand = this.seededRandom(seedVal);
      const { start, end, color, width } = shape;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let pass = 0; pass < passes; pass++) {
        const off = () => (rand() - 0.5) * maxOffset;
        ctx.globalAlpha = Math.max(0.3, 1 - pass * 0.15);
        ctx.beginPath();
        switch (shape.tool) {
          case "line": {
            ctx.moveTo(start.x + off(), start.y + off());
            ctx.lineTo(end.x + off(), end.y + off());
            ctx.stroke();
            break;
          }
          case "rect": {
            const rx = Math.min(start.x, end.x);
            const ry = Math.min(start.y, end.y);
            const rw = Math.abs(end.x - start.x);
            const rh = Math.abs(end.y - start.y);
            const pts = [
              { x: rx, y: ry },
              { x: rx + rw, y: ry },
              { x: rx + rw, y: ry + rh },
              { x: rx, y: ry + rh }
            ];
            for (let i2 = 0; i2 < 4; i2++) {
              const a2 = pts[i2];
              const b2 = pts[(i2 + 1) % 4];
              ctx.moveTo(a2.x + off(), a2.y + off());
              const segs = 4;
              for (let s2 = 1; s2 <= segs; s2++) {
                const t2 = s2 / segs;
                ctx.lineTo(
                  a2.x + (b2.x - a2.x) * t2 + off(),
                  a2.y + (b2.y - a2.y) * t2 + off()
                );
              }
            }
            ctx.closePath();
            if (shape.filled) {
              ctx.fillStyle = color;
              const savedAlpha = ctx.globalAlpha;
              ctx.globalAlpha = 0.25 * shape.opacity;
              ctx.fill();
              ctx.globalAlpha = savedAlpha;
            }
            ctx.stroke();
            break;
          }
          case "circle": {
            const cx = (start.x + end.x) / 2;
            const cy = (start.y + end.y) / 2;
            const rrx = Math.abs(end.x - start.x) / 2;
            const rry = Math.abs(end.y - start.y) / 2;
            const segs = 36;
            for (let i2 = 0; i2 <= segs; i2++) {
              const a2 = i2 / segs * Math.PI * 2;
              const px = cx + Math.cos(a2) * rrx + off();
              const py = cy + Math.sin(a2) * rry + off();
              if (i2 === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            if (shape.filled) {
              ctx.fillStyle = color;
              const savedAlpha = ctx.globalAlpha;
              ctx.globalAlpha = 0.25 * shape.opacity;
              ctx.fill();
              ctx.globalAlpha = savedAlpha;
            }
            ctx.stroke();
            break;
          }
          case "arrow": {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const len = Math.hypot(dx, dy);
            if (len < 1) break;
            ctx.moveTo(start.x + off(), start.y + off());
            ctx.lineTo(end.x + off(), end.y + off());
            ctx.stroke();
            const headLen = Math.min(15, len * 0.3);
            const angle = Math.atan2(dy, dx);
            ctx.beginPath();
            ctx.moveTo(end.x + off(), end.y + off());
            ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6) + off(), end.y - headLen * Math.sin(angle - Math.PI / 6) + off());
            ctx.moveTo(end.x + off(), end.y + off());
            ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6) + off(), end.y - headLen * Math.sin(angle + Math.PI / 6) + off());
            ctx.stroke();
            break;
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    drawSelectionIndicators(ctx) {
      if (this.selectedIds.size === 0) return;
      const t2 = THEMES[this.theme];
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (!el) continue;
        const bounds = this.getElementBounds(el);
        const local = this.getLocalBounds(el);
        const rotation = el.rotation ?? 0;
        const pad = 6 / this.camera.zoom;
        ctx.save();
        ctx.strokeStyle = t2.selectionColor;
        ctx.lineWidth = 1.5 / this.camera.zoom;
        ctx.fillStyle = t2.selectionFill;
        if (rotation !== 0) {
          const corners = this.getRotatedCorners({ x: local.x - pad, y: local.y - pad, w: local.w + pad * 2, h: local.h + pad * 2 }, rotation);
          ctx.beginPath();
          ctx.moveTo(corners[0].x, corners[0].y);
          ctx.lineTo(corners[1].x, corners[1].y);
          ctx.lineTo(corners[2].x, corners[2].y);
          ctx.lineTo(corners[3].x, corners[3].y);
          ctx.closePath();
          ctx.fill();
          ctx.setLineDash([6 / this.camera.zoom, 4 / this.camera.zoom]);
          ctx.stroke();
          ctx.setLineDash([]);
          const handles = [
            corners[0],
            { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 },
            corners[1],
            { x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2 },
            corners[2],
            { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 },
            corners[3],
            { x: (corners[3].x + corners[0].x) / 2, y: (corners[3].y + corners[0].y) / 2 }
          ];
          const handleSize = (IS_MOBILE() ? 12 : 8) / this.camera.zoom;
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = t2.selectionColor;
          ctx.lineWidth = 1.5 / this.camera.zoom;
          for (const c2 of handles) {
            ctx.fillRect(c2.x - handleSize / 2, c2.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(c2.x - handleSize / 2, c2.y - handleSize / 2, handleSize, handleSize);
          }
        } else {
          ctx.setLineDash([6 / this.camera.zoom, 4 / this.camera.zoom]);
          ctx.fillRect(bounds.x - pad, bounds.y - pad, bounds.w + pad * 2, bounds.h + pad * 2);
          ctx.strokeRect(bounds.x - pad, bounds.y - pad, bounds.w + pad * 2, bounds.h + pad * 2);
          ctx.setLineDash([]);
          const handleSize = (IS_MOBILE() ? 12 : 8) / this.camera.zoom;
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = t2.selectionColor;
          ctx.lineWidth = 1.5 / this.camera.zoom;
          const handles = [
            { x: bounds.x - pad, y: bounds.y - pad },
            { x: bounds.x + bounds.w / 2, y: bounds.y - pad },
            { x: bounds.x + bounds.w + pad, y: bounds.y - pad },
            { x: bounds.x + bounds.w + pad, y: bounds.y + bounds.h / 2 },
            { x: bounds.x + bounds.w + pad, y: bounds.y + bounds.h + pad },
            { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h + pad },
            { x: bounds.x - pad, y: bounds.y + bounds.h + pad },
            { x: bounds.x - pad, y: bounds.y + bounds.h / 2 }
          ];
          for (const c2 of handles) {
            ctx.fillRect(c2.x - handleSize / 2, c2.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(c2.x - handleSize / 2, c2.y - handleSize / 2, handleSize, handleSize);
          }
        }
        ctx.restore();
      }
    }
    updateToolbar() {
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth, this.fillEnabled, this.theme, this.camera.zoom, this.fontSize, this.roughness, this.graph.enabled);
    }
    setTool(tool) {
      this.commitText();
      this.activeTool = tool;
      let cursor = "crosshair";
      if (tool === "select") cursor = "default";
      else if (tool === "hand") cursor = "grab";
      else if (tool === "text") cursor = "text";
      else if (tool === "eraser") cursor = "cell";
      else if (tool === "highlighter") cursor = "crosshair";
      this.liveCanvas.style.cursor = cursor;
      this.updateToolbar();
      this.emit("toolchange");
    }
    getTool() {
      return this.activeTool;
    }
    setColor(color) {
      this.strokeColor = color;
      this.updateToolbar();
    }
    getColor() {
      return this.strokeColor;
    }
    setWidth(width) {
      this.strokeWidth = Math.max(1, Math.min(50, width));
      this.updateToolbar();
    }
    getWidth() {
      return this.strokeWidth;
    }
    getFontSize() {
      return this.fontSize;
    }
    setFontSize(size) {
      this.fontSize = Math.max(8, Math.min(72, size));
      this.updateToolbar();
    }
    getRoughness() {
      return this.roughness;
    }
    setRoughness(level) {
      this.roughness = Math.max(0, Math.min(3, level));
      this.renderAll();
    }
    setFill(enabled) {
      this.fillEnabled = enabled;
      this.updateToolbar();
    }
    getFill() {
      return this.fillEnabled;
    }
    getTheme() {
      return this.theme;
    }
    setTheme(theme) {
      this.theme = theme;
      this.root.style.background = THEMES[this.theme].canvasBg;
      this.renderAll();
      this.updateToolbar();
    }
    getZoom() {
      return this.camera.zoom;
    }
    zoomTo(level, center) {
      const cx = center?.x ?? this.width / 2;
      const cy = center?.y ?? this.height / 2;
      const worldBefore = this.screenToWorld(cx, cy);
      this.camera.zoom = Math.max(0.1, Math.min(10, level));
      const worldAfter = this.screenToWorld(cx, cy);
      this.camera.x += worldBefore.x - worldAfter.x;
      this.camera.y += worldBefore.y - worldAfter.y;
      this.renderAll();
      this.updateToolbar();
    }
    resetView() {
      this.camera = { x: 0, y: 0, zoom: 1 };
      this.renderAll();
      this.updateToolbar();
    }
    isGraphEnabled() {
      return this.graph.enabled;
    }
    enableGraph(options) {
      this.graph = { ...this.graph, ...options, enabled: true };
      this.renderStatic();
    }
    disableGraph() {
      this.graph.enabled = false;
      this.renderStatic();
    }
    undo() {
      if (this.undoStack.length === 0) return;
      this.redoStack.push(JSON.parse(JSON.stringify(this.elements)));
      this.elements = this.undoStack.pop();
      this.selectedIds.clear();
      this.renderAll();
      this.updateToolbar();
      this.emit("undo");
      this.emit("change");
    }
    redo() {
      if (this.redoStack.length === 0) return;
      this.undoStack.push(JSON.parse(JSON.stringify(this.elements)));
      this.elements = this.redoStack.pop();
      this.selectedIds.clear();
      this.renderAll();
      this.updateToolbar();
      this.emit("redo");
      this.emit("change");
    }
    clear() {
      if (this.elements.length === 0) {
        this.emit("clear");
        return;
      }
      if (!confirm("Clear all elements?")) return;
      this.pushUndo();
      this.elements = [];
      this.selectedIds.clear();
      this.currentElement = null;
      this.imageCache.clear();
      this.renderAll();
      this.updateToolbar();
      this.emit("clear");
      this.emit("change");
    }
    getElements() {
      return this.elements;
    }
    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
      this.listeners.get(event).add(callback);
    }
    off(event, callback) {
      this.listeners.get(event)?.delete(callback);
    }
    emit(event) {
      const set = this.listeners.get(event);
      if (!set) return;
      if (event === "change") this.dirtySinceSave = true;
      const payload = { elements: JSON.parse(JSON.stringify(this.elements)), tool: this.activeTool };
      set.forEach((cb) => cb(payload));
    }
    bringForward() {
      if (this.selectedIds.size !== 1) return;
      const id = this.selectedIds.values().next().value;
      const idx = this.elements.findIndex((e2) => e2.id === id);
      if (idx < 0 || idx >= this.elements.length - 1) return;
      this.pushUndo();
      [this.elements[idx], this.elements[idx + 1]] = [this.elements[idx + 1], this.elements[idx]];
      this.renderAll();
      this.emit("change");
    }
    sendBackward() {
      if (this.selectedIds.size !== 1) return;
      const id = this.selectedIds.values().next().value;
      const idx = this.elements.findIndex((e2) => e2.id === id);
      if (idx <= 0) return;
      this.pushUndo();
      [this.elements[idx], this.elements[idx - 1]] = [this.elements[idx - 1], this.elements[idx]];
      this.renderAll();
      this.emit("change");
    }
    bringToFront() {
      if (this.selectedIds.size !== 1) return;
      const id = this.selectedIds.values().next().value;
      const idx = this.elements.findIndex((e2) => e2.id === id);
      if (idx < 0 || idx >= this.elements.length - 1) return;
      this.pushUndo();
      const [el] = this.elements.splice(idx, 1);
      this.elements.push(el);
      this.renderAll();
      this.emit("change");
    }
    sendToBack() {
      if (this.selectedIds.size !== 1) return;
      const id = this.selectedIds.values().next().value;
      const idx = this.elements.findIndex((e2) => e2.id === id);
      if (idx <= 0) return;
      this.pushUndo();
      const [el] = this.elements.splice(idx, 1);
      this.elements.unshift(el);
      this.renderAll();
      this.emit("change");
    }
    nudgeSelected(dx, dy) {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (!el) continue;
        if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
          const s2 = el;
          s2.points = s2.points.map((p2) => ({ x: p2.x + dx, y: p2.y + dy, pressure: p2.pressure }));
        } else if (el.tool === "text") {
          el.position = { x: el.position.x + dx, y: el.position.y + dy };
        } else if (el.tool === "image") {
          el.position = { x: el.position.x + dx, y: el.position.y + dy };
        } else {
          const s2 = el;
          s2.start = { x: s2.start.x + dx, y: s2.start.y + dy };
          s2.end = { x: s2.end.x + dx, y: s2.end.y + dy };
        }
      }
      this.renderAll();
      this.emit("change");
    }
    showShortcutHelp() {
      if (this.contextMenu) {
        this.dismissContextMenu();
        return;
      }
      const t2 = THEMES[this.theme];
      const overlay = document.createElement("div");
      overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;`;
      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) overlay.remove();
      });
      const panel = document.createElement("div");
      panel.style.cssText = `background:${t2.canvasBg};color:${t2.gridLabelColor};border:1px solid ${t2.gridColor};border-radius:12px;padding:20px 24px;max-width:420px;width:90%;max-height:80vh;overflow-y:auto;font-family:system-ui,sans-serif;font-size:13px;line-height:1.6;`;
      const shortcuts = [
        ["P", "Pen"],
        ["M", "Highlighter"],
        ["T", "Text"],
        ["L", "Line"],
        ["R", "Rect"],
        ["O", "Circle"],
        ["A", "Arrow"],
        ["E", "Eraser"],
        ["V", "Select"],
        ["H", "Hand"],
        ["Space+Drag", "Pan"],
        ["Esc", "Deselect / Cancel"],
        ["Del", "Delete selected"],
        ["Arrow keys", "Nudge (Shift=10px)"],
        ["Ctrl+Z", "Undo"],
        ["Ctrl+Y", "Redo"],
        ["Ctrl+D", "Duplicate"],
        ["Ctrl+C", "Copy"],
        ["Ctrl+V", "Paste"],
        ["Ctrl+X", "Cut"],
        ["Ctrl+A", "Select all"],
        ["Ctrl+G", "Group"],
        ["Ctrl+Shift+G", "Ungroup"],
        ["Ctrl+]", "Bring forward"],
        ["Ctrl+[", "Send backward"],
        ["Shift+R", "Rotate 15\xB0"],
        ["Ctrl+Shift+S", "Export SVG"],
        ["Ctrl+Shift+F", "Apply style to selection"],
        ["?", "This help"]
      ];
      let html = `<div style="font-size:16px;font-weight:600;margin-bottom:12px;color:${t2.gridAxisColor}">Keyboard Shortcuts</div>`;
      for (const [key, desc] of shortcuts) html += `<div style="display:flex;justify-content:space-between;padding:2px 0"><kbd style="background:${t2.gridColor};padding:1px 6px;border-radius:4px;font-size:12px;min-width:90px;text-align:center">${key}</kbd><span>${desc}</span></div>`;
      panel.innerHTML = html;
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      this.contextMenu = overlay;
    }
    duplicateSelected() {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      const newIds = /* @__PURE__ */ new Set();
      const groupMap = /* @__PURE__ */ new Map();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (!el) continue;
        const clone = JSON.parse(JSON.stringify(el));
        clone.id = uid();
        if (el.groupId) {
          if (!groupMap.has(el.groupId)) groupMap.set(el.groupId, uid());
          clone.groupId = groupMap.get(el.groupId);
        } else {
          clone.groupId = void 0;
        }
        if ("start" in clone) {
          clone.start = { x: clone.start.x + 20, y: clone.start.y + 20 };
          clone.end = { x: clone.end.x + 20, y: clone.end.y + 20 };
        }
        if ("position" in clone) {
          clone.position = { x: clone.position.x + 20, y: clone.position.y + 20 };
        }
        if ("points" in clone) {
          clone.points = clone.points.map((p2) => ({ x: p2.x + 20, y: p2.y + 20, pressure: p2.pressure }));
        }
        this.elements.push(clone);
        newIds.add(clone.id);
      }
      this.selectedIds = newIds;
      this.renderAll();
      this.emit("change");
    }
    rotateSelected(angle) {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      const ids = [...this.selectedIds];
      if (ids.length === 1) {
        const el = this.elements.find((e2) => e2.id === ids[0]);
        if (el) el.rotation = ((el.rotation ?? 0) + angle) % (Math.PI * 2);
      } else {
        let cx = 0, cy = 0, count = 0;
        for (const id of ids) {
          const el = this.elements.find((e2) => e2.id === id);
          if (!el) continue;
          const b2 = this.getLocalBounds(el);
          cx += b2.x + b2.w / 2;
          cy += b2.y + b2.h / 2;
          count++;
        }
        if (count > 0) {
          cx /= count;
          cy /= count;
        }
        const center = { x: cx, y: cy };
        for (const id of ids) {
          const el = this.elements.find((e2) => e2.id === id);
          if (!el) continue;
          if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
            const s2 = el;
            s2.points = s2.points.map((p2) => this.rotatePoint(p2, center, angle));
          } else if (el.tool === "text") {
            el.position = this.rotatePoint(el.position, center, angle);
          } else if (el.tool === "image") {
            el.position = this.rotatePoint(el.position, center, angle);
          } else {
            const s2 = el;
            s2.start = this.rotatePoint(s2.start, center, angle);
            s2.end = this.rotatePoint(s2.end, center, angle);
          }
          el.rotation = ((el.rotation ?? 0) + angle) % (Math.PI * 2);
        }
      }
      this.renderAll();
      this.emit("change");
    }
    getSelectedRotation() {
      if (this.selectedIds.size !== 1) return 0;
      const id = this.selectedIds.values().next().value;
      const el = this.elements.find((e2) => e2.id === id);
      return el ? el.rotation ?? 0 : 0;
    }
    copySelected() {
      if (this.selectedIds.size === 0) return;
      this.clipboard = [];
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (!el) continue;
        const clone = JSON.parse(JSON.stringify(el));
        clone.id = uid();
        this.clipboard.push(clone);
      }
    }
    pasteClipboard() {
      if (this.clipboard.length === 0) return;
      this.pushUndo();
      const newIds = /* @__PURE__ */ new Set();
      const groupMap = /* @__PURE__ */ new Map();
      for (const el of this.clipboard) {
        const clone = JSON.parse(JSON.stringify(el));
        clone.id = uid();
        if (clone.groupId) {
          if (!groupMap.has(clone.groupId)) groupMap.set(clone.groupId, uid());
          clone.groupId = groupMap.get(clone.groupId);
        }
        if ("start" in clone) {
          clone.start = { x: clone.start.x + 20, y: clone.start.y + 20 };
          clone.end = { x: clone.end.x + 20, y: clone.end.y + 20 };
        }
        if ("position" in clone) {
          clone.position = { x: clone.position.x + 20, y: clone.position.y + 20 };
        }
        if ("points" in clone) {
          clone.points = clone.points.map((p2) => ({ x: p2.x + 20, y: p2.y + 20, pressure: p2.pressure }));
        }
        this.elements.push(clone);
        newIds.add(clone.id);
      }
      this.selectedIds = newIds;
      this.clipboard = this.clipboard.map((c2) => JSON.parse(JSON.stringify(c2)));
      this.renderAll();
      this.emit("change");
    }
    selectAll() {
      this.selectedIds = new Set(this.elements.map((el) => el.id));
      this.renderAll();
      this.emit("change");
    }
    applyStyleToSelected() {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (!el) continue;
        if (el.tool !== "image") el.color = this.strokeColor;
        el.opacity = this.strokeOpacity;
        if ("width" in el && el.tool !== "text") el.width = this.strokeWidth;
        if ("filled" in el) el.filled = this.fillEnabled;
        if ("roughness" in el) el.roughness = this.roughness;
      }
      this.renderAll();
      this.emit("change");
    }
    toDataURL(type = "image/png", quality = 1) {
      const c2 = document.createElement("canvas");
      c2.width = this.width * this.dpr;
      c2.height = this.height * this.dpr;
      const ctx = c2.getContext("2d");
      ctx.drawImage(this.staticCanvas, 0, 0);
      return c2.toDataURL(type, quality);
    }
    toBlob(type = "image/png", quality = 1) {
      return new Promise((resolve) => {
        const c2 = document.createElement("canvas");
        c2.width = this.width * this.dpr;
        c2.height = this.height * this.dpr;
        const ctx = c2.getContext("2d");
        ctx.drawImage(this.staticCanvas, 0, 0);
        c2.toBlob(resolve, type, quality);
      });
    }
    exportJSON() {
      return { elements: JSON.parse(JSON.stringify(this.elements)), width: this.width, height: this.height, camera: { ...this.camera } };
    }
    importJSON(snapshot) {
      if (!snapshot || !Array.isArray(snapshot.elements)) {
        this.showToast("Invalid snapshot data");
        return;
      }
      const validTools = /* @__PURE__ */ new Set(["pen", "eraser", "highlighter", "line", "rect", "circle", "arrow", "text", "image"]);
      const valid = snapshot.elements.filter((el) => {
        if (!el || typeof el.id !== "string" || !validTools.has(el.tool)) return false;
        if ((el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") && !Array.isArray(el.points)) return false;
        if ((el.tool === "line" || el.tool === "rect" || el.tool === "circle" || el.tool === "arrow") && (!el.start || !el.end)) return false;
        if (el.tool === "text" && (!el.position || typeof el.content !== "string")) return false;
        if (el.tool === "image" && (!el.position || typeof el.src !== "string")) return false;
        return true;
      });
      this.pushUndo();
      this.elements = valid;
      this.undoStack = [];
      this.redoStack = [];
      this.imageCache.clear();
      if (snapshot.camera) this.camera = snapshot.camera;
      this.selectedIds.clear();
      this.renderAll();
      this.emit("load");
      this.emit("change");
      if (valid.length < snapshot.elements.length) {
        this.showToast(`Loaded ${valid.length} of ${snapshot.elements.length} elements`);
      }
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
      this.dpr = window.devicePixelRatio || 1;
      this.setupCanvases();
      this.renderAll();
    }
    saveToStorage(key = "casuya-blackboard") {
      const data = JSON.stringify(this.exportJSON());
      if (data.length > 4 * 1024 * 1024) {
        this.showToast("\u26A0\uFE0F Large data \u2014 some images may not persist");
      }
      try {
        localStorage.setItem(key, data);
        this.emit("save");
      } catch {
        this.showToast("\u26A0\uFE0F Storage full \u2014 clear browser data");
      }
    }
    loadFromStorage(key = "casuya-blackboard") {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        this.importJSON(JSON.parse(raw));
        return true;
      } catch {
        return false;
      }
    }
    showToast(msg) {
      const existing = this.root.querySelector(".casuya-toast");
      if (existing) existing.remove();
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
        this.toastTimeout = null;
      }
      const mobile = IS_MOBILE();
      const toast = document.createElement("div");
      toast.className = "casuya-toast";
      toast.textContent = msg;
      toast.style.cssText = `
      position: absolute; bottom: ${mobile ? 8 : 16}px; left: 50%; transform: translateX(-50%);
      background: #1e293b; color: white; padding: ${mobile ? 6 : 8}px ${mobile ? 12 : 16}px; border-radius: ${mobile ? 6 : 8}px;
      font-size: ${mobile ? 11 : 13}px; z-index: 100; pointer-events: none; white-space: nowrap;
      animation: fadeInOut 2s ease forwards;
    `;
      if (!document.getElementById("casuya-toast-keyframes")) {
        const style = document.createElement("style");
        style.id = "casuya-toast-keyframes";
        style.textContent = `@keyframes fadeInOut { 0% { opacity: 0; transform: translateX(-50%) translateY(8px); } 15% { opacity: 1; transform: translateX(-50%) translateY(0); } 80% { opacity: 1; } 100% { opacity: 0; } }`;
        document.head.appendChild(style);
      }
      this.root.appendChild(toast);
      this.toastTimeout = setTimeout(() => {
        toast.remove();
      }, 2e3);
    }
    handleImagePaste(e2) {
      const items = e2.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e2.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            const img = new Image();
            img.onload = () => {
              const centerX = this.width / 2;
              const centerY = this.height / 2;
              const world = this.screenToWorld(centerX, centerY);
              const el = {
                id: uid(),
                tool: "image",
                position: { x: world.x - img.width / 2, y: world.y - img.height / 2 },
                width: img.width,
                height: img.height,
                src,
                opacity: 1
              };
              this.pushUndo();
              this.elements.push(el);
              this.renderAll();
              this.emit("change");
            };
            img.src = src;
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
    handleDragOver(e2) {
      e2.preventDefault();
      if (e2.dataTransfer) e2.dataTransfer.dropEffect = "copy";
    }
    handleFileDrop(e2) {
      e2.preventDefault();
      const files = e2.dataTransfer?.files;
      if (!files) return;
      const rect = this.liveCanvas.getBoundingClientRect();
      const sx = e2.clientX - rect.left;
      const sy = e2.clientY - rect.top;
      const world = this.screenToWorld(sx, sy);
      this.pushUndo();
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          const img = new Image();
          img.onload = () => {
            const el = {
              id: uid(),
              tool: "image",
              position: { x: world.x - img.width / 2, y: world.y - img.height / 2 },
              width: img.width,
              height: img.height,
              src,
              opacity: 1
            };
            this.elements.push(el);
            this.renderAll();
            this.emit("change");
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      }
    }
    drawImage(ctx, el) {
      let cached = this.imageCache.get(el.src);
      if (!cached) {
        cached = new Image();
        cached.src = el.src;
        this.imageCache.set(el.src, cached);
        if (!cached.complete) {
          cached.onload = () => this.renderAll();
        }
      }
      if (cached.complete && cached.naturalWidth > 0) {
        ctx.drawImage(cached, el.position.x, el.position.y, el.width, el.height);
      }
    }
    groupSelected() {
      if (this.selectedIds.size < 2) return;
      this.pushUndo();
      const groupId = uid();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (el) el.groupId = groupId;
      }
      this.renderAll();
      this.emit("change");
    }
    ungroupSelected() {
      if (this.selectedIds.size === 0) return;
      this.pushUndo();
      for (const id of this.selectedIds) {
        const el = this.elements.find((e2) => e2.id === id);
        if (el) el.groupId = void 0;
      }
      this.renderAll();
      this.emit("change");
    }
    exportSVG() {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const el of this.elements) {
        const b2 = this.getElementBounds(el);
        if (b2.x < minX) minX = b2.x;
        if (b2.y < minY) minY = b2.y;
        if (b2.x + b2.w > maxX) maxX = b2.x + b2.w;
        if (b2.y + b2.h > maxY) maxY = b2.y + b2.h;
      }
      if (minX === Infinity) {
        minX = 0;
        minY = 0;
        maxX = this.width;
        maxY = this.height;
      }
      const pad = 10;
      const vx = minX - pad;
      const vy = minY - pad;
      const vw = maxX - minX + pad * 2;
      const vh = maxY - minY + pad * 2;
      const parts = [];
      parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">`);
      for (const el of this.elements) {
        parts.push(this.elementToSVG(el));
      }
      parts.push("</svg>");
      return parts.join("\n");
    }
    elementToSVG(el) {
      const rotation = el.rotation ?? 0;
      const op = el.opacity !== void 0 ? ` opacity="${el.opacity}"` : "";
      if (el.tool === "pen" || el.tool === "eraser" || el.tool === "highlighter") {
        const stroke = el;
        if (stroke.points.length < 2) return "";
        const outlinePoints = R(
          stroke.points.map((p2) => [p2.x, p2.y, p2.pressure ?? 0.5]),
          { size: stroke.width, thinning: stroke.tool === "highlighter" ? 0 : 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: stroke.tool !== "highlighter" }
        );
        const pathData = getSvgPathFromStroke(outlinePoints);
        if (!pathData) return "";
        const fill = stroke.tool === "eraser" ? "none" : stroke.color;
        const opAttr = stroke.tool === "highlighter" ? ` opacity="0.3"` : op;
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<path d="${pathData}" fill="${fill}"${rot}${opAttr}/>`;
      }
      if (el.tool === "line") {
        const s2 = el;
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        const dash = s2.dashPattern ? ` stroke-dasharray="${s2.dashPattern.join(",")}"` : "";
        return `<line x1="${s2.start.x}" y1="${s2.start.y}" x2="${s2.end.x}" y2="${s2.end.y}" stroke="${s2.color}" stroke-width="${s2.width}" stroke-linecap="round"${dash}${rot}${op}/>`;
      }
      if (el.tool === "rect") {
        const s2 = el;
        const rx = Math.min(s2.start.x, s2.end.x);
        const ry = Math.min(s2.start.y, s2.end.y);
        const rw = Math.abs(s2.end.x - s2.start.x);
        const rh = Math.abs(s2.end.y - s2.start.y);
        const cr = s2.cornerRadius ? ` rx="${s2.cornerRadius}" ry="${s2.cornerRadius}"` : "";
        const fill = s2.filled ? ` fill="${s2.color}" fill-opacity="0.25"` : ' fill="none"';
        const dash = s2.dashPattern ? ` stroke-dasharray="${s2.dashPattern.join(",")}"` : "";
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"${cr} stroke="${s2.color}" stroke-width="${s2.width}"${fill}${dash}${rot}${op}/>`;
      }
      if (el.tool === "circle") {
        const s2 = el;
        const cx = (s2.start.x + s2.end.x) / 2;
        const cy = (s2.start.y + s2.end.y) / 2;
        const rrx = Math.abs(s2.end.x - s2.start.x) / 2;
        const rry = Math.abs(s2.end.y - s2.start.y) / 2;
        const fill = s2.filled ? ` fill="${s2.color}" fill-opacity="0.25"` : ' fill="none"';
        const dash = s2.dashPattern ? ` stroke-dasharray="${s2.dashPattern.join(",")}"` : "";
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rrx}" ry="${rry}" stroke="${s2.color}" stroke-width="${s2.width}"${fill}${dash}${rot}${op}/>`;
      }
      if (el.tool === "arrow") {
        const s2 = el;
        const dx = s2.end.x - s2.start.x;
        const dy = s2.end.y - s2.start.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) return "";
        const headLen = Math.min(15, len * 0.3);
        const angle = Math.atan2(dy, dx);
        const ax1 = s2.end.x - headLen * Math.cos(angle - Math.PI / 6);
        const ay1 = s2.end.y - headLen * Math.sin(angle - Math.PI / 6);
        const ax2 = s2.end.x - headLen * Math.cos(angle + Math.PI / 6);
        const ay2 = s2.end.y - headLen * Math.sin(angle + Math.PI / 6);
        const dash = s2.dashPattern ? ` stroke-dasharray="${s2.dashPattern.join(",")}"` : "";
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<g${rot}${op}><line x1="${s2.start.x}" y1="${s2.start.y}" x2="${s2.end.x}" y2="${s2.end.y}" stroke="${s2.color}" stroke-width="${s2.width}" stroke-linecap="round"${dash}/><line x1="${s2.end.x}" y1="${s2.end.y}" x2="${ax1}" y2="${ay1}" stroke="${s2.color}" stroke-width="${s2.width}" stroke-linecap="round"${dash}/><line x1="${s2.end.x}" y1="${s2.end.y}" x2="${ax2}" y2="${ay2}" stroke="${s2.color}" stroke-width="${s2.width}" stroke-linecap="round"${dash}/></g>`;
      }
      if (el.tool === "text") {
        const t2 = el;
        const lines = this.wordWrapTextForSVG(t2.content, t2.fontSize, t2.width > 1 ? t2.width : 300, t2.fontFamily);
        const lineHeight = t2.fontSize * 1.4;
        const tspans = lines.map(
          (line, i2) => `<tspan x="${t2.position.x}" dy="${i2 === 0 ? 0 : lineHeight}">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</tspan>`
        ).join("");
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<text x="${t2.position.x}" y="${t2.position.y}" font-size="${t2.fontSize}" font-family="${t2.fontFamily}" fill="${t2.color}" dominant-baseline="hanging"${rot}${op}>${tspans}</text>`;
      }
      if (el.tool === "image") {
        const img = el;
        const rot = rotation !== 0 ? ` transform="rotate(${rotation * 180 / Math.PI}, ${this.getRotationCenter(el).x}, ${this.getRotationCenter(el).y})"` : "";
        return `<image href="${img.src}" x="${img.position.x}" y="${img.position.y}" width="${img.width}" height="${img.height}"${rot}${op}/>`;
      }
      return "";
    }
    wordWrapTextForSVG(text, fontSize, maxWidth, fontFamily = "system-ui, -apple-system, sans-serif") {
      const rawLines = text.split("\n");
      const wrappedLines = [];
      const ctx = this.staticCtx;
      ctx.font = `${fontSize}px ${fontFamily}`;
      for (const rawLine of rawLines) {
        if (rawLine === "") {
          wrappedLines.push("");
          continue;
        }
        const words = rawLine.split(" ");
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        wrappedLines.push(currentLine);
      }
      return wrappedLines;
    }
    destroy() {
      this.detachEvents();
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.autosaveTimer) {
        clearInterval(this.autosaveTimer);
        this.autosaveTimer = null;
      }
      if (this.boundBeforeUnload) {
        window.removeEventListener("beforeunload", this.boundBeforeUnload);
        this.boundBeforeUnload = null;
      }
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
        this.toastTimeout = null;
      }
      this.dismissContextMenu();
      this.imageCache.clear();
      this.root.remove();
    }
  };
  return __toCommonJS(browser_core_exports);
})();
//# sourceMappingURL=blackboard.umd.js.map