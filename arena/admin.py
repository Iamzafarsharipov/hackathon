from django.contrib import admin

from .models import Badge, DailyRoutine, Habit, RoutineCompletion, HabitCompletion, StudentProfile, Subject, WeeklyProgress


admin.site.register(StudentProfile)
admin.site.register(Subject)
admin.site.register(WeeklyProgress)
admin.site.register(Habit)
admin.site.register(HabitCompletion)
admin.site.register(DailyRoutine)
admin.site.register(RoutineCompletion)
admin.site.register(Badge)
