from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.db.models import Avg
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .models import Badge, DailyRoutine, Habit, HabitCompletion, RoutineCompletion, StudentProfile, Subject, WeeklyProgress


DEFAULT_SUBJECTS = [
    ("Linear Algebra", "#38bdf8", ["Vectors & Matrices", "Gaussian Elimination", "Eigenvalues", "Vector Spaces"]),
    ("Computer Programming 2", "#22c55e", ["OOP Patterns", "Data Structures", "Files & APIs", "Testing"]),
    ("Calculus 2", "#f97316", ["Integrals", "Series", "Parametric Curves", "Multivariable Intro"]),
    ("Physics", "#a78bfa", ["Kinematics", "Newton Laws", "Energy", "Electric Fields"]),
]
DEFAULT_HABITS = ["90 min deep study", "Review lecture notes", "Solve 10 problems", "Sleep before midnight"]
DEFAULT_ROUTINES = [("Morning", "Plan top 3 quests"), ("Afternoon", "Lab or practice block"), ("Evening", "Recall and flashcards")]


def seed_student(user):
    StudentProfile.objects.get_or_create(user=user)
    for name, accent, topics in DEFAULT_SUBJECTS:
        subject, _ = Subject.objects.get_or_create(user=user, name=name, defaults={"accent": accent, "current_grade": 3.2})
        for index in range(1, 17):
            topic = topics[(index - 1) % len(topics)]
            WeeklyProgress.objects.get_or_create(
                subject=subject,
                week_number=index,
                defaults={"topic": topic, "readiness": 15 + (index % 4) * 8},
            )
    for habit in DEFAULT_HABITS:
        Habit.objects.get_or_create(user=user, name=habit)
    for slot, title in DEFAULT_ROUTINES:
        DailyRoutine.objects.get_or_create(user=user, slot=slot, title=title)


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = authenticate(username=form.cleaned_data["username"], password=form.cleaned_data["password"])
        if user:
            login(request, user)
            seed_student(user)
            return redirect("dashboard")
    return render(request, "registration/login.html", {"form": form})


def register_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    form = UserCreationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        seed_student(user)
        login(request, user)
        messages.success(request, "Welcome to EduQuest Arena. Your campus journey starts now.")
        return redirect("dashboard")
    return render(request, "registration/register.html", {"form": form})


def grant_metrics(user):
    profile = user.profile
    subjects = Subject.objects.filter(user=user).prefetch_related("weekly_progress")
    today = timezone.localdate()
    habits = Habit.objects.filter(user=user, active=True)
    completed_habits = HabitCompletion.objects.filter(habit__in=habits, date=today, completed=True).count()
    habit_rate = completed_habits / max(habits.count(), 1)
    readiness = WeeklyProgress.objects.filter(subject__user=user).aggregate(avg=Avg("readiness"))["avg"] or 0
    grade_points = [float(subject.current_grade) for subject in subjects]
    estimated_gpa = round(sum(grade_points) / max(len(grade_points), 1), 2)
    grant_score = min(100, round((estimated_gpa / 4 * 52) + (habit_rate * 24) + (readiness / 100 * 24)))
    grant_level = "100% Grant Safe" if grant_score >= 86 else "70% Grant Safe" if grant_score >= 70 else "50% Grant Watch" if grant_score >= 55 else "At Risk"
    profile.target_exam_readiness = max(profile.target_exam_readiness, int(readiness))
    profile.save(update_fields=["target_exam_readiness"])
    return {
        "estimated_gpa": estimated_gpa,
        "grant_score": grant_score,
        "grant_level": grant_level,
        "habit_rate": round(habit_rate * 100),
        "readiness": round(readiness),
    }


