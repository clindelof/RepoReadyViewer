import { parseReport, ReportParseError } from './report.parser';

describe('parseReport', () => {
  it('parses RepoReady JSON', () => {
    const report = parseReport(JSON.stringify({
      repository: 'demo/repo',
      result: 'WARN',
      suppressed: 1,
      findings: [{ severity: 'WARN', check: 'license', message: 'Missing license' }],
    }));
    expect(report.sourceFormat).toBe('RepoReady JSON');
    expect(report.repository).toBe('demo/repo');
    expect(report.findings[0].severity).toBe('WARN');
  });

  it('parses SARIF findings', () => {
    const report = parseReport(JSON.stringify({
      version: '2.1.0',
      runs: [{ results: [{ ruleId: 'history-secret', level: 'error', message: { text: 'Potential secret' } }] }],
    }));
    expect(report.sourceFormat).toBe('SARIF');
    expect(report.result).toBe('BLOCK');
    expect(report.findings[0].check).toBe('history-secret');
  });

  it('rejects unrecognized JSON', () => {
    expect(() => parseReport('{"hello":"world"}')).toThrowError(ReportParseError);
  });
});
