export interface ClassificationPattern {
  name: string;
  domain: string;
  regex: RegExp[];
  severity: "HIGH" | "MEDIUM" | "LOW";
  tag: string;
  description: string;
}

export interface ClassificationFinding {
  assetName: string;
  assetType: string;
  assetId: string;
  columnName?: string;
  patternName: string;
  domain: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  tag: string;
  description: string;
  matchedOn: string;
}

export const CLASSIFICATION_PATTERNS: ClassificationPattern[] = [
  // Financial
  {
    name: "Account Number",
    domain: "Financial",
    regex: [/account[_\s]?num/i, /acct[_\s]?no/i, /bank[_\s]?account/i],
    severity: "HIGH",
    tag: "PII.Financial.AccountNumber",
    description: "Bank account number detected",
  },
  {
    name: "Credit Card",
    domain: "Financial",
    regex: [/credit[_\s]?card/i, /card[_\s]?num/i, /cc[_\s]?num/i, /cvv/i],
    severity: "HIGH",
    tag: "PII.Financial.CreditCard",
    description: "Credit card data detected",
  },
  {
    name: "IBAN",
    domain: "Financial",
    regex: [/\biban\b/i, /international[_\s]?bank/i],
    severity: "HIGH",
    tag: "PII.Financial.IBAN",
    description: "IBAN number detected",
  },
  {
    name: "SWIFT Code",
    domain: "Financial",
    regex: [/\bswift\b/i, /bic[_\s]?code/i, /routing[_\s]?num/i],
    severity: "HIGH",
    tag: "PII.Financial.SWIFT",
    description: "SWIFT/BIC/Routing number detected",
  },
  // Healthcare
  {
    name: "Patient ID / MRN",
    domain: "Healthcare",
    regex: [/patient[_\s]?id/i, /\bmrn\b/i, /medical[_\s]?record/i],
    severity: "HIGH",
    tag: "PII.Healthcare.PatientID",
    description: "Patient/Medical Record Number detected",
  },
  {
    name: "Diagnosis Code",
    domain: "Healthcare",
    regex: [/diagnosis[_\s]?code/i, /\bicd\b/i, /\bcpt\b/i, /procedure[_\s]?code/i],
    severity: "HIGH",
    tag: "PII.Healthcare.DiagnosisCode",
    description: "Medical diagnosis/procedure code detected",
  },
  {
    name: "NPI Number",
    domain: "Healthcare",
    regex: [/\bnpi\b/i, /provider[_\s]?id/i, /physician[_\s]?id/i],
    severity: "HIGH",
    tag: "PII.Healthcare.NPI",
    description: "National Provider Identifier detected",
  },
  {
    name: "Drug Name",
    domain: "Healthcare",
    regex: [/drug[_\s]?name/i, /medication/i, /prescription/i, /dosage/i],
    severity: "MEDIUM",
    tag: "PII.Healthcare.Medication",
    description: "Medication/drug data detected",
  },
  // Geolocation
  {
    name: "GPS Coordinates",
    domain: "Geolocation",
    regex: [/latitude/i, /longitude/i, /\blat\b/i, /\blon\b/i, /\bgps\b/i, /coordinates/i],
    severity: "MEDIUM",
    tag: "PII.Geo.Coordinates",
    description: "GPS/coordinate data detected",
  },
  {
    name: "IP Address",
    domain: "Geolocation",
    regex: [/ip[_\s]?addr/i, /\bip\b/i, /ipv4/i, /ipv6/i],
    severity: "MEDIUM",
    tag: "PII.Geo.IPAddress",
    description: "IP address data detected",
  },
  {
    name: "Postal Code",
    domain: "Geolocation",
    regex: [/postal[_\s]?code/i, /zip[_\s]?code/i, /postcode/i],
    severity: "LOW",
    tag: "PII.Geo.PostalCode",
    description: "Postal/ZIP code detected",
  },
  // Infrastructure
  {
    name: "AWS ARN",
    domain: "Infrastructure",
    regex: [/\barn\b/i, /aws[_\s]?arn/i, /amazon[_\s]?resource/i],
    severity: "HIGH",
    tag: "Infra.AWS.ARN",
    description: "AWS ARN detected — may expose cloud resource details",
  },
  {
    name: "Kubernetes Resource",
    domain: "Infrastructure",
    regex: [/k8s/i, /kubernetes/i, /kube[_\s]?config/i, /pod[_\s]?name/i],
    severity: "MEDIUM",
    tag: "Infra.K8s.Resource",
    description: "Kubernetes resource reference detected",
  },
  {
    name: "Docker Image",
    domain: "Infrastructure",
    regex: [/docker[_\s]?image/i, /container[_\s]?image/i, /image[_\s]?tag/i],
    severity: "LOW",
    tag: "Infra.Docker.Image",
    description: "Docker image reference detected",
  },
  // EU PII
  {
    name: "BSN (Netherlands)",
    domain: "EU PII",
    regex: [/\bbsn\b/i, /burgerservice/i, /dutch[_\s]?id/i],
    severity: "HIGH",
    tag: "PII.EU.BSN",
    description: "Dutch BSN (Burgerservicenummer) detected",
  },
  {
    name: "NIE/NIF (Spain)",
    domain: "EU PII",
    regex: [/\bnie\b/i, /\bnif\b/i, /spanish[_\s]?id/i, /dni/i],
    severity: "HIGH",
    tag: "PII.EU.SpanishID",
    description: "Spanish NIE/NIF/DNI detected",
  },
  {
    name: "Personnummer (Sweden)",
    domain: "EU PII",
    regex: [/personnummer/i, /swedish[_\s]?id/i, /\bpnr\b/i],
    severity: "HIGH",
    tag: "PII.EU.Personnummer",
    description: "Swedish Personnummer detected",
  },
  // General PII
  {
    name: "Email Address",
    domain: "General PII",
    regex: [/email/i, /e[_\s]?mail/i, /email[_\s]?addr/i],
    severity: "MEDIUM",
    tag: "PII.General.Email",
    description: "Email address data detected",
  },
  {
    name: "Phone Number",
    domain: "General PII",
    regex: [/phone/i, /mobile/i, /cell[_\s]?num/i, /tel\b/i],
    severity: "MEDIUM",
    tag: "PII.General.Phone",
    description: "Phone number data detected",
  },
  {
    name: "Social Security",
    domain: "General PII",
    regex: [/\bssn\b/i, /social[_\s]?security/i, /tax[_\s]?id/i, /\btin\b/i],
    severity: "HIGH",
    tag: "PII.General.SSN",
    description: "Social Security/Tax ID detected",
  },
  {
    name: "Date of Birth",
    domain: "General PII",
    regex: [/date[_\s]?of[_\s]?birth/i, /\bdob\b/i, /birth[_\s]?date/i],
    severity: "MEDIUM",
    tag: "PII.General.DOB",
    description: "Date of birth data detected",
  },
];

export function classifyAsset(
  assetName: string,
  assetId: string,
  assetType: string,
  columns: { name: string; description?: string }[]
): ClassificationFinding[] {
  const findings: ClassificationFinding[] = [];

  // Check asset name itself
  for (const pattern of CLASSIFICATION_PATTERNS) {
    for (const regex of pattern.regex) {
      if (regex.test(assetName)) {
        findings.push({
          assetName,
          assetType,
          assetId,
          patternName: pattern.name,
          domain: pattern.domain,
          severity: pattern.severity,
          tag: pattern.tag,
          description: pattern.description,
          matchedOn: `asset name: ${assetName}`,
        });
        break;
      }
    }
  }

  // Check column names
  for (const column of columns) {
    for (const pattern of CLASSIFICATION_PATTERNS) {
      for (const regex of pattern.regex) {
        if (regex.test(column.name) || (column.description && regex.test(column.description))) {
          findings.push({
            assetName,
            assetType,
            assetId,
            columnName: column.name,
            patternName: pattern.name,
            domain: pattern.domain,
            severity: pattern.severity,
            tag: pattern.tag,
            description: pattern.description,
            matchedOn: `column: ${column.name}`,
          });
          break;
        }
      }
    }
  }

  return findings;
}