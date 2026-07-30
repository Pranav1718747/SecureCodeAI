import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scanService } from '../services/scanService';
import { patchService } from '../services/patchService';
import { Scan, Vulnerability, Patch } from '../types/scan';
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle, Wand2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export const ReviewPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [scan, setScan] = useState<Scan | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [patches, setPatches] = useState<Record<string, Patch>>({});
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatching, setIsPatching] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scanId) {
      fetchData();
    }
  }, [scanId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (!scanId) return;
      
      const [scanData, vulnsData] = await Promise.all([
        scanService.getScan(scanId),
        scanService.getVulnerabilities(scanId)
      ]);
      
      setScan(scanData);
      setVulnerabilities(vulnsData.results);
      
      if (vulnsData.results.length > 0) {
        setSelectedVuln(vulnsData.results[0]);
        // Fetch patches for all vulns (simplification for MVP)
        const patchesData = await patchService.getPatches();
        const patchesMap: Record<string, Patch> = {};
        patchesData.results.forEach(p => {
          patchesMap[p.vulnerability] = p;
        });
        setPatches(patchesMap);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePatch = async (vulnId: string) => {
    try {
      setIsPatching(prev => ({ ...prev, [vulnId]: true }));
      await patchService.generatePatch(vulnId);
      // In a real app we'd poll or use websockets. For MVP, we wait a bit then refresh
      setTimeout(() => {
        fetchData();
        setIsPatching(prev => ({ ...prev, [vulnId]: false }));
      }, 5000);
    } catch (err) {
      alert('Failed to generate patch');
      setIsPatching(prev => ({ ...prev, [vulnId]: false }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center h-64 items-center"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>;
  }

  if (!scan) return <div>Scan not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/repository/${scan.repository}`} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Scan Review
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              scan.status === 'COMPLETED' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {scan.status}
            </span>
          </h1>
          <p className="text-sm text-slate-400">Found {vulnerabilities.length} vulnerabilities on branch {scan.branch_name}</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar - Vulnerability List */}
        <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Vulnerabilities</h2>
          </div>
          <div className="divide-y divide-slate-800/50 flex-1 overflow-y-auto">
            {vulnerabilities.map(vuln => (
              <button
                key={vuln.id}
                onClick={() => setSelectedVuln(vuln)}
                className={clsx(
                  "w-full text-left p-4 hover:bg-slate-800/50 transition-colors",
                  selectedVuln?.id === vuln.id ? "bg-slate-800/80 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    vuln.severity === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                    vuln.severity === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                    vuln.severity === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {vuln.severity}
                  </span>
                  {patches[vuln.id] && <span title="Patch Available"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>}
                </div>
                <h3 className="font-medium text-slate-200 text-sm mb-1">{vuln.title}</h3>
                <p className="text-xs text-slate-500 truncate">{vuln.file_path}:{vuln.line_start}</p>
              </button>
            ))}
            {vulnerabilities.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No vulnerabilities found!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Vulnerability Details & Patching */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {selectedVuln ? (
            <>
              <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{selectedVuln.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      CWE-{selectedVuln.cwe_id}
                    </span>
                    <span>{selectedVuln.file_path}:{selectedVuln.line_start}</span>
                  </div>
                </div>
                {!patches[selectedVuln.id] && (
                  <button
                    onClick={() => handleGeneratePatch(selectedVuln.id)}
                    disabled={isPatching[selectedVuln.id]}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isPatching[selectedVuln.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Generate Patch
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                  <div className="text-slate-300 text-sm whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800">
                    {selectedVuln.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Vulnerable Code snippet</h3>
                  <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <code className="text-sm text-red-400">{selectedVuln.snippet}</code>
                  </pre>
                </div>

                {patches[selectedVuln.id] && (
                  <div className="mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      AI Generated Patch
                    </h3>
                    <div className="mb-4 text-slate-300 text-sm bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50">
                      {patches[selectedVuln.id].explanation}
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-lg border border-emerald-900/50 overflow-x-auto">
                      <code className="text-sm text-emerald-400">{patches[selectedVuln.id].diff_content}</code>
                    </pre>
                    <div className="mt-4 flex justify-end gap-3">
                      <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium transition-colors">
                        Reject Patch
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium transition-colors">
                        Apply to Repository
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a vulnerability to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