@login_required
def dashboard(request):
    seed_student(request.user)
    today = timezone.localdate()
    subjects = Subject.objects.filter(user=request.user).prefetch_related("weekly_progress")
    habits = Habit.objects.filter(user=request.user, active=True).prefetch_related("completions")
    routines = DailyRoutine.objects.filter(user=request.user, active=True).prefetch_related("completions")
    completed_habit_ids = set(HabitCompletion.objects.filter(habit__in=habits, date=today, completed=True).values_list("habit_id", flat=True))
    completed_routine_ids = set(RoutineCompletion.objects.filter(routine__in=routines, date=today, completed=True).values_list("routine_id", flat=True))
    context = {
        "profile": request.user.profile,
        "subjects": subjects,
        "habits": habits,
        "routines": routines,
        "completed_habit_ids": completed_habit_ids,
        "completed_routine_ids": completed_routine_ids,
        "badges": Badge.objects.filter(user=request.user)[:6],
        "leaders": User.objects.filter(profile__isnull=False).order_by("-profile__xp")[:5],
        "metrics": grant_metrics(request.user),
    }
    return render(request, "arena/dashboard.html", context)


@login_required
@require_POST
def toggle_habit(request, habit_id):
    habit = get_object_or_404(Habit, id=habit_id, user=request.user)
    completion, created = HabitCompletion.objects.get_or_create(habit=habit, date=timezone.localdate())
    if not created:
        completion.completed = not completion.completed
        completion.save(update_fields=["completed"])
    if completion.completed:
        request.user.profile.refresh_streak()
        gained = request.user.profile.add_xp(habit.xp_reward)
    else:
        gained = 0
    return JsonResponse({"completed": completion.completed, "xp": request.user.profile.xp, "streak": request.user.profile.streak, "gained": gained})


@login_required
@require_POST
def toggle_routine(request, routine_id):
    routine = get_object_or_404(DailyRoutine, id=routine_id, user=request.user)
    completion, created = RoutineCompletion.objects.get_or_create(routine=routine, date=timezone.localdate())
    if not created:
        completion.completed = not completion.completed
        completion.save(update_fields=["completed"])
    if completion.completed:
        request.user.profile.refresh_streak()
        gained = request.user.profile.add_xp(routine.xp_reward)
    else:
        gained = 0
    return JsonResponse({"completed": completion.completed, "xp": request.user.profile.xp, "streak": request.user.profile.streak, "gained": gained})


@login_required
def quest_room(request, progress_id):
    progress = get_object_or_404(WeeklyProgress, id=progress_id, subject__user=request.user)
    questions = [
        {"q": f"What is the core idea of {progress.topic}?", "choices": ["Concept mastery", "Random guessing", "Skipping practice"], "answer": 0},
        {"q": "Best exam-readiness strategy?", "choices": ["Active recall", "Only rereading", "No mock tests"], "answer": 0},
        {"q": "What earns the strongest weekly progress?", "choices": ["Consistent practice", "Last-minute panic", "Ignoring mistakes"], "answer": 0},
    ]
    return render(request, "arena/quest_room.html", {"progress": progress, "questions": questions})


@login_required
@require_POST
def submit_quest(request, progress_id):
    progress = get_object_or_404(WeeklyProgress, id=progress_id, subject__user=request.user)
    score = sum(1 for key, value in request.POST.items() if key.startswith("q") and value == "0")
    percent = round(score / 3 * 100)
    progress.quiz_score = percent
    progress.readiness = max(progress.readiness, percent)
    if percent >= 67:
        progress.completed = True
        if not progress.xp_rewarded:
            request.user.profile.refresh_streak()
            request.user.profile.add_xp(120)
            progress.xp_rewarded = True
            title = f"{progress.subject.name} Warrior" if "Programming" not in progress.subject.name else "Coding Maestro"
            Badge.objects.get_or_create(user=request.user, title=title, defaults={"description": f"Completed week {progress.week_number} quest.", "icon": "trophy"})
        messages.success(request, f"Quest cleared with {percent}%. XP and badge progress updated.")
    else:
        messages.warning(request, f"You scored {percent}%. Train once more to unlock XP.")
    progress.save()
    return redirect("quest_room", progress_id=progress.id)


@login_required
def leaderboard(request):
    return render(request, "arena/leaderboard.html", {"leaders": User.objects.filter(profile__isnull=False).order_by("-profile__xp")[:20]})
