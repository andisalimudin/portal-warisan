"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  UserPlus, Upload, Download, Search, Filter, 
  CheckCircle, XCircle, Shield, Trash2, Edit, 
  ChevronDown, ChevronUp, BadgeCheck 
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  memberId: string;
  phone: string;
  email: string;
  branch: string;
  role: "AHLI" | "KETUA_CAWANGAN" | "ADMIN" | "CYBERTROOPER";
  status: "AKTIF" | "DIGANTUNG" | "MENUNGGU";
  joinedAt: string;
};

function getStatusBadge(status: Member["status"]) {
  if (status === "AKTIF") return "bg-green-100 text-green-700 border-green-200";
  if (status === "DIGANTUNG") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function getRoleBadge(role: Member["role"]) {
  if (role === "ADMIN") return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === "KETUA_CAWANGAN") return "bg-blue-100 text-blue-700 border-blue-200";
  if (role === "CYBERTROOPER") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Member["status"]>("");
  const [roleFilter, setRoleFilter] = useState<"" | Member["role"]>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEditId, setShowEditId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();

        if (!res.ok) {
          setLoadError(data.error || "Gagal memuatkan senarai ahli.");
          return;
        }

        if (active) {
          setMembers(data.members || []);
        }
      } catch {
        if (active) {
          setLoadError("Ralat rangkaian semasa memuatkan senarai ahli.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return members.filter(m => {
      const q = query.trim().toLowerCase();
      const matchesQuery = q === "" || 
        m.name.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.branch.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || m.status === statusFilter;
      const matchesRole = !roleFilter || m.role === roleFilter;
      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [members, query, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = members.length;
    const aktif = members.filter(m => m.status === "AKTIF").length;
    const menunggu = members.filter(m => m.status === "MENUNGGU").length;
    const digantung = members.filter(m => m.status === "DIGANTUNG").length;
    return { total, aktif, menunggu, digantung };
  }, [members]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedIds(filtered.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const bulkApprove = () => {
    setMembers(prev => prev.map(m => selectedIds.includes(m.id) && m.status === "MENUNGGU" ? { ...m, status: "AKTIF" } : m));
    clearSelection();
  };

  const bulkSuspend = () => {
    setMembers(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, status: "DIGANTUNG" } : m));
    clearSelection();
  };

  const bulkActivate = () => {
    setMembers(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, status: "AKTIF" } : m));
    clearSelection();
  };

  const bulkAssignRole = (role: Member["role"]) => {
    setMembers(prev => prev.map(m => selectedIds.includes(m.id) ? { ...m, role } : m));
    clearSelection();
  };

  const handleExport = () => {
    setExporting(true);
    const headers = ["id","name","memberId","phone","email","branch","role","status","joinedAt"];
    const rows = filtered.map(m => headers.map(h => String(m[h as keyof Member])));
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `warisan-members-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(",");
    const idx = (k: string) => header.indexOf(k);
    const next: Member[] = lines.slice(1).map((line, i) => {
      const cols = line.split(",").map(c => c.replace(/^"|"$/g,"").replace(/""/g,'"'));
      return {
        id: cols[idx("id")] || `IMP-${i}`,
        name: cols[idx("name")] || "",
        memberId: cols[idx("memberId")] || "",
        phone: cols[idx("phone")] || "",
        email: cols[idx("email")] || "",
        branch: cols[idx("branch")] || "",
        role: (cols[idx("role")] as Member["role"]) || "AHLI",
        status: (cols[idx("status")] as Member["status"]) || "AKTIF",
        joinedAt: cols[idx("joinedAt")] || new Date().toISOString().slice(0,10),
      };
    });
    setMembers(prev => [...next, ...prev]);
    setImporting(false);
  };

  const [form, setForm] = useState<Omit<Member,"id">>({
    name: "",
    memberId: "",
    phone: "",
    email: "",
    branch: "",
    role: "AHLI",
    status: "MENUNGGU",
    joinedAt: new Date().toISOString().slice(0,10),
  });

  const submitAdd = () => {
    const id = Math.random().toString(36).slice(2,9);
    setMembers(prev => [{ id, ...form }, ...prev]);
    setShowAdd(false);
    setForm({
      name: "",
      memberId: "",
      phone: "",
      email: "",
      branch: "",
      role: "AHLI",
      status: "MENUNGGU",
      joinedAt: new Date().toISOString().slice(0,10),
    });
  };

  const currentEdit = showEditId ? members.find(m => m.id === showEditId) || null : null;
  const [editForm, setEditForm] = useState<Member | null>(null);

  const openEdit = (m: Member) => {
    setShowEditId(m.id);
    setEditForm({ ...m });
  };
  const saveEdit = () => {
    if (!editForm) return;
    setMembers(prev => prev.map(m => m.id === editForm.id ? editForm : m));
    setShowEditId(null);
    setEditForm(null);
  };
  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    if (showEditId === id) {
      setShowEditId(null);
      setEditForm(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Ahli</h1>
          <p className="text-gray-500">Urus data ahli, kelulusan, peranan, dan status keahlian.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-warisan-900 text-white px-4 py-2 rounded-lg hover:bg-warisan-800"
          >
            <UserPlus className="w-4 h-4" /> Tambah Ahli
          </button>
          <label className={cn("inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50", importing && "opacity-50")}>
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
          </label>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Jumlah Ahli</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Aktif</p>
          <p className="text-2xl font-bold text-green-700">{stats.aktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Menunggu</p>
          <p className="text-2xl font-bold text-gray-700">{stats.menunggu}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Digantung</p>
          <p className="text-2xl font-bold text-orange-700">{stats.digantung}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {loading && (
          <p className="text-sm text-gray-500">Memuatkan senarai ahli...</p>
        )}
        {loadError && (
          <p className="text-sm text-red-600">{loadError}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama, ID ahli, telefon, email, cawangan"
                className="pl-9 w-72 rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(s => !s)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" /> Penapis {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={bulkApprove} className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                <CheckCircle className="w-4 h-4" /> Lulus
              </button>
              <button onClick={bulkSuspend} className="inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700">
                <XCircle className="w-4 h-4" /> Gantung
              </button>
              <button onClick={bulkActivate} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                <BadgeCheck className="w-4 h-4" /> Aktifkan
              </button>
              <select 
                onChange={(e) => e.target.value && bulkAssignRole(e.target.value as Member["role"])}
                className="rounded-lg border-gray-300"
                defaultValue=""
              >
                <option value="" disabled>Tukar Peranan</option>
                <option value="AHLI">Ahli</option>
                <option value="KETUA_CAWANGAN">Ketua Cawangan</option>
                <option value="ADMIN">Admin</option>
                <option value="CYBERTROOPER">Cybertrooper</option>
              </select>
              <button onClick={clearSelection} className="text-sm text-gray-500 underline">Kosongkan</button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Member["status"] | "")}
              className="rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DIGANTUNG">Digantung</option>
            </select>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Member["role"] | "")}
              className="rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
            >
              <option value="">Semua Peranan</option>
              <option value="AHLI">Ahli</option>
              <option value="KETUA_CAWANGAN">Ketua Cawangan</option>
              <option value="ADMIN">Admin</option>
              <option value="CYBERTROOPER">Cybertrooper</option>
            </select>
            <div className="flex items-center justify-end gap-2">
              <button onClick={selectAll} className="text-sm text-gray-600 underline">Pilih Semua</button>
              <button onClick={clearSelection} className="text-sm text-gray-600 underline">Kosongkan Pilihan</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2">
                  <input 
                    type="checkbox" 
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => e.target.checked ? setSelectedIds(filtered.map(m => m.id)) : clearSelection()}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Ahli</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cawangan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peranan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarikh Sertai</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200">{m.memberId}</span>
                  </td>
                  <td className="px-3 py-2">{m.phone}</td>
                  <td className="px-3 py-2">{m.branch}</td>
                  <td className="px-3 py-2">
                    <span className={cn("px-2 py-1 rounded text-xs border", getRoleBadge(m.role))}>
                      {m.role === "AHLI" ? "Ahli" : m.role === "KETUA_CAWANGAN" ? "Ketua Cawangan" : "Admin"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("px-2 py-1 rounded text-xs border", getStatusBadge(m.status))}>
                      {m.status === "AKTIF" ? "Aktif" : m.status === "DIGANTUNG" ? "Digantung" : "Menunggu"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{m.joinedAt}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(m)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      {m.status !== "AKTIF" && (
                        <button 
                          onClick={() => setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status: "AKTIF" } : x))}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" /> Aktifkan
                        </button>
                      )}
                      {m.status === "AKTIF" && (
                        <button 
                          onClick={() => setMembers(prev => prev.map(x => x.id === m.id ? { ...x, status: "DIGANTUNG" } : x))}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                        >
                          <Shield className="w-4 h-4 text-orange-600" /> Gantung
                        </button>
                      )}
                      <button 
                        onClick={() => deleteMember(m.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" /> Padam
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-gray-500" colSpan={9}>
                    Tiada rekod ditemui
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Tambah Ahli Baharu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Nama Penuh</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">ID Ahli</label>
                <input value={form.memberId} onChange={(e) => setForm(f => ({ ...f, memberId: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Telefon</label>
                <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Cawangan</label>
                <input value={form.branch} onChange={(e) => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Peranan</label>
                <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as Member["role"] }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500">
                  <option value="AHLI">Ahli</option>
                  <option value="KETUA_CAWANGAN">Ketua Cawangan</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CYBERTROOPER">Cybertrooper</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Member["status"] }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500">
                  <option value="MENUNGGU">Menunggu</option>
                  <option value="AKTIF">Aktif</option>
                  <option value="DIGANTUNG">Digantung</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Tarikh Sertai</label>
                <input type="date" value={form.joinedAt} onChange={(e) => setForm(f => ({ ...f, joinedAt: e.target.value }))} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-gray-200">Batal</button>
              <button onClick={submitAdd} className="px-4 py-2 rounded-lg bg-warisan-900 text-white hover:bg-warisan-800">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {currentEdit && editForm && showEditId && (
        <div className="fixed inset-0 bg-black/10 flex items-end justify-center">
          <div className="bg-white w-full max-w-3xl rounded-t-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Ahli</h3>
              <div className="flex items-center gap-2">
                <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-warisan-900 text-white hover:bg-warisan-800">Simpan</button>
                <button onClick={() => { setShowEditId(null); setEditForm(null); }} className="px-4 py-2 rounded-lg border border-gray-200">Tutup</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Nama Penuh</label>
                <input value={editForm.name} onChange={(e) => setEditForm(f => f ? ({ ...f, name: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">ID Ahli</label>
                <input value={editForm.memberId} onChange={(e) => setEditForm(f => f ? ({ ...f, memberId: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Telefon</label>
                <input value={editForm.phone} onChange={(e) => setEditForm(f => f ? ({ ...f, phone: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm(f => f ? ({ ...f, email: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Cawangan</label>
                <input value={editForm.branch} onChange={(e) => setEditForm(f => f ? ({ ...f, branch: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Peranan</label>
                <select value={editForm.role} onChange={(e) => setEditForm(f => f ? ({ ...f, role: e.target.value as Member["role"] }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500">
                  <option value="AHLI">Ahli</option>
                  <option value="KETUA_CAWANGAN">Ketua Cawangan</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CYBERTROOPER">Cybertrooper</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm(f => f ? ({ ...f, status: e.target.value as Member["status"] }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500">
                  <option value="MENUNGGU">Menunggu</option>
                  <option value="AKTIF">Aktif</option>
                  <option value="DIGANTUNG">Digantung</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Tarikh Sertai</label>
                <input type="date" value={editForm.joinedAt} onChange={(e) => setEditForm(f => f ? ({ ...f, joinedAt: e.target.value }) : f)} className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, status: "AKTIF" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" /> Aktifkan
                </button>
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, status: "DIGANTUNG" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <Shield className="w-4 h-4 text-orange-600" /> Gantung
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, role: "AHLI" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Ahli
                </button>
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, role: "KETUA_CAWANGAN" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Ketua Cawangan
                </button>
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, role: "ADMIN" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Admin
                </button>
                <button 
                  onClick={() => setEditForm(f => f ? ({ ...f, role: "CYBERTROOPER" }) : f)} 
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cybertrooper
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
