import React from 'react';
import type { ProjectId } from '../../types';
import { 
  Search, 
  Bell, 
  Mail, 
  Plus, 
  Building, 
  X, 
  ChevronDown, 
  BookOpen 
} from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
  selectedProject: ProjectId | 'all';
  setSelectedProject: (p: ProjectId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  criticalCount: number;
  openExportModal: () => void;
  openMethodology: () => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  selectedProject,
  setSelectedProject,
  searchQuery,
  setSearchQuery,
  criticalCount,
  openExportModal,
  openMethodology,
  activeTab = 'overview',
}) => {
  const sectionTitles: Record<string, string> = {
    overview: 'Overview',
    projects: 'Projects & Portfolios',
    reconciliation: 'Quarterly Reconciliation Matrix',
    'red-flags': 'Red Flags & Regulatory Anomalies',
    documents: 'Certified Document Repository',
    tests: 'Audit Test Suite'
  };

  const currentTitle = sectionTitles[activeTab] || 'Overview';

  return (
    <header 
      className={`fixed top-0 right-0 z-30 transition-all duration-300 px-6 pt-4 pb-3 bg-[#F8F9FD]/95 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_25px_rgba(200,210,230,0.2)] ${
        sidebarCollapsed ? 'left-24' : 'left-72'
      }`}
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Bar: Greeting on left, Pills & Actions on right */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Greeting & Subtitle */}
          <div>
            <h1 className="text-2xl font-black text-[#1E2046] tracking-tight flex items-center gap-2">
              Hello Admin!
            </h1>
            <p className="text-xs text-[#7C8BA0] font-medium mt-0.5">
              Measure Real Estate Compliance & Quarterly Forensic Audit Trajectory.
            </p>
          </div>

          {/* Right: Controls pill group (flex-nowrap to prevent ugly wrapping) */}
          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Year Selector Pill */}
            <div className="relative flex-shrink-0">
              <select
                aria-label="Filter by Year"
                defaultValue="2024"
                className="appearance-none bg-white text-xs font-bold text-[#1E2046] pl-3 pr-7 py-1.5 rounded-2xl border border-slate-100 shadow-pill hover:border-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="2024">Year 2024</option>
                <option value="2023">Year 2023</option>
                <option value="all">All Years</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#7C8BA0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Selector Pill */}
            <div className="relative flex-shrink-0">
              <div className="flex items-center bg-white rounded-2xl border border-slate-100 shadow-pill px-2.5 py-1.5 hover:border-slate-200">
                <Building className="w-3.5 h-3.5 text-[#3B5BFD] mr-1.5" />
                <select
                  aria-label="Filter by Project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value as ProjectId | 'all')}
                  className="appearance-none bg-transparent text-xs font-bold text-[#1E2046] pr-4 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Projects (3)</option>
                  <option value="dream-colony">Dream Colony (Ajmer)</option>
                  <option value="ridhi-sidhi">Ridhi Sidhi Hub (SGR)</option>
                  <option value="shiv-enclave">Shiv Enclave (Jaipur)</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#7C8BA0] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Pill Search Bar */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-[#9CA8BC] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-32 md:w-40 lg:w-48 pl-8 pr-6 py-1.5 bg-white border border-slate-100 rounded-2xl text-xs font-medium text-[#1E2046] placeholder-[#9CA8BC] shadow-pill focus:outline-none focus:border-[#3B5BFD]/50 focus:w-56 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8BA0] hover:text-[#1E2046]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Language / Region Pill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-100 rounded-2xl px-2.5 py-1.5 shadow-pill text-xs font-semibold text-[#1E2046] flex-shrink-0">
              <span className="text-sm">🇮🇳</span>
              <span>English</span>
              <ChevronDown className="w-3 h-3 text-[#7C8BA0]" />
            </div>

            {/* Mail Icon Button */}
            <button 
              onClick={openMethodology}
              title="Forensic Audit Methodology & Formulas"
              className="relative w-8 h-8 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all flex-shrink-0"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            </button>

            {/* Notification Bell with Red Dot */}
            <button 
              onClick={openExportModal}
              title={`${criticalCount} Critical Statutory Breaches Detected`}
              className="relative w-8 h-8 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all flex-shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white" />
              )}
            </button>

            {/* Circular User Avatar */}
            <div className="flex items-center pl-0.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B5BFD] via-[#A855F7] to-[#FF6B35] p-0.5 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] font-black text-[#1E2046]">RA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Row: Section Title on left, Coral CTA button on right */}
        <div className="flex items-center justify-between pt-0.5">
          <div>
            <h2 className="text-xl font-extrabold text-[#1E2046] tracking-tight">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openMethodology}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-pill text-xs font-bold text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3B5BFD]" />
              <span>RERA Rules</span>
            </button>

            {/* Vibrant Coral Gradient CTA Button (+ Create Notice / Export Dossier) */}
            <button
              onClick={openExportModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create Notice</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
