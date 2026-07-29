"""OWASP Top 10 and CWE Built-In Knowledge Base Dataset."""

from ai.knowledge.schemas import KnowledgeEntry

# Pre-populated OWASP Top 10 / CWE knowledge base catalog
OWASP_KNOWLEDGE_CATALOG: list[dict] = [
    {
        "id": "kb-cwe-89",
        "title": "SQL Injection (CWE-89)",
        "cwe_id": "CWE-89",
        "owasp_category": "A03:2021-Injection",
        "summary": "SQL Injection occurs when untrusted user input is directly concatenated or formatted into dynamic SQL query strings.",
        "remediation_guidance": "Use parameterized queries, prepared statements, or ORM parameter binding. Never concatenate untrusted strings into SQL code.",
    },
    {
        "id": "kb-cwe-79",
        "title": "Cross-Site Scripting (CWE-79)",
        "cwe_id": "CWE-79",
        "owasp_category": "A03:2021-Injection",
        "summary": "Cross-Site Scripting (XSS) occurs when an application includes untrusted data in a web page without proper validation or escaping.",
        "remediation_guidance": "Context-encode output data (HTML, JavaScript, CSS). Use safe framework rendering templates and Content Security Policy (CSP) headers.",
    },
    {
        "id": "kb-cwe-798",
        "title": "Use of Hard-coded Credentials (CWE-798)",
        "cwe_id": "CWE-798",
        "owasp_category": "A07:2021-Identification and Authentication Failures",
        "summary": "Storing hard-coded passwords, API keys, or private tokens directly in source code files exposes them to unauthorized users.",
        "remediation_guidance": "Store credentials outside source code in secure environment variables or AWS Secrets Manager / HashiCorp Vault.",
    },
    {
        "id": "kb-cwe-95",
        "title": "Improper Neutralization of Directives in Dynamically Evaluated Code (CWE-95)",
        "cwe_id": "CWE-95",
        "owasp_category": "A03:2021-Injection",
        "summary": "Passing user-controlled input to eval() or exec() functions allows arbitrary remote code execution within the process.",
        "remediation_guidance": "Avoid dynamic code execution APIs. Use structured data parsers (json.loads, ast.literal_eval) instead of eval().",
    },
]


def load_default_knowledge_entries() -> list[KnowledgeEntry]:
    """Load default OWASP/CWE knowledge entries into KnowledgeEntry Pydantic objects.

    Returns:
        list[KnowledgeEntry]: List of initialized knowledge entries.
    """
    entries: list[KnowledgeEntry] = []
    for item in OWASP_KNOWLEDGE_CATALOG:
        entry = KnowledgeEntry(
            id=item["id"],
            title=item["title"],
            cwe_id=item["cwe_id"],
            owasp_category=item["owasp_category"],
            summary=item["summary"],
            remediation_guidance=item["remediation_guidance"],
            vector=[],
        )
        entries.append(entry)
    return entries
