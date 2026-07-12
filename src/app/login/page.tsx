"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPw,   setShowPw]   = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError("Fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.access_token);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0f1117",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #3d4251; }
        input:focus { outline: none; border-color: #4f7fff !important; }
        .login-btn:hover { background: #3d6fff !important; }
        .login-btn:active { transform: scale(0.99); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* LEFT — Brand panel */}
      <div style={{
        width: "45%", flexShrink: 0, padding: "48px 56px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: "linear-gradient(160deg, #0f1117 0%, #141824 100%)",
        borderRight: "1px solid #1e2335", position: "relative", overflow: "hidden",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#4f7fff 1px, transparent 1px), linear-gradient(90deg, #4f7fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Glow */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,127,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>AssetFlow</div>
            <div style={{ color: "#3d4251", fontSize: 11, fontWeight: 500 }}>Financial Institution</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(79,127,255,0.1)", border: "1px solid rgba(79,127,255,0.2)",
            borderRadius: 20, padding: "4px 12px", marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f7fff" }} />
            <span style={{ color: "#4f7fff", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
              ENTERPRISE PLATFORM
            </span>
          </div>
          <h1 style={{
            color: "#fff", fontSize: "clamp(2rem,3.5vw,2.8rem)",
            fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16,
          }}>
            Complete asset<br />
            <span style={{ color: "#4f7fff" }}>visibility</span> &amp;<br />
            control.
          </h1>
          <p style={{ color: "#5a6278", fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
            Track every asset across your institution — from registration to retirement.
            Real-time allocation, maintenance scheduling, and lifecycle reporting.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
            {[
              { label: "Assets Tracked", value: "10K+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Institutions", value: "50+" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ color: "#3d4251", fontSize: 11, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", display: "flex", gap: 20 }}>
          {["SOC 2 Compliant", "AES-256 Encrypted", "Role-Based Access"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" fill="#4f7fff" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span style={{ color: "#3d4251", fontSize: 11, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 32px", background: "#0f1117",
      }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 400 }}>

          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>
            Sign in to your account
          </h2>
          <p style={{ color: "#5a6278", fontSize: 14, marginBottom: 32 }}>
            Enter your credentials to access the dashboard
          </p>

          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 20,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="admin@institution.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                background: "#141824", border: "1px solid #1e2335",
                color: "#fff", fontSize: 14, fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", padding: "12px 48px 12px 16px", borderRadius: 10,
                  background: "#141824", border: "1px solid #1e2335",
                  color: "#fff", fontSize: 14, fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#3d4251", fontSize: 12, fontWeight: 600,
                }}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "13px", borderRadius: 10,
              background: loading ? "#1e2335" : "#4f7fff",
              color: loading ? "#3d4251" : "#fff",
              fontWeight: 700, fontSize: 15, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: "-0.2px",
              transition: "background 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid #3d4251", borderTopColor: "#5a6278",
                  animation: "spin 0.7s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Signing in…
              </>
            ) : "Sign in →"}
          </button>

        </div>
      </div>
    </div>
  );
}