const STORAGE_KEY = "eduquest-arena-state-v3";
const YEAR = 2026;
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const uzDayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

const defaults = {
  loggedIn: false,
  studentName: "Zafar",
  username: "zafar",
  xp: 0,
  streak: 0,
  multiplier: 1,
  badges: [],
  userDirectory: [],
  smartGoals: [],
  customEvents: {},
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
    subject("Computer Programming 2", "#34d399", ["OOP Patterns", "Data Structures", "Files and APIs", "Testing"]),
    subject("Calculus 2", "#fb923c", ["Integrals", "Series", "Parametric Curves", "Multivariable Intro"]),
    subject("Physics", "#a78bfa", ["Kinematics", "Newton Laws", "Energy", "Electric Fields"])
  ],
  leaders: [
    { name: "Sulaymon Abdullayev", department: "DT", xp: 2840, idNumber: "2531001" },
    { name: "Mohira Abdullayeva", department: "SE", xp: 2715, idNumber: "2511001" },
    { name: "Jasmina Abdullayeva", department: "AI", xp: 2630, idNumber: "2521001" },
    { name: "Madina Abdusamatova", department: "SE", xp: 2490, idNumber: "2511022" },
    { name: "Dadajon Abdusattorov", department: "AI", xp: 2365, idNumber: "2521002" },
    { name: "Azizbek Abubakirov", department: "AI", xp: 2250, idNumber: "2521024" },
    { name: "Muhiddin Ahmedjanov", department: "DT", xp: 2135, idNumber: "2531002" },
    { name: "Mirzabek Aliev", department: "AI", xp: 2040, idNumber: "2521003" }
  ]
};

