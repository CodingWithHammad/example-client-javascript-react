// VapiWidget.tsx
import React, { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";

interface VapiWidgetProps {
  assistantId?: string;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ assistantId }) => {
  const [vapi, setVapi] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>(
    []
  );
  const vapiRef = useRef<any | null>(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.error("Missing VITE_VAPI_PUBLIC_KEY in env");
      return;
    }

    const instance = new Vapi({ apiKey: publicKey }); // pass as object
    setVapi(instance);
    vapiRef.current = instance;

    instance.on("call-start", () => {
      console.log("Call started");
      setIsConnected(true);
    });

    instance.on("call-end", () => {
      console.log("Call ended");
      setIsConnected(false);
      setIsSpeaking(false);
    });

    instance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    instance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    instance.on("message", (message: any) => {
      if (message?.type === "transcript") {
        setTranscript((p) => [
          ...p,
          { role: message.role ?? "assistant", text: message.transcript ?? "" },
        ]);
      }
    });

    instance.on("error", (err: any) => {
      console.error("Vapi error:", err);
    });

    return () => {
      try {
        instance.stop?.();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  const startCall = () => {
    if (!vapi) return console.error("vapi not initialized");
    if (!assistantId) return console.error("assistantId not provided");

    // IMPORTANT: the SDK expects { assistant: assistantId } (NOT { assistantId })
    vapi.start({ assistant: assistantId });
  };

  const endCall = () => {
    vapi?.stop();
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {!isConnected ? (
        <button onClick={startCall} style={/*...same styling as your original*/{padding:'12px 18px', borderRadius:50, background:'#12A594', color:'#fff', border:'none', cursor:'pointer'}}>
          🎤 Talk to Assistant
        </button>
      ) : (
        <div style={{ width: 320, background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: isSpeaking ? "#ff4444" : "#12A594" }} />
              <strong>{isSpeaking ? "Assistant Speaking..." : "Listening..."}</strong>
            </div>
            <button onClick={endCall} style={{ background: "#ff4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px" }}>
              End Call
            </button>
          </div>

          <div style={{ maxHeight: 200, overflowY: "auto", background: "#f8f9fa", padding: 8, borderRadius: 8 }}>
            {transcript.length === 0 ? (
              <p style={{ margin: 0, color: "#666" }}>Conversation will appear here...</p>
            ) : (
              transcript.map((m, i) => (
                <div key={i} style={{ marginBottom: 8, textAlign: m.role === "user" ? "right" : "left" }}>
                  <span style={{ display: "inline-block", padding: "8px 12px", borderRadius: 12, background: m.role === "user" ? "#12A594" : "#333", color: "#fff", maxWidth: "80%" }}>
                    {m.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VapiWidget;
