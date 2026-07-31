import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vulnerability, Patch } from '../../../types/scan';
import { Shield, Zap, AlertTriangle, TrendingDown, Activity, Lock, ShieldCheck, Target } from 'lucide-react';

// ─── SIMULATION DATA GENERATOR ──────────────────────────

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
      malicious_input: "; rm -rf / --no-preserve-root",
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

  // SSRF
  if (cwe.includes('918') || title.includes('ssrf') || title.includes('server-side request')) {
    return {
      title: 'Server-Side Request Forgery',
      before: [
        { label: 'User Input', detail: 'http://169.254.169.254/metadata' },
        { label: 'Server Fetches URL', detail: 'requests.get(user_url)' },
        { label: 'Internal Network Access', detail: 'Request reaches cloud metadata service' },
        { label: 'Credential Harvest', detail: 'IAM tokens and secrets returned' },
        { label: 'Cloud Compromise', detail: 'Lateral movement into infrastructure' },
      ],
      after: [
        { label: 'User Input', detail: 'http://169.254.169.254/metadata' },
        { label: 'URL Allowlist', detail: 'Only approved domains permitted' },
        { label: 'IP Validation', detail: 'Private/internal IPs rejected' },
        { label: 'Request Blocked', detail: 'SSRF attempt denied before fetch' },
      ],
      risk_before: 90, risk_after: 7,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A10:2021', cwe: 'CWE-918',
      malicious_input: 'http://169.254.169.254/latest/meta-data/',
      impact: 'Cloud infrastructure credential theft',
    };
  }

  // Insecure Deserialization
  if (cwe.includes('502') || title.includes('deserialization') || title.includes('pickle') || title.includes('yaml.load')) {
    return {
      title: 'Insecure Deserialization',
      before: [
        { label: 'Malicious Payload', detail: 'Crafted serialized object' },
        { label: 'Unsafe Deserializer', detail: 'pickle.loads() / yaml.load()' },
        { label: 'Object Instantiation', detail: 'Arbitrary class instantiated' },
        { label: 'Remote Code Execution', detail: '__reduce__ gadget chain fires' },
        { label: 'System Compromise', detail: 'Attacker code runs on server' },
      ],
      after: [
        { label: 'Malicious Payload', detail: 'Crafted serialized object' },
        { label: 'Safe Deserializer', detail: 'yaml.safe_load() / JSON parsing' },
        { label: 'Type Restriction', detail: 'Only primitive types allowed' },
        { label: 'Gadget Chain Blocked', detail: 'No arbitrary object instantiation' },
      ],
      risk_before: 92, risk_after: 6,
      attack_success_before: 100, attack_success_after: 0,
      owasp: 'A08:2021', cwe: 'CWE-502',
      malicious_input: 'b"\\x80\\x04\\x95..."  (crafted pickle)',
      impact: 'Remote code execution via deserialization',
    };
  }

  // Generic fallback from vuln metadata
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

// ─── ANIMATED NODE ──────────────────────────────────────

