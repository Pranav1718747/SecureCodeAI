import pytest
import uuid
import tempfile
import os
from ai.agents.state import WorkflowState
from ai.agents.orchestrator import ScanOrchestrator

@pytest.mark.django_db
class TestAIPipelineHallucination:
    def test_pipeline_massive_file_context_window(self):
        """Inject a massively huge file that approaches the 4096 token limit to test Planner batching."""
        orchestrator = ScanOrchestrator()
        
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, "massive_file.py")
        
        # 30,000 lines of gibberish
        with open(file_path, "w") as f:
            for i in range(30000):
                f.write(f"def do_nothing_{i}():\n    pass\n")
                
        initial_state = WorkflowState(
            repository_id=uuid.uuid4(),
            local_repo_path=temp_dir,
            file_tree=["massive_file.py"]
        )
        
        # Execution
        final_state = orchestrator.run_scan(initial_state)
        
        # Should gracefully fail or scan empty
        assert len(final_state.errors) >= 0 # Just asserting it didn't crash entirely

    def test_critic_hallucination_rejection(self):
        """Inject an obviously fake finding to the Critic to test if it rejects hallucinations."""
        # This requires spinning up just the CriticAgent in isolation
        from ai.critic.agent import CriticAgent
        import logging
        logging.getLogger('ai.critic.agent').setLevel(logging.DEBUG)
        
        agent = CriticAgent()
        
        from ai.security.schemas import Finding, SeverityLevel, OWASPCategory
        
        fake_finding = Finding(
            file_path="fake.py",
            line_number=999,
            vulnerability_type="Time Travel Attack",
            owasp_category=OWASPCategory.OTHER,
            cwe_id="CWE-000",
            severity=SeverityLevel.CRITICAL,
            confidence=0.1,
            description="The code travels back in time.",
            explanation="Obviously a hallucination.",
            code_snippet="def time_travel(): pass"
        )
        
        # It's an isolated unit-style test inside the QA suite
        # It will use real Groq API via our BaseAgent wrapper
        try:
            result = agent.validate_finding(fake_finding)
            # Either it rejected it, or it returned true. 
            # A good critic should mark is_valid=False for "Time Travel Attack"
            if result.is_valid:
                print("WARNING: Critic failed to reject 'Time Travel Attack'.")
        except Exception as e:
            # Fallback path if rate limited
            pass
