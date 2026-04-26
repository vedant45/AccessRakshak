// import { useEffect, useState} from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
// } from "recharts";

// const C = {
//   high: "#ef4444",
//   medium: "#f59e0b",
//   low: "#10b981",
//   purple: "#8b5cf6",
//   blue: "#3b82f6",
//   bg: "#0f172a",
//   card: "#1e293b",
//   border: "#334155",
//   text: "#94a3b8",
//   bright: "#f1f5f9",
// };

// function AnimatedNumber({ target }: { target: number }) {
//   const [current, setCurrent] = useState(0);
//   useEffect(() => {
//     if (target === 0) return;
//     let start = 0;
//     const step = Math.ceil(target / 30);
//     const timer = setInterval(() => {
//       start += step;
//       if (start >= target) {
//         setCurrent(target);
//         clearInterval(timer);
//       } else {
//         setCurrent(start);
//       }
//     }, 30);
//     return () => clearInterval(timer);
//   }, [target]);
//   return <>{current}</>;
// }

// function RiskGauge({ score, risk }: { score: number; risk: string }) {
//   const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
//   const [animated, setAnimated] = useState(0);

//   useEffect(() => {
//     let s = 0;
//     const timer = setInterval(() => {
//       s += 2;
//       if (s >= score) { setAnimated(score); clearInterval(timer); }
//       else setAnimated(s);
//     }, 20);
//     return () => clearInterval(timer);
//   }, [score]);

//   const pct = animated / 100;
//   const radius = 60;
//   const circumference = Math.PI * radius;
//   const strokeDash = circumference * pct;

//   return (
//     <div style={{ textAlign: "center" }}>
//       <svg width="160" height="90" viewBox="0 0 160 90">
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round"
//         />
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
//           strokeDasharray={`${strokeDash} ${circumference}`}
//           style={{ transition: "stroke-dasharray 0.1s ease" }}
//         />
//         <text x="80" y="72" textAnchor="middle" fill={color} fontSize="24" fontWeight="700">
//           {animated}
//         </text>
//         <text x="80" y="86" textAnchor="middle" fill={C.text} fontSize="10">
//           / 100
//         </text>
//       </svg>
//       <div style={{
//         display: "inline-block",
//         padding: "4px 16px", borderRadius: "20px",
//         background: `${color}22`, color,
//         fontSize: "12px", fontWeight: "700", marginTop: "4px",
//         border: `1px solid ${color}44`,
//       }}>
//         {risk} RISK
//       </div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   const { token, email } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState<any>(null);
//   const [findings, setFindings] = useState<any[]>([]);
//   const [certs, setCerts] = useState<any[]>([]);
//   const [score, setScore] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const headers = { Authorization: `Bearer ${token}` };
//     Promise.all([
//       axios.get("/api/stats", { headers }),
//       axios.get("/api/findings", { headers }),
//       axios.get("/api/certifications", { headers }),
//       axios.get("/api/score", { headers }),
//     ]).then(([s, f, c, sc]) => {
//       setStats(s.data);
//       setFindings(Array.isArray(f.data) ? f.data : []);
//       setCerts(Array.isArray(c.data) ? c.data : []);
//       setScore(sc.data);
//     }).catch(err => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [token]);

//   const high = findings.filter(f => f.severity === "HIGH").length;
//   const medium = findings.filter(f => f.severity === "MEDIUM").length;
//   const low = findings.filter(f => f.severity === "LOW").length;

//   const pieData = [
//     { name: "High", value: high, color: C.high },
//     { name: "Medium", value: medium, color: C.medium },
//     { name: "Low", value: low, color: C.low },
//   ].filter(d => d.value > 0);

//   const barData = stats ? [
//     { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
//     { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
//     { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
//     { name: "Users", value: stats.users ?? 0, fill: C.medium },
//     { name: "Teams", value: stats.teams ?? 0, fill: C.high },
//   ] : [];

//   const certStatusData = [
//     { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
//     { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
//     { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
//     { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
//   ];

//   const scoreBreakdown = score ? [
//     { name: "Policy Coverage", value: score.breakdown.policyCoverage, max: 25, color: C.purple },
//     { name: "Ownership Health", value: score.breakdown.ownershipHealth, max: 25, color: C.blue },
//     { name: "Team Structure", value: score.breakdown.teamStructure, max: 25, color: C.low },
//     { name: "Certification Rate", value: score.breakdown.certificationRate, max: 25, color: C.medium },
//   ] : [];

//   const typeData = findings.reduce((acc: any[], f) => {
//     const existing = acc.find(a => a.type === f.type);
//     if (existing) existing.count++;
//     else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
//     return acc;
//   }, []);

//   if (loading) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
//         <div style={{ color: C.text, fontSize: "14px" }}>Loading governance data...</div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
//         <div style={{ color: C.high, fontSize: "16px", marginBottom: "8px" }}>Failed to load: {error}</div>
//         <div style={{ color: C.text, fontSize: "13px", marginBottom: "24px" }}>
//           Make sure OpenMetadata is running at localhost:8585
//         </div>
//         <button onClick={() => window.location.reload()} style={{
//           padding: "10px 24px",
//           background: "linear-gradient(135deg, #667eea, #764ba2)",
//           border: "none", borderRadius: "8px",
//           color: "white", cursor: "pointer", fontSize: "14px"
//         }}>🔄 Retry</button>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: "1200px" }}>
//       {/* Header */}
//       <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//         <div>
//           <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.bright, letterSpacing: "-0.5px" }}>
//             Governance Overview
//           </h1>
//           <p style={{ color: C.text, marginTop: "4px", fontSize: "13px" }}>
//             {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: "8px" }}>
//           {[
//             { label: "🔍 Audit", path: "/audit" },
//             { label: "🤝 Delegate", path: "/delegate" },
//             { label: "🏅 Certify", path: "/certify" },
//           ].map(a => (
//             <button key={a.path} onClick={() => navigate(a.path)} style={{
//               padding: "8px 14px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               border: "none", borderRadius: "8px",
//               color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//             }}>{a.label}</button>
//           ))}
//         </div>
//       </div>

