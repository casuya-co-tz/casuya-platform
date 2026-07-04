import { request } from "./main.js";

console.log("Student portal loaded");

async function loadLessons() {
  const lessons = await request("/lessons/?status=published");
  const container = document.getElementById("lesson-list");
  if (!container) return;
  container.innerHTML = lessons.map(l => `
    <div class="lesson-card" data-id="${l.id}">
      <h3>${l.title}</h3>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadLessons);
