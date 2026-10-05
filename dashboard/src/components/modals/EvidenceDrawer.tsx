import React from 'react';
import { X, ExternalLink, FileText } from 'lucide-react';
import type { AuditFinding } from '../../types';
import { formatINR } from '../../lib/formatting';
import { RiskBadge } from '../ui/RiskBadge';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  finding?: AuditFinding | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  finding,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#1B263B] border border-[#415A77]/40 rounded-3xl p-6 shadow-2xl relative text-[#F4F1DE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#415A77]/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#415A77]/30 text-[#D4C4A8] border border-[#D4C4A8]/30 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F1DE]">Regulatory Certificate Proof</h3>
              <span className="text-xs text-[#D4C4A8]/80 font-mono">Government Cloud Document Verification</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0D1B2A] text-[#D4C4A8] hover:text-[#F4F1DE] flex items-center justify-center transition-colors border border-[#415A77]/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4 text-xs">
          {finding && (
            <div className="p-4 rounded-2xl bg-[#0D1B2A]/90 border border-[#415A77]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#D4C4A8] font-bold">{finding.form_type}</span>
                <RiskBadge severity={finding.severity} status={finding.status} size="sm" />
              </div>

              <div>
                <span className="text-[#D4C4A8]/70 block">Metric Audited:</span>
                <span className="text-[#F4F1DE] font-bold text-sm block mt-0.5">{finding.metric}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#415A77]/20">
                <div>
                  <span className="text-[#D4C4A8]/70 block">Declared on Web:</span>
                  <span className="font-mono font-bold text-[#F4F1DE] text-sm">
                    {finding.unit === '₹' ? formatINR(finding.web_val) : `${finding.web_val}%`}
                  </span>
                </div>
                <div>
                  <span className="text-[#D4C4A8] block">Certified in Certificate:</span>
                  <span className="font-mono font-bold text-[#D4C4A8] text-sm">
                    {finding.unit === '₹' ? formatINR(finding.pdf_val) : `${finding.pdf_val}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#0D1B2A]/60 border border-[#415A77]/25 space-y-2">
            <span className="font-semibold text-[#D4C4A8] block">Source Certificate URI:</span>
            <div className="p-2.5 rounded-xl bg-[#0D1B2A] font-mono text-[11px] text-[#D4C4A8]/90 break-all select-all border border-[#415A77]/30">
              {documentUrl || 'No cloud document URL provided'}
            </div>
            <span className="text-[11px] text-[#D4C4A8]/60 block">
              Official document hosted on the state portal (<code className="text-[#D4C4A8]">reraapp.rajasthan.gov.in</code>).
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#415A77]/25 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#D4C4A8] hover:text-[#F4F1DE]"
          >
            Close
          </button>

          {documentUrl && documentUrl.startsWith('http') && (
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#415A77] to-[#2B3E54] hover:from-[#4A6687] hover:to-[#344B66] text-[#F4F1DE] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0D1B2A]/80 border border-[#D4C4A8]/30 transition-all"
            >
              <span>Open Document in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D4C4A8]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
