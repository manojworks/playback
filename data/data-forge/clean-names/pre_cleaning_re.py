import logging
import re
import time
import unicodedata
from typing import Any, Dict, List

from db_batch_reader import fetch_and_lock_batch, update_batch_results

# Matches bracketed/parenthetical expressions: (feat. ...), [Official], etc.
PARENTHETICAL_PATTERN = re.compile(r"[\(\[\{].*?[\)\]\}]")

# TODO: check if this is overly aggressive
# Matches featuring/collaboration markers and everything following them
COLLAB_SPLIT_PATTERN = re.compile(
    r"\s+\b(feat\.?|ft\.?|featuring|with|vs\.?|x|and|&)\b\s+.*$",
    re.IGNORECASE,
)

# Indian honorifics, titles, and roles as standalone prefixes
PREFIX_HONORIFICS_PATTERN = re.compile(
    r"^(?:(?:pandit|pt\.?|ustad|ust\.?|ustaad|vidushi|shri|sri|smt\.?|"
    r"dr\.?|guru|prof\.?|late|swami|begum|bharat\s+ratna)\s+)+",
    re.IGNORECASE,
)

# Suffix honorifics (e.g., "Lata Ji", "Kishore Saab")
SUFFIX_HONORIFICS_PATTERN = re.compile(
    r"\s+\b(ji|saab|sahab|garu|avargal)\b\.?$",
    re.IGNORECASE,
)

# Matches initial dots (e.g., "A. R. Rahman" -> "A R Rahman" or "A.R." -> "A R")
INITIAL_DOTS_PATTERN = re.compile(r"\b([A-Za-z])\.(?=\s|[A-Za-z]|$)")

# Matches multiple spaces, tabs, or non-breaking spaces
MULTISPACE_PATTERN = re.compile(r"\s+")

# Unwanted punctuation and residual symbols (keeping letters, digits, and basic hyphens)
UNWANTED_CHARS_PATTERN = re.compile(r"[^\w\s\-]")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------------
# MODULAR CLEANING FUNCTIONS
# -------------------------------------------------------------------------

def normalize_unicode(text: str) -> str:
    """Normalizes Unicode characters, removes diacritics, and strips zero-width spaces."""
    if not text:
        return ""
    # NFKD decomposition separates base characters from diacritical marks
    decomposed = unicodedata.normalize("NFKD", text)
    # Strip non-spacing combining marks (diacritics)
    stripped = "".join(char for char in decomposed if not unicodedata.combining(char))
    # Remove control characters and zero-width spaces
    return "".join(char for char in stripped if unicodedata.category(char)[0] != "C")

def strip_parentheses_and_collaborations(text: str) -> str:
    """Removes parenthetical notes and secondary/featured artists."""
    text = PARENTHETICAL_PATTERN.sub(" ", text)
    text = COLLAB_SPLIT_PATTERN.sub(" ", text)
    return text

def strip_indian_honorifics(text: str) -> str:
    """Removes common Indian prefix and suffix honorifics."""
    text = PREFIX_HONORIFICS_PATTERN.sub("", text.strip())
    text = SUFFIX_HONORIFICS_PATTERN.sub("", text.strip())
    return text


def clean_punctuation_and_initials(text: str) -> str:
    """Removes dots between initials and strips stray punctuation."""
    # Convert 'A.R.' / 'A. R.' into spaced letters: 'A R'
    text = INITIAL_DOTS_PATTERN.sub(r"\1 ", text)
    # Remove commas, semicolons, quotes, and other noise
    text = UNWANTED_CHARS_PATTERN.sub(" ", text)
    return text


def normalize_whitespace(text: str) -> str:
    """Collapses multiple spaces and trims outer margins."""
    return MULTISPACE_PATTERN.sub(" ", text).strip()


def harmonize_transliteration(text: str) -> str:
    """Harmonizes common Indic-to-Latin transliteration patterns for matching."""
    text = text.lower()
    text = re.sub(r"ee", "i", text)
    text = re.sub(r"oo", "u", text)
    text = re.sub(r"aa", "a", text)
    text = re.sub(r"ph", "f", text)
    text = re.sub(r"sh", "s", text)
    text = re.sub(r"w", "v", text)
    return text

