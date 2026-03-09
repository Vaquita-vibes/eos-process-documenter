"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const BRAND = {
  red: "#ED4545",
  gold: "#FFBF24",
  white: "#FFFFFF",
  black: "#000000",
  dark: "#1A1A2E",
  cream: "#F5F0E8",
  charcoal: "#2D2D2D",
  mid: "#4A4A4A",
  slate: "#6B7280",
  cardDark: "#252540",
};

const PHASES = [
  { key: "intake", label: "Intake & Scoping", icon: "01" },
  { key: "identify", label: "Identify", icon: "02" },
  { key: "document", label: "Document", icon: "03" },
  { key: "fba", label: "Followed by All", icon: "04" },
  { key: "output", label: "Final Output", icon: "05" },
];

/* ── Utility: parse JSON process sheet from model response ── */
function parseProcessSheet(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1].trim());
    if (data.process_name && data.major_steps) return data;
    return null;
  } catch {
    return null;
  }
}

function getIntroText(text) {
  const idx = text.indexOf("```json");
  if (idx <= 0) return "";
  return text.substring(0, idx).trim();
}

/* ── Utility: generate branded Word-compatible HTML ── */
function generateWordDoc(data) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const stepsRows = (data.major_steps || [])
    .map(
      (s) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #E5E7EB;text-align:center;font-weight:700;color:#ED4545;width:40px;">${s.number}</td>
      <td style="padding:8px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;">${s.step}</td>
      <td style="padding:8px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${s.owner}</td>
      <td style="padding:8px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${s.output}</td>
    </tr>`
    )
    .join("");

  const bulletList = (items, fallback) => {
    if (!items || items.length === 0) return `<p style="color:#6B7280;margin:4px 0;">${fallback}</p>`;
    return items.map((item) => `<p style="margin:4px 0 4px 12px;color:#2D2D2D;">&#8226; ${item}</p>`).join("");
  };

  const adoptionRows = data.adoption_plan
    ? [
        ["Training", data.adoption_plan.training],
        ["Where It Lives", data.adoption_plan.location],
        ["Adherence Measures", (data.adoption_plan.measures || []).join("; ")],
        ["Review Cadence", data.adoption_plan.cadence],
        ["Exception Rule", data.adoption_plan.exception_rule],
        ["Leader Reinforcement", data.adoption_plan.reinforcement],
      ]
        .map(
          ([label, val]) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;width:180px;background:#F9FAFB;">${label}</td>
        <td style="padding:8px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${val || "—"}</td>
      </tr>`
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  @page { size: letter; margin: 0.75in 0.85in; }
  body { font-family: Calibri, Arial, sans-serif; color: #2D2D2D; line-height: 1.5; }
  table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
<div style="background:#ED4545;padding:16px 24px;margin:-12px -12px 0 -12px;">
  <p style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:1px;font-family:Arial Black,Arial,sans-serif;">${(data.process_name || "").toUpperCase()}</p>
  <p style="margin:4px 0 0;font-size:11px;color:#FFBF24;letter-spacing:1.5px;font-weight:600;">LA VAQUITA FLEA MARKET &nbsp;&middot;&nbsp; EOS PROCESS SHEET</p>
</div>
<div style="background:#FFBF24;height:4px;margin:0 -12px 20px -12px;"></div>
<table style="margin-bottom:20px;">
  <tr>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;width:130px;">Owner</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${data.owner}</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;width:130px;">EOS Bucket</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${data.eos_bucket || "—"}</td>
  </tr>
  <tr>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;">Trigger</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${data.trigger}</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;">End State</td>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${data.end_state}</td>
  </tr>
  <tr>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;">Purpose</td>
    <td colspan="3" style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${data.purpose}</td>
  </tr>
  <tr>
    <td style="padding:6px 12px;border:1px solid #E5E7EB;font-weight:600;color:#2D2D2D;background:#F9FAFB;">Roles</td>
    <td colspan="3" style="padding:6px 12px;border:1px solid #E5E7EB;color:#4A4A4A;">${(data.roles || []).join(", ")}</td>
  </tr>
</table>
<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">MAJOR STEPS</p>
<table style="margin-bottom:20px;">
  <tr style="background:#1A1A2E;">
    <th style="padding:8px 12px;border:1px solid #1A1A2E;color:#FFFFFF;font-size:11px;letter-spacing:0.5px;text-align:center;width:40px;">#</th>
    <th style="padding:8px 12px;border:1px solid #1A1A2E;color:#FFFFFF;font-size:11px;letter-spacing:0.5px;text-align:left;">STEP</th>
    <th style="padding:8px 12px;border:1px solid #1A1A2E;color:#FFFFFF;font-size:11px;letter-spacing:0.5px;text-align:left;width:140px;">OWNER</th>
    <th style="padding:8px 12px;border:1px solid #1A1A2E;color:#FFFFFF;font-size:11px;letter-spacing:0.5px;text-align:left;width:180px;">OUTPUT</th>
  </tr>
  ${stepsRows}
</table>
<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">STANDARDS / GUARDRAILS</p>
${bulletList(data.standards, "None defined")}
<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">KEY HANDOFFS</p>
${bulletList(data.handoffs, "None defined")}
<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">EXCEPTIONS</p>
${bulletList(data.exceptions, "None defined")}
${data.failure_modes && data.failure_modes.length > 0 ? `<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">COMMON FAILURE MODES</p>${bulletList(data.failure_modes, "")}` : ""}
${data.supporting_links && data.supporting_links.length > 0 ? `<p style="font-size:14px;font-weight:800;color:#ED4545;letter-spacing:1px;margin:24px 0 8px;border-bottom:2px solid #ED4545;padding-bottom:4px;">SUPPORTING LINKS</p>${bulletList(data.supporting_links, "")}` : ""}
<div style="background:#1A1A2E;padding:12px 16px;margin:28px -12px 0 -12px;">
  <p style="margin:0;font-size:14px;font-weight:800;color:#FFBF24;letter-spacing:1px;">ADOPTION PLAN — FOLLOWED BY ALL</p>
</div>
<div style="margin:0 -12px 20px -12px;"><table>${adoptionRows}</table></div>
<div style="margin-top:28px;padding-top:12px;border-top:2px solid #FFBF24;">
  <table style="width:100%;"><tr>
    <td style="font-size:10px;color:#6B7280;border:none;">Version: v1.0</td>
    <td style="font-size:10px;color:#6B7280;text-align:center;border:none;">La Vaquita Flea Market &middot; EOS Process Component</td>
    <td style="font-size:10px;color:#6B7280;text-align:right;border:none;">Last Updated: ${today}</td>
  </tr></table>
</div>
</body></html>`;
}

function downloadWordDoc(data) {
  const html = generateWordDoc(data);
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (data.process_name || "process").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  a.download = `LVFM_Process_Sheet_${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── UI Components ── */

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "8px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%", background: BRAND.gold,
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-8px); opacity: 1; } }`}</style>
    </div>
  );
}

function PhaseTracker({ currentPhase }) {
  return (
    <div style={{ display: "flex", gap: 2, width: "100%" }}>
      {PHASES.map((p, i) => {
        const isActive = p.key === currentPhase;
        const isPast = PHASES.findIndex((ph) => ph.key === currentPhase) > i;
        return (
          <div key={p.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 4, width: "100%", borderRadius: 2, background: isPast ? BRAND.gold : isActive ? BRAND.red : "rgba(255,255,255,0.15)", transition: "background 0.4s ease" }} />
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? BRAND.gold : isPast ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center", lineHeight: 1.2, transition: "color 0.3s ease" }}>
              {p.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProcessSheetPreview({ data }) {
  return (
    <div style={{ animation: "fadeUp 0.3s ease-out" }}>
      <div style={{ background: BRAND.red, padding: "12px 16px", borderRadius: "12px 12px 0 0" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: BRAND.white, letterSpacing: 0.5 }}>{data.process_name}</div>
        <div style={{ fontSize: 10, color: BRAND.gold, fontWeight: 600, letterSpacing: 1, marginTop: 2 }}>LA VAQUITA · EOS PROCESS SHEET</div>
      </div>
      <div style={{ height: 3, background: BRAND.gold }} />
      <div style={{ background: BRAND.cardDark, padding: "14px 16px", borderRadius: "0 0 12px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 14 }}>
          {[["Owner", data.owner], ["EOS Bucket", data.eos_bucket], ["Trigger", data.trigger], ["End State", data.end_state]].map(([label, val]) => (
            <div key={label}>
              <span style={{ fontSize: 10, color: BRAND.gold, fontWeight: 600, letterSpacing: 0.5 }}>{label}: </span>
              <span style={{ fontSize: 12, color: BRAND.white }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: BRAND.gold, fontWeight: 600 }}>Purpose: </span>
          <span style={{ fontSize: 12, color: BRAND.white }}>{data.purpose}</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: BRAND.gold, fontWeight: 600 }}>Roles: </span>
          <span style={{ fontSize: 12, color: BRAND.white }}>{(data.roles || []).join(", ")}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.red, letterSpacing: 0.8, marginBottom: 8, borderBottom: `1px solid ${BRAND.red}`, paddingBottom: 3 }}>MAJOR STEPS</div>
        {(data.major_steps || []).map((s) => (
          <div key={s.number} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: BRAND.red, fontWeight: 700, minWidth: 18 }}>{s.number}.</span>
            <div>
              <span style={{ color: BRAND.white, fontWeight: 600 }}>{s.step}</span>
              <span style={{ color: BRAND.slate }}> — {s.owner} → {s.output}</span>
            </div>
          </div>
        ))}
        {data.standards && data.standards.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.red, letterSpacing: 0.8, marginTop: 14, marginBottom: 6, borderBottom: `1px solid ${BRAND.red}`, paddingBottom: 3 }}>STANDARDS / GUARDRAILS</div>
            {data.standards.map((s, i) => <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 3, paddingLeft: 8 }}>• {s}</div>)}
          </>
        )}
        {data.handoffs && data.handoffs.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.red, letterSpacing: 0.8, marginTop: 14, marginBottom: 6, borderBottom: `1px solid ${BRAND.red}`, paddingBottom: 3 }}>KEY HANDOFFS</div>
            {data.handoffs.map((h, i) => <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 3, paddingLeft: 8 }}>• {h}</div>)}
          </>
        )}
        {data.adoption_plan && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.gold, letterSpacing: 0.8, marginTop: 16, marginBottom: 6, borderBottom: `1px solid ${BRAND.gold}`, paddingBottom: 3 }}>ADOPTION PLAN</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              {data.adoption_plan.training && <div><span style={{ color: BRAND.gold, fontWeight: 600 }}>Training:</span> {data.adoption_plan.training}</div>}
              {data.adoption_plan.location && <div><span style={{ color: BRAND.gold, fontWeight: 600 }}>Location:</span> {data.adoption_plan.location}</div>}
              {data.adoption_plan.cadence && <div><span style={{ color: BRAND.gold, fontWeight: 600 }}>Review:</span> {data.adoption_plan.cadence}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const processData = !isUser ? parseProcessSheet(message.content) : null;
  const introText = processData ? getIntroText(message.content) : null;

  if (processData) {
    return (
      <div style={{ marginBottom: 12, animation: "fadeUp 0.25s ease-out" }}>
        {introText && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: BRAND.cardDark, color: BRAND.white, fontSize: 14, lineHeight: 1.6, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
              {introText}
            </div>
          </div>
        )}
        <div style={{ maxWidth: "92%", margin: "0 0 10px" }}>
          <ProcessSheetPreview data={processData} />
        </div>
        <button
          onClick={() => downloadWordDoc(processData)}
          style={{ display: "flex", alignItems: "center", gap: 8, background: BRAND.red, color: BRAND.white, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3, transition: "all 0.2s ease", boxShadow: "0 3px 12px rgba(237,69,69,0.3)" }}
          onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          ↓ Download Branded Process Sheet (.doc)
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, animation: "fadeUp 0.25s ease-out" }}>
      <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isUser ? BRAND.red : BRAND.cardDark, color: BRAND.white, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: isUser ? "none" : "0 1px 4px rgba(0,0,0,0.2)" }}>
        {message.content}
      </div>
    </div>
  );
}

/* ── Main App ── */

export default function EOSDocumenter() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("intake");
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  const detectPhase = useCallback((text) => {
    if (parseProcessSheet(text)) return "output";
    const lower = text.toLowerCase();
    if (lower.includes("final output") || (lower.includes("process sheet") && lower.includes("here"))) return "output";
    if (lower.includes("followed by all") || lower.includes("adoption") || lower.includes("training plan") || lower.includes("adherence")) return "fba";
    if (lower.includes("major steps") || (lower.includes("document") && lower.includes("step")) || lower.includes("guardrail") || lower.includes("handoff")) return "document";
    if (lower.includes("identify") || lower.includes("core process") || lower.includes("eos bucket") || lower.includes("which bucket")) return "identify";
    return "intake";
  }, []);

  // ── This now calls YOUR server-side API route, not Anthropic directly ──
  const callAPI = useCallback(async (conversationMessages) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationMessages }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    const text = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return { text, stopReason: data.stop_reason };
  }, []);

  const startConversation = useCallback(async () => {
    setStarted(true);
    setLoading(true);
    setError(null);
    try {
      const { text } = await callAPI([{ role: "user", content: "I'm ready to document a process. Let's get started." }]);
      setMessages([{ role: "assistant", content: text }]);
    } catch (err) {
      setError(`⚠ Could not start the agent. Please share this error with your administrator:\n\n"${err.message}"`);
      setStarted(false);
    } finally {
      setLoading(false);
    }
  }, [callAPI]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = [{ role: "user", content: "I'm ready to document a process. Let's get started." }, ...newMessages];
      const { text, stopReason } = await callAPI(apiMessages);
      setCurrentPhase(detectPhase(text));
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      if (stopReason === "max_tokens") {
        setError("⚠ The response was cut short because the token limit was reached. Please contact your administrator to adjust the token configuration.");
      }
    } catch (err) {
      setError(`⚠ Something went wrong. Please share this error with your administrator:\n\n"${err.message}"`);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, callAPI, detectPhase]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, ${BRAND.dark} 0%, #0f0f1e 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', -apple-system, sans-serif", padding: 24 }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        <div style={{ textAlign: "center", maxWidth: 520, animation: "fadeUp 0.5s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(237,69,69,0.12)", border: "1px solid rgba(237,69,69,0.3)", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.red, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.red, letterSpacing: 1.5, textTransform: "uppercase" }}>EOS Process Component</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: BRAND.white, margin: "0 0 8px", lineHeight: 1.15, letterSpacing: -0.5 }}>Process Documenter</h1>
          <p style={{ fontSize: 14, color: BRAND.gold, fontWeight: 500, margin: "0 0 32px", letterSpacing: 0.5 }}>La Vaquita Flea Market</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 40px" }}>This agent walks you through the EOS 3-Step Process Documentation method — from naming the process to building the adoption plan. You'll end with a branded process sheet ready to download.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 40, textAlign: "left" }}>
            {[{ num: "01", label: "Intake & Scoping" }, { num: "02", label: "Identify Core Process" }, { num: "03", label: "Document (20/80)" }, { num: "04", label: "Followed by All" }].map((s) => (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.gold, fontFamily: "monospace" }}>{s.num}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
          <button onClick={startConversation} style={{ background: BRAND.red, color: BRAND.white, border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3, transition: "all 0.2s ease", boxShadow: "0 4px 20px rgba(237,69,69,0.35)" }} onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}>
            Start Documenting →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${BRAND.dark} 0%, #0f0f1e 100%)`, fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } textarea::placeholder { color: rgba(255,255,255,0.3); } textarea:focus { outline: none; } textarea { resize: none; }`}</style>
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.red}, #c93636)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: BRAND.white }}>P</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.white, lineHeight: 1.2 }}>Process Documenter</div>
              <div style={{ fontSize: 10, color: BRAND.slate, letterSpacing: 0.5 }}>La Vaquita · EOS</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: BRAND.gold, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", background: "rgba(255,191,36,0.1)", padding: "4px 10px", borderRadius: 6 }}>
            {PHASES.find((p) => p.key === currentPhase)?.label || "Intake"}
          </div>
        </div>
        <PhaseTracker currentPhase={currentPhase} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: BRAND.cardDark, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}><TypingIndicator /></div>
          </div>
        )}
        {error && (
          <div style={{ padding: "12px 16px", margin: "8px 0", background: "rgba(237,69,69,0.12)", border: "1px solid rgba(237,69,69,0.3)", borderRadius: 12, color: BRAND.white, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", padding: "10px 14px" }}>
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your process..." rows={1} style={{ flex: 1, background: "transparent", border: "none", color: BRAND.white, fontSize: 14, lineHeight: 1.5, fontFamily: "inherit", minHeight: 22, maxHeight: 120 }} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() && !loading ? BRAND.red : "rgba(255,255,255,0.08)", color: BRAND.white, fontSize: 16, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s ease" }}>↑</button>
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", margin: "8px 0 0", letterSpacing: 0.3 }}>Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  );
}
