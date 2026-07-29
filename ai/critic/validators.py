"""Rule-Based Validation Logic for Security Findings."""

from ai.security.schemas import Finding
from ai.critic.schemas import ValidationResult, RejectionCode, QualityScore


def validate_finding_rules(finding: Finding) -> ValidationResult:
    """Validate security finding against quality and completeness criteria.

    Args:
        finding: Finding object to evaluate.

    Returns:
        ValidationResult: Result containing pass/fail decision, score, and rejection reasons.
    """
    # 1. Line number check
    if finding.line_number <= 0:
        return ValidationResult(
            finding_id=finding.id,
            is_valid=False,
            rejection_code=RejectionCode.MISSING_LINE_NUMBER,
            rejection_reason="Finding does not reference a valid line number (> 0).",
            quality_score=QualityScore(
                accuracy_score=0.0,
                completeness_score=0.0,
                explanation_quality=0.0,
                overall_score=0.0,
            ),
        )

    # 2. Code snippet presence check
    if not finding.code_snippet or not finding.code_snippet.strip():
        return ValidationResult(
            finding_id=finding.id,
            is_valid=False,
            rejection_code=RejectionCode.MISSING_CODE_SNIPPET,
            rejection_reason="Finding does not include code snippet context.",
            quality_score=QualityScore(
                accuracy_score=0.2,
                completeness_score=0.0,
                explanation_quality=0.2,
                overall_score=0.13,
            ),
        )

    # 3. CWE ID format check
    if not finding.cwe_id or not finding.cwe_id.startswith("CWE-"):
        return ValidationResult(
            finding_id=finding.id,
            is_valid=False,
            rejection_code=RejectionCode.INVALID_CWE_ID,
            rejection_reason=f"Invalid CWE ID format: '{finding.cwe_id}'. Must start with 'CWE-'.",
            quality_score=QualityScore(
                accuracy_score=0.1,
                completeness_score=0.3,
                explanation_quality=0.2,
                overall_score=0.2,
            ),
        )

    # 4. Confidence threshold check
    if finding.confidence < 0.3:
        return ValidationResult(
            finding_id=finding.id,
            is_valid=False,
            rejection_code=RejectionCode.LOW_CONFIDENCE,
            rejection_reason=f"Finding confidence score ({finding.confidence:.2f}) is below 0.3 threshold.",
            quality_score=QualityScore(
                accuracy_score=finding.confidence,
                completeness_score=0.5,
                explanation_quality=0.5,
                overall_score=finding.confidence,
            ),
        )

    # 5. Explanation length check
    words = finding.explanation.split()
    if len(words) < 5:
        return ValidationResult(
            finding_id=finding.id,
            is_valid=False,
            rejection_code=RejectionCode.EXPLANATION_TOO_SHORT,
            rejection_reason=f"Explanation is too brief ({len(words)} words). Minimum 5 words required.",
            quality_score=QualityScore(
                accuracy_score=0.7,
                completeness_score=0.3,
                explanation_quality=0.2,
                overall_score=0.4,
            ),
        )

    # Calculate overall quality score for valid finding
    accuracy = finding.confidence
    completeness = 0.9 if len(words) >= 10 else 0.7
    exp_quality = 0.95 if len(words) >= 15 else 0.8
    overall = round((accuracy + completeness + exp_quality) / 3.0, 2)

    return ValidationResult(
        finding_id=finding.id,
        is_valid=True,
        rejection_code=RejectionCode.NONE,
        rejection_reason="",
        quality_score=QualityScore(
            accuracy_score=round(accuracy, 2),
            completeness_score=round(completeness, 2),
            explanation_quality=round(exp_quality, 2),
            overall_score=overall,
        ),
    )
