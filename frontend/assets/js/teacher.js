import { request } from "./main.js";

console.log("Teacher portal loaded");

async function loadStats() {
  const data = await request("/analytics/overview");
  document.getElementById("total-students") && (document.getElementById("total-students").textContent = data.total_students);
  document.getElementById("total-lessons") && (document.getElementById("total-lessons").textContent = data.total_lessons);
}

document.addEventListener("DOMContentLoaded", loadStats);
