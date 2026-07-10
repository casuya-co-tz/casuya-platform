import {
  apiRequest,
  clearAuth,
  requireRole,
  redirectToLogin,
} from "./auth-client.js";

function renderAdminShell() {
  const root = document.getElementById("admin-root");
  if (!root) return;

  root.innerHTML = `
    <main class="portal-shell">
      <header class="portal-header">
        <div>
          <p>Authenticated as admin</p>
          <h1>Admin Dashboard</h1>
        </div>
        <button id="logout-button" type="button">Log out</button>
      </header>
      <section id="admin-status" aria-live="polite">Loading analytics...</section>
      <section class="portal-grid">
        <article class="portal-card">
          <h2>Total Students</h2>
          <p id="total-students">--</p>
        </article>
        <article class="portal-card">
          <h2>Total Lessons</h2>
          <p id="total-lessons">--</p>
        </article>
        <article class="portal-card">
          <h2>Total Sessions</h2>
          <p id="total-sessions">--</p>
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
  const status = document.getElementById("admin-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : "ready";
}

async function loadAnalytics() {
  const auth = requireRole("admin");
  if (!auth) return;

  renderAdminShell();

  try {
    const data = await apiRequest("/analytics/overview");
    document.getElementById("total-students").textContent = String(data.total_students ?? 0);
    document.getElementById("total-lessons").textContent = String(data.total_lessons ?? 0);
    document.getElementById("total-sessions").textContent = String(data.total_sessions ?? 0);
    updateStatus(`Welcome back, ${auth.userId || "admin"}.`);
  } catch (error) {
    updateStatus(error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
