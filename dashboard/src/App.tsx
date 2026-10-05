import { useState, useEffect, useMemo } from 'react';
import databaseRaw from './data/normalized_rera_database.json';
import type { NormalizedDatabase, ProjectId, FormType, AuditFinding } from './types';
import { Sidebar } from './components/layout/Sidebar';
import type { NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { ProjectView } from './components/dashboard/ProjectView';
import { ReconciliationView } from './components/dashboard/ReconciliationView';
import { RedFlagsView } from './components/dashboard/RedFlagsView';
import { DocumentsView } from './components/dashboard/DocumentsView';
import { TestSuiteView } from './components/dashboard/TestSuiteView';
import { EvidenceDrawer } from './components/modals/EvidenceDrawer';
import { MethodologyModal } from './components/modals/MethodologyModal';
import { ExportModal } from './components/modals/ExportModal';
import { formatINR } from './lib/formatting';
import { ArrowUpRight, Building2, Search, X } from 'lucide-react';
import { RiskBadge } from './components/ui/RiskBadge';

export function App() {
  const database = databaseRaw as unknown as NormalizedDatabase;

  // Helper to read initial URL search parameters
  const getInitialParams = () => {
    if (typeof window === 'undefined') return {};
    const sp = new URLSearchParams(window.location.search);
    return {
      tab: (sp.get('tab') as NavTab) || 'overview',
      project: (sp.get('project') as ProjectId | 'all') || 'all',
      quarter: sp.get('quarter') || 'April to June, 2024',
      form: (sp.get('form') as FormType) || 'Form R-1 (Architect)',
      search: sp.get('search') || '',
    };
  };

  const initialParams = getInitialParams();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(initialParams.tab || 'overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter States
  const [selectedProject, setSelectedProject] = useState<ProjectId | 'all'>(initialParams.project || 'all');
  const [activeProjectForDeepDive, setActiveProjectForDeepDive] = useState<ProjectId>(
    initialParams.project !== 'all' ? (initialParams.project as ProjectId) : 'dream-colony'
  );
  const [reconciliationQuarter, setReconciliationQuarter] = useState<string>(initialParams.quarter || 'April to June, 2024');
  const [reconciliationForm, setReconciliationForm] = useState<FormType>(initialParams.form || 'Form R-1 (Architect)');
  const [searchQuery, setSearchQuery] = useState(initialParams.search || '');

  // Modals & Drawers
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceDocUrl, setEvidenceDocUrl] = useState('');
  const [evidenceFinding, setEvidenceFinding] = useState<AuditFinding | null>(null);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // SECTION 19 & 59: URL State Synchronization
  useEffect(() => {
    const sp = new URLSearchParams();
    if (activeTab !== 'overview') sp.set('tab', activeTab);
    if (selectedProject !== 'all') sp.set('project', selectedProject);
    if (activeTab === 'reconciliation') {
      sp.set('quarter', reconciliationQuarter);
      sp.set('form', reconciliationForm);
    }
    if (searchQuery) sp.set('search', searchQuery);

    const queryString = sp.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab, selectedProject, reconciliationQuarter, reconciliationForm, searchQuery]);

  // Handle popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const tab = (sp.get('tab') as NavTab) || 'overview';
      const proj = (sp.get('project') as ProjectId | 'all') || 'all';
      const q = sp.get('quarter') || 'April to June, 2024';
      const f = (sp.get('form') as FormType) || 'Form R-1 (Architect)';
      const s = sp.get('search') || '';

      setActiveTab(tab);
      setSelectedProject(proj);
      if (proj !== 'all') setActiveProjectForDeepDive(proj);
      setReconciliationQuarter(q);
      setReconciliationForm(f);
      setSearchQuery(s);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync active project if header selector changes
  useEffect(() => {
    if (selectedProject !== 'all') {
      setActiveProjectForDeepDive(selectedProject);
    }
  }, [selectedProject]);

  // Global search matching results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return null;

    const matchedProjects = Object.values(database.projects).filter(
      p => p.name.toLowerCase().includes(q) ||
           p.promoter.toLowerCase().includes(q) ||
           p.district.toLowerCase().includes(q) ||
           p.registration_no.toLowerCase().includes(q)
    );

    const matchedFindings = database.all_findings.filter(
      f => f.status !== 'Ignored' && (
        f.metric.toLowerCase().includes(q) ||
        f.project_name.toLowerCase().includes(q) ||
        f.quarter.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.reason.toLowerCase().includes(q)
      )
    ).slice(0, 10);

    return { projects: matchedProjects, findings: matchedFindings };
  }, [searchQuery, database]);

  // Handlers
  const handleSelectProject = (id: ProjectId) => {
    setActiveProjectForDeepDive(id);
    setSelectedProject(id);
    setActiveTab('projects');
  };

  const handleNavigateToReconciliation = (project: ProjectId, quarter: string, form: FormType) => {
    setActiveProjectForDeepDive(project);
    setSelectedProject(project);
    setReconciliationQuarter(quarter);
    setReconciliationForm(form);
    setActiveTab('reconciliation');
    setSearchQuery('');
  };

  const handleViewEvidence = (url: string, finding?: any) => {
    setEvidenceDocUrl(url);
    setEvidenceFinding(finding || null);
    setEvidenceDrawerOpen(true);
  };

  const handleExportCSV = (findings: AuditFinding[]) => {
    const headers = [
      'Finding ID',
      'Project ID',
      'Project Name',
      'District',
      'Promoter',
      'Quarter',
      'Form Type',
      'Metric',
      'Category',
      'Unit',
      'Web Stated Value',
      'Certified Legal Value',
      'Absolute Variance',
      'Relative Variance (%)',
      'Audit Status',
      'Severity',
      'Compliance Finding Reason',
      'Source Certificate URL'
    ];

    const rows = findings.map(f => [
      `"${f.id}"`,
      `"${f.project_id}"`,
      `"${f.project_name.replace(/"/g, '""')}"`,
      `"${f.district}"`,
      `"${f.promoter.replace(/"/g, '""')}"`,
      `"${f.quarter}"`,
      `"${f.form_type}"`,
      `"${f.metric.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      `"${f.unit}"`,
      f.web_val !== null ? f.web_val : '""',
      f.pdf_val !== null ? f.pdf_val : '""',
      f.absolute_variance !== null ? f.absolute_variance : '""',
      f.relative_variance !== null ? f.relative_variance.toFixed(2) : '""',
      `"${f.status}"`,
      `"${f.severity}"`,
      `"${f.reason.replace(/"/g, '""')}"`,
      `"${f.document_url || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RERA_Forensic_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSingleFinding = (finding: AuditFinding) => {
    handleExportCSV([finding]);
  };

  return (
    <div className="min-h-screen text-[#1E2046] flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        criticalCount={database.summary.total_critical}
        openMethodology={() => setMethodologyModalOpen(true)}
      />

      {/* Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        criticalCount={database.summary.total_critical}
        openExportModal={() => setExportModalOpen(true)}
        openMethodology={() => setMethodologyModalOpen(true)}
        activeTab={activeTab}
      />

      {/* Global Search Results Overlay Palette */}
      {searchResults && (
        <div className={`fixed top-24 z-40 max-w-2xl w-full p-4 transition-all duration-300 ${
          sidebarCollapsed ? 'left-24' : 'left-72'
        }`}>
          <div className="bg-white/95 border border-slate-200/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <span className="text-xs font-bold text-[#1E2046] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#3B5BFD]" />
                Search Results for "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#7C8BA0] hover:text-[#1E2046] p-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto mt-4 space-y-4 text-xs pr-1">
              {/* Projects match */}
              {searchResults.projects.length > 0 && (
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#7C8BA0] tracking-wider block mb-2">
                    Schemes Matched ({searchResults.projects.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.projects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleSelectProject(p.id);
                          setSearchQuery('');
                        }}
                        className="p-3 rounded-2xl bg-[#F8FAFD] hover:bg-[#F1F5FB] cursor-pointer flex items-center justify-between transition-colors border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3B5BFD] flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#1E2046] block">{p.name}</span>
                            <span className="text-[11px] text-[#7C8BA0]">{p.promoter} • {p.district}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#7C8BA0]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings match */}
              {searchResults.findings.length > 0 && (
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#7C8BA0] tracking-wider block mb-2">
                    Findings & Discrepancies ({searchResults.findings.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.findings.map(f => (
                      <div
                        key={f.id}
                        onClick={() => handleNavigateToReconciliation(f.project_id, f.quarter, f.form_type)}
                        className="p-3 rounded-2xl bg-[#F8FAFD] hover:bg-[#F1F5FB] cursor-pointer flex items-center justify-between transition-colors border border-slate-100 gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1E2046] truncate">{f.metric}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#3B5BFD] font-semibold">{f.quarter}</span>
                          </div>
                          <span className="text-[11px] text-[#7C8BA0] block truncate mt-0.5">
                            {f.project_name} • {f.form_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold tabular-nums text-[#1E2046]">
                            {f.unit === '₹' ? formatINR(f.absolute_variance) : `${f.absolute_variance?.toFixed(1)} pp`}
                          </span>
                          <RiskBadge severity={f.severity} status={f.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.projects.length === 0 && searchResults.findings.length === 0 && (
                <div className="p-8 text-center text-[#7C8BA0]">
                  No schemes or audit findings matched your query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 pt-40 px-6 sm:px-8 pb-12 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-24' : 'ml-72'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              database={database}
              onSelectProject={handleSelectProject}
              onNavigateToReconciliation={handleNavigateToReconciliation}
              onViewEvidence={handleViewEvidence}
              onExportFinding={handleExportSingleFinding}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectView
              database={database}
              selectedProjectId={activeProjectForDeepDive}
              onSelectProject={setActiveProjectForDeepDive}
              onNavigateToReconciliation={handleNavigateToReconciliation}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              database={database}
              currentProject={activeProjectForDeepDive}
              onSelectProject={setActiveProjectForDeepDive}
              currentQuarter={reconciliationQuarter}
              onSelectQuarter={setReconciliationQuarter}
              currentForm={reconciliationForm}
              onSelectForm={setReconciliationForm}
              onViewEvidence={handleViewEvidence}
              onExportFinding={handleExportSingleFinding}
            />
          )}

          {activeTab === 'red-flags' && (
            <RedFlagsView
              database={database}
              onNavigateToReconciliation={handleNavigateToReconciliation}
              onViewEvidence={handleViewEvidence}
              onExportCSV={handleExportCSV}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              database={database}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'tests' && (
            <TestSuiteView />
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        documentUrl={evidenceDocUrl}
        finding={evidenceFinding}
      />

      <MethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        database={database}
        onExportCSV={handleExportCSV}
      />

      {/* Print Dossier Template (Shown only when printing) */}
      <div className="hidden print:block p-8 bg-white text-black font-serif">
        <h1 className="text-2xl font-bold border-b pb-2">RAJASTHAN RERA FORENSIC AUDIT DOSSIER</h1>
        <p className="text-sm text-gray-600 mt-1">Generated: {new Date().toLocaleString('en-IN')} | Compliance Intelligence Platform</p>
        
        <div className="mt-6 border p-4 rounded">
          <h2 className="text-base font-bold mb-2">Executive Portfolio Summary</h2>
          <p className="text-sm">Total Schemes Audited: {database.summary.total_projects}</p>
          <p className="text-sm">Total Active Quarters Audited: {database.summary.active_quarters_count}</p>
          <p className="text-sm">Total Audited Capital: {formatINR(database.summary.audited_capital_inr)}</p>
          <p className="text-sm">Global Discrepancy Rate: {database.summary.global_discrepancy_rate}%</p>
          <p className="text-sm font-bold text-red-600">Critical Statutory Breaches: {database.summary.total_critical}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-base font-bold mb-3 border-b">Top Critical Findings Requiring Regulatory Intervention</h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Project</th>
                <th className="py-2">Quarter</th>
                <th className="py-2">Form & Metric</th>
                <th className="py-2 text-right">Web Value</th>
                <th className="py-2 text-right">Certified Proof</th>
                <th className="py-2 text-right">Discrepancy</th>
              </tr>
            </thead>
            <tbody>
              {database.all_findings.filter(f => f.severity === 'CRITICAL').slice(0, 15).map(f => (
                <tr key={f.id} className="border-b">
                  <td className="py-1.5">{f.project_name}</td>
                  <td className="py-1.5">{f.quarter}</td>
                  <td className="py-1.5">{f.metric}</td>
                  <td className="py-1.5 text-right">{f.unit === '₹' ? formatINR(f.web_val) : `${f.web_val}%`}</td>
                  <td className="py-1.5 text-right font-bold">{f.unit === '₹' ? formatINR(f.pdf_val) : `${f.pdf_val}%`}</td>
                  <td className="py-1.5 text-right font-bold text-red-600">{f.unit === '₹' ? formatINR(f.absolute_variance) : `${f.absolute_variance?.toFixed(1)} pp`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
