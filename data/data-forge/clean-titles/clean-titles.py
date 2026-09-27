#!/usr/bin/env python3

import logging
import os
import re

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import execute_values

ENV_FILE = ".env"
LOG_FILE = "title_normalization.log"

# The requested selection rule is deliberately limited to lowercase a-z
# and whitespace. Therefore uppercase letters and all other characters
# qualify a row for processing.
NON_AZ_WHITESPACE_RE = re.compile(r"[^a-z\s]")


def configure_logging():
    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format="%(message)s",
    )


def get_database_connection():
    load_dotenv(ENV_FILE)

    required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"]
    missing = [name for name in required if not os.getenv(name)]

    if missing:
        raise RuntimeError(
            "Missing required environment variables in .env: "
            + ", ".join(missing)
        )

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )


def normalize_title(title):
    """
    Apply the requested title normalization rules:

    1. Remove commas. If a comma is not at the end of the title,
       ensure a whitespace character follows its removal.
       (Whitespace is subsequently collapsed.)
    2. Replace hyphens with whitespace.
    3. Remove both ASCII and typographic apostrophes.
    4. Treat tabs/newlines and all other whitespace as whitespace.
    5. Collapse consecutive whitespace into one ordinary space.
    """
    cleaned = title

    # Remove commas. A comma between characters becomes a single space;
    # a trailing comma is simply removed.
    cleaned = re.sub(r",(?=\S)", " ", cleaned)
    cleaned = cleaned.replace(",", "")

    # Replace hyphens with whitespace.
    cleaned = cleaned.replace("-", " ")

    # Remove any period
    cleaned = cleaned.replace(".", "")

    # Remove both ASCII apostrophe and typographic right single quotation mark.
    cleaned = cleaned.replace("'", "").replace("’", "")

    # Collapse spaces, tabs, newlines, and other Unicode whitespace.
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def main():
    configure_logging()

    changed_titles = {}

    bulk_update_statement = """update song_titles as target
    set normalized_en_title = source.cleaned_title
    from (VALUES %s) AS source(song_id, cleaned_title)
    where target.song_id = source.song_id;
    """

    try:
        conn = get_database_connection()

        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT song_id, normalized_romanized_title
                    FROM song_titles
                    WHERE normalized_romanized_title ~ '[^a-z[:space:]]'
                    ORDER BY song_id
                    """
                )

                rows = cursor.fetchall()

                for song_id, original_title in rows:
                    # Handle NULL defensively, although NULL does not satisfy
                    # the WHERE condition and therefore should not be returned.
                    if original_title is None:
                        logging.info(
                            "id=%s | NO CHANGE | title=NULL",
                            song_id,
                        )
                        continue

                    cleaned_title = normalize_title(original_title)

                    if cleaned_title != original_title:
                        changed_titles[song_id] = cleaned_title

                        logging.info(
                            cleaned_title
                        )
                    else:
                        logging.info(
                            "id=%s | NO CHANGE | title=%r",
                            song_id,
                            original_title,
                        )
                update_data = list(changed_titles.items())
                execute_values(cursor, bulk_update_statement, update_data)
                conn.commit()
                print(f"Length of dictionary: {len(changed_titles)}")

        finally:
            conn.close()

    except Exception:
        logging.exception("Script failed")
        raise


if __name__ == "__main__":
    main()
