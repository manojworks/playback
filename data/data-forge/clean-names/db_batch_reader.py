import os
from contextlib import contextmanager
from typing import List, Dict, Any

import psycopg
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()

# Database Configuration (override via environment variables)
DB_CONFIG = {
    "dbname": os.getenv("POSTGRES_DB", "postgres"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "password"),
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", 5432)),
}


@contextmanager
def get_db_connection():
    """Context manager for handling DB connections safely."""
    #TODO: Error Handling & Transaction management needed here?
    conn = psycopg.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()


def fetch_and_lock_batch(
        target_status: str,
        next_status: str,
        batch_size: int = 50,
        worker_id: str = "default_worker",
        table_name: str = "artist_name_mappings"  # Added parameter
) -> List[Dict[str, Any]]:
    # Safely interpolate table name into SQL query
    #TODO: check for SQL Injection Risk on Table Names
    query = f"""
        UPDATE {table_name}
        SET 
            status = %s,
            processed_by = %s,
            updated_at = NOW()
        WHERE raw_name IN (
            SELECT raw_name 
            FROM {table_name} 
            WHERE status = %s
            LIMIT %s
            FOR UPDATE SKIP LOCKED
        )
        RETURNING raw_name, pre_cleaned_name, cleaned_name;
    """

    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (next_status, worker_id, target_status, batch_size))
            records = cursor.fetchall()
            conn.commit()
            return [dict(record) for record in records]


def update_batch_results(
        updates: List[Dict[str, Any]],
        final_status: str = "completed",
        table_name: str = "artist_name_mappings"  # Added parameter
) -> None:
    if not updates:
        return

    # TODO: check for SQL Injection Risk on Table Names
    query = f"""
        UPDATE {table_name}
        SET 
            pre_cleaned_name = COALESCE(%s, pre_cleaned_name),
            cleaned_name = COALESCE(%s, cleaned_name),
            status = %s,
            updated_at = NOW()
        WHERE raw_name = %s;
    """

    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            #TODO: Batch Update is inefficient in the for loop.
            for item in updates:
                cursor.execute(
                    query,
                    (
                        item.get("pre_cleaned_name"),
                        item.get("cleaned_name"),
                        final_status,
                        item["raw_name"],
                    ),
                )
            conn.commit()
