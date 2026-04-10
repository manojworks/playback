from django.contrib.postgres.fields import ArrayField
from django.db import models


class Song(models.Model):
    song_id = models.CharField(max_length=100, primary_key=True)
    song_url = models.CharField(max_length=500, blank=True)
    song_title_en = models.CharField(max_length=500, blank=True)
    song_title_dn = models.CharField(max_length=500, blank=True)
    singers = ArrayField(models.TextField(), blank=True, default=list)
    music_directors = ArrayField(models.TextField(), blank=True, default=list)
    actors = ArrayField(models.TextField(), blank=True, default=list)
    lyricist = ArrayField(models.TextField(), blank=True, default=list)
    album = models.CharField(max_length=500, blank=True, db_index=True)
    release_year = models.SmallIntegerField(null=True, blank=True, db_index=True)
    categories = ArrayField(models.TextField(), blank=True, default=list)
    audio_url = models.CharField(max_length=500, blank=True)
    video_url = models.CharField(max_length=500, blank=True)
    lyrics_text_file = models.CharField(max_length=500, blank=True)
    lyrics_image_file = models.CharField(max_length=500, blank=True)
    lyrics_text_en = models.TextField(blank=True)
    lyrics_text_dn = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "songs"
        ordering = ["-created_at"]
        managed = False

    def __str__(self):
        return self.song_id
