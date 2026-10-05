export type ProjectId = 'dream-colony' | 'ridhi-sidhi' | 'shiv-enclave';

export type FormType = 
  | 'Form R-1 (Architect)' 
  | 'Form R-2 (Engineer)' 
  | 'Form R-3 Table 1 (Cost Audit)' 
  | 'Form R-3 Table 2 (Escrow Compliance)';

export type Severity = 'CRITICAL' | 'WARNING' | 'MATCH' | 'DATA GAP' | 'IGNORED';

export type AuditStatus = 'Match' | 'Mismatch' | 'Missing Document' | 'Ignored' | 'Unverified';

export type HealthBadge = 'GOOD' | 'MODERATE' | 'CRITICAL RISK';

export interface AuditFinding {
  id: string;
  project_id: ProjectId;
  project_name: string;
  district: string;
  promoter: string;
  quarter: string;
  sort_key: number;
  form_type: FormType;
  metric: string;
  category: string;
  unit: '%' | '₹';
  web_raw: string;
  pdf_raw: string;
  web_val: number | null;
  pdf_val: number | null;
  absolute_variance: number | null;
  relative_variance: number | null;
  status: AuditStatus;
  severity: Severity;
  reason: string;
  document_url: string;
  document_status: 'Available' | 'Missing';
}

export interface InventorySnapshot {
  total: number;
  sold: number;
  unsold: number;
  mortgaged: number;
}

export interface FormR1Record {
  id: string;
  task: string;
  web_raw: string;
  pdf_raw: string;
  web_val: number | null;
  pdf_val: number | null;
  variance: number | null;
  variance_pp: number | null;
  relative_variance: number | null;
  status: AuditStatus;
  severity: Severity;
  reason: string;
  docs_url: string;
}

export interface FormR2Record {
  id: string;
  particulars: string;
  unit: '%' | '₹';
  web_raw: string;
  pdf_raw: string;
  web_val: number | null;
  pdf_val: number | null;
  variance: number | null;
  relative_variance: number | null;
  status: AuditStatus;
  severity: Severity;
  reason: string;
  docs_url: string;
}

export interface FormR3TopRecord {
  id: string;
  particulars: string;
  web_estimated: number | null;
  pdf_estimated: number | null;
  web_incurred: number | null;
  pdf_incurred: number | null;
  status_incurred: AuditStatus;
  severity_incurred: Severity;
  variance_incurred: number | null;
  docs_url: string;
}

export interface FormR3BottomRecord {
  id: string;
  sno: string;
  particulars: string;
  unit: '%' | '₹';
  web_raw: string;
  pdf_raw: string;
  web_val: number | null;
  pdf_val: number | null;
  variance: number | null;
  relative_variance: number | null;
  status: AuditStatus;
  severity: Severity;
  reason: string;
  is_ignored: boolean;
  docs_url: string;
}

export interface QuarterData {
  quarter: string;
  sort_key: number;
  is_active: boolean;
  qpr_link: string;
  status?: string;
  files: string[];
  inventory: InventorySnapshot;
  form_r1: FormR1Record[];
  form_r2: FormR2Record[];
  form_r3_top: FormR3TopRecord[];
  form_r3_bottom: FormR3BottomRecord[];
  stats: {
    matches: number;
    mismatches: number;
    critical: number;
    warnings: number;
    data_gaps: number;
    ignored: number;
  };
}

export interface ProjectStats {
  total_units: number;
  sold_units: number;
  unsold_units: number;
  mortgaged_units: number;
  sold_percentage: number;
  active_quarters: number;
  total_mismatches: number;
  critical_count: number;
  warning_count: number;
  data_gap_count: number;
  total_estimated_capital: number;
  health_badge: HealthBadge;
}

export interface ProjectData {
  id: ProjectId;
  name: string;
  promoter: string;
  district: string;
  project_type: string;
  registration_no: string;
  application_no: string;
  project_url: string;
  quarters: Record<string, QuarterData>;
  stats: ProjectStats;
}

export interface DatabaseSummary {
  total_projects: number;
  active_quarters_count: number;
  audited_capital_inr: number;
  total_comparable_fields: number;
  total_matches: number;
  total_mismatches: number;
  total_critical: number;
  total_warnings: number;
  total_data_gaps: number;
  global_discrepancy_rate: number;
}

export interface NormalizedDatabase {
  generated_at: string;
  projects: Record<string, ProjectData>;
  all_findings: AuditFinding[];
  summary: DatabaseSummary;
}
