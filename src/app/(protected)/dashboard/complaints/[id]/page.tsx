"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, User, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data
const COMPLAINT_DETAIL = {
  id: '1',
  ticketId: '#ADU-2026-001',
  title: 'Jalan Berlubang di Kg. Tinusa 2',
  category: 'INFRASTRUKTUR',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  description: 'Terdapat lubang besar di tengah jalan utama masuk ke kampung yang membahayakan penunggang motosikal, terutamanya pada waktu malam kerana tiada lampu jalan.',
  location: 'Jalan Utama Kg. Tinusa 2, berhadapan Kedai Runcit Ali',
  date: '12 Jan 2026, 10:30 AM',
  images: ['/placeholder-road.jpg'],
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
  sla: {
    deadline: '15 Jan 2026',
    status: 'ON_TRACK' // ON_TRACK, OVERDUE
  }
};

export default function ComplaintDetailPage() {
  const params = useParams();
  console.log(params); // Usage to silence unused var
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">Baru Diterima</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">Dalam Tindakan</span>;
      case 'RESOLVED': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Selesai</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-gray-500">{COMPLAINT_DETAIL.ticketId}</span>
              {getStatusBadge(COMPLAINT_DETAIL.status)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{COMPLAINT_DETAIL.title}</h1>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Sasaran Selesai (SLA)</div>
            <div className="font-mono font-bold text-blue-900">{COMPLAINT_DETAIL.sla.deadline}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Butiran Aduan</h3>
                <p className="text-gray-900 leading-relaxed">{COMPLAINT_DETAIL.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Lokasi
                  </h3>
                  <p className="text-gray-900 font-medium">{COMPLAINT_DETAIL.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Tarikh Laporan
                  </h3>
                  <p className="text-gray-900 font-medium">{COMPLAINT_DETAIL.date}</p>
                </div>
              </div>

              {/* Mock Image */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lampiran</h3>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Gambar Lampiran (Mock)</p>
                </div>
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

        {/* Sidebar */}
        <div className="space-y-6">
            <div className="bg-warisan-50 border border-warisan-100 rounded-xl p-6">
                <h3 className="font-bold text-warisan-900 mb-2">Wakil Bertugas</h3>
                <p className="text-sm text-warisan-700 mb-4">Aduan ini sedang dipantau oleh wakil kawasan anda.</p>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-warisan-100 shadow-sm">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">En. Razak Ahmad</div>
                        <div className="text-xs text-gray-500">Ketua Cawangan Sim-Sim</div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Mesej / Pertanyaan</h3>
                <div className="space-y-4 mb-4 h-64 overflow-y-auto pr-2">
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none">
                        <p className="text-xs text-gray-500 mb-1">Admin Pusat • 12 Jan, 2:30 PM</p>
                        <p className="text-sm text-gray-800">Tuan, boleh berikan gambar dari sudut lain? Terima kasih.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tulis mesej..." 
                        className="flex-1 text-sm rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                    />
                    <button className="p-2 bg-warisan-600 text-white rounded-lg hover:bg-warisan-700">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