//       {/* Top row — Risk Score + Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Risk Score Card */}
//         <div style={{
//           background: C.card,
//           border: `1px solid ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}44`,
//           borderRadius: "16px", padding: "24px",
//           boxShadow: `0 0 20px ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}11`,
//           display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//         }}>
//           <div style={{ fontSize: "13px", color: C.text, marginBottom: "12px", fontWeight: "600", letterSpacing: "1px" }}>
//             GOVERNANCE SCORE
//           </div>
//           {score && <RiskGauge score={score.total} risk={score.risk} />}
//           <div style={{ marginTop: "16px", width: "100%" }}>
//             {scoreBreakdown.map(item => (
//               <div key={item.name} style={{ marginBottom: "8px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                   <span style={{ fontSize: "11px", color: C.text }}>{item.name}</span>
//                   <span style={{ fontSize: "11px", color: item.color, fontWeight: "600" }}>{item.value}/{item.max}</span>
//                 </div>
//                 <div style={{ height: "4px", background: "#0f172a", borderRadius: "2px" }}>
//                   <div style={{
//                     height: "100%", borderRadius: "2px",
//                     width: `${(item.value / item.max) * 100}%`,
//                     background: item.color,
//                     transition: "width 1s ease",
//                   }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Stat Cards Grid */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
//           {[
//             { label: "Policies", value: stats?.policies ?? 0, icon: "📋", color: C.purple, sub: "governance rules" },
//             { label: "Roles", value: stats?.roles ?? 0, icon: "🎭", color: C.blue, sub: "access roles" },
//             { label: "Glossaries", value: stats?.glossaries ?? 0, icon: "📚", color: C.low, sub: "data glossaries" },
//             { label: "Users", value: stats?.users ?? 0, icon: "👥", color: C.medium, sub: "active users" },
//             { label: "Teams", value: stats?.teams ?? 0, icon: "👨‍👩‍👧", color: C.high, sub: "team groups" },
//             {
//               label: "Issues",
//               value: high + medium + low,
//               icon: high > 0 ? "🔴" : "✅",
//               color: high > 0 ? C.high : C.low,
//               sub: `${high} critical`
//             },
//           ].map(card => (
//             <div key={card.label} style={{
//               background: C.card,
//               border: `1px solid ${C.border}`,
//               borderRadius: "12px",
//               padding: "16px 20px",
//               borderLeft: `3px solid ${card.color}`,
//               cursor: "pointer",
//               transition: "border-color 0.2s",
//             }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                 <div>
//                   <div style={{ fontSize: "24px", fontWeight: "700", color: card.color, fontFamily: "monospace" }}>
//                     <AnimatedNumber target={card.value} />
//                   </div>
//                   <div style={{ fontSize: "13px", color: C.bright, marginTop: "2px", fontWeight: "600" }}>{card.label}</div>
//                   <div style={{ fontSize: "11px", color: C.text, marginTop: "2px" }}>{card.sub}</div>
//                 </div>
//                 <div style={{ fontSize: "24px" }}>{card.icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Middle row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Findings pie */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🔍 FINDINGS BY SEVERITY
//           </h2>
//           {pieData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "32px", color: C.low }}>
//               <div style={{ fontSize: "40px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "14px" }}>No findings! Governance is healthy.</div>
//             </div>
//           ) : (
//             <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
//               <ResponsiveContainer width={150} height={150}>
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={4}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//               <div style={{ flex: 1 }}>
//                 {[
//                   { label: "Critical", value: high, color: C.high },
//                   { label: "Medium", value: medium, color: C.medium },
//                   { label: "Low", value: low, color: C.low },
//                 ].map(item => (
//                   <div key={item.label} style={{
//                     display: "flex", justifyContent: "space-between",
//                     alignItems: "center", marginBottom: "10px",
//                     padding: "8px 12px", borderRadius: "8px",
//                     background: `${item.color}11`,
//                     border: `1px solid ${item.color}22`,
//                   }}>
//                     <span style={{ fontSize: "12px", color: C.text }}>{item.label}</span>
//                     <span style={{ fontSize: "18px", fontWeight: "700", color: item.color, fontFamily: "monospace" }}>{item.value}</span>
//                   </div>
//                 ))}
//                 <button onClick={() => navigate("/audit")} style={{
//                   width: "100%", marginTop: "4px", padding: "8px",
//                   background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                   border: `1px solid #667eea44`, borderRadius: "6px",
//                   color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//                 }}>View All Findings →</button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Cert status */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🏅 CERTIFICATION STATUS
//           </h2>
//           <ResponsiveContainer width="100%" height={150}>
//             <BarChart data={certStatusData} barSize={28}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
//               <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {certStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//           <button onClick={() => navigate("/certify")} style={{
//             width: "100%", marginTop: "12px", padding: "8px",
//             background: "linear-gradient(135deg, #667eea22, #764ba222)",
//             border: `1px solid #667eea44`, borderRadius: "6px",
//             color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//           }}>Manage Certifications →</button>
//         </div>
//       </div>

//       {/* Bottom row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

//         {/* Asset breakdown */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             📊 ASSET BREAKDOWN
//           </h2>
//           <ResponsiveContainer width="100%" height={160}>
//             <BarChart data={barData} layout="vertical" barSize={14}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
//               <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
//                 {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Finding types + Quick actions */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             ⚠️ FINDING TYPES
//           </h2>
//           {typeData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "24px", color: C.low }}>
//               <div style={{ fontSize: "32px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "13px" }}>No issues detected!</div>
//             </div>
//           ) : (
//             <div style={{ marginBottom: "16px" }}>
//               {typeData.map((t, i) => (
//                 <div key={i} style={{
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                   padding: "8px 0",
//                   borderBottom: i < typeData.length - 1 ? `1px solid ${C.border}` : "none"
//                 }}>
//                   <span style={{ fontSize: "12px", color: C.text }}>{t.type.toLowerCase()}</span>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: "20px",
//                     background: "rgba(239,68,68,0.1)", color: C.high,
//                     fontSize: "11px", fontWeight: "700"
//                   }}>{t.count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
//             {[
//               { label: "🔐 Pre-Delegate", path: "/pre-delegate" },
//               { label: "🤝 Delegate", path: "/delegate" },
//               { label: "🔍 Audit", path: "/audit" },
//               { label: "🏅 Certify", path: "/certify" },
//             ].map(a => (
//               <button key={a.path} onClick={() => navigate(a.path)} style={{
//                 padding: "8px",
//                 background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                 border: `1px solid #667eea44`,
//                 borderRadius: "6px", color: "#a78bfa",
//                 cursor: "pointer", fontSize: "11px", fontWeight: "600"
//               }}>{a.label}</button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// //second part

// import { getApi } from "../api";

// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
// } from "recharts";

// const C = {
//   high: "#ef4444",
//   medium: "#f59e0b",
//   low: "#10b981",
//   purple: "#8b5cf6",
//   blue: "#3b82f6",
//   bg: "#0f172a",
//   card: "#1e293b",
//   border: "#334155",
//   text: "#94a3b8",
//   bright: "#f1f5f9",
// };

// function AnimatedNumber({ target }: { target: number }) {
//   const [current, setCurrent] = useState(0);
//   useEffect(() => {
//     if (target === 0) return;
//     let start = 0;
//     const step = Math.ceil(target / 30);
//     const timer = setInterval(() => {
//       start += step;
//       if (start >= target) {
//         setCurrent(target);
//         clearInterval(timer);
//       } else {
//         setCurrent(start);
//       }
//     }, 30);
//     return () => clearInterval(timer);
//   }, [target]);
//   return <>{current}</>;
// }

// function RiskGauge({ score, risk }: { score: number; risk: string }) {
//   const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
//   const [animated, setAnimated] = useState(0);

//   useEffect(() => {
//     let s = 0;
//     const timer = setInterval(() => {
//       s += 2;
//       if (s >= score) { setAnimated(score); clearInterval(timer); }
//       else setAnimated(s);
//     }, 20);
//     return () => clearInterval(timer);
//   }, [score]);

//   const pct = animated / 100;
//   const radius = 60;
//   const circumference = Math.PI * radius;
//   const strokeDash = circumference * pct;

