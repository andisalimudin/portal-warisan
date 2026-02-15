"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, User, Save, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data (Reused for consistency)
const COMPLAINT_DETAIL = {
  id: '1',
  ticketId: '#ADU-2026-001',
  title: 'Jalan Berlubang di Kg. Tinusa 2',
  category: 'INFRASTRUKTUR',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  description: 'Terdapat lubang besar di tengah jalan utama masuk ke kampung yang membahayakan penunggang motosikal, terutamanya pada waktu malam kerana tiada lampu jalan.',
  location: 'Jalan Utama Kg. Tinusa 2, berhadapan Kedai Runcit Ali',
  reporter: {
    name: 'Ali bin Abu',
    id: 'MEMBER-001',
    phone: '012-3456789'
  },
  date: '12 Jan 2026, 10:30 AM',
  timeline: [
    {
      status: 'PENDING',
      title: 'Aduan Diterima',
      date: '12 Jan 2026, 10:30 AM',
      note: 'Aduan telah didaftarkan ke dalam sistem.'
    },
    {
      status: 'IN_PROGRESS',
      title: 'Dalam Tindakan',
      date: '12 Jan 2026, 02:15 PM',
      note: 'Tugasan telah diserahkan kepada Ketua Cawangan Tinusa 2 untuk siasatan awal.',
      actor: 'Admin Pusat'
    }
  ],
  assignedTo: 'Ketua Cawangan Tinusa 2'
};

export default function AdminComplaintDetailPage() {
  const params = useParams();
  console.log(params); // Silence unused var
  const [status, setStatus] = useState(COMPLAINT_DETAIL.status);
  const [priority, setPriority] = useState(COMPLAINT_DETAIL.priority);
  const [assignee, setAssignee] = useState(COMPLAINT_DETAIL.assignedTo);
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai
        </Link>
        <button className="bg-warisan-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-warisan-800 flex items-center gap-2">
            <Save className="w-4 h-4" /> Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           {/* Header Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-gray-500">{COMPLAINT_DETAIL.ticketId}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">
                        IN_PROGRESS
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{COMPLAINT_DETAIL.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {COMPLAINT_DETAIL.reporter.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {COMPLAINT_DETAIL.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {COMPLAINT_DETAIL.date}</span>
                </div>
           </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Butiran Lanjut</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{COMPLAINT_DETAIL.description}</p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-2">Lampiran</h4>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Gambar Lampiran (Mock)</p>
                </div>
            </div>
            
            {/* Action Log Form */}
            <div className="p-6 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4">Log Tindakan Baru</h3>
                <textarea 
                    className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500 mb-3"
                    rows={3}
                    placeholder="Catatkan tindakan yang diambil..."
                ></textarea>
                <div className="flex justify-end">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Tambah Log
                    </button>
                </div>
            </div>
          </div>

          {/* Timeline / History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6">Sejarah Tindakan</h3>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {COMPLAINT_DETAIL.timeline.map((event, index) => (
                <div key={index} className="relative flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-white z-10",
                    event.status === 'RESOLVED' ? "border-green-500 text-green-500" :
                    event.status === 'IN_PROGRESS' ? "border-blue-500 text-blue-500" :
                    "border-gray-300 text-gray-400"
                  )}>
                    {event.status === 'RESOLVED' ? <CheckCircle className="w-5 h-5" /> :
                     event.status === 'IN_PROGRESS' ? <User className="w-5 h-5" /> :
                     <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <span className="text-xs text-gray-500">{event.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{event.note}</p>
                    {event.actor && (
                      <div className="text-xs font-medium text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
                        Oleh: {event.actor}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Management */}
        <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Pengurusan Tiket</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                    >
                        <option value="PENDING">Baru Diterima</option>
                        <option value="IN_PROGRESS">Dalam Tindakan</option>
                        <option value="RESOLVED">Selesai</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keutamaan</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                    >
                        <option value="LOW">Rendah (7 Hari)</option>
                        <option value="MEDIUM">Sederhana (3 Hari)</option>
                        <option value="HIGH">Tinggi (24 Jam)</option>
                    </select>
                </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Tugasan</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ditugaskan Kepada</label>
                    <input 
                        type="text"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500 mb-2"
                        placeholder="Nama Wakil / Jawatan"
                    />
                    <p className="text-xs text-gray-500">
                        Wakil akan menerima notifikasi tugasan ini.
                    </p>
                </div>
            </div>

             {/* SLA Info */}
             <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-red-900">SLA Due Date</h4>
                        <p className="text-2xl font-bold text-red-700 mt-1">15 Jan 2026</p>
                        <p className="text-xs text-red-600 mt-1">Tinggal 2 hari lagi</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
