import psycopg2
from db_batch_reader import get_db_connection, fetch_and_lock_batch, update_batch_results

TEST_TABLE = "test_artist_name_mappings"


def setup_test_environment():
    """Creates a temporary test table and populates it with sample messy data."""
    print("Setting up test table...")
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            # 1. Drop existing test table if present
            cursor.execute(f"DROP TABLE IF EXISTS {TEST_TABLE};")

            # 2. Create test table structure
            cursor.execute(f"""
                CREATE TABLE {TEST_TABLE} (
                    raw_name TEXT PRIMARY KEY,
                    pre_cleaned_name TEXT,
                    cleaned_name TEXT,
                    status TEXT DEFAULT 'pending',
                    processed_by TEXT,
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)

            # 3. Insert mock messy entries
            mock_names = [
                "A.R. Rehman,",
                " Lata Mangeshkar .",
                "K. S. Chithra...",
                "S. P. Balasubrahmanyam",
                "Kishore Kumar,",
                "Asha Bhosle",
                "Shreya Ghoshal,",
                "Udit Narayan.",
                "Sonu Nigam ",
                " Alka Yagnik"
            ]
            for name in mock_names:
                cursor.execute(f"INSERT INTO {TEST_TABLE} (raw_name) VALUES (%s);", (name,))

            conn.commit()
    print("Test environment ready with 10 sample records.\n")


def run_dry_run_test():
    setup_test_environment()

    # -------------------------------------------------------------
    # TEST PHASE 1: Dry Run Step 2 (Deterministic Pre-Cleaning)
    # -------------------------------------------------------------
    print("--- Phase 1: Simulating Regex Pre-Cleaning ---")

    # Grab 5 pending items for Worker A
    batch_1 = fetch_and_lock_batch(
        target_status="pending",
        next_status="pre_cleaning_in_progress",
        batch_size=5,
        worker_id="test_worker_regex",
        table_name=TEST_TABLE
    )
    print(f"Worker fetched {len(batch_1)} items for pre-cleaning.")

    # Apply mock regex string cleanup
    pre_cleaned_updates = []
    for row in batch_1:
        # Simple mock cleanup stripping trailing spaces/punctuation
        clean_str = row["raw_name"].strip(" .,")
        pre_cleaned_updates.append({
            "raw_name": row["raw_name"],
            "pre_cleaned_name": clean_str
        })
        print(f"  [Pre-Clean] '{row['raw_name']}'  -->  '{clean_str}'")

    # Save updates as 'pre_cleaned'
    update_batch_results(pre_cleaned_updates, final_status="pre_cleaned", table_name=TEST_TABLE)
    print("Phase 1 completed.\n")

    # -------------------------------------------------------------
    # TEST PHASE 2: Dry Run Step 3 (Simulating Parallel LLM Workers)
    # -------------------------------------------------------------
    print("--- Phase 2: Simulating LLM Workers (SKIP LOCKED Concurrency) ---")

    # Worker Mac fetches available batch
    mac_batch = fetch_and_lock_batch(
        target_status="pre_cleaned",
        next_status="processing",
        batch_size=3,
        worker_id="worker_mac",
        table_name=TEST_TABLE
    )
    print(f"Worker Mac grabbed {len(mac_batch)} items.")

    # Worker Ubuntu fetches available batch simultaneously
    ubuntu_batch = fetch_and_lock_batch(
        target_status="pre_cleaned",
        next_status="processing",
        batch_size=3,
        worker_id="worker_ubuntu",
        table_name=TEST_TABLE
    )
    print(f"Worker Ubuntu grabbed {len(ubuntu_batch)} items.")

    # Verify no overlap in records assigned to Mac vs Ubuntu
    mac_raw_names = {r["raw_name"] for r in mac_batch}
    ubuntu_raw_names = {r["raw_name"] for r in ubuntu_batch}
    overlap = mac_raw_names.intersection(ubuntu_raw_names)

    if not overlap:
        print("SUCCESS: Zero row collision between workers! `SKIP LOCKED` is working.")
    else:
        print(f"ERROR: Row collision detected! Overlapped items: {overlap}")

    # Mock LLM finish for Mac worker
    mac_llm_results = [
        {"raw_name": r["raw_name"], "cleaned_name": r["pre_cleaned_name"].title()}
        for r in mac_batch
    ]
    update_batch_results(mac_llm_results, final_status="completed", table_name=TEST_TABLE)
    print("Phase 2 completed.\n")

    # -------------------------------------------------------------
    # TEST PHASE 3: Inspect Database State & Cleanup
    # -------------------------------------------------------------
    print("--- Phase 3: Inspecting Final Table State ---")
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT raw_name, pre_cleaned_name, cleaned_name, status, processed_by FROM {TEST_TABLE};")
            rows = cursor.fetchall()

            print(f"{'RAW NAME':<25} | {'PRE-CLEANED':<25} | {'STATUS':<15} | {'WORKER'}")
            print("-" * 80)
            for r in rows:
                print(f"{r[0]:<25} | {str(r[1]):<25} | {r[3]:<15} | {r[4]}")

            # Cleanup test table
            cursor.execute(f"DROP TABLE IF EXISTS {TEST_TABLE};")
            conn.commit()
            print("\nTemporary test table dropped successfully.")


if __name__ == "__main__":
    run_dry_run_test()