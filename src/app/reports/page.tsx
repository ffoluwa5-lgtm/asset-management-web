"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface Asset {
  id: number; assetCode: string; name: string; status: string;
  location?: string; currentValue?: number; purchasePrice?: number;
  purchaseDate?: string; condition?: string;
  category?: { name: string };
  maintenances?: { cost?: number; status: string }[];
  allocations?: { allocatedAt: string; returnedAt?: string; user?: { fullName: string } }[];
}

interface Stats {
  totalAssets: number; available: number; allocated: number;
  maintenance: number; retired: number; totalCategories: number;
  totalUsers: number; allocations: number;
}

export default function ReportsPage() {
  const [assets,  setAssets]  = useState<Asset[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<"asset" | "maintenance" | "allocation">("asset");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/assets"),
      api.get("/dashboard"),
    ]).then(([a, s]) => {
      setAssets(a.data);
      setStats(s.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function exportCSV() {
    const filtered = statusFilter === "ALL" ? assets : assets.filter(a => a.status === statusFilter);
    const headers = ["Asset Code", "Name", "Category", "Status", "Location", "Condition", "Purchase Price", "Current Value", "Purchase Date"];
    const rows = filtered.map(a => [
      a.assetCode, a.name, a.category?.name || "", a.status,
      a.location || "", a.condition || "",
      a.purchasePrice || "", a.currentValue || "",
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `asset-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  const totalValue = assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const totalPurchaseValue = assets.reduce((s, a) => s + (a.purchasePrice || 0), 0);
  const maintenanceCost = assets.reduce((s, a) => s + (a.maintenances?.reduce((ms, m) => ms + (m.cost || 0), 0) || 0), 0);

  const filteredAssets = statusFilter === "ALL" ? assets : assets.filter(a => a.status === statusFilter);

  const REPORTS = [
    { key: "asset",       label: "Asset Register",      icon: "🏷" },
    { key: "maintenance", label: "Maintenance Report",  icon: "🔧" },
    { key: "allocation",  label: "Allocation Report",   icon: "🔗" },
  ] as const;

  const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    AVAILABLE:   { color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
    ALLOCATED:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    MAINTENANCE: { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    RETIRED:     { color: "#5a6278", bg: "rgba(90,98,120,0.1)"  },
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .print-table { color: #000 !important; }
          .print-table th { color: #333 !important; }
          .print-table td { color: #111 !important; border-bottom: 1px solid #eee !important; }
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Reports</h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>Asset portfolio analysis and export</p>
        </div>
        <div className="no-print" style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #1e2335", background: "transparent", color: "#22c55e", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            ↓ Export CSV
          </button>
          <button onClick={printReport}
            style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#4f7fff", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            🖨 Print Report
          </button>
        </div>
      </div>

      {/* Summary KPI cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 100, borderRadius: 14, background: "#141824", border: "1px solid #1e2335" }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Assets",       value: stats?.totalAssets || 0,                 suffix: "",   color: "#4f7fff" },
            { label: "Portfolio Value",    value: `₦${totalValue.toLocaleString("en-NG")}`, suffix: "",  color: "#22c55e" },
            { label: "Purchase Value",     value: `₦${totalPurchaseValue.toLocaleString("en-NG")}`, suffix: "", color: "#a78bfa" },
            { label: "Active Allocations", value: stats?.allocated || 0,                   suffix: "",   color: "#f59e0b" },
          ].map((c, i) => (
            <div key={c.label} style={{
              background: "#141824", border: "1px solid #1e2335", borderRadius: 14, padding: "20px 24px",
              animation: `fadeUp 0.3s ease ${i*0.07}s both`,
            }}>
              <p style={{ color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{c.label}</p>
              <p style={{ color: c.color, fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status breakdown bar */}
      {stats && (
        <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
          <p style={{ color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Asset Status Breakdown</p>
          <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", height: 12, marginBottom: 16 }}>
            {[
              { key: "available",   value: stats.available,   color: "#22c55e" },
              { key: "allocated",   value: stats.allocated,   color: "#f59e0b" },
              { key: "maintenance", value: stats.maintenance, color: "#ef4444" },
              { key: "retired",     value: stats.retired,     color: "#5a6278" },
            ].map(s => (
              <div key={s.key} style={{
                flex: s.value, background: s.color, opacity: 0.8,
                transition: "flex 0.5s ease",
                minWidth: s.value > 0 ? 4 : 0,
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Available",   value: stats.available,   color: "#22c55e" },
              { label: "Allocated",   value: stats.allocated,   color: "#f59e0b" },
              { label: "Maintenance", value: stats.maintenance, color: "#ef4444" },
              { label: "Retired",     value: stats.retired,     color: "#5a6278" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ color: "#5a6278", fontSize: 12 }}>{s.label}: <strong style={{ color: "#fff" }}>{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report tabs */}
      <div className="no-print" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {REPORTS.map(r => (
          <button key={r.key} onClick={() => setActiveReport(r.key)}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: activeReport === r.key ? "#4f7fff" : "#141824",
              color: activeReport === r.key ? "#fff" : "#5a6278",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* Asset Register */}
      {activeReport === "asset" && (
        <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
          <div className="no-print" style={{ padding: "16px 24px", borderBottom: "1px solid #1e2335", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#5a6278", fontSize: 12, fontWeight: 600 }}>Filter:</span>
            {["ALL","AVAILABLE","ALLOCATED","MAINTENANCE","RETIRED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: "5px 12px", borderRadius: 6, border: "none",
                  background: statusFilter === s ? "#4f7fff" : "#0f1117",
                  color: statusFilter === s ? "#fff" : "#5a6278",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                {s}
              </button>
            ))}
            <span style={{ marginLeft: "auto", color: "#5a6278", fontSize: 12 }}>{filteredAssets.length} records</span>
          </div>

          <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2335" }}>
                {["Code", "Name", "Category", "Status", "Location", "Condition", "Current Value"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>Loading…</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>No assets found.</td></tr>
              ) : filteredAssets.map(a => {
                const sc = STATUS_COLORS[a.status] || { color: "#5a6278", bg: "#1e2335" };
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid #1e2335" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "13px 20px", color: "#4f7fff", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{a.assetCode}</td>
                    <td style={{ padding: "13px 20px", color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                    <td style={{ padding: "13px 20px", color: "#5a6278", fontSize: 13 }}>{a.category?.name || "—"}</td>
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: sc.color, background: sc.bg }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "13px 20px", color: "#5a6278", fontSize: 13 }}>{a.location || "—"}</td>
                    <td style={{ padding: "13px 20px", color: "#5a6278", fontSize: 13 }}>{a.condition || "—"}</td>
                    <td style={{ padding: "13px 20px", color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
                      {a.currentValue ? `₦${Number(a.currentValue).toLocaleString("en-NG")}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filteredAssets.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid #1e2335" }}>
                  <td colSpan={6} style={{ padding: "13px 20px", color: "#5a6278", fontSize: 12, fontWeight: 600 }}>TOTAL ({filteredAssets.length} assets)</td>
                  <td style={{ padding: "13px 20px", color: "#22c55e", fontSize: 13, fontWeight: 800 }}>
                    ₦{filteredAssets.reduce((s, a) => s + (a.currentValue || 0), 0).toLocaleString("en-NG")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Maintenance Report */}
      {activeReport === "maintenance" && (
        <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Maintenance Cost Analysis</span>
          </div>
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, borderBottom: "1px solid #1e2335" }}>
            {[
              { label: "Assets in Maintenance", value: stats?.maintenance || 0, color: "#ef4444" },
              { label: "Total Maintenance Cost", value: `₦${maintenanceCost.toLocaleString("en-NG")}`, color: "#f59e0b" },
              { label: "Completed Sessions", value: assets.reduce((s, a) => s + (a.maintenances?.filter(m => m.status === "COMPLETED").length || 0), 0), color: "#22c55e" },
            ].map(c => (
              <div key={c.label} style={{ textAlign: "center", padding: "16px", background: "#0f1117", borderRadius: 10 }}>
                <p style={{ color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{c.label}</p>
                <p style={{ color: c.color, fontSize: 22, fontWeight: 800 }}>{c.value}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p style={{ color: "#5a6278", fontSize: 12, textAlign: "center" }}>
              Detailed maintenance records are available in the Maintenance section.
              Use the print button above to generate a full maintenance report.
            </p>
          </div>
        </div>
      )}

      {/* Allocation Report */}
      {activeReport === "allocation" && (
        <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e2335" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Allocation Summary</span>
          </div>
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, borderBottom: "1px solid #1e2335" }}>
            {[
              { label: "Total Allocations", value: stats?.allocations || 0,  color: "#4f7fff" },
              { label: "Currently Allocated", value: stats?.allocated || 0,  color: "#f59e0b" },
              { label: "Available Assets",    value: stats?.available || 0,  color: "#22c55e" },
            ].map(c => (
              <div key={c.label} style={{ textAlign: "center", padding: "16px", background: "#0f1117", borderRadius: 10 }}>
                <p style={{ color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{c.label}</p>
                <p style={{ color: c.color, fontSize: 22, fontWeight: 800 }}>{c.value}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "20px 24px" }}>
            <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2335" }}>
                  {["Asset Code", "Asset Name", "Status", "Current Value"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.filter(a => a.status === "ALLOCATED").map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #1e2335" }}>
                    <td style={{ padding: "12px 16px", color: "#4f7fff", fontSize: 12, fontFamily: "monospace" }}>{a.assetCode}</td>
                    <td style={{ padding: "12px 16px", color: "#fff", fontSize: 13 }}>{a.name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>ALLOCATED</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
                      {a.currentValue ? `₦${Number(a.currentValue).toLocaleString("en-NG")}` : "—"}
                    </td>
                  </tr>
                ))}
                {assets.filter(a => a.status === "ALLOCATED").length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 30, textAlign: "center", color: "#5a6278" }}>No allocated assets.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}