from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Song


class HelloWorldAPITest(APITestCase):
    def test_hello_world_returns_message(self):
        url = reverse("hello-world")
        response = self.client.get(url)

        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}


class SongAPITest(APITestCase):
    def setUp(self):
        Song.objects.create(
            song_id="song-1",
            song_url="https://example.com/song-1",
            song_title_en="Test Song",
            singers=["Singer A"],
            music_directors=["Director A"],
            actors=["Actor A"],
            lyricist=["Lyricist A"],
            album="Test Album",
            release_year=2022,
            categories=["Pop"],
            audio_url="https://example.com/audio.mp3",
            video_url="https://example.com/video.mp4",
            lyrics_text_en="Hello world",
            lyrics_text_dn="नमस्ते दुनिया",
        )
        Song.objects.create(
            song_id="song-2",
            song_url="https://example.com/song-2",
            song_title_en="Another Song",
            singers=["Singer B"],
            music_directors=["Director B"],
            actors=["Actor B"],
            lyricist=["Lyricist B"],
            album="Other Album",
            release_year=2021,
            categories=["Rock"],
            audio_url="https://example.com/audio2.mp3",
            video_url="https://example.com/video2.mp4",
            lyrics_text_en="Hello again",
            lyrics_text_dn="फिर नमस्ते",
        )

    def test_list_songs_returns_json(self):
        url = reverse("song-list")
        response = self.client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert {item["song_id"] for item in data["results"]} == {"song-1", "song-2"}

    def test_filter_songs_by_album(self):
        url = f"{reverse('song-list')}?album=Test"
        response = self.client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["results"][0]["album"] == "Test Album"

    def test_search_songs_free_text(self):
        url = reverse("song-search") + "?q=another"
        response = self.client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["results"][0]["song_id"] == "song-2"

    def test_search_songs_filter_singers(self):
        url = reverse("song-search") + "?singers=Singer A"
        response = self.client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["results"][0]["singers"] == ["Singer A"]

    def test_search_songs_filter_multiple_attributes(self):
        url = reverse("song-search") + "?actors=Actor B&lyricist=Lyricist B"
        response = self.client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["results"][0]["song_id"] == "song-2"
