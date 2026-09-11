import json
import concurrent.futures
from psycopg_pool import ConnectionPool
import psycopg

from db_batch_reader import DB_CONFIG

import json
import ollama


def validate_indian_artist(input_name: str) -> dict:
    """
    Sends an artist name to the local qwen2:7b model to verify authenticity
    and extract a standardized, clean English spelling.
    """

    # System instructions force qwen2 into a strict, analytical mode
    system_instruction = (
        "You are an expert music archivist specializing in Indian and Global cinema and music. "
        "Your job is to look at an input artist name and verify if they are a real, "
        "recognized Indian or Global singer, composer, lyricist, or actor. "
        "You must respond strictly in JSON format."
    )

    # The prompt explicitly specifies the required JSON structure
    prompt = f"""
    Analyze the following input name: "{input_name}"

    Determine if this is a real Indian or Global artist (singer, composer, lyricist, or actor).
    Account for typos, regional variation spellings, or missing initials.

    Respond ONLY with a valid JSON object matching this schema:
    {{
        "is_verified": true or false,
        "standardized_clean_name": "The authoritative English spelling of their name, or null if not verified",
        "primary_role": "Singer, Composer, Lyricist, or Actor",
        "confidence_score": 0.0 to 1.0,
        "reasoning": "A 1-sentence reason for your decision"
    }}
    """

    try:
        response = ollama.chat(
            model='qwen2:7b',
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': prompt}
            ],
            options={
                'temperature': 0.0,  # Forces deterministic, non-creative answers
                'top_p': 0.1  # Restricts token pool to high-probability matches
            },
            format='json'  # Forces Ollama to strictly enforce a JSON output
        )

        # Parse the raw string response into a Python dictionary
        result = json.loads(response['message']['content'])
        return result

    except Exception as e:
        print(f"Error communicating with local Ollama service: {e}")
        return {"is_verified": False, "standardized_clean_name": None}


# 1. Initialize the connection pool once globally or pass it into the function
# Adjust max_size based on how many concurrent threads your DB can comfortably handle
conn_string = " ".join([f"{k}={v}" for k, v in DB_CONFIG.items()])
pool = ConnectionPool(
    conninfo=conn_string,
    min_size=2,
    max_size=10,
    open=True
)


def process_single_record(record):
    """
    Worker function executed by individual threads.
    Borrows a connection from the pool to process a single dirty record.
    """
    dirty_id, pre_cleaned_name = record
    pre_cleaned_name = pre_cleaned_name.strip()
    lower_name = pre_cleaned_name.lower()

    match_found = False
    canonical_name = None

    # Fetch a thread-safe connection from the pool
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # Psycopg3: exiting the context block automatically handles commits/rollbacks
            with conn.transaction():

                # --- TIER 1: Exact or Existing Alias Match ---
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
                else:
                    query_fuzzy = """
                        SELECT canonical_name, similarity(canonical_name, %s) AS sim
                        FROM indian_artists
                        WHERE similarity(canonical_name, %s) > 0.8
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
                    cur.execute("""
                        UPDATE artist_name_mappings 
                        SET cleaned_name = %s, status = 'cleaned_exact_or_fuzzy' 
                        WHERE pre_cleaned_name = %s;
                    """, (canonical_name, dirty_id))

                    # NOTE: Removing manual conn.commit() here because
                    # 'with conn.transaction()' automatically commits upon successful block exit.

                # --- TIER 3: No Match Found ---
                else:
                    print(f"❌ No local match for '{pre_cleaned_name}'. Route to LLM.")
                    llm_name = validate_indian_artist(pre_cleaned_name)
                    if llm_name.get("is_verified") is True:
                        clean_name = llm_name.get("standardized_clean_name")
                        print(f"✅ Success! Verified artist as: {clean_name}")
                        cur.execute("""
                                    UPDATE artist_name_mappings 
                                    SET cleaned_name = %s, status = 'cleaned_llm' 
                                    WHERE pre_cleaned_name = %s;
                                """, (clean_name, dirty_id))
                    else:
                        print(f"❌ Match not found or confidence too low for: '{llm_name}'")


def process_dirty_names():
    """
    Fetches unverified names and distributes them across a ThreadPoolExecutor
    to process records concurrently.
    """
    # 1. Fetch unverified names using the pool
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT raw_name as id, pre_cleaned_name FROM artist_name_mappings WHERE status = 'pre_cleaned';")
            dirty_records = cur.fetchall()

    print(f"🔄 Found {len(dirty_records)} unverified names to process.")
    if not dirty_records:
        return

    # 2. Process records concurrently using Futures
    # Match 'max_workers' to your pool's 'max_size' to maximize efficiency without waiting
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        # Submit all tasks to the executor
        futures = [executor.submit(process_single_record, record) for record in dirty_records]

        # Monitor progress as they complete
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result() # Triggers any exceptions raised during processing
            except Exception as e:
                print(f"⚠️ Error processing record: {e}")
                print(e)



# ==========================================
# EXECUTION PIPELINE (Single Request Input)
# ==========================================
def test_validate_indian_artist():
    # Test with a single name variation (e.g., misspelled or colloquial variant)
    test_input = "A R Rehman"
    print(f"Sending request to local qwen2:7b for: '{test_input}'...\n")

    analysis = validate_indian_artist(test_input)

    # Display the evaluation summary
    print("--- Model Analysis ---")
    print(json.dumps(analysis, indent=2))
    print("----------------------\n")

    # Check if a positive match was found
    if analysis.get("is_verified") is True:
        clean_name = analysis.get("standardized_clean_name")
        print(f"✅ Success! Verified artist as: {clean_name}")

        # =====================================================================
        # PLACEHOLDER: TAKE FURTHER ACTION HERE
        # =====================================================================
        # This block only executes if the artist was successfully verified.
        # Add your custom database, file writing, or lookup logic below:

        print("\n[ACTION PLUG-IN] Executing post-verification pipeline...")

        # Example Action 1: Write/Append to your local Golden Dataset CSV
        # with open("golden_indian_artists.csv", "a") as f:
        #     f.write(f"{clean_name},{analysis['primary_role']}\n")

        # Example Action 2: Trigger a subsequent query to your SQL/MusicBrainz DB
        # cursor.execute("SELECT id FROM artist WHERE name = %s", (clean_name,))

        print("[ACTION PLUG-IN] Successfully completed tasks for this record.")
        # =====================================================================

    else:
        print(f"❌ Match not found or confidence too low for: '{test_input}'")


if __name__ == "__main__":
    process_dirty_names()
