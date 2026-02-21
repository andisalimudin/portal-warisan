"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Users, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  ChevronRight
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  code: string;
  leaderName: string;
  leaderPhone: string;
  memberCount: number;
  status: "AKTIF" | "TIDAK_AKTIF";
  establishedDate: string;
  location: string;
};

export default function OrganizationPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<
    { id: string; name: string; phone: string }[]
  >([]);
  const [form, setForm] = useState<Partial<Branch>>({
    name: "",
    code: "",
    status: "AKTIF",
    leaderName: "",
    leaderPhone: "",
    location: "",
  });

  useEffect(() => {
    let active = true;

    async function loadBranches() {
      try {
        const res = await fetch("/api/admin/branches");
        const data = await res.json();

        if (!res.ok) {
          if (active) {
            setLoadError(data.error || "Gagal memuatkan senarai cawangan.");
          }
          return;
        }

        if (active) {
          setBranches(Array.isArray(data.branches) ? data.branches : []);
        }
      } catch {
        if (active) {
          setLoadError("Ralat rangkaian semasa memuatkan senarai cawangan.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function loadMembers() {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();
        if (res.ok && Array.isArray(data.members)) {
          const options = (data.members as any[])
            .filter(
              (m) =>
                typeof m.name === "string" &&
                m.name &&
                typeof m.phone === "string"
            )
            .map((m) => ({
              id: String(m.id),
              name: String(m.name),
              phone: String(m.phone),
            }));
          if (active) {
            setMembers(options);
          }
        }
      } catch {
      }
    }

    loadBranches();
    loadMembers();

    return () => {
      active = false;
    };
  }, []);

  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: branches.length,
    active: branches.filter(b => b.status === "AKTIF").length,
    totalMembers: branches.reduce((acc, curr) => acc + curr.memberCount, 0),
    avgMembers: branches.length
      ? Math.round(
          branches.reduce((acc, curr) => acc + curr.memberCount, 0) /
            branches.length
        )
      : 0,
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Cawangan N.52 Sungai Sibuga</h1>
          <p className="text-gray-500">Urus dan pantau semua cawangan di bawah pentadbiran DUN.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-warisan-700 text-white rounded-lg hover:bg-warisan-800 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tambah Cawangan Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<MapPin className="w-6 h-6 text-blue-600" />} 
          label="Jumlah Cawangan" 
          value={stats.total.toString()} 
          bgColor="bg-blue-50"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />} 
          label="Cawangan Aktif" 
          value={stats.active.toString()} 
          bgColor="bg-green-50"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-purple-600" />} 
          label="Jumlah Ahli (Cawangan)" 
          value={stats.totalMembers.toString()} 
          bgColor="bg-purple-50"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />} 
          label="Purata Ahli/Cawangan" 
          value={stats.avgMembers.toString()} 
          bgColor="bg-orange-50"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Cari nama cawangan, kod, atau nama ketua..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-warisan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
            <Filter className="w-4 h-4" />
            Tapis
          </button>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cawangan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ketua Cawangan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Ahli</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{branch.name}</span>
                      <span className="text-xs text-gray-500">{branch.code} • {branch.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warisan-100 flex items-center justify-center text-warisan-700 font-bold text-xs">
                        {branch.leaderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{branch.leaderName}</span>
                        <span className="text-xs text-gray-500">{branch.leaderPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {branch.memberCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      branch.status === "AKTIF" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.status === "AKTIF" ? "bg-green-600" : "bg-red-600"}`} />
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedBranch(branch);
                          setForm(branch);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Kemaskini"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await fetch("/api/admin/branches", {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ id: branch.id }),
                            });
                            setBranches(prev =>
                              prev.filter((b) => b.id !== branch.id)
                            );
                          } catch {
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (Simplified for UI Preview) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {isAddModalOpen ? "Tambah Cawangan Baru" : "Kemaskini Cawangan"}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Cawangan</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.name ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kod Cawangan</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.code ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.status ?? "AKTIF"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as Branch["status"],
                      }))
                    }
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="TIDAK_AKTIF">TIDAK_AKTIF</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Ketua Cawangan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.leaderName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leaderName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Pilih daripada senarai ahli
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const m = members.find((x) => x.id === id);
                    if (!m) return;
                    setForm((f) => ({
                      ...f,
                      leaderName: m.name,
                      leaderPhone: m.phone,
                    }));
                  }}
                >
                  <option value="">-- Pilih ahli sebagai ketua --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">No. Telefon Ketua</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.leaderPhone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leaderPhone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi / Alamat Pusat Khidmat</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg h-20"
                  value={form.location ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedBranch(null);
                }}
                className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                disabled={saving}
                onClick={async () => {
                  if (!form.name || !form.code) {
                    return;
                  }

                  setSaving(true);

                  try {
                    if (isAddModalOpen) {
                      const res = await fetch("/api/admin/branches", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name: form.name,
                          code: form.code,
                          status: form.status,
                          leaderName: form.leaderName,
                          leaderPhone: form.leaderPhone,
                          location: form.location,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.branch) {
                        setBranches((prev) => [...prev, data.branch]);
                        setIsAddModalOpen(false);
                        setForm({
                          name: "",
                          code: "",
                          status: "AKTIF",
                          leaderName: "",
                          leaderPhone: "",
                          location: "",
                        });
                      }
                    } else if (isEditModalOpen && selectedBranch) {
                      const res = await fetch("/api/admin/branches", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          id: selectedBranch.id,
                          name: form.name,
                          code: form.code,
                          status: form.status,
                          leaderName: form.leaderName,
                          leaderPhone: form.leaderPhone,
                          location: form.location,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.branch) {
                        setBranches((prev) =>
                          prev.map((b) =>
                            b.id === data.branch.id ? data.branch : b
                          )
                        );
                        setIsEditModalOpen(false);
                        setSelectedBranch(null);
                      }
                    }
                  } catch {
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 bg-warisan-700 text-white font-semibold rounded-lg hover:bg-warisan-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {isAddModalOpen
                  ? saving
                    ? "Menyimpan..."
                    : "Simpan Cawangan"
                  : saving
                  ? "Menyimpan..."
                  : "Kemaskini Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
