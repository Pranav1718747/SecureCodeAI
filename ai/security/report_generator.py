"""Deterministic fallback generation for AI Analysis Reports."""

from core.models import Vulnerability

def generate_business_impact(vuln: Vulnerability) -> str:
    title = vuln.title.lower()
    if 'sql' in title or 'injection' in title:
        return "Exploitation of this vulnerability could lead to customer database theft, financial fraud, privilege escalation, and potential ransomware entry."
    elif 'credential' in title or 'secret' in title or 'hardcoded' in title:
        return "Exposure of these credentials could lead to cloud account compromise, unauthorized deployments, and severe secret leakage."
    elif 'xss' in title or 'cross-site' in title:
        return "Exploitation could lead to session hijacking, widespread account takeover, and sophisticated phishing campaigns targeting your users."
    elif 'path traversal' in title or 'directory traversal' in title:
        return "Could allow attackers to read arbitrary files, leading to configuration disclosure and potential remote code execution."
    elif 'remote code execution' in title or 'rce' in title:
        return "Critical vulnerability leading to complete server compromise, allowing attackers to execute arbitrary commands on the host."
    elif 'csrf' in title:
        return "Attackers could forge requests on behalf of authenticated users, leading to unauthorized state-changing actions."
    else:
        return f"Exploitation of this {vuln.title} vulnerability could compromise application integrity, leading to data exposure and reputational damage."


def generate_compliance(vuln: Vulnerability) -> str:
    title = vuln.title.lower()
    if 'sql' in title or 'injection' in title:
        return "Failure to remediate violates OWASP A03 (Injection), PCI DSS 6.5, SOC2 CC6, and ISO27001 A8."
    elif 'credential' in title or 'secret' in title or 'hardcoded' in title:
        return "Violates OWASP A02, CIS Secrets Management guidelines, SOC2, NIST 800-53, and potentially GDPR if PII is accessed."
    elif 'xss' in title or 'cross-site' in title:
        return "Violates OWASP A03 (Injection), CWE-79, and PCI DSS requirements for secure web applications."
    else:
        return "Failure to remediate this issue violates general secure coding practices required by SOC2, PCI DSS, and ISO27001."


def generate_remediation(vuln: Vulnerability) -> str:
    title = vuln.title.lower()
    lang = (vuln.language or '').lower()
    
    if 'sql' in title or 'injection' in title:
        if lang == 'python':
            return "Use parameterized queries (e.g., cursor.execute('SELECT * FROM users WHERE id=?', (id,))) instead of string formatting."
        elif lang == 'java':
            return "Use PreparedStatement instead of concatenating strings into JDBC queries."
        elif lang == 'php':
            return "Use PDO Prepared Statements to ensure variables are safely bound to the query."
        elif lang == 'go':
            return "Use parameterized queries (database/sql) to automatically escape input."
        else:
            return "Always use parameterized queries or an ORM to prevent user input from modifying the query structure."
            
    elif 'xss' in title or 'cross-site' in title:
        if lang == 'javascript' or lang == 'typescript':
            return "Avoid using innerHTML or dangerouslySetInnerHTML. Use textContent or let the framework escape data automatically."
        elif lang == 'php':
            return "Use htmlspecialchars() to escape output before rendering it in the browser."
        else:
            return "Contextually encode all user-controlled data before rendering it into HTML templates."
            
    elif 'credential' in title or 'secret' in title or 'hardcoded' in title:
        return "Remove hardcoded credentials from the source code. Fetch secrets dynamically at runtime using environment variables or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)."
        
    elif 'path traversal' in title:
        return "Strictly validate and sanitize file paths. Ensure the resolved absolute path falls within the intended directory using path normalization."
        
    else:
        return "Implement strict input validation, follow the principle of least privilege, and sanitize all data crossing trust boundaries."


