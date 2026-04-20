export interface PolicyFinding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: string;
  asset: string;
  assetType: string;
  owner?: string;
  issue: string;
  recommendation: string;
}

export function evaluatePolicies(
  policies: any[],
  glossaries: any[],
  glossaryTerms: any[],
  users: any[]
): PolicyFinding[] {
  const findings: PolicyFinding[] = [];

  // Check 1: DENY policies with isOwner() - Bug #25508
  for (const policy of policies) {
    const rules = policy.rules || [];
    for (const rule of rules) {
      if (rule.effect === "DENY" && rule.condition?.includes("isOwner()")) {
        findings.push({
          severity: "HIGH",
          type: "DENY_POLICY_SCOPE_MISMATCH",
          asset: policy.name,
          assetType: "Policy",
          issue: "DENY rule with isOwner() may not propagate to child GlossaryTerms (Bug #25508).",
          recommendation: "Apply policy explicitly at GlossaryTerm level.",
        });
      }
    }
  }

      // Check 2: Glossaries with no owner OR owned only by admin
    for (const glossary of glossaries) {
      const owners = glossary.owners || [];
      const hasOwner = owners.length > 0;
      const onlyAdminOwns = owners.length > 0 && 
        owners.every((o: any) => o.name === "admin");
      const hasTeamOwner = owners.some((o: any) => o.type === "team");

      if (!hasOwner) {
        findings.push({
          severity: "HIGH",
          type: "NO_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "Glossary has no owner. isOwner() conditions will never match.",
          recommendation: "Assign an owner or team to this glossary.",
        });
      } else if (onlyAdminOwns) {
        findings.push({
          severity: "HIGH",
          type: "ADMIN_ONLY_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "Glossary is only owned by admin. This is a single point of failure and poor governance practice.",
          recommendation: "Assign a specific team as owner instead of admin.",
        });
      } else if (!hasTeamOwner) {
        findings.push({
          severity: "MEDIUM",
          type: "NO_TEAM_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "Glossary has no team owner, only individual users. Team ownership is recommended for governance.",
          recommendation: "Assign a team as owner for better governance coverage.",
        });
      }
    }
  // Check 3: GlossaryTerms with no owner
  for (const term of glossaryTerms) {
    const hasOwner =
      term.owner ||
      (term.owners && term.owners.length > 0);

    if (!hasOwner) {
      findings.push({
        severity: "MEDIUM",
        type: "NO_OWNER",
        asset: term.fullyQualifiedName || term.name,
        assetType: "GlossaryTerm",
        issue: "GlossaryTerm has no owner. isOwner() conditions will never match.",
        recommendation: "Assign an owner to this term.",
      });
    }
  }

  // Check 4: Empty policies
  for (const policy of policies) {
    if (!policy.rules || policy.rules.length === 0) {
      findings.push({
        severity: "LOW",
        type: "EMPTY_POLICY",
        asset: policy.name,
        assetType: "Policy",
        issue: "Policy exists but has no rules defined.",
        recommendation: "Add rules or remove this policy.",
      });
    }
  }

  return findings;
}