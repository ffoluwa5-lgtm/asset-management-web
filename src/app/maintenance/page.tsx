"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface Maintenance { id: number; description: string; cost?: number; status: string; maintenanceDate: string; asset: { name: string; assetCode: string }; }
interface Asset { id: number; name: string; assetCode: string; }

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  PENDING:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  IN_PROGRESS:{ color: "#4f7fff", bg: "rgba(79,127,255,0.1)" },
  COMPLETED:  { color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
  CANCELLED:  { color: "#5a6278", bg: "rgba(90,98,120,0.1)"  },
};

export default function MaintenancePage() {
  const [records,   setRecords]   = useState<Maintenance[]>([]);
  const [assets,    setAssets]    = useState<Asset[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRec,   setEditRec]   = useState<Maintenance | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [form,      setForm]      = useState({ assetId: "", description: "", cost: "", status: "PENDING", maintenanceDate: new Date().toISOString().split("T")[0] });

  function showToast(msg: string, ok: boolean) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    load();
    api.get("/assets").then(r => setAssets(r.data)).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    try { const r = await api.get("/maintenance"); setRecords(r.data); }
    catch { showToast("Failed to load", false); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditRec(null);
    setForm({ assetId: "", description: "", cost: "", status: "PENDING", maintenanceDate: new Date().toISOString().split("T")[0] });
    setShowModal(true);
  }

  function openEdit(m: Maintenance) {
    setEditRec(m);
    setForm({
      assetId: String((m as any).assetId || ""),
      description: m.description, cost: String(m.cost || ""),
      status: m.status, maintenanceDate: m.maintenanceDate.split("T")[0],
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.assetId || !form.description) { showToast("Asset and description required", false); return; }
    try {
      const body = { ...form, assetId: Number(form.assetId), cost: form.cost ? Number(form.cost) : undefined, maintenanceDate: new Date(form.maintenanceDate).toISOString() };
      if (editRec) { await api.patch(`/maintenance/${editRec.id}`, body); showToast("Updated", true); }
      else { await api.post("/maintenance", body); showToast("Scheduled", true); }
      setShowModal(false); load();
    } catch (e: any) { showToast(e?.response?.data?.message || "Failed", false); }
  }

  async function del(id: number) {
    if (!confirm("Delete this record?")) return;
    try { await api.delete(`/maintenance/${id}`); showToast("Deleted", true); load(); }
    catch { showToast("Failed", false); }
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
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Maintenance</h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>{records.filter(r => r.status === "PENDING" || r.status === "IN_PROGRESS").length} active records</p>
        </div>
        <button onClick={openCreate}
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#4f7fff", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          + Schedule Maintenance
        </button>
      </div>

      <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2335" }}>
              {["Asset", "Description", "Date", "Cost", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>Loading…</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>No maintenance records.</td></tr>
            ) : records.map(m => {
              const sc = STATUS_COLORS[m.status] || { color: "#5a6278", bg: "#1e2335" };
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #1e2335" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{m.asset?.name}</div>
                    <div style={{ color: "#4f7fff", fontSize: 11, fontFamily: "monospace" }}>{m.asset?.assetCode}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13, maxWidth: 200 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>
                    {new Date(m.maintenanceDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>
                    {m.cost ? `₦${Number(m.cost).toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: sc.color, background: sc.bg }}>
                      {m.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(m)}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #1e2335", background: "transparent", color: "#4f7fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Edit
                      </button>
                      <button onClick={() => del(m.id)}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 16, width: "100%", maxWidth: 480 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{editRec ? "Edit Record" : "Schedule Maintenance"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#5a6278", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Asset *", key: "assetId", type: "select" },
                { label: "Description *", key: "description", type: "textarea" },
                { label: "Cost (₦)", key: "cost", type: "number" },
                { label: "Date", key: "maintenanceDate", type: "date" },
                { label: "Status", key: "status", type: "statusSelect" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inp}>
                      <option value="">Choose asset...</option>
                      {assets.map(a => <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>)}
                    </select>
                  ) : f.type === "statusSelect" ? (
                    <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inp}>
                      {["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ ...inp, minHeight: 80, resize: "vertical" } as any} />
                  ) : (
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inp} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2335", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #1e2335", background: "transparent", color: "#5a6278", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={save}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#4f7fff", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {editRec ? "Save" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}