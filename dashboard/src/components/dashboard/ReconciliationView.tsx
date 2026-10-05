import { useMemo } from 'react';
import type { FC } from 'react';
import { 
  Scale, 
  ExternalLink, 
  AlertTriangle, 
  FileText, 
  Download, 
  Building, 
  Calendar,
  ShieldAlert
} from 'lucide-react';
import type { NormalizedDatabase, ProjectId, FormType, AuditFinding } from '../../types';
import { formatINR } from '../../lib/formatting';
import { RiskBadge } from '../ui/RiskBadge';

interface ReconciliationViewProps {
  database: NormalizedDatabase;
  currentProject: ProjectId;
  onSelectProject: (p: ProjectId) => void;
  currentQuarter: string;
  onSelectQuarter: (q: string) => void;
  currentForm: FormType;
  onSelectForm: (f: FormType) => void;
  onViewEvidence: (url: string, finding?: any) => void;
  onExportFinding: (finding: any) => void;
}

export const ReconciliationView: FC<ReconciliationViewProps> = ({
  database,
  currentProject,
  onSelectProject,
  currentQuarter,
  onSelectQuarter,
  currentForm,
  onSelectForm,
  onViewEvidence,
  onExportFinding,
}) => {
  const project = database.projects[currentProject] || database.projects['dream-colony'];
  const activeQuartersList = useMemo(() => {
    return Object.values(project.quarters)
      .filter(q => q.is_active)
      .sort((a, b) => a.sort_key - b.sort_key);
  }, [project]);

  // Ensure currentQuarter is valid for this project
  const quarterData = project.quarters[currentQuarter] || activeQuartersList[0] || Object.values(project.quarters)[0];

  const forms: FormType[] = [
    'Form R-1 (Architect)',
    'Form R-2 (Engineer)',
    'Form R-3 Table 1 (Cost Audit)',
    'Form R-3 Table 2 (Escrow Compliance)'
  ];

  // Document link for the active form
  const activeDocUrl = useMemo(() => {
    if (!quarterData) return '';
    if (currentForm === 'Form R-1 (Architect)') return quarterData.form_r1[0]?.docs_url || '';
    if (currentForm === 'Form R-2 (Engineer)') return quarterData.form_r2[0]?.docs_url || '';
    if (currentForm === 'Form R-3 Table 1 (Cost Audit)') return quarterData.form_r3_top[0]?.docs_url || '';
    return quarterData.form_r3_bottom[0]?.docs_url || '';
  }, [quarterData, currentForm]);

  const isDocMissing = !activeDocUrl || activeDocUrl.toLowerCase() === 'not found' || !activeDocUrl.startsWith('http');

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">
      {/* SECTION 19: RECONCILIATION WORKSPACE HEADER & CONTROL BAR */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3B5BFD] text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Quarterly Reconciliation Workspace</span>
            </div>
            <h1 className="text-2xl font-black text-[#1E2046] tracking-tight mt-1">
              Field-by-Field Compliance Verification
            </h1>
            <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
              Comparing promoter self-declarations against legal baseline certificates with mathematical variances.
            </p>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project Filter */}
            <div className="flex items-center gap-2 bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-xs">
              <Building className="w-3.5 h-3.5 text-[#3B5BFD]" />
              <select
                value={currentProject}
                onChange={(e) => {
                  const newProj = e.target.value as ProjectId;
                  onSelectProject(newProj);
                  const pData = database.projects[newProj];
                  if (pData) {
                    const firstActive = Object.values(pData.quarters).find(q => q.is_active);
                    if (firstActive) onSelectQuarter(firstActive.quarter);
                  }
                }}
                className="bg-transparent text-[#1E2046] font-bold focus:outline-none cursor-pointer"
              >
                <option value="dream-colony">Dream Colony (Ajmer)</option>
                <option value="ridhi-sidhi">Ridhi Sidhi Hub (SGR)</option>
                <option value="shiv-enclave">Shiv Enclave (Jaipur)</option>
              </select>
            </div>

            {/* Quarter Filter */}
            <div className="flex items-center gap-2 bg-[#F8FAFD] border border-slate-100 rounded-2xl px-3 py-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#7C8BA0]" />
              <select
                value={quarterData?.quarter || ''}
                onChange={(e) => onSelectQuarter(e.target.value)}
                className="bg-transparent text-[#1E2046] font-bold focus:outline-none cursor-pointer"
              >
                {activeQuartersList.map(q => (
                  <option key={q.quarter} value={q.quarter}>
                    {q.quarter}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Quarter Audit Button */}
            {quarterData && (
              <button
                onClick={() => {
                  const finding: AuditFinding = {
                    id: `REC-${project.id}-${quarterData.sort_key}`,
                    project_id: project.id,
                    project_name: project.name,
                    district: project.district,
                    promoter: project.promoter,
                    quarter: quarterData.quarter,
                    sort_key: quarterData.sort_key,
                    form_type: currentForm,
                    metric: `${currentForm} Quarterly Audit Dossier`,
                    category: 'Reconciliation',
                    unit: '₹',
                    web_raw: `${quarterData.stats.mismatches} Mismatches`,
                    pdf_raw: `${quarterData.stats.critical} Critical Breaches`,
                    web_val: null,
                    pdf_val: null,
                    absolute_variance: null,
                    relative_variance: null,
                    status: quarterData.stats.critical > 0 ? 'Mismatch' : 'Match',
                    severity: quarterData.stats.critical > 0 ? 'CRITICAL' : 'MATCH',
                    reason: `${quarterData.stats.mismatches} mismatches and ${quarterData.stats.critical} critical findings detected in ${quarterData.quarter} for ${project.name}.`,
                    document_url: activeDocUrl,
                    document_status: isDocMissing ? 'Missing' : 'Available'
                  };
                  onExportFinding(finding);
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-pill text-xs font-bold text-[#1E2046] hover:border-slate-300 flex items-center gap-1.5 transition-all"
                title="Export this Quarter's Reconciliation Summary"
              >
                <Download className="w-3.5 h-3.5 text-[#7C8BA0]" />
                <span>Export Audit</span>
              </button>
            )}

            {/* View Source PDF Button */}
            {!isDocMissing ? (
              <button
                onClick={() => onViewEvidence(activeDocUrl)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center gap-2 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Legal Certificate</span>
              </button>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Certificate Missing</span>
              </span>
            )}
          </div>
        </div>

        {/* Form Selector Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100 overflow-x-auto pb-1">
          {forms.map(form => (
            <button
              key={form}
              onClick={() => onSelectForm(form)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                currentForm === form
                  ? 'bg-[#3B5BFD] text-white shadow-pill'
                  : 'bg-[#F8FAFD] text-[#7C8BA0] hover:text-[#1E2046] hover:bg-slate-100'
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 20: RECONCILIATION SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-clay">
          <span className="text-[10px] text-[#7C8BA0] uppercase font-bold block">Scheme & Promoter</span>
          <span className="text-sm font-black text-[#1E2046] mt-1 block truncate">
            {project.name}
          </span>
          <span className="text-xs text-[#7C8BA0] truncate block">{project.promoter}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-clay">
          <span className="text-[10px] text-[#7C8BA0] uppercase font-bold block">Audited Period</span>
          <span className="text-sm font-black text-[#1E2046] mt-1 block">
            {quarterData?.quarter}
          </span>
          <span className="text-xs text-[#3B5BFD] font-mono font-bold">Filing ID: {quarterData?.sort_key}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-clay">
          <span className="text-[10px] text-[#7C8BA0] uppercase font-bold block">Certificate Status</span>
          <span className={`text-sm font-black mt-1 block ${isDocMissing ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isDocMissing ? 'Missing Document (Gap)' : 'Verified Signed PDF'}
          </span>
          <span className="text-xs text-[#7C8BA0] truncate block">
            {isDocMissing ? 'No cloud URL available' : 'Archived in Govt Repository'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-clay">
          <span className="text-[10px] text-rose-500 uppercase font-bold block">Quarter Audit Findings</span>
          <span className="text-sm font-black text-[#1E2046] mt-1 block">
            <span className="text-rose-600 font-black">{quarterData?.stats.critical || 0} Critical</span> • {quarterData?.stats.mismatches || 0} Mismatches
          </span>
          <span className="text-xs text-emerald-600 font-bold block">{quarterData?.stats.matches || 0} matches validated</span>
        </div>
      </div>

      {/* SECTION 21 & 22: FORM R-1 (ARCHITECT PHYSICAL INFRASTRUCTURE AUDIT) */}
      {currentForm === 'Form R-1 (Architect)' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
            <h2 className="text-lg font-black text-[#1E2046]">Physical Progress Comparison (13 Civic Facilities)</h2>
            <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
              Horizontal bars show Web Declared Progress (slate blue) vs Architect Certified Progress (vibrant blue/orange). Severe discrepancies highlight in coral red.
            </p>

            <div className="space-y-4 mt-6">
              {quarterData?.form_r1.map((item) => {
                const webVal = item.web_val || 0;
                const pdfVal = item.pdf_val || 0;
                const isCrit = item.severity === 'CRITICAL';
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#F8FAFD] border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#1E2046]">{item.task}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#7C8BA0]">Web: <strong className="text-[#1E2046]">{item.web_val}%</strong></span>
                        <span className="text-[#7C8BA0]">PDF: <strong className="text-[#3B5BFD]">{item.pdf_val !== null ? `${item.pdf_val}%` : 'N/A'}</strong></span>
                        <RiskBadge severity={item.severity} status={item.status} size="sm" />
                      </div>
                    </div>

                    {/* Comparison Bars */}
                    <div className="space-y-1.5 pt-1">
                      {/* Web Declared Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#7C8BA0] w-12 font-mono font-bold">PORTAL:</span>
                        <div className="flex-1 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#64748B] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(webVal, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-8 text-right text-[#7C8BA0]">{webVal}%</span>
                      </div>

                      {/* PDF Certificate Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#7C8BA0] w-12 font-mono font-bold">PROVED:</span>
                        <div className="flex-1 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isCrit ? 'bg-[#FF6B35]' : 'bg-[#3B5BFD]'}`} 
                            style={{ width: `${Math.min(pdfVal, 100)}%` }} 
                          />
                        </div>
                        <span className={`text-[10px] font-mono font-bold w-8 text-right ${isCrit ? 'text-[#FF6B35]' : 'text-[#3B5BFD]'}`}>
                          {pdfVal}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form R-1 Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
            <h3 className="text-base font-black text-[#1E2046] mb-4">Form R-1 Detailed Forensic Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#7C8BA0] font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Civic Infrastructure Task</th>
                    <th className="py-3 px-3 text-right">Web Stated %</th>
                    <th className="py-3 px-3 text-right">Architect Certified %</th>
                    <th className="py-3 px-3 text-right">Gap (pp)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Audit Finding Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterData?.form_r1.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#1E2046]">{item.task}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#7C8BA0] font-semibold">{item.web_val}%</td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#1E2046] font-extrabold">{item.pdf_val}%</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold">
                        <span className={item.severity === 'CRITICAL' ? 'text-rose-600 font-extrabold' : item.severity === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'}>
                          {item.variance_pp !== null ? `${item.variance_pp.toFixed(1)} pp` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <RiskBadge severity={item.severity} status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-[#7C8BA0] text-[11px] max-w-md">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 23: FORM R-2 (ENGINEER COST & PROGRESS AUDIT) */}
      {currentForm === 'Form R-2 (Engineer)' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
            <h2 className="text-lg font-black text-[#1E2046]">Form R-2 Engineering Budget & Progress Ledger</h2>
            <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
              Engineer certified expenditure against estimated capital budget.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#7C8BA0] font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Particulars (Engineering Milestone)</th>
                    <th className="py-3 px-3 text-right">Web Declared</th>
                    <th className="py-3 px-3 text-right">Engineer Certified</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Compliance Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterData?.form_r2.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#1E2046]">{item.particulars}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#7C8BA0] font-semibold">
                        {item.unit === '₹' ? formatINR(item.web_val) : `${item.web_val}%`}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#1E2046] font-extrabold">
                        {item.unit === '₹' ? formatINR(item.pdf_val) : `${item.pdf_val}%`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <RiskBadge severity={item.severity} status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-[#7C8BA0] text-[11px]">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 24: FORM R-3 TABLE 1 (CA COST AUDIT) */}
      {currentForm === 'Form R-3 Table 1 (Cost Audit)' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
            <h2 className="text-lg font-black text-[#1E2046]">Project Cost Breakdown (Land vs Construction)</h2>
            <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
              Chartered Accountant verified capital ledger. Reconciles both Estimated Budget and Incurred Capital.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#7C8BA0] font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Cost Category</th>
                    <th className="py-3 px-3 text-right">Web Estimated</th>
                    <th className="py-3 px-3 text-right">Web Incurred</th>
                    <th className="py-3 px-3 text-right">CA Certified Incurred</th>
                    <th className="py-3 px-3 text-right">Variance</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterData?.form_r3_top.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFD] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#1E2046]">{item.particulars}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#7C8BA0]">{formatINR(item.web_estimated)}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#1E2046] font-semibold">{formatINR(item.web_incurred)}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#3B5BFD] font-extrabold">{formatINR(item.pdf_incurred)}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums font-bold">
                        {item.variance_incurred !== null ? (
                          <span className={item.severity_incurred === 'CRITICAL' ? 'text-rose-600 font-extrabold' : 'text-[#1E2046]'}>
                            {formatINR(item.variance_incurred)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <RiskBadge severity={item.severity_incurred} status={item.status_incurred} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {item.docs_url && item.docs_url.startsWith('http') && (
                          <button
                            onClick={() => onViewEvidence(item.docs_url, item)}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3B5BFD] border border-slate-200 shadow-sm"
                            title="Inspect PDF certificate"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 25: FORM R-3 TABLE 2 (ESCROW & SECT. 4(2)(l)(D) WITHDRAWAL COMPLIANCE) */}
      {currentForm === 'Form R-3 Table 2 (Escrow Compliance)' && (
        <div className="space-y-6">
          {/* Spotlight on the Massive Shiv Enclave Discrepancy if applicable */}
          {currentProject === 'shiv-enclave' && (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-clay relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white uppercase">
                      Severe Statutory Breach
                    </span>
                    <span className="text-xs text-rose-700 font-mono font-bold">RERA Section 4(2)(l)(D)</span>
                  </div>
                  <h3 className="text-xl font-black text-rose-950 mt-1.5">
                    ₹104.55 Crore Erroneous Withdrawal Declaration in Shiv Enclave
                  </h3>
                  <p className="text-xs text-rose-800 mt-1 max-w-3xl leading-relaxed font-medium">
                    The developer declared eligible withdrawal of <strong>₹1,06,57,15,460.00 (~₹106.57 Cr)</strong> on the public portal. However, the official Chartered Accountant certificate approved only <strong>₹20,203,960.00 (~₹2.02 Cr)</strong>. The promoter entered the cumulative land cost into the withdrawal field, generating a 52.7x over-statement on the public register.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Escrow Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
            <h2 className="text-lg font-black text-[#1E2046]">70% RERA Separate Bank Account Compliance Ledger</h2>
            <p className="text-xs text-[#7C8BA0] mt-1 font-medium">
              Excludes ignored portal placeholders (Rows 2–4). Tracks permissible withdrawal vs actual withdrawal to date.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#7C8BA0] font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Particulars (RERA Formula)</th>
                    <th className="py-3 px-3 text-right">Portal Stated</th>
                    <th className="py-3 px-3 text-right">CA Certified (PDF)</th>
                    <th className="py-3 px-3 text-right">Discrepancy</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Compliance Assessment</th>
                    <th className="py-3 px-3 text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterData?.form_r3_bottom.filter(item => !item.is_ignored).map((item) => {
                    const isCurrency = item.unit === '₹';
                    const isCrit = item.severity === 'CRITICAL';
                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFD] transition-colors">
                        <td className="py-3.5 px-3 font-bold text-[#1E2046] max-w-sm">{item.particulars}</td>
                        <td className="py-3.5 px-3 text-right tabular-nums text-[#7C8BA0] font-semibold">
                          {isCurrency ? formatINR(item.web_val) : `${item.web_val}%`}
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums text-[#3B5BFD] font-extrabold">
                          {isCurrency ? formatINR(item.pdf_val) : `${item.pdf_val}%`}
                        </td>
                        <td className="py-3.5 px-3 text-right tabular-nums font-bold">
                          <span className={isCrit ? 'text-rose-600 font-extrabold' : item.severity === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'}>
                            {item.variance !== null ? (isCurrency ? formatINR(item.variance) : `${item.variance.toFixed(1)} pp`) : '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <RiskBadge severity={item.severity} status={item.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-3 text-[#7C8BA0] text-[11px] max-w-xs truncate">
                          {item.reason}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {item.docs_url && item.docs_url.startsWith('http') && (
                            <button
                              onClick={() => onViewEvidence(item.docs_url, item)}
                              className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3B5BFD] border border-slate-200 shadow-sm"
                              title="Inspect signed CA certificate"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
