import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, 
  TrendingUp, 
  Grid, 
  Folder, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  ShieldAlert, 
  ArrowUpRight, 
  Search, 
  Building2,
  FolderArchive,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';
import type { NormalizedDatabase, ProjectId, FormType, AuditFinding, Severity } from '../../types';
import { HealthBadgeView, RiskBadge } from '../ui/RiskBadge';
import { formatINR } from '../../lib/formatting';

interface ProjectViewProps {
  database: NormalizedDatabase;
  selectedProjectId: ProjectId;
  onSelectProject: (id: ProjectId) => void;
  onNavigateToReconciliation: (project: ProjectId, quarter: string, form: FormType) => void;
  onViewEvidence?: (url: string, finding?: any) => void;
}

/**
 * Normalizes quarterly string into folder name, exact filing date range, and year.
 */
export function getQuarterFolderMeta(quarterStr: string) {
  const match = quarterStr.match(/(January|April|July|October)\s+(?:to|-)\s+(March|June|September|December),?\s+(\d{4})/i);
  if (!match) {
    return {
      folderName: quarterStr.replace(' to ', '-').replace(',', ''),
      dateRange: quarterStr,
      quarterCode: 'QPR Filing',
      year: 'Unknown',
      monthRange: quarterStr
    };
  }

  const [, startMonth, endMonth, year] = match;
  let quarterCode = 'Q1';
  let dateRange = '';

  const startLower = startMonth.toLowerCase();
  if (startLower.startsWith('jan')) {
    quarterCode = `Q1 ${year}`;
    dateRange = `01 January ${year} – 31 March ${year}`;
  } else if (startLower.startsWith('apr')) {
    quarterCode = `Q2 ${year}`;
    dateRange = `01 April ${year} – 30 June ${year}`;
  } else if (startLower.startsWith('jul')) {
    quarterCode = `Q3 ${year}`;
    dateRange = `01 July ${year} – 30 September ${year}`;
  } else {
    quarterCode = `Q4 ${year}`;
    dateRange = `01 October ${year} – 31 December ${year}`;
  }

  const folderName = `${startMonth}-${endMonth} ${year}`;
  return {
    folderName,
    dateRange,
    quarterCode,
    year,
    monthRange: `${startMonth} – ${endMonth}`
  };
}

