"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface Category { id: number; name: string; assets?: any[]; }

export default function CategoriesPage() {
  const [cats,      setCats]      = useState<Category[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat,   setEditCat]   = useState<Category | null>(null);
  const [name,      setName]      = useState("");
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const r = await api.get("/categories"); setCats(r.data); }
    catch { showToast("Failed to load", false); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditCat(null); setName(""); setShowModal(true); }
  function openEdit(c: Category) { setEditCat(c); setName(c.name); setShowModal(true); }

  async function save() {
    if (!name.trim()) { showToast("Name is required", false); return; }
    try {
      if (editCat) { await api.patch(`/categories/${editCat.id}`, { name }); showToast("Category updated", true); }
      else { await api.post("/categories", { name }); showToast("Category created", true); }
      setShowModal(false); load();
    } catch (e: any) { showToast(e?.response?.data?.message || "Failed to save", false); }
  }

  async function del(id: number) {
    if (!confirm("Delete this category?")) return;
    try { await api.delete(`/categories/${id}`); showToast("Deleted", true); load(); }
    catch { showToast("Failed to delete", false); }
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, padding: "12px 18px", borderRadius: 10, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 13 }}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Categories</h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>{cats.length} categories</p>
        </div>
        <button onClick={openCreate}
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#4f7fff", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          + Add Category
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {loading ? [1,2,3].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 14, background: "#141824", border: "1px solid #1e2335" }} />
        )) : cats.map(c => (
          <div key={c.id} style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(79,127,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📁</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(c)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #1e2335", background: "transparent", color: "#4f7fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Edit
                </button>
                <button onClick={() => del(c.id)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Delete
                </button>
              </div>
            </div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{c.name}</div>
            <div style={{ color: "#5a6278", fontSize: 12, marginTop: 4 }}>
              {c.assets?.length || 0} assets
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 16, width: "100%", maxWidth: 400 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{editCat ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#5a6278", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Category Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && save()}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#0f1117", border: "1px solid #1e2335", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                placeholder="e.g. IT Equipment" />
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2335", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #1e2335", background: "transparent", color: "#5a6278", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={save}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#4f7fff", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {editCat ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}