//   return (
//     <div style={{ textAlign: "center" }}>
//       <svg width="160" height="90" viewBox="0 0 160 90">
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round"
//         />
//         <path
//           d="M 20 80 A 60 60 0 0 1 140 80"
//           fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
//           strokeDasharray={`${strokeDash} ${circumference}`}
//           style={{ transition: "stroke-dasharray 0.1s ease" }}
//         />
//         <text x="80" y="72" textAnchor="middle" fill={color} fontSize="24" fontWeight="700">
//           {animated}
//         </text>
//         <text x="80" y="86" textAnchor="middle" fill={C.text} fontSize="10">
//           / 100
//         </text>
//       </svg>
//       <div style={{
//         display: "inline-block",
//         padding: "4px 16px", borderRadius: "20px",
//         background: `${color}22`, color,
//         fontSize: "12px", fontWeight: "700", marginTop: "4px",
//         border: `1px solid ${color}44`,
//       }}>
//         {risk} RISK
//       </div>
//     </div>
//   );
// }

// // ─── MODAL COMPONENT ─────────────────────────────────────────
// type ModalType = "Policies" | "Roles" | "Glossaries";

// function DetailModal({
//   type,
//   data,
//   loading,
//   onClose,
// }: {
//   type: ModalType;
//   data: any[];
//   loading: boolean;
//   onClose: () => void;
// }) {
//   const icons: Record<ModalType, string> = {
//     Policies: "📋",
//     Roles: "🔑",
//     Glossaries: "📚",
//   };

//   const accentColors: Record<ModalType, string> = {
//     Policies: C.purple,
//     Roles: C.blue,
//     Glossaries: C.low,
//   };

//   const accent = accentColors[type];

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.65)",
//         backdropFilter: "blur(6px)",
//         zIndex: 1000,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         animation: "fadeIn 0.15s ease",
//       }}
//     >
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
//         @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
//         .modal-item:hover { background: #162032 !important; border-color: ${accent}44 !important; }
//         .modal-scroll::-webkit-scrollbar { width: 6px; }
//         .modal-scroll::-webkit-scrollbar-track { background: transparent; }
//         .modal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
//         .close-btn:hover { background: #334155 !important; color: #f1f5f9 !important; }
//       `}</style>

//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "#1a2744",
//           border: `1px solid ${accent}33`,
//           borderTop: `3px solid ${accent}`,
//           borderRadius: "16px",
//           padding: "28px",
//           width: "580px",
//           maxHeight: "72vh",
//           display: "flex",
//           flexDirection: "column",
//           boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${accent}11`,
//           animation: "slideUp 0.2s ease",
//         }}
//       >
//         {/* Header */}
//         <div style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "20px",
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//             <div style={{
//               width: "36px", height: "36px",
//               borderRadius: "10px",
//               background: `${accent}22`,
//               border: `1px solid ${accent}44`,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: "18px",
//             }}>
//               {icons[type]}
//             </div>
//             <div>
//               <h2 style={{ color: C.bright, fontSize: "17px", fontWeight: "700", margin: 0 }}>
//                 {type}
//               </h2>
//               {!loading && (
//                 <p style={{ color: C.text, fontSize: "12px", margin: 0 }}>
//                   {data.length} {type.toLowerCase()} found
//                 </p>
//               )}
//             </div>
//           </div>
//           <button
//             className="close-btn"
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "1px solid #334155",
//               color: C.text,
//               cursor: "pointer",
//               fontSize: "16px",
//               width: "32px", height: "32px",
//               borderRadius: "8px",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               transition: "all 0.15s",
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Search bar */}
//         {!loading && data.length > 0 && (
//           <SearchableList type={type} data={data} accent={accent} />
//         )}

//         {/* Loading state */}
//         {loading && (
//           <div style={{ textAlign: "center", padding: "48px", color: C.text }}>
//             <div style={{ fontSize: "36px", marginBottom: "14px", animation: "spin 1s linear infinite" }}>⏳</div>
//             <div style={{ fontSize: "13px" }}>Loading {type.toLowerCase()}...</div>
//           </div>
//         )}

//         {/* Empty state */}
//         {!loading && data.length === 0 && (
//           <div style={{ textAlign: "center", padding: "48px", color: C.text }}>
//             <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
//             <div style={{ fontSize: "13px" }}>No {type.toLowerCase()} found.</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SearchableList({ type, data, accent }: { type: ModalType; data: any[]; accent: string }) {
//   const [query, setQuery] = useState("");

//   const filtered = data.filter((item: any) =>
//     (item.displayName || item.name || "").toLowerCase().includes(query.toLowerCase()) ||
//     (item.description || "").toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <>
//       {/* Search */}
//       <div style={{ marginBottom: "14px", position: "relative" }}>
//         <span style={{
//           position: "absolute", left: "12px", top: "50%",
//           transform: "translateY(-50%)", fontSize: "13px", color: C.text,
//         }}>🔍</span>
//         <input
//           type="text"
//           placeholder={`Search ${type.toLowerCase()}...`}
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "9px 12px 9px 34px",
//             background: "#0f172a",
//             border: `1px solid #334155`,
//             borderRadius: "8px",
//             color: C.bright,
//             fontSize: "13px",
//             outline: "none",
//             boxSizing: "border-box",
//           }}
//         />
//       </div>

//       {/* List */}
//       <div
//         className="modal-scroll"
//         style={{ overflowY: "auto", flex: 1 }}
//       >
//         {filtered.length === 0 ? (
//           <div style={{ textAlign: "center", padding: "32px", color: C.text, fontSize: "13px" }}>
//             No results for "{query}"
//           </div>
//         ) : (
//           filtered.map((item: any, i: number) => (
//             <div
//               key={item.id ?? i}
//               className="modal-item"
//               style={{
//                 padding: "13px 16px",
//                 borderRadius: "10px",
//                 marginBottom: "8px",
//                 background: "#0f172a",
//                 border: "1px solid #1e293b",
//                 transition: "all 0.15s",
//                 cursor: "default",
//               }}
//             >
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>

//                   {/* Name */}
//                   <div style={{ color: C.bright, fontWeight: "600", fontSize: "14px", marginBottom: "3px" }}>
//                     {item.displayName || item.name}
//                   </div>

//                   {/* Description */}
//                   {item.description && (
//                     <div style={{ color: C.text, fontSize: "12px", lineHeight: "1.5",
//                       overflow: "hidden", textOverflow: "ellipsis",
//                       display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
//                     }}>
//                       {item.description.replace(/\n\n<!-- PolicyGuard:.*?-->/s, "")}
//                     </div>
//                   )}

//                   {/* Tags row */}
//                   <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>

//                     {/* POLICIES → rules count + rule effects */}
//                     {type === "Policies" && (
//                       <>
//                         <Tag
//                           label={`${item.rules?.length ?? 0} rule${item.rules?.length !== 1 ? "s" : ""}`}
//                           color={accent}
//                         />
//                         {item.rules?.slice(0, 3).map((r: any, ri: number) => (
//                           <Tag
//                             key={ri}
//                             label={r.effect === "ALLOW" ? "✓ ALLOW" : "✗ DENY"}
//                             color={r.effect === "ALLOW" ? C.low : C.high}
//                           />
//                         ))}
//                       </>
//                     )}

