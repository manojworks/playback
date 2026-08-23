import json

from db_batch_reader import get_db_connection


def fallback_llm_or_api_placeholder(dirty_name):
    """
    PLACEHOLDER: This function will run ONLY when no match is found
    locally via exact matching or Trigram similarity.
    """
    # TODO: Implement Wikipedia API / LLM verification logic here later.
    pass


def process_dirty_names():
    """
    Loops through the unverified names, checks against the golden table,
    and updates aliases upon finding a match.
    """
    # 1. Fetch unverified names from your dirty table
    # (Assuming your table is called 'dirty_artists' with a column 'raw_name')
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT raw_name as id, pre_cleaned_name FROM artist_name_mappings WHERE status = 'pre_cleaned';")
            dirty_records = cur.fetchall()

    print(f"🔄 Found {len(dirty_records)} unverified names to process.")

    # 2. Process each name one by one
    for dirty_id, pre_cleaned_name in dirty_records:
        pre_cleaned_name = pre_cleaned_name.strip()
        lower_name = pre_cleaned_name.lower()

        match_found = False
        canonical_name = None

        with conn.transaction():

            # --- TIER 1: Exact or Existing Alias Match ---
            # Blazing fast lookup via GIN and B-Tree indexes
            query_exact = """
                SELECT canonical_name 
                FROM indian_artists 
                WHERE LOWER(canonical_name) = %s OR aliases @> %s::jsonb;
            """
            cur.execute(query_exact, (lower_name, json.dumps(lower_name)))
            result = cur.fetchone()

            if result:
                match_found = True
                canonical_name = result[0]
                print(f"🎯 Instant Match: '{pre_cleaned_name}' -> Golden: '{canonical_name}'")

            # --- TIER 2: Trigram Fuzzy Matching ---
            # Runs ONLY if Tier 1 misses. Uses GIST index for similarity threshold.
            else:
                query_fuzzy = """
                    SELECT canonical_name, similarity(canonical_name, %s) AS sim
                    FROM indian_artists
                    WHERE similarity(canonical_name, %s) > 0.65
                    ORDER BY sim DESC
                    LIMIT 1;
                """
                cur.execute(query_fuzzy, (pre_cleaned_name, pre_cleaned_name))
                fuzzy_result = cur.fetchone()

                if fuzzy_result:
                    match_found = True
                    canonical_name = fuzzy_result[0]
                    print(
                        f"🔮 Fuzzy Match (Score: {fuzzy_result[1]:.2f}): '{pre_cleaned_name}' -> Golden: '{canonical_name}'")

                    # --- UPDATE GOLDEN ALIASES (Dynamic Learning) ---
                    # Append this newly discovered variation to the golden table's JSONB array
                    # so that next time it triggers a Tier 1 instant match.
                    update_alias_query = """
                        UPDATE indian_artists 
                        SET aliases = aliases || %s::jsonb
                        WHERE canonical_name = %s 
                        AND NOT (aliases @> %s::jsonb);
                    """
                    cur.execute(update_alias_query, (
                        json.dumps([lower_name]),
                        canonical_name,
                        json.dumps(lower_name)
                    ))

            # --- POST-MATCH ACTION ---
            if match_found:
                # Update your dirty table to point to the correct spelling and mark verified
                cur.execute("""
                    UPDATE artist_name_mappings 
                    SET cleaned_name = %s, status = 'cleaned' 
                    WHERE id = %s;
                """, (canonical_name, dirty_id))
                conn.commit()

            # --- TIER 3: No Match Found (Placeholder) ---
            else:
                print(f"❌ No local match for '{pre_cleaned_name}'. Route to placeholder.")
                fallback_llm_or_api_placeholder(pre_cleaned_name)


if __name__ == "__main__":
    process_dirty_names()
