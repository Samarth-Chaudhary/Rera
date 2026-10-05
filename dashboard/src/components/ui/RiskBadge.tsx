import React from 'react';
import type { Severity, AuditStatus, HealthBadge as HealthBadgeType } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, FileQuestion, MinusCircle } from 'lucide-react';

interface RiskBadgeProps {
  severity?: Severity;
  status?: AuditStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  severity, 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const effectiveSev: Severity = severity || (status === 'Mismatch' ? 'CRITICAL' : status === 'Match' ? 'MATCH' : status === 'Missing Document' ? 'DATA GAP' : 'WARNING');

  let colorClasses = '';
  let Icon = AlertCircle;
  let label: string = effectiveSev;

  switch (effectiveSev) {
    case 'CRITICAL':
      colorClasses = 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm';
      Icon = AlertCircle;
      label = status === 'Mismatch' ? 'Mismatch (Critical)' : 'Critical';
      break;
    case 'WARNING':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      Icon = AlertTriangle;
      label = status === 'Mismatch' ? 'Mismatch (Warning)' : 'Warning';
      break;
    case 'MATCH':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      Icon = CheckCircle2;
      label = 'Match';
      break;
    case 'DATA GAP':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm';
      Icon = FileQuestion;
      label = 'Missing Doc';
      break;
    case 'IGNORED':
    default:
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      Icon = MinusCircle;
      label = 'Ignored';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1 font-semibold' : size === 'lg' ? 'px-3.5 py-1.5 text-sm gap-2 font-bold' : 'px-2.5 py-1 text-xs gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};

export const HealthBadgeView: React.FC<{ badge: HealthBadgeType }> = ({ badge }) => {
  if (badge === 'CRITICAL RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        CRITICAL RISK
      </span>
    );
  } else if (badge === 'MODERATE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        MODERATE
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        GOOD
      </span>
    );
  }
};

