"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

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
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const currentPage = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "AssetFlow";

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0f1117",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #1e2335; border-radius: 4px; }

        .desktop-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #0a0d14;
          border-right: 1px solid #1e2335;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
        }

        .main-content {
          margin-left: 220px;
          flex: 1;
          min-height: 100vh;
        }

        .mobile-topbar { display: none; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-topbar { display: flex !important; }
          .desktop-topbar { display: none !important; }
        }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="desktop-sidebar">
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

        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <button key={n.href} onClick={() => router.push(n.href)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, border: "none",
                background: active ? "rgba(79,127,255,0.12)" : "transparent",
                color: active ? "#4f7fff" : "#5a6278",
                fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s", textAlign: "left", width: "100%",
              }}>
                <span style={{ fontSize: 15 }}>{n.icon}</span>
                {n.label}
                {active && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#4f7fff" }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid #1e2335" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "User"}
              </div>
              <div style={{ color: "#3d4251", fontSize: 10, textTransform: "uppercase" }}>{user?.role || "Staff"}</div>
            </div>
          </div>
          <button onClick={() => { logout(); router.replace("/login"); }} style={{
            width: "100%", padding: "8px", borderRadius: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
            color: "#ef4444", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Sign out
          </button>
        </div>
      </div>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-topbar" style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 56, background: "#0a0d14",
        borderBottom: "1px solid #1e2335",
        display: "none", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{currentPage}</span>
        </div>
        <button onClick={() => setMenuOpen(m => !m)} style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 8, display: "flex", flexDirection: "column", gap: 5,
        }}>
          {menuOpen ? (
            <span style={{ color: "#fff", fontSize: 20, lineHeight: 1 }}>✕</span>
          ) : (
            <>
              <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
            </>
          )}
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.6)",
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 260,
            background: "#0a0d14", borderRight: "1px solid #1e2335",
            display: "flex", flexDirection: "column",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 16px", borderBottom: "1px solid #1e2335", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>AssetFlow</div>
                <div style={{ color: "#3d4251", fontSize: 10 }}>Management</div>
              </div>
            </div>

            <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV.map(n => {
                const active = pathname === n.href;
                return (
                  <button key={n.href} onClick={() => { router.push(n.href); setMenuOpen(false); }} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 10, border: "none",
                    background: active ? "rgba(79,127,255,0.12)" : "transparent",
                    color: active ? "#4f7fff" : "#94a3b8",
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%",
                  }}>
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    {n.label}
                  </button>
                );
              })}
            </nav>

            <div style={{ padding: "16px", borderTop: "1px solid #1e2335" }}>
              <div style={{ color: "#5a6278", fontSize: 12, marginBottom: 10 }}>{user?.email}</div>
              <button onClick={() => { logout(); router.replace("/login"); }} style={{
                width: "100%", padding: "10px", borderRadius: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                color: "#ef4444", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP TOP BAR ── */}
      <div className="desktop-topbar" style={{
        marginLeft: 220, height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", borderBottom: "1px solid #1e2335",
        background: "#0f1117", position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{currentPage}</div>
        <div style={{
          padding: "5px 12px", borderRadius: 20,
          background: "rgba(79,127,255,0.1)", border: "1px solid rgba(79,127,255,0.2)",
          color: "#4f7fff", fontSize: 11, fontWeight: 600,
        }}>
          {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {children}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0a0d14", borderTop: "1px solid #1e2335",
        padding: "8px 0", zIndex: 90,
      }} className="mobile-bottom-nav">
        <style>{`
          @media (max-width: 768px) {
            .mobile-bottom-nav { display: flex !important; }
          }
        `}</style>
        {NAV.slice(0, 5).map(n => {
          const active = pathname === n.href;
          return (
            <button key={n.href} onClick={() => router.push(n.href)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "6px 4px", background: "none", border: "none",
              cursor: "pointer", color: active ? "#4f7fff" : "#5a6278",
            }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600, fontFamily: "inherit" }}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}