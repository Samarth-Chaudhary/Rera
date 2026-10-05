import React from 'react';
import { X, Download, FileSpreadsheet, Printer } from 'lucide-react';
import type { AuditFinding, NormalizedDatabase } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: NormalizedDatabase;
  onExportCSV: (findings: AuditFinding[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  database,
  onExportCSV,
}) => {
  if (!isOpen) return null;

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#1B263B] border border-[#415A77]/40 rounded-3xl p-6 shadow-2xl relative text-[#F4F1DE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#415A77]/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#415A77]/30 text-[#D4C4A8] border border-[#D4C4A8]/30 flex items-center justify-center shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F1DE]">Export Forensic Dossier</h3>
              <span className="text-xs text-[#D4C4A8]/80">Regulatory Audit Reports & Raw Datasets</span>
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
        <div className="py-6 space-y-4">
          {/* Option 1: CSV Export */}
          <div className="p-4 rounded-2xl bg-[#0D1B2A]/90 border border-[#415A77]/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#778D7A]/25 text-[#778D7A] border border-[#778D7A]/40 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F4F1DE]">Full Forensic CSV Dataset</h4>
                <p className="text-xs text-[#D4C4A8]/80 mt-0.5">
                  Downloads all 692 normalized audit findings with Web and Certified PDF figures, absolute & relative variances, severity scores, and cloud document links.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onExportCSV(database.all_findings);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#778D7A] hover:bg-[#687C6B] text-[#0D1B2A] font-extrabold text-xs shadow-lg shadow-[#0D1B2A]/70 transition-all flex-shrink-0"
            >
              Download CSV
            </button>
          </div>

          {/* Option 2: Print/Save as PDF Regulatory Dossier */}
          <div className="p-4 rounded-2xl bg-[#0D1B2A]/90 border border-[#415A77]/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#415A77]/30 text-[#D4C4A8] border border-[#D4C4A8]/30 flex items-center justify-center flex-shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F4F1DE]">Official PDF Audit Dossier</h4>
                <p className="text-xs text-[#D4C4A8]/80 mt-0.5">
                  Generates a clean, formatted executive summary document with portfolio metrics, critical statutory findings, and methodology disclosures suitable for regulatory submission.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                handlePrintDossier();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#415A77] to-[#2B3E54] hover:from-[#4A6687] text-[#F4F1DE] font-bold text-xs shadow-lg shadow-[#0D1B2A]/70 border border-[#D4C4A8]/30 transition-all flex-shrink-0"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#415A77]/25 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#D4C4A8] hover:text-[#F4F1DE]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
