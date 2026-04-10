import django_filters
from .models import Song


class CommaSeparatedCharFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class SongFilter(django_filters.FilterSet):
    song_id = django_filters.CharFilter(field_name="song_id", lookup_expr="exact")
    album = django_filters.CharFilter(field_name="album", lookup_expr="icontains")
    song_title_en = django_filters.CharFilter(field_name="song_title_en", lookup_expr="icontains")
    song_title_dn = django_filters.CharFilter(field_name="song_title_dn", lookup_expr="icontains")
    release_year = django_filters.NumberFilter(field_name="release_year", lookup_expr="exact")
    release_year__gte = django_filters.NumberFilter(field_name="release_year", lookup_expr="gte")
    release_year__lte = django_filters.NumberFilter(field_name="release_year", lookup_expr="lte")
    singers = CommaSeparatedCharFilter(field_name="singers", lookup_expr="contains")
    music_directors = CommaSeparatedCharFilter(field_name="music_directors", lookup_expr="contains")
    actors = CommaSeparatedCharFilter(field_name="actors", lookup_expr="contains")
    categories = CommaSeparatedCharFilter(field_name="categories", lookup_expr="contains")

    class Meta:
        model = Song
        fields = [
            "song_id",
            "album",
            "song_title_en",
            "song_title_dn",
            "release_year",
            "singers",
            "music_directors",
            "actors",
            "categories",
        ]