//                     {/* ROLES → linked policies */}
//                     {type === "Roles" && item.policies?.length > 0 && (
//                       item.policies.slice(0, 4).map((p: any) => (
//                         <Tag key={p.id} label={`📋 ${p.displayName || p.name}`} color={accent} />
//                       ))
//                     )}
//                     {type === "Roles" && (!item.policies || item.policies.length === 0) && (
//                       <Tag label="No policies attached" color={C.text} />
//                     )}

//                     {/* GLOSSARIES → owners */}
//                     {type === "Glossaries" && item.owners?.length > 0 && (
//                       item.owners.map((o: any) => (
//                         <Tag
//                           key={o.id}
//                           label={`${o.type === "team" ? "👥" : "👤"} ${o.name}`}
//                           color={accent}
//                         />
//                       ))
//                     )}
//                     {type === "Glossaries" && (!item.owners || item.owners.length === 0) && (
//                       <Tag label="⚠ No owner" color={C.high} />
//                     )}

//                     {/* GLOSSARIES → cert status */}
//                     {type === "Glossaries" && (() => {
//                       const hasCert = item.description?.includes("PolicyGuard: certifiedOn");
//                       return hasCert
//                         ? <Tag label="🏅 Certified" color={C.low} />
//                         : <Tag label="Uncertified" color={C.text} />;
//                     })()}
//                   </div>
//                 </div>

//                 {/* Index badge */}
//                 <span style={{
//                   fontSize: "10px", color: "#475569",
//                   fontFamily: "monospace",
//                   background: "#0f172a",
//                   border: "1px solid #1e293b",
//                   padding: "2px 6px", borderRadius: "4px",
//                   whiteSpace: "nowrap", flexShrink: 0,
//                 }}>
//                   #{String(i + 1).padStart(2, "0")}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Footer count */}
//       <div style={{
//         marginTop: "14px",
//         paddingTop: "14px",
//         borderTop: `1px solid #334155`,
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//       }}>
//         <span style={{ color: C.text, fontSize: "12px" }}>
//           {query ? `${filtered.length} of ${data.length} shown` : `${data.length} total`}
//         </span>
//         <div style={{
//           width: "8px", height: "8px", borderRadius: "50%",
//           background: accent,
//           boxShadow: `0 0 6px ${accent}`,
//         }} />
//       </div>
//     </>
//   );
// }

// function Tag({ label, color }: { label: string; color: string }) {
//   return (
//     <span style={{
//       fontSize: "11px",
//       padding: "2px 8px",
//       borderRadius: "20px",
//       background: `${color}18`,
//       color,
//       border: `1px solid ${color}30`,
//       whiteSpace: "nowrap",
//     }}>
//       {label}
//     </span>
//   );
// }

// // ─── MAIN DASHBOARD ──────────────────────────────────────────
// export default function Dashboard() {
//   const { token, email } = useAuth();
//   const navigate = useNavigate();

//   const [stats, setStats] = useState<any>(null);
//   const [findings, setFindings] = useState<any[]>([]);
//   const [certs, setCerts] = useState<any[]>([]);
//   const [score, setScore] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Modal state
//   const [modal, setModal] = useState<{
//     type: ModalType | null;
//     data: any[];
//     loading: boolean;
//   }>({ type: null, data: [], loading: false });

//   // Hover state for clickable cards
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//       useEffect(() => {
//       if (!token) return;

//       const api = getApi(token);

//       Promise.all([
//         api.get("/api/stats"),
//         api.get("/api/findings"),
//         api.get("/api/certifications"),
//         api.get("/api/score"),
//       ])
//         .then(([s, f, c, sc]) => {
//           setStats(s.data);
//           setFindings(Array.isArray(f.data) ? f.data : []);
//           setCerts(Array.isArray(c.data) ? c.data : []);
//           setScore(sc.data);
//         })
//         .catch((err) => setError(err.message))
//         .finally(() => setLoading(false));
//     }, [token]);

//   const openModal = async (type: ModalType) => {
//     setModal({ type, data: [], loading: true });
//     try {
//       const endpoint = type.toLowerCase(); // policies, roles, glossaries
//       const res = await axios.get(`/api/${endpoint}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setModal({ type, data: Array.isArray(res.data) ? res.data : [], loading: false });
//     } catch {
//       setModal({ type, data: [], loading: false });
//     }
//   };

//   const closeModal = () => setModal({ type: null, data: [], loading: false });

//   const high = findings.filter(f => f.severity === "HIGH").length;
//   const medium = findings.filter(f => f.severity === "MEDIUM").length;
//   const low = findings.filter(f => f.severity === "LOW").length;

//   const pieData = [
//     { name: "High", value: high, color: C.high },
//     { name: "Medium", value: medium, color: C.medium },
//     { name: "Low", value: low, color: C.low },
//   ].filter(d => d.value > 0);

//   const barData = stats ? [
//     { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
//     { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
//     { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
//     { name: "Users", value: stats.users ?? 0, fill: C.medium },
//     { name: "Teams", value: stats.teams ?? 0, fill: C.high },
//   ] : [];

//   const certStatusData = [
//     { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
//     { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
//     { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
//     { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
//   ];

//     const scoreBreakdown = [
//     { name: "Policy Coverage", value: score?.breakdown?.policyCoverage ?? 0, max: 25, color: C.purple },
//     { name: "Ownership Health", value: score?.breakdown?.ownershipHealth ?? 0, max: 25, color: C.blue },
//     { name: "Team Structure", value: score?.breakdown?.teamStructure ?? 0, max: 25, color: C.low },
//     { name: "Certification Rate", value: score?.breakdown?.certificationRate ?? 0, max: 25, color: C.medium },
//   ];

//   const typeData = findings.reduce((acc: any[], f) => {
//     const existing = acc.find(a => a.type === f.type);
//     if (existing) existing.count++;
//     else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
//     return acc;
//   }, []);

//   const CLICKABLE: ModalType[] = ["Policies", "Roles", "Glossaries"];

//   if (loading) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛡️</div>
//         <div style={{ color: C.text, fontSize: "14px" }}>Loading governance data...</div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
//         <div style={{ color: C.high, fontSize: "16px", marginBottom: "8px" }}>Failed to load: {error}</div>
//         <div style={{ color: C.text, fontSize: "13px", marginBottom: "24px" }}>
//           Make sure OpenMetadata is running at localhost:8585
//         </div>
//         <button onClick={() => window.location.reload()} style={{
//           padding: "10px 24px",
//           background: "linear-gradient(135deg, #667eea, #764ba2)",
//           border: "none", borderRadius: "8px",
//           color: "white", cursor: "pointer", fontSize: "14px"
//         }}>🔄 Retry</button>
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: "1200px" }}>
//       {/* Header */}
//       <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//         <div>
//           <h1 style={{ fontSize: "26px", fontWeight: "700", color: C.bright, letterSpacing: "-0.5px" }}>
//             Governance Overview
//           </h1>
//           <p style={{ color: C.text, marginTop: "4px", fontSize: "13px" }}>
//             {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: "8px" }}>
//           {[
//             { label: "🔍 Audit", path: "/audit" },
//             { label: "🤝 Delegate", path: "/delegate" },
//             { label: "🏅 Certify", path: "/certify" },
//           ].map(a => (
//             <button key={a.path} onClick={() => navigate(a.path)} style={{
//               padding: "8px 14px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               border: "none", borderRadius: "8px",
//               color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//             }}>{a.label}</button>
//           ))}
//         </div>
//       </div>

