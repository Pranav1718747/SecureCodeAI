import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vulnerability, Patch } from '../../../types/scan';
import { Shield, Zap, AlertTriangle, TrendingDown, Activity, Lock, ShieldCheck, Target } from 'lucide-react';

interface SimulationNode {
  label: string;
  detail?: string;
}

interface SimulationData {
  title: string;
  before: SimulationNode[];
  after: SimulationNode[];
  risk_before: number;
  risk_after: number;
  attack_success_before: number;
  attack_success_after: number;
  owasp: string;
  cwe: string;
  malicious_input: string;
  impact: string;
}

function generateSimulation(vuln: Vulnerability, _patch: Patch | null): SimulationData {
  const cwe = vuln.cwe_id?.toUpperCase() || '';
  const title = vuln.title?.toLowerCase() || '';
  const desc = vuln.description?.toLowerCase() || '';

  // SQL Injection
  if (cwe.includes('89') || title.includes('sql') || desc.includes('sql injection')) {
    return {
      title: 'SQL Injection',
      before: [
        { label: 'User Input', detail: "' OR 1=1 --" },
        { label: 'String Concatenation', detail: 'query = "SELECT * FROM users WHERE id=" + input' },
        { label: 'Database Query', detail: 'Unparameterized query sent to DB' },
        { label: 'SQL Injection', detail: 'Attacker controls query logic' },
        { label: 'Entire Database Returned', detail: 'All rows exfiltrated' },
      ],
      after: [
        { label: 'User Input', detail: "' OR 1=1 --" },
        { label: 'Prepared Statement', detail: 'query = "SELECT * FROM users WHERE id=?"' },
        { label: 'Parameter Binding', detail: 'Input treated as data, not code' },
        { label: 'Database Query', detail: 'Safe parameterized query' },
      ],
      risk_before: 96, risk_after: 8,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A03:2021', cwe: 'CWE-89',
      malicious_input: "' OR 1=1 --",
      impact: 'Complete database compromise',
    };
  }

  // XSS
  if (cwe.includes('79') || title.includes('xss') || title.includes('cross-site') || title.includes('cross site')) {
    return {
      title: 'Cross-Site Scripting',
      before: [
        { label: 'User Input', detail: '<script>steal(document.cookie)</script>' },
        { label: 'innerHTML Assignment', detail: 'element.innerHTML = userInput' },
        { label: 'Browser Executes Script', detail: 'Malicious JS runs in victim context' },
        { label: 'Cookie Theft', detail: 'Session token exfiltrated to attacker' },
        { label: 'Account Takeover', detail: 'Attacker impersonates victim' },
      ],
      after: [
        { label: 'User Input', detail: '<script>steal(document.cookie)</script>' },
        { label: 'textContent / Escaping', detail: 'HTML entities escaped automatically' },
        { label: 'Safe Rendered Output', detail: 'Script displayed as text, not executed' },
        { label: 'Session Protected', detail: 'No code execution possible' },
      ],
      risk_before: 88, risk_after: 6,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A03:2021', cwe: 'CWE-79',
      malicious_input: '<script>steal(document.cookie)</script>',
      impact: 'Session hijacking & cookie theft',
    };
  }

  // Hardcoded Credentials
  if (cwe.includes('798') || cwe.includes('259') || title.includes('hardcoded') || title.includes('credential') || title.includes('secret') || title.includes('password')) {
    return {
      title: 'Hardcoded Credentials',
      before: [
        { label: 'Source Code', detail: 'api_key = "sk-live-abc123..."' },
        { label: 'Public Repository', detail: 'Pushed to GitHub/GitLab' },
        { label: 'Secret Scanner', detail: 'Automated bots detect exposed keys' },
        { label: 'Attacker Extracts Key', detail: 'Token harvested from commit history' },
        { label: 'Unauthorized Cloud Access', detail: 'Full API access granted' },
      ],
      after: [
        { label: 'Environment Variable', detail: 'api_key = os.getenv("API_KEY")' },
        { label: 'Secret Manager', detail: 'Vault / AWS SSM / .env (gitignored)' },
        { label: 'Runtime Injection', detail: 'Secrets loaded at startup, never in code' },
        { label: 'Repository Safe', detail: 'No credentials in version control' },
      ],
      risk_before: 94, risk_after: 10,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A02:2021', cwe: 'CWE-798',
      malicious_input: 'git log --all -p | grep "password"',
      impact: 'Full cloud infrastructure compromise',
    };
  }

  // Command Injection
  if (cwe.includes('78') || cwe.includes('77') || title.includes('command') || title.includes('injection') || title.includes('exec') || title.includes('eval') || desc.includes('code injection')) {
    return {
      title: 'Command / Code Injection',
      before: [
        { label: 'User Input', detail: '; rm -rf / --no-preserve-root' },
        { label: 'exec() / eval()', detail: 'Unsanitized input passed to interpreter' },
        { label: 'Shell Execution', detail: 'OS command runs with app privileges' },
        { label: 'Remote Code Execution', detail: 'Attacker gains shell access' },
        { label: 'System Compromise', detail: 'Full server takeover' },
      ],
      after: [
        { label: 'User Input', detail: '; rm -rf / --no-preserve-root' },
        { label: 'Input Validation', detail: 'Strict allowlist applied' },
        { label: 'Safe API Call', detail: 'subprocess with shell=False' },
        { label: 'Execution Blocked', detail: 'Only approved operations permitted' },
      ],
      risk_before: 98, risk_after: 5,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A03:2021', cwe: 'CWE-78',
      malicious_input: '; rm -rf / --no-preserve-root',
      impact: 'Remote code execution on server',
    };
  }

  // Path Traversal
  if (cwe.includes('22') || title.includes('path') || title.includes('traversal') || title.includes('directory')) {
    return {
      title: 'Path Traversal',
      before: [
        { label: 'User Input', detail: '../../etc/passwd' },
        { label: 'File System Access', detail: 'open(base_dir + user_input)' },
        { label: 'Directory Escape', detail: 'Path resolves outside intended directory' },
        { label: 'Sensitive File Read', detail: '/etc/passwd or config files exposed' },
        { label: 'Data Exfiltration', detail: 'Server secrets leaked' },
      ],
      after: [
        { label: 'User Input', detail: '../../etc/passwd' },
        { label: 'Canonical Path Resolution', detail: 'os.path.realpath() applied' },
        { label: 'Path Validation', detail: 'Resolved path checked against allowed directory' },
        { label: 'Access Restricted', detail: 'Request denied if outside boundary' },
      ],
      risk_before: 82, risk_after: 8,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A01:2021', cwe: 'CWE-22',
      malicious_input: '../../etc/passwd',
      impact: 'Arbitrary file read from server',
    };
  }

  // Generic Fallback
  return {
    title: vuln.title || 'Security Vulnerability',
    before: [
      { label: 'Malicious Input', detail: 'Attacker-crafted payload' },
      { label: 'Missing Validation', detail: 'No input sanitization' },
      { label: 'Vulnerable Code Path', detail: vuln.file_path?.split('/').pop() || 'target.py' },
      { label: 'Exploitation', detail: vuln.description?.slice(0, 60) || 'Security control bypassed' },
      { label: 'Attack Successful', detail: 'System compromised' },
    ],
    after: [
      { label: 'Malicious Input', detail: 'Attacker-crafted payload' },
      { label: 'Input Validation', detail: 'Strict sanitization applied' },
      { label: 'Secure Code Path', detail: 'AI-patched implementation' },
      { label: 'Attack Blocked', detail: 'Exploit attempt neutralized' },
    ],
    risk_before: 85, risk_after: 12,
    attack_success_before: 100, attack_success_after: 0,
    owasp: vuln.owasp_category || 'A03:2021',
    cwe: vuln.cwe_id || 'CWE-Unknown',
    malicious_input: 'Attacker-crafted payload',
    impact: vuln.description?.slice(0, 80) || 'Security vulnerability exploited',
  };
}

