"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Filter, AlertCircle, Clock, CheckCircle, ArrowUpRight, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const COMPLAINTS = [
  {
    id: '1',
    ticketId: '#ADU-2026-001',
    title: 'Jalan Berlubang di Kg. Tinusa 2',
    reporter: 'Ali bin Abu',
    category: 'INFRASTRUKTUR',
    area: 'Kg. Tinusa 2 (N.52)',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    date: '12 Jan 2026',
    slaDue: '15 Jan 2026'
  },
  {
    id: '2',
    ticketId: '#ADU-2026-002',
    title: 'Bantuan Bakul Makanan',
    reporter: 'Siti Aminah',
    category: 'KEBAJIKAN',
    area: 'N.52 Sungai Sibuga',
    status: 'PENDING',
    priority: 'MEDIUM',
    date: '10 Jan 2026',
    slaDue: '17 Jan 2026'
  },
  {
    id: '3',
    ticketId: '#ADU-2026-003',
    title: 'Lampu Jalan Rosak',
    reporter: 'Jason Wong',
    category: 'INFRASTRUKTUR',
    area: 'N.52 Sungai Sibuga',
    status: 'RESOLVED',
    priority: 'LOW',
    date: '05 Jan 2026',
    slaDue: '12 Jan 2026'
  }
];

export default function AdminComplaintsPage() {
  const [filter, setFilter] = useState('ALL');
  // Silence unused vars for now
  console.log(filter, setFilter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Aduan Rakyat</h1>
          <p className="text-gray-500">Pantau dan uruskan aduan dari pengundi kawasan.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 bg-warisan-900 text-white px-4 py-2 rounded-lg hover:bg-warisan-800">
                Export Laporan
            </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Aduan Baru" value="12" color="text-orange-600" icon={<AlertCircle />} />
        <StatCard title="Dalam Tindakan" value="45" color="text-blue-600" icon={<Clock />} />
        <StatCard title="Selesai Bulan Ini" value="128" color="text-green-600" icon={<CheckCircle />} />
        <StatCard title="SLA Terlepas" value="3" color="text-red-600" icon={<AlertCircle />} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari ID tiket, tajuk atau pengadu..." 
                    className="pl-10 w-full rounded-lg border-gray-300 text-sm focus:ring-warisan-500 focus:border-warisan-500"
                />
            </div>
            <div className="text-sm text-gray-500">
                Menunjukkan <strong>1-10</strong> dari <strong>150</strong> aduan
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3">ID Tiket</th>
                        <th className="px-6 py-3">Tajuk / Pengadu</th>
                        <th className="px-6 py-3">Kategori / Kawasan</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Keutamaan</th>
                        <th className="px-6 py-3">SLA Due</th>
                        <th className="px-6 py-3 text-right">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {COMPLAINTS.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-gray-900">{complaint.ticketId}</td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{complaint.title}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> {complaint.reporter}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mb-1">
                                    {complaint.category}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {complaint.area}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusStyle(complaint.status))}>
                                    {complaint.status === 'IN_PROGRESS' ? 'Dalam Tindakan' : 
                                     complaint.status === 'PENDING' ? 'Baru' : 
                                     complaint.status === 'RESOLVED' ? 'Selesai' : complaint.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "text-xs font-bold",
                                    complaint.priority === 'HIGH' ? "text-red-600" :
                                    complaint.priority === 'MEDIUM' ? "text-orange-600" : "text-blue-600"
                                )}>
                                    {complaint.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                {complaint.slaDue}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link 
                                    href={`/admin/complaints/${complaint.id}`}
                                    className="inline-flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string, value: string, color: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className={cn("text-2xl font-bold", color)}>{value}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-400">
                {icon}
            </div>
        </div>
    )
}
