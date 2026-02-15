"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Filter, Calendar, Eye, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Notis Mesyuarat Agung Tahunan 2026',
    type: 'ANNOUNCEMENT',
    status: 'PUBLISHED',
    audience: 'ALL_MEMBERS',
    date: '12 Jan 2026',
    views: 1250,
    author: 'Setiausaha Agung'
  },
  {
    id: '2',
    title: 'Pelancaran Tabung Bantuan Banjir',
    type: 'NEWS',
    status: 'PUBLISHED',
    audience: 'PUBLIC',
    date: '10 Jan 2026',
    views: 3400,
    author: 'Ketua Penerangan'
  },
  {
    id: '3',
    title: 'Draf Manifesto Pilihan Raya Negeri',
    type: 'DOCUMENT',
    status: 'DRAFT',
    audience: 'COMMITTEE',
    date: '08 Jan 2026',
    views: 0,
    author: 'Presiden'
  },
  {
    id: '4',
    title: 'Jadual Lawatan Presiden ke Pantai Timur',
    type: 'ANNOUNCEMENT',
    status: 'SCHEDULED',
    audience: 'LEADERSHIP',
    date: '15 Jan 2026',
    views: 0,
    author: 'Pejabat Presiden'
  }
];

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = MOCK_ANNOUNCEMENTS.filter(item => {
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
          <button 
            onClick={() => setActiveTab('ALL')}
            className={cn("pb-4 text-sm font-medium -mb-4 border-b-2 transition-colors", activeTab === 'ALL' ? "border-warisan-600 text-warisan-700" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Semua
          </button>
          <button 
            onClick={() => setActiveTab('PUBLISHED')}
            className={cn("pb-4 text-sm font-medium -mb-4 border-b-2 transition-colors", activeTab === 'PUBLISHED' ? "border-warisan-600 text-warisan-700" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Diterbitkan
          </button>
          <button 
            onClick={() => setActiveTab('DRAFT')}
            className={cn("pb-4 text-sm font-medium -mb-4 border-b-2 transition-colors", activeTab === 'DRAFT' ? "border-warisan-600 text-warisan-700" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Draf
          </button>
          <button 
            onClick={() => setActiveTab('SCHEDULED')}
            className={cn("pb-4 text-sm font-medium -mb-4 border-b-2 transition-colors", activeTab === 'SCHEDULED' ? "border-warisan-600 text-warisan-700" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Dijadualkan
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari tajuk pengumuman..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Tapis</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Tajuk</th>
              <th className="px-6 py-4">Jenis</th>
              <th className="px-6 py-4">Sasaran</th>
              <th className="px-6 py-4">Tarikh</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 line-clamp-1">{item.title}</span>
                    <span className="text-xs text-gray-500">Oleh: {item.author}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-1 rounded text-xs font-medium border", getTypeColor(item.type))}>
                    {item.type === 'ANNOUNCEMENT' ? 'Pengumuman' : item.type === 'NEWS' ? 'Berita' : 'Dokumen'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {item.audience === 'ALL_MEMBERS' ? 'Semua Ahli' : item.audience === 'PUBLIC' ? 'Awam' : 'Jawatankuasa'}
                </td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {item.date}
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getStatusColor(item.status))}>
                    {item.status === 'PUBLISHED' ? 'Diterbitkan' : item.status === 'DRAFT' ? 'Draf' : 'Dijadualkan'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-500 hover:text-warisan-600 hover:bg-warisan-50 rounded" title="Lihat">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Padam">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Tiada rekod ditemui.
          </div>
        )}
      </div>
    </div>
  );
}
