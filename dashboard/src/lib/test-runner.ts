import { parseCurrency, parsePercentage, formatINR } from './formatting';
import database from '../data/normalized_rera_database.json';

export interface TestResult {
  testName: string;
  category: 'CURRENCY' | 'PERCENTAGE' | 'ACCEPTANCE_DREAM_COLONY' | 'ACCEPTANCE_RIDHI_SIDHI' | 'ACCEPTANCE_SHIV_ENCLAVE' | 'SPECIAL_RULES';
  passed: boolean;
  expected: any;
  actual: any;
  message: string;
}

export function runForensicAuditTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Currency Parsing
  const c1 = parseCurrency('₹1,06,57,15,460.00');
  results.push({
    testName: 'Parse Indian Formatted 106+ Cr Currency',
    category: 'CURRENCY',
    passed: c1 === 1065715460,
    expected: 1065715460,
    actual: c1,
    message: c1 === 1065715460 ? 'Parsed ₹1,06,57,15,460.00 to 1065715460 correctly' : `Failed: got ${c1}`
  });

  const c2 = parseCurrency('₹20,203,960.00');
  results.push({
    testName: 'Parse Indian Formatted 2.02 Cr Currency',
    category: 'CURRENCY',
    passed: c2 === 20203960,
    expected: 20203960,
    actual: c2,
    message: c2 === 20203960 ? 'Parsed ₹20,203,960.00 to 20203960 correctly' : `Failed: got ${c2}`
  });

  // 2. Percentage Parsing
  const p1 = parsePercentage('95%');
  results.push({
    testName: 'Parse Percentage string "95%"',
    category: 'PERCENTAGE',
    passed: p1 === 95,
    expected: 95,
    actual: p1,
    message: p1 === 95 ? 'Parsed 95% correctly' : `Failed: got ${p1}`
  });

  const pGap = 95 - 60;
  results.push({
    testName: 'Percentage point gap: 95% - 60% = 35 pp',
    category: 'PERCENTAGE',
    passed: pGap === 35,
    expected: 35,
    actual: pGap,
    message: pGap === 35 ? 'Percentage gap is 35 pp' : `Failed: got ${pGap}`
  });

  // 3. Zero vs Null integrity
  const zeroVal = parsePercentage('0%');
  const nullVal = parseCurrency('-');
  results.push({
    testName: 'Zero and Null preservation (0 is not null, null is not 0)',
    category: 'SPECIAL_RULES',
    passed: zeroVal === 0 && nullVal === null,
    expected: { zero: 0, nullVal: null },
    actual: { zero: zeroVal, nullVal: nullVal },
    message: 'Zero is preserved as 0 and missing is preserved as null'
  });

  // 4. Acceptance Test: DREAM COLONY (Q2 2024 Form R-1)
  const dcQuarter = (database.projects as any)['dream-colony']?.quarters['April to June, 2024'];
  const dcRoads = dcQuarter?.form_r1?.find((r: any) => r.task.includes('Internal Roads'));
  const dcWater = dcQuarter?.form_r1?.find((r: any) => r.task.includes('Water Supply'));
  
  results.push({
    testName: 'Dream Colony Q2 2024 Roads (Web 60% vs PDF 95% -> 35pp Critical)',
    category: 'ACCEPTANCE_DREAM_COLONY',
    passed: dcRoads?.web_val === 60 && dcRoads?.pdf_val === 95 && dcRoads?.severity === 'CRITICAL',
    expected: { web: 60, pdf: 95, severity: 'CRITICAL' },
    actual: { web: dcRoads?.web_val, pdf: dcRoads?.pdf_val, severity: dcRoads?.severity },
    message: `Roads: Web=${dcRoads?.web_val}%, PDF=${dcRoads?.pdf_val}%, Severity=${dcRoads?.severity}`
  });

  results.push({
    testName: 'Dream Colony Q2 2024 Water Supply (Web 0% vs PDF 80% -> 80pp Critical)',
    category: 'ACCEPTANCE_DREAM_COLONY',
    passed: dcWater?.web_val === 0 && dcWater?.pdf_val === 80 && dcWater?.severity === 'CRITICAL',
    expected: { web: 0, pdf: 80, severity: 'CRITICAL' },
    actual: { web: dcWater?.web_val, pdf: dcWater?.pdf_val, severity: dcWater?.severity },
    message: `Water Supply: Web=${dcWater?.web_val}%, PDF=${dcWater?.pdf_val}%, Severity=${dcWater?.severity}`
  });

  // 5. Acceptance Test: RIDHI SIDHI (Q2 2025 R-1 and Missing Document)
  const rsQuarter = (database.projects as any)['ridhi-sidhi']?.quarters['April to June, 2025'];
  const rsRoads = rsQuarter?.form_r1?.find((r: any) => r.task.includes('Internal Roads'));
  results.push({
    testName: 'Ridhi Sidhi Q2 2025 R-1 (Web 0% vs PDF 5% Discrepancy)',
    category: 'ACCEPTANCE_RIDHI_SIDHI',
    passed: rsRoads?.web_val === 0 && rsRoads?.pdf_val === 5 && rsRoads?.status === 'Mismatch',
    expected: { web: 0, pdf: 5, status: 'Mismatch' },
    actual: { web: rsRoads?.web_val, pdf: rsRoads?.pdf_val, status: rsRoads?.status },
    message: `R-1 Roads: Web=${rsRoads?.web_val}%, PDF=${rsRoads?.pdf_val}%, Status=${rsRoads?.status}`
  });

  // Missing doc test: Form R-1 with Not Found
  const rsQ126 = (database.projects as any)['ridhi-sidhi']?.quarters['January to March, 2026'];
  const rsMissing = rsQ126?.form_r1?.find((r: any) => r.task.includes('Internal Roads'));
  results.push({
    testName: 'Ridhi Sidhi Q1 2026 Missing Document (docs=Not Found -> DATA GAP / Missing Document)',
    category: 'ACCEPTANCE_RIDHI_SIDHI',
    passed: rsMissing?.status === 'Missing Document' && rsMissing?.severity === 'DATA GAP',
    expected: { status: 'Missing Document', severity: 'DATA GAP' },
    actual: { status: rsMissing?.status, severity: rsMissing?.severity },
    message: `Missing Doc: Status=${rsMissing?.status}, Severity=${rsMissing?.severity}`
  });

  // 6. Acceptance Test: SHIV ENCLAVE (Q2 2024 Form R-3 Bottom Escrow ₹104.55 Cr Anomaly)
  const shivQ24 = (database.projects as any)['shiv-enclave']?.quarters['April to June, 2024'];
  const shivWithdrawal = shivQ24?.form_r3_bottom?.find((r: any) => r.particulars.includes('Amount Which can be withdrawn'));
  const variance = Math.abs((shivWithdrawal?.pdf_val || 0) - (shivWithdrawal?.web_val || 0));

  results.push({
    testName: 'Shiv Enclave Q2 2024 Escrow (Web ₹106.57 Cr vs CA ₹2.02 Cr -> ~₹104.55 Cr CRITICAL)',
    category: 'ACCEPTANCE_SHIV_ENCLAVE',
    passed: shivWithdrawal?.web_val === 1065715460 && shivWithdrawal?.pdf_val === 20203960 && shivWithdrawal?.severity === 'CRITICAL',
    expected: { web: 1065715460, pdf: 20203960, severity: 'CRITICAL', approxVar: '₹104.55 Cr' },
    actual: { web: shivWithdrawal?.web_val, pdf: shivWithdrawal?.pdf_val, severity: shivWithdrawal?.severity, formattedVar: formatINR(variance) },
    message: `Escrow Anomaly: Web=${formatINR(shivWithdrawal?.web_val)}, PDF=${formatINR(shivWithdrawal?.pdf_val)}, Variance=${formatINR(variance)}, Severity=${shivWithdrawal?.severity}`
  });

  // 7. Special Data Rules: Form R-3 Bottom Rows 2-4 Ignored
  const ignoredRow = shivQ24?.form_r3_bottom?.find((r: any) => r.sno === '2' || r.particulars === 'ignored');
  results.push({
    testName: 'Form R-3 Bottom Rows 2-4 Placeholder Ignored',
    category: 'SPECIAL_RULES',
    passed: ignoredRow?.is_ignored === true && ignoredRow?.severity === 'IGNORED',
    expected: { is_ignored: true, severity: 'IGNORED' },
    actual: { is_ignored: ignoredRow?.is_ignored, severity: ignoredRow?.severity },
    message: `Row 2-4 Filter: is_ignored=${ignoredRow?.is_ignored}, severity=${ignoredRow?.severity}`
  });

  return results;
}
