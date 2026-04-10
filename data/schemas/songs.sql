-- Table: public.songs

-- DROP TABLE IF EXISTS public.songs;

CREATE TABLE IF NOT EXISTS public.songs
(
    song_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    song_url character varying(500) COLLATE pg_catalog."default",
    song_title_en character varying(500) COLLATE pg_catalog."default",
    song_title_dn character varying(500) COLLATE pg_catalog."default",
    singers text[] COLLATE pg_catalog."default",
    music_directors text[] COLLATE pg_catalog."default",
    actors text[] COLLATE pg_catalog."default",
    lyricist text[] COLLATE pg_catalog."default",
    album character varying(500) COLLATE pg_catalog."default",
    release_year smallint,
    categories text[] COLLATE pg_catalog."default",
    audio_url character varying(500) COLLATE pg_catalog."default",
    video_url character varying(500) COLLATE pg_catalog."default",
    lyrics_text_file character varying(500) COLLATE pg_catalog."default",
    lyrics_image_file character varying(500) COLLATE pg_catalog."default",
    lyrics_text_en text COLLATE pg_catalog."default",
    lyrics_text_dn text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT songs_pkey PRIMARY KEY (song_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.songs
    OWNER to manjo;

COMMENT ON TABLE public.songs
    IS 'Hindi song lyrics data scraped from HindiGeetMala website';

COMMENT ON COLUMN public.songs.song_id
    IS 'Unique identifier for the song (extracted from URL)';

COMMENT ON COLUMN public.songs.song_url
    IS 'Geetmala source URL of the song page';

COMMENT ON COLUMN public.songs.song_title_en
    IS 'Song title in English/Roman script';

COMMENT ON COLUMN public.songs.song_title_dn
    IS 'Song title in Devanagari script';

COMMENT ON COLUMN public.songs.singers
    IS 'Array of singer names';

COMMENT ON COLUMN public.songs.music_directors
    IS 'Array of music director names';

COMMENT ON COLUMN public.songs.actors
    IS 'Array of actor names featured in the song';

COMMENT ON COLUMN public.songs.lyricist
    IS 'Array of lyricist names';

COMMENT ON COLUMN public.songs.album
    IS 'Movie/album name';

COMMENT ON COLUMN public.songs.release_year
    IS 'Year of release';

COMMENT ON COLUMN public.songs.categories
    IS 'Array of song categories/genres';

COMMENT ON COLUMN public.songs.audio_url
    IS 'Audio URL for the song';

COMMENT ON COLUMN public.songs.video_url
    IS 'Video URL for the song';

COMMENT ON COLUMN public.songs.lyrics_text_file
    IS 'Path to the lyrics text file';

COMMENT ON COLUMN public.songs.lyrics_image_file
    IS 'Path to the lyrics image file';

COMMENT ON COLUMN public.songs.lyrics_text_en
    IS 'Full lyrics text content in English';

COMMENT ON COLUMN public.songs.lyrics_text_dn
    IS 'Full lyrics text content in Devanagari';
-- Index: idx_songs_album

-- DROP INDEX IF EXISTS public.idx_songs_album;

CREATE INDEX IF NOT EXISTS idx_songs_album
    ON public.songs USING btree
    (album COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_songs_categories

-- DROP INDEX IF EXISTS public.idx_songs_categories;

CREATE INDEX IF NOT EXISTS idx_songs_categories
    ON public.songs USING gin
    (categories COLLATE pg_catalog."default")
    TABLESPACE pg_default;
-- Index: idx_songs_music_directors

-- DROP INDEX IF EXISTS public.idx_songs_music_directors;

CREATE INDEX IF NOT EXISTS idx_songs_music_directors
    ON public.songs USING gin
    (music_directors COLLATE pg_catalog."default")
    TABLESPACE pg_default;
-- Index: idx_songs_release_year

-- DROP INDEX IF EXISTS public.idx_songs_release_year;

CREATE INDEX IF NOT EXISTS idx_songs_release_year
    ON public.songs USING btree
    (release_year ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: idx_songs_singers

-- DROP INDEX IF EXISTS public.idx_songs_singers;

CREATE INDEX IF NOT EXISTS idx_songs_singers
    ON public.songs USING gin
    (singers COLLATE pg_catalog."default")
    TABLESPACE pg_default;