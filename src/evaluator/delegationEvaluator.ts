export interface DelegationRule {
  name: string;
  condition: (asset: any) => boolean;
  assignTo: {
    type: "user" | "team";
    id: string;
    name: string;
  };
  reason: string;
}

export interface DelegationResult {
  assetName: string;
  assetType: string;
  assetId: string;
  ruleApplied: string;
  assignedTo: string;
  assignedType: "user" | "team";
  assignedId: string;
  reason: string;
  status: "PENDING" | "DONE" | "FAILED";
}

export function evaluateDelegation(
  assets: { data: any[]; type: string }[],
  rules: DelegationRule[]
): DelegationResult[] {
  const results: DelegationResult[] = [];

  for (const { data, type } of assets) {
    for (const asset of data) {
      // Skip assets that already have owners
      if (asset.owner) continue;

      // Find first matching rule
      const matchedRule = rules.find(r => r.condition(asset));
      if (!matchedRule) continue;

      results.push({
        assetName: asset.name,
        assetType: type,
        assetId: asset.id,
        ruleApplied: matchedRule.name,
        assignedTo: matchedRule.assignTo.name,
        assignedType: matchedRule.assignTo.type,
        assignedId: matchedRule.assignTo.id,
        reason: matchedRule.reason,
        status: "PENDING",
      });
    }
  }

  return results;
}