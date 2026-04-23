export interface Finding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: string;
  asset: string;
  assetType: string;
  issue: string;
  recommendation: string;
}

export interface Certification {
  assetName: string;
  assetType: string;
  assetId: string;
  owners: string;
  certifiedOn: string | null;
  validUntil: string | null;
  daysRemaining: number | null;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "UNCERTIFIED";
}

export interface Stats {
  policies: number;
  roles: number;
  glossaries: number;
  users: number;
  teams: number;
}

export interface AuthContext {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}