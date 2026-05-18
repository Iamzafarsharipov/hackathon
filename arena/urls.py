from django.contrib.auth.views import LogoutView
from django.urls import path

from . import views


urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("register/", views.register_view, name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("habits/toggle/<int:habit_id>/", views.toggle_habit, name="toggle_habit"),
    path("routine/toggle/<int:routine_id>/", views.toggle_routine, name="toggle_routine"),
    path("quest/<int:progress_id>/", views.quest_room, name="quest_room"),
    path("quest/<int:progress_id>/submit/", views.submit_quest, name="submit_quest"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
]
