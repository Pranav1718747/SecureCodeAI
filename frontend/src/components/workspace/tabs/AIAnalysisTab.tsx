import { Vulnerability } from '../../../types/scan';
import { Target, AlertTriangle, Lightbulb, Shield, Code, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAnalysisTabProps {
  vuln: Vulnerability;
}

export const AIAnalysisTab = ({ vuln }: AIAnalysisTabProps) => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto custom-scrollbar pb-24">
      {/* Overview Block */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-400" />
          Detection Summary
        </h2>
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="text-sm leading-relaxed">
            The AI engine detected a potential <strong>{vuln.title}</strong> vulnerability 
            in <code>{vuln.file_path}</code> at line {vuln.line_start}. 
            This issue is classified as <span className="font-semibold text-rose-400">{vuln.severity}</span> severity 
            because it allows an attacker to manipulate the underlying execution context.
          </p>
        </div>
      </motion.div>

      {/* Exploit Walkthrough */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Crosshair className="h-4 w-4" />
          Attack Scenario
        </h3>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>How an attacker exploits it:</strong>
            <br/><br/>
            1. The application accepts untrusted input from the user without sufficient sanitization.
            <br/>
            2. The attacker injects a malicious payload containing control characters or execution directives.
            <br/>
            3. The backend system parses the payload dynamically, causing the execution of unintended commands.
            <br/>
            4. The attacker achieves code execution or data exfiltration.
          </p>
        </div>
      </motion.div>

      {/* Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Business Impact
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Exploitation of this vulnerability could lead to complete system compromise, resulting in severe data breaches, regulatory fines, and permanent reputational damage.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Compliance Impact
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Failure to remediate this issue violates SOC2 (CC6.1), PCI-DSS (Requirement 6.5), and GDPR guidelines regarding secure data processing.
          </p>
        </motion.div>
      </div>

      {/* Remediation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6"
      >
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Recommended Remediation
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Replace the dynamic execution block with a parameterized or strictly typed abstraction. Do not interpolate user input directly into executable contexts.
        </p>
        
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-mono">Secure Pattern Example</span>
            <Code className="h-4 w-4 text-slate-600" />
          </div>
          <pre className="text-sm text-emerald-400 font-mono">
            {`// Use parameterized execution
db.execute("SELECT * FROM users WHERE id = ?", [userInput]);`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
};