const AttackNode = ({
  node,
  index,
  isActive,
  isPassed,
  isLast,
  variant,
}: {
  node: SimulationNode;
  index: number;
  isActive: boolean;
  isPassed: boolean;
  isLast: boolean;
  variant: 'before' | 'after';
}) => {
  const isBlocked = variant === 'after' && isLast;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex flex-col items-center font-sans"
    >
      <div className="relative">
        <motion.div
          className={`
            relative w-full min-w-[160px] max-w-[200px] px-4 py-3 rounded-2xl border text-center transition-all duration-300
            ${
              isActive
                ? variant === 'before'
                  ? 'border-[#F05B68] bg-[#F05B68]/15 shadow-[0_0_25px_rgba(240,91,104,0.3)]'
                  : isBlocked
                  ? 'border-[#18E6A8] bg-[#18E6A8]/15 shadow-[0_0_25px_rgba(24,230,168,0.3)]'
                  : 'border-[#F05B68] bg-[#F05B68]/15 shadow-[0_0_25px_rgba(240,91,104,0.3)]'
                : isPassed
                ? variant === 'before'
                  ? 'border-[#F05B68]/30 bg-[#F05B68]/10'
                  : isBlocked
                  ? 'border-[#18E6A8]/30 bg-[#18E6A8]/10'
                  : 'border-white/[0.08] bg-[#151E2D]'
                : 'border-white/[0.06] bg-[#111827]'
            }
          `}
          animate={isActive ? { scale: [1, 1.03, 1] } : {}}
          transition={isActive ? { duration: 1.2, repeat: Infinity } : {}}
        >
          {isActive && (
            <motion.div
              className={`absolute inset-0 rounded-2xl ${
                isBlocked ? 'bg-[#18E6A8]/10' : 'bg-[#F05B68]/10'
              }`}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <p
            className={`text-xs font-bold relative z-10 ${
              isActive
                ? isBlocked
                  ? 'text-[#18E6A8]'
                  : 'text-[#F05B68]'
                : isPassed
                ? isBlocked
                  ? 'text-[#18E6A8]'
                  : 'text-[#F8FAFC]'
                : 'text-[#64748B]'
            }`}
          >
            {isBlocked && isPassed ? '🛡️ ' : ''}
            {node.label}
          </p>
          {node.detail && (
            <p
              className={`text-[10px] mt-1 font-mono relative z-10 ${
                isActive ? 'text-[#F8FAFC]' : isPassed ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              {node.detail.length > 45 ? node.detail.slice(0, 42) + '...' : node.detail}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const AttackPacket = ({
  progress,
  variant,
  blocked,
}: {
  progress: number;
  variant: 'before' | 'after';
  blocked: boolean;
}) => {
  if (blocked && variant === 'after') {
    return (
      <motion.div
        className="absolute z-30"
        style={{ top: `${progress}%`, left: '50%', transform: 'translateX(-50%)' }}
        initial={{ scale: 1 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#F05B68] rounded-full"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((i * Math.PI) / 4) * 30,
              y: Math.sin((i * Math.PI) / 4) * 30,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute z-30"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
      animate={{ top: `${progress}%` }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <div className="w-4 h-4 rounded-full bg-[#F05B68] shadow-[0_0_15px_rgba(240,91,104,0.8),0_0_30px_rgba(240,91,104,0.4)]" />
        <motion.div
          className="absolute inset-0 rounded-full bg-[#F05B68]"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};

const ShieldAnimation = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <motion.div
      className="absolute z-40 flex items-center justify-center"
      style={{ left: '50%', transform: 'translateX(-50%)', bottom: '8%' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-[#18E6A8]/20"
          style={{ width: 80, height: 80, marginLeft: -16, marginTop: -16 }}
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="w-12 h-12 rounded-2xl bg-[#18E6A8]/20 border-2 border-[#18E6A8] flex items-center justify-center shadow-[0_0_30px_rgba(24,230,168,0.5)]">
          <Shield className="w-6 h-6 text-[#18E6A8]" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const FlowPanel = ({
  nodes,
  variant,
  isPlaying,
  onComplete,
}: {
  nodes: SimulationNode[];
  variant: 'before' | 'after';
  isPlaying: boolean;
  onComplete: () => void;
}) => {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showShield, setShowShield] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const totalNodes = nodes.length;
  const lastIdx = totalNodes - 1;
  const shieldIdx = variant === 'after' ? lastIdx : -1;

  useEffect(() => {
    if (!isPlaying) {
      setActiveIdx(-1);
      setShowShield(false);
      setShowResult(false);
      setBlocked(false);
      return;
    }

    setActiveIdx(-1);
    setShowShield(false);
    setShowResult(false);
    setBlocked(false);

    const timers: ReturnType<typeof setTimeout>[] = [];

    nodes.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveIdx(i);

          if (variant === 'after' && i === shieldIdx) {
            setTimeout(() => {
              setShowShield(true);
              setBlocked(true);
              setTimeout(() => {
                setShowResult(true);
                onComplete();
              }, 800);
            }, 400);
          } else if (variant === 'before' && i === lastIdx) {
            setTimeout(() => {
              setShowResult(true);
              onComplete();
            }, 600);
          }
        }, (i + 1) * 700)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  const packetProgress =
    activeIdx < 0 ? 0 : (activeIdx / Math.max(totalNodes - 1, 1)) * 85 + 6;

  const isBeforeSuccess = variant === 'before';

  return (
    <div className="flex-1 min-w-0 font-sans">
      <div
        className={`text-center mb-4 pb-3 border-b ${
          isBeforeSuccess ? 'border-[#F05B68]/20' : 'border-[#18E6A8]/20'
        }`}
      >
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${
            isBeforeSuccess ? 'text-[#F05B68]' : 'text-[#18E6A8]'
          }`}
        >
          {isBeforeSuccess ? '⚠ Before Patch' : '✓ After Patch'}
        </span>
      </div>

      <div className="relative flex flex-col items-center gap-2 py-4 min-h-[380px]">
        {isPlaying && activeIdx >= 0 && !blocked && (
          <AttackPacket progress={packetProgress} variant={variant} blocked={false} />
        )}
        {blocked && <AttackPacket progress={packetProgress} variant={variant} blocked={true} />}

        {variant === 'after' && <ShieldAnimation visible={showShield} />}

        {nodes.map((node, i) => (
          <div key={i} className="flex flex-col items-center">
            <AttackNode
              node={node}
              index={i}
              isActive={activeIdx === i}
              isPassed={activeIdx >= i}
              isLast={i === lastIdx}
              variant={variant}
            />
            {i < lastIdx && (
              <motion.div
                className="flex flex-col items-center my-1"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: activeIdx >= i ? 1 : 0.3,
                }}
              >
                <div
                  className={`w-0.5 h-4 ${
                    activeIdx >= i
                      ? variant === 'after' && i >= lastIdx - 1
                        ? 'bg-[#18E6A8]/60'
                        : 'bg-[#F05B68]/60'
                      : 'bg-[#151E2D]'
                  }`}
                />
                <div
                  className={`w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${
                    activeIdx >= i
                      ? variant === 'after' && i >= lastIdx - 1
                        ? 'border-t-[#18E6A8]/60'
                        : 'border-t-[#F05B68]/60'
                      : 'border-t-[#151E2D]'
                  }`}
                />
              </motion.div>
            )}
          </div>
        ))}

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`mt-3 px-5 py-2.5 rounded-xl text-xs font-mono font-bold ${
                isBeforeSuccess
                  ? 'bg-[#F05B68]/15 text-[#F05B68] border border-[#F05B68]/30 shadow-[0_0_20px_rgba(240,91,104,0.2)]'
                  : 'bg-[#18E6A8]/15 text-[#18E6A8] border border-[#18E6A8]/30 shadow-[0_0_20px_rgba(24,230,168,0.2)]'
              }`}
            >
              {isBeforeSuccess ? '✗ Attack Successful' : '✓ Attack Blocked'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AnimatedCounter = ({
  from,
  to,
  duration = 1.5,
  suffix = '',
  delay = 0,
}: {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  delay?: number;
}) => {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;
      const frame = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (endTime - startTime), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(from + (to - from) * eased));
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [from, to, duration, delay]);

  return (
    <span>
      {value}
      {suffix}
    </span>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  fromValue,
  toValue,
  fromLabel,
  toLabel,
  fromColor,
  toColor,
  delay,
  suffix = '',
}: {
  icon: any;
  label: string;
  fromValue?: number;
  toValue?: number;
  fromLabel?: string;
  toLabel?: string;
  fromColor: string;
  toColor: string;
  delay: number;
  suffix?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-4 flex flex-col transition-all duration-200"
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-[#18E6A8]" />
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </span>
    </div>
    <div className="flex items-center justify-between font-mono">
      <div className="text-center">
        <p className={`text-xl font-bold ${fromColor}`}>
          {fromValue !== undefined ? (
            <AnimatedCounter from={0} to={fromValue} delay={delay} suffix={suffix} />
          ) : (
            fromLabel
          )}
        </p>
        <p className="text-[9px] text-[#94A3B8] uppercase mt-0.5 font-bold">Before</p>
      </div>
      <motion.div
        className="flex-1 mx-3 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        <div className="w-full h-px bg-gradient-to-r from-[#F05B68]/40 via-white/[0.08] to-[#18E6A8]/40" />
        <TrendingDown className="h-3.5 w-3.5 text-[#18E6A8] -ml-1 shrink-0" />
      </motion.div>
      <div className="text-center">
        <p className={`text-xl font-bold ${toColor}`}>
          {toValue !== undefined ? (
            <AnimatedCounter from={fromValue || 100} to={toValue} delay={delay + 0.8} suffix={suffix} />
          ) : (
            toLabel
          )}
        </p>
        <p className="text-[9px] text-[#94A3B8] uppercase mt-0.5 font-bold">After</p>
      </div>
    </div>
  </motion.div>
);

interface AttackSimulationTabProps {
  vuln: Vulnerability;
  patch: Patch | null;
}

export const AttackSimulationTab = ({ vuln, patch }: AttackSimulationTabProps) => {
  const sim = useMemo(() => generateSimulation(vuln, patch), [vuln, patch]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beforeDone, setBeforeDone] = useState(false);
  const [afterDone, setAfterDone] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const handleReplay = useCallback(() => {
    setBeforeDone(false);
    setAfterDone(false);
    setShowMetrics(false);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsPlaying(true), 400);
    return () => clearTimeout(timer);
  }, [vuln.id]);

  useEffect(() => {
    if (beforeDone && afterDone) {
      setTimeout(() => setShowMetrics(true), 300);
    }
  }, [beforeDone, afterDone]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto custom-scrollbar pb-24 font-sans text-[#F8FAFC]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#F05B68]/10 rounded-2xl border border-[#F05B68]/20">
            <Target className="h-6 w-6 text-[#F05B68]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC]">{sim.title} — Attack Simulation</h2>
            <div className="flex items-center gap-3 mt-1 font-mono text-xs">
              <span className="text-[#FBBF24] bg-[#FBBF24]/10 px-2.5 py-0.5 rounded-full border border-[#FBBF24]/20 font-bold">
                {sim.owasp}
              </span>
              <span className="text-[#18E6A8] bg-[#18E6A8]/10 px-2.5 py-0.5 rounded-full border border-[#18E6A8]/20 font-bold">
                {sim.cwe}
              </span>
              <span className="text-[#94A3B8]">{sim.impact}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-[#151E2D] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] border border-white/[0.08] transition-colors"
        >
          <Zap className="h-3.5 w-3.5 text-[#18E6A8]" />
          Replay Simulation
        </button>
      </motion.div>

      {/* Malicious Input Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#F05B68]/10 border border-[#F05B68]/20 rounded-2xl px-5 py-3 flex items-center gap-3"
      >
        <AlertTriangle className="h-4 w-4 text-[#F05B68] shrink-0" />
        <div>
          <span className="text-[10px] text-[#F05B68] font-mono font-bold uppercase tracking-wider">
            Malicious Input Payload
          </span>
          <p className="text-xs font-mono text-[#F8FAFC] mt-0.5">{sim.malicious_input}</p>
        </div>
      </motion.div>

      {/* Side-by-Side Attack Flow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="bg-[#111827] border border-white/[0.08] hover:border-[#18E6A8]/30 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all duration-200"
      >
        <div className="flex gap-6">
          <FlowPanel
            nodes={sim.before}
            variant="before"
            isPlaying={isPlaying}
            onComplete={() => setBeforeDone(true)}
          />
          <div className="w-px bg-white/[0.08] shrink-0" />
          <FlowPanel
            nodes={sim.after}
            variant="after"
            isPlaying={isPlaying}
            onComplete={() => setAfterDone(true)}
          />
        </div>
      </motion.div>

      {/* Security Metrics */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <MetricCard
              icon={Activity}
              label="Risk Score"
              fromValue={sim.risk_before}
              toValue={sim.risk_after}
              fromColor="text-[#F05B68]"
              toColor="text-[#18E6A8]"
              delay={0}
            />
            <MetricCard
              icon={Target}
              label="Attack Success Rate"
              fromValue={sim.attack_success_before}
              toValue={sim.attack_success_after}
              fromColor="text-[#F05B68]"
              toColor="text-[#18E6A8]"
              delay={0.1}
              suffix="%"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Exploitability"
              fromLabel="Critical"
              toLabel="Mitigated"
              fromColor="text-[#F05B68]"
              toColor="text-[#18E6A8]"
              delay={0.2}
            />
            <MetricCard
              icon={Zap}
              label="Financial Risk"
              fromLabel="High"
              toLabel="Low"
              fromColor="text-[#FBBF24]"
              toColor="text-[#18E6A8]"
              delay={0.3}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Validation"
              fromLabel="—"
              toLabel="Passed"
              fromColor="text-[#64748B]"
              toColor="text-[#18E6A8]"
              delay={0.4}
            />
            <MetricCard
              icon={Lock}
              label="Confidence"
              fromLabel="—"
              toLabel="High"
              fromColor="text-[#64748B]"
              toColor="text-[#18E6A8]"
              delay={0.5}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
