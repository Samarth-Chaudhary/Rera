import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { 
  ExternalLink, 
  Search, 
  FileWarning, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import type { NormalizedDatabase } from '../../types';

interface DocumentsViewProps {
  database: NormalizedDatabase;
  onViewEvidence: (url: string) => void;
}

export const DocumentsView: FC<DocumentsViewProps> = ({ database, onViewEvidence }) => {
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'MISSING'>('ALL');
  const [search, setSearch] = useState('');

  // Extract all document records across projects and quarters
  const documents = useMemo(() => {
    const list: any[] = [];
    Object.values(database.projects).forEach(proj => {
      Object.values(proj.quarters).forEach(q => {
        if (!q.is_active) return;

        // Form R-1
        const r1Doc = q.form_r1[0]?.docs_url || '';
        const r1Missing = !r1Doc || r1Doc.toLowerCase() === 'not found' || !r1Doc.startsWith('http');
        const r1Mismatches = q.form_r1.filter(r => r.status === 'Mismatch').length;
        list.push({
          id: `DOC-R1-${proj.id}-${q.sort_key}`,
          project_id: proj.id,
          project_name: proj.name,
          quarter: q.quarter,
          sort_key: q.sort_key,
          form_name: 'Form R-1 (Architect Certificate)',
          type: 'Architect Inspection',
          is_missing: r1Missing,
          url: r1Doc,
          mismatch_count: r1Mismatches
        });

        // Form R-2
        const r2Doc = q.form_r2[0]?.docs_url || '';
        const r2Missing = !r2Doc || r2Doc.toLowerCase() === 'not found' || !r2Doc.startsWith('http');
        const r2Mismatches = q.form_r2.filter(r => r.status === 'Mismatch').length;
        list.push({
          id: `DOC-R2-${proj.id}-${q.sort_key}`,
          project_id: proj.id,
          project_name: proj.name,
          quarter: q.quarter,
          sort_key: q.sort_key,
          form_name: 'Form R-2 (Engineer Certificate)',
          type: 'Engineering Budget Audit',
          is_missing: r2Missing,
          url: r2Doc,
          mismatch_count: r2Mismatches
        });

        // Form R-3
        const r3Doc = q.form_r3_top[0]?.docs_url || '';
        const r3Missing = !r3Doc || r3Doc.toLowerCase() === 'not found' || !r3Doc.startsWith('http');
        const r3Mismatches = q.form_r3_bottom.filter(r => r.status === 'Mismatch' && !r.is_ignored).length;
        list.push({
          id: `DOC-R3-${proj.id}-${q.sort_key}`,
          project_id: proj.id,
          project_name: proj.name,
          quarter: q.quarter,
          sort_key: q.sort_key,
          form_name: 'Form R-3 (Chartered Accountant Certificate)',
          type: 'Escrow & Cost Audit',
          is_missing: r3Missing,
          url: r3Doc,
          mismatch_count: r3Mismatches
        });
      });
    });

    return list.sort((a, b) => b.sort_key - a.sort_key);
  }, [database]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (projectFilter !== 'ALL' && doc.project_id !== projectFilter) return false;
      if (statusFilter === 'AVAILABLE' && doc.is_missing) return false;
      if (statusFilter === 'MISSING' && !doc.is_missing) return false;
      if (search) {
        const q = search.toLowerCase();
        return doc.project_name.toLowerCase().includes(q) ||
               doc.quarter.toLowerCase().includes(q) ||
               doc.form_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [documents, projectFilter, statusFilter, search]);

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3B5BFD] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Government Cloud Document Repository</span>
            </div>
            <h1 className="text-2xl font-black text-[#1E2046] tracking-tight mt-1">
              Evidence & Certificate Center
            </h1>
            <p className="text-xs text-[#7C8BA0] mt-1 max-w-2xl font-medium">
              Directory of all legally certified evidence PDFs uploaded by Architects, Engineers, and CAs to the official Rajasthan RERA cloud infrastructure.
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-[#F8FAFD] border border-slate-100 text-xs font-bold text-[#1E2046]">
            Total Certificates: <strong className="text-[#3B5BFD]">{documents.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-clay flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-[#9CA8BC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search certificates by project, quarter, or form..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFD] border border-slate-100 rounded-2xl text-xs text-[#1E2046] placeholder-[#9CA8BC] focus:outline-none focus:border-[#3B5BFD]/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-[#1E2046] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            <option value="dream-colony">Dream Colony</option>
            <option value="ridhi-sidhi">Ridhi Sidhi Hub</option>
            <option value="shiv-enclave">Shiv Enclave</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-[#1E2046] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available on Cloud</option>
            <option value="MISSING">Missing Document (Gap)</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
              doc.is_missing
                ? 'bg-white border-blue-100 shadow-clay'
                : 'bg-white border-slate-100 shadow-clay hover:shadow-clay-hover'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1E2046] px-2.5 py-1 rounded-xl bg-[#F8FAFD] border border-slate-100">
                  {doc.quarter}
                </span>
                {doc.is_missing ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <FileWarning className="w-3 h-3 text-blue-600" />
                    Missing Document
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Uploaded Proof
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-sm text-[#1E2046] mt-3.5">{doc.form_name}</h3>
              <span className="text-xs font-semibold text-[#7C8BA0] block mt-0.5">{doc.project_name}</span>
              <span className="text-[11px] text-[#9CA8BC] font-mono block mt-1">{doc.type}</span>

              {doc.mismatch_count > 0 && (
                <div className="mt-3 px-3 py-1 rounded-xl bg-rose-50 border border-rose-100 text-[11px] text-rose-600 font-bold inline-block">
                  {doc.mismatch_count} discrepancies identified
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              {!doc.is_missing ? (
                <button
                  onClick={() => onViewEvidence(doc.url)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Cloud PDF</span>
                </button>
              ) : (
                <span className="text-xs text-[#9CA8BC] italic block text-center w-full py-1">
                  Certificate unavailable on portal
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
