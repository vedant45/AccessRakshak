import { useEffect, useRef, useState } from "react";

interface Props {
  command: string | null;
  onDone?: () => void;
}

export default function Terminal({ command, onDone }: Props) {
  const [lines, setLines] = useState<{ text: string; type: string }[]>([
    { text: "PolicyGuard Terminal Ready\n", type: "stdout" },
    { text: "Click a command button to run...\n", type: "stdout" },
  ]);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (!command) return;

    setLines([{ text: `$ policy-guard ${command}\n`, type: "cmd" }]);
    setRunning(true);

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ command }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setLines(prev => [...prev, { text: msg.data, type: msg.type }]);
      if (msg.type === "done") {
        setRunning(false);
        onDone?.();
        ws.close();
      }
    };

    ws.onerror = () => {
      setLines(prev => [...prev, { text: "WebSocket error\n", type: "error" }]);
      setRunning(false);
    };

    return () => ws.close();
  }, [command]);

  const getColor = (type: string) => {
    if (type === "cmd") return "#a78bfa";
    if (type === "stderr") return "#fbbf24";
    if (type === "error") return "#f87171";
    if (type === "done") return "#34d399";
    return "#e2e8f0";
  };

  return (
    <div style={{
      background: "#0a0e1a",
      border: "1px solid #1f2937",
      borderRadius: "12px",
      padding: "16px",
      fontFamily: "monospace",
      fontSize: "13px",
      height: "300px",
      overflowY: "auto",
      position: "relative",
    }}>
      {running && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#34d399",
          animation: "pulse 1s infinite",
        }} />
      )}
      {lines.map((line, i) => (
        <div key={i} style={{ color: getColor(line.type), whiteSpace: "pre-wrap" }}>
          {line.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}