def clean_artist_name_regex(raw_name: str) -> str:
    """Regex cleaning logic placeholder (currently a no-op)."""
    """Executes the pre-cleaning pipeline in sequential order."""
    if not raw_name:
        return ""

    # Step 1: Unicode & character standardization
    cleaned = normalize_unicode(raw_name)

    # Step 2: Remove brackets, annotations, and collaborator tags
    cleaned = strip_parentheses_and_collaborations(cleaned)

    # Step 3: Clean punctuation, commas, and dots around initials
    cleaned = clean_punctuation_and_initials(cleaned)

    # Step 4: Strip Indian cultural honorifics & titles
    cleaned = strip_indian_honorifics(cleaned)

    # Step 5: Normalize and trim whitespaces
    cleaned = normalize_whitespace(cleaned)

    # Step 5: Harmonize transliteration
    cleaned = harmonize_transliteration(cleaned)

    # Step 6: Standardize presentation casing (Title Case)
    return cleaned.title()


def process_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Applies pre-cleaning transformations to raw artist names.

    Extracts raw_name, executes regex and text cleaning, and assigns
    the output to pre_cleaned_name while safely retaining cleaned_name.
    """
    raw_name = record.get("raw_name")

    # Guard against missing, None, or non-string raw_name values
    if not isinstance(raw_name, str) or not raw_name.strip():
        logger.warning("Invalid or empty raw_name in record: %s", record)
        return {
            "raw_name": raw_name,
            "pre_cleaned_name": None,
            "cleaned_name": record.get("cleaned_name"),
        }

    try:
        pre_cleaned = clean_artist_name_regex(raw_name)
    except Exception as err:
        logger.error(
            "Regex processing failed for raw_name '%s': %s",
            raw_name,
            err,
            exc_info=True,
        )
        # Fallback: retain raw_name or set to None on unexpected cleaning error
        pre_cleaned = None

    return {
        "raw_name": raw_name,
        "pre_cleaned_name": pre_cleaned,
        "cleaned_name": record.get("cleaned_name"),
    }


def run_worker(
    worker_id: str = "worker_1",
    batch_size: int = 50,
    poll_interval_seconds: int = 5,
    table_name: str = "artist_name_mappings",
) -> None:
    """Continuously fetches batches, cleans names, and updates database records

    with automated failure recovery.
    """
    logger.info("Starting worker: %s", worker_id)

    while True:
        batch: List[Dict[str, Any]] = []

        try:
            # 1. Claim batch: pending -> pre_cleaning_in_progress
            batch = fetch_and_lock_batch(
                target_status="pending",
                next_status="pre_cleaning_in_progress",
                batch_size=batch_size,
                worker_id=worker_id,
                table_name=table_name,
            )

            if not batch:
                logger.debug(
                    "No pending records found. Polling again in %ds...",
                    poll_interval_seconds,
                )
                time.sleep(poll_interval_seconds)
                continue

            logger.info("Claimed batch of %d records. Processing...", len(batch))

            # 2. Transform records
            updates = [process_record(record) for record in batch]

            # 3. Write results: pre_cleaning_in_progress -> pre_cleaned
            update_batch_results(
                updates=updates,
                final_status="pre_cleaned",
                table_name=table_name,
            )

            logger.info(
                "Successfully pre-cleaned and updated %d records.", len(updates)
            )

        except KeyboardInterrupt:
            logger.info("Worker termination requested. Shutting down gracefully...")
            if batch:
                logger.warning(
                    "Worker interrupted with active batch. Resetting %d records to 'pending'...",
                    len(batch),
                )
                try:
                    update_batch_results(
                        updates=[{"raw_name": r["raw_name"]} for r in batch if r.get("raw_name")],
                        final_status="pending",
                        table_name=table_name,
                    )
                except Exception as rollback_err:
                    logger.error(
                        "Failed to reset interrupted batch to pending: %s",
                        rollback_err,
                        exc_info=True,
                    )
            break

        except Exception as exc:
            logger.error(
                "Unhandled error during batch processing: %s",
                exc,
                exc_info=True,
            )

            # Recovery: prevent records from being trapped in 'pre_cleaning_in_progress'
            if batch:
                logger.warning(
                    "Marking %d in-flight records as 'pre_cleaning_failed'...",
                    len(batch),
                )
                try:
                    update_batch_results(
                        updates=[{"raw_name": r["raw_name"]} for r in batch if r.get("raw_name")],
                        final_status="pre_cleaning_failed",
                        table_name=table_name,
                    )
                except Exception as recovery_err:
                    logger.critical(
                        "Failed to update batch status during recovery: %s",
                        recovery_err,
                        exc_info=True,
                    )

            time.sleep(poll_interval_seconds)


if __name__ == "__main__":
    run_worker()