"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface Allocation { id: number; allocatedAt: string; returnedAt?: string; asset: { name: string; assetCode: string }; user: { fullName: string; email: string }; }
interface Asset { id: number; name: string; assetCode: string; status: string; }
interface User  { id: number; fullName: string; email: string; }

export default function AllocationsPage() {
  const [allocs,    setAllocs]    = useState<Allocation[]>([]);
  const [assets,    setAssets]    = useState<Asset[]>([]);
  const [users,     setUsers]     = useState<User[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ assetId: "", userId: "" });
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    load();
    api.get("/assets").then(r => setAssets(r.data.filter((a: Asset) => a.status === "AVAILABLE"))).catch(() => {});
    api.get("/users").then(r => setUsers(r.data)).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    try { const r = await api.get("/allocations"); setAllocs(r.data); }
    catch { showToast("Failed to load", false); }
    finally { setLoading(false); }
  }

  async function allocate() {
    if (!form.assetId || !form.userId) { showToast("Select asset and user", false); return; }
    try {
      await api.post("/allocations", { assetId: Number(form.assetId), userId: Number(form.userId) });
      showToast("Asset allocated", true);
      setShowModal(false);
      setForm({ assetId: "", userId: "" });
      load();
    } catch (e: any) { showToast(e?.response?.data?.message || "Failed", false); }
  }

  async function returnAsset(id: number) {
    if (!confirm("Mark this asset as returned?")) return;
    try {
      await api.patch(`/allocations/${id}/return`);
      showToast("Asset returned", true);
      load();
    } catch { showToast("Failed to return", false); }
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0f1117", border: "1px solid #1e2335", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, padding: "12px 18px", borderRadius: 10, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 13 }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Allocations</h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>{allocs.filter(a => !a.returnedAt).length} active allocations</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#4f7fff", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          + Allocate Asset
        </button>
      </div>

      <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2335" }}>
              {["Asset", "Assigned To", "Allocated On", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>Loading…</td></tr>
            ) : allocs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>No allocations yet.</td></tr>
            ) : allocs.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #1e2335" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{a.asset?.name}</div>
                  <div style={{ color: "#4f7fff", fontSize: 11, fontFamily: "monospace" }}>{a.asset?.assetCode}</div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ color: "#fff", fontSize: 13 }}>{a.user?.fullName}</div>
                  <div style={{ color: "#5a6278", fontSize: 11 }}>{a.user?.email}</div>
                </td>
                <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>
                  {new Date(a.allocatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {a.returnedAt ? (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>Returned</span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>Active</span>
                  )}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {!a.returnedAt && (
                    <button onClick={() => returnAsset(a.id)}
                      style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(34,197,94,0.2)", background: "transparent", color: "#22c55e", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 16, width: "100%", maxWidth: 440 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Allocate Asset</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#5a6278", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Select Asset</label>
                <select value={form.assetId} onChange={e => setForm(p => ({ ...p, assetId: e.target.value }))} style={inp}>
                  <option value="">Choose available asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Assign To</label>
                <select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} style={inp}>
                  <option value="">Choose user...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2335", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #1e2335", background: "transparent", color: "#5a6278", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={allocate}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#4f7fff", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Allocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}