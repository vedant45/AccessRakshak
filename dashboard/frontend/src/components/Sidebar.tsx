// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const navItems = [
//   { path: "/dashboard", icon: "🏠", label: "Dashboard" },
//   { path: "/audit", icon: "🔍", label: "Audit" },
//   { path: "/delegate", icon: "🤝", label: "Delegate" },
//   { path: "/certify", icon: "🏅", label: "Certify" },
//   { path: "/pre-delegate", icon: "🔐", label: "Pre-Delegate" },
// ];

// export default function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { email, logout } = useAuth();

//   return (
//     <div style={{
//       width: "220px",
//       minHeight: "100vh",
//       background: "#111827",
//       borderRight: "1px solid #1f2937",
//       display: "flex",
//       flexDirection: "column",
//       position: "fixed",
//       left: 0,
//       top: 0,
//       bottom: 0,
//     }}>
//       {/* Logo */}
//       <div style={{
//         padding: "24px 20px",
//         borderBottom: "1px solid #1f2937",
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//           <span style={{ fontSize: "24px" }}>🛡️</span>
//           <div>
//             <div style={{
//               fontWeight: "700",
//               fontSize: "16px",
//               background: "linear-gradient(135deg, #667eea, #764ba2)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}>PolicyGuard</div>
//             <div style={{ fontSize: "10px", color: "#4b5563" }}>Governance Platform</div>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav style={{ padding: "16px 12px", flex: 1 }}>
//         {navItems.map(item => {
//           const active = location.pathname === item.path;
//           return (
//             <button
//               key={item.path}
//               onClick={() => navigate(item.path)}
//               style={{
//                 width: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 padding: "10px 12px",
//                 marginBottom: "4px",
//                 background: active
//                   ? "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))"
//                   : "transparent",
//                 border: active ? "1px solid rgba(102,126,234,0.3)" : "1px solid transparent",
//                 borderRadius: "8px",
//                 color: active ? "#a78bfa" : "#9ca3af",
//                 cursor: "pointer",
//                 fontSize: "14px",
//                 fontWeight: active ? "600" : "400",
//                 textAlign: "left",
//               }}
//             >
//               <span>{item.icon}</span>
//               <span>{item.label}</span>
//             </button>
//           );
//         })}
//       </nav>

//       {/* User */}
//       <div style={{
//         padding: "16px",
//         borderTop: "1px solid #1f2937",
//       }}>
//         <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
//           {email}
//         </div>
//         <button
//           onClick={() => { logout(); }}
//           style={{
//             width: "100%",
//             padding: "8px",
//             background: "transparent",
//             border: "1px solid #374151",
//             borderRadius: "6px",
//             color: "#9ca3af",
//             cursor: "pointer",
//             fontSize: "13px",
//           }}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }














import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill={active ? "#a78bfa" : "#374151"} />
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill={active ? "#a78bfa" : "#374151"} />
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill={active ? "#a78bfa" : "#374151"} />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill={active ? "#a78bfa" : "#374151"} />
      </svg>
    ),
  },
  {
    path: "/audit",
    label: "Audit",
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="6.5" cy="6.5" r="4.5" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.5" />
        <path d="M10 10L13.5 13.5" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: "/delegate",
    label: "Delegate",
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="4.5" r="2.5" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.5" />
        <path d="M2 12c0-2.21 2.462-4 5.5-4s5.5 1.79 5.5 4" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: "/certify",
    label: "Certify",
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path
          d="M7.5 1.5L9.09 5.26L13.5 5.64L10.35 8.47L11.27 12.86L7.5 10.54L3.73 12.86L4.65 8.47L1.5 5.64L5.91 5.26L7.5 1.5Z"
          stroke={active ? "#a78bfa" : "#374151"}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: "/pre-delegate",
    label: "Pre-Delegate",
    icon: (active: boolean) => (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2.5" y="1" width="10" height="13" rx="1.5" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.5" />
        <path d="M5 5h5M5 8h5M5 11h2.5" stroke={active ? "#a78bfa" : "#374151"} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();

  const displayName = email?.split("@")[0] ?? "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#080b11",
        borderRight: "1px solid #0f1724",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #0f1724" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 0 12px rgba(124,58,237,0.4)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 0.5L1.5 3v4.5C1.5 10.7 3.96 13.55 7 14c3.04-.45 5.5-3.3 5.5-6.5V3L7 0.5Z" fill="white" fillOpacity="0.92" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.3px" }}>
              PolicyGuard
            </div>
            <div style={{ fontSize: "9px", color: "#1f2d42", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>
              Governance Platform
            </div>
          </div>
        </div>
      </div>

      {/* Welcome strip */}
      <div
        style={{
          margin: "12px 10px 0", padding: "10px 12px",
          background: "rgba(167,139,250,0.04)",
          border: "1px solid rgba(167,139,250,0.1)",
          borderRadius: "10px",
        }}
      >
        <div style={{ fontSize: "9px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "3px" }}>
          {greeting}
        </div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#c4b5fd", letterSpacing: "-0.2px" }}>
          {displayName}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "14px 8px", flex: 1 }}>
        <div style={{ fontSize: "9px", color: "#1f2d42", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: "6px" }}>
          Menu
        </div>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", marginBottom: "1px",
                background: active ? "rgba(167,139,250,0.07)" : "transparent",
                border: "none",
                borderLeft: `2px solid ${active ? "#7c3aed" : "transparent"}`,
                borderRadius: "0 8px 8px 0",
                color: active ? "#c4b5fd" : "#374151",
                cursor: "pointer", fontSize: "13px",
                fontWeight: active ? "600" : "400",
                textAlign: "left", transition: "all 0.15s ease",
              }}
            >
              {item.icon(active)}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 12px 18px", borderTop: "1px solid #0f1724" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div
            style={{
              width: "26px", height: "26px", borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: "700", color: "white", flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ fontSize: "11px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {email}
          </div>
        </div>
        <button
          onClick={() => { logout(); }}
          style={{
            width: "100%", padding: "7px", background: "transparent",
            border: "1px solid #0f1724", borderRadius: "7px",
            color: "#374151", cursor: "pointer", fontSize: "12px",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#1f2d42";
            (e.target as HTMLButtonElement).style.color = "#64748b";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#0f1724";
            (e.target as HTMLButtonElement).style.color = "#374151";
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}