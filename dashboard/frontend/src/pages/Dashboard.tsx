import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b", 
  low: "#10b981",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  bg: "#1e293b",
  border: "#334155",
  text: "#94a3b8",
};

export default function Dashboard() {
  const { token, email } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get("/api/stats", { headers }),
      axios.get("/api/findings", { headers }),
      axios.get("/api/certifications", { headers }),
    ]).then(([s, f, c]) => {
      setStats(s.data);
      setFindings(f.data);
      setCerts(c.data);
    }).finally(() => setLoading(false));
  }, [token]);

  const high = findings.filter(f => f.severity === "HIGH").length;
  const medium = findings.filter(f => f.severity === "MEDIUM").length;
  const low = findings.filter(f => f.severity === "LOW").length;

  // Pie chart data
  const pieData = [
    { name: "High", value: high, color: COLORS.high },
    { name: "Medium", value: medium, color: COLORS.medium },
    { name: "Low", value: low, color: COLORS.low },
  ].filter(d => d.value > 0);

  // Bar chart data for stats
  const barData = stats ? [
    { name: "Policies", value: stats.policies, fill: COLORS.purple },
    { name: "Roles", value: stats.roles, fill: COLORS.blue },
    { name: "Glossaries", value: stats.glossaries, fill: COLORS.low },
    { name: "Users", value: stats.users, fill: COLORS.medium },
    { name: "Teams", value: stats.teams, fill: COLORS.high },
  ] : [];

  // Cert status data
  const certStatusData = [
    { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: COLORS.low },
    { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: COLORS.medium },
    { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: COLORS.high },
    { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: COLORS.text },
  ];

  // Finding types breakdown
  const typeData = findings.reduce((acc: any[], f) => {
    const existing = acc.find(a => a.type === f.type);
    if (existing) existing.count++;
    else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
    return acc;
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>🛡️</div>
        <div style={{ color: COLORS.text }}>Loading governance data...</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
            Governance Overview
          </h1>
          <p style={{ color: COLORS.text, marginTop: "4px", fontSize: "14px" }}>
            Welcome back, {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "🔍 Audit", path: "/audit" },
            { label: "🤝 Delegate", path: "/delegate" },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none", borderRadius: "8px",
              color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600"
            }}>{a.label}</button>
          ))}
        </div>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Policies", value: stats?.policies, icon: "📋", color: COLORS.purple },
          { label: "Roles", value: stats?.roles, icon: "🎭", color: COLORS.blue },
          { label: "Glossaries", value: stats?.glossaries, icon: "📚", color: COLORS.low },
          { label: "Users", value: stats?.users, icon: "👥", color: COLORS.medium },
          { label: "Teams", value: stats?.teams, icon: "👨‍👩‍👧", color: COLORS.high },
        ].map(card => (
          <div key={card.label} style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",
            padding: "20px",
            borderTop: `3px solid ${card.color}`,
          }}>
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>{card.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: card.color }}>{card.value ?? 0}</div>
            <div style={{ fontSize: "12px", color: COLORS.text, marginTop: "2px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Middle row — Finding severity + Cert status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* Findings severity pie */}
        <div style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: "12px", padding: "24px"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "20px" }}>
            🔍 Findings by Severity
          </h2>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: COLORS.low }}>
              <div style={{ fontSize: "32px" }}>✅</div>
              <div style={{ marginTop: "8px", fontSize: "14px" }}>No findings! Governance looks healthy.</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {[
                  { label: "High", value: high, color: COLORS.high },
                  { label: "Medium", value: medium, color: COLORS.medium },
                  { label: "Low", value: low, color: COLORS.low },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                      <span style={{ fontSize: "13px", color: COLORS.text }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: item.color }}>{item.value}</span>
                  </div>
                ))}
                <button onClick={() => navigate("/audit")} style={{
                  width: "100%", marginTop: "8px",
                  padding: "8px", background: "transparent",
                  border: `1px solid ${COLORS.border}`, borderRadius: "6px",
                  color: COLORS.text, cursor: "pointer", fontSize: "12px"
                }}>View All Findings →</button>
              </div>
            </div>
          )}
        </div>

        {/* Cert status */}
        <div style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: "12px", padding: "24px"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "20px" }}>
            🏅 Certification Status
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={certStatusData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: `1px solid ${COLORS.border}`, borderRadius: "8px", color: "#f1f5f9" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {certStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <button onClick={() => navigate("/certify")} style={{
            width: "100%", marginTop: "12px",
            padding: "8px", background: "transparent",
            border: `1px solid ${COLORS.border}`, borderRadius: "6px",
            color: COLORS.text, cursor: "pointer", fontSize: "12px"
          }}>Manage Certifications →</button>
        </div>
      </div>

      {/* Bottom row — Asset breakdown + Finding types */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

        {/* Asset breakdown bar */}
        <div style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: "12px", padding: "24px"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "20px" }}>
            📊 Asset Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: COLORS.text, fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: `1px solid ${COLORS.border}`, borderRadius: "8px", color: "#f1f5f9" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Finding types */}
        <div style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`,
          borderRadius: "12px", padding: "24px"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9", marginBottom: "20px" }}>
            ⚠️ Finding Types
          </h2>
          {typeData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: COLORS.low }}>
              <div style={{ fontSize: "32px" }}>✅</div>
              <div style={{ marginTop: "8px", fontSize: "14px" }}>No issues detected!</div>
            </div>
          ) : (
            <div>
              {typeData.map((t, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "10px 0",
                  borderBottom: i < typeData.length - 1 ? `1px solid ${COLORS.border}` : "none"
                }}>
                  <span style={{ fontSize: "13px", color: COLORS.text, textTransform: "capitalize" }}>
                    {t.type.toLowerCase()}
                  </span>
                  <span style={{
                    padding: "2px 10px", borderRadius: "20px",
                    background: "rgba(239,68,68,0.1)", color: COLORS.high,
                    fontSize: "12px", fontWeight: "700"
                  }}>{t.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: "🔐 Pre-Delegate", path: "/pre-delegate" },
              { label: "🤝 Delegate", path: "/delegate" },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{
                flex: 1, padding: "8px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none", borderRadius: "6px",
                color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
              }}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}