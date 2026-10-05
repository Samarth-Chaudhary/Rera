import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronDown,
  Download,
  ThumbsUp,
  Search,
  Layers,
  ExternalLink,
  Eye,
  Building
} from 'lucide-react';
import type { NormalizedDatabase, ProjectId, AuditFinding, FormType } from '../../types';
import { formatINR } from '../../lib/formatting';
import { RiskBadge, HealthBadgeView } from '../ui/RiskBadge';

interface OverviewViewProps {
  database: NormalizedDatabase;
  onSelectProject: (id: ProjectId) => void;
  onNavigateToReconciliation: (project: ProjectId, quarter: string, form: FormType) => void;
  onViewEvidence: (url: string, finding?: AuditFinding) => void;
  onExportFinding: (finding: AuditFinding) => void;
}

// Micro Donut Ring component for KPI cards
const RadialDonutRing: React.FC<{
  percent: number;
  color: string;
  arrow: 'up' | 'down';
}> = ({ percent, color, arrow }) => {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 44 44">
        {/* Background Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity="0.18"
          strokeWidth="3.5"
        />
        {/* Progress Arc */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Arrow in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {arrow === 'up' ? (
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" style={{ color }} />
        ) : (
          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" style={{ color }} />
        )}
      </div>
    </div>
  );
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  database,
  onSelectProject,
  onNavigateToReconciliation,
  onViewEvidence,
  onExportFinding,
}) => {
  const { summary, projects, all_findings } = database;

  // Selected finding state for forensic ledger
  const [selectedFindingId, setSelectedFindingId] = useState<string>(all_findings[0]?.id || '');
  const [findingFilter, setFindingFilter] = useState<'ALL' | 'CRITICAL' | 'FINANCIAL' | 'PHYSICAL' | 'DATA GAP'>('ALL');
  const [findingSearch, setFindingSearch] = useState('');

  // Filtered priority findings for left pane
  const filteredFindings = useMemo(() => {
    return all_findings.filter(f => {
      if (f.status === 'Ignored') return false;
      
      if (findingFilter === 'CRITICAL' && f.severity !== 'CRITICAL') return false;
      if (findingFilter === 'FINANCIAL' && f.unit !== '₹') return false;
      if (findingFilter === 'PHYSICAL' && f.unit !== '%') return false;
      if (findingFilter === 'DATA GAP' && f.severity !== 'DATA GAP') return false;

      if (findingSearch) {
        const q = findingSearch.toLowerCase();
        return f.project_name.toLowerCase().includes(q) ||
               f.metric.toLowerCase().includes(q) ||
               f.quarter.toLowerCase().includes(q) ||
               f.id.toLowerCase().includes(q);
      }
      return true;
    }).slice(0, 50);
  }, [all_findings, findingFilter, findingSearch]);

  const selectedFinding = useMemo(() => {
    return all_findings.find(f => f.id === selectedFindingId) || filteredFindings[0] || all_findings[0];
  }, [all_findings, selectedFindingId, filteredFindings]);

  // SVG Spline coordinates for "Salary Statistics"
  // Years: 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017
  // Width: 600, Height: 180, Y 0 at 160, Y 100 at 20
  const splineYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">

      {/* ROW 1: THE 5 KPI STAT CARDS WITH DONUT MICRO-RINGS (Exact Match to Reference Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Users / Schemes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-4">
          <RadialDonutRing percent={72} color="#FF6B35" arrow="up" />
          <div>
            <div className="text-2xl font-black text-[#1E2046] tracking-tight leading-none">
              348
            </div>
            <div className="text-xs font-semibold text-[#7C8BA0] mt-1">
              Users
            </div>
          </div>
        </div>

        {/* Card 2: Events / Filing Quarters */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-4">
          <RadialDonutRing percent={48} color="#06B6D4" arrow="down" />
          <div>
            <div className="text-2xl font-black text-[#1E2046] tracking-tight leading-none">
              128
            </div>
            <div className="text-xs font-semibold text-[#7C8BA0] mt-1">
              Events
            </div>
          </div>
        </div>

        {/* Card 3: Holidays / Escrow Accounts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-4">
          <RadialDonutRing percent={65} color="#F59E0B" arrow="up" />
          <div>
            <div className="text-2xl font-black text-[#1E2046] tracking-tight leading-none">
              10
            </div>
            <div className="text-xs font-semibold text-[#7C8BA0] mt-1">
              Holidays
            </div>
          </div>
        </div>

        {/* Card 4: Payrolls / Monitored Capital */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-4">
          <RadialDonutRing percent={58} color="#10B981" arrow="down" />
          <div>
            <div className="text-2xl font-black text-[#1E2046] tracking-tight leading-none">
              3458
            </div>
            <div className="text-xs font-semibold text-[#7C8BA0] mt-1">
              Payrolls
            </div>
          </div>
        </div>

        {/* Card 5: Reports / Audit Filings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover transition-all flex items-center gap-4">
          <RadialDonutRing percent={82} color="#8B5CF6" arrow="up" />
          <div>
            <div className="text-2xl font-black text-[#1E2046] tracking-tight leading-none">
              3488
            </div>
            <div className="text-xs font-semibold text-[#7C8BA0] mt-1">
              Reports
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: SALARY STATISTICS (Dual Spline Line Chart) & EMPLOYEE SATISFACTION (Gauge Arc) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Salary Statistics (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-clay flex flex-col justify-between relative overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left Dropdown Pill */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 shadow-pill rounded-2xl text-xs font-bold text-[#1E2046] hover:border-slate-200 transition-all">
                <span>Salary Statistics</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7C8BA0]" />
              </button>
            </div>

            {/* Right Controls: Sort by Years & Download Button */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#7C8BA0] font-medium">
                <span>Sort by</span>
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 shadow-pill rounded-xl text-xs font-bold text-[#1E2046] hover:border-slate-200">
                    <span>Years</span>
                    <ChevronDown className="w-3 h-3 text-[#7C8BA0]" />
                  </button>
                </div>
              </div>

              {/* Download Icon Button */}
              <button 
                title="Export Data"
                className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Floating Tooltip at 2014 (Positioned precisely as in reference) */}
          <div className="absolute top-16 left-[50%] -translate-x-1/2 z-20 hidden md:block">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-100 shadow-xl text-xs text-left min-w-[200px]">
              <div className="font-extrabold text-[#1E2046] mb-1">2014</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-[#7C8BA0]">
                <div>Marketing: <span className="font-bold text-[#1E2046]">2437</span></div>
                <div>Design: <span className="font-bold text-[#1E2046]">7689</span></div>
                <div>Development: <span className="font-bold text-[#1E2046]">7689</span></div>
                <div>Others: <span className="font-bold text-[#1E2046]">7689</span></div>
              </div>
            </div>
          </div>

          {/* Smooth Dual Spline Curve SVG Chart */}
          <div className="mt-8 pt-4 w-full h-56 relative">
            {/* Horizontal Grid lines and Y-axis labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-medium text-[#9CA8BC]">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">100</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">75</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">50</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">25</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">0</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
            </div>

            {/* SVG Lines */}
            <svg 
              className="absolute inset-0 w-full h-full pl-8 pb-6 pr-2 pt-2"
              viewBox="0 0 700 200" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Orange line glow/shadow */}
                <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#FF6B35" floodOpacity="0.25" />
                </filter>
                {/* Slate line glow/shadow */}
                <filter id="slateGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#475569" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* Slate/Navy Spline Line (Line 1) */}
              <path
                d="M 20,130 C 80,120 120,165 180,140 C 240,115 280,75 350,95 C 420,115 480,85 540,105 C 600,125 650,110 680,120"
                fill="none"
                stroke="#5B6B82"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#slateGlow)"
              />

              {/* Orange/Coral Spline Line (Line 2) */}
              <path
                d="M 20,150 C 90,140 130,85 200,90 C 270,95 300,140 370,130 C 420,120 460,40 510,40 C 560,40 600,135 680,130"
                fill="none"
                stroke="#FF6B35"
                strokeWidth="4.5"
                strokeLinecap="round"
                filter="url(#orangeGlow)"
              />

              {/* Vertical Highlight Line at Active Year (x ~ 510) */}
              <line
                x1="510"
                y1="40"
                x2="510"
                y2="190"
                stroke="#FF6B35"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Active Highlight Dot on Orange Curve */}
              <circle
                cx="510"
                cy="40"
                r="7"
                fill="#FF6B35"
                stroke="#FFFFFF"
                strokeWidth="3"
                className="filter drop-shadow-md"
              />
            </svg>

            {/* X-axis labels (Years) */}
            <div className="absolute bottom-0 left-8 right-2 flex justify-between text-[11px] font-semibold text-[#9CA8BC]">
              {splineYears.map((yr) => (
                <span key={yr} className={yr === 2014 ? 'text-[#1E2046] font-bold' : ''}>
                  {yr}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Employee Satisfaction (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-clay flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1E2046]">
              Employee Satisfaction
            </h3>
            <button 
              title="Export Metric"
              className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Semi-Circular Gauge / Half-Donut Arc */}
          <div className="flex flex-col items-center justify-center my-auto py-2">
            <div className="relative w-64 h-36 flex items-center justify-center">
              <svg className="w-64 h-36 overflow-visible" viewBox="0 0 240 135">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF8A50" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>

                {/* Background Arc: 180° semi-circle from (20,120) to (220,120) with radius 100 */}
                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Active Arc (74% of PI * 100 = 314.16 => strokeDashoffset = 314.16 * (1 - 0.74) = 81.68) */}
                <path
                  d="M 20 120 A 100 100 0 0 1 220 120"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="314.16"
                  strokeDashoffset="81.68"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Content: Thumbs Up Icon + 74% */}
              <div className="absolute bottom-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF2EB] text-[#FF6B35] flex items-center justify-center mb-1 shadow-sm">
                  <ThumbsUp className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-3xl font-black text-[#1E2046] tracking-tight">
                  74%
                </div>
              </div>
            </div>

            {/* End Labels 0% and 100% */}
            <div className="w-64 flex justify-between px-3 text-xs font-bold text-[#7C8BA0] mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-[#7C8BA0]">
            Rajasthan RERA Standard Compliance Threshold: <span className="font-bold text-[#1E2046]">70%</span>
          </div>
        </div>
      </div>

      {/* ROW 3: PERFORMANCE STATISTICS (Horizontal Progress Bars) & NEW EMPLOYEES (Grouped Vertical Pill Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Performance Statistics (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-clay flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-[#1E2046]">
              Performance Statistics
            </h3>
            <button 
              title="Export Statistics"
              className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Horizontal Progress Bars */}
          <div className="space-y-5 my-auto">
            {/* Team 1: Developer Team */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-[#1E2046]">Developer Team</span>
                <span className="text-[#1E2046]">65%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#FF6B35] transition-all duration-700 ease-out"
                  style={{ width: '65%' }}
                />
              </div>
            </div>

            {/* Team 2: Design Team */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-[#1E2046]">Design Team</span>
                <span className="text-[#1E2046]">84%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#06B6D4] transition-all duration-700 ease-out"
                  style={{ width: '84%' }}
                />
              </div>
            </div>

            {/* Team 3: Marketing Team */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-[#1E2046]">Marketing Team</span>
                <span className="text-[#1E2046]">28%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#10B981] transition-all duration-700 ease-out"
                  style={{ width: '28%' }}
                />
              </div>
            </div>

            {/* Team 4: Management Team */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-[#1E2046]">Management Team</span>
                <span className="text-[#1E2046]">16%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#8B5CF6] transition-all duration-700 ease-out"
                  style={{ width: '16%' }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#7C8BA0]">
            <span>Active Certifications</span>
            <span className="font-bold text-[#1E2046]">R-1, R-2, R-3 Verified</span>
          </div>
        </div>

        {/* Right: New Employees (8 Cols - Grouped Rounded Pill Bars Chart) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-clay flex flex-col justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left Pill Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 shadow-pill rounded-2xl text-xs font-bold text-[#1E2046] hover:border-slate-200 transition-all">
                <span>New Employees</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7C8BA0]" />
              </button>
            </div>

            {/* Tooltip Pill at 2014 */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-100 shadow-xl rounded-2xl px-3.5 py-1.5 text-xs">
              <div className="text-left font-bold text-[#1E2046]">
                <div>2014</div>
                <div className="text-[10px] text-[#7C8BA0] font-normal">Male: 248 | Female: 194</div>
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#FF6B35] flex items-center justify-center text-[10px] font-bold text-[#FF6B35]">
                28%
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-[#7C8BA0] font-medium">
                <span>Sort by</span>
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 shadow-pill rounded-xl text-xs font-bold text-[#1E2046] hover:border-slate-200">
                    <span>Years</span>
                    <ChevronDown className="w-3 h-3 text-[#7C8BA0]" />
                  </button>
                </div>
              </div>

              <button 
                title="Export Data"
                className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-pill flex items-center justify-center text-[#7C8BA0] hover:text-[#1E2046] hover:border-slate-200 transition-all"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grouped Pill Bars SVG Graphic (Exact reproduction of reference image) */}
          <div className="mt-8 pt-4 w-full h-56 relative">
            {/* Y-axis labels & horizontal guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] font-medium text-[#9CA8BC]">
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">100</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">75</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">50</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">25</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 text-right">0</span>
                <div className="flex-1 h-px bg-slate-100/80" />
              </div>
            </div>

            {/* Pill Bars SVG */}
            <svg 
              className="absolute inset-0 w-full h-full pl-8 pb-6 pr-2 pt-2"
              viewBox="0 0 700 200" 
              preserveAspectRatio="none"
            >
              {/* Grouped rounded pill bars for years 2010 to 2017 */}
              {/* 2010 */}
              <rect x="30" y="100" width="10" height="90" rx="5" fill="#E2E8F0" />
              <rect x="44" y="60" width="10" height="130" rx="5" fill="#94A3B8" />

              {/* 2011 */}
              <rect x="110" y="40" width="10" height="150" rx="5" fill="#E2E8F0" />
              <rect x="124" y="70" width="10" height="120" rx="5" fill="#FF6B35" />

              {/* 2012 */}
              <rect x="190" y="80" width="10" height="110" rx="5" fill="#CBD5E1" />
              <rect x="204" y="50" width="10" height="140" rx="5" fill="#94A3B8" />

              {/* 2013 */}
              <rect x="270" y="90" width="10" height="100" rx="5" fill="#CBD5E1" />
              <rect x="284" y="60" width="10" height="130" rx="5" fill="#FF6B35" />
              <rect x="298" y="110" width="10" height="80" rx="5" fill="#64748B" />

              {/* 2014 (Highlighted Year with vertical pin) */}
              <line x1="390" y1="20" x2="390" y2="190" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="390" cy="90" r="6" fill="#FF6B35" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="365" y="80" width="10" height="110" rx="5" fill="#64748B" />
              <rect x="380" y="100" width="10" height="90" rx="5" fill="#FF6B35" />
              <rect x="395" y="70" width="10" height="120" rx="5" fill="#E2E8F0" />

              {/* 2015 */}
              <rect x="460" y="60" width="10" height="130" rx="5" fill="#64748B" />
              <rect x="474" y="80" width="10" height="110" rx="5" fill="#CBD5E1" />

              {/* 2016 */}
              <rect x="540" y="90" width="10" height="100" rx="5" fill="#CBD5E1" />
              <rect x="554" y="130" width="10" height="60" rx="5" fill="#FF6B35" />

              {/* 2017 */}
              <rect x="620" y="50" width="10" height="140" rx="5" fill="#CBD5E1" />
              <rect x="634" y="80" width="10" height="110" rx="5" fill="#FF8A50" />

              {/* Dotted Trendline across the bars */}
              <path
                d="M 40,70 Q 120,60, 200,75 T 390,90 T 560,95 T 640,70"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-2 flex justify-between text-[11px] font-semibold text-[#9CA8BC]">
              {splineYears.map((yr) => (
                <span key={yr} className={yr === 2014 ? 'text-[#1E2046] font-bold' : ''}>
                  {yr}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: AUDITED SCHEMES & FORENSIC LEDGER WORKSPACE (Claymorphic Light Theme) */}
      <div className="pt-4 space-y-5">
        
        {/* Schemes Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#3B5BFD]" />
            <h3 className="text-base font-extrabold text-[#1E2046] tracking-tight">
              Audited Schemes Portfolio
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#7C8BA0]">
            3 Active Projects in Forensic Audit Ledger
          </span>
        </div>

        {/* 3 Scheme Cards in Soft Claymorphic Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(projects).map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-clay hover:shadow-clay-hover cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1E2046] group-hover:text-[#3B5BFD] transition-colors flex items-center gap-1.5">
                      {proj.name}
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#7C8BA0] group-hover:text-[#3B5BFD] transition-colors" />
                    </h4>
                    <p className="text-xs text-[#7C8BA0] mt-0.5">{proj.promoter}</p>
                    <span className="text-[11px] font-mono text-[#9CA8BC]">{proj.registration_no}</span>
                  </div>
                  <HealthBadgeView badge={proj.stats.health_badge} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
                <div className="bg-[#F8FAFD] p-2 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-[#7C8BA0] font-semibold block uppercase">Units Sold</span>
                  <span className="text-xs font-black text-[#1E2046]">{proj.stats.sold_percentage}%</span>
                </div>
                <div className="bg-[#F8FAFD] p-2 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-[#7C8BA0] font-semibold block uppercase">Quarters</span>
                  <span className="text-xs font-black text-[#3B5BFD]">{proj.stats.active_quarters} Filed</span>
                </div>
                <div className="bg-[#FFF5F5] p-2 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-rose-500 font-semibold block uppercase">Red Flags</span>
                  <span className="text-xs font-black text-rose-600">{proj.stats.critical_count} Breaches</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Forensic Reconciliation Ledger (Claymorphic) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-clay mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B5BFD] to-[#60A5FA] flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#3B5BFD] uppercase tracking-widest block">Audit Ledger</span>
                <h3 className="text-lg font-black text-[#1E2046]">Statutory Discrepancy Findings</h3>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFD] border border-slate-100 rounded-2xl overflow-x-auto">
                {(['ALL', 'CRITICAL', 'FINANCIAL', 'PHYSICAL', 'DATA GAP'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFindingFilter(mode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      findingFilter === mode
                        ? 'bg-white text-[#1E2046] shadow-pill border border-slate-100'
                        : 'text-[#7C8BA0] hover:text-[#1E2046]'
                    }`}
                  >
                    {mode === 'ALL' ? 'All Findings' : mode === 'CRITICAL' ? `Critical (${summary.total_critical})` : mode === 'FINANCIAL' ? 'Financial' : mode === 'PHYSICAL' ? 'Physical' : 'Data Gaps'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9CA8BC] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={findingSearch}
                  onChange={(e) => setFindingSearch(e.target.value)}
                  placeholder="Filter findings..."
                  className="pl-8 pr-3 py-1.5 bg-[#F8FAFD] border border-slate-100 rounded-xl text-xs text-[#1E2046] placeholder-[#9CA8BC] focus:outline-none focus:border-[#3B5BFD]/40"
                />
              </div>
            </div>
          </div>

          {/* Dual-Pane Findings Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left List (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col h-[460px] bg-[#F8FAFD] rounded-2xl border border-slate-100 p-3">
              <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                {filteredFindings.map((f) => {
                  const isSelected = f.id === selectedFinding.id;
                  const isCurrency = f.unit === '₹';
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFindingId(f.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all text-left border flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-[#3B5BFD]/40 shadow-pill text-[#1E2046]'
                          : 'bg-white/70 hover:bg-white border-slate-100 text-[#7C8BA0]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected ? 'bg-[#3B5BFD] text-white shadow-sm' : 'bg-slate-100 text-[#7C8BA0]'
                        }`}>
                          {f.project_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block text-[#1E2046]">{f.metric}</span>
                          <span className="text-[11px] block truncate text-[#7C8BA0]">{f.project_name} • {f.quarter}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <RiskBadge severity={f.severity} size="sm" showIcon={false} />
                        <span className="font-bold tabular-nums text-xs mt-1 block text-[#1E2046]">
                          {isCurrency ? formatINR(f.absolute_variance) : f.absolute_variance !== null ? `${f.absolute_variance.toFixed(1)} pp` : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Inspection Card (7 Cols) */}
            <div className="lg:col-span-7 bg-[#F8FAFD] rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-mono text-[#3B5BFD] uppercase tracking-wider font-bold">
                      {selectedFinding.id}
                    </span>
                    <h4 className="text-base font-black text-[#1E2046] mt-0.5">
                      {selectedFinding.metric}
                    </h4>
                    <p className="text-xs text-[#7C8BA0] mt-0.5">
                      {selectedFinding.project_name} • {selectedFinding.quarter}
                    </p>
                  </div>
                  <RiskBadge severity={selectedFinding.severity} size="md" />
                </div>

                {/* Evidence Comparison Boxes */}
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-[#7C8BA0] uppercase block">Web Portal Self-Declaration</span>
                    <span className="text-lg font-black text-[#1E2046] mt-1 block">
                      {selectedFinding.unit === '₹' ? formatINR(selectedFinding.web_val) : selectedFinding.web_val !== null ? `${selectedFinding.web_val}%` : 'Missing'}
                    </span>
                    <span className="text-[10px] text-[#9CA8BC]">Unverified promoter entry</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-[#3B5BFD] uppercase block">Legal Certified Baseline</span>
                    <span className="text-lg font-black text-[#1E2046] mt-1 block">
                      {selectedFinding.unit === '₹' ? formatINR(selectedFinding.pdf_val) : selectedFinding.pdf_val !== null ? `${selectedFinding.pdf_val}%` : 'Missing Document'}
                    </span>
                    <span className="text-[10px] text-[#9CA8BC]">{selectedFinding.form_type} signed</span>
                  </div>
                </div>

                {/* Statutory Finding Reason */}
                <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-100">
                  <span className="text-[11px] font-bold text-[#1E2046] block mb-1">Forensic Analysis:</span>
                  <p className="text-xs text-[#7C8BA0] leading-relaxed">
                    {selectedFinding.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-200">
                <button
                  onClick={() => onNavigateToReconciliation(selectedFinding.project_id, selectedFinding.quarter, selectedFinding.form_type)}
                  className="text-xs font-bold text-[#3B5BFD] hover:underline flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Quarterly Matrix</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedFinding.document_url && (
                    <button
                      onClick={() => onViewEvidence(selectedFinding.document_url!, selectedFinding)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-pill text-xs font-bold text-[#1E2046] hover:border-slate-300 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3 text-[#3B5BFD]" />
                      <span>View Signed PDF</span>
                    </button>
                  )}
                  <button
                    onClick={() => onExportFinding(selectedFinding)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1E2046] text-white text-xs font-bold hover:bg-[#2B2E5C] flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Notice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
