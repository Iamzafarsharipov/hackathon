const STORAGE_KEY = "eduquest-arena-state-v2";

const defaults = {
  loggedIn: false,
  studentName: "Zafar",
  username: "zafar",
  xp: 0,
  streak: 0,
  multiplier: 1,
  badges: [],
  habits: [
    { id: 1, title: "90 min deep study", xp: 25, done: false },
    { id: 2, title: "Review lecture notes", xp: 20, done: false },
    { id: 3, title: "Solve 10 problems", xp: 35, done: false },
    { id: 4, title: "Sleep before midnight", xp: 15, done: false }
  ],
  routine: [
    { id: 1, slot: "Morning", title: "Plan top 3 quests", xp: 15, done: false },
    { id: 2, slot: "Afternoon", title: "Lab or practice block", xp: 20, done: false },
    { id: 3, slot: "Evening", title: "Recall and flashcards", xp: 20, done: false }
  ],
  subjects: [
    subject("Linear Algebra", "#38bdf8", ["Vectors & Matrices", "Gaussian Elimination", "Eigenvalues", "Vector Spaces"]),
    subject("Computer Programming 2", "#34d399", ["OOP Patterns", "Data Structures", "Files & APIs", "Testing"]),
    subject("Calculus 2", "#fb923c", ["Integrals", "Series", "Parametric Curves", "Multivariable Intro"]),
    subject("Physics", "#a78bfa", ["Kinematics", "Newton Laws", "Energy", "Electric Fields"])
  ],
  leaders: [
    ["Malika", 2450],
    ["Aziz", 1980],
    ["Dilshod", 1540],
    ["Madina", 1380]
  ]
};

let state = loadState();
let grantChart;
let activeQuest = null;
let activeCalendarIndex = 1;