const AttackNode = ({ node, index, isActive, isPassed, isLast, variant }: {
  node: SimulationNode;
  index: number;
  isActive: boolean;
  isPassed: boolean;
  isLast: boolean;
  variant: 'before' | 'after';
}) => {
  const isBlocked = variant === 'after' && isLast;
  const isCompromised = variant === 'before' && isLast;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex flex-col items-center"
    >
      {/* Node */}
      <div className="relative">
        <motion.div
          className={`
            relative w-full min-w-[160px] max-w-[200px] px-4 py-3 rounded-xl border text-center transition-all duration-300
            ${isActive
              ? variant === 'before'
                ? 'border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : isBlocked
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : isPassed
                ? variant === 'before'
                  ? 'border-red-500/20 bg-red-500/5'
                  : isBlocked
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-slate-700 bg-slate-800/50'
                : 'border-slate-800 bg-slate-900/50'
            }
          `}
          animate={isActive ? { scale: [1, 1.03, 1] } : {}}
          transition={isActive ? { duration: 1.2, repeat: Infinity } : {}}
        >
          {/* Glow ring */}
          {isActive && (
            <motion.div
              className={`absolute inset-0 rounded-xl ${
                isBlocked ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          <p className={`text-xs font-bold relative z-10 ${
            isActive
              ? isBlocked ? 'text-emerald-300' : isCompromised ? 'text-red-300' : 'text-red-300'
              : isPassed
                ? isBlocked ? 'text-emerald-400/70' : 'text-slate-300'
                : 'text-slate-500'
          }`}>
            {isBlocked && isPassed ? '🛡️ ' : ''}{node.label}
          </p>
          {node.detail && (
            <p className={`text-[10px] mt-1 font-mono relative z-10 ${
              isActive ? 'text-slate-300' : isPassed ? 'text-slate-500' : 'text-slate-600'
            }`}>
              {node.detail.length > 45 ? node.detail.slice(0, 42) + '...' : node.detail}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── ATTACK PACKET ──────────────────────────────────────

const AttackPacket = ({ progress, variant, blocked }: {
  progress: number; variant: 'before' | 'after'; blocked: boolean;
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
        {/* Explosion particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(i * Math.PI / 4) * 30,
              y: Math.sin(i * Math.PI / 4) * 30,
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
        <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8),0_0_30px_rgba(239,68,68,0.4)]" />
        <motion.div
          className="absolute inset-0 rounded-full bg-red-400"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};

// ─── SHIELD ANIMATION ───────────────────────────────────

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
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/20"
          style={{ width: 80, height: 80, marginLeft: -16, marginTop: -16 }}
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Shield icon */}
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── FLOW PANEL ─────────────────────────────────────────

const FlowPanel = ({ nodes, variant, isPlaying, onComplete }: {
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
      timers.push(setTimeout(() => {
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
      }, (i + 1) * 700));
    });

    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  const packetProgress = activeIdx < 0
    ? 0
    : (activeIdx / Math.max(totalNodes - 1, 1)) * 85 + 6;

  const isBeforeSuccess = variant === 'before';

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className={`text-center mb-4 pb-3 border-b ${
        isBeforeSuccess ? 'border-red-500/20' : 'border-emerald-500/20'
      }`}>
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
          isBeforeSuccess ? 'text-red-400' : 'text-emerald-400'
        }`}>
          {isBeforeSuccess ? '⚠ Before Patch' : '✓ After Patch'}
        </span>
      </div>

      {/* Flow */}
      <div className="relative flex flex-col items-center gap-2 py-4 min-h-[380px]">
        {/* Attack packet */}
        {isPlaying && activeIdx >= 0 && !blocked && (
          <AttackPacket progress={packetProgress} variant={variant} blocked={false} />
        )}
        {blocked && (
          <AttackPacket progress={packetProgress} variant={variant} blocked={true} />
        )}

        {/* Shield */}
        {variant === 'after' && <ShieldAnimation visible={showShield} />}

        {/* Nodes */}
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
            {/* Arrow */}
            {i < lastIdx && (
              <motion.div
                className="flex flex-col items-center my-1"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: activeIdx >= i ? 1 : 0.3,
                }}
              >
                <div className={`w-0.5 h-4 ${
                  activeIdx >= i
                    ? variant === 'after' && i >= lastIdx - 1
                      ? 'bg-emerald-500/50'
                      : 'bg-red-500/50'
                    : 'bg-slate-700'
                }`} />
                <div className={`w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${
                  activeIdx >= i
                    ? variant === 'after' && i >= lastIdx - 1
                      ? 'border-t-emerald-500/50'
                      : 'border-t-red-500/50'
                    : 'border-t-slate-700'
                }`} />
              </motion.div>
            )}
          </div>
        ))}

        {/* Result label */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`mt-3 px-5 py-2.5 rounded-xl text-sm font-bold ${
                isBeforeSuccess
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
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

// ─── ANIMATED COUNTER ───────────────────────────────────

const AnimatedCounter = ({ from, to, duration = 1.5, suffix = '', delay = 0 }: {
  from: number; to: number; duration?: number; suffix?: string; delay?: number;
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

  return <span>{value}{suffix}</span>;
};

// ─── METRIC CARD ────────────────────────────────────────

const MetricCard = ({ icon: Icon, label, fromValue, toValue, fromLabel, toLabel, fromColor, toColor, delay, suffix = '' }: {
  icon: any; label: string;
  fromValue?: number; toValue?: number;
  fromLabel?: string; toLabel?: string;
  fromColor: string; toColor: string;
  delay: number; suffix?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col"
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="text-center">
        <p className={`text-xl font-bold ${fromColor}`}>
          {fromValue !== undefined ? <AnimatedCounter from={0} to={fromValue} delay={delay} suffix={suffix} /> : fromLabel}
        </p>
        <p className="text-[9px] text-slate-600 uppercase mt-0.5">Before</p>
      </div>
      <motion.div
        className="flex-1 mx-3 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        <div className="w-full h-px bg-gradient-to-r from-red-500/40 via-slate-700 to-emerald-500/40" />
        <TrendingDown className="h-3.5 w-3.5 text-emerald-500 -ml-1 shrink-0" />
      </motion.div>
      <div className="text-center">
        <p className={`text-xl font-bold ${toColor}`}>
          {toValue !== undefined ? <AnimatedCounter from={fromValue || 100} to={toValue} delay={delay + 0.8} suffix={suffix} /> : toLabel}
        </p>
        <p className="text-[9px] text-slate-600 uppercase mt-0.5">After</p>
      </div>
    </div>
  </motion.div>
);

// ─── MAIN TAB COMPONENT ─────────────────────────────────

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

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsPlaying(true), 500);
    return () => clearTimeout(timer);
  }, [vuln.id]);

  useEffect(() => {
    if (beforeDone && afterDone) {
      setTimeout(() => setShowMetrics(true), 400);
    }
  }, [beforeDone, afterDone]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto custom-scrollbar pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <Target className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{sim.title} — Attack Simulation</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{sim.owasp}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{sim.cwe}</span>
              <span className="text-[10px] text-slate-500">{sim.impact}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          Replay
        </button>
      </motion.div>

      {/* Malicious Input Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-red-500/5 border border-red-500/15 rounded-xl px-5 py-3 flex items-center gap-3"
      >
        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
        <div>
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Malicious Input</span>
          <p className="text-xs font-mono text-red-300/80 mt-0.5">{sim.malicious_input}</p>
        </div>
      </motion.div>

      {/* Side-by-Side Attack Flow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex gap-6">
          <FlowPanel
            nodes={sim.before}
            variant="before"
            isPlaying={isPlaying}
            onComplete={() => setBeforeDone(true)}
          />
          <div className="w-px bg-slate-800 shrink-0" />
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
              icon={Activity} label="Risk Score"
              fromValue={sim.risk_before} toValue={sim.risk_after}
              fromColor="text-red-400" toColor="text-emerald-400"
              delay={0}
            />
            <MetricCard
              icon={Target} label="Attack Success Rate"
              fromValue={sim.attack_success_before} toValue={sim.attack_success_after}
              fromColor="text-red-400" toColor="text-emerald-400"
              delay={0.1} suffix="%"
            />
            <MetricCard
              icon={AlertTriangle} label="Exploitability"
              fromLabel="Critical" toLabel="Mitigated"
              fromColor="text-red-400" toColor="text-emerald-400"
              delay={0.2}
            />
            <MetricCard
              icon={Zap} label="Financial Risk"
              fromLabel="High" toLabel="Low"
              fromColor="text-amber-400" toColor="text-emerald-400"
              delay={0.3}
            />
            <MetricCard
              icon={ShieldCheck} label="Validation"
              fromLabel="—" toLabel="Passed"
              fromColor="text-slate-500" toColor="text-emerald-400"
              delay={0.4}
            />
            <MetricCard
              icon={Lock} label="Confidence"
              fromLabel="—" toLabel="High"
              fromColor="text-slate-500" toColor="text-emerald-400"
              delay={0.5}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