//       {/* Top row — Risk Score + Stat Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Risk Score Card */}
//         <div style={{
//           background: C.card,
//           border: `1px solid ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}44`,
//           borderRadius: "16px", padding: "24px",
//           boxShadow: `0 0 20px ${score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high}11`,
//           display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//         }}>
//           <div style={{ fontSize: "13px", color: C.text, marginBottom: "12px", fontWeight: "600", letterSpacing: "1px" }}>
//             GOVERNANCE SCORE
//           </div>
//           {score && <RiskGauge score={score.total} risk={score.risk} />}
//           <div style={{ marginTop: "16px", width: "100%" }}>
//             {scoreBreakdown.map(item => (
//               <div key={item.name} style={{ marginBottom: "8px" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                   <span style={{ fontSize: "11px", color: C.text }}>{item.name}</span>
//                   <span style={{ fontSize: "11px", color: item.color, fontWeight: "600" }}>{item.value}/{item.max}</span>
//                 </div>
//                 <div style={{ height: "4px", background: "#0f172a", borderRadius: "2px" }}>
//                   <div style={{
//                     height: "100%", borderRadius: "2px",
//                     width: `${(item.value / item.max) * 100}%`,
//                     background: item.color,
//                     transition: "width 1s ease",
//                   }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Stat Cards Grid */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
//           {[
//             { label: "Policies", value: stats?.policies ?? 0, icon: "📋", color: C.purple, sub: "governance rules" },
//             { label: "Roles", value: stats?.roles ?? 0, icon: "🔑", color: C.blue, sub: "access roles" },
//             { label: "Glossaries", value: stats?.glossaries ?? 0, icon: "📚", color: C.low, sub: "data glossaries" },
//             { label: "Users", value: stats?.users ?? 0, icon: "👥", color: C.medium, sub: "active users" },
//             { label: "Teams", value: stats?.teams ?? 0, icon: "👨‍👩‍👧", color: C.high, sub: "team groups" },
//             {
//               label: "Issues",
//               value: high + medium + low,
//               icon: high > 0 ? "🔴" : "✅",
//               color: high > 0 ? C.high : C.low,
//               sub: `${high} critical`,
//             },
//           ].map(card => {
//             const isClickable = CLICKABLE.includes(card.label as ModalType);
//             const isHovered = hoveredCard === card.label;
//             return (
//               <div
//                 key={card.label}
//                 onClick={() => isClickable && openModal(card.label as ModalType)}
//                 onMouseEnter={() => isClickable && setHoveredCard(card.label)}
//                 onMouseLeave={() => setHoveredCard(null)}
//                 style={{
//                   background: isHovered ? "#243350" : C.card,
//                   border: `1px solid ${isHovered ? card.color + "88" : C.border}`,
//                   borderRadius: "12px",
//                   padding: "16px 20px",
//                   borderLeft: `3px solid ${card.color}`,
//                   cursor: isClickable ? "pointer" : "default",
//                   transition: "all 0.2s ease",
//                   transform: isHovered ? "translateY(-2px)" : "translateY(0)",
//                   boxShadow: isHovered ? `0 8px 24px ${card.color}22` : "none",
//                   position: "relative",
//                 }}
//               >
//                 {/* Clickable hint */}
//                 {isClickable && (
//                   <div style={{
//                     position: "absolute",
//                     top: "8px",
//                     right: "8px",
//                     fontSize: "9px",
//                     color: card.color,
//                     opacity: isHovered ? 1 : 0,
//                     transition: "opacity 0.2s",
//                     fontWeight: "600",
//                     letterSpacing: "0.5px",
//                   }}>
//                     VIEW ALL ↗
//                   </div>
//                 )}
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <div>
//                     <div style={{ fontSize: "24px", fontWeight: "700", color: card.color, fontFamily: "monospace" }}>
//                       <AnimatedNumber target={card.value} />
//                     </div>
//                     <div style={{ fontSize: "13px", color: C.bright, marginTop: "2px", fontWeight: "600" }}>{card.label}</div>
//                     <div style={{ fontSize: "11px", color: C.text, marginTop: "2px" }}>{card.sub}</div>
//                   </div>
//                   <div style={{ fontSize: "24px" }}>{card.icon}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Middle row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

//         {/* Findings pie */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🔍 FINDINGS BY SEVERITY
//           </h2>
//           {pieData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "32px", color: C.low }}>
//               <div style={{ fontSize: "40px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "14px" }}>No findings! Governance is healthy.</div>
//             </div>
//           ) : (
//             <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
//               <ResponsiveContainer width={150} height={150}>
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={4}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//               <div style={{ flex: 1 }}>
//                 {[
//                   { label: "Critical", value: high, color: C.high },
//                   { label: "Medium", value: medium, color: C.medium },
//                   { label: "Low", value: low, color: C.low },
//                 ].map(item => (
//                   <div key={item.label} style={{
//                     display: "flex", justifyContent: "space-between",
//                     alignItems: "center", marginBottom: "10px",
//                     padding: "8px 12px", borderRadius: "8px",
//                     background: `${item.color}11`,
//                     border: `1px solid ${item.color}22`,
//                   }}>
//                     <span style={{ fontSize: "12px", color: C.text }}>{item.label}</span>
//                     <span style={{ fontSize: "18px", fontWeight: "700", color: item.color, fontFamily: "monospace" }}>{item.value}</span>
//                   </div>
//                 ))}
//                 <button onClick={() => navigate("/audit")} style={{
//                   width: "100%", marginTop: "4px", padding: "8px",
//                   background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                   border: `1px solid #667eea44`, borderRadius: "6px",
//                   color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//                 }}>View All Findings →</button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Cert status */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             🏅 CERTIFICATION STATUS
//           </h2>
//           <ResponsiveContainer width="100%" height={150}>
//             <BarChart data={certStatusData} barSize={28}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
//               <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {certStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//           <button onClick={() => navigate("/certify")} style={{
//             width: "100%", marginTop: "12px", padding: "8px",
//             background: "linear-gradient(135deg, #667eea22, #764ba222)",
//             border: `1px solid #667eea44`, borderRadius: "6px",
//             color: "#a78bfa", cursor: "pointer", fontSize: "12px", fontWeight: "600"
//           }}>Manage Certifications →</button>
//         </div>
//       </div>

//       {/* Bottom row */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

