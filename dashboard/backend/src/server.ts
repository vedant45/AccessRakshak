import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { spawn } from "child_process";
import axios from "axios";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;
const OM_URL = process.env.OPENMETADATA_URL || "http://localhost:8585";

// ─── AUTH ────────────────────────────────────────────────────
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const encoded = Buffer.from(password).toString("base64");
    const response = await axios.post(`${OM_URL}/api/v1/users/login`, {
      email,
      password: encoded,
    });
    res.json({ token: response.data.accessToken, success: true });
  } catch (err: any) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ─── STATS ───────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = axios.create({
      baseURL: `${OM_URL}/api/v1`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const [policies, roles, glossaries, users, teams] = await Promise.all([
      client.get("/policies?limit=50"),
      client.get("/roles?limit=50"),
      client.get("/glossaries?limit=50&fields=owners,tags"),
      client.get("/users?limit=50&isBot=false"),
      client.get("/teams?limit=50"),
    ]);

    res.json({
      policies: policies.data.paging?.total || policies.data.data.length,
      roles: roles.data.paging?.total || roles.data.data.length,
      glossaries: glossaries.data.paging?.total || glossaries.data.data.length,
      users: users.data.paging?.total || users.data.data.length,
      teams: teams.data.paging?.total || teams.data.data.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FINDINGS ────────────────────────────────────────────────
app.get("/api/findings", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = axios.create({
      baseURL: `${OM_URL}/api/v1`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const [policiesRes, glossariesRes] = await Promise.all([
      client.get("/policies?limit=50"),
      client.get("/glossaries?limit=50&fields=owners,tags"),
    ]);

    const policies = policiesRes.data.data;
    const glossaries = glossariesRes.data.data;
    const findings: any[] = [];

    // Check DENY isOwner() policies
    for (const policy of policies) {
      for (const rule of policy.rules || []) {
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

    // Check glossary ownership
    for (const glossary of glossaries) {
      const owners = glossary.owners || [];
      const onlyAdminOwns = owners.length > 0 && owners.every((o: any) => o.name === "admin");
      const hasTeamOwner = owners.some((o: any) => o.type === "team");

      if (owners.length === 0) {
        findings.push({
          severity: "HIGH",
          type: "NO_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "Glossary has no owner.",
          recommendation: "Assign an owner or team.",
        });
      } else if (onlyAdminOwns) {
        findings.push({
          severity: "HIGH",
          type: "ADMIN_ONLY_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "Only admin owns this glossary — single point of failure.",
          recommendation: "Assign a specific team as owner.",
        });
      } else if (!hasTeamOwner) {
        findings.push({
          severity: "MEDIUM",
          type: "NO_TEAM_OWNER",
          asset: glossary.name,
          assetType: "Glossary",
          issue: "No team owner — only individual users.",
          recommendation: "Assign a team for better governance.",
        });
      }
    }

    // Check empty policies
    for (const policy of policies) {
      if (!policy.rules || policy.rules.length === 0) {
        findings.push({
          severity: "LOW",
          type: "EMPTY_POLICY",
          asset: policy.name,
          assetType: "Policy",
          issue: "Policy has no rules defined.",
          recommendation: "Add rules or remove this policy.",
        });
      }
    }

    res.json(findings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CERTIFICATIONS ──────────────────────────────────────────
app.get("/api/certifications", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const client = axios.create({
      baseURL: `${OM_URL}/api/v1`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const glossariesRes = await client.get("/glossaries?limit=50&fields=owners,tags,customProperties");
    const glossaries = glossariesRes.data.data;

    const certifications = glossaries.map((g: any) => {
      const owners = g.owners || [];
      const certifiedOn = g.customProperties?.certifiedOn || null;
      const validUntil = g.customProperties?.validUntil || null;

      let daysRemaining = null;
      let status = "UNCERTIFIED";

      if (validUntil) {
        const diff = new Date(validUntil).getTime() - new Date().getTime();
        daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) status = "EXPIRED";
        else if (daysRemaining <= 7) status = "EXPIRING_SOON";
        else status = "ACTIVE";
      }

      return {
        assetName: g.name,
        assetType: "Glossary",
        assetId: g.id,
        owners: owners.map((o: any) => o.name).join(", ") || "None",
        certifiedOn,
        validUntil,
        daysRemaining,
        status,
      };
    });

    res.json(certifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CERTIFY ACTION ──────────────────────────────────────────
app.post("/api/certify/:assetId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { assetId } = req.params;
    const { assetType } = req.body;

    const client = axios.create({
      baseURL: `${OM_URL}/api/v1`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const certifiedOn = new Date().toISOString();
    const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const entityPath = assetType === "Glossary" ? "glossaries" : "tables";

    await client.patch(
      `/${entityPath}/${assetId}`,
      [
        { op: "add", path: "/extension", value: {
          certifiedOn,
          validUntil,
          certificationStatus: "ACTIVE",
        }},
      ],
      { headers: { "Content-Type": "application/json-patch+json" }}
    );

    res.json({ success: true, certifiedOn, validUntil });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HTTP SERVER ─────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🛡️  PolicyGuard Backend running on http://localhost:${PORT}\n`);
});

// ─── WEBSOCKET FOR TERMINAL ───────────────────────────────────
// ─── WEBSOCKET FOR TERMINAL ───────────────────────────────────
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Terminal client connected");

    ws.on("message", (message: string) => {
      const { command } = JSON.parse(message.toString());
      const cliPath = path.join(__dirname, "../../../");

      // Strip timestamp suffix e.g. "delegate-dry-123456" → "delegate" + dryRun flag
      const isDryRun = command.includes("dry");
      const baseCommand = command
        .replace(/-dry-\d+$/, "")
        .replace(/-\d+$/, "");

      const validCommands = ["audit", "certify", "delegate", "pre-delegate"];

      if (!validCommands.includes(baseCommand)) {
        ws.send(JSON.stringify({ type: "error", data: "Invalid command\n" }));
        return;
      }

      const args = ["ts-node", "src/cli.ts", baseCommand];
      if (isDryRun) args.push("--dry-run");

      const proc = spawn("npx", args, {
        cwd: cliPath,
        shell: true,
      });

      proc.stdout.on("data", (data: Buffer) => {
        ws.send(JSON.stringify({ type: "stdout", data: data.toString() }));
      });

      proc.stderr.on("data", (data: Buffer) => {
        ws.send(JSON.stringify({ type: "stderr", data: data.toString() }));
      });

      proc.on("close", (code: number) => {
        ws.send(JSON.stringify({ type: "done", data: `\nProcess exited with code ${code}\n` }));
      });
    });
});