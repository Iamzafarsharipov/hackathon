from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    xp_multiplier = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    last_activity_date = models.DateField(null=True, blank=True)
    target_exam_readiness = models.PositiveIntegerField(default=78)

    def __str__(self):
        return f"{self.user.username} profile"

    def add_xp(self, amount):
        boosted = int(amount * float(self.xp_multiplier))
        self.xp += boosted
        self.level = max(1, self.xp // 500 + 1)
        self.save(update_fields=["xp", "level"])
        return boosted

    def refresh_streak(self):
        today = timezone.localdate()
        if self.last_activity_date == today:
            return
        if self.last_activity_date == today - timezone.timedelta(days=1):
            self.streak += 1
        else:
            self.streak = 1
        self.best_streak = max(self.best_streak, self.streak)
        self.xp_multiplier = 2.0 if self.streak >= 14 else 1.5 if self.streak >= 7 else 1.2 if self.streak >= 3 else 1.0
        self.last_activity_date = today
        self.save(update_fields=["streak", "best_streak", "xp_multiplier", "last_activity_date"])


class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subjects")
    name = models.CharField(max_length=120)
    accent = models.CharField(max_length=20, default="#38bdf8")
    current_grade = models.DecimalField(max_digits=4, decimal_places=2, default=3.0)
    target_grade = models.DecimalField(max_digits=4, decimal_places=2, default=4.0)

    class Meta:
        unique_together = ("user", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def average_readiness(self):
        progress = self.weekly_progress.all()
        if not progress:
            return 0
        return round(sum(item.readiness for item in progress) / progress.count())


class WeeklyProgress(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="weekly_progress")
    week_number = models.PositiveIntegerField()
    topic = models.CharField(max_length=160)
    readiness = models.PositiveIntegerField(default=0)
    quiz_score = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    xp_rewarded = models.BooleanField(default=False)

    class Meta:
        unique_together = ("subject", "week_number")
        ordering = ["subject", "week_number"]

    def __str__(self):
        return f"{self.subject.name} week {self.week_number}"


class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=120)
    target_per_day = models.PositiveIntegerField(default=1)
    xp_reward = models.PositiveIntegerField(default=20)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class HabitCompletion(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="completions")
    date = models.DateField(default=timezone.localdate)
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ("habit", "date")


class DailyRoutine(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="routines")
    title = models.CharField(max_length=120)
    slot = models.CharField(max_length=60, default="Today")
    xp_reward = models.PositiveIntegerField(default=15)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class RoutineCompletion(models.Model):
    routine = models.ForeignKey(DailyRoutine, on_delete=models.CASCADE, related_name="completions")
    date = models.DateField(default=timezone.localdate)
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ("routine", "date")


class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="badges")
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=240)
    icon = models.CharField(max_length=20, default="star")
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "title")
        ordering = ["-earned_at"]

    def __str__(self):
        return self.title
