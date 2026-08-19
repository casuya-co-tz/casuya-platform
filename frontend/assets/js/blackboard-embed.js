// Student blackboard embed for Casuya platform.
// Mounts a blackboard into any element marked with [data-blackboard].
// Requires the blackboard UMD bundle (blackboard.umd.js) loaded before this.
(function () {
  const API_BASE = (window.location.port === "8765" || window.location.port === "" || window.location.port === "443" || window.location.port === "80")
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:8765`;

  function request(path, options) {
    const token = localStorage.getItem("casuya_token");
    const headers = { "Content-Type": "application/json", ...(options && options.headers) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, { ...options, headers }).then((r) => r.json());
  }

  async function mountBlackboard(container, opts) {
    if (!window.CasuyaBlackboard || !window.CasuyaBlackboard.Blackboard) {
      container.innerHTML =
        '<div style="padding:1rem;color:#b91c1c">Blackboard failed to load. Check your connection.</div>';
      return;
    }

    const lessonId = opts.lessonId || container.dataset.lessonId || "demo";
    let studentId = opts.studentId || null;
    const token = localStorage.getItem("casuya_token");
    if (token) {
      try {
        const me = await request("/students/me");
        studentId = me && (me.id || me.user_id);
      } catch (e) {}
    }

    const bb = new window.CasuyaBlackboard.Blackboard({
      container,
      graph: false,
      width: container.clientWidth || 800,
      height: container.clientHeight || 420,
    });

    // Store the instance on the element so consumers (e.g. assignment
    // submissions) can grab it via element._casuyaBlackboard.
    container._casuyaBlackboard = bb;

    let saveTimer = null;
    const startTime = Date.now();
    const sessionId = "bb-" + Math.random().toString(36).slice(2, 10);
    const syncProgress = () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const elements = bb.getElements ? bb.getElements() : [];
        const totalSteps = elements.length || 1;
        request("/progress/sync", {
          method: "POST",
          body: JSON.stringify({
            student_id: studentId || "anonymous",
            lesson_id: lessonId,
            session_id: sessionId,
            elapsed_ms: Date.now() - startTime,
            completion_percentage: Math.min(100, (totalSteps / Math.max(totalSteps, 1)) * 100),
          }),
        }).catch(() => {});
      }, 2000);
    };
    bb.on("change", syncProgress);

    // Expose helpers that talk to the blackboard REST endpoints directly.
    const api = {
      studentId,
      lessonId,
      blackboard: bb,
      submitExam(steps) {
        return request("/api/exams/submit", {
          method: "POST",
          body: JSON.stringify({
            lessonId,
            studentId: studentId || "anonymous",
            steps: steps || [],
          }),
        });
      },
      validateStep(step) {
        return request("/api/exams/validate-step", {
          method: "POST",
          body: JSON.stringify({ lessonId, studentId: studentId || "anonymous", step }),
        });
      },
      solveMath(equation) {
        return request("/api/math/solve", {
          method: "POST",
          body: JSON.stringify({ equation }),
        });
      },
      checkEquivalence(expr1, expr2) {
        return request("/api/math/equivalence", {
          method: "POST",
          body: JSON.stringify({ expr1, expr2 }),
        });
      },
    };

    window.dispatchEvent(new CustomEvent("casuya:blackboard-ready", { detail: { blackboard: bb, api } }));
  }

  function autoMount() {
    document.querySelectorAll("[data-blackboard]").forEach((el) => {
      if (el._casuyaMounted) return;
      el._casuyaMounted = true;
      mountBlackboard(el, {}).catch(() => {});
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }

  window.CasuyaBlackboardEmbed = { mountBlackboard, autoMount, request };
})();

