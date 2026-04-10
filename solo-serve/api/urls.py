from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HelloWorldAPIView, SongSearchAPIView, SongViewSet

router = DefaultRouter()
router.register(r"songs", SongViewSet, basename="song")

urlpatterns = [
    path("search/", SongSearchAPIView.as_view(), name="song-search"),
    path("", include(router.urls)),
    path("hello/", HelloWorldAPIView.as_view(), name="hello-world"),
]
