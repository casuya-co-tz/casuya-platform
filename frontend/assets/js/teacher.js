import {
  apiRequest,
  clearAuth,
  requireRole,
  redirectToLogin,
} from "./auth-client.js";

function renderTeacherShell() {
  const root = document.getElementById("teacher-root");
  if (!root) return;

  root.innerHTML = `
    <main class="portal-shell">
      <header class="portal-header">
        <div>
          <p>Authenticated as teacher</p>
          <h1>Teacher Portal</h1>
        </div>
        <button id="logout-button" type="button">Log out</button>
      </header>
      <section id="teacher-status" aria-live="polite">Loading overview...</section>
      <section class="portal-grid">
        <article class="portal-card">
          <h2>Total Students</h2>
          <p id="total-students">--</p>
        </article>
        <article class="portal-card">
          <h2>Total Lessons</h2>
          <p id="total-lessons">--</p>
        </article>
      </section>
    </main>
  `;

  document.getElementById("logout-button")?.addEventListener("click", () => {
    clearAuth();
    redirectToLogin();
  });
}

function updateStatus(message, isError = false) {
  const status = document.getElementById("teacher-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : "ready";
}

async function loadStats() {
  const auth = requireRole("teacher");
  if (!auth) return;

  renderTeacherShell();

  try {
    const data = await apiRequest("/analytics/overview");
    document.getElementById("total-students").textContent = String(data.total_students ?? 0);
    document.getElementById("total-lessons").textContent = String(data.total_lessons ?? 0);
    updateStatus(`Welcome back, ${auth.userId || "teacher"}.`);
  } catch (error) {
    updateStatus(error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", loadStats);
