import {
  apiRequest,
  clearAuth,
  requireRole,
  redirectToLogin,
} from "./auth-client.js";

function renderStudentShell() {
  const root = document.getElementById("student-root");
  if (!root) return;

  root.innerHTML = `
    <main class="portal-shell">
      <header class="portal-header">
        <div>
          <p>Authenticated as student</p>
          <h1>Student Portal</h1>
        </div>
        <button id="logout-button" type="button">Log out</button>
      </header>
      <section id="student-status" aria-live="polite">Loading lessons...</section>
      <section>
        <h2>Published Lessons</h2>
        <div id="lesson-list"></div>
      </section>
    </main>
  `;

  document.getElementById("logout-button")?.addEventListener("click", () => {
    clearAuth();
    redirectToLogin();
  });
}

function updateStatus(message, isError = false) {
  const status = document.getElementById("student-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : "ready";
}

async function loadLessons() {
  const auth = requireRole("student");
  if (!auth) return;

  renderStudentShell();

  try {
    const lessons = await apiRequest("/lessons?status=published");
    const container = document.getElementById("lesson-list");
    if (!container) return;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      container.innerHTML = "<p>No published lessons are available yet.</p>";
      updateStatus(`Welcome back, ${auth.userId || "student"}.`);
      return;
    }

    container.innerHTML = lessons
      .map(
        (lesson) => `
          <article class="lesson-card" data-id="${lesson.id}">
            <h3>${lesson.title}</h3>
            <p>${lesson.description || "Ready to open from the learning portal."}</p>
          </article>
        `,
      )
      .join("");

    updateStatus(`Welcome back, ${auth.userId || "student"}.`);
  } catch (error) {
    updateStatus(error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", loadLessons);