const weeklySchedule = {
  1: [
    event("lecture", "MATH211 - Calculus II - Lecture", "09:00", "11:00", "Course event", "Prof. Mutti Ur Rehman", "Conference hall", "Calculus II (Spring 25/26)"),
    event("lecture", "COMS210 - Computer Programming II - Lecture", "11:00", "13:00", "Course event", "Prof. Sukhrob Yangibaev", "Conference hall", "Computer Programming II (Spring 25/26)"),
    event("lecture", "Ma'rifat darslari (Spring 25/26)", "13:00", "13:30", "Course event", "Mrs. Atadjanova Y. and Mr. Azadov J.", "Conference hall", "Ma'rifat Darslari (Spring 25/26)")
  ],
  2: [
    event("lecture", "PHYS101 - Physics I - Lecture", "09:00", "11:00", "Course event", "Prof. Cosimo Buffone", "Conference Hall", "Physics I (Spring 25/26)"),
    event("lecture", "MATH201 - Linear Algebra - Lecture", "11:00", "13:00", "Course event", "Academic staff", "Conference hall", "Linear Algebra (Spring 25/26)"),
    event("group", "MATH211 - Calculus II - Tutorial", "14:00", "16:00", "Group event", "Prof. Mutti Ur Rehman", "8 - Tutorial 9", "Calculus II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
  ],
  3: [
    event("group", "HASS111 - Academic and Communication Skills II - Tutorial", "09:00", "11:00", "Group event", "Prof. Risolat Iskandarova", "18 - Tutorial 5", "Academic and Communication Skills II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
    event("group", "PHY101 - Physics I - Tutorial", "11:00", "13:00", "Group event", "Prof. Jemshit Yovvyev", "10 - Tutorial 9", "Physics I (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
    event("group", "COMS210 - Computer Programming II - Lab", "14:00", "16:00", "Group event", "Prof. Sukhrob Yangibaev", "10 - Computer Lab 1", "Computer Programming II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
  ],
  4: [
    event("group", "HASS111 - Academic and Communication Skills II - Tutorial", "09:00", "11:00", "Group event", "Prof. Risolat Iskandarova", "18 - Tutorial 5", "Academic and Communication Skills II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
    event("group", "PHY101 - Physics I - Lab", "11:00", "13:00", "Group event", "Prof. Cosimo Buffone", "9 - Physics lab", "Physics I (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
  ],
  5: [
    event("group", "COMS210 - Computer Programming II - Lab", "09:00", "11:00", "Group event", "Prof. Sukhrob Yangibaev", "10 - Computer Lab 1", "Computer Programming II (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort"),
    event("group", "MATH201 - Linear Algebra - Tutorial", "11:00", "13:00", "Group event", "Academic staff", "19 - Tutorial 4", "Linear Algebra (Spring 25/26)", "FSE02-Software Engineering Freshman Spring 25/26 cohort")
  ]
};

let state = normalizeState(loadState());
let grantChart;
let activeQuest = null;
let today = new Date();
let activeMonth = today.getFullYear() === YEAR ? today.getMonth() : 3;
let selectedDate = new Date(YEAR, activeMonth, Math.min(today.getDate(), daysInMonth(YEAR, activeMonth)));
let pomodoroSeconds = 25 * 60;
let pomodoroInterval = null;
let remindersEnabled = false;
let lastReminderKey = "";

function event(type, title, start, end, category, teacher, location, course, cohort = "") {
  return { type, title, start, end, category, teacher, location, course, cohort };
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

function normalizeState(value) {
  return {
    ...structuredClone(defaults),
    ...value,
    habits: value.habits || structuredClone(defaults.habits),
    routine: value.routine || structuredClone(defaults.routine),
    subjects: value.subjects || structuredClone(defaults.subjects),
    leaders: normalizeLeaders(value.leaders || structuredClone(defaults.leaders)),
    userDirectory: value.userDirectory || [],
    badges: value.badges || [],
    smartGoals: value.smartGoals || [],
    customEvents: value.customEvents || {}
  };
}

function normalizeLeaders(leaders) {
  return leaders.map((leader, index) => Array.isArray(leader)
    ? { name: leader[0], department: "EduQuest", xp: leader[1], idNumber: `LEG-${index + 1}` }
    : leader);
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

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateTitle(date) {
  return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatEventTime(date, item) {
  return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}, ${to12Hour(item.start)} to ${to12Hour(item.end)}`;
}

function to12Hour(value) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText} ${suffix}`;
}

function eventsForDate(date) {
  const weekday = date.getDay();
  const recurring = weekday >= 1 && weekday <= 5 ? structuredClone(weeklySchedule[weekday] || []) : [];
  const custom = state.customEvents[dateKey(date)] || [];
  const assignment = date.getMonth() === 3 && date.getDate() === 10
    ? [event("assignment", "Home Assignment-02 is due", "17:00", "17:00", "Course event", "PHYS101: Physics I Homework Assignment #2", "Professor's Room #7", "Physics I (Spring 25/26)")]
    : [];
  return [...recurring, ...assignment, ...custom];
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
  renderSmartGoals();
  updateClock();
  updatePomodoro();
  updateNextClass();
  saveState();
}

function renderChart(value) {
  const ctx = qs("#grant-chart");
  if (!ctx || !window.Chart) return;
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
  box.innerHTML = state.badges.map(badge => `<div class="badge"><strong>${escapeHTML(badge)}</strong><span>Unlocked through quest performance.</span></div>`).join("");
}

function renderSubjects() {
  const cards = state.subjects.map((item, subjectIndex) => {
    const avg = Math.round(item.weeks.reduce((sum, week) => sum + week.readiness, 0) / item.weeks.length);
    const weeks = item.weeks.map((week, weekIndex) => (
      `<button class="week-btn ${week.done ? "done" : ""}" data-subject="${subjectIndex}" data-week="${weekIndex}" title="Week ${week.week}: ${escapeHTML(week.topic)}">${week.week}</button>`
    )).join("");
    return `<article class="subject-card">
      <div class="subject-top"><strong>${escapeHTML(item.name)}</strong><span style="color:${item.accent}">${avg}% ready</span></div>
      <div class="week-grid">${weeks}</div>
    </article>`;
  }).join("");
  qs("#quest-subjects").innerHTML = cards;
  qs("#subject-detail-list").innerHTML = state.subjects.map(item => {
    const avg = Math.round(item.weeks.reduce((sum, week) => sum + week.readiness, 0) / item.weeks.length);
    const completed = item.weeks.filter(week => week.done).length;
    return `<div class="subject-detail">
      <strong>${escapeHTML(item.name)}</strong>
      <p class="muted">${completed} / 16 weeks cleared - Current grade ${item.currentGrade.toFixed(2)}</p>
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
    <div><strong>${escapeHTML(item.title)}</strong><p class="muted">${escapeHTML(subtitle)}</p></div>
    <button data-task-type="${type}" data-task-id="${item.id}">${item.done ? "Completed" : "Complete"}</button>
  </div>`;
}

function renderLeaderboard() {
  syncCurrentUser();
  const rows = [...state.leaders, ...state.userDirectory]
    .sort((a, b) => b.xp - a.xp)
    .map((leader, index) => `<div class="leader-row">
      <b>#${index + 1}</b>
      <span><strong>${escapeHTML(leader.name)}</strong><small>${escapeHTML(leader.idNumber || "Arena User")} - ${escapeHTML(leader.department || "EduQuest")}</small></span>
      <span>${leader.xp} XP</span>
    </div>`)
    .join("");
  qs("#leaderboard-list").innerHTML = rows;
  qs("#leaderboard-page").innerHTML = rows;
}

function syncCurrentUser() {
  if (!state.loggedIn) return;
  const name = state.studentName || state.username || "Student";
  const username = state.username || name;
  const existing = state.userDirectory.find(user => user.username === username);
  if (existing) {
    existing.name = name;
    existing.xp = state.xp;
  } else {
    state.userDirectory.push({
      username,
      name,
      department: "SE",
      idNumber: `U-${String(state.userDirectory.length + 1).padStart(4, "0")}`,
      xp: state.xp
    });
  }
}

function calendarCourses() {
  const sample = [];
  for (let day = 1; day <= 5; day += 1) sample.push(...(weeklySchedule[day] || []));
  Object.values(state.customEvents).forEach(list => sample.push(...list));
  return [...new Set(sample.map(item => item.course).filter(Boolean))];
}

function renderCourseFilter() {
  const filter = qs("#course-filter");
  const current = filter.value || "all";
  filter.innerHTML = `<option value="all">All courses</option>${calendarCourses().map(course => `<option value="${escapeHTML(course)}">${escapeHTML(course)}</option>`).join("")}`;
  filter.value = calendarCourses().includes(current) ? current : "all";
}

function renderCalendar() {
  renderCourseFilter();
  qs("#month-select").value = String(activeMonth);
  qs("#calendar-date-title").textContent = `${monthNames[activeMonth]} ${YEAR}`;
  qs("#selected-date-title").textContent = formatDateTitle(selectedDate);
  renderMonthGrid();
  renderSelectedEvents();
}

function renderMonthGrid() {
  const firstDay = new Date(YEAR, activeMonth, 1).getDay();
  const totalDays = daysInMonth(YEAR, activeMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(`<button class="calendar-day empty" tabindex="-1"></button>`);
  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(YEAR, activeMonth, day);
    const events = eventsForDate(date);
    const filtered = filteredEvents(events);
    const tags = filtered.slice(0, 2).map(item => `<span class="day-tag">${escapeHTML(item.title.split(" - ")[0])}</span>`).join("");
    const isSelected = dateKey(date) === dateKey(selectedDate);
    const isToday = dateKey(date) === dateKey(new Date());
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    cells.push(`<button class="calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""}" data-calendar-day="${day}">
      <span class="day-number">${day}${filtered.length ? `<span class="day-count">${filtered.length}</span>` : ""}</span>
      <span class="day-tags">${tags}</span>
    </button>`);
  }
  qs("#month-grid").innerHTML = cells.join("");
}

function filteredEvents(events) {
  const filterValue = qs("#course-filter")?.value || "all";
  return filterValue === "all" ? events : events.filter(item => item.course === filterValue);
}

function renderSelectedEvents() {
  const events = filteredEvents(eventsForDate(selectedDate));
  qs("#calendar-events").innerHTML = events.length ? events.map(item => calendarEventTemplate(item, selectedDate)).join("") : `<div class="calendar-empty">No classes or course events for this date.</div>`;
}

function calendarEventTemplate(item, date) {
  const headerClass = item.type === "group" ? "group" : item.type === "assignment" ? "assignment" : "";
  return `<article class="calendar-event">
    <header class="calendar-event-header ${headerClass}">
      <h3>${escapeHTML(item.title)}</h3>
    </header>
    <div class="calendar-event-body">
      <table class="event-table">
        <tbody>
          ${row("Time", formatEventTime(date, item))}
          ${row("Event type", item.category)}
          ${row("Professor", item.teacher)}
          ${row("Room", item.location)}
          ${row("Course", `<a href="#subjects" data-view="subjects">${escapeHTML(item.course)}</a>`)}
          ${item.cohort ? row("Cohort", item.cohort) : ""}
        </tbody>
      </table>
    </div>
  </article>`;
}

function row(label, content) {
  return `<tr class="event-row"><th>${label}</th><td>${content}</td></tr>`;
}

function updateClock() {
  const now = new Date();
  qs("#live-time").textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  qs("#live-date").textContent = `${uzDayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;
  updateDeadline(now);
}

function updateDeadline(now) {
  const deadline = new Date(2026, 4, 23, 23, 59, 0);
  const total = 7 * 24 * 60 * 60 * 1000;
  const diff = Math.max(0, deadline - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  qs("#deadline-left").textContent = `${hours} hours ${minutes} minutes left`;
  const used = Math.min(100, Math.max(8, 100 - Math.round(diff / total * 100)));
  qs("#deadline-progress").style.width = `${used}%`;
}

function nextUpcomingClass(now = new Date()) {
  for (let offset = 0; offset < 40; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (date.getFullYear() !== YEAR) continue;
    const events = eventsForDate(date);
    for (const item of events) {
      const [hour, minute] = item.start.split(":").map(Number);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
      if (start > now) return { item, start, date };
    }
  }
  return null;
}

function updateNextClass() {
  const next = nextUpcomingClass();
  if (!next) {
    qs("#next-class-text").textContent = "No upcoming class found in this schedule.";
    return;
  }
  const minutes = Math.round((next.start - new Date()) / 60000);
  qs("#next-class-text").textContent = `${next.item.title} starts in ${minutes} minutes. Room: ${next.item.location}. Professor: ${next.item.teacher}.`;
  if (remindersEnabled && minutes <= 30 && minutes >= 0) {
    const key = `${dateKey(next.date)}-${next.item.start}-${next.item.title}`;
    if (key !== lastReminderKey) {
      lastReminderKey = key;
      showReminder(`Class reminder: ${next.item.title}`, `Starts at ${to12Hour(next.item.start)} in ${next.item.location}.`);
    }
  }
}

function showReminder(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    alert(`${title}\n${body}`);
  }
}

function updatePomodoro() {
  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  qs("#pomodoro-time").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startPomodoro() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    qs("#pomodoro-start").textContent = "Start";
    return;
  }
  qs("#pomodoro-start").textContent = "Pause";
  pomodoroInterval = setInterval(() => {
    pomodoroSeconds -= 1;
    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      pomodoroSeconds = 5 * 60;
      qs("#pomodoro-start").textContent = "Start";
      showReminder("Pomodoro complete", "Great focus session. Take a 5 minute break.");
    }
    updatePomodoro();
  }, 1000);
}

function renderSmartGoals() {
  const list = qs("#smart-goals-list");
  const mini = qs("#smart-goals-mini");
  if (!state.smartGoals.length) {
    list.innerHTML = `<div class="smart-goal">No SMART goals saved yet.</div>`;
    mini.innerHTML = `<div class="smart-goal">No SMART goals saved yet.</div>`;
    return;
  }
  const html = state.smartGoals.map(goal => `<div class="smart-goal">
    <strong>${escapeHTML(goal.title || goal.specific)}</strong>
    <span>${escapeHTML(goal.status || "Active")} - ${Number(goal.progress || 0)}%</span>
    <p>${escapeHTML(goal.specific)}</p>
    <small>Measure: ${escapeHTML(goal.measurable)}<br>Deadline: ${escapeHTML(goal.deadline || "Not set")}</small>
  </div>`).join("");
  list.innerHTML = html;
  mini.innerHTML = state.smartGoals.slice(0, 2).map(goal => `<div class="smart-goal"><strong>${escapeHTML(goal.title || goal.specific)}</strong><br>${Number(goal.progress || 0)}% complete</div>`).join("");
}

function openQuest(subjectIndex, weekIndex) {
  activeQuest = { subjectIndex, weekIndex };
  const subjectItem = state.subjects[subjectIndex];
  const week = subjectItem.weeks[weekIndex];
  qs("#quest-title").textContent = `${subjectItem.name} - Week ${week.week}`;
  qs("#quest-topic").textContent = `${week.topic} - best score ${week.score}%`;
  const questions = [
    [`What is the best way to master ${week.topic}?`, ["Active recall and practice", "Only rereading notes", "Skipping exercises"]],
    ["What improves grant safety fastest?", ["Consistent daily habits", "Ignoring weak topics", "Waiting until finals"]],
    ["A strong weekly quest result means:", ["Readiness improved", "Progress was reset", "XP is lost"]]
  ];
  qs("#quiz-box").innerHTML = questions.map((question, index) => `
    <div class="question">
      <strong>${index + 1}. ${escapeHTML(question[0])}</strong>
      ${question[1].map((choice, choiceIndex) => `
        <label><input type="radio" name="q${index}" value="${choiceIndex}" ${choiceIndex === 0 ? "checked" : ""}> ${escapeHTML(choice)}</label>
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
    qsa(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === nav.dataset.view));
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

  const calendarDay = event.target.closest("[data-calendar-day]");
  if (calendarDay) {
    selectedDate = new Date(YEAR, activeMonth, Number(calendarDay.dataset.calendarDay));
    renderCalendar();
  }
});

qs("#month-select").addEventListener("change", event => {
  activeMonth = Number(event.target.value);
  selectedDate = new Date(YEAR, activeMonth, 1);
  renderCalendar();
});

qs("#prev-month").addEventListener("click", () => {
  if (activeMonth > 0) {
    activeMonth -= 1;
    selectedDate = new Date(YEAR, activeMonth, 1);
    renderCalendar();
  }
});

qs("#next-month").addEventListener("click", () => {
  if (activeMonth < 11) {
    activeMonth += 1;
    selectedDate = new Date(YEAR, activeMonth, 1);
    renderCalendar();
  }
});

qs("#course-filter").addEventListener("change", renderCalendar);

qs("#new-event-btn").addEventListener("click", () => {
  const customTitle = prompt("Event title");
  if (!customTitle) return;
  const customStart = prompt("Start time, for example 16:00", "16:00") || "16:00";
  const customEnd = prompt("End time, for example 17:00", "17:00") || "17:00";
  const key = dateKey(selectedDate);
  state.customEvents[key] = state.customEvents[key] || [];
  state.customEvents[key].push(event("group", customTitle, customStart, customEnd, "Group event", "Student planned session", "Study room", "Personal Study Plan"));
  saveState();
  renderCalendar();
});

qs("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  state.username = qs("#login-username").value.trim() || "zafar";
  state.studentName = state.username;
  syncCurrentUser();
  setLoggedIn(true);
});

qs("#register-form").addEventListener("submit", event => {
  event.preventDefault();
  state.studentName = qs("#register-name").value.trim() || "Student";
  state.username = qs("#register-username").value.trim() || "student";
  syncCurrentUser();
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
qs("#pomodoro-start").addEventListener("click", startPomodoro);
qs("#pomodoro-reset").addEventListener("click", () => {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  pomodoroSeconds = 25 * 60;
  qs("#pomodoro-start").textContent = "Start";
  updatePomodoro();
});

qs("#save-smart-goal").addEventListener("click", () => {
  const title = qs("#smart-title").value.trim();
  const specific = qs("#smart-specific").value.trim();
  const measurable = qs("#smart-measurable").value.trim();
  const achievable = qs("#smart-achievable").value.trim();
  const relevant = qs("#smart-relevant").value.trim();
  const timebound = qs("#smart-timebound").value.trim();
  const deadline = qs("#smart-deadline").value;
  const status = qs("#smart-status").value;
  const progress = qs("#smart-progress").value;
  if (!specific || !measurable) return;
  state.smartGoals.unshift({ title, specific, measurable, achievable, relevant, timebound, deadline, status, progress });
  qs("#smart-title").value = "";
  qs("#smart-specific").value = "";
  qs("#smart-measurable").value = "";
  qs("#smart-achievable").value = "";
  qs("#smart-relevant").value = "";
  qs("#smart-timebound").value = "";
  qs("#smart-deadline").value = "";
  qs("#smart-status").value = "Active";
  qs("#smart-progress").value = "0";
  qs("#smart-progress-value").textContent = "0%";
  renderSmartGoals();
  saveState();
});

qs("#smart-progress").addEventListener("input", event => {
  qs("#smart-progress-value").textContent = `${event.target.value}%`;
});

qs("#enable-notifications").addEventListener("click", async () => {
  remindersEnabled = true;
  if ("Notification" in window && Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
  updateNextClass();
});

setInterval(() => {
  updateClock();
  updateNextClass();
}, 30000);

setLoggedIn(state.loggedIn);
updateClock();
updatePomodoro();
