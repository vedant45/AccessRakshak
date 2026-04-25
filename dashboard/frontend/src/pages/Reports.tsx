import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const C = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  text: "#94a3b8",
  bright: "#f1f5f9",
};

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(title: string, headers: string[], rows: string[][]) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        p { font-size: 12px; color: #64748b; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #1e293b; color: white; padding: 10px 12px; text-align: left; }
        td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .badge-high { color: #ef4444; font-weight: 700; }
        .badge-medium { color: #f59e0b; font-weight: 700; }
        .badge-low { color: #10b981; font-weight: 700; }
      </style>
    </head>
    <body>
      <h1>🛡️ PolicyGuard — ${title}</h1>
      <p>Generated on ${new Date().toLocaleString("en-AU")} · PolicyGuard Governance Platform</p>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map((cell, i) => {
            const cls = cell === "HIGH" ? "badge-high" : cell === "MEDIUM" ? "badge-medium" : cell === "LOW" ? "badge-low" : "";
            return `<td${cls ? ` class="${cls}"` : ""}>${cell}</td>`;
          }).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

export default function Reports() {
  const { token } = useAuth();
  const [findings, setFindings] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get("/api/findings", { headers }),
      axios.get("/api/certifications", { headers }),
      axios.get("/api/stats", { headers }),
    ]).then(([f, c, s]) => {
      setFindings(Array.isArray(f.data) ? f.data : []);
      setCerts(Array.isArray(c.data) ? c.data : []);
      setStats(s.data);
    }).finally(() => setLoading(false));
  }, [token]);

  // ── Report 1: Assets bypassing PolicyGuard ──────────────────
  // Assets with no owner, no policy, or no certification
  const bypassedAssets = [
    ...findings
      .filter(f => ["NO_OWNER", "ADMIN_ONLY_OWNER", "EMPTY_POLICY", "NO_TEAM_OWNER"].includes(f.type))
      .map(f => ({
        asset: f.asset,
        assetType: f.assetType,
        issue: f.type.replace(/_/g, " "),
        severity: f.severity,
        recommendation: f.recommendation,
      })),
    ...certs
      .filter(c => c.status === "UNCERTIFIED")
      .map(c => ({
        asset: c.assetName,
        assetType: c.assetType,
        issue: "NOT CERTIFIED",
        severity: "MEDIUM",
        recommendation: "Run certification via Certify page.",
      })),
  ].filter((item, index, self) =>
    index === self.findIndex(t => t.asset === item.asset && t.issue === item.issue)
  );

  // ── Report 2: Top Risky Assets ───────────────────────────────
  // Score each asset by number and severity of findings
  const riskMap: Record<string, { asset: string; assetType: string; score: number; reasons: string[]; level: string }> = {};

  for (const f of findings) {
    const key = f.asset;
    if (!riskMap[key]) riskMap[key] = { asset: f.asset, assetType: f.assetType, score: 0, reasons: [], level: "" };
    riskMap[key].score += f.severity === "HIGH" ? 30 : f.severity === "MEDIUM" ? 15 : 5;
    riskMap[key].reasons.push(f.type.replace(/_/g, " "));
  }

  for (const c of certs) {
    const key = c.assetName;
    if (!riskMap[key]) riskMap[key] = { asset: c.assetName, assetType: c.assetType, score: 0, reasons: [], level: "" };
    if (c.status === "EXPIRED") { riskMap[key].score += 25; riskMap[key].reasons.push("CERT EXPIRED"); }
    if (c.status === "EXPIRING_SOON") { riskMap[key].score += 10; riskMap[key].reasons.push("CERT EXPIRING SOON"); }
    if (c.status === "UNCERTIFIED") { riskMap[key].score += 15; riskMap[key].reasons.push("NOT CERTIFIED"); }
  }

  const riskyAssets = Object.values(riskMap)
    .map(r => ({
      ...r,
      level: r.score >= 45 ? "HIGH" : r.score >= 20 ? "MEDIUM" : "LOW",
      reasons: [...new Set(r.reasons)],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // ── CSV/PDF handlers ─────────────────────────────────────────
  const downloadBypassCSV = () => {
    downloadCSV(
      "policyguard-bypassed-assets.csv",
      bypassedAssets.map(r => [r.asset, r.assetType, r.issue, r.severity, r.recommendation]),
      ["Asset", "Type", "Issue", "Severity", "Recommendation"]
    );
  };

  const downloadBypassPDF = () => {
    downloadPDF(
      "Assets Bypassing PolicyGuard",
      ["Asset", "Type", "Issue", "Severity", "Recommendation"],
      bypassedAssets.map(r => [r.asset, r.assetType, r.issue, r.severity, r.recommendation])
    );
  };

  const downloadRiskyCSV = () => {
    downloadCSV(
      "policyguard-risky-assets.csv",
      riskyAssets.map(r => [r.asset, r.assetType, String(r.score), r.level, r.reasons.join("; ")]),
      ["Asset", "Type", "Risk Score", "Risk Level", "Reasons"]
    );
  };

  const downloadRiskyPDF = () => {
    downloadPDF(
      "Top Risky Assets by Governance Score",
      ["Asset", "Type", "Risk Score", "Risk Level", "Reasons"],
      riskyAssets.map(r => [r.asset, r.assetType, String(r.score), r.level, r.reasons.join(", ")])
    );
  };

  const severityColor = (s: string) =>
    s === "HIGH" ? C.high : s === "MEDIUM" ? C.medium : C.low;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <div style={{ color: C.text, fontSize: "14px" }}>Generating reports...</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.bright, letterSpacing: "-0.5px" }}>
          Reports
        </h1>
        <p style={{ color: C.text, marginTop: "4px", fontSize: "13px" }}>
          Generated · {new Date().toLocaleString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Report 1 ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.high}`,
        borderRadius: "16px", padding: "28px", marginBottom: "24px",
      }}>
        {/* Report header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🚨</span>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: C.bright, margin: 0 }}>
                Assets Bypassing PolicyGuard
              </h2>
            </div>
            <p style={{ color: C.text, fontSize: "12px", margin: 0 }}>
              Assets with no owner, no policy coverage, or missing certification — {bypassedAssets.length} found
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={downloadBypassCSV} style={btnStyle(C.low)}>
              ⬇ CSV
            </button>
            <button onClick={downloadBypassPDF} style={btnStyle(C.blue)}>
              🖨 PDF
            </button>
          </div>
        </div>

        {/* Table */}
        {bypassedAssets.length === 0 ? (
          <EmptyState label="No bypassed assets found — governance is healthy!" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Asset", "Type", "Issue", "Severity", "Recommendation"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bypassedAssets.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={tdStyle}><span style={{ color: C.bright, fontWeight: "600" }}>{row.asset}</span></td>
                    <td style={tdStyle}><span style={{ color: C.text }}>{row.assetType}</span></td>
                    <td style={tdStyle}><span style={{ color: C.medium, fontFamily: "monospace", fontSize: "11px" }}>{row.issue}</span></td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        background: `${severityColor(row.severity)}18`,
                        color: severityColor(row.severity),
                        border: `1px solid ${severityColor(row.severity)}30`,
                      }}>{row.severity}</span>
                    </td>
                    <td style={{ ...tdStyle, color: C.text, maxWidth: "240px" }}>{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Report 2 ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.purple}`,
        borderRadius: "16px", padding: "28px",
      }}>
        {/* Report header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: C.bright, margin: 0 }}>
                Top Risky Assets by Governance Score
              </h2>
            </div>
            <p style={{ color: C.text, fontSize: "12px", margin: 0 }}>
              Assets ranked by cumulative risk score from findings and certification status — top {riskyAssets.length} shown
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={downloadRiskyCSV} style={btnStyle(C.low)}>
              ⬇ CSV
            </button>
            <button onClick={downloadRiskyPDF} style={btnStyle(C.blue)}>
              🖨 PDF
            </button>
          </div>
        </div>

        {/* Table */}
        {riskyAssets.length === 0 ? (
          <EmptyState label="No risky assets found — all clear!" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["#", "Asset", "Type", "Risk Score", "Level", "Risk Reasons"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskyAssets.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ ...tdStyle, color: "#475569", fontFamily: "monospace", width: "36px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={tdStyle}><span style={{ color: C.bright, fontWeight: "600" }}>{row.asset}</span></td>
                    <td style={tdStyle}><span style={{ color: C.text }}>{row.assetType}</span></td>
                    <td style={tdStyle}>
                      <span style={{ color: severityColor(row.level), fontFamily: "monospace", fontWeight: "700", fontSize: "14px" }}>
                        {row.score}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        background: `${severityColor(row.level)}18`,
                        color: severityColor(row.level),
                        border: `1px solid ${severityColor(row.level)}30`,
                      }}>{row.level}</span>
                    </td>
                    <td style={{ ...tdStyle, color: C.text }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {row.reasons.map((r, ri) => (
                          <span key={ri} style={{
                            fontSize: "10px", padding: "1px 6px",
                            borderRadius: "4px", background: "#0f172a",
                            border: `1px solid ${C.border}`, color: C.text,
                            fontFamily: "monospace",
                          }}>{r}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px", color: "#10b981" }}>
      <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
      <div style={{ fontSize: "13px" }}>{label}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "600",
  color: "#94a3b8",
  background: "#0f172a",
  borderBottom: "1px solid #334155",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "11px 14px",
  verticalAlign: "top",
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: "7px 14px",
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: "8px",
    color,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  };
}