//         {/* Asset breakdown */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             📊 ASSET BREAKDOWN
//           </h2>
//           <ResponsiveContainer width="100%" height={160}>
//             <BarChart data={barData} layout="vertical" barSize={14}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
//               <XAxis type="number" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} />
//               <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
//               <Tooltip contentStyle={{ background: "#0f172a", border: `1px solid ${C.border}`, borderRadius: "8px", color: C.bright, fontSize: "12px" }} />
//               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
//                 {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Finding types + Quick actions */}
//         <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px" }}>
//           <h2 style={{ fontSize: "14px", fontWeight: "600", color: C.bright, marginBottom: "20px", letterSpacing: "0.5px" }}>
//             ⚠️ FINDING TYPES
//           </h2>
//           {typeData.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "24px", color: C.low }}>
//               <div style={{ fontSize: "32px" }}>✅</div>
//               <div style={{ marginTop: "8px", fontSize: "13px" }}>No issues detected!</div>
//             </div>
//           ) : (
//             <div style={{ marginBottom: "16px" }}>
//               {typeData.map((t, i) => (
//                 <div key={i} style={{
//                   display: "flex", justifyContent: "space-between", alignItems: "center",
//                   padding: "8px 0",
//                   borderBottom: i < typeData.length - 1 ? `1px solid ${C.border}` : "none"
//                 }}>
//                   <span style={{ fontSize: "12px", color: C.text }}>{t.type.toLowerCase()}</span>
//                   <span style={{
//                     padding: "2px 10px", borderRadius: "20px",
//                     background: "rgba(239,68,68,0.1)", color: C.high,
//                     fontSize: "11px", fontWeight: "700"
//                   }}>{t.count}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "auto" }}>
//             {[
//               { label: "🔐 Pre-Delegate", path: "/pre-delegate" },
//               { label: "🤝 Delegate", path: "/delegate" },
//               { label: "🔍 Audit", path: "/audit" },
//               { label: "🏅 Certify", path: "/certify" },
//             ].map(a => (
//               <button key={a.path} onClick={() => navigate(a.path)} style={{
//                 padding: "8px",
//                 background: "linear-gradient(135deg, #667eea22, #764ba222)",
//                 border: `1px solid #667eea44`,
//                 borderRadius: "6px", color: "#a78bfa",
//                 cursor: "pointer", fontSize: "11px", fontWeight: "600"
//               }}>{a.label}</button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ─── MODAL ─────────────────────────────────────────────── */}
//       {modal.type && (
//         <DetailModal
//           type={modal.type}
//           data={modal.data}
//           loading={modal.loading}
//           onClose={closeModal}
//         />
//       )}
//     </div>
//   );
// }







//third ui


