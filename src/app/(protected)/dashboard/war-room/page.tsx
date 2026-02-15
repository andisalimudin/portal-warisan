"use client";

import { useState } from "react";
import { Target, AlertTriangle, MessageSquare, Share2, ThumbsUp, Filter, Plus, Calendar, Flag, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock Data
const MISSIONS = [
  {
    id: '1',
    title: 'Gerak Gempur Isu Air Sandakan',
    description: 'Fokus kepada kegagalan pengurusan air di kawasan N.52 Sungai Sibuga. Kumpulkan testimoni penduduk dan gambar bukti paip kering.',
    priority: 'HIGH',
    status: 'ACTIVE',
    date: '2026-01-12',
    author: 'Ketua Penerangan',
    comments: 45,
    shares: 120,
    platform: ['Facebook', 'TikTok']
  },
  {
    id: '2',
    title: 'Kempen Daftar Pemilih Muda (Undi18)',
    description: 'Sebarkan infografik kesedaran mengundi kepada golongan belia di IPTA/IPTS sekitar Sandakan.',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    date: '2026-01-10',
    author: 'Admin War Room',
    comments: 23,
    shares: 85,
    platform: ['Instagram', 'Twitter']
  },
  {
    id: '3',
    title: 'Penjelasan Isu Subsidi Minyak',
    description: 'Bahan kempen untuk menjawab tohmahan pembangkang mengenai isu subsidi diesel.',
    priority: 'HIGH',
    status: 'COMPLETED',
    date: '2026-01-05',
    author: 'Biro Komunikasi',
    comments: 89,
    shares: 340,
    platform: ['WhatsApp', 'Facebook']
  }
];

export default function WarRoomPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-8 h-8 text-red-600" />
            War Room Cybertrooper
          </h1>
          <p className="text-gray-500">Pusat koordinasi isu semasa dan gerak kerja media sosial.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" />
          Lapor Isu Baru
        </button>
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-100">Misi Aktif</h3>
            <ActivityIcon className="w-6 h-6 text-red-200" />
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-red-100 mt-1">Perlukan tindakan segera</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Respon Netizen</h3>
            <MessageSquare className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">85%</p>
          <p className="text-sm text-green-600 mt-1">Sentimen Positif (Minggu Ini)</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Capaian Media</h3>
            <Share2 className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">45.2K</p>
          <p className="text-sm text-gray-500 mt-1">Tayangan (Views) Terkumpul</p>
        </div>
      </div>

      {/* Mission List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">Semua Misi</option>
              <option value="HIGH">Keutamaan Tinggi</option>
              <option value="ACTIVE">Sedang Berjalan</option>
            </select>
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Senarai Tugasan</span>
        </div>

        <div className="divide-y divide-gray-100">
          {MISSIONS.map((mission) => (
            <Link 
              key={mission.id} 
              href={`/dashboard/war-room/${mission.id}`}
              className="block hover:bg-gray-50 transition-colors p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    {mission.priority === 'HIGH' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        KRITIKAL
                      </span>
                    )}
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      mission.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {mission.status === 'ACTIVE' ? 'SEDANG BERJALAN' : 'SELESAI'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mission.date}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{mission.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{mission.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {mission.comments} Perbincangan
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {mission.shares} Perkongsian
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-gray-400">Platform Sasaran:</span>
                      {mission.platform.map(p => (
                        <span key={p} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
