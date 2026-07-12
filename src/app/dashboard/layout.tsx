"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: "⊞" },
  { href: "/assets",      label: "Assets",       icon: "🏷" },
  { href: "/categories",  label: "Categories",   icon: "📁" },
  { href: "/allocations", label: "Allocations",  icon: "🔗" },
  { href: "/maintenance", label: "Maintenance",  icon: "🔧" },
  { href: "/reports",     label: "Reports",      icon: "📊" },
  { href: "/users",       label: "Users",        icon: "👥" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0f1117",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #1e2335; border-radius: 4px; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0, background: "#0a0d14",
        borderRight: "1px solid #1e2335",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #1e2335" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>AssetFlow</div>
              <div style={{ color: "#3d4251", fontSize: 10, fontWeight: 500 }}>Management</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <button key={n.href} onClick={() => router.push(n.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, border: "none",
                  background: active ? "rgba(79,127,255,0.12)" : "transparent",
                  color: active ? "#4f7fff" : "#5a6278",
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s", textAlign: "left", width: "100%",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget.style.background = "#141824"); }}
                onMouseLeave={e => { if (!active) (e.currentTarget.style.background = "transparent"); }}>
                <span style={{ fontSize: 15 }}>{n.icon}</span>
                {n.label}
                {active && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#4f7fff" }} />}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #1e2335" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700,
            }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "User"}
              </div>
              <div style={{ color: "#3d4251", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {user?.role || "Staff"}
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); router.replace("/login"); }}
            style={{
              width: "100%", padding: "8px", borderRadius: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, minHeight: "100vh", overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px", borderBottom: "1px solid #1e2335",
          background: "#0f1117", position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
            {NAV.find(n => pathname.startsWith(n.href))?.label || "AssetFlow"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(79,127,255,0.1)", border: "1px solid rgba(79,127,255,0.2)",
              color: "#4f7fff", fontSize: 11, fontWeight: 600,
            }}>
              {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}