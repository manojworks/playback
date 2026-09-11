BEGIN;

-- ============================================================================
-- STEP 1: PREPARATION & INDEX MANAGEMENT
-- ============================================================================

-- Create a fast index on raw_name to speed up joins during array translation
CREATE INDEX IF NOT EXISTS idx_temp_artist_mappings_raw ON artist_name_mappings (raw_name);

-- Drop GIN/GiST indexes on target array columns to accelerate batch updates.
-- Re-create them after script completion.
DROP INDEX IF EXISTS idx_songs_singers;
DROP INDEX IF EXISTS idx_songs_music_directors;
DROP INDEX IF EXISTS idx_songs_actors;
DROP INDEX IF EXISTS idx_songs_lyricist;
DROP INDEX IF EXISTS idx_songs_album;
DROP INDEX IF EXISTS idx_songs_categories;
DROP INDEX IF EXISTS idx_songs_release_year;

-- ============================================================================
-- STEP 2: SET-BASED ARRAY CLEANUP ENGINE
-- ============================================================================

DO $$
DECLARE
    -- Holds the list of raw artist names that still need to be updated.
    v_target_raw_names TEXT[];
    -- Tracks the total number of rows updated in the target table.
    v_rows_updated INT := 0;
BEGIN
    ---------------------------------------------------------------------------
    -- PRE-CHECK & IDEMPOTENCY FILTER:
    -- Collect only mappings where raw_name differs from cleaned_name.
    -- Why? Filtering out identical mappings (where raw_name = cleaned_name) 
    -- ensures that array elements already cleaned are excluded from future matches.
    -- This allows the script to safely resume and skip already-processed rows 
    -- if it was interrupted on a previous run.
    ---------------------------------------------------------------------------
    SELECT array_agg(raw_name)
    INTO v_target_raw_names
    FROM artist_name_mappings
    WHERE raw_name <> cleaned_name;

    -- Exit gracefully if there are no mappings requiring update operations.
    IF v_target_raw_names IS NULL OR array_length(v_target_raw_names, 1) IS NULL THEN
        RAISE NOTICE 'No uncleaned artist names found in mapping table. Exiting.';
        RETURN;
    END IF;

    RAISE NOTICE 'Starting batch update of songs array columns...';

    WITH 
    ---------------------------------------------------------------------------
    -- STEP 2A: IDENTIFY ELIGIBLE ROWS
    -- Use the Postgres array overlap operator (&&) to find rows where at least
    -- one array column contains a value present in v_target_raw_names.
    -- Why? Filtering up-front avoids performing expensive unnest/join operations 
    -- on rows that do not require cleaning.
    ---------------------------------------------------------------------------
    eligible_songs AS (
        SELECT song_id
        FROM songs
        WHERE singers && v_target_raw_names
           OR music_directors && v_target_raw_names
           OR actors && v_target_raw_names
           OR lyricist && v_target_raw_names
    ),

    ---------------------------------------------------------------------------
    -- STEP 2B: TRANSFORM 'SINGERS' ARRAY
    -- Unnest the 'singers' array while tracking original element order (ord).
    -- Join against artist_name_mappings to retrieve cleaned_name.
    -- COALESCE ensures that any array element not present in artist_name_mappings 
    -- remains unchanged. Finally, rebuild the array maintaining original order.
    ---------------------------------------------------------------------------
    transformed_singers AS (
        SELECT 
            s.song_id,
            array_agg(COALESCE(m.cleaned_name, elem.val) ORDER BY elem.ord) AS cleaned_arr
        FROM eligible_songs es
        JOIN songs s ON es.song_id = s.song_id
        LEFT JOIN LATERAL unnest(s.singers) WITH ORDINALITY AS elem(val, ord) ON TRUE
        LEFT JOIN artist_name_mappings m ON elem.val = m.raw_name
        GROUP BY s.song_id
    ),

    ---------------------------------------------------------------------------
    -- STEP 2C: TRANSFORM 'MUSIC_DIRECTORS' ARRAY
    -- Repeats the unnest, join, and order-preserving rebuild for music_directors.
    ---------------------------------------------------------------------------
    transformed_music_directors AS (
        SELECT 
            s.song_id,
            array_agg(COALESCE(m.cleaned_name, elem.val) ORDER BY elem.ord) AS cleaned_arr
        FROM eligible_songs es
        JOIN songs s ON es.song_id = s.song_id
        LEFT JOIN LATERAL unnest(s.music_directors) WITH ORDINALITY AS elem(val, ord) ON TRUE
        LEFT JOIN artist_name_mappings m ON elem.val = m.raw_name
        GROUP BY s.song_id
    ),

    ---------------------------------------------------------------------------
    -- STEP 2D: TRANSFORM 'ACTORS' ARRAY
    -- Repeats the unnest, join, and order-preserving rebuild for actors.
    ---------------------------------------------------------------------------
    transformed_actors AS (
        SELECT 
            s.song_id,
            array_agg(COALESCE(m.cleaned_name, elem.val) ORDER BY elem.ord) AS cleaned_arr
        FROM eligible_songs es
        JOIN songs s ON es.song_id = s.song_id
        LEFT JOIN LATERAL unnest(s.actors) WITH ORDINALITY AS elem(val, ord) ON TRUE
        LEFT JOIN artist_name_mappings m ON elem.val = m.raw_name
        GROUP BY s.song_id
    ),

    ---------------------------------------------------------------------------
    -- STEP 2E: TRANSFORM 'LYRICIST' ARRAY
    -- Repeats the unnest, join, and order-preserving rebuild for lyricist.
    ---------------------------------------------------------------------------
    transformed_lyricist AS (
        SELECT 
            s.song_id,
            array_agg(COALESCE(m.cleaned_name, elem.val) ORDER BY elem.ord) AS cleaned_arr
        FROM eligible_songs es
        JOIN songs s ON es.song_id = s.song_id
        LEFT JOIN LATERAL unnest(s.lyricist) WITH ORDINALITY AS elem(val, ord) ON TRUE
        LEFT JOIN artist_name_mappings m ON elem.val = m.raw_name
        GROUP BY s.song_id
    ),

    ---------------------------------------------------------------------------
    -- STEP 2F: EXECUTE BATCH UPDATE
    -- Joins transformed array results back to the songs table and updates 
    -- all four array columns in a single set-based operation.
    ---------------------------------------------------------------------------
    performed_update AS (
        UPDATE songs s
        SET 
            singers = ts.cleaned_arr,
            music_directors = tmd.cleaned_arr,
            actors = ta.cleaned_arr,
            lyricist = tl.cleaned_arr
        FROM eligible_songs es
        LEFT JOIN transformed_singers ts ON es.song_id = ts.song_id
        LEFT JOIN transformed_music_directors tmd ON es.song_id = tmd.song_id
        LEFT JOIN transformed_actors ta ON es.song_id = ta.song_id
        LEFT JOIN transformed_lyricist tl ON es.song_id = tl.song_id
        WHERE s.song_id = es.song_id
        RETURNING s.song_id
    )

    -- Count total updated rows for verification/logging
    SELECT COUNT(*) INTO v_rows_updated FROM performed_update;

    RAISE NOTICE 'Update complete. Total rows updated: %', v_rows_updated;
END $$;


-- ============================================================================
-- STEP 3: POST-PROCESSING INDEX REBUILD
-- ============================================================================

-- Remove temporary index created for mappings
DROP INDEX IF EXISTS idx_temp_artist_mappings_raw;

CREATE EXTENSION IF NOT EXISTS btree_gin;
-- Re-create GIN indexes for array searching (optional/recommended for array queries)
CREATE INDEX idx_songs_singers ON songs USING gin (singers array_ops);
CREATE INDEX idx_songs_music_directors ON songs USING gin (music_directors array_ops);
CREATE INDEX idx_songs_actors ON songs USING gin (actors array_ops);
CREATE INDEX idx_songs_lyricist ON songs USING gin (lyricist array_ops);
CREATE INDEX idx_songs_album ON songs USING gin (album);
CREATE INDEX idx_songs_categories ON songs USING gin (categories array_ops);
CREATE INDEX idx_songs_release_year ON songs USING gin (release_year);
-- Reclaim dead tuples and refresh table statistics
VACUUM ANALYZE songs;
COMMIT;