import { Command } from "commander";
import * as dotenv from "dotenv";
import {
  getPolicies,
  getRoles,
  getGlossaries,
  getGlossaryTerms,
  getUsers,
  getTeams,
  getTables,
  getDashboards,
  getTopics,
  assignOwner,
  createGroupTeam,
} from "./api/openmetadata";
import { evaluatePolicies } from "./evaluator/policyEvaluator";
import { evaluateCertifications } from "./evaluator/certificationEvaluator";
import { evaluateDelegation } from "./evaluator/delegationEvaluator";

dotenv.config();

const program = new Command();

program
  .name("policy-guard")
  .description("Governance policy auditor for OpenMetadata")
  .version("1.0.0");

// ─── AUDIT COMMAND ───────────────────────────────────────────
program
  .command("audit")
  .description("Run a full governance policy audit")
  .action(async () => {
    console.log("\n🔍 PolicyGuard - OpenMetadata Governance Auditor\n");
    try {
      console.log("📋 Fetching policies...");
      const policies = await getPolicies();

      console.log("🎭 Fetching roles...");
      const roles = await getRoles();

      console.log("📚 Fetching glossaries...");
      const glossaries = await getGlossaries();

      console.log("📝 Fetching glossary terms...");
      const allTerms: any[] = [];
      for (const g of glossaries) {
        const terms = await getGlossaryTerms(g.id);
        allTerms.push(...terms);
      }

      console.log("👥 Fetching users...");
      const users = await getUsers();

      console.log("👨‍👩‍👧 Fetching teams...");
      const teams = await getTeams();

      console.log("\n🔎 Evaluating policies...\n");
      const findings = evaluatePolicies(policies, glossaries, allTerms, users);

      const high = findings.filter(f => f.severity === "HIGH").length;
      const medium = findings.filter(f => f.severity === "MEDIUM").length;
      const low = findings.filter(f => f.severity === "LOW").length;

      console.log("━".repeat(60));
      console.log("📊 AUDIT SUMMARY");
      console.log("━".repeat(60));
      console.log(`🔴 High:   ${high}`);
      console.log(`🟡 Medium: ${medium}`);
      console.log(`🟢 Low:    ${low}`);
      console.log(`📦 Total:  ${findings.length}`);
      console.log("━".repeat(60) + "\n");

      if (findings.length === 0) {
        console.log("✅ No issues found! Governance looks healthy.\n");
      } else {
        for (const f of findings) {
          const icon =
            f.severity === "HIGH" ? "🔴" :
            f.severity === "MEDIUM" ? "🟡" : "🟢";
          console.log(`${icon} [${f.severity}] ${f.assetType}: ${f.asset}`);
          console.log(`   ❗ Issue: ${f.issue}`);
          console.log(`   ✅ Fix:   ${f.recommendation}`);
          console.log();
        }
      }

      console.log("━".repeat(60));
      console.log("📈 STATS");
      console.log("━".repeat(60));
      console.log(`Policies scanned:       ${policies.length}`);
      console.log(`Roles scanned:          ${roles.length}`);
      console.log(`Glossaries scanned:     ${glossaries.length}`);
      console.log(`Glossary terms scanned: ${allTerms.length}`);
      console.log(`Users scanned:          ${users.length}`);
      console.log(`Teams scanned:          ${teams.length}`);
      console.log("━".repeat(60) + "\n");

    } catch (err: any) {
      console.error("❌ Error:", err.message);
      if (err.response?.data) {
        console.error("Details:", JSON.stringify(err.response.data, null, 2));
      }
    }
  });

// ─── CERTIFY COMMAND ─────────────────────────────────────────
program
  .command("certify")
  .description("Run access certification report on all data assets")
  .action(async () => {
    console.log("\n🏅 PolicyGuard - Access Certification Report\n");
    try {
      console.log("📊 Fetching tables...");
      const tables = await getTables();

      console.log("📈 Fetching dashboards...");
      const dashboards = await getDashboards();

      console.log("📨 Fetching topics...");
      const topics = await getTopics();

      console.log("📚 Fetching glossaries...");
      const glossaries = await getGlossaries();

      console.log("\n🔎 Evaluating ownership certifications...\n");

      const items = evaluateCertifications([
        { data: tables, type: "Table" },
        { data: dashboards, type: "Dashboard" },
        { data: topics, type: "Topic" },
        { data: glossaries, type: "Glossary" },
      ]);

      const certify = items.filter(i => i.decision === "CERTIFY").length;
      const review = items.filter(i => i.decision === "REVIEW").length;
      const revoke = items.filter(i => i.decision === "REVOKE").length;

      console.log("━".repeat(60));
      console.log("🏅 CERTIFICATION SUMMARY");
      console.log("━".repeat(60));
      console.log(`✅ CERTIFY: ${certify} assets`);
      console.log(`🟡 REVIEW:  ${review} assets`);
      console.log(`🔴 REVOKE:  ${revoke} assets`);
      console.log(`📦 Total:   ${items.length} assets with owners`);
      console.log("━".repeat(60) + "\n");

      if (items.length === 0) {
        console.log("⚠️  No owned assets found to certify.\n");
        return;
      }

      for (const decision of ["REVOKE", "REVIEW", "CERTIFY"] as const) {
        const icon =
          decision === "REVOKE" ? "🔴" :
          decision === "REVIEW" ? "🟡" : "✅";
        const filtered = items.filter(i => i.decision === decision);
        if (filtered.length === 0) continue;

        console.log(`${icon} ${decision}:\n`);
        for (const item of filtered) {
          console.log(`   ${item.assetType}: ${item.assetName}`);
          console.log(`   Owner: ${item.ownerName} (${item.ownerType})`);
          console.log(`   Last updated: ${item.daysSinceUpdate} days ago`);
          console.log(`   Reason: ${item.reason}\n`);
        }
      }

      console.log("━".repeat(60));
      console.log("💡 TIP: Run 'npm run audit' to check policy misconfigs too.");
      console.log("━".repeat(60) + "\n");

    } catch (err: any) {
      console.error("❌ Error:", err.message);
      if (err.response?.data) {
        console.error("Details:", JSON.stringify(err.response.data, null, 2));
      }
    }
  });

