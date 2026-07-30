import { Vulnerability, Patch } from '../../types/scan';
import { CodeViewer } from './CodeViewer';
import { PatchViewer } from './PatchViewer';
import { InsightPanel } from './InsightPanel';
import { CompletedTimeline } from './CompletedTimeline';
import { ActionToolbar } from './ActionToolbar';
import { ShieldAlert, AlertCircle, Target, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailPanelProps {
  vuln: Vulnerability;
  patch?: Patch;
  isGeneratingPatch: boolean;
  onGeneratePatch: (id: string) => void;
}

export const DetailPanel = ({ vuln, patch, isGeneratingPatch, onGeneratePatch }: DetailPanelProps) => {
  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative shadow-lg">
      <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-10 sticky top-0">
        <motion.h2 
          key={vuln.id}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {vuln.title}
        </motion.h2>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <AlertCircle className="h-4 w-4" />
            CWE-{vuln.cwe_id}
          </span>
          <span className="font-mono text-xs">{vuln.file_path}:{vuln.line_start}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={vuln.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 flex flex-col xl:flex-row gap-8"
          >
            {/* Left Content Column */}
            <div className="flex-1 space-y-8 min-w-0">
              
              {/* Description & Impact */}
              <section className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                      Issue Description
                    </h3>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {vuln.description}
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-400" />
                      Attack Scenario (AI Inferred)
                    </h3>
                    <div className="text-slate-300 text-sm leading-relaxed">
                      An attacker could exploit this vulnerability to gain unauthorized access, leak sensitive information, or disrupt service availability. This is a common pattern for CWE-{vuln.cwe_id} vulnerabilities.
                    </div>
                  </div>
                </div>
              </section>

              {/* Code Snippet */}
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vulnerable Code</h3>
                <CodeViewer 
                  code={vuln.snippet}
                  language="javascript"
                  filePath={vuln.file_path}
                  startingLineNumber={Math.max(1, vuln.line_start - 3)} 
                  highlightLine={vuln.line_start}
                />
              </section>

              {/* Patch Section */}
              {patch && (
                <section>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 border-t border-slate-800"
                  >
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      AI Generated Fix
                    </h3>
                    
                    <div className="mb-4 text-slate-300 text-sm bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/50 leading-relaxed shadow-inner">
                      {patch.explanation}
                    </div>
                    
                    <PatchViewer diffContent={patch.diff_content} />
                  </motion.div>
                </section>
              )}
              
            </div>

            {/* Right Context Column */}
            <div className="w-full xl:w-80 flex flex-col gap-6 flex-shrink-0">
              <InsightPanel vuln={vuln} />
              <CompletedTimeline />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ActionToolbar 
        hasPatch={!!patch}
        isGenerating={isGeneratingPatch}
        onGenerate={() => onGeneratePatch(vuln.id)}
        onApply={() => {}}
        onReject={() => {}}
      />
    </div>
  );
};
