"""File scanner service for repo traversal and code filtering."""

import os
import structlog

logger = structlog.get_logger(__name__)


class FileScannerService:
    """Handles file system traversal and filtering for source code."""
    
    SKIP_DIRS = {
        ".git", "__pycache__", "node_modules", "venv", ".venv",
        "env", ".env", "dist", "build", "target", "coverage",
        ".tox", ".mypy_cache", ".pytest_cache", ".next",
        ".nuxt", "vendor", "bower_components", "eggs",
        ".eggs", "site-packages", "migrations", "staticfiles",
    }
    
    SKIP_EXTENSIONS = {
        # Binary / media
        ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",
        ".svg", ".webp", ".mp3", ".mp4", ".avi", ".mov",
        ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z",
        ".woff", ".woff2", ".ttf", ".eot", ".otf",
        ".pyc", ".pyo", ".so", ".dll", ".exe", ".o",
        ".class", ".jar", ".war", ".bin", ".dat",
        ".sqlite3", ".db",
        # Lock files
        ".lock",
    }
    
    SKIP_FILENAMES = {
        "package-lock.json", "yarn.lock", "poetry.lock",
        "Pipfile.lock", "composer.lock", "Gemfile.lock",
        "pnpm-lock.yaml", ".DS_Store", "Thumbs.db",
        ".gitignore", ".gitattributes", "LICENSE", "LICENSE.md",
        "CHANGELOG.md", "CONTRIBUTING.md",
    }
    
    SOURCE_EXTENSIONS = {
        ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go",
        ".rs", ".c", ".cpp", ".h", ".hpp", ".cs", ".rb",
        ".php", ".swift", ".kt", ".scala", ".sql", ".sh",
        ".bash", ".env", ".yml", ".yaml", ".json", ".xml",
        ".html", ".css", ".scss", ".less", ".vue", ".svelte",
        ".tf", ".hcl", ".toml", ".ini", ".cfg", ".conf",
    }

    def generate_file_tree(self, local_repo_path: str) -> list[str]:
        """Traverses the path and returns a filtered list of relative file paths."""
        file_tree = []
        
        for root, dirs, files in os.walk(local_repo_path):
            dirs[:] = [d for d in dirs if d not in self.SKIP_DIRS]
            
            for file in files:
                _, ext = os.path.splitext(file)
                ext_lower = ext.lower()
                
                # Skip by filename
                if file in self.SKIP_FILENAMES:
                    continue
                # Skip by extension
                if ext_lower in self.SKIP_EXTENSIONS:
                    continue
                # Only include known source extensions (skip unknowns)
                if ext_lower and ext_lower not in self.SOURCE_EXTENSIONS:
                    continue
                
                full_path = os.path.join(root, file)
                # Skip files larger than 100KB (likely generated)
                try:
                    if os.path.getsize(full_path) > 100_000:
                        continue
                except OSError:
                    continue
                
                rel_path = os.path.relpath(full_path, local_repo_path)
                file_tree.append(rel_path)
        
        logger.info("scanner.file_tree_generated", file_count=len(file_tree))
        return file_tree
