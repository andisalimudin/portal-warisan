"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Heart, Pin, Trash2, Search, Loader2, AlertTriangle, Eye } from "lucide-react";

type ModerationPost = {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  categoryName: string;
  likes: number;
  comments: number;
  createdAt: string;
  isPinned: boolean;
};

type ForumCategoryOption = {
  id: string;
  name: string;
  description: string;
};

export default function ForumModerationPage() {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<"" | "DELETE" | "PIN" | "UNPIN">("");
  const [categories, setCategories] = useState<ForumCategoryOption[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("warisan_user");
      if (raw) {
        try {
          const basic = JSON.parse(raw) as { id?: string };
          if (basic.id) {
            setUserId(String(basic.id));
          }
        } catch {
        }
      }
    }

    async function load() {
      try {
        const res = await fetch("/api/forum");
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan data forum.");
          return;
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setCategories(
          Array.isArray(data.categories) ? data.categories : []
        );
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan forum.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const q = searchTerm.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }, [posts, searchTerm]);

  function formatTime(input: string) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("ms-MY");
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (!filteredPosts.length) return;
    if (selectedIds.length >= filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  }

  async function handleAction(action: "DELETE" | "PIN" | "UNPIN") {
    if (!selectedIds.length) return;
    setSavingAction(action);

    try {
      const res = await fetch("/api/admin/forum", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedIds,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ralat semasa memproses tindakan moderasi.");
        return;
      }

      if (action === "DELETE") {
        setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else if (action === "PIN") {
        setPosts((prev) =>
          prev.map((p) =>
            selectedIds.includes(p.id) ? { ...p, isPinned: true } : p
          )
        );
      } else if (action === "UNPIN") {
        setPosts((prev) =>
          prev.map((p) =>
            selectedIds.includes(p.id) ? { ...p, isPinned: false } : p
          )
        );
      }
    } catch {
      setError("Ralat rangkaian semasa memproses tindakan moderasi.");
    } finally {
      setSavingAction("");
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setCreateError("Maklumat admin tidak sah. Sila log masuk semula.");
      return;
    }
    if (!createTitle.trim() || !createContent.trim() || !createCategoryId) {
      setCreateError("Sila isi semua maklumat topik.");
      return;
    }

    setCreateSaving(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          categoryId: createCategoryId,
          title: createTitle.trim(),
          content: createContent.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Ralat semasa mencipta topik baru.");
        return;
      }

      const created = data.post as ModerationPost;
      setPosts((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateCategoryId("");
      setCreateContent("");
    } catch {
      setCreateError("Ralat rangkaian semasa mencipta topik.");
    } finally {
      setCreateSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderasi Forum</h1>
          <p className="text-gray-500">
            Pantau dan uruskan topik perbincangan yang dihantar oleh ahli.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateError(null);
            setCreateTitle("");
            setCreateCategoryId("");
            setCreateContent("");
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-warisan-700 text-white text-sm font-semibold hover:bg-warisan-800 shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Topik Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tajuk, penulis atau kategori..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-warisan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleAction("PIN")}
            disabled={!selectedIds.length || savingAction === "PIN"}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-yellow-500 text-yellow-700 hover:bg-yellow-50 disabled:opacity-40"
          >
            {savingAction === "PIN" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
            Pin
          </button>
          <button
            type="button"
            onClick={() => handleAction("UNPIN")}
            disabled={!selectedIds.length || savingAction === "UNPIN"}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            {savingAction === "UNPIN" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
            Nyah Pin
          </button>
          <button
            type="button"
            onClick={() => handleAction("DELETE")}
            disabled={!selectedIds.length || savingAction === "DELETE"}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-red-500 text-red-700 hover:bg-red-50 disabled:opacity-40"
          >
            {savingAction === "DELETE" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Padam
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuatkan senarai topik forum...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      !!filteredPosts.length &&
                      selectedIds.length >= filteredPosts.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Topik
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Penulis
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Kategori
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  Interaksi
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Tarikh
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="text-sm font-medium text-gray-900">
                      {post.author}
                    </div>
                    <div className="text-xs text-gray-500">
                      {post.authorRole.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {post.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-500">
                    {formatTime(post.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/forum/${post.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3" />
                        Baca
                      </Link>
                      {post.isPinned ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIds([post.id]);
                            handleAction("UNPIN");
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Pin className="w-3 h-3" />
                          Nyah Pin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIds([post.id]);
                            handleAction("PIN");
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Pin className="w-3 h-3" />
                          Pin
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIds([post.id]);
                          handleAction("DELETE");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border border-red-500 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Padam
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !filteredPosts.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    Tiada topik forum untuk dipaparkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Cipta Topik Baru
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  value={createCategoryId}
                  onChange={(e) => setCreateCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Tajuk Topik
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Isi Topik
                </label>
                <textarea
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500 min-h-[120px] resize-vertical"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-warisan-700 text-white hover:bg-warisan-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {createSaving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {createSaving ? "Menyimpan..." : "Simpan Topik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
