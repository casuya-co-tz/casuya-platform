const API_BASE = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("casuya_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (resp.status === 401) {
    localStorage.removeItem("casuya_token");
    window.location.href = "/login";
  }
  return resp.json();
}

export { request };