export const ProjectView: React.FC<ProjectViewProps> = ({
  database,
  selectedProjectId,
  onSelectProject,
  onNavigateToReconciliation,
  onViewEvidence,
}) => {
  const project = database.projects[selectedProjectId] || database.projects['dream-colony'];

  // State for quarterly folder filtering & interaction
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [folderSearch, setFolderSearch] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Format inventory velocity data chronologically
  const inventoryData = useMemo(() => {
    return Object.values(project.quarters)
      .filter(q => q.is_active && q.inventory.total > 0)
      .sort((a, b) => a.sort_key - b.sort_key)
      .map(q => ({
        quarter: q.quarter.replace(' to ', '-').replace(', ', ' '),
        rawQuarter: q.quarter,
        Sold: q.inventory.sold,
        Unsold: q.inventory.unsold,
        Mortgaged: q.inventory.mortgaged,
        Total: q.inventory.total
      }));
  }, [project]);

  // Chronologically sorted active quarters for the heatmap & folders
  const activeQuarters = useMemo(() => {
    return Object.values(project.quarters)
      .filter(q => q.is_active)
      .sort((a, b) => a.sort_key - b.sort_key);
  }, [project]);

  // Map of all findings for this project grouped by quarter
  const findingsByQuarter = useMemo(() => {
    const map: Record<string, AuditFinding[]> = {};
    activeQuarters.forEach(q => {
      map[q.quarter] = database.all_findings.filter(
        f => f.project_id === selectedProjectId && f.quarter === q.quarter && f.status !== 'Ignored'
      );
    });
    return map;
  }, [database, selectedProjectId, activeQuarters]);

  // Initialize expanded state for all folders or when project changes
  useMemo(() => {
    const initial: Record<string, boolean> = {};
    activeQuarters.forEach((q, idx) => {
      const findings = findingsByQuarter[q.quarter] || [];
      const hasCritical = findings.some(f => f.severity === 'CRITICAL');
      initial[q.quarter] = idx < 2 || hasCritical;
    });
    setExpandedFolders(initial);
  }, [selectedProjectId, activeQuarters, findingsByQuarter]);

  const toggleFolder = (quarter: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [quarter]: !prev[quarter]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    activeQuarters.forEach(q => { all[q.quarter] = true; });
    setExpandedFolders(all);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    activeQuarters.forEach(q => { all[q.quarter] = false; });
    setExpandedFolders(all);
  };

  const getHeatmapColor = (form: 'r1' | 'r2' | 'r3', q: any) => {
    let records: any[] = [];
    if (form === 'r1') records = q.form_r1;
    else if (form === 'r2') records = q.form_r2;
    else records = [...q.form_r3_top, ...q.form_r3_bottom.filter((r: any) => !r.is_ignored)];

    if (!records || records.length === 0) return { bg: 'bg-slate-100 border border-slate-200', text: 'text-slate-400', label: 'N/A' };
    
    const hasMissing = records.some(r => r.status === 'Missing Document' || r.severity === 'DATA GAP');
    if (hasMissing) return { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: 'GAP' };

    const hasCrit = records.some(r => r.severity === 'CRITICAL' || r.severity_incurred === 'CRITICAL');
    if (hasCrit) return { bg: 'bg-rose-50 border border-rose-200', text: 'text-rose-600 font-black', label: 'CRIT' };

    const hasWarn = records.some(r => r.severity === 'WARNING' || r.severity_incurred === 'WARNING');
    if (hasWarn) return { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'WARN' };

    return { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'OK' };
  };

  // Filtered quarters according to the folder filter and search
  const visibleQuarters = useMemo(() => {
    return activeQuarters.filter(q => {
      if (selectedFolderFilter !== 'all' && q.quarter !== selectedFolderFilter) {
        return false;
      }
      if (folderSearch.trim()) {
        const term = folderSearch.toLowerCase();
        const meta = getQuarterFolderMeta(q.quarter);
        const findings = findingsByQuarter[q.quarter] || [];
        const matchesSearch = 
          q.quarter.toLowerCase().includes(term) ||
          meta.folderName.toLowerCase().includes(term) ||
          meta.year.includes(term) ||
          meta.quarterCode.toLowerCase().includes(term) ||
          findings.some(f => f.metric.toLowerCase().includes(term) || f.reason.toLowerCase().includes(term));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [activeQuarters, selectedFolderFilter, folderSearch, findingsByQuarter]);

  // Project schema badge
  const schemaBadge = selectedProjectId === 'ridhi-sidhi' 
    ? { label: 'Schema B (Compared)', desc: 'Comparison_Status & PDF_Percentage' }
    : { label: 'Schema A (Verified)', desc: 'Verification_Status & Extracted_PDF' };

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">
      
      {/* SECTION 1: PROMINENT PROJECT SELECTOR IN THE TAB */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B5BFD] font-mono">
                Select Project Portfolio
              </span>
            </div>
            <h2 className="text-xl font-black text-[#1E2046] tracking-tight mt-1">
              Monitored Rajasthan RERA Schemes
            </h2>
            <p className="text-xs text-[#7C8BA0] mt-0.5 font-medium">
              Select a development to inspect its certified portfolio, unit inventory progression, and quarterly archive folders with dates & red flags.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7C8BA0] font-bold bg-[#F8FAFD] px-3.5 py-2 rounded-2xl border border-slate-100">
            <Building2 className="w-3.5 h-3.5 text-[#3B5BFD]" />
            <span>3 Registered Schemes Ingested</span>
          </div>
        </div>

        {/* The 3 Interactive Project Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {(['dream-colony', 'ridhi-sidhi', 'shiv-enclave'] as ProjectId[]).map((pid) => {
            const p = database.projects[pid];
            const isSelected = selectedProjectId === pid;
            return (
              <div
                key={pid}
                onClick={() => onSelectProject(pid)}
                className={`relative p-5 rounded-3xl cursor-pointer transition-all duration-200 border text-left ${
                  isSelected
                    ? 'bg-white border-[#3B5BFD] shadow-clay ring-2 ring-[#3B5BFD]/20'
                    : 'bg-[#F8FAFD] hover:bg-white border-slate-100 hover:shadow-clay'
                }`}
              >
                {/* Active Indicator Pill */}
                {isSelected && (
                  <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[10px] font-black bg-[#3B5BFD] text-white shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Active Portfolio
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-mono font-bold bg-white text-[#1E2046] border border-slate-200 shadow-sm">
                    {p.district}
                  </span>
                  <HealthBadgeView badge={p.stats.health_badge} />
                </div>

                <h3 className="text-base font-black text-[#1E2046] tracking-tight mt-1 truncate">
                  {p.name}
                </h3>
                <p className="text-xs text-[#7C8BA0] truncate mt-0.5 font-medium">
                  {p.promoter}
                </p>
                <span className="text-[10px] font-mono text-[#9CA8BC] block mt-1">
                  RERA: {p.registration_no}
                </span>

                {/* Micro Stats inside Card */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] text-[#7C8BA0] font-semibold block uppercase">Units</span>
                    <span className="text-xs font-black text-[#1E2046]">
                      {p.stats.sold_units}/{p.stats.total_units}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] text-[#7C8BA0] font-semibold block uppercase">Quarters</span>
                    <span className="text-xs font-black text-[#3B5BFD]">
                      {p.stats.active_quarters} Filed
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] text-[#7C8BA0] font-semibold block uppercase">Critical</span>
                    <span className={`text-xs font-black ${p.stats.critical_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {p.stats.critical_count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PARTICULAR PROJECT PORTFOLIO BANNER & SUMMARY */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F8FAFD] text-[#3B5BFD] border border-slate-200">
                {project.district} District
              </span>
              <HealthBadgeView badge={project.stats.health_badge} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#F8FAFD] text-[#7C8BA0] border border-slate-200" title={schemaBadge.desc}>
                {schemaBadge.label}
              </span>
              <span className="text-xs text-[#7C8BA0] font-mono">
                RERA Reg: <strong className="text-[#1E2046]">{project.registration_no}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1E2046] tracking-tight mt-2">
              {project.name}
            </h1>
            <p className="text-sm text-[#7C8BA0] mt-1 font-medium">
              Promoter: <span className="text-[#1E2046] font-bold">{project.promoter}</span> • Project Type: {project.project_type} • App No: <span className="font-mono text-[#3B5BFD]">{project.application_no}</span>
            </p>
          </div>

          {/* External RERA Portal Link */}
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center gap-2 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all self-start lg:self-auto"
            >
              <span>View Official RERA Portal Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-[#F8FAFD] p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-[#7C8BA0] block uppercase">Total Inventory</span>
            <span className="text-2xl font-black text-[#1E2046] mt-1 block tabular-nums">
              {project.stats.total_units} Plots
            </span>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {project.stats.sold_units} Sold ({project.stats.sold_percentage}%)
            </span>
          </div>

          <div className="bg-[#F8FAFD] p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-[#7C8BA0] block uppercase">Mortgaged to Bank</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block tabular-nums">
              {project.stats.mortgaged_units} Plots
            </span>
            <span className="text-[11px] text-[#7C8BA0] mt-1 block font-medium">
              {project.stats.unsold_units} Unsold Remaining
            </span>
          </div>

          <div className="bg-[#F8FAFD] p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-[#7C8BA0] block uppercase">Quarterly Archive Folders</span>
            <span className="text-2xl font-black text-[#3B5BFD] mt-1 block tabular-nums">
              {project.stats.active_quarters} Quarters
            </span>
            <span className="text-[11px] text-[#7C8BA0] mt-1 block font-medium">
              Full chronological audit chain
            </span>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
            <span className="text-xs font-bold text-rose-600 block uppercase">Critical Mismatches</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block tabular-nums">
              {project.stats.critical_count}
            </span>
            <span className="text-[11px] text-rose-600 mt-1 block font-medium">
              {project.stats.total_mismatches} total discrepancies found
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: SALES & INVENTORY VELOCITY */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[#1E2046] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3B5BFD]" />
              Sales & Inventory Velocity Over Time
            </h2>
            <p className="text-xs text-[#7C8BA0] mt-0.5 font-medium">
              Unit allocation progression showing Sold, Unsold, and Bank-Mortgaged inventory across quarterly reports.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sold
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Mortgaged
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Unsold
            </span>
          </div>
        </div>

        {inventoryData.length > 0 ? (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="quarter" tick={{ fill: '#7C8BA0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7C8BA0', fontSize: 11 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#1E2046', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="Sold" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.7} />
                <Area type="monotone" dataKey="Mortgaged" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.7} />
                <Area type="monotone" dataKey="Unsold" stackId="1" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.7} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-[#7C8BA0] text-sm">
            No inventory timeseries available for this project.
          </div>
        )}

        {selectedProjectId === 'dream-colony' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            <strong>Forensic Note:</strong> Dream Colony experienced complete sales stagnation between Q2 2024 and Q4 2025 at exactly 33 plots sold, with 5 plots mortgaged to the bank and 3 unsold for 6 consecutive quarters.
          </div>
        )}
      </div>

      {/* SECTION 4: QUARTERLY COMPLIANCE MATRIX HEATMAP */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[#1E2046] flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#3B5BFD]" />
              Quarterly Compliance Matrix (Heatmap)
            </h2>
            <p className="text-xs text-[#7C8BA0] mt-0.5 font-medium">
              Click any cell to navigate directly to the detailed reconciliation for that form and quarter.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> OK</span>
            <span className="flex items-center gap-1.5 text-amber-700"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Warning</span>
            <span className="flex items-center gap-1.5 text-rose-600"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Critical</span>
            <span className="flex items-center gap-1.5 text-blue-700"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Missing Doc</span>
          </div>
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-[#7C8BA0] font-bold uppercase">
                <th className="py-3 px-4 w-44">Certificate Form</th>
                {activeQuarters.map(q => {
                  const meta = getQuarterFolderMeta(q.quarter);
                  return (
                    <th key={q.quarter} className="py-3 px-2 text-center font-mono text-[11px]" title={meta.dateRange}>
                      <div className="font-bold text-[#1E2046]">{meta.quarterCode}</div>
                      <div className="text-[9px] text-[#7C8BA0] font-normal">{meta.monthRange}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Row 1: Form R-1 */}
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#1E2046]">Form R-1 (Architect)</td>
                {activeQuarters.map(q => {
                  const state = getHeatmapColor('r1', q);
                  return (
                    <td key={q.quarter} className="p-2 text-center">
                      <button
                        onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-1 (Architect)')}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105 shadow-sm ${state.bg} ${state.text}`}
                        title={`${q.quarter} Form R-1: ${state.label}`}
                      >
                        {state.label}
                      </button>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Form R-2 */}
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#1E2046]">Form R-2 (Engineer)</td>
                {activeQuarters.map(q => {
                  const state = getHeatmapColor('r2', q);
                  return (
                    <td key={q.quarter} className="p-2 text-center">
                      <button
                        onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-2 (Engineer)')}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105 shadow-sm ${state.bg} ${state.text}`}
                        title={`${q.quarter} Form R-2: ${state.label}`}
                      >
                        {state.label}
                      </button>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Form R-3 */}
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#1E2046]">Form R-3 (CA Escrow)</td>
                {activeQuarters.map(q => {
                  const state = getHeatmapColor('r3', q);
                  return (
                    <td key={q.quarter} className="p-2 text-center">
                      <button
                        onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-3 Table 2 (Escrow Compliance)')}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105 shadow-sm ${state.bg} ${state.text}`}
                        title={`${q.quarter} Form R-3: ${state.label}`}
                      >
                        {state.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: QUARTERLY FILING FOLDERS & RED FLAGS LEDGER */}
      <div className="space-y-6">
        
        {/* Header with Title and Global Folder Controls */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#3B5BFD]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3B5BFD]">
                  Physical Storage Hierarchy & Forensic Ledger
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1E2046] tracking-tight mt-1">
                Quarterly Filing Folders & Red Flags Explorer
              </h2>
              <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
                Forensic breakdown structured according to the physical quarterly archive folders on disk with exact filing date intervals, years, certified forms, and prioritized regulatory red flags.
              </p>
            </div>

            {/* Folder Actions: Expand / Collapse All */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={expandAll}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFD] hover:bg-slate-100 text-[#1E2046] text-xs font-bold border border-slate-200 transition-colors"
              >
                Expand All Folders
              </button>
              <button
                onClick={collapseAll}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFD] hover:bg-slate-100 text-[#1E2046] text-xs font-bold border border-slate-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Filter Bar within Folders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
            {/* Folder Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#7C8BA0] uppercase tracking-wider">
                Filter by Quarter Folder
              </label>
              <select
                value={selectedFolderFilter}
                onChange={(e) => setSelectedFolderFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-[#F8FAFD] border border-slate-200 text-[#1E2046] text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">📁 All {activeQuarters.length} Quarterly Folders</option>
                {activeQuarters.map(q => {
                  const meta = getQuarterFolderMeta(q.quarter);
                  return (
                    <option key={q.quarter} value={q.quarter}>
                      📁 {meta.folderName} ({meta.quarterCode})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#7C8BA0] uppercase tracking-wider">
                Red Flag Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="px-3 py-2 rounded-2xl bg-[#F8FAFD] border border-slate-200 text-[#1E2046] text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Findings & Matches</option>
                <option value="CRITICAL">🔴 Critical Only (&gt;₹10L / &gt;30pp)</option>
                <option value="WARNING">🟡 Warnings Only</option>
                <option value="DATA GAP">🟣 Data Gaps (Missing Certificates)</option>
                <option value="MATCH">🟢 Clean Matches Only</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#7C8BA0] uppercase tracking-wider">
                Search Within Folders
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9CA8BC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Metric, reason, or year..."
                  value={folderSearch}
                  onChange={(e) => setFolderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#F8FAFD] border border-slate-200 text-[#1E2046] text-xs font-medium focus:outline-none placeholder:text-[#9CA8BC]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List of Quarterly Folders */}
        <div className="space-y-4">
          {visibleQuarters.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-[#7C8BA0]">
              No quarterly folders match your active filters. Try resetting the folder or severity filters.
            </div>
          ) : (
            visibleQuarters.map((q) => {
              const meta = getQuarterFolderMeta(q.quarter);
              const isExpanded = !!expandedFolders[q.quarter];
              const rawFindings = findingsByQuarter[q.quarter] || [];
              
              // Filter findings by severity
              const findings = rawFindings.filter(f => {
                if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
                return true;
              });

              // Stats for this folder
              const critCount = rawFindings.filter(f => f.severity === 'CRITICAL').length;
              const warnCount = rawFindings.filter(f => f.severity === 'WARNING').length;
              const gapCount = rawFindings.filter(f => f.severity === 'DATA GAP').length;
              const matchCount = rawFindings.filter(f => f.severity === 'MATCH').length;

              return (
                <div
                  key={q.quarter}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                    critCount > 0
                      ? 'bg-white border-rose-200 shadow-clay'
                      : isExpanded
                      ? 'bg-white border-slate-200 shadow-clay'
                      : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'
                  }`}
                >
                  {/* Folder Accordion Header */}
                  <div
                    onClick={() => toggleFolder(q.quarter)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-[#F8FAFD]/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        critCount > 0 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm' 
                          : gapCount > 0
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                          : 'bg-[#F8FAFD] text-[#3B5BFD] border border-slate-100 shadow-sm'
                      }`}>
                        <Folder className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base sm:text-lg font-black text-[#1E2046]">
                            📁 {meta.folderName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F8FAFD] text-[#3B5BFD] border border-slate-200">
                            {meta.quarterCode}
                          </span>
                          {critCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {critCount} Critical Red Flags
                            </span>
                          )}
                          {gapCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {gapCount} Data Gap
                            </span>
                          )}
                        </div>

                        {/* Date and Year Tag */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#7C8BA0]">
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-[#3B5BFD]" />
                            Filing Period: <strong className="text-[#1E2046] font-bold">{meta.dateRange}</strong>
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-[#9CA8BC]">
                            RERA_DATA/{project.name}/{meta.folderName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Summary Badges & Quick Action */}
                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold">
                        <span className="px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700" title="Clean Matches">
                          {matchCount} OK
                        </span>
                        <span className="px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800" title="Warnings">
                          {warnCount} Warn
                        </span>
                        <span className="px-2 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-600" title="Critical Breaches">
                          {critCount} Crit
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-1 (Architect)');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-glow-coral hover:brightness-105"
                      >
                        <span>Reconcile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-1 rounded-xl bg-[#F8FAFD] text-[#7C8BA0] border border-slate-200">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content: Red Flags and Filing Details */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 bg-[#F8FAFD]/50">
                      
                      {/* Sub-Section 1: Red Flags & Discrepancies */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#1E2046] flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            Red Flags & Verification Findings in {meta.folderName} ({findings.length})
                          </h4>
                          <span className="text-[11px] text-[#7C8BA0] font-medium">
                            Filing Date: {meta.dateRange}
                          </span>
                        </div>

                        {findings.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                            <span>No discrepancies matching the active filter. Portal entries for this period are in statutory concordance.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {findings.map((f) => {
                              const isCrit = f.severity === 'CRITICAL';
                              
                              return (
                                <div
                                  key={f.id}
                                  className={`p-4 rounded-2xl border transition-all ${
                                    isCrit
                                      ? 'bg-rose-50/50 border-rose-200 shadow-sm'
                                      : 'bg-white border-slate-100 shadow-sm'
                                  }`}
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <RiskBadge severity={f.severity} status={f.status} size="sm" />
                                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F8FAFD] text-[#3B5BFD] border border-slate-200">
                                          {f.form_type}
                                        </span>
                                        <span className="text-xs font-black text-[#1E2046]">
                                          {f.metric}
                                        </span>
                                      </div>

                                      <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
                                        <strong className="text-[#1E2046] font-bold">Statutory Breach Reason:</strong> {f.reason}
                                      </p>
                                    </div>

                                    {/* Comparative Values Box */}
                                    <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm self-start lg:self-auto flex-shrink-0">
                                      <div>
                                        <span className="text-[10px] text-[#7C8BA0] block uppercase font-mono font-bold">Web Declared</span>
                                        <span className="text-xs font-black text-[#1E2046] tabular-nums">
                                          {f.web_val !== null 
                                            ? (f.unit === '₹' ? formatINR(f.web_val) : `${f.web_val}%`) 
                                            : 'Not Available'}
                                        </span>
                                      </div>

                                      <div className="text-[#9CA8BC] font-bold">vs</div>

                                      <div>
                                        <span className="text-[10px] text-[#7C8BA0] block uppercase font-mono font-bold">Certified Proof</span>
                                        <span className="text-xs font-black text-[#3B5BFD] tabular-nums">
                                          {f.pdf_val !== null 
                                            ? (f.unit === '₹' ? formatINR(f.pdf_val) : `${f.pdf_val}%`) 
                                            : 'Missing Proof'}
                                        </span>
                                      </div>

                                      <div className="border-l border-slate-200 pl-3">
                                        <span className="text-[10px] text-[#7C8BA0] block uppercase font-mono font-bold">Discrepancy</span>
                                        <span className={`text-xs font-black tabular-nums ${
                                          isCrit ? 'text-rose-600' : 'text-[#1E2046]'
                                        }`}>
                                          {f.absolute_variance !== null
                                            ? (f.unit === '₹' ? formatINR(f.absolute_variance) : `${Math.abs(f.absolute_variance).toFixed(1)} pp`)
                                            : 'N/A'}
                                        </span>
                                      </div>

                                      {/* Action Buttons for this Finding */}
                                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                                        {f.document_url && onViewEvidence && (
                                          <button
                                            onClick={() => onViewEvidence(f.document_url, f)}
                                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-[#3B5BFD] text-[11px] font-bold border border-slate-200 shadow-sm transition-colors"
                                            title="Inspect Certified PDF Certificate"
                                          >
                                            View Proof
                                          </button>
                                        )}
                                        <button
                                          onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, f.form_type)}
                                          className="px-2.5 py-1 rounded-xl bg-[#1E2046] hover:bg-[#2B2E5C] text-white text-[11px] font-bold transition-colors"
                                        >
                                          Reconcile
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Sub-Section 2: Certified Forms Filed in this Folder */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1E2046] flex items-center gap-2 mb-3">
                          <Layers className="w-4 h-4 text-[#3B5BFD]" />
                          Certified Forms Archived in Folder ({meta.folderName})
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Form R-1 */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-[#1E2046] block">Form R-1 (Architect)</span>
                              <span className="text-[10px] text-[#7C8BA0] block mt-0.5 font-medium">
                                Physical Progress (13 Civic Works)
                              </span>
                            </div>
                            <button
                              onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-1 (Architect)')}
                              className="px-3 py-1 rounded-xl bg-[#F8FAFD] hover:bg-slate-100 text-xs font-bold text-[#3B5BFD] border border-slate-200 transition-colors"
                            >
                              Inspect
                            </button>
                          </div>

                          {/* Form R-2 */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-[#1E2046] block">Form R-2 (Engineer)</span>
                              <span className="text-[10px] text-[#7C8BA0] block mt-0.5 font-medium">
                                Cost & Engineering Progress
                              </span>
                            </div>
                            <button
                              onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-2 (Engineer)')}
                              className="px-3 py-1 rounded-xl bg-[#F8FAFD] hover:bg-slate-100 text-xs font-bold text-[#3B5BFD] border border-slate-200 transition-colors"
                            >
                              Inspect
                            </button>
                          </div>

                          {/* Form R-3 */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-[#1E2046] block">Form R-3 (CA Escrow)</span>
                              <span className="text-[10px] text-[#7C8BA0] block mt-0.5 font-medium">
                                Permissible Escrow Withdrawal
                              </span>
                            </div>
                            <button
                              onClick={() => onNavigateToReconciliation(selectedProjectId, q.quarter, 'Form R-3 Table 2 (Escrow Compliance)')}
                              className="px-3 py-1 rounded-xl bg-[#F8FAFD] hover:bg-slate-100 text-xs font-bold text-[#3B5BFD] border border-slate-200 transition-colors"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Section 3: Inventory as of this Quarter */}
                      {q.inventory && q.inventory.total > 0 && (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-xs text-[#7C8BA0] flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-[#3B5BFD] font-bold">
                            Inventory Balance at {meta.folderName}:
                          </span>
                          <div className="flex items-center gap-4 font-bold text-[#1E2046]">
                            <span>Sold: <strong className="text-emerald-600">{q.inventory.sold}</strong></span>
                            <span>Mortgaged: <strong className="text-amber-600">{q.inventory.mortgaged}</strong></span>
                            <span>Unsold: <strong className="text-slate-600">{q.inventory.unsold}</strong></span>
                            <span>Total Plots: <strong>{q.inventory.total}</strong></span>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
