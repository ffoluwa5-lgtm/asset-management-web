"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  ADMIN:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
  MANAGER: { color: "#4f7fff", bg: "rgba(79,127,255,0.1)" },
  STAFF:   { color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
};

export default function UsersPage() {
  const [users,     setUsers]     = useState<User[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser,  setEditUser]  = useState<User | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [search,    setSearch]    = useState("");
  const [form,      setForm]      = useState({ fullName: "", email: "", password: "", role: "STAFF" });

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/users");
      setUsers(r.data);
    } catch { showToast("Failed to load users", false); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditUser(null);
    setForm({ fullName: "", email: "", password: "", role: "STAFF" });
    setShowModal(true);
  }

  function openEdit(u: User) {
    setEditUser(u);
    setForm({ fullName: u.fullName, email: u.email, password: "", role: u.role });
    setShowModal(true);
  }

  async function save() {
    if (!form.fullName || !form.email) { showToast("Name and email required", false); return; }
    if (!editUser && !form.password)   { showToast("Password required for new user", false); return; }
    try {
      if (editUser) {
        const body: any = { fullName: form.fullName, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        await api.patch(`/users/${editUser.id}`, body);
        showToast("User updated", true);
      } else {
        await api.post("/auth/register", { fullName: form.fullName, email: form.email, password: form.password, role: form.role });
        showToast("User created", true);
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Failed to save", false);
    }
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      showToast("User deleted", true);
      load();
    } catch { showToast("Failed to delete", false); }
  }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#0f1117", border: "1px solid #1e2335",
    color: "#fff", fontSize: 13, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`input:focus,select:focus{border-color:#4f7fff!important} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

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
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
            User Management
          </h1>
          <p style={{ color: "#5a6278", fontSize: 14 }}>{users.length} staff accounts</p>
        </div>
        <button onClick={openCreate} style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: "#4f7fff", color: "#fff", fontWeight: 700,
          fontSize: 14, cursor: "pointer", fontFamily: "inherit",
        }}>
          + Add User
        </button>
      </div>

      {/* Role summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {["ADMIN","MANAGER","STAFF"].map(role => {
          const count = users.filter(u => u.role === role).length;
          const rc = ROLE_COLORS[role];
          return (
            <div key={role} style={{
              background: "#141824", border: "1px solid #1e2335",
              borderRadius: 14, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: rc.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 20,
              }}>
                {role === "ADMIN" ? "👑" : role === "MANAGER" ? "💼" : "👤"}
              </div>
              <div>
                <p style={{ color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {role}
                </p>
                <p style={{ color: rc.color, fontSize: 24, fontWeight: 800 }}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, maxWidth: 320 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2335" }}>
              {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                <th key={h} style={{
                  padding: "12px 20px", textAlign: "left",
                  color: "#5a6278", fontSize: 11, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#5a6278" }}>No users found.</td></tr>
            ) : filtered.map((u, i) => {
              const rc = ROLE_COLORS[u.role] || { color: "#5a6278", bg: "#1e2335" };
              return (
                <tr key={u.id}
                  style={{ borderBottom: "1px solid #1e2335", animation: `fadeUp 0.3s ease ${i*0.04}s both` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1a2340")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f7fff, #7b5ea7)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}>
                        {u.fullName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px",
                      borderRadius: 20, color: rc.color, background: rc.bg,
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "#5a6278", fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(u)} style={{
                        padding: "5px 12px", borderRadius: 6,
                        border: "1px solid #1e2335", background: "transparent",
                        color: "#4f7fff", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>Edit</button>
                      <button onClick={() => deleteUser(u.id)} style={{
                        padding: "5px 12px", borderRadius: 6,
                        border: "1px solid rgba(239,68,68,0.2)", background: "transparent",
                        color: "#ef4444", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>Delete</button>
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
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#141824", border: "1px solid #1e2335", borderRadius: 16, width: "100%", maxWidth: 460 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2335", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
                {editUser ? "Edit User" : "Create New User"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#5a6278", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Full Name *", key: "fullName", type: "text",     placeholder: "John Doe" },
                { label: "Email *",     key: "email",    type: "email",    placeholder: "john@institution.com" },
                { label: editUser ? "New Password (leave blank to keep)" : "Password *", key: "password", type: "password", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={inp}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: "block", color: "#5a6278", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Role
                </label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={inp}>
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2335", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: "9px 18px", borderRadius: 8,
                border: "1px solid #1e2335", background: "transparent",
                color: "#5a6278", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={save} style={{
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: "#4f7fff", color: "#fff", fontSize: 13,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>{editUser ? "Save Changes" : "Create User"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}