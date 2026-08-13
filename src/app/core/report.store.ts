import { computed, Injectable, signal } from '@angular/core';
import { parseReport } from './report.parser';
import { Finding, ReadinessReport, Severity, SeverityCounts } from './report.models';

@Injectable({ providedIn: 'root' })
export class ReportStore {
  readonly report = signal<ReadinessReport | null>(null);
  readonly error = signal('');
  readonly query = signal('');
  readonly severity = signal<Severity | 'ALL'>('ALL');
  readonly selectedId = signal<string | null>(null);

  readonly counts = computed<SeverityCounts>(() => {
    const counts = { PASS: 0, WARN: 0, BLOCK: 0 };
    for (const finding of this.report()?.findings ?? []) counts[finding.severity]++;
    return counts;
  });

  readonly filteredFindings = computed(() => {
    const query = this.query().trim().toLowerCase();
    const severity = this.severity();
    return (this.report()?.findings ?? []).filter((finding) => {
      const matchesSeverity = severity === 'ALL' || finding.severity === severity;
      const haystack = `${finding.check} ${finding.message} ${finding.remediation ?? ''} ${finding.location ?? ''}`.toLowerCase();
      return matchesSeverity && (!query || haystack.includes(query));
    });
  });

  readonly selected = computed<Finding | null>(() => {
    const id = this.selectedId();
    return this.report()?.findings.find((finding) => finding.id === id) ?? null;
  });

  load(content: string): void {
    try {
      const report = parseReport(content);
      this.report.set(report);
      this.error.set('');
      this.query.set('');
      this.severity.set('ALL');
      this.selectedId.set(report.findings[0]?.id ?? null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The report could not be opened.');
    }
  }

  clear(): void {
    this.report.set(null);
    this.error.set('');
    this.selectedId.set(null);
  }
}

