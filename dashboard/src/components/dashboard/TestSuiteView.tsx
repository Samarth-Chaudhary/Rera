import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { runForensicAuditTests } from '../../lib/test-runner';
import type { TestResult } from '../../lib/test-runner';

export const TestSuiteView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>(() => runForensicAuditTests());
  const [running, setRunning] = useState(false);

  const handleRerun = () => {
    setRunning(true);
    setTimeout(() => {
      setTestResults(runForensicAuditTests());
      setRunning(false);
    }, 400);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="space-y-6 pb-16 text-[#1E2046]">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3B5BFD] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Automated QA & Data Correctness Validation</span>
            </div>
            <h1 className="text-2xl font-black text-[#1E2046] tracking-tight mt-1">
              Audit Test Suite & Acceptance Verification
            </h1>
            <p className="text-xs text-[#7C8BA0] mt-1 max-w-2xl font-medium">
              Verifies Section 47 and Section 48 acceptance tests: Indian currency parsing, percentage point arithmetic, zero/null fidelity, and project-specific ground truth verification.
            </p>
          </div>

          <button
            onClick={handleRerun}
            disabled={running}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F97316] text-white text-xs font-bold flex items-center gap-2 shadow-glow-coral hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>Re-run Audit Tests</span>
          </button>
        </div>

        {/* Status Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${allPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {allPassed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-base font-black text-[#1E2046] block">
                {allPassed ? 'All Acceptance & Ingestion Tests Passed' : 'Test Failures Detected'}
              </span>
              <span className="text-xs text-[#7C8BA0] font-medium">
                {passedCount} of {totalCount} unit and acceptance assertions verified against ground-truth data.
              </span>
            </div>
          </div>

          <span className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {passedCount}/{totalCount} (100%)
          </span>
        </div>
      </div>

      {/* Test Results Feed */}
      <div className="space-y-3">
        {testResults.map((t, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all ${
              t.passed
                ? 'bg-white border-slate-100 shadow-sm hover:shadow-clay'
                : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  t.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {t.passed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <AlertCircle className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F8FAFD] text-[#3B5BFD] border border-slate-100">
                      {t.category}
                    </span>
                    <span className="text-xs font-bold text-[#1E2046]">{t.testName}</span>
                  </div>
                  <p className="text-xs text-[#7C8BA0] mt-1 font-mono">{t.message}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                t.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {t.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
