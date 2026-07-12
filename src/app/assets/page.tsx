"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface Asset {
  id: number; assetCode: string; name: string;
  status: string; location?: string; currentValue?: number;
  category?: { name: string }; manufacturer?: string;
  purchaseDate?: string; condition?: string;
}
interface Category { id: number; name: string; }

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  AVAILABLE:   { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  ALLOCATED:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  MAINTENANCE: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  RETIRED:     { color: "#5a6278", bg: "rgba(90,98,120,0.1)" },
};

export default function AssetsPage() {
  const [assets,     setAssets]     = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("ALL");
  const [showModal,  setShowModal]  = useState(false);
  const [editAsset,  setEditAsset]  = useState<Asset | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({
    assetCode: "", name: "", manufacturer: "", model: "",
    serialNumber: "", location: "", condition: "", status: "AVAILABLE",
    purchasePrice: "", currentValue: "", categoryId: "", purchaseDate: "",
  });

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    load();
    api.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/assets");
      setAssets(r.data);
    } catch { showToast("Failed to load assets", false); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditAsset(null);
    setForm({ assetCode: "", name: "", manufacturer: "", model: "", serialNumber: "", location: "", condition: "", status: "AVAILABLE", purchasePrice: "", currentValue: "", categoryId: "", purchaseDate: "" });
    setShowModal(true);
  }

  function openEdit(a: Asset) {
    setEditAsset(a);
    setForm({
      assetCode: a.assetCode, name: a.name,
      manufacturer: (a as any).manufacturer || "",
      model: (a as any).model || "",
      serialNumber: (a as any).serialNumber || "",
      location: a.location || "", condition: a.condition || "",
      status: a.status, purchasePrice: (a as any).purchasePrice || "",
      currentValue: a.currentValue ? String(a.currentValue) : "",
      categoryId: a.category ? String((a as any).categoryId || "") : "",
      purchaseDate: a.purchaseDate ? a.purchaseDate.split("T")[0] : "",
    });
    setShowModal(true);
  }

  async function save() {
    try {
      const body = {
        ...form,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        currentValue:  form.currentValue  ? Number(form.currentValue)  : undefined,
        categoryId:    form.categoryId    ? Number(form.categoryId)    : undefined,
        purchaseDate:  form.purchaseDate  ? new Date(form.purchaseDate).toISOString() : undefined,
      };
      if (editAsset) {
        await api.patch(`/assets/${editAsset.id}`, body);
        showToast("Asset updated", true);
      } else {
        await api.post("/assets", body);
        showToast("Asset created", true);
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Failed to save", false);
    }
  }

  async function deleteAsset(id: number) {
    if (!confirm("Delete this asset?")) return;
    try {
      await api.delete(`/assets/${id}`);
      showToast("Asset deleted", true);
      load();
    } catch { showToast("Failed to delete", false); }
  }

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#0f1117", border: "1px solid #1e2335",
    color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none",
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} input:focus,select:focus{border-color:#4f7fff!important}`}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          padding: "12px 18px", borderRadius: 10,
          background: toast.ok ? "#22c55e" : "#ef4444",
          color: "#fff", fontWeight: 600, fontSize: 13,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Assets</h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>{assets.length} total assets in registry</p>
        </div>
        <button onClick={openCreate}
          style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "#4f7fff", color: "#fff", fontWeight: 700,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
          }}>
          + Add Asset
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search assets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, maxWidth: 280 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "AVAILABLE", "ALLOCATED", "MAINTENANCE", "RETIRED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "none",
                background: filter === s ? "#4f7fff" : "#141824",
                color: filter === s ? "#fff" : "#5a6278",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2335" }}>
              {["Code", "Name", "Category", "Status", "Location", "Value", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>
                No assets found. {search && "Try a different search."}</td></tr>
            ) : filtered.map((a, i) => {
              const sc = STATUS_COLORS[a.status] || { color: "#5a6278", bg: "#1e2335" };
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #1e2335", animation: `fadeUp 0.3s ease ${i*0.03}s both` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 20px", color: "#4f7fff", fontSize: 12, fontWeight: 600, fontFamily: "monospace" }}>{a.assetCode}</td>
                  <td style={{ padding: "14px 20px", color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>{a.category?.name || "—"}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, color: sc.color, background: sc.bg }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>{a.location || "—"}</td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>
                    {a.currentValue ? `₦${Number(a.currentValue).toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(a)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #1e2335", background: "transparent", color: "#4f7fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Edit
                      </button>
                      <button onClick={() => deleteAsset(a.id)}
                        style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>{editAsset ? "Edit Asset" : "Add New Asset"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#5a6278", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Asset Code *", key: "assetCode", type: "text" },
                { label: "Asset Name *", key: "name", type: "text" },
                { label: "Manufacturer", key: "manufacturer", type: "text" },
                { label: "Model", key: "model", type: "text" },
                { label: "Serial Number", key: "serialNumber", type: "text" },
                { label: "Location", key: "location", type: "text" },
                { label: "Condition", key: "condition", type: "text" },
                { label: "Purchase Price", key: "purchasePrice", type: "number" },
                { label: "Current Value", key: "currentValue", type: "number" },
                { label: "Purchase Date", key: "purchaseDate", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={inp}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Category
                </label>
                <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} style={{ ...inp }}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Status
                </label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ ...inp }}>
                  {["AVAILABLE","ALLOCATED","MAINTENANCE","RETIRED"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: "16px 28px", borderTop: "1px solid #1e2335", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #1e2335", background: "transparent", color: "#5a6278", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={save}
                style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#4f7fff", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {editAsset ? "Save Changes" : "Create Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}