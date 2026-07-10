// Derive the API base the same way auth-client.js does: when the page is
// served from the API host (port 8000) use same-origin, otherwise assume the
// backend runs on :8000. This keeps dev (separate frontend port) and a
// reverse-proxied production deploy behaviour consistent.
const API_HOST = window.location.hostname || "localhost";
const API_PROTOCOL = (window.location.protocol === "http:" || window.location.protocol === "https:")
  ? window.location.protocol
  : "http:";
const API_BASE = window.location.port === "8000"
  ? window.location.origin
  : `${API_PROTOCOL}//${API_HOST}:8000`;

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

const requestCache = new Map();
const inFlight = new Map();
const CACHE_TTL = 30000;

async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (method === "GET") {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    if (inFlight.has(cacheKey)) {
      return inFlight.get(cacheKey);
    }
  } else {
    requestCache.clear();
  }

  const doFetch = async () => {
    const token = localStorage.getItem("casuya_token");
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
      try {
        let fetchUrl = `${API_BASE}${path}`;
        const resp = await fetch(fetchUrl, { ...options, headers });
        if (resp.status === 401) {
          localStorage.removeItem("casuya_token");
          renderLogin();
          return null;
        }
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ detail: resp.statusText }));
          if (resp.status >= 500 && attempt < 2) continue;
          throw new Error(err.detail || "Request failed");
        }
        const data = await resp.json();
        if (method === "GET") {
          requestCache.set(cacheKey, { data, timestamp: Date.now() });
        }
        return data;
      } catch (err) {
        lastErr = err;
        if ((err.name !== "TypeError" && err.name !== "SyntaxError") || attempt >= 2) break;
      }
    }
    throw lastErr;
  };

  const promise = doFetch().finally(() => inFlight.delete(cacheKey));
  if (method === "GET") {
    inFlight.set(cacheKey, promise);
  }
  return promise;
}

let _globalAbort = null;

function render(container, html) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return;
  if (_globalAbort) {
    const old = _globalAbort;
    Promise.resolve().then(() => old.abort());
  }
  _globalAbort = new AbortController();
  el.innerHTML = html;
}

function escapeHtml(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function showToast(msg) {
  let t = document.getElementById("global-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "global-toast";
    t.style.cssText = "position:fixed;bottom:1.5rem;right:1.5rem;padding:0.6rem 1.2rem;background:var(--color-success);color:#fff;border-radius:var(--radius);font-size:0.85rem;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => { t.style.opacity = "0"; }, 2500);
}

function confirmDelete(label) {
  return confirm(`Delete "${label}"? This cannot be undone.`);
}

function deleteBtn(id, label, endpoint, onDone) {
  return `<button class="btn btn-danger" data-delete="${id}" data-label="${escapeHtml(label)}" data-endpoint="${endpoint}" style="font-size:0.75rem;padding:0.2rem 0.5rem">Delete</button>`;
}

function initDeleteButtons() {
  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.delete;
      const label = btn.dataset.label;
      const endpoint = btn.dataset.endpoint;
      if (!confirmDelete(label)) return;
      try {
        await request(`${endpoint}/${id}`, { method: "DELETE" });
        showToast("Deleted!");
        btn.closest(".card")?.remove();
      } catch(err) { showToast(err.message || "Delete failed"); }
    });
  });
}

const lessonContentCache = new Map();

