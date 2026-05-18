# EduQuest Arena

A gamified Django study tracker for university hackathons: GPA prediction, grant safety analytics, daily habit streaks, weekly study quests, XP, badges, and a campus leaderboard.

## Live GitHub Pages Version

GitHub Pages cannot run a Django server, so this repository also includes a complete static frontend MVP:

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`

Open the live site at `https://iamzafarsharipov.github.io/hackathon/`.

## Quick Start

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000/`, register a student account, and start completing quests.

## Features

- Django auth with dark mode login, registration, and logout
- Protected dashboard with personalized XP, streak, GPA, and grant prediction
- Database-backed subjects, weekly progress, habits, routines, profile, and badges
- Weekly Quest Rooms with mock quizzes and XP rewards
- Habit and routine completion APIs with streak and multiplier logic
- Tailwind CSS dashboard and Chart.js visualizations
