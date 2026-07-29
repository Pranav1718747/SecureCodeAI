"""File Classification, Risk Prioritization, and Batching Heuristics."""

import os
from ai.planner.state import FileType, ScanBatch


HIGH_RISK_KEYWORDS: list[str] = [
    "auth",
    "login",
    "password",
    "secret",
    "token",
    "key",
    "security",
    "crypto",
    "payment",
    "db",
    "sql",
    "admin",
    "user",
]

EXTENSION_MAP: dict[str, FileType] = {
    ".py": FileType.PYTHON,
    ".js": FileType.JAVASCRIPT,
    ".jsx": FileType.JAVASCRIPT,
    ".ts": FileType.TYPESCRIPT,
    ".tsx": FileType.TYPESCRIPT,
    ".sql": FileType.SQL,
    ".env": FileType.CONFIG,
    ".yml": FileType.CONFIG,
    ".yaml": FileType.CONFIG,
    ".json": FileType.CONFIG,
    ".html": FileType.HTML,
}


def classify_file_type(path: str) -> FileType:
    """Categorize file by extension and path pattern.

    Args:
        path: File path string.

    Returns:
        FileType enum value.
    """
    filename = os.path.basename(path).lower()
    if filename.startswith(".env") or filename in (".gitignore", "dockerfile", "makefile"):
        return FileType.CONFIG

    _, ext = os.path.splitext(filename)
    return EXTENSION_MAP.get(ext, FileType.OTHER)


def calculate_risk_priority(path: str, file_type: FileType) -> int:
    """Calculate heuristic risk priority score for a file.

    Priority levels:
    - 1: Critical high-risk security target (SQL, Auth, Secret, Config)
    - 2: Standard backend/application source code
    - 3: Frontend/template assets
    - 4: Low-priority static assets/documentation

    Args:
        path: File path string.
        file_type: Categorized FileType enum.

    Returns:
        int: Priority level (1 = highest risk, 4 = lowest risk).
    """
    lower_path = path.lower()

    if any(keyword in lower_path for keyword in HIGH_RISK_KEYWORDS):
        return 1

    if file_type in (FileType.SQL, FileType.CONFIG):
        return 1

    if file_type in (FileType.PYTHON, FileType.TYPESCRIPT, FileType.JAVASCRIPT):
        return 2

    if file_type == FileType.HTML:
        return 3

    return 4


def construct_batches(
    file_tree: list[str], max_files_per_batch: int = 50
) -> list[ScanBatch]:
    """Group repository file tree into prioritized, token-safe ScanBatch items.

    Args:
        file_tree: List of relative file paths in repository.
        max_files_per_batch: Hard upper limit of files per batch (default 50).

    Returns:
        list[ScanBatch]: Sorted list of scan batches by priority.
    """
    if not file_tree:
        return []

    # Classify and score every file
    scored_files: list[tuple[str, int]] = []
    for path in file_tree:
        file_type = classify_file_type(path)
        priority = calculate_risk_priority(path, file_type)
        scored_files.append((path, priority))

    # Sort by priority ascending (1 = highest priority first)
    scored_files.sort(key=lambda item: item[1])

    batches: list[ScanBatch] = []
    current_batch_files: list[str] = []
    current_priority: int = scored_files[0][1] if scored_files else 3
    batch_counter = 1

    for path, priority in scored_files:
        if len(current_batch_files) >= max_files_per_batch:
            batches.append(
                ScanBatch(
                    batch_id=batch_counter,
                    files=current_batch_files,
                    priority=current_priority,
                    estimated_tokens=len(current_batch_files) * 500,
                )
            )
            batch_counter += 1
            current_batch_files = []
            current_priority = priority

        current_batch_files.append(path)

    if current_batch_files:
        batches.append(
            ScanBatch(
                batch_id=batch_counter,
                files=current_batch_files,
                priority=current_priority,
                estimated_tokens=len(current_batch_files) * 500,
            )
        )

    return batches