const calendarDays = [
  {
    label: "Sunday, 5 April 2026",
    short: "Sunday",
    events: []
  },
  {
    label: "Monday, 6 April 2026",
    short: "Monday",
    events: [
      event("lecture", "MATH211-Calculus II-Lecture", "Monday, 6 April, 9:00 AM » 11:00 AM", "Course event", "Prof. Mutti Ur Rehman", "Conference hall", "Calculus II (Spring 25/26)"),
      event("lecture", "COMS210 - Computer Programming II - Lecture", "Monday, 6 April, 11:00 AM » 1:00 PM", "Course event", "Prof. Sukhrob Yangibaev", "Conference hall", "Computer Programming II (Spring 25/26)"),
      event("lecture", "Ma'rifat darslari (Spring 25/26)", "Monday, 6 April, 1:00 PM » 1:30 PM", "Course event", "Mrs.Atadjanova Y. and Mr.Azadov J.", "Conference hall", "Ma'rifat Darslari (Spring 25/26)")
    ]
  },
  {
    label: "Tuesday, 7 April 2026",
    short: "Tuesday",
    events: [
      event("lecture", "PHYS101 - Physics I - Lecture", "Tuesday, 7 April, 9:00 AM » 11:00 AM", "Course event", "Prof. Cosimo Buffone", "Conference Hall", "Physics I (Spring 25/26)"),
      event("lecture", "MATH201 - Linear Algebra - Lecture", "Tuesday, 7 April, 11:00 AM » 1:00 PM", "Course event", "", "Conference hall", "Linear Algebra (Spring 25/26)"),
      event("group", "MATH211 - Calculus II - Tutorial", "Tuesday, 7 April, 2:00 PM » 4:00 PM", "Group event", "Prof. Mutti Ur Rehman", "8 - Tutorial 9", "Calculus II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
    ]
  },
  {
    label: "Wednesday, 8 April 2026",
    short: "Wednesday",
    events: [
      event("group", "HASS111 - Academic and Communication Skills II - Tutorial", "Wednesday, 8 April, 9:00 AM » 11:00 AM", "Group event", "Prof. Risolat Iskandarova", "18 - Tutorial 5", "Academic & Communication Skills II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
      event("group", "PHY101 - Physics I - Tutorial", "Wednesday, 8 April, 11:00 AM » 1:00 PM", "Group event", "Prof. Jemshit Yovvyev", "10 - Tutorial - 9", "Physics I (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
      event("group", "COMS210 - Computer Programming II - Lab", "Wednesday, 8 April, 2:00 PM » 4:00 PM", "Group event", "Prof. Sukhrob Yangibaev", "10 - Computer Lab 1", "Computer Programming II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
    ]
  },
  {
    label: "Thursday, 9 April 2026",
    short: "Thursday",
    events: [
      event("group", "HASS111 - Academic and Communication Skills II - Tutorial", "Thursday, 9 April, 9:00 AM » 11:00 AM", "Group event", "Prof. Risolat Iskandarova", "18 - Tutorial 5", "Academic & Communication Skills II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
      event("group", "PHY101 - Physics I - Lab", "Thursday, 9 April, 11:00 AM » 1:00 PM", "Group event", "Prof. Cosimo Buffone", "9 - Physics lab", "Physics I (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
    ]
  },
  {
    label: "Friday, 10 April 2026",
    short: "Friday",
    events: [
      event("group", "COMS210 - Computer Programming II - Lab", "Friday, 10 April, 9:00 AM » 11:00 AM", "Group event", "Prof. Sukhrob Yangibaev", "10 - Computer Lab 1", "Computer Programming II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
      event("group", "MATH201 - Linear Algebra - Tutorial", "Friday, 10 April, 11:00 AM » 1:00 PM", "Group event", "", "19 - Tutorial 4", "Linear Algebra (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
      {
        type: "assignment",
        title: "Home Assignment-02 is due",
        time: "Friday, 10 April, 5:00 PM",
        category: "Course event",
        details: "PHYS101: Physics I | Homework Assignment # 2<br>Due date: Apr 10, 2025, 17:00<br>Submission room: Professor’s Room #7<br>Instructions:<ul><li>You may solve the problems using any method explained during lectures or tutorial classes.</li><li>Put your name and surname on each page.</li></ul>",
        course: "Physics I (Spring 25/26)"
      }
    ]
  }
];

function event(type, title, time, category, teacher, location, course, cohort = "") {
  return { type, title, time, category, teacher, location, course, cohort };
}

function subject(name, accent, topics) {
  return {
    name,
    accent,
    currentGrade: 3.2,
    weeks: Array.from({ length: 16 }, (_, index) => ({
      week: index + 1,
      topic: topics[index % topics.length],
      readiness: 18 + (index % 4) * 9,
      score: 0,
      done: false
    }))
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaults);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

function metrics() {
  const habitDone = state.habits.filter(item => item.done).length;
  const routineDone = state.routine.filter(item => item.done).length;
  const habitRate = Math.round(((habitDone + routineDone) / (state.habits.length + state.routine.length)) * 100);
  const readinessValues = state.subjects.flatMap(subjectItem => subjectItem.weeks.map(week => week.readiness));
  const readiness = Math.round(readinessValues.reduce((sum, item) => sum + item, 0) / readinessValues.length);
  const gpa = state.subjects.reduce((sum, item) => sum + item.currentGrade, 0) / state.subjects.length;
  const grant = Math.min(100, Math.round((gpa / 4 * 52) + (habitRate * 0.24) + (readiness * 0.24)));
  const label = grant >= 86 ? "100% Grant Safe" : grant >= 70 ? "70% Grant Safe" : grant >= 55 ? "50% Grant Watch" : "At Risk";
  return { habitRate, readiness, gpa: gpa.toFixed(2), grant, label };
}

function addXp(amount) {
  state.xp += Math.round(amount * state.multiplier);
  state.streak += 1;
  state.multiplier = state.streak >= 14 ? 2 : state.streak >= 7 ? 1.5 : state.streak >= 3 ? 1.2 : 1;
}

function setLoggedIn(value) {
  state.loggedIn = value;
  saveState();
  qs("#auth-screen").classList.toggle("hidden", value);
  qs("#app").classList.toggle("hidden", !value);
  if (value) render();
}

function render() {
  const m = metrics();
  const level = Math.floor(state.xp / 500) + 1;
  qs("#student-name").textContent = state.studentName || state.username;
  qs("#xp-value").textContent = state.xp;
  qs("#level-value").textContent = level;
  qs("#streak-value").textContent = state.streak;
  qs("#multiplier-value").textContent = state.multiplier.toFixed(1);
  qs("#gpa-value").textContent = m.gpa;
  qs("#grant-score").textContent = `${m.grant}%`;
  qs("#habit-rate").textContent = `${m.habitRate}%`;
  qs("#readiness-score").textContent = `${m.readiness}%`;
  qs("#grant-label").textContent = `${m.label} based on GPA, habits, and quest readiness.`;
  renderChart(m.grant);
  renderBadges();
  renderSubjects();
  renderTasks();
  renderLeaderboard();
  renderCalendar();
  saveState();
}

function renderChart(value) {
  const ctx = qs("#grant-chart");
  if (grantChart) {
    grantChart.data.datasets[0].data = [value, 100 - value];
    grantChart.update();
    return;
  }
  grantChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Grant Safety", "Gap"],
      datasets: [{ data: [value, 100 - value], backgroundColor: ["#22d3ee", "#27272a"], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: { legend: { labels: { color: "#cbd5e1" } } }
    }
  });
}

function renderBadges() {
  const box = qs("#badges-list");
  if (!state.badges.length) {
    box.innerHTML = `<div class="badge"><strong>No badges yet</strong><span>Clear a weekly quest to unlock your first achievement.</span></div>`;
    return;
  }
  box.innerHTML = state.badges.map(badge => `<div class="badge"><strong>${badge}</strong><span>Unlocked through quest performance.</span></div>`).join("");
}

function renderSubjects() {
  const cards = state.subjects.map((item, subjectIndex) => {
    const avg = Math.round(item.weeks.reduce((sum, week) => sum + week.readiness, 0) / item.weeks.length);
    const weeks = item.weeks.map((week, weekIndex) => (
      `<button class="week-btn ${week.done ? "done" : ""}" data-subject="${subjectIndex}" data-week="${weekIndex}" title="Week ${week.week}: ${week.topic}">${week.week}</button>`
    )).join("");
    return `<article class="subject-card">
      <div class="subject-top"><strong>${item.name}</strong><span style="color:${item.accent}">${avg}% ready</span></div>
      <div class="week-grid">${weeks}</div>
    </article>`;
  }).join("");
  qs("#quest-subjects").innerHTML = cards;
  qs("#subject-detail-list").innerHTML = state.subjects.map(item => {
    const avg = Math.round(item.weeks.reduce((sum, week) => sum + week.readiness, 0) / item.weeks.length);
    const completed = item.weeks.filter(week => week.done).length;
    return `<div class="subject-detail">
      <strong>${item.name}</strong>
      <p class="muted">${completed} / 16 weeks cleared · Current grade ${item.currentGrade.toFixed(2)}</p>
      <div class="progress-bar" style="--value:${avg}%"><span></span></div>
    </div>`;
  }).join("");
}

function renderTasks() {
  qs("#habit-list").innerHTML = state.habits.map(item => taskTemplate(item, "habit")).join("");
  qs("#routine-list").innerHTML = state.routine.map(item => taskTemplate(item, "routine")).join("");
}

function taskTemplate(item, type) {
  const subtitle = type === "routine" ? item.slot : `+${item.xp} XP`;
  return `<div class="task-item ${item.done ? "complete" : ""}">
    <div><strong>${item.title}</strong><p class="muted">${subtitle}</p></div>
    <button data-task-type="${type}" data-task-id="${item.id}">${item.done ? "Completed" : "Complete"}</button>
  </div>`;
}

function renderLeaderboard() {
  const rows = [[state.studentName || state.username, state.xp], ...state.leaders]
    .sort((a, b) => b[1] - a[1])
    .map((leader, index) => `<div class="leader-row"><b>#${index + 1}</b><span>${leader[0]}</span><span>${leader[1]} XP</span></div>`)
    .join("");
  qs("#leaderboard-list").innerHTML = rows;
  qs("#leaderboard-page").innerHTML = rows;
}

function calendarCourses() {
  return [...new Set(calendarDays.flatMap(day => day.events.map(item => item.course)).filter(Boolean))];
}

function renderCourseFilter() {
  const filter = qs("#course-filter");
  if (!filter || filter.dataset.ready) return;
  filter.innerHTML = `<option value="all">All courses</option>${calendarCourses().map(course => `<option value="${course}">${course}</option>`).join("")}`;
  filter.dataset.ready = "true";
}

function renderCalendar() {
  renderCourseFilter();
  const day = calendarDays[activeCalendarIndex];
  const filterValue = qs("#course-filter")?.value || "all";
  const events = filterValue === "all" ? day.events : day.events.filter(item => item.course === filterValue);
  qs("#calendar-date-title").textContent = day.label;
  qs("#prev-day").textContent = activeCalendarIndex > 0 ? `◄  ${calendarDays[activeCalendarIndex - 1].short}` : "";
  qs("#next-day").textContent = activeCalendarIndex < calendarDays.length - 1 ? `${calendarDays[activeCalendarIndex + 1].short}  ►` : "";
  qs("#prev-day").disabled = activeCalendarIndex === 0;
  qs("#next-day").disabled = activeCalendarIndex === calendarDays.length - 1;
  qs("#calendar-events").innerHTML = events.length ? events.map(calendarEventTemplate).join("") : `<div class="calendar-empty">No classes or course events for this day.</div>`;
}

function calendarEventTemplate(item) {
  const headerClass = item.type === "group" ? "group" : item.type === "assignment" ? "assignment" : "";
  const icon = item.type === "lecture" ? "🎓" : item.type === "group" ? "👥" : "⇧";
  const teacherRow = item.teacher ? row("☰", item.teacher) : "";
  const locationRow = item.location ? row("●", item.location) : "";
  const cohortRow = item.cohort ? row("👥", item.cohort) : "";
  const details = item.details ? row("☰", `<span class="event-description">${item.details}</span>`) : "";
  return `<article class="calendar-event">
    <header class="calendar-event-header ${headerClass}">
      <span class="event-icon">${icon}</span>
      <h3>${item.title}</h3>
    </header>
    <div class="calendar-event-body">
      ${row("◷", item.time)}
      ${row("▣", item.category)}
      ${details || teacherRow}
      ${locationRow}
      ${row("🎓", `<a href="#subjects" data-view="subjects">${item.course}</a>`)}
      ${cohortRow}
    </div>
  </article>`;
}

function row(icon, content) {
  return `<div class="event-row"><span class="row-icon">${icon}</span><span>${content}</span></div>`;
}

function openQuest(subjectIndex, weekIndex) {
  activeQuest = { subjectIndex, weekIndex };
  const subjectItem = state.subjects[subjectIndex];
  const week = subjectItem.weeks[weekIndex];
  qs("#quest-title").textContent = `${subjectItem.name} · Week ${week.week}`;
  qs("#quest-topic").textContent = `${week.topic} · best score ${week.score}%`;
  const questions = [
    [`What is the best way to master ${week.topic}?`, ["Active recall and practice", "Only rereading notes", "Skipping exercises"]],
    ["What improves grant safety fastest?", ["Consistent daily habits", "Ignoring weak topics", "Waiting until finals"]],
    ["A strong weekly quest result means:", ["Readiness improved", "Progress was reset", "XP is lost"]]
  ];
  qs("#quiz-box").innerHTML = questions.map((question, index) => `
    <div class="question">
      <strong>${index + 1}. ${question[0]}</strong>
      ${question[1].map((choice, choiceIndex) => `
        <label><input type="radio" name="q${index}" value="${choiceIndex}" ${choiceIndex === 0 ? "checked" : ""}> ${choice}</label>
      `).join("")}
    </div>
  `).join("");
  qs("#quest-modal").showModal();
}

function submitQuest() {
  if (!activeQuest) return;
  let score = 0;
  for (let i = 0; i < 3; i += 1) {
    const checked = qs(`input[name="q${i}"]:checked`);
    if (checked && checked.value === "0") score += 1;
  }
  const percent = Math.round(score / 3 * 100);
  const subjectItem = state.subjects[activeQuest.subjectIndex];
  const week = subjectItem.weeks[activeQuest.weekIndex];
  week.score = Math.max(week.score, percent);
  week.readiness = Math.max(week.readiness, percent);
  if (percent >= 67) {
    const firstClear = !week.done;
    week.done = true;
    if (firstClear) addXp(120);
    const badge = subjectItem.name.includes("Programming") ? "Coding Maestro" : `${subjectItem.name} Warrior`;
    if (!state.badges.includes(badge)) state.badges.push(badge);
  }
  qs("#quest-modal").close();
  render();
}

document.addEventListener("click", event => {
  const authTab = event.target.closest("[data-auth-tab]");
  if (authTab) {
    qsa("[data-auth-tab]").forEach(btn => btn.classList.toggle("active", btn === authTab));
    qs("#login-form").classList.toggle("hidden", authTab.dataset.authTab !== "login");
    qs("#register-form").classList.toggle("hidden", authTab.dataset.authTab !== "register");
  }

  const nav = event.target.closest("[data-view]");
  if (nav) {
    qsa(".nav-link").forEach(link => link.classList.toggle("active", link === nav));
    qsa(".view").forEach(view => view.classList.toggle("active", view.id === nav.dataset.view));
  }

  const task = event.target.closest("[data-task-type]");
  if (task) {
    const list = task.dataset.taskType === "habit" ? state.habits : state.routine;
    const item = list.find(entry => entry.id === Number(task.dataset.taskId));
    if (item && !item.done) {
      item.done = true;
      addXp(item.xp);
      render();
    }
  }

  const week = event.target.closest("[data-subject]");
  if (week) openQuest(Number(week.dataset.subject), Number(week.dataset.week));
});

qs("#prev-day").addEventListener("click", () => {
  if (activeCalendarIndex > 0) {
    activeCalendarIndex -= 1;
    renderCalendar();
  }
});

qs("#next-day").addEventListener("click", () => {
  if (activeCalendarIndex < calendarDays.length - 1) {
    activeCalendarIndex += 1;
    renderCalendar();
  }
});

qs("#course-filter").addEventListener("change", renderCalendar);

qs("#new-event-btn").addEventListener("click", () => {
  const customTitle = prompt("Event title");
  if (!customTitle) return;
  const customTime = prompt("Time", `${calendarDays[activeCalendarIndex].short}, 4:00 PM » 5:00 PM`) || `${calendarDays[activeCalendarIndex].short}, 4:00 PM » 5:00 PM`;
  calendarDays[activeCalendarIndex].events.push(event("group", customTitle, customTime, "Group event", "Student planned session", "Study room", "Personal Study Plan"));
  qs("#course-filter").dataset.ready = "";
  renderCalendar();
});

qs("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  state.username = qs("#login-username").value.trim() || "zafar";
  state.studentName = state.username;
  setLoggedIn(true);
});

qs("#register-form").addEventListener("submit", event => {
  event.preventDefault();
  state.studentName = qs("#register-name").value.trim() || "Student";
  state.username = qs("#register-username").value.trim() || "student";
  setLoggedIn(true);
});

qs("#logout-btn").addEventListener("click", () => setLoggedIn(false));
qs("#seed-btn").addEventListener("click", () => {
  const loggedIn = state.loggedIn;
  const studentName = state.studentName;
  const username = state.username;
  state = structuredClone(defaults);
  state.loggedIn = loggedIn;
  state.studentName = studentName;
  state.username = username;
  render();
});
qs("#submit-quiz").addEventListener("click", submitQuest);

setLoggedIn(state.loggedIn);
