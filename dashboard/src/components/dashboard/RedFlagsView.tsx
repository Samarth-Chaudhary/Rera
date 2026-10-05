import React, { useState, useMemo } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Download, 
  ExternalLink, 
  Eye, 
  ArrowUpDown, 
  ShieldAlert, 
  AlertTriangle, 
  FileQuestion, 
  CheckCircle2 
} from 'lucide-react';
import type { NormalizedDatabase, AuditFinding, ProjectId, FormType, Severity } from '../../types';
import { formatINR } from '../../lib/formatting';
import { RiskBadge } from '../ui/RiskBadge';

interface RedFlagsViewProps {
  database: NormalizedDatabase;
  onNavigateToReconciliation: (project: ProjectId, quarter: string, form: FormType) => void;
  onViewEvidence: (url: string, finding?: AuditFinding) => void;
  onExportCSV: (findings: AuditFinding[]) => void;
}

export const RedFlagsView: React.FC<RedFlagsViewProps> = ({
  database,
  onNavigateToReconciliation,
  onViewEvidence,
  onExportCSV,
}) => {
  const { all_findings, summary } = database;

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'severity' | 'variance' | 'quarter' | 'project'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort findings
  const filteredFindings = useMemo(() => {
    return all_findings.filter(f => {
      if (f.status === 'Ignored') return false;
      if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
      if (selectedProject !== 'ALL' && f.project_id !== selectedProject) return false;
      if (selectedForm !== 'ALL' && f.form_type !== selectedForm) return false;

      if (search) {
        const q = search.toLowerCase();
        return f.project_name.toLowerCase().includes(q) ||
               f.metric.toLowerCase().includes(q) ||
               f.quarter.toLowerCase().includes(q) ||
               f.promoter.toLowerCase().includes(q) ||
               f.reason.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'severity') {
        const score = (sev: Severity) => sev === 'CRITICAL' ? 4 : sev === 'DATA GAP' ? 3 : sev === 'WARNING' ? 2 : 1;
        const diff = score(b.severity) - score(a.severity);
        return sortOrder === 'desc' ? diff : -diff;
      }
      if (sortBy === 'variance') {
        const varA = a.absolute_variance || 0;
        const varB = b.absolute_variance || 0;
        return sortOrder === 'desc' ? varB - varA : varA - varB;
      }
      if (sortBy === 'quarter') {
        return sortOrder === 'desc' ? b.sort_key - a.sort_key : a.sort_key - b.sort_key;
      }
      return a.project_name.localeCompare(b.project_name);
    });
  }, [all_findings, selectedSeverity, selectedProject, selectedForm, search, sortBy, sortOrder]);

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">
      {/* HEADER & SUMMARY COUNTERS */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>Prioritized Anomaly Matrix</span>
            </div>
            <h1 className="text-2xl font-black text-[#1E2046] tracking-tight mt-1">
              Anomaly & Red Flag Center
            </h1>
            <p className="text-xs text-[#7C8BA0] mt-1 max-w-2xl font-medium">
              Cross-reconciliation audit feed displaying all detected inconsistencies between public declarations and certified evidence.
            </p>
          </div>

          <button
            onClick={() => onExportCSV(filteredFindings)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center gap-2 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Filtered ({filteredFindings.length})</span>
          </button>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div 
            onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedSeverity === 'CRITICAL' 
                ? 'bg-rose-100/70 border-rose-300 shadow-sm' 
                : 'bg-rose-50/70 border-rose-100 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700">Critical Flags</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-2xl font-black text-rose-700 mt-1 block tabular-nums">
              {summary.total_critical}
            </span>
            <span className="text-[10px] text-rose-600/80 mt-0.5 block font-medium">&gt; ₹10 Lakh or &gt; 30 pp gap</span>
          </div>

          <div 
            onClick={() => setSelectedSeverity(selectedSeverity === 'WARNING' ? 'ALL' : 'WARNING')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedSeverity === 'WARNING' 
                ? 'bg-amber-100/70 border-amber-300 shadow-sm' 
                : 'bg-amber-50/70 border-amber-100 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">Warnings</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-amber-800 mt-1 block tabular-nums">
              {summary.total_warnings}
            </span>
            <span className="text-[10px] text-amber-700/80 mt-0.5 block font-medium">Minor variance / rounding</span>
          </div>

          <div 
            onClick={() => setSelectedSeverity(selectedSeverity === 'DATA GAP' ? 'ALL' : 'DATA GAP')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedSeverity === 'DATA GAP' 
                ? 'bg-blue-100/70 border-blue-300 shadow-sm' 
                : 'bg-blue-50/70 border-blue-100 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">Data Gaps</span>
              <FileQuestion className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-2xl font-black text-blue-800 mt-1 block tabular-nums">
              {summary.total_data_gaps}
            </span>
            <span className="text-[10px] text-blue-700/80 mt-0.5 block font-medium">Unuploaded / missing proofs</span>
          </div>

          <div 
            onClick={() => setSelectedSeverity(selectedSeverity === 'MATCH' ? 'ALL' : 'MATCH')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedSeverity === 'MATCH' 
                ? 'bg-emerald-100/70 border-emerald-300 shadow-sm' 
                : 'bg-emerald-50/70 border-emerald-100 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Matches</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-800 mt-1 block tabular-nums">
              {summary.total_matches}
            </span>
            <span className="text-[10px] text-emerald-700/80 mt-0.5 block font-medium">Validated certifications</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-clay flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-[#9CA8BC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search findings by metric, project, promoter, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFD] border border-slate-100 rounded-2xl text-xs text-[#1E2046] placeholder-[#9CA8BC] focus:outline-none focus:border-[#3B5BFD]/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Project select */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-[#1E2046] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            <option value="dream-colony">Dream Colony</option>
            <option value="ridhi-sidhi">Ridhi Sidhi Hub</option>
            <option value="shiv-enclave">Shiv Enclave</option>
          </select>

          {/* Form select */}
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-[#1E2046] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Certificates</option>
            <option value="Form R-1 (Architect)">Form R-1 (Architect)</option>
            <option value="Form R-2 (Engineer)">Form R-2 (Engineer)</option>
            <option value="Form R-3 Table 1 (Cost Audit)">Form R-3 Table 1 (Cost)</option>
            <option value="Form R-3 Table 2 (Escrow Compliance)">Form R-3 Table 2 (Escrow)</option>
          </select>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-[#7C8BA0] hover:text-[#1E2046] transition-colors cursor-pointer"
              title={`Sort direction: ${sortOrder.toUpperCase()} (Click to toggle)`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#1E2046] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="severity">Severity</option>
              <option value="variance">Discrepancy Magnitude</option>
              <option value="quarter">Quarter Date</option>
              <option value="project">Project Name</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-1.5 py-0.5 rounded text-[10px] font-black bg-white text-[#1E2046] cursor-pointer uppercase shadow-sm border border-slate-100"
              title="Toggle sort direction"
            >
              {sortOrder}
            </button>
          </div>
        </div>
      </div>

      {/* RED FLAG AUDIT TABLE */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 text-[#7C8BA0] font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Project & Quarter</th>
                <th className="py-3 px-3">Certificate & Metric</th>
                <th className="py-3 px-3 text-right">Web Declared</th>
                <th className="py-3 px-3 text-right">Certified Legal</th>
                <th className="py-3 px-3 text-right">Discrepancy</th>
                <th className="py-3 px-3">Violation Reason</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFindings.map((finding) => {
                const isCurrency = finding.unit === '₹';
                return (
                  <tr key={finding.id} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="py-3.5 px-3">
                      <RiskBadge severity={finding.severity} status={finding.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#1E2046] block">{finding.project_name}</span>
                      <span className="text-[11px] text-[#7C8BA0] font-medium block">{finding.quarter}</span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <span className="font-semibold text-[#1E2046] block truncate" title={finding.metric}>
                        {finding.metric}
                      </span>
                      <span className="text-[10px] text-[#7C8BA0] block">
                        {finding.form_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums font-mono text-[#7C8BA0]">
                      {isCurrency ? formatINR(finding.web_val) : `${finding.web_val}%`}
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums font-mono text-[#1E2046] font-semibold">
                      {isCurrency ? formatINR(finding.pdf_val) : finding.pdf_val !== null ? `${finding.pdf_val}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums font-bold">
                      {finding.absolute_variance !== null ? (
                        <span className={finding.severity === 'CRITICAL' ? 'text-rose-600' : 'text-[#1E2046]'}>
                          {isCurrency ? formatINR(finding.absolute_variance) : `${finding.absolute_variance?.toFixed(1)} pp`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3.5 px-3 text-[#7C8BA0] max-w-md truncate" title={finding.reason}>
                      {finding.reason}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {finding.document_url && finding.document_url.startsWith('http') && (
                          <button
                            onClick={() => onViewEvidence(finding.document_url, finding)}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3B5BFD] border border-slate-200 shadow-sm transition-colors"
                            title="Open Cloud Certificate"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onNavigateToReconciliation(finding.project_id, finding.quarter, finding.form_type)}
                          className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1E2046] border border-slate-200 shadow-sm transition-colors"
                          title="Open in Reconciliation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
