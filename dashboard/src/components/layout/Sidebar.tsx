import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Scale, 
  AlertOctagon, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export type NavTab = 'overview' | 'projects' | 'reconciliation' | 'red-flags' | 'documents' | 'tests';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  criticalCount: number;
  openMethodology: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  criticalCount,
  openMethodology,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'projects' as NavTab, label: 'Projects', icon: Building2 },
    { id: 'reconciliation' as NavTab, label: 'Reconciliation', icon: Scale },
    { 
      id: 'red-flags' as NavTab, 
      label: 'Red Flags', 
      icon: AlertOctagon, 
      badge: criticalCount > 0 ? criticalCount : undefined 
    },
    { id: 'documents' as NavTab, label: 'Documents', icon: FileText },
    { id: 'tests' as NavTab, label: 'Audit Tests', icon: ShieldCheck },
  ];

  return (
    <aside 
      className={`fixed top-4 left-4 bottom-4 z-40 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[32px] shadow-[0_15px_40px_rgba(110,125,160,0.12)] flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="h-20 flex items-center px-4 justify-between border-b border-slate-100/80">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Colorful Geometric Logo like 'hr ad.' in reference */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] via-[#A855F7] to-[#3B5BFD] p-0.5 shadow-md shadow-purple-500/20 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B5BFD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-[#1E2046] flex items-center gap-1.5">
                  RERA <span className="text-[#FF6B35]">AUDIT</span>
                </span>
                <span className="text-[10px] text-[#7C8BA0] font-semibold tracking-wider uppercase">Forensic Intel</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#7C8BA0] hover:text-[#1E2046] flex items-center justify-center transition-colors border border-slate-200/60"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Nav Items */}
        <nav className="p-3 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl font-bold text-xs transition-all group relative ${
                  isActive 
                    ? 'bg-[#3B5BFD] text-white shadow-lg shadow-blue-500/30' 
                    : 'text-[#7C8BA0] hover:text-[#1E2046] hover:bg-[#F4F7FB]'
                }`}
              >
                <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-[#7C8BA0] group-hover:text-[#3B5BFD]'}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                </div>
                {!collapsed && (
                  <span className="truncate flex-1 text-left font-bold">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-[#FF6B35]' : 'bg-[#FF6B35] text-white shadow-sm'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FF6B35] ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Methodology & Data Health */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={openMethodology}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-semibold text-xs text-[#7C8BA0] hover:text-[#1E2046] hover:bg-[#F4F7FB] transition-all group"
        >
          <HelpCircle className="w-4 h-4 text-[#7C8BA0] group-hover:text-[#3B5BFD] flex-shrink-0" />
          {!collapsed && <span>Audit Methodology</span>}
        </button>

        <div className={`p-2.5 rounded-2xl bg-[#F8FAFD] border border-slate-100 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm shadow-emerald-500/50 flex-shrink-0 animate-pulse" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#1E2046]">Live Ingestion Active</span>
              <span className="text-[10px] text-[#7C8BA0] font-medium">26 Quarters / 235 Files</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
