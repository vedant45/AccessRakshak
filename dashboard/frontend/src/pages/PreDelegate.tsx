import { useState } from "react";
import Terminal from "../components/Terminal";

export default function PreDelegate() {
  const [command, setCommand] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9" }}>🔐 Pre-Delegate</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setCommand(`pre-delegate-dry-${Date.now()}`)} style={{
            padding: "10px 24px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: "8px",
            color: "#94a3b8", cursor: "pointer", fontWeight: "600"
          }}>Dry Run</button>
          <button onClick={() => setCommand(`pre-delegate-${Date.now()}`)} style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>Run Pre-Delegate</button>
        </div>
      </div>

      <div style={{
        background: "#1e293b", border: "1px solid #f59e0b33",
        borderRadius: "10px", padding: "16px", marginBottom: "24px"
      }}>
        
        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
          Pre-delegation scans all asset owners and reassigns from deleted/inactive 
          users to the Data-Stewards team before certification runs. 
          Assets owned only by admin are also flagged and reassigned.
        </p>
      </div>

      <Terminal command={command} />
    </div>
  );
}