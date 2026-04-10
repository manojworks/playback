from datetime import datetime
from rest_framework import serializers
from .models import Song


class StringListField(serializers.ListField):
    child = serializers.CharField(max_length=200, trim_whitespace=True)
    allow_empty = True


class SongSerializer(serializers.ModelSerializer):
    singers = StringListField(required=False)
    music_directors = StringListField(required=False)
    actors = StringListField(required=False)
    lyricist = StringListField(required=False)
    categories = StringListField(required=False)

    song_url = serializers.URLField(required=False, allow_blank=True, max_length=500)
    audio_url = serializers.URLField(required=False, allow_blank=True, max_length=500)
    video_url = serializers.URLField(required=False, allow_blank=True, max_length=500)

    class Meta:
        model = Song
        fields = [
            "song_id",
            "song_url",
            "song_title_en",
            "song_title_dn",
            "singers",
            "music_directors",
            "actors",
            "lyricist",
            "album",
            "release_year",
            "categories",
            "audio_url",
            "video_url",
            "lyrics_text_file",
            "lyrics_image_file",
            "lyrics_text_en",
            "lyrics_text_dn",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_song_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("song_id must not be empty.")
        return value.strip()

    def validate_release_year(self, value):
        if value is None:
            return value
        year = datetime.now().year
        if value < 1800 or value > year + 1:
            raise serializers.ValidationError(
                f"release_year must be between 1800 and {year + 1}."
            )
        return value

    def validate(self, attrs):
        for list_name in ["singers", "music_directors", "actors", "lyricist", "categories"]:
            if list_name in attrs and attrs[list_name] is None:
                attrs[list_name] = []
        return attrs


class SongSearchSerializer(serializers.ModelSerializer):
    singers = StringListField(required=False)
    music_directors = StringListField(required=False)
    actors = StringListField(required=False)
    lyricist = StringListField(required=False)
    categories = StringListField(required=False)

    class Meta:
        model = Song
        fields = [
            "song_id",
            "song_url",
            "song_title_en",
            "singers",
            "music_directors",
            "actors",
            "lyricist",
            "album",
            "release_year",
            "categories",
            "audio_url",
            "video_url",
            "lyrics_text_en",
        ]