// ─── DELEGATE COMMAND ────────────────────────────────────────
program
  .command("delegate")
  .description("Auto-assign owners to unowned assets based on delegation rules")
  .option("--dry-run", "Preview changes without applying them", false)
  .action(async (options) => {
    console.log("\n🤝 PolicyGuard - Auto Delegation Engine\n");
    if (options.dryRun) {
      console.log("🔍 DRY RUN MODE — no changes will be made\n");
    }

    try {
      console.log("👨‍👩‍👧 Fetching teams...");
      const allTeams = await getTeams();

      // OpenMetadata only allows "Group" type teams to own entities
      let defaultTeam = allTeams.find((t: any) => t.teamType === "Group");

      if (!defaultTeam) {
        console.log("⚠️  No Group teams found. Creating 'Data-Stewards' team...");
        defaultTeam = await createGroupTeam("Data-Stewards");
        console.log(`✅ Created team: ${defaultTeam.name}\n`);
      } else {
        console.log(`✅ Default owner team: ${defaultTeam.name}`);
        console.log(`   Team ID: ${defaultTeam.id}\n`);
      }

      const rules = [
        {
          name: "PII Assets → Data Governance Team",
          condition: (asset: any) =>
            asset.tags?.some((t: any) =>
              t.tagFQN?.toLowerCase().includes("pii") ||
              t.tagFQN?.toLowerCase().includes("personal")
            ),
          assignTo: {
            type: "team" as const,
            id: defaultTeam.id,
            name: defaultTeam.name,
          },
          reason: "Asset has PII tags — assigned to governance team.",
        },
        {
          name: "Default Rule → First Available Group Team",
          condition: () => true,
          assignTo: {
            type: "team" as const,
            id: defaultTeam.id,
            name: defaultTeam.name,
          },
          reason: "No owner found — assigned to default data steward team.",
        },
      ];

      console.log("📊 Fetching assets...");
      const tables = await getTables();
      const glossaries = await getGlossaries();

      const delegations = evaluateDelegation(
        [
          { data: tables, type: "Table" },
          { data: glossaries, type: "Glossary" },
        ],
        rules
      );

      console.log("━".repeat(60));
      console.log("🤝 DELEGATION PLAN");
      console.log("━".repeat(60));
      console.log(`📦 Assets needing owner: ${delegations.length}\n`);

      if (delegations.length === 0) {
        console.log("✅ All assets already have owners!\n");
        return;
      }

      for (const d of delegations) {
        console.log(`📌 ${d.assetType}: ${d.assetName}`);
        console.log(`   Rule: ${d.ruleApplied}`);
        console.log(`   Assign to: ${d.assignedTo} (${d.assignedType})`);
        console.log(`   Reason: ${d.reason}\n`);
      }

      if (options.dryRun) {
        console.log("━".repeat(60));
        console.log("🔍 DRY RUN complete. Run without --dry-run to apply.");
        console.log("━".repeat(60) + "\n");
        return;
      }

      console.log("━".repeat(60));
      console.log("⚡ Applying delegations...\n");

      for (const d of delegations) {
        try {
          await assignOwner(
            d.assetType,
            d.assetId,
            d.assignedType,
            d.assignedId,
            d.assignedTo
          );
          console.log(`✅ Assigned: ${d.assetName} → ${d.assignedTo}`);
        } catch (e: any) {
          console.log(`❌ Failed ${d.assetName}: ${e.message}`);
          if (e.response?.data) {
            console.log(`   Details: ${JSON.stringify(e.response.data, null, 2)}`);
          }
          if (e.response?.config?.data) {
            console.log(`   Sent payload: ${e.response.config.data}`);
          }
        }
      }

      console.log("\n" + "━".repeat(60));
      console.log("✅ Delegation complete! Run 'npm run audit' to verify.");
      console.log("━".repeat(60) + "\n");

    } catch (err: any) {
      console.error("❌ Error:", err.message);
      if (err.response?.data) {
        console.error("Details:", JSON.stringify(err.response.data, null, 2));
      }
    }
  });

// ─── ALWAYS LAST ─────────────────────────────────────────────
program.parse();