async function viewLessonContent(containerId, lessonId, backFn) {
  const container = document.querySelector(containerId);
  if (!container) return;
  container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading lesson...</p></div>`;

  let html;
  if (lessonContentCache.has(lessonId)) {
    html = lessonContentCache.get(lessonId);
  }

  try {
    // Fetch lesson metadata for title
    let lessonMeta = {};
    try { lessonMeta = await request(`/lessons/${lessonId}`); } catch(e) {}
    const lessonTitle = lessonMeta.title || "Lesson";

    // Update recently viewed title
    try {
      const recent = JSON.parse(localStorage.getItem("casuya_recent") || "[]");
      const idx = recent.findIndex(r => r.id === lessonId);
      if (idx >= 0) { recent[idx].title = lessonTitle; localStorage.setItem("casuya_recent", JSON.stringify(recent)); }
    } catch(e) {}

    if (!html) {
      const resp = await fetch(`${API_BASE}/lessons/${lessonId}/content`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token")}` },
      });
      if (!resp.ok) throw new Error("Failed to load lesson");
      html = await resp.text();
      lessonContentCache.set(lessonId, html);
      if (lessonContentCache.size > 50) {
        const key = lessonContentCache.keys().next().value;
        lessonContentCache.delete(key);
      }
    }

    const token = localStorage.getItem("casuya_token");
    const payload = decodeToken(token);
    const isStudent = payload?.role === "student";
    const canBookmark = isStudent || payload?.role === "teacher";
    const lessonStart = Date.now();
    let studentId = null;
    let sessionId = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    let quizScoreSent = false;
    let lastSentCompletion = -1;
    let lastSentScore = -1;
    let progressTimer = null;

    if (isStudent) {
      try {
        const students = await request("/students");
        if (Array.isArray(students)) {
          const my = students.find(s => s.user_id === payload.sub || s.id === payload.sub);
          if (my) studentId = my.id || my.user_id;
        }
      } catch(e) {}
    }

    function showToast(msg) {
      let t = container.querySelector(".lesson-toast");
      if (!t) { t = document.createElement("div"); t.className = "lesson-toast"; t.style.cssText = "position:sticky;bottom:0;padding:0.5rem 1rem;background:var(--color-success);color:#fff;text-align:center;font-size:0.85rem;transition:opacity 0.3s;z-index:10"; container.appendChild(t); }
      t.textContent = msg; t.style.opacity = "1";
      clearTimeout(t._hide); t._hide = setTimeout(() => { t.style.opacity = "0"; }, 2500);
    }

    function sendProgress(completionPct, scorePct) {
      if (!isStudent || !studentId) return;
      if (completionPct <= lastSentCompletion && (scorePct == null || scorePct <= lastSentScore)) return;
      lastSentCompletion = Math.max(lastSentCompletion, completionPct);
      if (scorePct != null) lastSentScore = Math.max(lastSentScore, scorePct);
      if (progressTimer) clearTimeout(progressTimer);
      progressTimer = setTimeout(() => {
        const elapsed = Date.now() - lessonStart;
        request("/progress/sync", {
          method: "POST",
          body: JSON.stringify({
            student_id: studentId,
            lesson_id: lessonId,
            session_id: sessionId,
            elapsed_ms: elapsed,
            completion_percentage: lastSentCompletion,
            score_percentage: lastSentScore >= 0 ? lastSentScore : null,
          }),
        }).then(() => showToast("Progress saved")).catch(() => {});
      }, 2000);
    }

    // Inject bridge script
    const bridgeScript = `
<script>
(function(){
  var scoreReported = false;
  window.casuya = window.casuya || {};
  window.casuya.reportScore = function(score, total) {
    parent.postMessage({type:'casuya-quiz', score:score, total:total}, '*');
    scoreReported = true;
  };
  window.casuya.reportProgress = function(pct) {
    parent.postMessage({type:'casuya-progress', percent:pct}, '*');
  };
  function detectScore() {
    if (scoreReported) return;
    var candidates = document.querySelectorAll('.score-big, .quiz-score, .final-score, .result-score, [class*=score]');
    for (var i = 0; i < candidates.length; i++) {
      var text = (candidates[i].textContent || '').trim();
      var m = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (m) {
        var s = parseInt(m[1]), t = parseInt(m[2]);
        if (t > 0 && s <= t) {
          parent.postMessage({type:'casuya-quiz', score:s, total:t}, '*');
          scoreReported = true;
          return;
        }
      }
    }
  }
  function trackVideos(root) {
    var videos = root.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      (function(v) {
        if (v.dataset.casuyaTracked) return;
        v.dataset.casuyaTracked = '1';
        var maxPct = 0;
        v.addEventListener('timeupdate', function() {
          if (v.duration) { var pct = Math.round((v.currentTime / v.duration) * 100); if (pct > maxPct) maxPct = pct; }
        });
        v.addEventListener('ended', function() { parent.postMessage({type:'casuya-video', percent:100}, '*'); });
        setInterval(function() { if (maxPct > 0) parent.postMessage({type:'casuya-progress', percent:Math.min(maxPct + 10, 100)}, '*'); }, 5000);
      })(videos[i]);
    }
  }
  function initBridge() {
    if (!document.body) { setTimeout(initBridge, 100); return; }
    trackVideos(document.body);
    detectScore();
    var obs = new MutationObserver(function() { detectScore(); trackVideos(document.body); });
    obs.observe(document.body, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBridge);
  else initBridge();
})();
<\/script>`;
    const bodyIdx = html.lastIndexOf("</body>");
    if (bodyIdx !== -1) {
      html = html.slice(0, bodyIdx) + bridgeScript + html.slice(bodyIdx);
    } else {
      html = html.replace("</html>", bridgeScript + "</html>");
    }

    // Fetch bookmark, quiz, games, notes in parallel
    let bookmarked = false;
    let quizData = null;
    let gamesData = [];
    let noteData = { content: "" };
    if (canBookmark) {
      try {
        [bookmarked, quizData, gamesData, noteData] = await Promise.all([
          request(`/bookmarks/${lessonId}/status`).then(r => r.bookmarked).catch(() => false),
          isStudent ? request(`/quizzes/by-lesson/${lessonId}`).catch(() => null) : null,
          isStudent ? request(`/games/by-lesson/${lessonId}`).catch(() => []) : [],
          isStudent ? request(`/notes/${lessonId}`).catch(() => ({ content: "" })) : { content: "" },
        ]);
      } catch(e) {}
    }

    const renderQuiz = () => {
      if (!quizData || !quizData.questions || quizData.questions.length === 0) return "";
      return `
        <div class="card" style="margin-top:1rem;padding:1rem">
          <h3 style="margin:0 0 0.75rem">${escapeHtml(quizData.title || "Quiz")}</h3>
          <form id="quiz-form">
            ${quizData.questions.map((q, qi) => `
              <div style="margin-bottom:1rem">
                <p style="font-weight:600;margin:0 0 0.5rem">${qi + 1}. ${escapeHtml(q.prompt)}</p>
                ${q.options.map(o => `
                  <label style="display:block;padding:0.3rem 0.5rem;cursor:pointer;border:1px solid var(--color-border);border-radius:var(--radius);margin-bottom:0.25rem">
                    <input type="radio" name="q_${escapeHtml(q.id)}" value="${escapeHtml(o.id)}" required> ${escapeHtml(o.text)}
                  </label>
                `).join("")}
              </div>
            `).join("")}
            <button type="submit" class="btn btn-primary" id="quiz-submit-btn">Submit Quiz</button>
          </form>
          <div id="quiz-result" style="display:none;margin-top:0.75rem"></div>
        </div>
      `;
    };

    const renderGames = () => {
      if (!Array.isArray(gamesData) || gamesData.length === 0) return "";
      return `
        <div class="card" style="margin-top:1rem;padding:1rem">
          <h3 style="margin:0 0 0.5rem">Games & Activities</h3>
          ${gamesData.map(g => `
            <div class="game-item" data-game-id="${escapeHtml(g.id)}" style="padding:0.5rem 0;border-bottom:1px solid var(--color-border);cursor:pointer">
              <span style="color:var(--color-primary)">${escapeHtml(g.title || "Game")}</span>
              <span style="color:var(--color-text-muted);font-size:0.8rem;margin-left:0.5rem">${escapeHtml(g.status || "draft")}</span>
            </div>
          `).join("")}
          <div id="game-content-area" style="margin-top:1rem"></div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="content" style="max-width:100%;padding:0">
        <div style="padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;background:var(--color-surface);border-bottom:1px solid var(--color-border);flex-wrap:wrap">
          <button class="btn btn-primary lesson-back-btn" style="margin-bottom:0">&larr; Back</button>
          <span style="flex:1;font-weight:600;font-size:0.95rem">${escapeHtml(lessonTitle)}</span>
          ${canBookmark ? `
            <button class="btn btn-sm lesson-bookmark-btn" style="${bookmarked ? 'background:var(--color-warning);color:#fff' : ''};margin-bottom:0">${bookmarked ? "★" : "☆"}</button>
          ` : ""}
          ${isStudent ? `
            <button class="btn btn-success btn-sm lesson-complete-btn" style="margin-bottom:0">Mark Complete</button>
          ` : ""}
        </div>
        <div style="width:100%">
          <iframe class="lesson-iframe" style="width:100%;border:none;display:block"></iframe>
        </div>
        ${isStudent ? `
          <div style="padding:0 1rem">
            <details style="margin-top:0.75rem">
              <summary style="cursor:pointer;font-weight:600;font-size:0.9rem;color:var(--color-text-muted)">📝 My Notes</summary>
              <div style="margin-top:0.5rem">
                <textarea id="lesson-notes" rows="4" style="width:100%;padding:0.5rem;border:1px solid var(--color-border);border-radius:var(--radius);font-size:0.85rem">${escapeHtml(noteData?.content || "")}</textarea>
                <button class="btn btn-sm btn-primary" id="notes-save-btn" style="margin-top:0.35rem">Save Notes</button>
                <span id="notes-status" style="font-size:0.8rem;color:var(--color-text-muted);margin-left:0.5rem"></span>
              </div>
            </details>
            ${renderQuiz()}
            ${renderGames()}
          </div>
        ` : ""}
      </div>
    `;

    const iframe = container.querySelector(".lesson-iframe");
    iframe.srcdoc = html;
    let heightSet = false;
    const setHeight = () => {
      if (heightSet) return;
      try {
        const doc = iframe.contentWindow?.document;
        if (doc) {
          iframe.style.height = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0, 300) + "px";
          heightSet = true;
        }
      } catch(e) {}
    };
    iframe.addEventListener("load", setHeight);
    const poll = setInterval(() => { setHeight(); if (heightSet) clearInterval(poll); }, 300);
    setTimeout(() => { clearInterval(poll); if (!heightSet) iframe.style.height = "800px"; }, 10000);

    const onMessage = (e) => {
      if (e.data?.type === "casuya-quiz" && e.data.score != null && e.data.total > 0) {
        quizScoreSent = true;
        const pct = Math.round((e.data.score / e.data.total) * 100);
        sendProgress(100, pct);
      } else if (e.data?.type === "casuya-progress" && e.data.percent != null) {
        sendProgress(e.data.percent, null);
      }
    };
    window.addEventListener("message", onMessage);

    if (isStudent) {
      const completeBtn = container.querySelector(".lesson-complete-btn");
      if (completeBtn) {
        completeBtn.addEventListener("click", () => {
          sendProgress(100, null);
          completeBtn.textContent = "✓ Complete!";
          completeBtn.disabled = true;
          completeBtn.style.opacity = "0.6";
        });
      }

      // Bookmark toggle
      const bmBtn = container.querySelector(".lesson-bookmark-btn");
      if (bmBtn) {
        bmBtn.addEventListener("click", async () => {
          try {
            if (bookmarked) {
              await request(`/bookmarks/${lessonId}`, { method: "DELETE" });
              bookmarked = false; bmBtn.textContent = "☆"; bmBtn.style.background = "";
              showToast("Bookmark removed");
            } else {
              await request(`/bookmarks/${lessonId}`, { method: "POST" });
              bookmarked = true; bmBtn.textContent = "★"; bmBtn.style.background = "var(--color-warning)"; bmBtn.style.color = "#fff";
              showToast("Bookmarked!");
            }
          } catch(e) { showToast("Failed to update bookmark"); }
        });
      }

      // Notes save
      document.getElementById("notes-save-btn")?.addEventListener("click", async () => {
        const content = document.getElementById("lesson-notes")?.value || "";
        const status = document.getElementById("notes-status");
        try {
          await request(`/notes/${lessonId}`, { method: "PUT", body: JSON.stringify({ content }) });
          status.textContent = "Saved ✓";
          setTimeout(() => status.textContent = "", 2000);
        } catch(e) { status.textContent = "Failed to save"; }
      });

      // Quiz submission
      document.getElementById("quiz-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("quiz-submit-btn");
        btn.disabled = true; btn.textContent = "Submitting...";
        const answers = {};
        if (quizData && quizData.questions) {
          quizData.questions.forEach(q => {
            const sel = document.querySelector(`input[name="q_${q.id}"]:checked`);
            if (sel) answers[q.id] = sel.value;
          });
        }
        try {
          const result = await request(`/quizzes/${quizData.id}/submit`, {
            method: "POST", body: JSON.stringify({ answers }),
          });
          const el = document.getElementById("quiz-result");
          el.style.display = "block";
          el.innerHTML = `
            <p style="font-weight:600">Score: ${result.score} / ${result.total} (${Math.round(result.percentage)}%)</p>
            ${result.percentage >= 50 ? '<p style="color:var(--color-success)">✅ Passed!</p>' : '<p style="color:red">❌ Try again</p>'}
          `;
          sendProgress(100, result.percentage);
          quizScoreSent = true;
        } catch(err) {
          document.getElementById("quiz-result").style.display = "block";
          document.getElementById("quiz-result").innerHTML = `<p style="color:red">Error: ${escapeHtml(err.message)}</p>`;
        }
        btn.disabled = false; btn.textContent = "Submit Quiz";
      });
    }

    document.querySelectorAll(".game-item").forEach(item => {
      item.addEventListener("click", async () => {
        const gameId = item.dataset.gameId;
        const area = document.getElementById("game-content-area");
        if (!area) return;
        area.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading game...</p></div>';
        try {
          const resp = await fetch(`/games/${gameId}/content`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token")}` },
          });
          if (!resp.ok) throw new Error("Failed to load game content");
          const html = await resp.text();
          area.innerHTML = `<iframe style="width:100%;min-height:400px;border:none;border-radius:var(--radius)" srcdoc="${escapeHtml(html)}"></iframe>`;
        } catch(err) {
          area.innerHTML = `<p style="color:var(--color-danger)">Error loading game: ${escapeHtml(err.message)}</p>`;
        }
      });
    });

    const backBtn = container.querySelector(".lesson-back-btn");
    backBtn.addEventListener("click", () => {
      if (isStudent && !quizScoreSent) sendProgress(80, null);
      window.removeEventListener("message", onMessage);
      backFn();
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`;
  }
}

// --- Login ---

function renderLogin() {
  render("#app", `
    <div class="page login-page">
      <div class="login-card">
        <h1>Casuya Platform</h1>
        <p>Sign in to continue</p>
        <form id="login-form">
          <input type="text" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Sign In</button>
          <p class="error" id="login-error" style="display:none"></p>
        </form>
      </div>
    </div>
  `);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const errorEl = document.getElementById("login-error");
  errorEl.style.display = "none";
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data && data.access_token) {
      localStorage.setItem("casuya_token", data.access_token);
      renderApp();
    } else {
      errorEl.textContent = data?.detail || "Login failed";
      errorEl.style.display = "block";
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = "block";
  }
}

function handleLogout() {
  localStorage.removeItem("casuya_token");
  window.location.href = "/index.html#features";
}

// --- App Router ---

function renderApp() {
  const token = localStorage.getItem("casuya_token");
  const payload = decodeToken(token);
  const role = payload.role || "student";
  if (role === "admin") {
    renderAdminDashboard();
  } else if (role === "student") {
    renderStudentDashboard();
  } else if (role === "teacher") {
    renderTeacherDashboard();
  } else {
    render("#app", `<div class="page" style="padding:2rem"><h2>${escapeHtml(role)} dashboard coming soon</h2></div>`);
  }
}

function showLoading() {
  render("#admin-content", `<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>`);
}

function showError(msg) {
  render("#admin-content", `<div class="empty-state"><h2>Error</h2><p>${escapeHtml(msg)}</p></div>`);
}

// --- Admin: Dashboard ---

// (old simple admin dashboard removed — full version at line 1269+)

// --- Admin: Subjects ---

async function renderAdminSubjects() {
  showLoading();
  try {
    const subjects = await request("/subjects");
    if (subjects === null) return;
    render("#admin-content", `
      <h2>Subjects</h2>
      <button class="btn btn-primary" id="add-subject-btn" style="margin:1rem 0">+ Add Subject</button>
      <div id="subject-form-area"></div>
      <div class="card-grid">
        ${subjects.length === 0 ? '<div class="empty-state"><p>No subjects yet</p></div>' :
          subjects.map(s => `
            <div class="card">
              <h3>${escapeHtml(s.name)}</h3>
              <p style="color:var(--color-text-muted)">${escapeHtml(s.slug || "")}</p>
            </div>
          `).join("")}
      </div>
    `);
    document.getElementById("add-subject-btn")?.addEventListener("click", () => {
      render("#subject-form-area", `
        <div class="card" style="margin-bottom:1rem">
          <h3>New Subject</h3>
          <form id="subject-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            <input class="input" name="name" placeholder="Subject name (e.g. Mathematics)" required />
            <input class="input" name="slug" placeholder="Slug (e.g. mathematics)" required />
            <button class="btn btn-success" type="submit">Save</button>
          </form>
        </div>
      `);
      document.getElementById("subject-form").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        try {
          await request("/subjects", { method: "POST", body: JSON.stringify({ name: fd.get("name"), slug: fd.get("slug") }) });
          renderAdminSubjects();
        } catch (err) { showError(err.message); }
      });
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Topics ---

async function renderAdminTopics() {
  showLoading();
  try {
    const [topics, subjects] = await Promise.all([
      request("/topics"),
      request("/subjects"),
    ]);
    if (topics === null || subjects === null) return;
    const subjectMap = {};
    if (Array.isArray(subjects)) subjects.forEach(s => subjectMap[s.id] = s.name);
    render("#admin-content", `
      <h2>Topics</h2>
      <button class="btn btn-primary" id="add-topic-btn" style="margin:1rem 0">+ Add Topic</button>
      <div id="topic-form-area"></div>
      <div class="card-grid">
        ${!Array.isArray(topics) || topics.length === 0 ? '<div class="empty-state"><p>No topics yet</p></div>' :
          topics.map(t => `
            <div class="card">
              <h3>${escapeHtml(t.title)}</h3>
              <p>${escapeHtml(subjectMap[t.subject_id] || "No subject")} ${t.form_level ? `&mdash; ${escapeHtml(t.form_level)}` : ""}</p>
            </div>
          `).join("")}
      </div>
    `);
    document.getElementById("add-topic-btn")?.addEventListener("click", () => {
      render("#topic-form-area", `
        <div class="card" style="margin-bottom:1rem">
          <h3>New Topic</h3>
          <form id="topic-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            <input class="input" name="title" placeholder="Topic title" required />
            <select class="input" name="subject_id" required>
              <option value="">Select subject...</option>
              ${subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}
            </select>
            <select class="input" name="form_level" required>
              <option value="">Form level...</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
              <option value="form4">Form 4</option>
            </select>
            <button class="btn btn-success" type="submit">Save</button>
          </form>
        </div>
      `);
      document.getElementById("topic-form").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        try {
          await request("/topics", { method: "POST", body: JSON.stringify({ title: fd.get("title"), subject_id: fd.get("subject_id"), form_level: fd.get("form_level") }) });
          renderAdminTopics();
        } catch (err) { showError(err.message); }
      });
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Subtopics ---

async function renderAdminSubtopics() {
  showLoading();
  try {
    const [subtopics, topics] = await Promise.all([
      request("/subtopics"),
      request("/topics"),
    ]);
    if (subtopics === null || topics === null) return;
    const topicMap = {};
    if (Array.isArray(topics)) topics.forEach(t => topicMap[t.id] = t.title);
    render("#admin-content", `
      <h2>Subtopics</h2>
      <button class="btn btn-primary" id="add-subtopic-btn" style="margin:1rem 0">+ Add Subtopic</button>
      <div id="subtopic-form-area"></div>
      <div class="card-grid">
        ${!Array.isArray(subtopics) || subtopics.length === 0 ? '<div class="empty-state"><p>No subtopics yet</p></div>' :
          subtopics.map(st => `
            <div class="card">
              <h3>${escapeHtml(st.title)}</h3>
              <p>${escapeHtml(topicMap[st.topic_id] || "No topic")}</p>
            </div>
          `).join("")}
      </div>
    `);
    document.getElementById("add-subtopic-btn")?.addEventListener("click", () => {
      render("#subtopic-form-area", `
        <div class="card" style="margin-bottom:1rem">
          <h3>New Subtopic</h3>
          <form id="subtopic-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            <input class="input" name="title" placeholder="Subtopic title" required />
            <select class="input" name="topic_id" required>
              <option value="">Select topic...</option>
              ${topics.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join("")}
            </select>
            <button class="btn btn-success" type="submit">Save</button>
          </form>
        </div>
      `);
      document.getElementById("subtopic-form").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        try {
          await request("/subtopics", { method: "POST", body: JSON.stringify({ title: fd.get("title"), topic_id: fd.get("topic_id") }) });
          renderAdminSubtopics();
        } catch (err) { showError(err.message); }
      });
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Lessons ---

async function renderAdminLessons() {
  showLoading();
  try {
    const [lessons, subtopics] = await Promise.all([
      request("/lessons"),
      request("/subtopics"),
    ]);
    if (lessons === null) return;
    render("#admin-content", `
      <h2>Lessons</h2>
      <button class="btn btn-primary" id="add-lesson-btn" style="margin:1rem 0">+ Add Lesson</button>
      <div id="lesson-form-area"></div>
      <div class="card-grid" style="margin-top:1rem">
        ${!Array.isArray(lessons) || lessons.length === 0 ? '<div class="empty-state"><p>No lessons yet</p></div>' :
          lessons.map(l => `
            <div class="card lesson-card clickable" data-id="${escapeHtml(l.id)}">
              <h3>${escapeHtml(l.title)}</h3>
              <p>Status: ${escapeHtml(l.status)}</p>
              ${l.status === "draft" ? `<button class="btn btn-sm btn-success publish-btn" data-id="${escapeHtml(l.id)}" style="margin-top:0.5rem">Publish</button>` : ""}
            </div>
          `).join("")}
      </div>
    `);
    document.querySelectorAll("#admin-content .lesson-card.clickable").forEach(el => {
      el.addEventListener("click", (e) => { if (!e.target.classList.contains("publish-btn")) viewLessonContent("#admin-content", el.dataset.id, renderAdminLessons); });
    });
    document.querySelectorAll("#admin-content .publish-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await request(`/lessons/${btn.dataset.id}/publish`, { method: "POST" });
          renderAdminLessons();
        } catch (err) { showError(err.message); }
      });
    });
    document.getElementById("add-lesson-btn")?.addEventListener("click", () => {
      render("#lesson-form-area", `
        <div class="card" style="margin-bottom:1rem">
          <h3>New Lesson</h3>
          <form id="lesson-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            <input class="input" name="title" placeholder="Lesson title" required />
            <input class="input" name="slug" placeholder="Slug (e.g. introduction-to-algebra)" required />
            <select class="input" name="subtopic_id" required>
              <option value="">Select subtopic...</option>
              ${Array.isArray(subtopics) ? subtopics.map(st => `<option value="${st.id}">${escapeHtml(st.title)}</option>`).join("") : ""}
            </select>
            <textarea class="input" name="html_content" rows="10" placeholder="Lesson HTML content..." required></textarea>
            <button class="btn btn-success" type="submit">Save Lesson</button>
          </form>
        </div>
      `);
      document.getElementById("lesson-form").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        try {
          await request("/lessons", { method: "POST", body: JSON.stringify({ subtopic_id: fd.get("subtopic_id"), title: fd.get("title"), slug: fd.get("slug"), html_content: fd.get("html_content") }) });
          renderAdminLessons();
        } catch (err) { showError(err.message); }
      });
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Users ---

async function renderAdminUsers() {
  showLoading();
  try {
    const [students, teachers] = await Promise.all([
      request("/students"),
      request("/teachers"),
    ]);
    if (students === null || teachers === null) return;
    render("#admin-content", `
      <h2>Users</h2>
      <h3 style="margin-top:1.5rem">Students (${Array.isArray(students) ? students.length : 0})</h3>
      <div class="card-grid" style="margin-top:0.5rem">
        ${!Array.isArray(students) || students.length === 0 ? '<div class="empty-state"><p>No students</p></div>' :
          students.map(s => `
            <div class="card">
              <h3>${escapeHtml(s.full_name || s.user_id)}</h3>
              <p>${escapeHtml(s.email || "")}</p>
            </div>
          `).join("")}
      </div>
      <h3 style="margin-top:1.5rem">Teachers (${Array.isArray(teachers) ? teachers.length : 0})</h3>
      <div class="card-grid" style="margin-top:0.5rem">
        ${!Array.isArray(teachers) || teachers.length === 0 ? '<div class="empty-state"><p>No teachers</p></div>' :
          teachers.map(t => `
            <div class="card">
              <h3>${escapeHtml(t.full_name || t.user_id)}</h3>
              <p>${escapeHtml(t.email || "")}</p>
            </div>
          `).join("")}
      </div>
    `);
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Analytics ---

async function renderAdminAnalytics() {
  showLoading();
  try {
    const overview = await request("/analytics/overview");
    if (overview === null) return;
    render("#admin-content", `
      <h2>Analytics</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1rem">
        <div class="card"><h3>Total Students</h3><p style="font-size:2rem;font-weight:700">${overview.total_students ?? 0}</p></div>
        <div class="card"><h3>Total Lessons</h3><p style="font-size:2rem;font-weight:700">${overview.total_lessons ?? 0}</p></div>
        <div class="card"><h3>Total Sessions</h3><p style="font-size:2rem;font-weight:700">${overview.total_sessions ?? 0}</p></div>
        <div class="card"><h3>Avg Completion</h3><p style="font-size:2rem;font-weight:700">${(overview.avg_completion_rate ?? 0) }%</p></div>
      </div>
    `);
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Quizzes ---

async function renderAdminQuizzes() {
  showLoading();
  try {
    const lessons = await request("/lessons");
    if (lessons === null) return;
    render("#admin-content", `
      <h2>Quizzes</h2>
      <div style="margin:1rem 0">
        <label>Select lesson to view quiz:</label>
        <select class="input" id="quiz-lesson-select" style="margin-top:0.25rem">
          <option value="">Choose a lesson...</option>
          ${Array.isArray(lessons) ? lessons.map(l => `<option value="${l.id}">${escapeHtml(l.title)}</option>`).join("") : ""}
        </select>
      </div>
      <div id="quiz-results"></div>
      <button class="btn btn-primary" id="add-quiz-btn" style="margin:1rem 0">+ Create Quiz</button>
      <div id="quiz-form-area"></div>
    `);
    document.getElementById("quiz-lesson-select")?.addEventListener("change", async (e) => {
      const lessonId = e.target.value;
      if (!lessonId) return;
      try {
        const data = await request(`/quizzes/${lessonId}`);
        if (data === null) return;
        render("#quiz-results", `
          <div class="card" style="margin-bottom:1rem">
            <h3>${escapeHtml(data.title || "Untitled Quiz")}</h3>
            <p>${Array.isArray(data.questions) ? `${data.questions.length} questions` : ""}</p>
          </div>
        `);
      } catch (err) {
        if (err.message.includes("not found")) {
          render("#quiz-results", `<div class="empty-state"><p>No quiz for this lesson yet</p></div>`);
        } else {
          showError(err.message);
        }
      }
    });
    document.getElementById("add-quiz-btn")?.addEventListener("click", () => {
      render("#quiz-form-area", `
        <div class="card" style="margin-bottom:1rem">
          <h3>New Quiz</h3>
          <form id="quiz-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            <input class="input" name="title" placeholder="Quiz title" required />
            <select class="input" name="lesson_id" required>
              <option value="">Select lesson...</option>
              ${Array.isArray(lessons) ? lessons.map(l => `<option value="${l.id}">${escapeHtml(l.title)}</option>`).join("") : ""}
            </select>
            <div id="questions-area">
              <p style="color:var(--color-text-muted);font-size:0.85rem">Questions (JSON format: [{"prompt":"...","options":[{"text":"...","is_correct":true},...]}])</p>
              <textarea class="input" name="questions" rows="6" placeholder='[{"prompt":"What is 2+2?","options":[{"text":"3","is_correct":false},{"text":"4","is_correct":true},{"text":"5","is_correct":false}]}]' required></textarea>
            </div>
            <button class="btn btn-success" type="submit">Save Quiz</button>
          </form>
        </div>
      `);
      document.getElementById("quiz-form").addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        try {
          const questions = JSON.parse(fd.get("questions"));
          await request("/quizzes", { method: "POST", body: JSON.stringify({ lesson_id: fd.get("lesson_id"), title: fd.get("title"), questions }) });
          render("#quiz-form-area", `<p style="color:var(--color-success)">Quiz created!</p>`);
        } catch (err) { showError(err.message); }
      });
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Progress ---

async function renderAdminProgress() {
  showLoading();
  try {
    const students = await request("/students");
    if (students === null) return;
    render("#admin-content", `
      <h2>Student Progress</h2>
      <div style="margin:1rem 0">
        <label>Select student:</label>
        <select class="input" id="progress-student-select" style="margin-top:0.25rem">
          <option value="">Choose a student...</option>
          ${Array.isArray(students) ? students.map(s => `<option value="${s.user_id || s.id}">${escapeHtml(s.full_name || s.user_id)}</option>`).join("") : ""}
        </select>
      </div>
      <div id="progress-results"></div>
    `);
    document.getElementById("progress-student-select")?.addEventListener("change", async (e) => {
      const studentId = e.target.value;
      if (!studentId) return;
      try {
        const data = await request(`/progress/${studentId}`);
        if (data === null) return;
        render("#progress-results", `
          <h3>Progress Records</h3>
          ${!Array.isArray(data) || data.length === 0 ? '<div class="empty-state"><p>No progress records</p></div>' :
            `<div style="overflow-x:auto">
              <table class="card" style="width:100%;border-collapse:collapse">
                <tr style="border-bottom:1px solid var(--color-border)">
                  <th style="padding:0.5rem;text-align:left">Lesson</th>
                  <th style="padding:0.5rem;text-align:left">Completion</th>
                  <th style="padding:0.5rem;text-align:left">Score</th>
                  <th style="padding:0.5rem;text-align:left">Date</th>
                </tr>
                ${data.map(r => `
                  <tr style="border-bottom:1px solid var(--color-border)">
                    <td style="padding:0.5rem">${escapeHtml(r.lesson_id || "")}</td>
                    <td style="padding:0.5rem">${r.completion_percentage ?? 0}%</td>
                    <td style="padding:0.5rem">${r.score_percentage ?? 0}%</td>
                    <td style="padding:0.5rem">${r.synced_at ? new Date(r.synced_at).toLocaleDateString() : ""}</td>
                  </tr>
                `).join("")}
              </table>
            </div>`
          }
        `);
      } catch (err) { showError(err.message); }
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Notifications ---

async function renderAdminNotifications() {
  showLoading();
  try {
    const notifications = await request("/notifications");
    if (notifications === null) return;
    render("#admin-content", `
      <h2>Notifications</h2>
      <div style="margin-top:1rem">
        ${!Array.isArray(notifications) || notifications.length === 0 ? '<div class="empty-state"><p>No notifications</p></div>' :
          notifications.map(n => `
            <div class="card" style="margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center">
              <div>
                <p>${escapeHtml(n.message)}</p>
                <small style="color:var(--color-text-muted)">${n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small>
              </div>
              <span style="color:${n.is_read ? 'var(--color-text-muted)' : 'var(--color-primary)'};font-size:0.85rem">${n.is_read ? "Read" : "New"}</span>
            </div>
          `).join("")}
      </div>
    `);
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Uploads ---

async function renderAdminUploads() {
  showLoading();
  render("#admin-content", `
    <h2>Uploads</h2>
    <div class="card" style="margin-top:1rem">
      <h3>Upload File</h3>
      <p style="color:var(--color-text-muted);font-size:0.85rem;margin-bottom:0.5rem">Supports images (png, jpg, gif, svg), videos (mp4, webm), audio (mp3, wav, ogg)</p>
      <form id="upload-form" style="display:flex;flex-direction:column;gap:0.5rem">
        <input class="input" type="file" id="upload-file" required />
        <button class="btn btn-success" type="submit">Upload</button>
      </form>
      <div id="upload-result" style="margin-top:0.5rem"></div>
    </div>
  `);
  document.getElementById("upload-form")?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fileInput = document.getElementById("upload-file");
    const file = fileInput?.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("casuya_token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const resp = await fetch("http://localhost:8001/uploads/", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok) {
        render("#upload-result", `<p style="color:var(--color-success)">Uploaded: ${escapeHtml(data.filename)} → ${escapeHtml(data.path)}</p>`);
      } else {
        render("#upload-result", `<p style="color:var(--color-danger)">Error: ${escapeHtml(data.detail || "Upload failed")}</p>`);
      }
    } catch (err) {
      render("#upload-result", `<p style="color:var(--color-danger)">${escapeHtml(err.message)}</p>`);
    }
  });
}

// --- Admin: Search ---

async function renderAdminSearch() {
  render("#admin-content", `
    <h2>Search</h2>
    <div style="margin:1rem 0">
      <input class="input" id="search-query" placeholder="Search lessons, subjects, topics..." style="max-width:500px" />
      <button class="btn btn-primary" id="search-btn" style="margin-left:0.5rem">Search</button>
    </div>
    <div id="search-results"></div>
  `);
  async function doSearch() {
    const q = document.getElementById("search-query")?.value;
    if (!q) return;
    try {
      const data = await request(`/search/?q=${encodeURIComponent(q)}`);
      if (data === null) return;
      const results = Array.isArray(data) ? data : [];
      render("#search-results", `
        <h3>Results (${results.length})</h3>
        <div class="card-grid" style="margin-top:0.5rem">
          ${results.length === 0 ? '<div class="empty-state"><p>No results found</p></div>' :
            results.map(r => `
              <div class="card">
                <h3>${escapeHtml(r.title || r.name || "")}</h3>
                <p style="color:var(--color-text-muted)">${escapeHtml(r.type || "")} ${r.status ? `&mdash; ${escapeHtml(r.status)}` : ""}</p>
              </div>
            `).join("")}
        </div>
      `);
    } catch (err) { showError(err.message); }
  }
  document.getElementById("search-btn")?.addEventListener("click", doSearch);
  document.getElementById("search-query")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
}

// --- Admin: Games ---

async function renderAdminGames() {
  showLoading();
  try {
    const lessons = await request("/lessons");
    if (lessons === null) return;
    render("#admin-content", `
      <h2>Games</h2>
      <div style="margin:1rem 0">
        <label>Select lesson to view games:</label>
        <select class="input" id="games-lesson-select" style="margin-top:0.25rem">
          <option value="">Choose a lesson...</option>
          ${Array.isArray(lessons) ? lessons.map(l => `<option value="${l.id}">${escapeHtml(l.title)}</option>`).join("") : ""}
        </select>
      </div>
      <div id="games-results"></div>
    `);
    document.getElementById("games-lesson-select")?.addEventListener("change", async (e) => {
      const lessonId = e.target.value;
      if (!lessonId) return;
      try {
        const data = await request(`/games/${lessonId}`);
        if (data === null) return;
        render("#games-results", `
          <h3>Games (${Array.isArray(data) ? data.length : 0})</h3>
          <div class="card-grid" style="margin-top:0.5rem">
            ${!Array.isArray(data) || data.length === 0 ? '<div class="empty-state"><p>No games for this lesson</p></div>' :
              data.map(g => `
                <div class="card">
                  <h3>${escapeHtml(g.title || "Untitled")}</h3>
                  <p style="color:var(--color-text-muted)">${g.package_path ? `Package: ${escapeHtml(g.package_path)}` : ""}</p>
                </div>
              `).join("")}
          </div>
        `);
      } catch (err) { showError(err.message); }
    });
  } catch (err) {
    showError(err.message);
  }
}

// --- Admin: Payments ---

async function renderAdminPayments() {
  showLoading();
  render("#admin-content", `
    <h2>Payments</h2>
    <p style="color:var(--color-text-muted);margin-bottom:1rem">AzamPay mobile money integration</p>
    <div class="card" style="max-width:500px">
      <h3>Initiate Checkout</h3>
      <form id="payment-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
        <input class="input" name="mobile_number" placeholder="Mobile number (e.g. 0712345678)" required />
        <input class="input" name="amount_tzs" type="number" placeholder="Amount (TZS)" required />
        <select class="input" name="provider" required>
          <option value="">Select provider...</option>
          <option value="azampay">AzamPay</option>
          <option value="m-pesa">M-Pesa</option>
          <option value="tigo-pesa">Tigo Pesa</option>
          <option value="halopesa">HaloPesa</option>
        </select>
        <button class="btn btn-success" type="submit">Initiate Payment</button>
      </form>
      <div id="payment-result" style="margin-top:0.5rem"></div>
    </div>
  `);
  document.getElementById("payment-form")?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    try {
      const data = await request("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          mobile_number: fd.get("mobile_number"),
          amount_tzs: parseInt(fd.get("amount_tzs"), 10),
          provider: fd.get("provider"),
          idempotency_key: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        }),
      });
      if (data === null) return;
      render("#payment-result", `<p style="color:var(--color-success)">Payment initiated: ${escapeHtml(JSON.stringify(data))}</p>`);
    } catch (err) {
      render("#payment-result", `<p style="color:var(--color-danger)">${escapeHtml(err.message)}</p>`);
    }
  });
}

// --- Admin: Portals ---

function renderAdminPortals() {
  render("#admin-content", `
    <h2>Portals</h2>
    <p style="color:var(--color-text-muted);margin-bottom:1rem">Access the dedicated portals for each role</p>
    <div class="card-grid">
      <div class="card">
        <h3>Student Portal</h3>
        <p>Browse and study published lessons, take quizzes, play games, track progress.</p>
        <a href="/student/" target="_blank" class="btn btn-primary" style="margin-top:0.5rem;display:inline-block">Open Student Portal &rarr;</a>
      </div>
      <div class="card">
        <h3>Teacher Portal</h3>
        <p>View student stats, lesson analytics, and class performance.</p>
        <a href="/teacher/" target="_blank" class="btn btn-primary" style="margin-top:0.5rem;display:inline-block">Open Teacher Portal &rarr;</a>
      </div>
      <div class="card">
        <h3>Admin Portal</h3>
        <p>Dedicated admin dashboard with user management and platform controls.</p>
        <a href="/admin/" target="_blank" class="btn btn-primary" style="margin-top:0.5rem;display:inline-block">Open Admin Portal &rarr;</a>
      </div>
    </div>
  `);
}

// --- Admin: System ---

function renderAdminSystem() {
  render("#admin-content", `
    <h2>System Overview</h2>
    <p style="color:var(--color-text-muted);margin-bottom:1rem">All packages and features available in the Casuya ecosystem</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">
      ${[
        { name: "Casuya Platform", status: "Active", desc: "Backend API (FastAPI) with auth, lessons, quizzes, games, progress, analytics, payments, notifications, search, uploads, subjects, topics, subtopics" },
        { name: "Casuya API Gateway", status: "Active", desc: "Express-based REST/GraphQL/WebSocket gateway with contract registry, caching, monitoring, versioning" },
        { name: "Casuya Bridge", status: "Available", desc: "Offline-first sync engine with IndexedDB storage, conflict resolution, background sync, client-side encryption" },
        { name: "Casuya Runtime", status: "Available", desc: "Sandboxed lesson content runtime with renderers (HTML/CSS/Canvas/Media), security policies, session management" },
        { name: "Casuya Core (Python)", status: "Available", desc: "Lesson packaging, compiling, signing, validation, versioning, compression" },
        { name: "Casuya AI", status: "Available", desc: "AI tutoring, content recommendations, quiz generation, learning paths, summarization, translation" },
        { name: "Casuya Exams", status: "Available", desc: "Question bank, exam builder, scheduling, auto-grading, certificates, reports, security" },
        { name: "Casuya Content", status: "Available", desc: "Content repository, taxonomies, categories, tags, publishing workflows, versioning, import/export" },
        { name: "Casuya Media", status: "Available", desc: "Image/video/audio processing: transcoding, thumbnails, compression, streaming, storage" },
        { name: "Casuya Analytics", status: "Available", desc: "ETL pipelines, trend analysis, anomaly detection, predictions, CSV/JSON exports" },
        { name: "Casuya Search", status: "Available", desc: "Full-text indexing, ranking, autocomplete suggestions, faceted filtering, recommendations" },
        { name: "Casuya Notifications", status: "Available", desc: "Multi-channel (in-app/email/SMS/push), templates, scheduling, retries, delivery tracking" },
        { name: "Casuya Payments", status: "Available", desc: "Payment engine, subscriptions, refunds, invoices, billing, reconciliation, fraud detection" },
        { name: "Casuya Auth", status: "Available", desc: "Authentication, authorization, MFA, SSO (Google/Microsoft/OAuth), sessions, audit" },
        { name: "Casuya Design System", status: "Available", desc: "30+ React components, 8 hooks, design tokens, themes (light/dark/high-contrast), icons, a11y" },
        { name: "Casuya DevTools", status: "Active", desc: "CLI with 12 commands, repo generators, architecture validation, automation tasks" },
        { name: "Casuya Common", status: "Available", desc: "Shared utilities: strings, arrays, objects, errors, validators, crypto, dates, logging" },
        { name: "Casuya Orchestrator", status: "Active", desc: "Workflow engine, deployment pipelines (blue-green/canary), monitoring, security, governance, plugins" },
      ].map(p => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
            <h3 style="font-size:0.95rem">${escapeHtml(p.name)}</h3>
            <span style="font-size:0.75rem;padding:0.15rem 0.4rem;border-radius:4px;background:${p.status === 'Active' ? '#dcfce7' : '#f0f0f0'};color:${p.status === 'Active' ? '#16a34a' : '#64748b'}">${escapeHtml(p.status)}</span>
          </div>
          <p style="font-size:0.85rem;color:var(--color-text-muted)">${escapeHtml(p.desc)}</p>
        </div>
      `).join("")}
    </div>
  `);
}

// --- Student Dashboard ---

async function renderStudentDashboard() {
  const token = localStorage.getItem("casuya_token");
  const payload = decodeToken(token);
  const _navStack = [];

  function goBack() {
    if (_navStack.length > 0) {
      const prev = _navStack.pop();
      prev();
    } else {
      loadStudentSubjects();
    }
  }

  render("#app", `
    <div class="sidebar-layout">
      <aside id="student-sidebar" class="sidebar">
        <div class="sidebar-header">
          <h2>Casuya</h2>
          <p>Student Portal</p>
        </div>
        <div style="padding:0.75rem 1rem;border-bottom:1px solid var(--color-border)">
          <select id="form-filter" class="input" style="padding:0.4rem;font-size:0.85rem">
            <option value="">All Forms</option>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="form3">Form 3</option>
            <option value="form4">Form 4</option>
          </select>
        </div>
        <nav class="sidebar-nav" id="student-nav">
          <div class="sidebar-nav-item active" data-view="subjects">📚 Subjects</div>
          <div class="sidebar-nav-item" data-view="progress">📊 Progress</div>
          <div class="sidebar-nav-item" data-view="bookmarks">🔖 Bookmarks</div>
          <div class="sidebar-nav-item" data-view="games">🎮 Games</div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-footer-row">
            <div style="position:relative;flex:1">
              <button id="notif-bell" class="icon-btn" style="width:100%;font-size:1.1rem" title="Notifications">🔔<span id="notif-badge" style="display:none;position:absolute;top:-4px;right:-6px;background:red;color:#fff;font-size:0.6rem;padding:1px 4px;border-radius:8px;min-width:14px;text-align:center">0</span></button>
              <div id="notif-dropdown" class="notif-dropdown"></div>
            </div>
            <div style="position:relative">
              <button id="profile-btn" class="icon-btn" title="Profile">👤</button>
              <div id="profile-dropdown" class="profile-dropdown">
                <button class="dropdown-item" id="prof-edit">Edit Profile</button>
                <button class="dropdown-item" id="prof-logout" style="color:var(--color-danger)">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <main class="main-content">
        <header class="main-header">
          <button id="sidebar-toggle" class="sidebar-toggle-btn">&#9776;</button>
          <div style="position:relative;flex:1;max-width:360px">
            <input id="student-search" type="search" class="input" placeholder="Search lessons..." style="padding:0.4rem 0.75rem;font-size:0.85rem">
            <div id="student-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);z-index:100;max-height:300px;overflow-y:auto"></div>
          </div>
        </header>
        <div id="student-content" class="main-body"></div>
      </main>
    </div>
  `);

  // Inject sidebar styles (duplicate prevention)
  if (!document.getElementById("sidebar-styles")) {
    const style = document.createElement("style");
    style.id = "sidebar-styles";
    style.textContent = `@media(max-width:768px){.sidebar{position:fixed;z-index:200;left:-260px;transition:left .25s ease;height:100vh}.sidebar.open{left:0;box-shadow:4px 0 20px rgba(0,0,0,.15)}.sidebar-toggle-btn{display:block!important}}`;
    document.head.appendChild(style);
  }

  // Sidebar toggle (mobile)
  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.getElementById("student-sidebar").classList.toggle("open");
  }, { signal: _globalAbort.signal });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#student-sidebar") && !e.target.closest("#sidebar-toggle")) {
      document.getElementById("student-sidebar")?.classList.remove("open");
    }
  }, { signal: _globalAbort.signal });

  // Form filter (persisted). Pre-select the student's own form level when known.
  const formFilterEl = document.getElementById("form-filter");
  const savedFormFilter = localStorage.getItem("casuya_form_filter") || "";
  if (payload.form_level && !savedFormFilter) {
    localStorage.setItem("casuya_form_filter", payload.form_level);
    formFilterEl.value = payload.form_level;
  } else if (savedFormFilter) {
    formFilterEl.value = savedFormFilter;
  }
  formFilterEl.addEventListener("change", (e) => {
    localStorage.setItem("casuya_form_filter", e.target.value);
    loadStudentSubjects();
  });

  // Search functionality
  const searchInput = document.getElementById("student-search");
  const searchResults = document.getElementById("student-search-results");
  let searchTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (q.length < 2) { searchResults.style.display = "none"; return; }
    searchTimer = setTimeout(async () => {
      try {
        const results = await request(`/search/?q=${encodeURIComponent(q)}`);
        if (!Array.isArray(results) || results.length === 0) {
          searchResults.innerHTML = '<div style="padding:0.5rem;color:var(--color-text-muted)">No results</div>';
        } else {
          searchResults.innerHTML = results.map(r => `
            <div class="search-item" data-id="${escapeHtml(r.id)}" data-type="${escapeHtml(r.type)}" style="padding:0.5rem;cursor:pointer;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between">
              <span>${escapeHtml(r.title)}</span>
              <span style="color:var(--color-text-muted);font-size:0.8rem">${escapeHtml(r.type)}</span>
            </div>
          `).join("");
          searchResults.querySelectorAll(".search-item").forEach(el => {
            el.addEventListener("click", () => {
              searchResults.style.display = "none";
              searchInput.value = "";
              if (el.dataset.type === "lesson") viewStudentLesson(el.dataset.id);
            });
          });
        }
        searchResults.style.display = "block";
      } catch(e) { searchResults.style.display = "none"; }
    }, 300);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#student-search") && !e.target.closest("#student-search-results")) searchResults.style.display = "none";
  }, { signal: _globalAbort.signal });

  // Notifications
  const notifBell = document.getElementById("notif-bell");
  const notifDropdown = document.getElementById("notif-dropdown");
  const notifBadge = document.getElementById("notif-badge");
  let notifData = [];

  async function loadNotifs() {
    try {
      notifData = await request("/notifications");
      const unread = notifData.filter(n => !n.is_read).length;
      if (unread > 0) { notifBadge.textContent = unread; notifBadge.style.display = "inline"; }
      else notifBadge.style.display = "none";
    } catch(e) {}
  }

  notifBell.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (notifDropdown.style.display === "block") { notifDropdown.style.display = "none"; return; }
    await loadNotifs();
    if (notifData.length === 0) {
      notifDropdown.innerHTML = '<div style="padding:0.75rem;color:var(--color-text-muted)">No notifications</div>';
    } else {
      notifDropdown.innerHTML = notifData.map(n => `
        <div class="notif-item ${n.is_read ? "" : "unread"}" data-id="${escapeHtml(n.id)}" style="padding:0.5rem 0.75rem;border-bottom:1px solid var(--color-border);${n.is_read ? "opacity:0.6" : "font-weight:600"}">
          <p style="margin:0;font-size:0.85rem">${escapeHtml(n.message)}</p>
        </div>
      `).join("");
      notifDropdown.querySelectorAll(".notif-item.unread").forEach(el => {
        el.addEventListener("click", async () => {
          await request(`/notifications/${el.dataset.id}/read`, { method: "POST" });
          await loadNotifs();
        });
      });
    }
    notifDropdown.style.display = "block";
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#notif-bell") && !e.target.closest("#notif-dropdown")) notifDropdown.style.display = "none"; }, { signal: _globalAbort.signal });

  // Profile dropdown
  document.getElementById("profile-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("profile-dropdown");
    dd.style.display = dd.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => { 
    const pd = document.getElementById("profile-dropdown");
    if (pd && !e.target.closest("#profile-btn") && !e.target.closest("#profile-dropdown")) pd.style.display = "none"; 
  }, { signal: _globalAbort.signal });

  document.getElementById("prof-logout").addEventListener("click", handleLogout);
  document.getElementById("prof-edit").addEventListener("click", () => {
    document.getElementById("profile-dropdown").style.display = "none";
    showStudentProfileEditor();
  });

  // Navigation
  function setActiveNav(viewId) {
    document.querySelectorAll("#student-nav .sidebar-nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.view === viewId);
    });
  }

  function showStudentView(content) {
    document.getElementById("student-content").innerHTML = content;
    ["s-subjects", "s-progress", "s-bookmarks", "s-games"].forEach(id => {
      document.getElementById(id)?.classList.remove("active");
    });
  }

  const navHandlers = {
    subjects: () => { setActiveNav("subjects"); loadStudentSubjects(); },
    progress: () => { setActiveNav("progress"); loadStudentProgress(); },
    bookmarks: () => { setActiveNav("bookmarks"); loadStudentBookmarks(); },
    games: () => { setActiveNav("games"); loadStudentGames(); },
  };

  document.querySelectorAll("#student-nav .sidebar-nav-item").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("student-sidebar")?.classList.remove("open");
      navHandlers[el.dataset.view]?.();
    });
  });

  // Load subjects
  async function loadStudentSubjects() {
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const subjects = await request("/subjects");
      const filtered = Array.isArray(subjects) ? subjects : [];
      if (filtered.length === 0) {
        showStudentView('<div class="empty-state"><p>No subjects found</p></div>');
        return;
      }
      showStudentView(`
        <h2>Subjects</h2>
        <div class="card-grid" style="margin-top:1rem">
          ${filtered.map(s => `
            <div class="card subject-card" data-id="${s.id}" style="cursor:pointer">
              <h3>${escapeHtml(s.name)}</h3>
              <p style="color:var(--color-text-muted)">${escapeHtml(s.slug || "")}</p>
            </div>
          `).join("")}
        </div>
      `);
      document.querySelectorAll(".subject-card").forEach(card => {
        card.addEventListener("click", () => loadSubjectTopics(card.dataset.id));
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading subjects</p></div>'); }
  }

  async function loadSubjectTopics(subjectId) {
    _navStack.push(() => loadStudentSubjects());
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading topics...</p></div>');
    try {
      const topics = await request("/topics");
      const formFilter = localStorage.getItem("casuya_form_filter") || "";
      let filtered = Array.isArray(topics) ? topics.filter(t => t.subject_id === subjectId) : [];
      if (formFilter) {
        filtered = filtered.filter(t => !t.form_level || t.form_level === formFilter);
      }
      if (filtered.length === 0) {
        showStudentView('<div class="empty-state"><p>No topics found</p><button class="btn" id="back-btn">← Back</button></div>');
        document.getElementById("back-btn")?.addEventListener("click", goBack);
        return;
      }
      showStudentView(`
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <h2>Topics</h2>
        </div>
        <div class="card-grid">
          ${filtered.map(t => `
            <div class="card topic-card" data-id="${t.id}" style="cursor:pointer">
              <h3>${escapeHtml(t.title)}</h3>
            </div>
          `).join("")}
        </div>
      `);
      document.getElementById("back-btn").addEventListener("click", goBack);
      document.querySelectorAll(".topic-card").forEach(card => {
        card.addEventListener("click", () => loadTopicSubtopics(card.dataset.id, subjectId));
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading topics</p></div>'); }
  }

  async function loadTopicSubtopics(topicId, subjectId) {
    _navStack.push(() => loadSubjectTopics(subjectId));
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading subtopics...</p></div>');
    try {
      const subtopics = await request("/subtopics");
      const filtered = Array.isArray(subtopics) ? subtopics.filter(s => s.topic_id === topicId) : [];
      if (filtered.length === 0) {
        showStudentView('<div class="empty-state"><p>No subtopics found</p><button class="btn" id="back-btn">← Back</button></div>');
        document.getElementById("back-btn")?.addEventListener("click", goBack);
        return;
      }
      showStudentView(`
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <h2>Subtopics</h2>
        </div>
        <div class="card-grid">
          ${filtered.map(s => `
            <div class="card subtopic-card" data-id="${s.id}" style="cursor:pointer">
              <h3>${escapeHtml(s.title)}</h3>
            </div>
          `).join("")}
        </div>
      `);
      document.getElementById("back-btn").addEventListener("click", goBack);
      document.querySelectorAll(".subtopic-card").forEach(card => {
        card.addEventListener("click", () => loadSubtopicLessons(card.dataset.id, topicId, subjectId));
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading subtopics</p></div>'); }
  }

  async function loadSubtopicLessons(subtopicId, topicId, subjectId) {
    _navStack.push(() => loadTopicSubtopics(topicId, subjectId));
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading lessons...</p></div>');
    try {
      const lessons = await request("/lessons/?status=published");
      const filtered = Array.isArray(lessons) ? lessons.filter(l => l.subtopic_id === subtopicId) : [];
      if (filtered.length === 0) {
        showStudentView('<div class="empty-state"><p>No lessons found</p><button class="btn" id="back-btn">← Back</button></div>');
        document.getElementById("back-btn")?.addEventListener("click", goBack);
        return;
      }
      showStudentView(`
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <button class="btn" id="back-btn">← Back</button>
          <h2>Lessons</h2>
        </div>
        <div class="card-grid">
          ${filtered.map(l => `
            <div class="card lesson-card" data-id="${l.id}" style="cursor:pointer">
              <h3>${escapeHtml(l.title)}</h3>
              <p style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(l.status || "")}</p>
            </div>
          `).join("")}
        </div>
      `);
      document.getElementById("back-btn").addEventListener("click", goBack);
      document.querySelectorAll(".lesson-card").forEach(card => {
        card.addEventListener("click", () => viewStudentLesson(card.dataset.id));
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading lessons</p></div>'); }
  }

  // Progress
  async function loadStudentProgress() {
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading progress...</p></div>');
    try {
      // Get student ID from profile
      const profile = await request("/students/me");
      const studentId = profile?.id;
      if (!studentId) {
        showStudentView('<div class="empty-state"><p>Could not load profile</p></div>');
        return;
      }
      const data = await request(`/progress/${studentId}`);
      const progress = Array.isArray(data) ? data : [];
      if (progress.length === 0) {
        showStudentView('<div class="empty-state"><p>No progress recorded yet</p></div>');
        return;
      }
      const bySubject = {};
      progress.forEach(p => {
        const subj = p.subject_name || "General";
        if (!bySubject[subj]) bySubject[subj] = { total: 0, completed: 0 };
        bySubject[subj].total++;
        if (p.completion_percentage >= 100) bySubject[subj].completed++;
      });
      showStudentView(`
        <h2>My Progress</h2>
        <div style="margin-top:1rem">
          ${Object.entries(bySubject).map(([name, data]) => {
            const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            return `
              <div class="card" style="margin-bottom:0.75rem">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                  <strong>${escapeHtml(name)}</strong>
                  <span>${pct}%</span>
                </div>
                <div style="background:var(--color-border);height:8px;border-radius:4px">
                  <div style="background:var(--color-primary);height:100%;width:${pct}%;border-radius:4px"></div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `);
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading progress</p></div>'); }
  }

  // Bookmarks
  async function loadStudentBookmarks() {
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading bookmarks...</p></div>');
    try {
      const data = await request("/bookmarks/");
      const bookmarks = Array.isArray(data) ? data : [];
      if (bookmarks.length === 0) {
        showStudentView('<div class="empty-state"><p>No bookmarks yet</p></div>');
        return;
      }
      showStudentView(`
        <h2>My Bookmarks</h2>
        <div class="card-grid" style="margin-top:1rem">
          ${bookmarks.map(b => `
            <div class="card" style="cursor:pointer" data-id="${b.lesson_id || b.id}">
              <h3>${escapeHtml(b.lesson_title || b.title || "Untitled")}</h3>
            </div>
          `).join("")}
        </div>
      `);
      document.querySelectorAll(".card[data-id]").forEach(card => {
        card.addEventListener("click", () => viewStudentLesson(card.dataset.id));
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading bookmarks</p></div>'); }
  }

  // Games
  async function loadStudentGames() {
    showStudentView(`
      <h2>Games</h2>
      <div class="empty-state" style="margin-top:1rem">
        <p>Games are available within lessons.</p>
        <p style="color:var(--color-text-muted);font-size:0.85rem">Open a lesson to access its interactive games.</p>
        <button class="btn btn-primary" id="browse-lessons-btn" style="margin-top:1rem">Browse Lessons</button>
      </div>
    `);
    document.getElementById("browse-lessons-btn")?.addEventListener("click", () => {
      setActiveNav("subjects");
      loadStudentSubjects();
    });
  }

  // Profile editor
  async function showStudentProfileEditor() {
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading profile...</p></div>');
    try {
      const profile = await request("/students/me");
      showStudentView(`
        <h2>Edit Profile</h2>
        <form id="profile-form" class="card" style="margin-top:1rem;display:flex;flex-direction:column;gap:0.75rem">
          <label>Full Name<input class="input" name="full_name" value="${escapeHtml(profile.full_name || "")}"></label>
          <label>Phone<input class="input" name="phone" value="${escapeHtml(profile.phone || "")}"></label>
          <label>Form Level
            <select class="input" name="form_level">
              ${["Form I","Form II","Form III","Form IV","Form V","Form VI"].map(f => `<option ${profile.form_level === f ? "selected" : ""}>${f}</option>`).join("")}
            </select>
          </label>
          <button class="btn btn-primary" type="submit">Save</button>
        </form>
      `);
      document.getElementById("profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await request("/students/me", { method: "PATCH", body: JSON.stringify({ full_name: fd.get("full_name"), phone: fd.get("phone"), form_level: fd.get("form_level") }) });
          showToast("Profile updated");
          loadStudentSubjects();
        } catch(err) { showToast("Error: " + err.message); }
      });
    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading profile</p></div>'); }
  }

  // View lesson content
  async function viewStudentLesson(lessonId) {
    showStudentView('<div class="loading-state"><div class="spinner"></div><p>Loading lesson...</p></div>');
    try {
      const lesson = await request(`/lessons/${lessonId}`);
      const [bookmarkStatus, noteData, contentResp, quizData, gamesData] = await Promise.all([
        request(`/bookmarks/${lessonId}/status`).catch(() => ({ bookmarked: false })),
        request(`/notes/${lessonId}`).catch(() => ({ content: "" })),
        fetch(`${API_BASE}/lessons/${lessonId}/content`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token")}` },
        }).then(r => r.ok ? r.text() : ""),
        request(`/quizzes/by-lesson/${lessonId}`).catch(() => null),
        request(`/games/by-lesson/${lessonId}`).catch(() => []),
      ]);
      const isBookmarked = bookmarkStatus?.bookmarked || false;
      const lessonContent = contentResp || "<p>No content</p>";

      // Track recently viewed
      const recent = JSON.parse(localStorage.getItem("casuya_recently_viewed") || "[]");
      const exists = recent.findIndex(r => r.id === lessonId);
      if (exists >= 0) recent.splice(exists, 1);
      recent.unshift({ id: lessonId, title: lesson.title, viewedAt: Date.now() });
      if (recent.length > 20) recent.length = 20;
      localStorage.setItem("casuya_recently_viewed", JSON.stringify(recent));

      const renderStudentQuiz = () => {
        if (!quizData || !quizData.questions || quizData.questions.length === 0) return "";
        return `
          <div class="card" style="margin-top:0.75rem;padding:1rem">
            <h3 style="margin:0 0 0.75rem">${escapeHtml(quizData.title || "Quiz")}</h3>
            <form id="quiz-form">
              ${quizData.questions.map((q, qi) => `
                <div style="margin-bottom:1rem">
                  <p style="font-weight:600;margin:0 0 0.5rem">${qi + 1}. ${escapeHtml(q.prompt)}</p>
                  ${q.options.map(o => `
                    <label style="display:block;padding:0.3rem 0.5rem;cursor:pointer;border:1px solid var(--color-border);border-radius:var(--radius);margin-bottom:0.25rem">
                      <input type="radio" name="q_${escapeHtml(q.id)}" value="${escapeHtml(o.id)}" required> ${escapeHtml(o.text)}
                    </label>
                  `).join("")}
                </div>
              `).join("")}
              <button type="submit" class="btn btn-primary" id="quiz-submit-btn">Submit Quiz</button>
            </form>
            <div id="quiz-result" style="display:none;margin-top:0.75rem"></div>
          </div>
        `;
      };

      const renderStudentGames = () => {
        if (!Array.isArray(gamesData) || gamesData.length === 0) return "";
        return `
          <div class="card" style="margin-top:0.75rem;padding:1rem">
            <h3 style="margin:0 0 0.5rem">Games & Activities</h3>
            ${gamesData.map(g => `
              <div class="game-item" data-game-id="${escapeHtml(g.id)}" style="padding:0.5rem 0;border-bottom:1px solid var(--color-border);cursor:pointer">
                <span style="color:var(--color-primary)">${escapeHtml(g.title || "Game")}</span>
              </div>
            `).join("")}
            <div id="game-content-area" style="margin-top:1rem"></div>
          </div>
        `;
      };

      showStudentView(`
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
          <button class="btn" id="back-btn">← Back</button>
          <h2 style="flex:1">${escapeHtml(lesson.title)}</h2>
          <button id="bookmark-btn" style="background:none;border:none;cursor:pointer;font-size:1.5rem" title="Bookmark">${isBookmarked ? "★" : "☆"}</button>
        </div>
        <div style="width:100%">
          <iframe class="lesson-iframe" style="width:100%;border:none;display:block"></iframe>
        </div>
        <div style="margin-top:0.75rem">
          <details>
            <summary style="cursor:pointer;font-weight:600;font-size:0.9rem;color:var(--color-text-muted)">📝 My Notes</summary>
            <div class="card" style="margin-top:0.5rem">
              <textarea id="lesson-note" class="input" rows="4" placeholder="Write your notes here...">${escapeHtml(noteData?.content || "")}</textarea>
              <button class="btn btn-primary" id="save-note" style="margin-top:0.5rem">Save Note</button>
            </div>
          </details>
          ${renderStudentQuiz()}
          ${renderStudentGames()}
        </div>
      `);

      // Render lesson content in iframe
      const iframe = document.querySelector("#student-content .lesson-iframe");
      if (iframe) {
        iframe.srcdoc = lessonContent;
        let heightSet = false;
        const setHeight = () => {
          if (heightSet) return;
          try {
            const doc = iframe.contentWindow?.document;
            if (doc) {
              iframe.style.height = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0, 300) + "px";
              heightSet = true;
            }
          } catch(e) {}
        };
        iframe.addEventListener("load", setHeight);
        const poll = setInterval(() => { setHeight(); if (heightSet) clearInterval(poll); }, 300);
        setTimeout(() => { clearInterval(poll); if (!heightSet) iframe.style.height = "800px"; }, 10000);

        // Bridge for quiz scores and progress
        const onMessage = (e) => {
          if (e.data?.type === "casuya-quiz" && e.data.score != null && e.data.total > 0) {
            const pct = Math.round((e.data.score / e.data.total) * 100);
            request("/progress/sync", {
              method: "POST",
              body: JSON.stringify({ lesson_id: lessonId, completion_percentage: 100, score_percentage: pct }),
            }).catch(() => {});
          } else if (e.data?.type === "casuya-progress" && e.data.percent != null) {
            request("/progress/sync", {
              method: "POST",
              body: JSON.stringify({ lesson_id: lessonId, completion_percentage: e.data.percent }),
            }).catch(() => {});
          }
        };
        window.addEventListener("message", onMessage);
      }

      document.getElementById("back-btn").addEventListener("click", goBack);

      // Bookmark toggle
      document.getElementById("bookmark-btn").addEventListener("click", async () => {
        const btn = document.getElementById("bookmark-btn");
        if (isBookmarked) {
          await request(`/bookmarks/${lessonId}`, { method: "DELETE" });
          btn.textContent = "☆";
        } else {
          await request(`/bookmarks/${lessonId}`, { method: "POST" });
          btn.textContent = "★";
        }
      });

      // Save note
      let noteTimer;
      document.getElementById("save-note").addEventListener("click", async () => {
        const content = document.getElementById("lesson-note").value;
        await request(`/notes/${lessonId}`, { method: "PUT", body: JSON.stringify({ content }) });
        showToast("Note saved");
      });

      // Auto-save notes on typing
      document.getElementById("lesson-note").addEventListener("input", () => {
        clearTimeout(noteTimer);
        noteTimer = setTimeout(async () => {
          const content = document.getElementById("lesson-note").value;
          await request(`/notes/${lessonId}`, { method: "PUT", body: JSON.stringify({ content }) });
        }, 2000);
      });

      // Quiz submit
      document.getElementById("quiz-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!quizData || !quizData.questions) return;
        const fd = new FormData(e.target);
        let score = 0;
        quizData.questions.forEach(q => { if (fd.get(`q_${q.id}`)) score++; });
        try {
          const result = await request(`/quizzes/${quizData.id}/submit`, {
            method: "POST", body: JSON.stringify({ score, total: quizData.questions.length }),
          });
          const el = document.getElementById("quiz-result");
          el.innerHTML = `<p style="color:var(--color-success);font-weight:600">Score: ${score}/${quizData.questions.length}</p>`;
          el.style.display = "block";
        } catch(err) {
          const el = document.getElementById("quiz-result");
          el.innerHTML = `<p style="color:var(--color-danger)">Error: ${escapeHtml(err.message)}</p>`;
          el.style.display = "block";
        }
      });

      // Game items
      document.querySelectorAll(".game-item").forEach(item => {
        item.addEventListener("click", async () => {
          const area = document.getElementById("game-content-area");
          const gid = item.dataset.gameId;
          try {
            const resp = await fetch(`${API_BASE}/games/${gid}/content`, {
              headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token")}` },
            });
            if (resp.ok) {
              const html = await resp.text();
              area.innerHTML = `<iframe style="width:100%;border:none;min-height:300px" srcdoc="${escapeHtml(html)}"></iframe>`;
            }
          } catch(e) {}
        });
      });

    } catch(e) { showStudentView('<div class="empty-state"><p>Error loading lesson</p></div>'); }
  }

  function renderQuiz(quiz, lessonId) {
    if (!quiz || !quiz.questions) return "";
    return quiz.questions.map((q, i) => `
      <div style="margin-bottom:1rem">
        <p><strong>${i+1}.</strong> ${escapeHtml(q.question)}</p>
        ${q.options.map((opt, j) => `
          <label style="display:block;padding:0.25rem 0">
            <input type="radio" name="quiz-${quiz.id || lessonId}-${i}" value="${j}"> ${escapeHtml(opt)}
          </label>
        `).join("")}
      </div>
    `).join("") + `<button class="btn btn-primary" onclick="submitQuiz('${quiz.id || lessonId}')">Submit Quiz</button>`;
  }

  // Initial load
  loadStudentSubjects();
}

// --- Admin Dashboard ---

async function renderAdminDashboard() {
  const token = localStorage.getItem("casuya_token");
  const payload = decodeToken(token);

  render("#app", `
    <div class="sidebar-layout">
      <aside id="admin-sidebar" class="sidebar">
        <div class="sidebar-header">
          <h2>Casuya Admin</h2>
          <p>${escapeHtml(payload.full_name || payload.email || "Admin")}</p>
        </div>
        <nav class="sidebar-nav" id="admin-nav">
          <div class="sidebar-nav-item active" data-view="dashboard">📊 Dashboard</div>
          <div class="sidebar-nav-item" data-view="subjects">📚 Subjects</div>
          <div class="sidebar-nav-item" data-view="topics">📁 Topics</div>
          <div class="sidebar-nav-item" data-view="subtopics">📂 Subtopics</div>
          <div class="sidebar-nav-item" data-view="lessons">📝 Lessons</div>
          <div class="sidebar-nav-item" data-view="quizzes">❓ Quizzes</div>
          <div class="sidebar-nav-item" data-view="games">🎮 Games</div>
          <div class="sidebar-nav-item" data-view="users">👥 Users</div>
          <div class="sidebar-nav-item" data-view="progress">📈 Progress</div>
          <div class="sidebar-nav-item" data-view="payments">💳 Payments</div>
          <div class="sidebar-nav-item" data-view="notifications">🔔 Notifications</div>
          <div class="sidebar-nav-item" data-view="uploads">📤 Uploads</div>
          <div class="sidebar-nav-item" data-view="branding">🎨 Branding</div>
        </nav>
        <div class="sidebar-footer">
          <button id="admin-logout" class="btn btn-danger" style="width:100%;font-size:0.85rem">Sign Out</button>
        </div>
      </aside>
      <main class="main-content">
        <header class="main-header">
          <button id="sidebar-toggle" class="sidebar-toggle-btn">&#9776;</button>
          <div style="position:relative;flex:1;max-width:360px">
            <input id="admin-search" type="search" class="input" placeholder="Search users, lessons..." style="padding:0.4rem 0.75rem;font-size:0.85rem">
            <div id="admin-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);z-index:100;max-height:300px;overflow-y:auto"></div>
          </div>
        </header>
        <div id="admin-content" class="main-body"></div>
      </main>
    </div>
  `);

  document.getElementById("admin-logout").addEventListener("click", handleLogout);

  // Sidebar toggle (mobile)
  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.getElementById("admin-sidebar").classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#admin-sidebar") && !e.target.closest("#sidebar-toggle")) {
      document.getElementById("admin-sidebar")?.classList.remove("open");
    }
  }, { signal: _globalAbort.signal });

  // Admin search
  const adminSearchInput = document.getElementById("admin-search");
  const adminSearchResults = document.getElementById("admin-search-results");
  let searchTimer;

  adminSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = adminSearchInput.value.trim();
    if (q.length < 2) { adminSearchResults.style.display = "none"; return; }
    searchTimer = setTimeout(async () => {
      try {
        const results = await request(`/search/?q=${encodeURIComponent(q)}`);
        if (!Array.isArray(results) || results.length === 0) {
          adminSearchResults.innerHTML = '<div style="padding:0.5rem;color:var(--color-text-muted)">No results</div>';
        } else {
          adminSearchResults.innerHTML = results.map(u => `
            <div class="admin-search-item" data-id="${escapeHtml(u.id)}" data-type="${escapeHtml(u.type)}" style="padding:0.5rem;cursor:pointer;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between">
              <span>${escapeHtml(u.title || u.email)}</span>
              <span style="color:var(--color-text-muted);font-size:0.8rem">${escapeHtml(u.type)}</span>
            </div>
          `).join("");
          adminSearchResults.querySelectorAll(".admin-search-item").forEach(el => {
            el.addEventListener("click", () => {
              adminSearchResults.style.display = "none";
              adminSearchInput.value = "";
              if (el.dataset.type === "student" || el.dataset.type === "teacher") loadAdminUsers();
              else if (el.dataset.type === "lesson") loadAdminLessons();
              else loadAdminSubjects();
            });
          });
        }
        adminSearchResults.style.display = "block";
      } catch(e) { adminSearchResults.style.display = "none"; }
    }, 300);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#admin-search") && !e.target.closest("#admin-search-results")) adminSearchResults.style.display = "none";
  }, { signal: _globalAbort.signal });

  // Navigation
  function setActiveNav(viewId) {
    document.querySelectorAll("#admin-nav .sidebar-nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.view === viewId);
    });
  }

  function showAdminView(content) {
    document.getElementById("admin-content").innerHTML = content;
  }

  const navHandlers = {
    dashboard: () => { setActiveNav("dashboard"); loadAdminOverview(); },
    subjects: () => { setActiveNav("subjects"); loadAdminSubjects(); },
    topics: () => { setActiveNav("topics"); loadAdminTopics(); },
    subtopics: () => { setActiveNav("subtopics"); loadAdminSubtopics(); },
    lessons: () => { setActiveNav("lessons"); loadAdminLessons(); },
    quizzes: () => { setActiveNav("quizzes"); loadAdminQuizzes(); },
    games: () => { setActiveNav("games"); loadAdminGames(); },
    users: () => { setActiveNav("users"); loadAdminUsers(); },
    progress: () => { setActiveNav("progress"); loadAdminProgress(); },
    payments: () => { setActiveNav("payments"); loadAdminPayments(); },
    notifications: () => { setActiveNav("notifications"); loadAdminNotifications(); },
    uploads: () => { setActiveNav("uploads"); loadAdminUploads(); },
    branding: () => { setActiveNav("branding"); loadAdminBranding(); },
  };

  document.querySelectorAll("#admin-nav .sidebar-nav-item").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("admin-sidebar")?.classList.remove("open");
      navHandlers[el.dataset.view]?.();
    });
  });

  async function loadAdminOverview() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const overview = await request("/analytics/overview");
      const name = payload.full_name || payload.email || "Admin";
      showAdminView(`
        <div class="content">
          <h2>Welcome, ${escapeHtml(name)}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:1rem 0">
            <div class="card"><h3>Students</h3><p style="font-size:2rem;font-weight:700">${overview?.total_students ?? 0}</p></div>
            <div class="card"><h3>Teachers</h3><p style="font-size:2rem;font-weight:700">${overview?.total_teachers ?? 0}</p></div>
            <div class="card"><h3>Lessons</h3><p style="font-size:2rem;font-weight:700">${overview?.total_lessons ?? 0}</p></div>
            <div class="card"><h3>Quizzes</h3><p style="font-size:2rem;font-weight:700">${overview?.total_quizzes ?? 0}</p></div>
          </div>
        </div>
      `);
    } catch (err) {
      showAdminView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadAdminSubjects() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const subjects = await request("/subjects");
      const list = Array.isArray(subjects) ? subjects : [];
      showAdminView(`
        <div class="content">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>Subjects</h2>
            <button class="btn btn-primary" id="add-subject-btn">+ Add Subject</button>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No subjects yet</p></div>' :
              list.map(s => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <h3>${escapeHtml(s.name)}</h3>
                      <p style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(s.slug || "")}</p>
                    </div>
                    ${deleteBtn(s.id, s.name, "/subjects")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.getElementById("add-subject-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Subject</h3>
            <form id="create-subject-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <input class="input" name="name" placeholder="Subject name (e.g. Mathematics)" required>
              <input class="input" name="slug" placeholder="Slug (e.g. mathematics)" required>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-subject-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await request("/subjects", { method: "POST", body: JSON.stringify({ name: fd.get("name"), slug: fd.get("slug") }) });
            loadAdminSubjects();
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          loadAdminTopics(card.dataset.id, card.dataset.name);
        });
      });
      initDeleteButtons();
    } catch (err) {
      showAdminView('<div class="empty-state"><h2>Error</h2><p>' + escapeHtml(err.message) + '</p></div>');
    }
  }

  async function loadAdminTopics(subjectId, subjectName) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading topics...</p></div>');
    try {
      const topics = await request(`/topics/${subjectId ? "?subject_id=" + subjectId : ""}`);
      const list = Array.isArray(topics) ? topics : [];
      showAdminView(`
        <div class="content">
          ${subjectId ? '<button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>' : ""}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${subjectId ? escapeHtml(subjectName) + " — " : ""}Topics</h2>
            <button class="btn btn-primary" id="add-topic-btn">+ Add Topic</button>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No topics yet</p></div>' :
              list.map(t => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(t.id)}" data-title="${escapeHtml(t.title)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <h3>${escapeHtml(t.title)}</h3>
                      <p style="color:var(--color-text-muted);font-size:0.85rem">Form ${escapeHtml(t.form_level || "")}</p>
                    </div>
                    ${deleteBtn(t.id, t.title, "/topics")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      if (subjectId) document.getElementById("back-btn")?.addEventListener("click", loadAdminSubjects);
      document.getElementById("add-topic-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Topic</h3>
            <form id="create-topic-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              ${!subjectId ? '<select class="input" name="subject_id" required><option value="">Select subject...</option></select>' : ""}
              <input class="input" name="title" placeholder="Topic title" required>
              <select class="input" name="form_level">
                <option value="">Select form level...</option>
                ${["Form I","Form II","Form III","Form IV","Form V","Form VI"].map(f => '<option value="'+f+'">'+f+'</option>').join("")}
              </select>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        if (!subjectId) {
          request("/subjects").then(subs => {
            const sel = document.querySelector('[name="subject_id"]');
            if (sel && Array.isArray(subs)) subs.forEach(s => { const o = document.createElement("option"); o.value = s.id; o.textContent = s.name; sel.appendChild(o); });
          });
        }
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-topic-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const title = fd.get("title");
          const sid = subjectId || fd.get("subject_id");
          if (!title || !sid) { showToast("Title and subject are required"); return; }
          try {
            await request("/topics", { method: "POST", body: JSON.stringify({ title, subject_id: sid, form_level: fd.get("form_level") || "" }) });
            loadAdminTopics(subjectId, subjectName);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          loadAdminSubtopics(card.dataset.id, card.dataset.title, loadAdminTopics.bind(null, subjectId, subjectName));
        });
      });
      initDeleteButtons();
    } catch (err) {
      showAdminView('<div class="empty-state"><h2>Error</h2><p>' + escapeHtml(err.message) + '</p></div>');
    }
  }

  async function loadAdminSubtopics(topicId, topicTitle, backFn) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading subtopics...</p></div>');
    try {
      const subtopics = await request(`/subtopics/${topicId ? "?topic_id=" + topicId : ""}`);
      const list = Array.isArray(subtopics) ? subtopics : [];
      showAdminView(`
        <div class="content">
          ${topicId ? '<button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>' : ""}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${topicId ? escapeHtml(topicTitle) + " — " : ""}Subtopics</h2>
            <button class="btn btn-primary" id="add-subtopic-btn">+ Add Subtopic</button>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No subtopics yet</p></div>' :
              list.map(st => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(st.id)}" data-title="${escapeHtml(st.title)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <h3>${escapeHtml(st.title)}</h3>
                    ${deleteBtn(st.id, st.title, "/subtopics")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      if (topicId) document.getElementById("back-btn")?.addEventListener("click", backFn);
      document.getElementById("add-subtopic-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Subtopic</h3>
            <form id="create-subtopic-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              ${!topicId ? '<select class="input" name="topic_id" required><option value="">Select topic...</option></select>' : ""}
              <input class="input" name="title" placeholder="Subtopic title" required>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        if (!topicId) {
          request("/topics").then(tpcs => {
            const sel = document.querySelector('[name="topic_id"]');
            if (sel && Array.isArray(tpcs)) tpcs.forEach(t => { const o = document.createElement("option"); o.value = t.id; o.textContent = t.title; sel.appendChild(o); });
          });
        }
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-subtopic-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const title = fd.get("title");
          const tid = topicId || fd.get("topic_id");
          if (!title || !tid) { showToast("Title and topic are required"); return; }
          try {
            await request("/subtopics", { method: "POST", body: JSON.stringify({ title, topic_id: tid }) });
            loadAdminSubtopics(topicId, topicTitle, backFn);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          loadAdminLessonsList(card.dataset.id, card.dataset.title, loadAdminSubtopics.bind(null, topicId, topicTitle, backFn));
        });
      });
      initDeleteButtons();
    } catch (err) {
      showAdminView('<div class="empty-state"><h2>Error</h2><p>' + escapeHtml(err.message) + '</p></div>');
    }
  }

  async function loadAdminLessonsList(subtopicId, subtopicTitle, backFn) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading lessons...</p></div>');
    try {
      const lessons = await request(`/lessons/?subtopic_id=${subtopicId}&status=published`);
      const list = Array.isArray(lessons) ? lessons : [];
      showAdminView(`
        <div class="content">
          <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${escapeHtml(subtopicTitle)} — Lessons</h2>
            <button class="btn btn-primary" id="add-lesson-btn">+ Add Lesson</button>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No lessons yet</p></div>' :
              list.map(l => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(l.id)}">
                  <h3>${escapeHtml(l.title)}</h3>
                  <p style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(l.status)}</p>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.getElementById("back-btn")?.addEventListener("click", backFn);
      document.getElementById("add-lesson-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Lesson</h3>
            <form id="create-lesson-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <input class="input" name="title" placeholder="Lesson title" required>
              <textarea class="input" name="content" rows="6" placeholder="Lesson content (HTML supported)"></textarea>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-lesson-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const title = fd.get("title");
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          try {
            await request("/lessons", { method: "POST", body: JSON.stringify({ title, slug, html_content: fd.get("content"), subtopic_id: subtopicId }) });
            loadAdminLessonsList(subtopicId, subtopicTitle, backFn);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", () => viewLessonContent("#admin-content", card.dataset.id, loadAdminLessonsList.bind(null, subtopicId, subtopicTitle, backFn)));
      });
    } catch (err) {
      showAdminView('<div class="empty-state"><h2>Error</h2><p>' + escapeHtml(err.message) + '</p></div>');
    }
  }

  async function loadAdminProgress() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const [students, teachers, subjects, distribution] = await Promise.all([
        request("/students"),
        request("/teachers"),
        request("/subjects"),
        request("/analytics/lesson-distribution"),
      ]);

      const dist = Array.isArray(distribution) ? distribution : [];
      const lessonCount = dist.length;

      showAdminView(`
        <div class="content">
          <h2>Platform Progress</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-top:0.5rem">
            <div class="card" style="padding:0.75rem"><h4>Students</h4><p style="font-size:1.6rem;font-weight:700">${Array.isArray(students) ? students.length : 0}</p></div>
            <div class="card" style="padding:0.75rem"><h4>Teachers</h4><p style="font-size:1.6rem;font-weight:700">${Array.isArray(teachers) ? teachers.length : 0}</p></div>
            <div class="card" style="padding:0.75rem"><h4>Lessons</h4><p style="font-size:1.6rem;font-weight:700">${lessonCount}</p></div>
            <div class="card" style="padding:0.75rem"><h4>Subjects</h4><p style="font-size:1.6rem;font-weight:700">${Array.isArray(subjects) ? subjects.length : 0}</p></div>
          </div>
          ${dist.length > 0 ? `
            <h3 style="margin-top:1.5rem">Lesson Distribution</h3>
            <div style="margin-top:0.5rem">
              ${dist.map(d => `
                <div style="margin-bottom:0.5rem">
                  <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                    <span style="font-size:0.85rem">${escapeHtml(d.lesson_title)}</span>
                    <span style="font-size:0.85rem;color:var(--color-text-muted)">${d.avg_completion_percentage}% (${d.session_count} sessions)</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-bar-fill" style="width:${d.avg_completion_percentage}%"></div>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : '<div class="empty-state" style="margin-top:1rem"><p>No lesson progress data yet. Have students started lessons?</p></div>'}
        </div>
      `);
    } catch (err) {
      showAdminView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadAdminLessons() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading lessons...</p></div>');
    try {
      const lessons = await request("/lessons/");
      const list = Array.isArray(lessons) ? lessons : [];
      showAdminView(`
        <div class="content">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>Lessons</h2>
            <button class="btn btn-primary" id="add-lesson-btn">+ Add Lesson</button>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No lessons</p></div>' :
              list.map(l => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(l.id)}" data-title="${escapeHtml(l.title)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                      <h3>${escapeHtml(l.title)}</h3>
                      <p style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(l.status||"")}</p>
                    </div>
                    ${deleteBtn(l.id, l.title, "/lessons")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          viewAdminLesson(card.dataset.id, card.dataset.title);
        });
      });
      initDeleteButtons();
      document.getElementById("add-lesson-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Lesson</h3>
            <form id="create-lesson-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <select class="input" name="subtopic_id" required><option value="">Select subtopic...</option></select>
              <input class="input" name="title" placeholder="Lesson title" required>
              <textarea class="input" name="content" rows="6" placeholder="Lesson content (HTML supported)"></textarea>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        request("/subtopics").then(subs => {
          const sel = document.querySelector('[name="subtopic_id"]');
          if (sel && Array.isArray(subs)) subs.forEach(s => { const o = document.createElement("option"); o.value = s.id; o.textContent = s.title; sel.appendChild(o); });
        });
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-lesson-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const title = fd.get("title");
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          try {
            await request("/lessons", { method: "POST", body: JSON.stringify({ title, slug, html_content: fd.get("content"), subtopic_id: fd.get("subtopic_id") }) });
            loadAdminLessons();
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading lessons</p></div>'); }
  }

  async function viewAdminLesson(lessonId, lessonTitle) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading lesson...</p></div>');
    try {
      const lesson = await request(`/lessons/${lessonId}`);
      if (!lesson) return;
      showAdminView(`
        <div class="content">
          <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${escapeHtml(lesson.title || lessonTitle)}</h2>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <span class="badge" style="background:var(--color-${lesson.status === "published" ? "success" : "warning"});color:#fff;padding:0.2rem 0.6rem;border-radius:var(--radius);font-size:0.8rem">${escapeHtml(lesson.status)}</span>
              ${lesson.status !== "published" ? `<button class="btn btn-primary" id="publish-btn">Publish</button>` : ""}
              <button class="btn" id="edit-btn">Edit</button>
            </div>
          </div>
          <div class="card" style="padding:0;overflow:hidden">
            <iframe id="lesson-frame" style="width:100%;border:none;display:block;min-height:500px"></iframe>
          </div>
        </div>
      `);
      document.getElementById("back-btn")?.addEventListener("click", loadAdminLessons);
      document.getElementById("publish-btn")?.addEventListener("click", async () => {
        try {
          await request(`/lessons/${lessonId}/publish`, { method: "POST" });
          showToast("Lesson published!");
          viewAdminLesson(lessonId, lessonTitle);
        } catch(err) { showToast("Error: " + err.message); }
      });
      document.getElementById("edit-btn")?.addEventListener("click", async () => {
        let currentHtml = "";
        try {
          const resp = await fetch(`${API_BASE}/lessons/${lessonId}/content`, { headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token") || ""}` } });
          if (resp.ok) currentHtml = await resp.text();
        } catch(e) {}
        showAdminView(`
          <div class="content">
            <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
            <h2>Edit Lesson</h2>
            <div class="card" style="margin-top:1rem">
              <form id="edit-lesson-form" style="display:flex;flex-direction:column;gap:0.5rem">
                <input class="input" name="title" value="${escapeHtml(lesson.title || "")}" required>
                <textarea class="input" name="content" rows="14" style="font-family:monospace">${escapeHtml(currentHtml)}</textarea>
                <div style="display:flex;gap:0.5rem">
                  <button class="btn btn-primary" type="submit">Save Changes</button>
                  <button class="btn" type="button" id="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        `);
        document.getElementById("back-btn")?.addEventListener("click", () => viewAdminLesson(lessonId, lessonTitle));
        document.getElementById("cancel-btn")?.addEventListener("click", () => viewAdminLesson(lessonId, lessonTitle));
        document.getElementById("edit-lesson-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await request(`/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify({ title: fd.get("title"), html_content: fd.get("content") }) });
            showToast("Lesson updated!");
            viewAdminLesson(lessonId, lessonTitle);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      try {
        const resp = await fetch(`${API_BASE}/lessons/${lessonId}/content`, { headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token") || ""}` } });
        if (resp.ok) {
          const html = await resp.text();
          const iframe = document.getElementById("lesson-frame");
          iframe.srcdoc = html;
          iframe.onload = () => {
            try { iframe.style.height = Math.max(iframe.contentDocument.documentElement.scrollHeight, 400) + "px"; } catch(e) {}
          };
        }
      } catch(e) {}
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading lesson</p></div>'); }
  }

  async function loadAdminQuizzes() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading quizzes...</p></div>');
    try {
      const quizzes = await request("/quizzes/");
      const list = Array.isArray(quizzes) ? quizzes : [];
      const lessons = await request("/lessons/");
      const lessonList = Array.isArray(lessons) ? lessons : [];
      const lessonMap = {};
      lessonList.forEach(l => lessonMap[l.id] = l.title);
      showAdminView(`
        <div class="content">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>Quizzes</h2>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary" id="add-quiz-html-btn">+ HTML Quiz</button>
              <button class="btn btn-primary" id="add-quiz-btn">+ Builder Quiz</button>
            </div>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No quizzes yet</p></div>' :
              list.map(q => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(q.id)}" data-title="${escapeHtml(q.title)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div style="flex:1">
                      <div style="display:flex;justify-content:space-between;align-items:center">
                        <h3>${escapeHtml(q.title)}</h3>
                        <span class="badge" style="background:var(--color-${q.status === "published" ? "success" : "warning"});color:#fff;padding:0.15rem 0.5rem;border-radius:var(--radius);font-size:0.75rem">${escapeHtml(q.status)}</span>
                      </div>
                      <p style="color:var(--color-text-muted);font-size:0.85rem;margin-top:0.25rem">${escapeHtml(lessonMap[q.lesson_id] || "Standalone")}</p>
                      <p style="color:var(--color-text-muted);font-size:0.85rem">${q.slug ? "HTML Quiz" : "Structured Quiz"}</p>
                    </div>
                    ${deleteBtn(q.id, q.title, "/quizzes")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          viewAdminQuiz(card.dataset.id, card.dataset.title);
        });
      });
      initDeleteButtons();
      document.getElementById("add-quiz-html-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New HTML Quiz</h3>
            <form id="create-quiz-html-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <select class="input" name="lesson_id"><option value="">Select lesson (optional)...</option></select>
              <input class="input" name="title" placeholder="Quiz title" required>
              <textarea class="input" name="html_content" rows="8" placeholder="Paste or write full HTML quiz content..." required></textarea>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        request("/lessons/").then(ls => {
          const sel = document.querySelector('[name="lesson_id"]');
          if (sel && Array.isArray(ls)) ls.forEach(l => { const o = document.createElement("option"); o.value = l.id; o.textContent = l.title; sel.appendChild(o); });
        });
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-quiz-html-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          if (!fd.get("title") || !fd.get("html_content")) { showToast("Title and content are required"); return; }
          try {
            await request("/quizzes/from-html", { method: "POST", body: JSON.stringify({ lesson_id: fd.get("lesson_id") || null, title: fd.get("title"), html_content: fd.get("html_content") }) });
            showToast("Quiz created!");
            loadAdminQuizzes();
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      document.getElementById("add-quiz-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New Builder Quiz</h3>
            <form id="create-quiz-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <select class="input" name="lesson_id"><option value="">Select lesson (optional)...</option></select>
              <input class="input" name="title" placeholder="Quiz title" required>
              <div id="questions-area"></div>
              <button class="btn" type="button" id="add-question-btn" style="align-self:flex-start">+ Add Question</button>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save Quiz</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        request("/lessons/").then(ls => {
          const sel = document.querySelector('[name="lesson_id"]');
          if (sel && Array.isArray(ls)) ls.forEach(l => { const o = document.createElement("option"); o.value = l.id; o.textContent = l.title; sel.appendChild(o); });
        });
        let qIdx = 0;
        function addQuestion() {
          const area = document.getElementById("questions-area");
          const i = qIdx++;
          const div = document.createElement("div");
          div.className = "card";
          div.style.cssText = "padding:0.75rem;margin-bottom:0.5rem";
          div.innerHTML = `
            <input class="input" name="q_text_${i}" placeholder="Question text" required style="margin-bottom:0.5rem">
            <input class="input" name="q_a_${i}" placeholder="Option A" required style="margin-bottom:0.25rem">
            <input class="input" name="q_b_${i}" placeholder="Option B" required style="margin-bottom:0.25rem">
            <input class="input" name="q_c_${i}" placeholder="Option C" style="margin-bottom:0.25rem">
            <input class="input" name="q_d_${i}" placeholder="Option D" style="margin-bottom:0.25rem">
            <select class="input" name="q_answer_${i}">
              <option value="A">Correct: A</option>
              <option value="B">Correct: B</option>
              <option value="C">Correct: C</option>
              <option value="D">Correct: D</option>
            </select>
          `;
          area.appendChild(div);
        }
        addQuestion();
        document.getElementById("add-question-btn").addEventListener("click", addQuestion);
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-quiz-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const questions = [];
          for (let i = 0; i < qIdx; i++) {
            const text = fd.get(`q_text_${i}`);
            if (!text) continue;
            questions.push({
              prompt: text,
              options: [
                { text: fd.get(`q_a_${i}`) || "", is_correct: fd.get(`q_answer_${i}`) === "A" },
                { text: fd.get(`q_b_${i}`) || "", is_correct: fd.get(`q_answer_${i}`) === "B" },
                { text: fd.get(`q_c_${i}`) || "", is_correct: fd.get(`q_answer_${i}`) === "C" },
                { text: fd.get(`q_d_${i}`) || "", is_correct: fd.get(`q_answer_${i}`) === "D" },
              ]
            });
          }
          if (!fd.get("title")) { showToast("Title is required"); return; }
          try {
            await request("/quizzes", { method: "POST", body: JSON.stringify({ lesson_id: fd.get("lesson_id") || null, title: fd.get("title"), questions }) });
            showToast("Quiz created!");
            loadAdminQuizzes();
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading quizzes</p></div>'); }
  }

  async function viewAdminQuiz(quizId, quizTitle) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading quiz...</p></div>');
    try {
      const quiz = await request(`/quizzes/${quizId}`);
      if (!quiz) return;
      let htmlContent = "";
      if (quiz.slug) {
        try {
          const resp = await fetch(`${API_BASE}/quizzes/${quizId}/content`, { headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token") || ""}` } });
          if (resp.ok) htmlContent = await resp.text();
        } catch(e) {}
      }
      let questionsHtml = "";
      if (!quiz.slug) {
        const fullQuiz = await request(`/quizzes/by-lesson/${quiz.lesson_id}`).catch(() => null);
        if (fullQuiz && Array.isArray(fullQuiz.questions)) {
          questionsHtml = fullQuiz.questions.map((q, i) => `
            <div class="card" style="padding:0.75rem;margin-bottom:0.5rem">
              <p style="font-weight:600;margin-bottom:0.5rem">${i + 1}. ${escapeHtml(q.prompt)}</p>
              ${q.options.map(o => `<p style="font-size:0.85rem;margin:0.15rem 0;padding-left:1rem">• ${escapeHtml(o.text)}</p>`).join("")}
            </div>
          `).join("");
        }
      }
      showAdminView(`
        <div class="content">
          <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${escapeHtml(quiz.title || quizTitle)}</h2>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <span class="badge" style="background:var(--color-${quiz.status === "published" ? "success" : "warning"});color:#fff;padding:0.2rem 0.6rem;border-radius:var(--radius);font-size:0.8rem">${escapeHtml(quiz.status)}</span>
              ${quiz.status !== "published" ? `<button class="btn btn-primary" id="publish-btn">Publish</button>` : ""}
              <button class="btn" id="edit-btn">Edit</button>
            </div>
          </div>
          ${htmlContent ?
            `<div class="card" style="padding:0;overflow:hidden"><iframe id="quiz-frame" style="width:100%;border:none;display:block;min-height:500px"></iframe></div>` :
            questionsHtml ?
              `<div>${questionsHtml}</div>` :
              '<div class="empty-state"><p>No quiz content</p></div>'
          }
        </div>
      `);
      document.getElementById("back-btn")?.addEventListener("click", loadAdminQuizzes);
      document.getElementById("publish-btn")?.addEventListener("click", async () => {
        try {
          await request(`/quizzes/${quizId}/publish`, { method: "POST" });
          showToast("Quiz published!");
          viewAdminQuiz(quizId, quizTitle);
        } catch(err) { showToast("Error: " + err.message); }
      });
      document.getElementById("edit-btn")?.addEventListener("click", () => {
        showAdminView(`
          <div class="content">
            <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
            <h2>Edit Quiz</h2>
            <div class="card" style="margin-top:1rem">
              <form id="edit-quiz-form" style="display:flex;flex-direction:column;gap:0.5rem">
                <input class="input" name="title" value="${escapeHtml(quiz.title || "")}" required>
                <textarea class="input" name="content" rows="14" style="font-family:monospace">${escapeHtml(htmlContent)}</textarea>
                <div style="display:flex;gap:0.5rem">
                  <button class="btn btn-primary" type="submit">Save Changes</button>
                  <button class="btn" type="button" id="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        `);
        document.getElementById("back-btn")?.addEventListener("click", () => viewAdminQuiz(quizId, quizTitle));
        document.getElementById("cancel-btn")?.addEventListener("click", () => viewAdminQuiz(quizId, quizTitle));
        document.getElementById("edit-quiz-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await request(`/quizzes/${quizId}`, { method: "PUT", body: JSON.stringify({ title: fd.get("title"), html_content: fd.get("content") }) });
            showToast("Quiz updated!");
            viewAdminQuiz(quizId, quizTitle);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      if (htmlContent) {
        const iframe = document.getElementById("quiz-frame");
        iframe.srcdoc = htmlContent;
        iframe.onload = () => {
          try { iframe.style.height = Math.max(iframe.contentDocument.documentElement.scrollHeight, 400) + "px"; } catch(e) {}
        };
      }
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading quiz</p></div>'); }
  }

  async function loadAdminGames() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading games...</p></div>');
    try {
      const games = await request("/games/");
      const list = Array.isArray(games) ? games : [];
      const lessons = await request("/lessons/");
      const lessonList = Array.isArray(lessons) ? lessons : [];
      const lessonMap = {};
      lessonList.forEach(l => lessonMap[l.id] = l.title);
      showAdminView(`
        <div class="content">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>Games</h2>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary" id="add-game-html-btn">+ HTML Game</button>
              <button class="btn btn-primary" id="add-game-btn">+ Builder Game</button>
            </div>
          </div>
          <div id="form-area"></div>
          <div class="card-grid">
            ${list.length === 0 ? '<div class="empty-state"><p>No games yet</p></div>' :
              list.map(g => `
                <div class="card" style="cursor:pointer" data-id="${escapeHtml(g.id)}" data-title="${escapeHtml(g.title)}">
                  <div style="display:flex;justify-content:space-between;align-items:start">
                    <div style="flex:1">
                      <div style="display:flex;justify-content:space-between;align-items:center">
                        <h3>${escapeHtml(g.title)}</h3>
                        <span class="badge" style="background:var(--color-${g.status === "published" ? "success" : "warning"});color:#fff;padding:0.15rem 0.5rem;border-radius:var(--radius);font-size:0.75rem">${escapeHtml(g.status)}</span>
                      </div>
                      <p style="color:var(--color-text-muted);font-size:0.85rem;margin-top:0.25rem">${escapeHtml(lessonMap[g.lesson_id] || "Standalone")}</p>
                      <p style="color:var(--color-text-muted);font-size:0.85rem">${g.slug ? "HTML Game" : "Structured Game"}</p>
                    </div>
                    ${deleteBtn(g.id, g.title, "/games")}
                  </div>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#admin-content .card[data-id]").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-delete]")) return;
          viewAdminGame(card.dataset.id, card.dataset.title);
        });
      });
      initDeleteButtons();
      document.getElementById("add-game-html-btn")?.addEventListener("click", () => {
        document.getElementById("form-area").innerHTML = `
          <div class="card" style="margin-bottom:1rem">
            <h3>New HTML Game</h3>
            <form id="create-game-html-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
              <select class="input" name="lesson_id"><option value="">Select lesson (optional)...</option></select>
              <input class="input" name="title" placeholder="Game title" required>
              <textarea class="input" name="html_content" rows="8" placeholder="Paste or write full HTML game content..." required></textarea>
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn" type="button" id="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        `;
        request("/lessons/").then(ls => {
          const sel = document.querySelector('[name="lesson_id"]');
          if (sel && Array.isArray(ls)) ls.forEach(l => { const o = document.createElement("option"); o.value = l.id; o.textContent = l.title; sel.appendChild(o); });
        });
        document.getElementById("cancel-btn").addEventListener("click", () => document.getElementById("form-area").innerHTML = "");
        document.getElementById("create-game-html-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          if (!fd.get("title") || !fd.get("html_content")) { showToast("Title and content are required"); return; }
          try {
            await request("/games/from-html", { method: "POST", body: JSON.stringify({ lesson_id: fd.get("lesson_id") || null, title: fd.get("title"), html_content: fd.get("html_content") }) });
            showToast("Game created!");
            loadAdminGames();
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading games</p></div>'); }
  }

  async function viewAdminGame(gameId, gameTitle) {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading game...</p></div>');
    try {
      const game = await request(`/games/${gameId}`);
      if (!game) return;
      let htmlContent = "";
      if (game.slug) {
        try {
          const resp = await fetch(`${API_BASE}/games/${gameId}/content`, { headers: { "Authorization": `Bearer ${localStorage.getItem("casuya_token") || ""}` } });
          if (resp.ok) htmlContent = await resp.text();
        } catch(e) {}
      }
      showAdminView(`
        <div class="content">
          <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h2>${escapeHtml(game.title || gameTitle)}</h2>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <span class="badge" style="background:var(--color-${game.status === "published" ? "success" : "warning"});color:#fff;padding:0.2rem 0.6rem;border-radius:var(--radius);font-size:0.8rem">${escapeHtml(game.status)}</span>
              ${game.status !== "published" ? `<button class="btn btn-primary" id="publish-btn">Publish</button>` : ""}
              <button class="btn" id="edit-btn">Edit</button>
            </div>
          </div>
          ${htmlContent ?
            `<div class="card" style="padding:0;overflow:hidden"><iframe id="game-frame" style="width:100%;border:none;display:block;min-height:500px"></iframe></div>` :
            '<div class="empty-state"><p>No game content</p></div>'
          }
        </div>
      `);
      document.getElementById("back-btn")?.addEventListener("click", loadAdminGames);
      document.getElementById("publish-btn")?.addEventListener("click", async () => {
        try {
          await request(`/games/${gameId}/publish`, { method: "POST" });
          showToast("Game published!");
          viewAdminGame(gameId, gameTitle);
        } catch(err) { showToast("Error: " + err.message); }
      });
      document.getElementById("edit-btn")?.addEventListener("click", () => {
        showAdminView(`
          <div class="content">
            <button class="btn" id="back-btn" style="margin-bottom:1rem">&larr; Back</button>
            <h2>Edit Game</h2>
            <div class="card" style="margin-top:1rem">
              <form id="edit-game-form" style="display:flex;flex-direction:column;gap:0.5rem">
                <input class="input" name="title" value="${escapeHtml(game.title || "")}" required>
                <textarea class="input" name="content" rows="14" style="font-family:monospace">${escapeHtml(htmlContent)}</textarea>
                <div style="display:flex;gap:0.5rem">
                  <button class="btn btn-primary" type="submit">Save Changes</button>
                  <button class="btn" type="button" id="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        `);
        document.getElementById("back-btn")?.addEventListener("click", () => viewAdminGame(gameId, gameTitle));
        document.getElementById("cancel-btn")?.addEventListener("click", () => viewAdminGame(gameId, gameTitle));
        document.getElementById("edit-game-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await request(`/games/${gameId}`, { method: "PUT", body: JSON.stringify({ title: fd.get("title"), html_content: fd.get("content") }) });
            showToast("Game updated!");
            viewAdminGame(gameId, gameTitle);
          } catch(err) { showToast("Error: " + err.message); }
        });
      });
      if (htmlContent) {
        const iframe = document.getElementById("game-frame");
        iframe.srcdoc = htmlContent;
        iframe.onload = () => {
          try { iframe.style.height = Math.max(iframe.contentDocument.documentElement.scrollHeight, 400) + "px"; } catch(e) {}
        };
      }
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading game</p></div>'); }
  }

  async function loadAdminUsers() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading users...</p></div>');
    try {
      const [students, teachers] = await Promise.all([request("/students"), request("/teachers")]);
      const sList = Array.isArray(students) ? students : [];
      const tList = Array.isArray(teachers) ? teachers : [];
      showAdminView(`
        <h2>Users</h2>
        <h3 style="margin-top:1rem">Students (${sList.length})</h3>
        <div style="margin-top:0.5rem">
          ${sList.length === 0 ? '<p style="color:var(--color-text-muted)">No students</p>' :
            sList.map(s => `<div class="card" style="padding:0.5rem 0.75rem;margin-bottom:0.5rem;display:flex;justify-content:space-between"><span>${escapeHtml(s.full_name||"")}</span><span style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(s.form_level||"")}</span></div>`).join("")}
        </div>
        <h3 style="margin-top:1.5rem">Teachers (${tList.length})</h3>
        <div style="margin-top:0.5rem">
          ${tList.length === 0 ? '<p style="color:var(--color-text-muted)">No teachers</p>' :
            tList.map(t => `<div class="card" style="padding:0.5rem 0.75rem;margin-bottom:0.5rem;display:flex;justify-content:space-between"><span>${escapeHtml(t.full_name||"")}</span><span style="color:var(--color-text-muted);font-size:0.85rem">${escapeHtml(t.subjects||"")}</span></div>`).join("")}
        </div>
      `);
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading users</p></div>'); }
  }

  async function loadAdminPayments() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    showAdminView(`
      <h2>Payments</h2>
      <p style="color:var(--color-text-muted);margin-bottom:1rem">AzamPay mobile money integration</p>
      <div class="card" style="max-width:500px">
        <h3>Initiate Checkout</h3>
        <form id="payment-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
          <input class="input" name="mobile_number" placeholder="Mobile number (e.g. 0712345678)" required />
          <input class="input" name="amount_tzs" type="number" placeholder="Amount (TZS)" required />
          <select class="input" name="provider" required>
            <option value="">Select provider...</option>
            <option value="azampay">AzamPay</option>
            <option value="m-pesa">M-Pesa</option>
            <option value="tigo-pesa">Tigo Pesa</option>
            <option value="halopesa">HaloPesa</option>
          </select>
          <button class="btn btn-success" type="submit">Initiate Payment</button>
        </form>
        <div id="payment-result" style="margin-top:0.5rem"></div>
      </div>
    `);
    document.getElementById("payment-form")?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      try {
        const data = await request("/payments/checkout", {
          method: "POST",
          body: JSON.stringify({
            mobile_number: fd.get("mobile_number"),
            amount_tzs: parseInt(fd.get("amount_tzs"), 10),
            provider: fd.get("provider"),
            idempotency_key: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          }),
        });
        if (data === null) return;
        document.getElementById("payment-result").innerHTML = `<p style="color:var(--color-success)">Payment initiated: ${escapeHtml(JSON.stringify(data))}</p>`;
      } catch (err) {
        document.getElementById("payment-result").innerHTML = `<p style="color:var(--color-danger)">${escapeHtml(err.message)}</p>`;
      }
    });
  }

  async function loadAdminNotifications() {
    showAdminView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const [data, users] = await Promise.all([
        request("/notifications"),
        request("/users"),
      ]);
      const list = Array.isArray(data) ? data : [];
      const userList = Array.isArray(users) ? users : [];
      showAdminView(`
        <h2>Notifications</h2>
        <div class="card" style="margin-top:1rem;margin-bottom:1rem">
          <h3>Send Notification</h3>
          <form id="send-notif-form" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.75rem">
            <label style="font-size:0.85rem;font-weight:500">Recipient</label>
            <select class="input" name="recipient_type" id="notif-recipient-type" required>
              <option value="role_student">All Students</option>
              <option value="role_teacher">All Teachers</option>
              <option value="specific">Specific User...</option>
            </select>
            <div id="notif-specific-user" style="display:none">
              <select class="input" name="user_id" id="notif-user-select">
                <option value="">Select user...</option>
                ${userList.map(u => `<option value="${escapeHtml(u.id)}">${escapeHtml(u.email)} (${escapeHtml(u.role)})</option>`).join("")}
              </select>
            </div>
            <label style="font-size:0.85rem;font-weight:500">Message</label>
            <textarea class="input" name="message" rows="3" placeholder="Write your notification message..." required></textarea>
            <button class="btn btn-primary" type="submit">Send Notification</button>
            <p id="notif-send-status" style="font-size:0.85rem;display:none"></p>
          </form>
        </div>
        <h3>Notification History</h3>
        <div style="margin-top:0.5rem">
          ${list.length === 0 ? '<div class="empty-state"><p>No notifications yet</p></div>' :
            list.map(n => `
              <div class="card" style="padding:0.75rem;margin-bottom:0.5rem">
                <p style="margin:0;font-size:0.85rem">${escapeHtml(n.message)}</p>
                <p style="margin:0.25rem 0 0;font-size:0.75rem;color:var(--color-text-muted)">${n.is_read ? "Read" : "Unread"}</p>
              </div>
            `).join("")}
        </div>
      `);

      // Toggle specific user select
      document.getElementById("notif-recipient-type").addEventListener("change", (e) => {
        document.getElementById("notif-specific-user").style.display = e.target.value === "specific" ? "block" : "none";
      });

      // Send form
      document.getElementById("send-notif-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const type = fd.get("recipient_type");
        const message = fd.get("message");
        const statusEl = document.getElementById("notif-send-status");
        try {
          let body = { message };
          if (type === "role_student") body.role = "student";
          else if (type === "role_teacher") body.role = "teacher";
          else body.user_id = fd.get("user_id");
          if (!body.role && !body.user_id) {
            statusEl.textContent = "Please select a user";
            statusEl.style.color = "var(--color-danger)";
            statusEl.style.display = "block";
            return;
          }
          const result = await request("/notifications", { method: "POST", body: JSON.stringify(body) });
          statusEl.textContent = `Sent to ${result.sent} user(s)`;
          statusEl.style.color = "var(--color-success)";
          statusEl.style.display = "block";
          e.target.reset();
          document.getElementById("notif-specific-user").style.display = "none";
          loadAdminNotifications();
        } catch(err) {
          statusEl.textContent = "Error: " + err.message;
          statusEl.style.color = "var(--color-danger)";
          statusEl.style.display = "block";
        }
      });
    } catch(e) { showAdminView('<div class="empty-state"><p>Error loading notifications</p></div>'); }
  }

  async function loadAdminUploads() {
    showAdminView(`
      <h2>Uploads</h2>
      <div class="card" style="margin-top:1rem">
        <h3>Upload File</h3>
        <p style="color:var(--color-text-muted);font-size:0.85rem;margin-bottom:0.5rem">Supports images (png, jpg, gif, svg), videos (mp4, webm), audio (mp3, wav, ogg)</p>
        <form id="upload-form" style="display:flex;flex-direction:column;gap:0.5rem">
          <input class="input" type="file" id="upload-file" required />
          <button class="btn btn-success" type="submit">Upload</button>
        </form>
        <div id="upload-result" style="margin-top:0.5rem"></div>
      </div>
    `);
    document.getElementById("upload-form")?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const fileInput = document.getElementById("upload-file");
      const file = fileInput?.files?.[0];
      if (!file) return;
      const token = localStorage.getItem("casuya_token");
      const formData = new FormData();
      formData.append("file", file);
      try {
        const resp = await fetch("http://localhost:8000/uploads/", {
          method: "POST",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await resp.json();
        if (resp.ok) {
          document.getElementById("upload-result").innerHTML = `<p style="color:var(--color-success)">Uploaded: ${escapeHtml(data.filename)} → ${escapeHtml(data.path)}</p>`;
        } else {
          document.getElementById("upload-result").innerHTML = `<p style="color:var(--color-danger)">Error: ${escapeHtml(data.detail || "Upload failed")}</p>`;
        }
      } catch (err) {
        document.getElementById("upload-result").innerHTML = `<p style="color:var(--color-danger)">${escapeHtml(err.message)}</p>`;
      }
    });
  }

  async function loadAdminBranding() {
    const API = window.location.port === "8000" ? window.location.origin : `${window.location.protocol}//${window.location.hostname}:8000`;
    const token = localStorage.getItem("casuya_token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    // Check what's currently uploaded
    let logoExists = false, faviconExists = false;
    try {
      const lr = await fetch(`${API}/branding/logo`);
      logoExists = lr.ok;
    } catch {}
    try {
      const fr = await fetch(`${API}/branding/favicon`);
      faviconExists = fr.ok;
    } catch {}

    showAdminView(`
      <div class="content">
        <h2>🎨 Site Branding</h2>
        <p style="color:var(--color-text-muted);font-size:0.85rem;margin-bottom:1.5rem">Upload your logo and favicon. These appear across the entire platform.</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
          <!-- Logo -->
          <div class="card" style="padding:1.5rem">
            <h3 style="margin-bottom:0.75rem">Logo</h3>
            <div style="text-align:center;margin-bottom:1rem">
              ${logoExists
                ? `<img src="${API}/branding/logo?t=${Date.now()}" alt="Current logo" style="max-width:120px;max-height:120px;border-radius:12px;border:1px solid var(--color-border)">`
                : `<div style="width:120px;height:120px;margin:0 auto;background:var(--color-primary);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:800">C</div>`
              }
              <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:0.5rem">${logoExists ? "Custom logo active" : "Using default"}</p>
            </div>
            <form id="logo-upload-form" style="display:flex;flex-direction:column;gap:0.5rem">
              <input class="input" type="file" id="logo-file" accept="image/*" required />
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-success" type="submit" style="flex:1">${logoExists ? "Replace" : "Upload"}</button>
                ${logoExists ? '<button class="btn btn-danger" type="button" id="logo-delete" style="flex:0">Delete</button>' : ''}
              </div>
            </form>
            <div id="logo-result" style="margin-top:0.5rem;font-size:0.8rem"></div>
          </div>

          <!-- Favicon -->
          <div class="card" style="padding:1.5rem">
            <h3 style="margin-bottom:0.75rem">Favicon</h3>
            <div style="text-align:center;margin-bottom:1rem">
              ${faviconExists
                ? `<img src="${API}/branding/favicon?t=${Date.now()}" alt="Current favicon" style="width:64px;height:64px;border-radius:8px;border:1px solid var(--color-border)">`
                : `<div style="width:64px;height:64px;margin:0 auto;background:var(--color-primary);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;font-weight:800">C</div>`
              }
              <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:0.5rem">${faviconExists ? "Custom favicon active" : "Using default"}</p>
            </div>
            <form id="favicon-upload-form" style="display:flex;flex-direction:column;gap:0.5rem">
              <input class="input" type="file" id="favicon-file" accept="image/*" required />
              <div style="display:flex;gap:0.5rem">
                <button class="btn btn-success" type="submit" style="flex:1">${faviconExists ? "Replace" : "Upload"}</button>
                ${faviconExists ? '<button class="btn btn-danger" type="button" id="favicon-delete" style="flex:0">Delete</button>' : ''}
              </div>
            </form>
            <div id="favicon-result" style="margin-top:0.5rem;font-size:0.8rem"></div>
          </div>
        </div>
      </div>
    `);

    // Logo upload
    document.getElementById("logo-upload-form")?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const file = document.getElementById("logo-file")?.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      try {
        const r = await fetch(`${API}/branding/logo`, { method: "POST", headers, body: fd });
        const d = await r.json();
        if (r.ok) {
          document.getElementById("logo-result").innerHTML = '<span style="color:var(--color-success)">Logo uploaded!</span>';
          loadAdminBranding();
        } else {
          document.getElementById("logo-result").innerHTML = `<span style="color:var(--color-danger)">${escapeHtml(d.detail || "Failed")}</span>`;
        }
      } catch (e) {
        document.getElementById("logo-result").innerHTML = `<span style="color:var(--color-danger)">${escapeHtml(e.message)}</span>`;
      }
    });

    // Logo delete
    document.getElementById("logo-delete")?.addEventListener("click", async () => {
      try {
        await fetch(`${API}/branding/logo`, { method: "DELETE", headers });
        loadAdminBranding();
      } catch {}
    });

    // Favicon upload
    document.getElementById("favicon-upload-form")?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const file = document.getElementById("favicon-file")?.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      try {
        const r = await fetch(`${API}/branding/favicon`, { method: "POST", headers, body: fd });
        const d = await r.json();
        if (r.ok) {
          document.getElementById("favicon-result").innerHTML = '<span style="color:var(--color-success)">Favicon uploaded!</span>';
          loadAdminBranding();
        } else {
          document.getElementById("favicon-result").innerHTML = `<span style="color:var(--color-danger)">${escapeHtml(d.detail || "Failed")}</span>`;
        }
      } catch (e) {
        document.getElementById("favicon-result").innerHTML = `<span style="color:var(--color-danger)">${escapeHtml(e.message)}</span>`;
      }
    });

    // Favicon delete
    document.getElementById("favicon-delete")?.addEventListener("click", async () => {
      try {
        await fetch(`${API}/branding/favicon`, { method: "DELETE", headers });
        loadAdminBranding();
      } catch {}
    });
  }

  loadAdminOverview();
}

