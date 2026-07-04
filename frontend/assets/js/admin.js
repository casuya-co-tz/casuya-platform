import { request } from "./main.js";

console.log("Admin portal loaded");

async function loadAnalytics() {
  const data = await request("/analytics/overview");
  document.getElementById("total-students").textContent = data.total_students;
  document.getElementById("total-lessons").textContent = data.total_lessons;
  document.getElementById("total-sessions").textContent = data.total_sessions;
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