def generate_secure_example(vuln: Vulnerability) -> str:
    title = vuln.title.lower()
    lang = (vuln.language or '').lower()
    
    if 'sql' in title or 'injection' in title:
        if lang == 'python':
            return 'cursor.execute(\n  "SELECT * FROM users WHERE id=?",\n  (user_id,)\n)'
        elif lang == 'java':
            return 'PreparedStatement pstmt = con.prepareStatement("SELECT * FROM users WHERE id = ?");\npstmt.setString(1, userId);'
        elif lang == 'javascript' or lang == 'typescript':
            return 'db.execute("SELECT * FROM users WHERE id = $1", [userId]);'
        else:
            return '// Use parameterized execution\ndb.execute("SELECT * FROM table WHERE id = ?", [userInput]);'
            
    elif 'xss' in title or 'cross-site' in title:
        if lang == 'javascript' or lang == 'typescript':
            return 'element.textContent = userInput;'
        elif lang == 'react':
            return '<div>{userInput}</div> // React escapes automatically'
        else:
            return 'echo htmlspecialchars($userInput, ENT_QUOTES, "UTF-8");'
            
    elif 'credential' in title or 'secret' in title:
        if lang == 'python':
            return 'import os\napi_key = os.getenv("API_KEY")'
        elif lang == 'javascript' or lang == 'typescript':
            return 'const apiKey = process.env.API_KEY;'
        elif lang == 'java':
            return 'String apiKey = System.getenv("API_KEY");'
        else:
            return 'API_KEY = get_environment_variable("API_KEY")'
            
    else:
        return '// Implement secure, validated abstraction\nsecureFunction(validatedInput);'


def generate_fallback_fix(vuln: Vulnerability) -> dict:
    title = vuln.title.lower()
    lang = (vuln.language or '').lower()
    
    fix_data = {
        "reason": "This deterministic fix enforces a strict secure pattern that fundamentally mitigates the vulnerability class.",
        "limitations": "This is a generic template replacement. An AI could tailor the variable names and context exactly to your surrounding code.",
        "confidence": "Medium",
        "before": vuln.snippet if vuln.snippet else "vulnerable_code()",
        "after": "secure_code()"
    }
    
    if 'sql' in title or 'injection' in title:
        fix_data["after"] = "cursor.execute(query, params) // Replaced string formatting with parameters"
    elif 'credential' in title or 'secret' in title:
        if lang == 'python':
            fix_data["after"] = "API_KEY = os.getenv('API_KEY')"
        elif lang == 'javascript' or lang == 'typescript':
            fix_data["after"] = "const API_KEY = process.env.API_KEY;"
        else:
            fix_data["after"] = "API_KEY = ENV['API_KEY']"
    elif 'xss' in title:
        fix_data["after"] = "element.textContent = userInput;"
    elif 'path traversal' in title:
        fix_data["after"] = "safe_path = os.path.abspath(os.path.join(base_dir, user_input))\nif not safe_path.startswith(base_dir):\n    raise SecurityError()"
        
    return fix_data


def generate_attack_scenario(vuln: Vulnerability) -> str:
    title = vuln.title.lower()
    
    if 'sql' in title or 'injection' in title:
        return "User input -> API Endpoint -> Unsanitized SQL Query -> Database Engine -> Arbitrary Data Leak"
    elif 'xss' in title:
        return "Malicious Link -> Victim Browser -> Unescaped DOM Rendering -> Malicious Script Execution -> Cookie Theft"
    elif 'credential' in title or 'secret' in title:
        return "Public Repository -> Automated Secret Scanner -> Attacker Extraction -> Unauthorized Cloud Access"
    elif 'path traversal' in title:
        return "Manipulated Filename ('../../../etc/passwd') -> File System API -> Directory Escape -> Sensitive File Read"
    elif 'rce' in title:
        return "Malicious Payload -> Deserialization Endpoint -> Shell Execution -> Complete Server Compromise"
    else:
        return "Untrusted Input -> Vulnerable Component -> Security Control Bypass -> Unauthorized Action"


def generate_full_report(vuln: Vulnerability) -> dict:
    return {
        "business_impact": generate_business_impact(vuln),
        "compliance_impact": generate_compliance(vuln),
        "remediation": generate_remediation(vuln),
        "secure_example": generate_secure_example(vuln),
        "attack_scenario": generate_attack_scenario(vuln),
        "fallback_fix": generate_fallback_fix(vuln)
    }
