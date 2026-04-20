export interface CertificationItem {
  assetName: string;
  assetType: string;
  assetFQN: string;
  ownerName: string;
  ownerType: "user" | "team";
  lastUpdated: string;
  daysSinceUpdate: number;
  decision: "CERTIFY" | "REVIEW" | "REVOKE";
  reason: string;
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDecision(days: number): {
  decision: "CERTIFY" | "REVIEW" | "REVOKE";
  reason: string;
} {
  if (days < 30) {
    return {
      decision: "CERTIFY",
      reason: "Asset updated recently, ownership looks active.",
    };
  } else if (days < 90) {
    return {
      decision: "REVIEW",
      reason: `No updates in ${days} days. Owner should confirm they still own this.`,
    };
  } else {
    return {
      decision: "REVOKE",
      reason: `No updates in ${days} days. Ownership should be reassigned.`,
    };
  }
}

export function evaluateCertifications(
  assets: { data: any[]; type: string }[]
): CertificationItem[] {
  const items: CertificationItem[] = [];

  for (const { data, type } of assets) {
    for (const asset of data) {
      if (!asset.owner) continue;

      const lastUpdated =
        asset.updatedAt
          ? new Date(asset.updatedAt).toISOString()
          : asset.updatedAt;

      const days = asset.updatedAt
        ? daysSince(new Date(asset.updatedAt).toISOString())
        : 999;

      const { decision, reason } = getDecision(days);

      items.push({
        assetName: asset.name,
        assetType: type,
        assetFQN: asset.fullyQualifiedName || asset.name,
        ownerName: asset.owner?.name || asset.owner?.displayName || "Unknown",
        ownerType: asset.owner?.type === "team" ? "team" : "user",
        lastUpdated: lastUpdated || "Never",
        daysSinceUpdate: days,
        decision,
        reason,
      });
    }
  }

  // Sort by days descending — worst first
  return items.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}