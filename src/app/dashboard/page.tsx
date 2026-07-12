"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface Stats {
  totalAssets: number;
  available: number;
  allocated: number;
  maintenance: number;
  retired: number;
  totalValue: number;
  recentAssets: any[];
  recentAllocations: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then(res => setStats(res.data))
      .catch(() => setStats({
        totalAssets: 0, available: 0, allocated: 0,
        maintenance: 0, retired: 0, totalValue: 0,
        recentAssets: [], recentAllocations: [],
      }))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Assets",  value: stats.totalAssets, color: "#4f7fff", bg: "rgba(79,127,255,0.08)", icon: "🏢" },
    { label: "Available",     value: stats.available,   color: "#22c55e", bg: "rgba(34,197,94,0.08)",  icon: "✅" },
    { label: "Allocated",     value: stats.allocated,   color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: "📦" },
    { label: "Maintenance",   value: stats.maintenance, color: "#ef4444", bg: "rgba(239,68,68,0.08)",  icon: "🔧" },
  ] : [];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: "#5a6278", fontSize: 14 }}>
          Overview of your institution's asset portfolio
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", gap: 20 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              flex: 1, height: 120, borderRadius: 14,
              background: "#141824", border: "1px solid #1e2335",
              animation: "pulse 1.5s ease infinite",
            }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 28 }}>
            {cards.map((c, i) => (
              <div key={c.label} style={{
                background: "#141824", border: "1px solid #1e2335",
                borderRadius: 14, padding: "24px",
                animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: c.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 18,
                  }}>{c.icon}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: c.color,
                    background: c.bg, padding: "3px 8px", borderRadius: 20,
                  }}>
                    {Math.round((c.value / (stats!.totalAssets || 1)) * 100)}%
                  </span>
                </div>
                <div style={{ color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: "-1px", marginBottom: 4 }}>
                  {c.value}
                </div>
                <div style={{ color: "#5a6278", fontSize: 13, fontWeight: 500 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Value card + quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{
              background: "linear-gradient(135deg, #1a2340, #141824)",
              border: "1px solid #1e2335", borderRadius: 14, padding: 24,
            }}>
              <p style={{ color: "#5a6278", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Total Portfolio Value
              </p>
              <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-1.5px" }}>
                ₦{(stats?.totalValue || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </div>
              <p style={{ color: "#4f7fff", fontSize: 13, marginTop: 8 }}>Across all active assets</p>
            </div>

            <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, padding: 24 }}>
              <p style={{ color: "#5a6278", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                Quick Actions
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Add Asset", href: "/assets", color: "#4f7fff" },
                  { label: "Allocate", href: "/allocations", color: "#22c55e" },
                  { label: "Maintenance", href: "/maintenance", color: "#f59e0b" },
                  { label: "Categories", href: "/categories", color: "#a78bfa" },
                ].map(a => (
                  <button key={a.label} onClick={() => router.push(a.href)}
                    style={{
                      padding: "10px 14px", borderRadius: 8,
                      background: `${a.color}11`, border: `1px solid ${a.color}33`,
                      color: a.color, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${a.color}22`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${a.color}11`)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent assets table */}
          {stats?.recentAssets && stats.recentAssets.length > 0 && (
            <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2335" }}>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Recent Assets</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e2335" }}>
                    {["Asset Code", "Name", "Category", "Status", "Value"].map(h => (
                      <th key={h} style={{ padding: "12px 24px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAssets.map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #1e2335" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "14px 24px", color: "#4f7fff", fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>{a.assetCode}</td>
                      <td style={{ padding: "14px 24px", color: "#fff", fontSize: 13 }}>{a.name}</td>
                      <td style={{ padding: "14px 24px", color: "#5a6278", fontSize: 13 }}>{a.category?.name || "-"}</td>
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          color: a.status === "AVAILABLE" ? "#22c55e" : a.status === "ALLOCATED" ? "#f59e0b" : a.status === "MAINTENANCE" ? "#ef4444" : "#5a6278",
                          background: a.status === "AVAILABLE" ? "rgba(34,197,94,0.1)" : a.status === "ALLOCATED" ? "rgba(245,158,11,0.1)" : a.status === "MAINTENANCE" ? "rgba(239,68,68,0.1)" : "rgba(90,98,120,0.1)",
                        }}>{a.status}</span>
                      </td>
                      <td style={{ padding: "14px 24px", color: "#5a6278", fontSize: 13 }}>
                        {a.currentValue ? `₦${a.currentValue.toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}