import re
from typing import List

from sqlalchemy.orm import Session

from app.models import KnowledgeFile


STOP_WORDS = {
    "the",
    "is",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "what",
    "how",
    "can",
    "are",
    "does",
    "do",
    "i",
    "we",
    "our",
    "my",
    "you",
    "your",
    "please",
    "tell",
    "me",
}


def normalize_text(text: str) -> str:
    """
    Normalize text for keyword matching.
    """

    text = text.lower()

    # Replace punctuation with spaces.
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text,
    )

    # Remove extra whitespace.
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def tokenize(text: str) -> List[str]:
    """
    Convert text into useful searchable words.
    """

    normalized = normalize_text(text)

    words = normalized.split()

    return [
        word
        for word in words
        if word not in STOP_WORDS
        and len(word) > 1
    ]


def expand_query_words(
    words: List[str],
) -> List[str]:
    """
    Add simple variations for common words.

    This is intentionally lightweight for Phase 1.
    """

    expanded = set(words)

    variations = {
        "return": [
            "returns",
            "refund",
            "refunds",
            "returning",
        ],
        "returns": [
            "return",
            "refund",
            "refunds",
        ],
        "refund": [
            "refunds",
            "return",
            "returns",
        ],
        "policy": [
            "policies",
            "rules",
            "terms",
        ],
        "product": [
            "products",
            "item",
            "items",
        ],
        "purchase": [
            "purchased",
            "buy",
            "bought",
        ],
        "buy": [
            "purchase",
            "purchased",
            "bought",
        ],
        "customer": [
            "customers",
            "client",
            "clients",
        ],
    }

    for word in words:
        for variation in variations.get(
            word,
            [],
        ):
            expanded.add(variation)

    return list(expanded)


def split_into_chunks(
    text: str,
    chunk_size: int = 1200,
    overlap: int = 200,
) -> List[str]:
    """
    Split document text into overlapping chunks.
    """

    if not text:
        return []

    text = text.strip()

    if len(text) <= chunk_size:
        return [text]

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks


def score_chunk(
    question: str,
    chunk: str,
) -> int:
    """
    Calculate a simple relevance score.

    Phase 1 uses keyword matching rather than
    embeddings/vector search.
    """

    question_words = tokenize(question)

    question_words = expand_query_words(
        question_words
    )

    chunk_words = set(
        tokenize(chunk)
    )

    if not question_words:
        return 0

    score = 0

    for word in question_words:

        if word in chunk_words:
            score += 1

    # Give a small bonus if important words
    # appear multiple times.
    normalized_chunk = normalize_text(
        chunk
    )

    for word in question_words:

        occurrences = normalized_chunk.count(
            word
        )

        if occurrences > 1:
            score += min(
                occurrences - 1,
                2,
            )

    return score


def search_knowledge(
    db: Session,
    agent_id: int,
    question: str,
    max_chunks: int = 5,
) -> List[str]:
    """
    Search the agent's Knowledge Base and return
    the most relevant document chunks.
    """

    knowledge_files = (
        db.query(KnowledgeFile)
        .filter(
            KnowledgeFile.agent_id == agent_id
        )
        .all()
    )

    if not knowledge_files:
        return []

    scored_chunks = []

    for knowledge_file in knowledge_files:

        if not knowledge_file.extracted_text:
            continue

        chunks = split_into_chunks(
            knowledge_file.extracted_text
        )

        for chunk in chunks:

            score = score_chunk(
                question,
                chunk,
            )

            if score > 0:

                scored_chunks.append(
                    (
                        score,
                        knowledge_file.original_filename,
                        chunk,
                    )
                )

    # Highest relevance first.
    scored_chunks.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    results = []

    for (
        score,
        filename,
        chunk,
    ) in scored_chunks[:max_chunks]:

        results.append(
            f"Source: {filename}\n{chunk}"
        )

    return results


def build_knowledge_context(
    db: Session,
    agent_id: int,
    question: str,
) -> str:
    """
    Build the context that will be passed
    to the Gemini model.
    """

    results = search_knowledge(
        db=db,
        agent_id=agent_id,
        question=question,
    )

    if not results:
        return ""

    return "\n\n---\n\n".join(
        results
    )