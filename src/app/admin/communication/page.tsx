"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, Eye, Trash2, Edit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  type: string;
  status: string;
  audience: string;
  createdAt: string;
  scheduledDate: string | null;
  author: { fullName: string };
};

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.announcements) setAnnouncements(data.announcements);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Adakah anda pasti?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      alert("Gagal memadam");
    }
  };

  const filteredData = announcements.filter(item => {
    if (activeTab === 'PUBLISHED' && item.status !== 'PUBLISHED') return false;
    if (activeTab === 'DRAFT' && item.status !== 'DRAFT') return false;
    if (activeTab === 'SCHEDULED' && item.status !== 'SCHEDULED') return false;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NEWS': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-600';
      case 'SCHEDULED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Komunikasi</h1>
          <p className="text-gray-500">Urus pengumuman rasmi, buletin berita, dan notifikasi keahlian.</p>
        </div>
        <Link 
          href="/admin/communication/create"
          className="flex items-center gap-2 bg-warisan-600 text-white px-4 py-2 rounded-lg hover:bg-warisan-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          {['ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-medium transition-colors relative",
                activeTab === tab ? "text-warisan-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab === 'ALL' ? 'Semua' : tab === 'PUBLISHED' ? 'Diterbitkan' : tab === 'DRAFT' ? 'Draf' : 'Dijadualkan'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-warisan-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Tapis</span>
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-warisan-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tajuk</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarikh</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tiada rekod dijumpai.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">Oleh: {item.author?.fullName || "Admin"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getTypeColor(item.type))}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(item.status))}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString("ms-MY")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-warisan-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/communication/${item.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteAnnouncement(item.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
