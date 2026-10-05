import type { Severity, AuditStatus } from '../types';

/**
 * Robust currency parser handling Indian formatting, symbols (₹), commas, spaces, and edge cases.
 * Example: "₹1,06,57,15,460.00" -> 1065715460
 */
export function parseCurrency(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  const s = String(val).trim();
  if (!s || s === '-' || s === 'N/A' || s === 'None' || s === 'null' || s === 'Not Available' || s === 'ignored' || s === 'on') {
    return null;
  }
  // Strip currency symbol ₹, commas, and spaces
  let cleaned = s.replace(/[₹,\s]/g, '');
  // Clean date concatenation artifacts (e.g., 30-06-20250)
  cleaned = cleaned.replace(/^\d{2}-\d{2}-\d{4}/, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Robust percentage parser handling %, spaces, and strings.
 * Example: "95%" -> 95
 */
export function parsePercentage(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  const s = String(val).trim();
  if (!s || s === '-' || s === 'N/A' || s === 'None' || s === 'null' || s === 'Not Available' || s === 'Not Yet Started' || s === 'Work in Progress') {
    return 0.0;
  }
  const cleaned = s.replace(/[%\s,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Formats Indian Rupees into human-readable Lakhs and Crores with full precision tooltips.
 * Example: 1045501500 -> "₹104.55 Cr"
 */
export function formatINR(val: number | null | undefined, options?: { full?: boolean; compact?: boolean }): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  if (options?.full) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  }
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} Lakh`;
  } else {
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }
}

/**
 * Formats percentage values with precision.
 */
export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return `${val.toFixed(1)}%`;
}

/**
 * Calculates absolute variance: pdf_val - web_val
 */
export function calculateVariance(webVal: number | null, pdfVal: number | null): number | null {
  if (webVal === null || pdfVal === null) return null;
  return pdfVal - webVal;
}

/**
 * Calculates relative variance safely avoiding division by zero.
 */
export function calculateRelativeVariance(webVal: number | null, pdfVal: number | null): number | null {
  if (webVal === null || pdfVal === null) return null;
  const absVar = Math.abs(pdfVal - webVal);
  const denom = Math.max(Math.abs(pdfVal), Math.abs(webVal), 1.0);
  return (absVar / denom) * 100;
}

/**
 * Independent regulatory risk engine.
 */
export function calculateSeverity(
  _metric: string,
  webVal: number | null,
  pdfVal: number | null,
  unit: '%' | '₹',
  isMissingDoc = false,
  isIgnored = false
): { status: AuditStatus; severity: Severity; reason: string } {
  if (isIgnored) {
    return {
      status: 'Ignored',
      severity: 'IGNORED',
      reason: 'Standard portal placeholder row excluded from audit statistics'
    };
  }
  if (isMissingDoc) {
    return {
      status: 'Missing Document',
      severity: 'DATA GAP',
      reason: 'Required certified legal evidence was not found or was not uploaded to portal'
    };
  }
  if (webVal === null || pdfVal === null) {
    return {
      status: 'Unverified',
      severity: 'WARNING',
      reason: 'Data point is missing in either the public portal or the certified document'
    };
  }

  const absVar = Math.abs(pdfVal - webVal);

  if (unit === '%') {
    if (absVar < 0.5) {
      return {
        status: 'Match',
        severity: 'MATCH',
        reason: 'Public declaration matches certified evidence within 0.5% tolerance'
      };
    } else if (absVar > 30.0) {
      return {
        status: 'Mismatch',
        severity: 'CRITICAL',
        reason: `Physical progress discrepancy of ${absVar.toFixed(1)} percentage points exceeds the 30 pp critical threshold`
      };
    } else {
      return {
        status: 'Mismatch',
        severity: 'WARNING',
        reason: `Physical progress discrepancy of ${absVar.toFixed(1)} percentage points detected`
      };
    }
  } else {
    // Financial (INR)
    if (absVar <= 100) {
      return {
        status: 'Match',
        severity: 'MATCH',
        reason: 'Public declaration matches certified evidence within ₹100 rounding tolerance'
      };
    } else if (absVar >= 1000000) {
      return {
        status: 'Mismatch',
        severity: 'CRITICAL',
        reason: `Financial discrepancy of ${formatINR(absVar)} exceeds the ₹10 Lakh critical threshold`
      };
    } else {
      return {
        status: 'Mismatch',
        severity: 'WARNING',
        reason: `Financial discrepancy of ${formatINR(absVar)} detected below critical threshold`
      };
    }
  }
}
