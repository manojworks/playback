from django.db.models import Q
from rest_framework import filters, status, viewsets
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .filters import SongFilter
from .models import Song
from .serializers import SongSearchSerializer, SongSerializer


class HelloWorldAPIView(APIView):
    def get(self, request):
        return Response({"message": "Hello World"}, status=status.HTTP_200_OK)


class SongViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = SongFilter
    ordering_fields = [
        "song_id",
        "album",
        "release_year",
        "created_at",
        "updated_at",
    ]
    ordering = ["-created_at"]
    search_fields = [
        "song_title_en",
        "song_title_dn",
        "album",
        "lyrics_text_en",
        "lyrics_text_dn",
    ]


class SongSearchAPIView(APIView):
    @extend_schema(
        description="Search songs by multiple criteria including title, singers, music directors, actors, and lyrics.",
        parameters=[
            OpenApiParameter(
                name="q",
                description="Search query string. Can also use 'query' or 'search' parameter.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="query",
                description="Alternative search query parameter.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="search",
                description="Alternative search query parameter.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="singers",
                description="Comma-separated list of singer names to filter by.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="music_directors",
                description="Comma-separated list of music director names to filter by.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="lyricist",
                description="Comma-separated list of lyricist names to filter by.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="actors",
                description="Comma-separated list of actor names to filter by.",
                required=False,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="limit",
                description="Number of results to return per page. Default is 20.",
                required=False,
                type=OpenApiTypes.INT,
            ),
            OpenApiParameter(
                name="offset",
                description="The initial index from which to return the results.",
                required=False,
                type=OpenApiTypes.INT,
            ),
        ],
        responses={200: SongSearchSerializer(many=True)},
    )
    def get(self, request):
        """
        Search for songs based on query terms and metadata filters.
        
        Returns paginated results with limit/offset pagination.
        """
        query = (
            request.query_params.get("q")
            or request.query_params.get("query")
            or request.query_params.get("search")
            or ""
        ).strip()
        singers_param = request.query_params.get("singers", "")
        music_directors_param = request.query_params.get("music_directors", "")
        lyricist_param = request.query_params.get("lyricist", "")
        actors_param = request.query_params.get("actors", "")

        def parse_list_param(value):
            return [item.strip() for item in value.split(",") if item.strip()]

        singers = parse_list_param(singers_param)
        music_directors = parse_list_param(music_directors_param)
        lyricist = parse_list_param(lyricist_param)
        actors = parse_list_param(actors_param)

        queryset = Song.objects.all()
        print(f"Search query: '{queryset.count()}' songs in database before filtering.")
        if query:
            search_filter = Q(song_title_en__icontains=query)
            search_filter |= Q(singers__icontains=query)
            search_filter |= Q(music_directors__icontains=query)
            search_filter |= Q(actors__icontains=query)
            search_filter |= Q(lyricist__icontains=query)
            search_filter |= Q(album__icontains=query)
            search_filter |= Q(categories__icontains=query)
            search_filter |= Q(audio_url__icontains=query)
            search_filter |= Q(video_url__icontains=query)
            search_filter |= Q(lyrics_text_en__icontains=query)
            if query.isdigit():
                search_filter |= Q(release_year=int(query))
            queryset = queryset.filter(search_filter)

        for field_name, values in [
            ("singers", singers),
            ("music_directors", music_directors),
            ("lyricist", lyricist),
            ("actors", actors),
        ]:
            for value in values:
                queryset = queryset.filter(**{f"{field_name}__icontains": value})

        queryset = queryset.distinct().order_by("-created_at")

        paginator = LimitOffsetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = SongSearchSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
