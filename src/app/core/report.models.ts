export type Severity = 'PASS' | 'WARN' | 'BLOCK';

export interface Finding {
  id: string;
  severity: Severity;
  check: string;
  message: string;
  remediation?: string;
  location?: string;
  fingerprint?: string;
}

export interface ReadinessReport {
  sourceFormat: 'RepoReady JSON' | 'SARIF';
  repository: string;
  result: Severity;
  suppressed: number;
  findings: Finding[];
}

export interface SeverityCounts {
  PASS: number;
  WARN: number;
  BLOCK: number;
}

