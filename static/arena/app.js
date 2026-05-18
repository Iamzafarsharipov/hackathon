function csrfToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]")?.value || "";
}

async function postToggle(url, button) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken(), "X-Requested-With": "XMLHttpRequest" },
  });
  const data = await response.json();
  button.dataset.completed = data.completed ? "true" : "false";
  button.classList.toggle("ring-2", data.completed);
  button.classList.toggle("ring-cyan-300", data.completed);
  const xp = document.querySelector("[data-xp]");
  const streak = document.querySelector("[data-streak]");
  if (xp) xp.textContent = data.xp;
  if (streak) streak.textContent = data.streak;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-toggle-url]");
  if (!button) return;
  postToggle(button.dataset.toggleUrl, button);
});
