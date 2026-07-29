"""Pattern-Based Heuristic Security Rule Engine."""

import re
from typing import Optional
from ai.security.schemas import Finding, SeverityLevel, OWASPCategory


# Vulnerability patterns (regex match rules)
SECURITY_RULES: list[dict] = [
    {
        "id": "CWE-89",
        "name": "SQL Injection",
        "owasp": OWASPCategory.A03_INJECTION,
        "severity": SeverityLevel.CRITICAL,
        "pattern": r"(execute|cursor\.execute|raw)\s*\(\s*f[\"'].*(SELECT|INSERT|UPDATE|DELETE)",
        "description": "Raw string formatting in SQL query execution leads to SQL Injection.",
        "explanation": "Constructing SQL queries via string interpolation or concatenation allows unescaped user input to alter SQL execution logic.",
    },
    {
        "id": "CWE-79",
        "name": "Cross-Site Scripting (XSS)",
        "owasp": OWASPCategory.A03_INJECTION,
        "severity": SeverityLevel.HIGH,
        "pattern": r"(dangerouslySetInnerHTML|mark_safe|innerHTML\s*=)",
        "description": "Unsanitized HTML rendering allows arbitrary JavaScript execution.",
        "explanation": "Rendering untrusted input directly to the DOM enables Cross-Site Scripting (XSS) attacks in the user's browser.",
    },
    {
        "id": "CWE-798",
        "name": "Hardcoded Credentials",
        "owasp": OWASPCategory.A07_AUTHENTICATION_FAILURES,
        "severity": SeverityLevel.CRITICAL,
        "pattern": r"(password|secret|api_key|access_token|aws_secret_key)\s*=\s*[\"'][A-Za-z0-9_\-]{8,}[\"']",
        "description": "Hardcoded secret or credential token detected in source code.",
        "explanation": "Storing plain-text secrets in repository files exposes them to unauthorized users and automated credential harvesters.",
    },
    {
        "id": "CWE-95",
        "name": "Eval / Code Injection",
        "owasp": OWASPCategory.A03_INJECTION,
        "severity": SeverityLevel.CRITICAL,
        "pattern": r"\b(eval|exec)\s*\(",
        "description": "Dynamic execution of arbitrary code via eval/exec.",
        "explanation": "Passing untrusted input to eval/exec allows attackers to execute arbitrary commands within the process context.",
    },
]


def scan_file_heuristics(file_path: str, content: str) -> list[Finding]:
    """Run pattern-based heuristic scan over file content lines.

    Args:
        file_path: Path of file being scanned.
        content: Text content of file.

    Returns:
        list[Finding]: List of findings identified by heuristic rules.
    """
    findings: list[Finding] = []
    lines = content.splitlines()

    # Track preceding line variables for f-strings
    f_string_vars: set[str] = set()

    for line_idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith("//"):
            continue

        # Check for variable assigned to f-string SQL query
        f_match = re.search(r"([a-zA-Z0-9_]+)\s*=\s*f[\"'].*(SELECT|INSERT|UPDATE|DELETE)", line, re.IGNORECASE)
        if f_match:
            f_string_vars.add(f_match.group(1))
            # Flag line directly as SQL injection
            findings.append(
                Finding(
                    file_path=file_path,
                    line_number=line_idx,
                    vulnerability_type="SQL Injection",
                    owasp_category=OWASPCategory.A03_INJECTION,
                    cwe_id="CWE-89",
                    severity=SeverityLevel.CRITICAL,
                    confidence=0.90,
                    description="Raw string formatting in SQL query string.",
                    explanation="Constructing SQL queries via string interpolation or concatenation allows unescaped user input to alter SQL execution logic.",
                    code_snippet=stripped,
                )
            )

        for rule in SECURITY_RULES:
            if re.search(rule["pattern"], line, re.IGNORECASE):
                # Avoid duplicate if already flagged above
                if rule["id"] == "CWE-89" and f_match:
                    continue
                finding = Finding(
                    file_path=file_path,
                    line_number=line_idx,
                    vulnerability_type=rule["name"],
                    owasp_category=rule["owasp"],
                    cwe_id=rule["id"],
                    severity=rule["severity"],
                    confidence=0.85,
                    description=rule["description"],
                    explanation=rule["explanation"],
                    code_snippet=stripped,
                )
                findings.append(finding)

    return findings
