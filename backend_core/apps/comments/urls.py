from django.urls import path
from .views import CommentListView, CreateCommentView, MyCommentsView

urlpatterns = [
    path("", CommentListView.as_view()),
    path("create/", CreateCommentView.as_view()),
    path("my/", MyCommentsView.as_view()),
]
