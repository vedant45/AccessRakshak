import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", icon: "🏠", label: "Dashboard" },
  { path: "/audit", icon: "🔍", label: "Audit" },
  { path: "/delegate", icon: "🤝", label: "Delegate" },
  { path: "/certify", icon: "🏅", label: "Certify" },
  { path: "/pre-delegate", icon: "🔐", label: "Pre-Delegate" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();

  return (
    <div style={{
      width: "220px",
      minHeight: "100vh",
      background: "#111827",
      borderRight: "1px solid #1f2937",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid #1f2937",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>🛡️</span>
          <div>
            <div style={{
              fontWeight: "700",
              fontSize: "16px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>PolicyGuard</div>
            <div style={{ fontSize: "10px", color: "#4b5563" }}>Governance Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                marginBottom: "4px",
                background: active
                  ? "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))"
                  : "transparent",
                border: active ? "1px solid rgba(102,126,234,0.3)" : "1px solid transparent",
                borderRadius: "8px",
                color: active ? "#a78bfa" : "#9ca3af",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: active ? "600" : "400",
                textAlign: "left",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #1f2937",
      }}>
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
          {email}
        </div>
        <button
          onClick={() => { logout(); }}
          style={{
            width: "100%",
            padding: "8px",
            background: "transparent",
            border: "1px solid #374151",
            borderRadius: "6px",
            color: "#9ca3af",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}



