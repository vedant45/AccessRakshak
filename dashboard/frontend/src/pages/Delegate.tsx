import { useState } from "react";
import Terminal from "../components/Terminal";

export default function Delegate() {
  const [command, setCommand] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9" }}>🤝 Delegate</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setCommand(`delegate-dry-${Date.now()}`)} style={{
            padding: "10px 24px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: "8px",
            color: "#94a3b8", cursor: "pointer", fontWeight: "600"
          }}>Dry Run</button>
          <button onClick={() => setCommand(`delegate-${Date.now()}`)} style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontWeight: "600"
          }}>Run Delegate</button>
        </div>
      </div>
      <Terminal command={command} />
    </div>
  );
}