import { getApi } from "../api";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const C = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  card: "#111318",
  cardBorder: "#1f2937",
  bg: "#0a0c10",
  text: "#6b7280",
  textMid: "#9ca3af",
  bright: "#f9fafb",
  white: "#ffffff",
  accent: "#6366f1",
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .anim-1 { animation: fadeUp 0.35s ease both 0.05s; }
    .anim-2 { animation: fadeUp 0.35s ease both 0.1s; }
    .anim-3 { animation: fadeUp 0.35s ease both 0.15s; }
    .anim-4 { animation: fadeUp 0.35s ease both 0.2s; }
    .anim-5 { animation: fadeUp 0.35s ease both 0.25s; }
    .anim-6 { animation: fadeUp 0.35s ease both 0.3s; }

    .stat-card {
      transition: background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .stat-card:hover {
      background: #161b24 !important;
      transform: translateY(-1px);
    }

    .pill-btn {
      transition: background 0.15s, border-color 0.15s, opacity 0.15s;
      cursor: pointer;
    }
    .pill-btn:hover { opacity: 0.8; }

    .action-link {
      transition: color 0.15s, background 0.15s;
      cursor: pointer;
    }
    .action-link:hover { background: rgba(255,255,255,0.04) !important; }

    .modal-row {
      transition: background 0.12s;
      cursor: default;
    }
    .modal-row:hover { background: #161b24 !important; }

    .modal-scroll::-webkit-scrollbar { width: 3px; }
    .modal-scroll::-webkit-scrollbar-track { background: transparent; }
    .modal-scroll::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 2px; }

    input[type="text"]:focus {
      outline: none;
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    }

    .close-x { transition: background 0.12s, color 0.12s; cursor: pointer; }
    .close-x:hover { background: #1f2937 !important; color: #f9fafb !important; }
  `}</style>
);

function AnimatedNumber({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) { setN(0); return; }
    let v = 0;
    const step = Math.ceil(target / 35);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setN(target); clearInterval(t); }
      else setN(v);
    }, 22);
    return () => clearInterval(t);
  }, [target]);
  return <>{n}</>;
}

function Gauge({ score, risk }: { score: number; risk: string }) {
  const color = risk === "LOW" ? C.low : risk === "MODERATE" ? C.medium : C.high;
  const [a, setA] = useState(0);
  useEffect(() => {
    let s = 0;
    const t = setInterval(() => { s++; if (s >= score) { setA(score); clearInterval(t); } else setA(s); }, 12);
    return () => clearInterval(t);
  }, [score]);
  const c = Math.PI * 54;
  const d = (a / 100) * c;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M14 74 A56 56 0 0 1 126 74" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
        <path d="M14 74 A56 56 0 0 1 126 74" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${d} ${c}`} style={{ transition: "stroke-dasharray 0.05s linear" }} />
        <text x="70" y="64" textAnchor="middle" fill={color} fontSize="26" fontWeight="700"
          fontFamily="'IBM Plex Mono', monospace">{a}</text>
        <text x="70" y="77" textAnchor="middle" fill="#374151" fontSize="9"
          fontFamily="'Plus Jakarta Sans', sans-serif">OUT OF 100</text>
      </svg>
      <span style={{
        display: "inline-block", padding: "2px 10px",
        borderRadius: "4px", background: `${color}14`,
        color, fontSize: "10px", fontWeight: "600",
        letterSpacing: "0.8px", border: `1px solid ${color}22`,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>{risk} RISK</span>
    </div>
  );
}

function Bar2({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: "2px", background: "#1f2937", borderRadius: "1px", overflow: "hidden" }}>
      <div style={{
        height: "100%", background: color, borderRadius: "1px",
        width: `${(value / max) * 100}%`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

type ModalType = "Policies" | "Roles" | "Glossaries";

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 7px",
      borderRadius: "3px", fontSize: "10px",
      background: `${color}12`, color,
      border: `1px solid ${color}20`,
      fontFamily: "'IBM Plex Mono', monospace",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function ModalList({ type, data, accent }: { type: ModalType; data: any[]; accent: string }) {
  const [q, setQ] = useState("");
  const list = data.filter(x =>
    (x.displayName || x.name || "").toLowerCase().includes(q.toLowerCase()) ||
    (x.description || "").toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <input type="text" placeholder={`Search ${type.toLowerCase()}...`} value={q}
        onChange={e => setQ(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", marginBottom: "10px",
          background: C.bg, border: `1px solid ${C.cardBorder}`,
          borderRadius: "8px", color: C.bright, fontSize: "13px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxSizing: "border-box" as any,
        }} />
      <div className="modal-scroll" style={{ overflowY: "auto", flex: 1 }}>
        {list.map((item: any, i: number) => (
          <div key={item.id ?? i} className="modal-row" style={{
            padding: "11px 13px", borderRadius: "8px", marginBottom: "4px",
            background: C.bg, border: `1px solid ${C.cardBorder}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.white, fontWeight: "600", fontSize: "13px", marginBottom: "2px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.displayName || item.name}
                </div>
                {item.description && (
                  <div style={{ color: C.text, fontSize: "11px", lineHeight: 1.5, marginBottom: "7px",
                    overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>
                    {item.description.replace(/\n\n<!--.*?-->/gs, "")}
                  </div>
                )}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {type === "Policies" && (<>
                    <Chip label={`${item.rules?.length ?? 0} rules`} color={accent} />
                    {item.rules?.slice(0, 3).map((r: any, ri: number) => (
                      <Chip key={ri} label={r.effect} color={r.effect === "ALLOW" ? C.low : C.high} />
                    ))}
                  </>)}
                  {type === "Roles" && (item.policies?.length > 0
                    ? item.policies.slice(0, 4).map((p: any) => <Chip key={p.id} label={p.displayName || p.name} color={accent} />)
                    : <Chip label="no policies" color={C.text} />
                  )}
                  {type === "Glossaries" && (<>
                    {item.owners?.length > 0
                      ? item.owners.map((o: any) => <Chip key={o.id} label={`${o.type} · ${o.name}`} color={accent} />)
                      : <Chip label="no owner" color={C.high} />}
                    <Chip
                      label={item.description?.includes("certifiedOn") ? "certified" : "uncertified"}
                      color={item.description?.includes("certifiedOn") ? C.low : C.text}
                    />
                  </>)}
                </div>
              </div>
              <span style={{ fontSize: "10px", color: "#374151", fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: C.text, fontSize: "13px" }}>
            No results for "{q}"
          </div>
        )}
      </div>
      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.cardBorder}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>
          {q ? `${list.length} / ${data.length}` : `${data.length} total`}
        </span>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, marginTop: "3px" }} />
      </div>
    </>
  );
}

function Modal({ type, data, loading, onClose }: { type: ModalType; data: any[]; loading: boolean; onClose: () => void }) {
  const accent = type === "Policies" ? C.purple : type === "Roles" ? C.blue : C.low;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(6px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.12s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.cardBorder}`,
        borderRadius: "14px", padding: "22px",
        width: "540px", maxHeight: "68vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        animation: "slideUp 0.18s cubic-bezier(.4,0,.2,1)",
        borderTop: `2px solid ${accent}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, color: C.white, fontSize: "15px", fontWeight: "700", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {type}
            </h3>
            {!loading && (
              <p style={{ margin: "2px 0 0", color: C.text, fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" }}>
                {data.length} {type.toLowerCase()} in system
              </p>
            )}
          </div>
          <button className="close-x" onClick={onClose} style={{
            background: "none", border: `1px solid ${C.cardBorder}`,
            color: C.text, borderRadius: "6px",
            width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px",
          }}>✕</button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.text, fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ width: "20px", height: "20px", border: `2px solid ${C.cardBorder}`, borderTopColor: accent, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
            Loading...
          </div>
        ) : (
          <ModalList type={type} data={data} accent={accent} />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token, email } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: ModalType | null; data: any[]; loading: boolean }>
    ({ type: null, data: [], loading: false });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const api = getApi(token);
    Promise.all([
      api.get("/api/stats"),
      api.get("/api/findings"),
      api.get("/api/certifications"),
      api.get("/api/score"),
    ]).then(([s, f, c, sc]) => {
      setStats(s.data);
      setFindings(Array.isArray(f.data) ? f.data : []);
      setCerts(Array.isArray(c.data) ? c.data : []);
      setScore(sc.data);
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [token]);

  const openModal = async (type: ModalType) => {
    setModal({ type, data: [], loading: true });
    try {
      const res = await axios.get(`/api/${type.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      setModal({ type, data: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch { setModal({ type, data: [], loading: false }); }
  };

  const high = findings.filter(f => f.severity === "HIGH").length;
  const medium = findings.filter(f => f.severity === "MEDIUM").length;
  const low = findings.filter(f => f.severity === "LOW").length;

  const pieData = [
    { name: "High", value: high, color: C.high },
    { name: "Medium", value: medium, color: C.medium },
    { name: "Low", value: low, color: C.low },
  ].filter(d => d.value > 0);

  const barData = stats ? [
    { name: "Policies", value: stats.policies ?? 0, fill: C.purple },
    { name: "Roles", value: stats.roles ?? 0, fill: C.blue },
    { name: "Glossaries", value: stats.glossaries ?? 0, fill: C.low },
    { name: "Users", value: stats.users ?? 0, fill: C.medium },
    { name: "Teams", value: stats.teams ?? 0, fill: C.high },
  ] : [];

  const certData = [
    { name: "Active", value: certs.filter(c => c.status === "ACTIVE").length, color: C.low },
    { name: "Expiring", value: certs.filter(c => c.status === "EXPIRING_SOON").length, color: C.medium },
    { name: "Expired", value: certs.filter(c => c.status === "EXPIRED").length, color: C.high },
    { name: "Uncertified", value: certs.filter(c => c.status === "UNCERTIFIED").length, color: C.text },
  ];

  const scoreBreakdown = [
    { label: "Policy Coverage", value: score?.breakdown?.policyCoverage ?? 0, color: C.purple },
    { label: "Ownership Health", value: score?.breakdown?.ownershipHealth ?? 0, color: C.blue },
    { label: "Team Structure", value: score?.breakdown?.teamStructure ?? 0, color: C.low },
    { label: "Certification Rate", value: score?.breakdown?.certificationRate ?? 0, color: C.medium },
  ];

  const typeData = findings.reduce((acc: any[], f) => {
    const ex = acc.find(a => a.type === f.type);
    if (ex) ex.count++; else acc.push({ type: f.type.replace(/_/g, " "), count: 1 });
    return acc;
  }, []);

  const CLICKABLE: ModalType[] = ["Policies", "Roles", "Glossaries"];
  const F = "'Plus Jakarta Sans', sans-serif";
  const M = "'IBM Plex Mono', monospace";

  const card = (extra?: object) => ({
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: "12px",
    padding: "20px",
    ...(extra || {}),
  });

  const sectionLabel = (label: string, color?: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <div style={{ width: "2px", height: "12px", borderRadius: "1px", background: color || C.accent, flexShrink: 0 }} />
      <span style={{ fontSize: "11px", fontWeight: "600", color: C.textMid, letterSpacing: "1px", textTransform: "uppercase" as any, fontFamily: F }}>
        {label}
      </span>
    </div>
  );

  if (loading) return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "24px", height: "24px", border: `2px solid ${C.cardBorder}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: C.text, fontSize: "13px", fontFamily: F }}>Loading governance data...</div>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: C.high, fontSize: "14px", marginBottom: "6px", fontFamily: F, fontWeight: "600" }}>Failed to load</div>
          <div style={{ color: C.text, fontSize: "12px", marginBottom: "20px", fontFamily: M }}>{error}</div>
          <button onClick={() => window.location.reload()} className="pill-btn" style={{
            padding: "9px 20px", background: C.accent, border: "none",
            borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", fontFamily: F,
          }}>Retry</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div style={{ maxWidth: "1200px", fontFamily: F }}>

        {/* Header */}
        <div className="anim-1" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: C.white, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
              Governance Overview
            </h1>
            <p style={{ color: C.text, fontSize: "12px", margin: 0, fontFamily: M }}>
              {email} · {new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { label: "Audit", path: "/audit", color: C.purple },
              { label: "Delegate", path: "/delegate", color: C.blue },
              { label: "Certify", path: "/certify", color: C.medium },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} className="pill-btn" style={{
                padding: "7px 14px",
                background: `${a.color}12`,
                border: `1px solid ${a.color}28`,
                borderRadius: "7px", color: a.color,
                fontSize: "12px", fontWeight: "600", fontFamily: F,
              }}>{a.label}</button>
            ))}
          </div>
        </div>

        {/* Row 1: Score + Stat Cards */}
        <div className="anim-2" style={{ display: "grid", gridTemplateColumns: "248px 1fr", gap: "14px", marginBottom: "14px" }}>

          {/* Score */}
          <div style={{ ...card(), display: "flex", flexDirection: "column", alignItems: "center" }}>
            {sectionLabel("Governance Score", score?.risk === "LOW" ? C.low : score?.risk === "MODERATE" ? C.medium : C.high)}
            {score && <Gauge score={score.total} risk={score.risk} />}
            <div style={{ marginTop: "18px", width: "100%" }}>
              {scoreBreakdown.map(item => (
                <div key={item.label} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: C.textMid }}>{item.label}</span>
                    <span style={{ fontSize: "10px", color: item.color, fontFamily: M, fontWeight: "500" }}>{item.value}/25</span>
                  </div>
                  <Bar2 value={item.value} max={25} color={item.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              { label: "Policies", value: stats?.policies ?? 0, color: C.purple, sub: "governance rules" },
              { label: "Roles", value: stats?.roles ?? 0, color: C.blue, sub: "access roles" },
              { label: "Glossaries", value: stats?.glossaries ?? 0, color: C.low, sub: "data glossaries" },
              { label: "Users", value: stats?.users ?? 0, color: C.medium, sub: "active users" },
              { label: "Teams", value: stats?.teams ?? 0, color: C.high, sub: "team groups" },
              { label: "Issues", value: high + medium + low, color: high > 0 ? C.high : C.low, sub: `${high} critical` },
            ].map(card2 => {
              const isClick = CLICKABLE.includes(card2.label as ModalType);
              const isHov = hovered === card2.label;
              return (
                <div key={card2.label} className="stat-card"
                  onClick={() => isClick && openModal(card2.label as ModalType)}
                  onMouseEnter={() => isClick && setHovered(card2.label)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: C.card,
                    border: `1px solid ${isHov ? card2.color + "35" : C.cardBorder}`,
                    borderRadius: "12px", padding: "18px 16px",
                    cursor: isClick ? "pointer" : "default",
                    position: "relative", overflow: "hidden",
                    boxShadow: isHov ? `0 4px 20px ${card2.color}12` : "none",
                  }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
                    background: card2.color, opacity: isHov ? 0.6 : 0.2,
                    transition: "opacity 0.15s",
                  }} />
                  {isClick && (
                    <div style={{
                      position: "absolute", top: "10px", right: "10px",
                      opacity: isHov ? 1 : 0, transition: "opacity 0.15s",
                      fontSize: "9px", color: card2.color, fontFamily: M, letterSpacing: "0.5px",
                    }}>VIEW ↗</div>
                  )}
                  <div style={{ fontSize: "30px", fontWeight: "700", color: card2.color, fontFamily: M, lineHeight: 1, marginBottom: "6px" }}>
                    <AnimatedNumber target={card2.value} />
                  </div>
                  <div style={{ fontSize: "13px", color: C.bright, fontWeight: "600", marginBottom: "2px" }}>{card2.label}</div>
                  <div style={{ fontSize: "10px", color: C.text, fontFamily: M }}>{card2.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Findings + Certs */}
        <div className="anim-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>

          <div style={card()}>
            {sectionLabel("Findings by Severity", C.high)}
            {pieData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: C.low }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>✓</div>
                <div style={{ fontSize: "12px" }}>No findings. Governance is healthy.</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {[{ label: "Critical", value: high, color: C.high }, { label: "Medium", value: medium, color: C.medium }, { label: "Low", value: low, color: C.low }].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "6px 10px", borderRadius: "6px", marginBottom: "5px",
                      background: `${item.color}08`, border: `1px solid ${item.color}14`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: item.color }} />
                        <span style={{ fontSize: "11px", color: C.textMid }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: item.color, fontFamily: M }}>{item.value}</span>
                    </div>
                  ))}
                  <button onClick={() => navigate("/audit")} className="action-link" style={{
                    width: "100%", marginTop: "6px", padding: "7px",
                    background: "transparent", border: `1px solid ${C.cardBorder}`,
                    borderRadius: "6px", color: C.textMid, fontSize: "11px", fontWeight: "600",
                    fontFamily: F, display: "block",
                  }}>View all findings →</button>
                </div>
              </div>
            )}
          </div>

          <div style={card()}>
            {sectionLabel("Certification Status", C.medium)}
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={certData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111318" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.text, fontSize: 10, fontFamily: F }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "8px", color: C.bright, fontSize: "11px", fontFamily: F }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {certData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <button onClick={() => navigate("/certify")} className="action-link" style={{
              width: "100%", marginTop: "10px", padding: "7px",
              background: "transparent", border: `1px solid ${C.cardBorder}`,
              borderRadius: "6px", color: C.textMid, fontSize: "11px", fontWeight: "600",
              fontFamily: F, display: "block",
            }}>Manage certifications →</button>
          </div>
        </div>

        {/* Row 3: Asset Breakdown + Finding Types */}
        <div className="anim-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

          <div style={card()}>
            {sectionLabel("Asset Breakdown", C.blue)}
            <ResponsiveContainer width="100%" height={148}>
              <BarChart data={barData} layout="vertical" barSize={11}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111318" horizontal={false} />
                <XAxis type="number" tick={{ fill: C.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: C.textMid, fontSize: 11, fontFamily: F }} axisLine={false} tickLine={false} width={65} />
                <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "8px", color: C.bright, fontSize: "11px", fontFamily: F }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...card(), display: "flex", flexDirection: "column" }}>
            {sectionLabel("Finding Types", C.high)}
            {typeData.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.low, padding: "16px" }}>
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>✓</div>
                <div style={{ fontSize: "12px" }}>No issues detected</div>
              </div>
            ) : (
              <div style={{ flex: 1, marginBottom: "12px" }}>
                {typeData.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0",
                    borderBottom: i < typeData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
                  }}>
                    <span style={{ fontSize: "11px", color: C.text, fontFamily: M }}>{t.type.toLowerCase()}</span>
                    <span style={{
                      padding: "1px 8px", borderRadius: "3px",
                      background: `${C.high}10`, color: C.high,
                      fontSize: "10px", fontWeight: "600", fontFamily: M,
                    }}>{t.count}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { label: "Pre-Delegate", path: "/pre-delegate", color: C.purple },
                { label: "Delegate", path: "/delegate", color: C.blue },
                { label: "Audit", path: "/audit", color: C.high },
                { label: "Certify", path: "/certify", color: C.medium },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)} className="pill-btn" style={{
                  padding: "7px 8px",
                  background: `${a.color}10`,
                  border: `1px solid ${a.color}22`,
                  borderRadius: "6px", color: a.color,
                  fontSize: "11px", fontWeight: "600", fontFamily: F,
                }}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {modal.type && (
          <Modal type={modal.type} data={modal.data} loading={modal.loading} onClose={() => setModal({ type: null, data: [], loading: false })} />
        )}
      </div>
    </>
  );
}