// --- Teacher Dashboard ---

async function renderTeacherDashboard() {
  const token = localStorage.getItem("casuya_token");
  const payload = decodeToken(token);

  render("#app", `
    <div class="sidebar-layout">
      <aside id="teacher-sidebar" class="sidebar">
        <div class="sidebar-header">
          <h2>Casuya</h2>
          <p>Teacher Portal</p>
        </div>
        <nav class="sidebar-nav" id="teacher-nav">
          <div class="sidebar-nav-item active" data-view="overview">📊 Overview</div>
          <div class="sidebar-nav-item" data-view="students">👥 Students</div>
          <div class="sidebar-nav-item" data-view="lessons">📝 Lessons</div>
          <div class="sidebar-nav-item" data-view="bookmarks">🔖 Bookmarks</div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-footer-row">
            <div style="position:relative;flex:1">
              <button id="notif-bell" class="icon-btn" style="width:100%;font-size:1.1rem" title="Notifications">🔔<span id="notif-badge" style="display:none;position:absolute;top:-4px;right:-6px;background:red;color:#fff;font-size:0.6rem;padding:1px 4px;border-radius:8px;min-width:14px;text-align:center">0</span></button>
              <div id="notif-dropdown" class="notif-dropdown"></div>
            </div>
            <div style="position:relative">
              <button id="profile-btn" class="icon-btn" title="Profile">👤</button>
              <div id="profile-dropdown" class="profile-dropdown">
                <button class="dropdown-item" id="prof-edit">Edit Profile</button>
                <button class="dropdown-item" id="prof-logout" style="color:var(--color-danger)">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <main class="main-content">
        <header class="main-header">
          <button id="sidebar-toggle" class="sidebar-toggle-btn">&#9776;</button>
          <div style="position:relative;flex:1;max-width:360px">
            <input id="teacher-search" type="search" class="input" placeholder="Search lessons, students..." style="padding:0.4rem 0.75rem;font-size:0.85rem">
            <div id="teacher-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);z-index:100;max-height:300px;overflow-y:auto"></div>
          </div>
        </header>
        <div id="teacher-content" class="main-body"></div>
      </main>
    </div>
  `);
  // Sidebar toggle (mobile)
  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.getElementById("teacher-sidebar").classList.toggle("open");
  }, { signal: _globalAbort.signal });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#teacher-sidebar") && !e.target.closest("#sidebar-toggle")) {
      document.getElementById("teacher-sidebar")?.classList.remove("open");
    }
  }, { signal: _globalAbort.signal });

  // Search functionality
  const teacherSearchInput = document.getElementById("teacher-search");
  const teacherSearchResults = document.getElementById("teacher-search-results");
  let searchTimer;

  teacherSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = teacherSearchInput.value.trim();
    if (q.length < 2) { teacherSearchResults.style.display = "none"; return; }
    searchTimer = setTimeout(async () => {
      try {
        const results = await request(`/search/?q=${encodeURIComponent(q)}`);
        if (!Array.isArray(results) || results.length === 0) {
          teacherSearchResults.innerHTML = '<div style="padding:0.5rem;color:var(--color-text-muted)">No results</div>';
        } else {
          teacherSearchResults.innerHTML = results.map(r => `
            <div class="teacher-search-item" data-id="${escapeHtml(r.id)}" data-type="${escapeHtml(r.type)}" style="padding:0.5rem;cursor:pointer;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between">
              <span>${escapeHtml(r.title)}</span>
              <span style="color:var(--color-text-muted);font-size:0.8rem">${escapeHtml(r.type)}</span>
            </div>
          `).join("");
          teacherSearchResults.querySelectorAll(".teacher-search-item").forEach(el => {
            el.addEventListener("click", () => {
              teacherSearchResults.style.display = "none";
              teacherSearchInput.value = "";
            });
          });
        }
        teacherSearchResults.style.display = "block";
      } catch(e) { teacherSearchResults.style.display = "none"; }
    }, 300);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#teacher-search") && !e.target.closest("#teacher-search-results")) teacherSearchResults.style.display = "none";
  }, { signal: _globalAbort.signal });

  // Notifications
  const notifBell = document.getElementById("notif-bell");
  const notifDropdown = document.getElementById("notif-dropdown");
  const notifBadge = document.getElementById("notif-badge");
  let notifData = [];

  async function loadNotifs() {
    try {
      notifData = await request("/notifications");
      const unread = notifData.filter(n => !n.is_read).length;
      if (unread > 0) { notifBadge.textContent = unread; notifBadge.style.display = "inline"; }
      else notifBadge.style.display = "none";
    } catch(e) {}
  }

  notifBell.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (notifDropdown.style.display === "block") { notifDropdown.style.display = "none"; return; }
    await loadNotifs();
    if (notifData.length === 0) {
      notifDropdown.innerHTML = '<div style="padding:0.75rem;color:var(--color-text-muted)">No notifications</div>';
    } else {
      notifDropdown.innerHTML = notifData.map(n => `
        <div class="notif-item ${n.is_read ? "" : "unread"}" data-id="${escapeHtml(n.id)}" style="padding:0.5rem 0.75rem;border-bottom:1px solid var(--color-border);${n.is_read ? "opacity:0.6" : "font-weight:600"}">
          <p style="margin:0;font-size:0.85rem">${escapeHtml(n.message)}</p>
        </div>
      `).join("");
      notifDropdown.querySelectorAll(".notif-item.unread").forEach(el => {
        el.addEventListener("click", async () => {
          await request(`/notifications/${el.dataset.id}/read`, { method: "POST" });
          await loadNotifs();
        });
      });
    }
    notifDropdown.style.display = "block";
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#notif-bell") && !e.target.closest("#notif-dropdown")) notifDropdown.style.display = "none"; }, { signal: _globalAbort.signal });

  // Profile dropdown
  document.getElementById("profile-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("profile-dropdown");
    dd.style.display = dd.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", (e) => { 
    const pd = document.getElementById("profile-dropdown");
    if (pd && !e.target.closest("#profile-btn") && !e.target.closest("#profile-dropdown")) pd.style.display = "none"; 
  }, { signal: _globalAbort.signal });

  document.getElementById("prof-logout").addEventListener("click", handleLogout);
  document.getElementById("prof-edit").addEventListener("click", () => {
    document.getElementById("profile-dropdown").style.display = "none";
    showTeacherProfileEditor();
  });

  // Navigation
  function setActiveNav(viewId) {
    document.querySelectorAll("#teacher-nav .sidebar-nav-item").forEach(el => {
      el.classList.toggle("active", el.dataset.view === viewId);
    });
  }

  function showTeacherView(content) {
    document.getElementById("teacher-content").innerHTML = content;
  }

  const navHandlers = {
    overview: () => { setActiveNav("overview"); loadTeacherOverview(); },
    students: () => { setActiveNav("students"); loadTeacherStudents(); },
    lessons: () => { setActiveNav("lessons"); loadTeacherLessons(); },
    bookmarks: () => { setActiveNav("bookmarks"); loadTeacherBookmarks(); },
  };

  document.querySelectorAll("#teacher-nav .sidebar-nav-item").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("teacher-sidebar")?.classList.remove("open");
      navHandlers[el.dataset.view]?.();
    });
  });

  async function showTeacherProfileEditor() {
    showTeacherView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const [me, profile] = await Promise.all([
        request("/users/me"),
        request("/teachers/me").catch(() => null),
      ]);
      showTeacherView(`
        <div class="content" style="max-width:500px;margin:0 auto">
          <h2>Edit Profile</h2>
          <form id="profile-form">
            <label>Email</label>
            <input type="email" value="${escapeHtml(me.email || "")}" disabled style="width:100%;padding:0.5rem;margin-bottom:0.75rem;border:1px solid var(--color-border);border-radius:var(--radius)">
            <label>Phone</label>
            <input type="tel" id="pf-phone" value="${escapeHtml(me.phone || "")}" style="width:100%;padding:0.5rem;margin-bottom:0.75rem;border:1px solid var(--color-border);border-radius:var(--radius)">
            ${profile ? `
              <label>Full Name</label>
              <input type="text" id="pf-name" value="${escapeHtml(profile.full_name || "")}" style="width:100%;padding:0.5rem;margin-bottom:0.75rem;border:1px solid var(--color-border);border-radius:var(--radius)">
              <label>Subjects</label>
              <input type="text" id="pf-subjects" value="${escapeHtml(profile.subjects || "")}" style="width:100%;padding:0.5rem;margin-bottom:0.75rem;border:1px solid var(--color-border);border-radius:var(--radius)">
            ` : ""}
            <button type="submit" class="btn btn-primary" style="width:100%">Save Changes</button>
          </form>
          <p id="profile-msg" style="display:none;margin-top:0.75rem"></p>
          <button class="btn lesson-back-btn" style="margin-top:1rem">&larr; Back</button>
        </div>
      `);
      document.querySelector("#teacher-content .lesson-back-btn")?.addEventListener("click", loadTeacherOverview);
      document.getElementById("profile-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = document.getElementById("profile-msg");
        try {
          await request("/users/me", { method: "PATCH", body: JSON.stringify({ phone: document.getElementById("pf-phone").value || null }) });
          if (profile) {
            await request("/teachers/me", { method: "PATCH", body: JSON.stringify({
              full_name: document.getElementById("pf-name").value || null,
              subjects: document.getElementById("pf-subjects").value || null,
            })});
          }
          msg.style.display = "block"; msg.style.color = "var(--color-success)"; msg.textContent = "Profile updated!";
          setTimeout(() => msg.style.display = "none", 3000);
        } catch(err) {
          msg.style.display = "block"; msg.style.color = "red"; msg.textContent = err.message;
        }
      });
    } catch(err) {
      showTeacherView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadTeacherOverview() {
    showTeacherView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const [overview, lessons] = await Promise.all([
        request("/analytics/overview"),
        request("/lessons/?status=published"),
      ]);
      const name = payload.full_name || payload.email || "Teacher";

      // Recently viewed from localStorage
      let recent = [];
      try { recent = JSON.parse(localStorage.getItem("casuya_recent") || "[]"); } catch(e) {}

      // Bookmarks
      let bookmarks = [];
      try { bookmarks = await request("/bookmarks"); } catch(e) {}

      showTeacherView(`
        <div class="content">
          <h2>Welcome, ${escapeHtml(name)}</h2>
          <div class="stat-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin:1rem 0">
            <div class="card"><h3>Students</h3><p style="font-size:1.6rem;font-weight:700">${overview?.total_students ?? 0}</p></div>
            <div class="card"><h3>Lessons</h3><p style="font-size:1.6rem;font-weight:700">${Array.isArray(lessons) ? lessons.length : 0}</p></div>
            <div class="card"><h3>Completion</h3><p style="font-size:1.6rem;font-weight:700">${overview?.avg_completion_rate ? Math.round(overview.avg_completion_rate) + "%" : "0%"}</p></div>
            <div class="card"><h3>Bookmarked</h3><p style="font-size:1.6rem;font-weight:700">${Array.isArray(bookmarks) ? bookmarks.length : 0}</p></div>
          </div>
          ${recent.length > 0 ? `
            <h3>Continue Editing</h3>
            <div class="card-grid" style="margin-top:0.5rem">
              ${recent.slice(0, 4).map(r => `
                <div class="card lesson-card clickable" data-id="${escapeHtml(r.id)}" style="padding:0.75rem">
                  <h4 style="margin:0 0 0.25rem;font-size:0.9rem">${escapeHtml(r.title)}</h4>
                  <span style="font-size:0.75rem;color:var(--color-text-muted)">${r.time ? new Date(r.time).toLocaleDateString() : ""}</span>
                </div>
              `).join("")}
            </div>
          ` : ""}
          <h3>${bookmarks.length > 0 ? "Bookmarked Lessons" : "Published Lessons"}</h3>
          <div class="card-grid" style="margin-top:0.5rem">
            ${!Array.isArray(lessons) || lessons.length === 0 ? '<div class="empty-state"><p>No lessons available yet</p></div>' :
              (bookmarks.length > 0 ? bookmarks : lessons).map(l => `
                <div class="card lesson-card clickable" data-id="${escapeHtml(l.lesson_id || l.id)}" style="position:relative">
                  <h3>${escapeHtml(l.lesson_title || l.title)}</h3>
                  ${l.lesson_id ? '<span style="position:absolute;top:0.5rem;right:0.5rem;font-size:0.75rem">🔖</span>' : ""}
                  <p style="color:var(--color-text-muted);font-size:0.8rem">${escapeHtml(l.status || "bookmarked")}</p>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#teacher-content .lesson-card.clickable").forEach(el => {
        el.addEventListener("click", () => viewLessonContent("#teacher-content", el.dataset.id, loadTeacherLessons));
      });
    } catch (err) {
      showTeacherView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadTeacherStudents() {
    showTeacherView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const students = await request("/students");
      showTeacherView(`
        <div class="content">
          <h2>Students</h2>
          <div class="card-grid" style="margin-top:1rem">
            ${!Array.isArray(students) || students.length === 0 ? '<div class="empty-state"><p>No students enrolled</p></div>' :
              students.map(s => `
                <div class="card">
                  <h3>${escapeHtml(s.full_name || s.user_id)}</h3>
                  <p style="color:var(--color-text-muted)">${escapeHtml(s.email || "")} ${s.form_level ? "— Form " + escapeHtml(s.form_level) : ""}</p>
                </div>
              `).join("")}
          </div>
        </div>
      `);
    } catch (err) {
      showTeacherView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadTeacherLessons() {
    showTeacherView('<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>');
    try {
      const lessons = await request("/lessons");
      showTeacherView(`
        <div class="content">
          <h2>Lessons</h2>
          <div class="card-grid" style="margin-top:1rem">
            ${!Array.isArray(lessons) || lessons.length === 0 ? '<div class="empty-state"><p>No lessons yet</p></div>' :
              lessons.map(l => `
                <div class="card lesson-card clickable" data-id="${escapeHtml(l.id)}">
                  <h3>${escapeHtml(l.title)}</h3>
                  <p style="color:var(--color-text-muted)">${escapeHtml(l.status)}</p>
                </div>
              `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#teacher-content .lesson-card.clickable").forEach(el => {
        el.addEventListener("click", () => viewLessonContent("#teacher-content", el.dataset.id, loadTeacherLessons));
      });
    } catch (err) {
      showTeacherView(`<div class="empty-state"><h2>Error</h2><p>${escapeHtml(err.message)}</p></div>`);
    }
  }

  async function loadTeacherBookmarks() {
    showTeacherView('<div class="loading-state"><div class="spinner"></div><p>Loading bookmarks...</p></div>');
    try {
      const data = await request("/bookmarks/");
      const bookmarks = Array.isArray(data) ? data : [];
      if (bookmarks.length === 0) {
        showTeacherView('<div class="content"><h2>Bookmarks</h2><div class="empty-state"><p>No bookmarks yet. Open a lesson and click ☆ to bookmark it.</p></div></div>');
        return;
      }
      showTeacherView(`
        <div class="content">
          <h2>Bookmarks</h2>
          <div class="card-grid" style="margin-top:1rem">
            ${bookmarks.map(b => `
              <div class="card lesson-card clickable" data-id="${escapeHtml(b.lesson_id || b.id)}" style="position:relative">
                <h3>${escapeHtml(b.lesson_title || b.title || "Untitled")}</h3>
                <span style="position:absolute;top:0.5rem;right:0.5rem;font-size:0.75rem">🔖</span>
              </div>
            `).join("")}
          </div>
        </div>
      `);
      document.querySelectorAll("#teacher-content .lesson-card.clickable").forEach(el => {
        el.addEventListener("click", () => viewLessonContent("#teacher-content", el.dataset.id, loadTeacherBookmarks));
      });
    } catch(e) {
      showTeacherView('<div class="content"><h2>Bookmarks</h2><div class="empty-state"><p>Error loading bookmarks</p></div></div>');
    }
  }

  loadNotifs();
  loadTeacherOverview();
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("casuya_token");
  if (token) {
    renderApp();
  } else {
    renderLogin();
  }
});
