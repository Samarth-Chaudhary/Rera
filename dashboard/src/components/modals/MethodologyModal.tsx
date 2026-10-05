import React from 'react';
import { X, BookOpen, Scale, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, FileQuestion } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#1B263B] border border-[#415A77]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#F4F1DE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#415A77]/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#415A77]/30 text-[#D4C4A8] border border-[#D4C4A8]/30 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#F4F1DE]">Forensic Audit Methodology & Legal Basis</h2>
              <span className="text-xs text-[#D4C4A8]/80">Rajasthan Real Estate Regulatory Authority (RERA) Compliance Rules</span>
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
        <div className="py-5 space-y-6 text-xs text-[#D4C4A8]">
          {/* Statutory Background */}
          <div>
            <h3 className="font-bold text-sm text-[#F4F1DE] mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#D4C4A8]" />
              Statutory Basis: Section 4(2)(l)(D) of RERA Act, 2016
            </h3>
            <p className="leading-relaxed text-[#D4C4A8]/80">
              The Real Estate (Regulation and Development) Act mandates that 70% of amounts realized for the real estate project from allottees must be deposited into a separate scheduled bank account (RERA Escrow Account). Withdrawals from this designated account are strictly permissible only in proportion to the percentage of completion of the project, verified and certified independently by:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#F4F1DE]/90">
              <li><strong>Form R-1 (Architect):</strong> Certifies physical percentage completion of all civic & infrastructure works.</li>
              <li><strong>Form R-2 (Engineer):</strong> Certifies total estimated vs incurred development cost and physical engineering progress.</li>
              <li><strong>Form R-3 (Chartered Accountant):</strong> Certifies total project expenditure and determines the permissible net withdrawal.</li>
            </ul>
          </div>

          {/* Normalization & Categorization Methodology */}
          <div>
            <h3 className="font-bold text-sm text-[#F4F1DE] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#778D7A]" />
              Reconciliation & Discrepancy Classification Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#778D7A]/40">
                <span className="font-bold text-[#778D7A] flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MATCH
                </span>
                <p className="text-[#D4C4A8]/70 text-[11px] leading-relaxed">
                  Values match within tolerance (≤ 0.5 percentage points for physical progress; ≤ ₹100 for financial rounding).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#D4C4A8]/40">
                <span className="font-bold text-[#D4C4A8] flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  WARNING
                </span>
                <p className="text-[#D4C4A8]/70 text-[11px] leading-relaxed">
                  Discrepancy detected below critical threshold (&lt; 30 percentage points gap or &lt; ₹10 Lakhs financial variance).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-red-500/30">
                <span className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  CRITICAL BREACH
                </span>
                <p className="text-[#D4C4A8]/70 text-[11px] leading-relaxed">
                  Discrepancy &gt; 30 percentage points OR absolute financial gap &gt; ₹10,00,000 (e.g. ₹104.55 Cr breach in Shiv Enclave).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0D1B2A] border border-[#415A77]/40">
                <span className="font-bold text-[#D4C4A8] flex items-center gap-1.5 mb-1">
                  <FileQuestion className="w-3.5 h-3.5" />
                  DATA GAP / MISSING DOC
                </span>
                <p className="text-[#D4C4A8]/70 text-[11px] leading-relaxed">
                  Certificate link recorded as "Not Found" or missing in government cloud repository. Never falsely classified as a match.
                </p>
              </div>
            </div>
          </div>

          {/* Special Data Rules */}
          <div>
            <h3 className="font-bold text-sm text-[#F4F1DE] mb-2">Special Data Rules Applied</h3>
            <div className="p-3.5 rounded-2xl bg-[#0D1B2A]/80 border border-[#415A77]/25 space-y-2 text-[11px] text-[#D4C4A8]/80">
              <p>
                • <strong>Form R-3 Bottom Placeholder Exclusion:</strong> Rows 2–4 represent portal dropdown placeholders (marked <code className="text-[#F4F1DE]">ignored</code>) and are excluded from discrepancy denominator calculations.
              </p>
              <p>
                • <strong>Currency Normalization:</strong> Indian numbering conventions (Lakhs and Crores) are parsed into standardized 64-bit IEEE floats before comparison.
              </p>
              <p>
                • <strong>Zero vs Null Preservation:</strong> A stated <code className="text-[#F4F1DE]">0%</code> is treated as zero progress, whereas missing records remain <code className="text-[#F4F1DE]">null</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#415A77]/25 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#415A77] to-[#2B3E54] hover:from-[#4A6687] text-[#F4F1DE] font-bold text-xs shadow-lg shadow-[#0D1B2A]/70 border border-[#D4C4A8]/30 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
