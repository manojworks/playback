import json
import time
import requests
import psycopg

from db_batch_reader import DB_CONFIG

# Database connection credentials
DB_CONN = DB_CONFIG


def fetch_and_seed_golden_data():
    # Wikidata SPARQL Query
    # P27 = Country of citizenship -> Q668 (India)
    # P106 = Occupation -> Q36834 (Composer), Q177220 (Singer), Q753110 (Lyricist), Q33999 (Actor)
    sparql_query = """
    SELECT DISTINCT ?artistLabel WHERE {
      ?artist wdt:P27 wd:Q668 .
      VALUES ?occupation { wd:Q36834 wd:Q177220 wd:Q753110 wd:Q33999 }
      ?artist wdt:P106 ?occupation .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    """

    url = "https://query.wikidata.org/sparql"
    headers = {
        'User-Agent': 'IndianArtistDataSeeder/1.0 (manojworks@gmail.com) Python-requests',
        'Accept': 'application/json'
    }
    params = {
        'query': sparql_query,
        'format': 'json'
    }

    print("📡 Fetching golden names from Wikidata (this may take a few seconds)...")

    # try:
    #     response = requests.get(url, params={'query': sparql_query, 'format': json}, headers=headers)
    #     response.raise_for_status()
    #     data = response.json()
    # except Exception as e:
    #     print(f"❌ Failed to fetch data from Wikidata API: {e}")
    #     return

    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()

        # Extract names from the JSON payload
        bindings = data.get('results', {}).get('bindings', [])
        artist_names = set()

        for row in bindings:
            name = row.get('artistLabel', {}).get('value', '').strip()
            # Filter out bad entries or internal Wikidata item IDs (e.g., "Q12345")
            if name and not name.startswith('Q') and len(name) > 2:
                artist_names.add(name)

        print(f"✅ Successfully downloaded {len(artist_names)} unique golden names.")
        print("🗄️ Seeding your PostgreSQL 'indian_artists' table...")

        inserted_count = 0

        # Connect to Postgres and stream insertion
        with psycopg.connect(**DB_CONN) as conn:
            with conn.cursor() as cur:
                for name in artist_names:
                    try:
                        # Using ON CONFLICT DO NOTHING to avoid crashing on duplicate names
                        cur.execute("""
                            INSERT INTO indian_artists (canonical_name, aliases)
                            VALUES (%s, '[]'::jsonb)
                            ON CONFLICT (canonical_name) DO NOTHING;
                        """, (name,))

                        if cur.rowcount > 0:
                            inserted_count += 1
                    except Exception as insert_err:
                        print(f"⚠️ Error inserting '{name}': {insert_err}")
                        continue

            conn.commit()

        print(f"🎉 Done! Added {inserted_count} new golden names to your PostgreSQL table.")

    else:
        print(f"Error {response.status_code}: {response.text}")


if __name__ == "__main__":
    fetch_and_seed_golden_data()
