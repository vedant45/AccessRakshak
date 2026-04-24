import { useEffect, useRef, useState } from "react";

interface Props {
  command: string | null;
  onDone?: () => void;
}

interface Line {
  text: string;
  type: string;
  timestamp: string;
}

export default function Terminal({ command, onDone }: Props) {
  const [lines, setLines] = useState<Line[]>([
    { text: "PolicyGuard Terminal v1.0.0", type: "system", timestamp: new Date().toLocaleTimeString() },
    { text: "Connected to OpenMetadata governance engine", type: "system", timestamp: new Date().toLocaleTimeString() },
    { text: "Ready. Click a command button to run...", type: "muted", timestamp: new Date().toLocaleTimeString() },
  ]);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (!command) return;
    const cmd = command.replace(/-\d+$/, "").replace(/-dry$/, "");
    const isDry = command.includes("dry");

    setLines([
      { text: "─".repeat(50), type: "divider", timestamp: "" },
      { text: `$ policy-guard ${cmd}${isDry ? " --dry-run" : ""}`, type: "cmd", timestamp: new Date().toLocaleTimeString() },
      { text: "─".repeat(50), type: "divider", timestamp: "" },
    ]);
    setRunning(true);

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ command }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const lines = msg.data.split("\n").filter((l: string) => l.trim());
      lines.forEach((line: string) => {
        setLines(prev => [...prev, {
          text: line,
          type: msg.type,
          timestamp: new Date().toLocaleTimeString()
        }]);
      });
      if (msg.type === "done") {
        setRunning(false);
        onDone?.();
        ws.close();
      }
    };

    ws.onerror = () => {
      setLines(prev => [...prev, {
        text: "WebSocket connection failed",
        type: "error",
        timestamp: new Date().toLocaleTimeString()
      }]);
      setRunning(false);
    };

    return () => ws.close();
  }, [command]);

  const getStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case "cmd": return { color: "#a78bfa", fontWeight: "700", fontSize: "14px" };
      case "stderr": return { color: "#fbbf24" };
      case "error": return { color: "#f87171" };
      case "done": return { color: "#34d399", fontWeight: "600" };
      case "system": return { color: "#60a5fa" };
      case "muted": return { color: "#475569", fontStyle: "italic" };
      case "divider": return { color: "#1e293b", userSelect: "none" };
      default: return { color: "#e2e8f0" };
    }
  };

  const getPrefix = (type: string) => {
    if (type === "cmd") return "";
    if (type === "error") return "✗ ";
    if (type === "done") return "✓ ";
    if (type === "system") return "● ";
    return "";
  };

  return (
    <div style={{
      background: "#020817",
      border: "1px solid #1e293b",
      borderRadius: "12px",
      overflow: "hidden",
      fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
    }}>
      {/* Terminal header bar */}
      <div style={{
        background: "#0f172a",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981" }} />
          <span style={{ color: "#475569", fontSize: "12px", marginLeft: "8px" }}>
            policy-guard — terminal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {running && (
            <>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
                animation: "pulse 1s infinite"
              }} />
              <span style={{ color: "#10b981", fontSize: "11px" }}>RUNNING</span>
            </>
          )}
          {!running && (
            <span style={{ color: "#475569", fontSize: "11px" }}>READY</span>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div style={{
        padding: "16px",
        height: "350px",
        overflowY: "auto",
        fontSize: "13px",
        lineHeight: "1.6",
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            display: "flex",
            gap: "12px",
            marginBottom: "2px",
            ...getStyle(line.type)
          }}>
            {line.timestamp && (
              <span style={{ color: "#1e3a5f", fontSize: "11px", minWidth: "70px", paddingTop: "1px" }}>
                {line.timestamp}
              </span>
            )}
            <span style={{ whiteSpace: "pre-wrap", flex: 1 }}>
              {getPrefix(line.type)}{line.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal footer */}
      <div style={{
        background: "#0f172a",
        padding: "6px 16px",
        borderTop: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ color: "#a78bfa", fontSize: "12px" }}>▶</span>
        <span style={{ color: "#475569", fontSize: "12px" }}>
          {running ? "Executing command..." : "Process complete"}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}