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
  var TOOL_ICONS = {
    pen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
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
  var TOOL_TITLES = {
    pen: "Pen",
    line: "Line",
    rect: "Rectangle",
    circle: "Circle",
    arrow: "Arrow",
    eraser: "Eraser"
  };
  function sep() {
    const s2 = document.createElement("div");
    s2.style.cssText = "width: 1px; height: 28px; background: #e2e8f0; margin: 0 4px;";
    return s2;
  }
  function actionBtn(icon, title, onClick) {
    const btn = document.createElement("button");
    btn.textContent = icon;
    btn.title = title;
    btn.style.cssText = `
    width: 34px; height: 34px; border: none; border-radius: 8px;
    background: transparent; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 15px; color: #64748b; transition: all 0.15s ease;
  `;
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#e2e8f0";
      btn.style.color = "#334155";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "transparent";
      btn.style.color = "#64748b";
    });
    btn.addEventListener("click", onClick);
    return btn;
  }
  function createToolbar(board) {
    const bar = document.createElement("div");
    bar.style.cssText = `
    display: flex; align-items: center; gap: 6px;
    padding: 8px 12px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0; flex-wrap: wrap;
  `;
    const toolButtons = /* @__PURE__ */ new Map();
    const toolGroup = document.createElement("div");
    toolGroup.style.cssText = "display: flex; gap: 4px;";
    for (const tool of ["pen", "line", "rect", "circle", "arrow", "eraser"]) {
      const btn = document.createElement("button");
      btn.innerHTML = TOOL_ICONS[tool];
      btn.title = TOOL_TITLES[tool];
      btn.style.cssText = `
      width: 36px; height: 36px; border: 2px solid transparent; border-radius: 8px;
      background: transparent; cursor: pointer; display: flex;
      align-items: center; justify-content: center; color: #64748b;
      transition: all 0.15s ease;
    `;
      btn.addEventListener("mouseenter", () => {
        if (board.getTool() !== tool) {
          btn.style.background = "#e2e8f0";
          btn.style.color = "#334155";
        }
      });
      btn.addEventListener("mouseleave", () => {
        if (board.getTool() !== tool) {
          btn.style.background = "transparent";
          btn.style.color = "#64748b";
        }
      });
      btn.addEventListener("click", () => board.setTool(tool));
      toolButtons.set(tool, btn);
      toolGroup.appendChild(btn);
    }
    bar.appendChild(toolGroup);
    bar.appendChild(sep());
    const colorGroup = document.createElement("div");
    colorGroup.style.cssText = "display: flex; gap: 4px; align-items: center;";
    for (const color of COLORS) {
      const swatch = document.createElement("button");
      swatch.dataset.color = color;
      swatch.style.cssText = `
      width: 24px; height: 24px; border-radius: 50%;
      border: 2px solid transparent; background: ${color};
      cursor: pointer; transition: all 0.15s ease; padding: 0;
    `;
      swatch.addEventListener("mouseenter", () => {
        swatch.style.transform = "scale(1.2)";
      });
      swatch.addEventListener("mouseleave", () => {
        swatch.style.transform = "scale(1)";
      });
      swatch.addEventListener("click", () => board.setColor(color));
      colorGroup.appendChild(swatch);
    }
    bar.appendChild(colorGroup);
    bar.appendChild(sep());
    const widthGroup = document.createElement("div");
    widthGroup.style.cssText = "display: flex; align-items: center; gap: 8px;";
    const widthLabel = document.createElement("span");
    widthLabel.style.cssText = "font-size: 12px; color: #64748b; min-width: 24px; text-align: center;";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.value = String(board.getWidth());
    slider.style.cssText = "width: 80px; height: 4px; -webkit-appearance: none; appearance: none; background: #e2e8f0; border-radius: 2px; outline: none; cursor: pointer;";
    slider.addEventListener("input", () => board.setWidth(Number(slider.value)));
    const widthPreview = document.createElement("div");
    widthPreview.style.cssText = "width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;";
    const widthDot = document.createElement("div");
    widthDot.style.cssText = `background: ${board.getColor()}; border-radius: 50%; transition: all 0.15s ease;`;
    widthPreview.appendChild(widthDot);
    widthGroup.appendChild(widthLabel);
    widthGroup.appendChild(slider);
    widthGroup.appendChild(widthPreview);
    bar.appendChild(widthGroup);
    bar.appendChild(sep());
    const undoBtn = actionBtn("\u21A9", "Undo (Ctrl+Z)", () => board.undo());
    const redoBtn = actionBtn("\u21AA", "Redo (Ctrl+Shift+Z)", () => board.redo());
    const clearBtn = actionBtn("\u2715", "Clear all", () => board.clear());
    const graphBtn = actionBtn("\u229E", "Toggle graph paper", () => {
      const b2 = board;
      if (b2.graph?.enabled) {
        board.disableGraph();
        graphBtn.style.background = "transparent";
        graphBtn.style.color = "#64748b";
      } else {
        board.enableGraph();
        graphBtn.style.background = "#dbeafe";
        graphBtn.style.color = "#2563eb";
      }
    });
    const saveBtn = actionBtn("\u2193", "Save to browser", () => {
      board.saveToStorage();
      showToast(board);
    });
    const actionGroup = document.createElement("div");
    actionGroup.style.cssText = "display: flex; gap: 4px;";
    actionGroup.appendChild(undoBtn);
    actionGroup.appendChild(redoBtn);
    actionGroup.appendChild(clearBtn);
    actionGroup.appendChild(graphBtn);
    actionGroup.appendChild(saveBtn);
    bar.appendChild(actionGroup);
    return { bar, toolButtons, undoBtn, redoBtn, graphBtn, widthLabel, widthDot };
  }
  function updateToolbarState(tb, activeTool, color, width) {
    for (const [tool, btn] of tb.toolButtons) {
      const active = tool === activeTool;
      btn.style.background = active ? "#dbeafe" : "transparent";
      btn.style.color = active ? "#2563eb" : "#64748b";
      btn.style.borderColor = active ? "#93c5fd" : "transparent";
    }
    tb.widthLabel.textContent = `${width}px`;
    tb.widthDot.style.background = color;
    tb.widthDot.style.width = `${Math.max(4, width)}px`;
    tb.widthDot.style.height = `${Math.max(4, width)}px`;
  }
  function showToast(board) {
    const root = board.root;
    const toast = document.createElement("div");
    toast.textContent = "\u2713 Saved";
    toast.style.cssText = `
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
    background: #1e293b; color: white; padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-family: system-ui; z-index: 100;
    animation: fadeInOut 2s ease forwards;
  `;
    const style = document.createElement("style");
    style.textContent = `@keyframes fadeInOut { 0% { opacity: 0; transform: translateX(-50%) translateY(8px); } 15% { opacity: 1; transform: translateX(-50%) translateY(0); } 80% { opacity: 1; } 100% { opacity: 0; } }`;
    toast.appendChild(style);
    root.appendChild(style);
    root.appendChild(toast);
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 2e3);
  }

  // src/Blackboard.ts
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
  var Blackboard = class {
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
    elements = [];
    undoStack = [];
    currentElement = null;
    isDrawing = false;
    graph;
    animFrameId = null;
    dirty = false;
    toolbar;
    listeners = /* @__PURE__ */ new Map();
    constructor(options) {
      this.container = options.container;
      this.width = options.width || this.container.clientWidth || 800;
      this.height = options.height || 600;
      this.dpr = window.devicePixelRatio || 1;
      this.strokeColor = options.color || "#1e293b";
      this.strokeWidth = options.strokeWidth || 2;
      this.graph = {
        enabled: options.graph?.enabled ?? false,
        spacing: options.graph?.spacing ?? 25,
        color: options.graph?.color ?? "#e2e8f0",
        showAxes: options.graph?.showAxes ?? true,
        showLabels: options.graph?.showLabels ?? true
      };
      this.root = document.createElement("div");
      this.root.className = "casuya-blackboard";
      this.root.style.cssText = `
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
      background: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      user-select: none;
    `;
      this.canvasWrapper = document.createElement("div");
      this.canvasWrapper.style.cssText = `position: relative; overflow: hidden; width: ${this.width}px; height: ${this.height}px;`;
      this.staticCanvas = document.createElement("canvas");
      this.liveCanvas = document.createElement("canvas");
      [this.staticCanvas, this.liveCanvas].forEach((c2) => {
        c2.style.cssText = `
        position: absolute; top: 0; left: 0;
        width: ${this.width}px; height: ${this.height}px;
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
      this.staticCtx = this.staticCanvas.getContext("2d");
      this.liveCtx = this.liveCanvas.getContext("2d");
      this.setupCanvases();
      this.attachEvents();
      this.renderStatic();
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
    }
    setupCanvases() {
      [this.staticCanvas, this.liveCanvas].forEach((c2) => {
        c2.width = this.width * this.dpr;
        c2.height = this.height * this.dpr;
        c2.getContext("2d").scale(this.dpr, this.dpr);
      });
    }
    attachEvents() {
      this.liveCanvas.addEventListener("pointerdown", this.onPointerDown);
      this.liveCanvas.addEventListener("pointermove", this.onPointerMove);
      this.liveCanvas.addEventListener("pointerup", this.onPointerUp);
      this.liveCanvas.addEventListener("pointerleave", this.onPointerUp);
      this.liveCanvas.addEventListener("pointercancel", this.onPointerUp);
      window.addEventListener("keydown", this.onKeyDown);
    }
    detachEvents() {
      this.liveCanvas.removeEventListener("pointerdown", this.onPointerDown);
      this.liveCanvas.removeEventListener("pointermove", this.onPointerMove);
      this.liveCanvas.removeEventListener("pointerup", this.onPointerUp);
      this.liveCanvas.removeEventListener("pointerleave", this.onPointerUp);
      this.liveCanvas.removeEventListener("pointercancel", this.onPointerUp);
      window.removeEventListener("keydown", this.onKeyDown);
    }
    getPoint = (e2) => {
      const rect = this.liveCanvas.getBoundingClientRect();
      return {
        x: e2.clientX - rect.left,
        y: e2.clientY - rect.top,
        pressure: e2.pressure
      };
    };
    onPointerDown = (e2) => {
      e2.preventDefault();
      this.liveCanvas.setPointerCapture(e2.pointerId);
      this.isDrawing = true;
      const point = this.getPoint(e2);
      if (this.activeTool === "pen" || this.activeTool === "eraser") {
        this.currentElement = {
          id: crypto.randomUUID(),
          tool: this.activeTool,
          points: [point],
          color: this.activeTool === "eraser" ? "#ffffff" : this.strokeColor,
          width: this.activeTool === "eraser" ? this.strokeWidth * 5 : this.strokeWidth,
          opacity: this.strokeOpacity
        };
      } else {
        this.currentElement = {
          id: crypto.randomUUID(),
          tool: this.activeTool,
          start: point,
          end: point,
          color: this.strokeColor,
          width: this.strokeWidth,
          opacity: this.strokeOpacity
        };
      }
    };
    onPointerMove = (e2) => {
      if (!this.isDrawing || !this.currentElement) return;
      e2.preventDefault();
      const point = this.getPoint(e2);
      if (this.currentElement.tool === "pen" || this.currentElement.tool === "eraser") {
        const last = this.currentElement.points[this.currentElement.points.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) < 2) return;
        this.currentElement.points.push(point);
      } else {
        this.currentElement.end = point;
      }
      this.dirty = true;
      if (!this.animFrameId) {
        this.animFrameId = requestAnimationFrame(this.flush);
      }
    };
    onPointerUp = () => {
      if (!this.isDrawing || !this.currentElement) return;
      this.isDrawing = false;
      if (this.currentElement.tool === "pen" || this.currentElement.tool === "eraser") {
        if (this.currentElement.points.length < 2) {
          const p2 = this.currentElement.points[0];
          this.currentElement.points = [
            { x: p2.x, y: p2.y, pressure: 0.5 },
            { x: p2.x + 0.5, y: p2.y + 0.5, pressure: 0.5 }
          ];
        }
      }
      this.elements.push(this.currentElement);
      this.undoStack = [];
      this.currentElement = null;
      this.flushLive();
      this.renderStatic();
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
      this.emit("change");
    };
    onKeyDown = (e2) => {
      if ((e2.ctrlKey || e2.metaKey) && e2.key === "z") {
        e2.preventDefault();
        e2.shiftKey ? this.redo() : this.undo();
      }
    };
    flush = () => {
      this.animFrameId = null;
      if (!this.dirty) return;
      this.dirty = false;
      this.flushLive();
    };
    flushLive() {
      const ctx = this.liveCtx;
      ctx.clearRect(0, 0, this.width, this.height);
      if (this.currentElement) {
        this.drawElement(ctx, this.currentElement);
      }
    }
    renderStatic() {
      const ctx = this.staticCtx;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, this.width, this.height);
      if (this.graph.enabled) this.drawGraph(ctx);
      for (const el of this.elements) this.drawElement(ctx, el);
    }
    drawGraph(ctx) {
      const { spacing, color, showAxes, showLabels } = this.graph;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      for (let x2 = 0; x2 <= this.width; x2 += spacing) {
        ctx.beginPath();
        ctx.moveTo(x2, 0);
        ctx.lineTo(x2, this.height);
        ctx.stroke();
      }
      for (let y2 = 0; y2 <= this.height; y2 += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y2);
        ctx.lineTo(this.width, y2);
        ctx.stroke();
      }
      if (showAxes) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(this.width, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, this.height);
        ctx.stroke();
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(this.width - 2, cy);
        ctx.lineTo(this.width - 10, cy - 4);
        ctx.lineTo(this.width - 10, cy + 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, 2);
        ctx.lineTo(cx - 4, 10);
        ctx.lineTo(cx + 4, 10);
        ctx.fill();
        if (showLabels) {
          ctx.fillStyle = "#64748b";
          ctx.font = "10px system-ui, sans-serif";
          ctx.textAlign = "center";
          for (let x2 = spacing; x2 < this.width; x2 += spacing * 2) {
            const label = Math.round((x2 - cx) / spacing);
            if (label !== 0) ctx.fillText(String(label), x2, cy + 14);
          }
          ctx.textAlign = "right";
          for (let y2 = spacing; y2 < this.height; y2 += spacing * 2) {
            const label = Math.round((cy - y2) / spacing);
            if (label !== 0) ctx.fillText(String(label), cx - 6, y2 + 4);
          }
        }
      }
    }
    drawElement(ctx, el) {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      if (el.tool === "pen" || el.tool === "eraser") {
        this.drawFreehand(ctx, el);
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
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = color;
      }
      const outlinePoints = R(
        points.map((p2) => [p2.x, p2.y, p2.pressure ?? 0.5]),
        { size: width, thinning: 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: true }
      );
      const pathData = getSvgPathFromStroke(outlinePoints);
      if (pathData) ctx.fill(new Path2D(pathData));
      ctx.globalCompositeOperation = "source-over";
    }
    drawShape(ctx, shape) {
      const { start, end, color, width } = shape;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      switch (shape.tool) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          break;
        case "rect":
          ctx.strokeRect(
            Math.min(start.x, end.x),
            Math.min(start.y, end.y),
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
          );
          break;
        case "circle": {
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(end.x - start.x) / 2, Math.abs(end.y - start.y) / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case "arrow": {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) break;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
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
    setTool(tool) {
      this.activeTool = tool;
      this.liveCanvas.style.cursor = tool === "eraser" ? "cell" : "crosshair";
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
      this.emit("toolchange");
    }
    getTool() {
      return this.activeTool;
    }
    setColor(color) {
      this.strokeColor = color;
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
    }
    getColor() {
      return this.strokeColor;
    }
    setWidth(width) {
      this.strokeWidth = Math.max(1, Math.min(50, width));
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
    }
    getWidth() {
      return this.strokeWidth;
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
      if (this.elements.length === 0) return;
      this.undoStack.push(this.elements.pop());
      this.renderStatic();
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
      this.emit("undo");
      this.emit("change");
    }
    redo() {
      if (this.undoStack.length === 0) return;
      this.elements.push(this.undoStack.pop());
      this.renderStatic();
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
      this.emit("redo");
      this.emit("change");
    }
    clear() {
      this.elements = [];
      this.undoStack = [];
      this.currentElement = null;
      this.renderStatic();
      this.flushLive();
      updateToolbarState(this.toolbar, this.activeTool, this.strokeColor, this.strokeWidth);
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
      const payload = { elements: this.elements, tool: this.activeTool };
      set.forEach((cb) => cb(payload));
    }
    toDataURL(type = "image/png", quality = 1) {
      const c2 = document.createElement("canvas");
      c2.width = this.width * this.dpr;
      c2.height = this.height * this.dpr;
      const ctx = c2.getContext("2d");
      ctx.drawImage(this.staticCanvas, 0, 0);
      ctx.drawImage(this.liveCanvas, 0, 0);
      return c2.toDataURL(type, quality);
    }
    toBlob(type = "image/png", quality = 1) {
      return new Promise((resolve) => {
        const c2 = document.createElement("canvas");
        c2.width = this.width * this.dpr;
        c2.height = this.height * this.dpr;
        const ctx = c2.getContext("2d");
        ctx.drawImage(this.staticCanvas, 0, 0);
        ctx.drawImage(this.liveCanvas, 0, 0);
        c2.toBlob(resolve, type, quality);
      });
    }
    exportJSON() {
      return { elements: JSON.parse(JSON.stringify(this.elements)), width: this.width, height: this.height };
    }
    importJSON(snapshot) {
      this.elements = snapshot.elements;
      this.undoStack = [];
      this.renderStatic();
      this.emit("load");
      this.emit("change");
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
      this.canvasWrapper.style.width = `${width}px`;
      this.canvasWrapper.style.height = `${height}px`;
      [this.staticCanvas, this.liveCanvas].forEach((c2) => {
        c2.style.width = `${width}px`;
        c2.style.height = `${height}px`;
      });
      this.setupCanvases();
      this.renderStatic();
    }
    saveToStorage(key = "casuya-blackboard") {
      localStorage.setItem(key, JSON.stringify(this.exportJSON()));
      this.emit("save");
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
    destroy() {
      this.detachEvents();
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.root.remove();
    }
  };
  return __toCommonJS(browser_core_exports);
})();
//# sourceMappingURL=blackboard.umd.js.map