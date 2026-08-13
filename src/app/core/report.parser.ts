import { Finding, ReadinessReport, Severity } from './report.models';

type UnknownRecord = Record<string, unknown>;

export class ReportParseError extends Error {}

export function parseReport(input: string): ReadinessReport {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new ReportParseError('This file is not valid JSON.');
  }

  if (!isRecord(data)) {
    throw new ReportParseError('The report must contain a JSON object.');
  }

  if (data['version'] === '2.1.0' && Array.isArray(data['runs'])) {
    return parseSarif(data);
  }
  if (typeof data['repository'] === 'string' && Array.isArray(data['findings'])) {
    return parseRepoReady(data);
  }
  throw new ReportParseError('This is not a recognized RepoReady JSON or SARIF report.');
}

function parseRepoReady(data: UnknownRecord): ReadinessReport {
  const findings = (data['findings'] as unknown[]).map((value, index) => {
    if (!isRecord(value)) {
      throw new ReportParseError(`Finding ${index + 1} is invalid.`);
    }
    return {
      id: stringValue(value['fingerprint']) || `finding-${index}`,
      severity: severityValue(value['severity']),
      check: stringValue(value['check']) || 'unknown-check',
      message: stringValue(value['message']) || 'No message provided.',
      remediation: optionalString(value['remediation']),
      location: optionalString(value['location']),
      fingerprint: optionalString(value['fingerprint']),
    } satisfies Finding;
  });

  return {
    sourceFormat: 'RepoReady JSON',
    repository: stringValue(data['repository']),
    result: severityValue(data['result'] ?? worstSeverity(findings)),
    suppressed: numberValue(data['suppressed']),
    findings,
  };
}

function parseSarif(data: UnknownRecord): ReadinessReport {
  const runs = data['runs'] as unknown[];
  const findings: Finding[] = [];
  let repository = 'SARIF report';

  for (const runValue of runs) {
    if (!isRecord(runValue)) continue;
    const automation = isRecord(runValue['automationDetails']) ? runValue['automationDetails'] : undefined;
    repository = optionalString(automation?.['id']) || repository;
    const results = Array.isArray(runValue['results']) ? runValue['results'] : [];
    for (const [index, resultValue] of results.entries()) {
      if (!isRecord(resultValue)) continue;
      const message = isRecord(resultValue['message']) ? resultValue['message'] : {};
      const locations = Array.isArray(resultValue['locations']) ? resultValue['locations'] : [];
      const partial = isRecord(resultValue['partialFingerprints'])
        ? resultValue['partialFingerprints']
        : {};
      const fingerprint = optionalString(partial['reporeadyFingerprint']);
      findings.push({
        id: fingerprint || `sarif-${findings.length}-${index}`,
        severity: sarifSeverity(resultValue['level']),
        check: stringValue(resultValue['ruleId']) || 'sarif-finding',
        message: stringValue(message['text']) || 'No message provided.',
        location: locationValue(locations[0]),
        fingerprint,
      });
    }
  }

  return {
    sourceFormat: 'SARIF',
    repository,
    result: worstSeverity(findings),
    suppressed: 0,
    findings,
  };
}

function locationValue(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value['physicalLocation'])) return undefined;
  const artifact = value['physicalLocation']['artifactLocation'];
  return isRecord(artifact) ? optionalString(artifact['uri']) : undefined;
}

function worstSeverity(findings: Finding[]): Severity {
  if (findings.some((item) => item.severity === 'BLOCK')) return 'BLOCK';
  if (findings.some((item) => item.severity === 'WARN')) return 'WARN';
  return 'PASS';
}

function sarifSeverity(value: unknown): Severity {
  if (value === 'error') return 'BLOCK';
  if (value === 'warning' || value === 'note') return 'WARN';
  return 'PASS';
}

function severityValue(value: unknown): Severity {
  if (value === 'PASS' || value === 'WARN' || value === 'BLOCK') return value;
  throw new ReportParseError(`Unknown severity: ${String(value)}`);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function optionalString(value: unknown): string | undefined {
  const result = stringValue(value);
  return result || undefined;
}

function numberValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

