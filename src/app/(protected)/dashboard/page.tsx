import { QrCode, UserCheck, Users, Activity, Map as MapIcon } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Status Keahlian" 
          value="Aktif" 
          icon={<UserCheck className="w-6 h-6 text-warisan-700" />} 
          statusColor="text-warisan-700"
        />
        <StatCard 
          title="Jumlah Rujukan" 
          value="12 Ahli" 
          icon={<Users className="w-6 h-6 text-warisan-700" />} 
        />
        <StatCard 
          title="Mata Ganjaran" 
          value="240 Pts" 
          icon={<Activity className="w-6 h-6 text-warisan-accent-600" />} 
        />
         <StatCard 
          title="Kawasan" 
          value="N.52 Sungai Sibuga" 
          icon={<Activity className="w-6 h-6 text-warisan-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pengumuman Terkini</h3>
            <div className="space-y-4">
              <AnnouncementItem 
                title="Mesyuarat Agung Tahunan Cawangan" 
                date="20 Jan 2026"
                preview="Semua ahli dijemput hadir ke dewan serbaguna..."
              />
              <AnnouncementItem 
                title="Kemaskini Profil Keahlian" 
                date="15 Jan 2026"
                preview="Sila pastikan maklumat terkini anda dikemaskini sebelum..."
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <MapIcon className="w-5 h-5 text-warisan-700" />
              <h3 className="text-lg font-bold text-gray-900">Peta Kawasan N.52 Sungai Sibuga</h3>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 border">
              {/* Using a descriptive placeholder for the map image */}
              <Image 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                alt="Peta N.52 Sungai Sibuga"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/0 transition-colors">
                <div className="bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-bold text-warisan-950 flex items-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  Lihat Peta Interaktif
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 italic text-center">
              * Paparan visual kawasan pentadbiran DUN N.52 Sungai Sibuga.
            </p>
          </div>
        </div>

        {/* Sidebar / QR Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Kad Ahli Digital</h3>
                <div className="bg-warisan-50 p-4 rounded-lg mb-4">
                    <QrCode className="w-32 h-32 text-warisan-950" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Imbas untuk kehadiran</p>
                <div className="font-mono text-lg font-bold text-warisan-950">ID: W-2026-8831</div>
            </div>

            <div className="bg-gradient-to-br from-warisan-950 to-warisan-800 p-6 rounded-xl shadow-sm text-white border border-warisan-800">
                <h3 className="font-bold mb-2">Kod Referral Anda</h3>
                <p className="text-warisan-200 text-sm mb-4">Kongsi kod ini untuk jemput rakan.</p>
                <div className="bg-white/10 p-3 rounded text-center font-mono text-xl font-bold tracking-widest border border-white/20">
                    ALI8831
                </div>
                <button className="mt-4 w-full bg-warisan-accent-500 text-white py-2 rounded font-medium text-sm hover:bg-warisan-accent-600 transition">
                    Salin Kod
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  statusColor = "text-gray-900",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  statusColor?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${statusColor}`}>{value}</p>
      </div>
      <div className="p-3 bg-warisan-50 rounded-lg">
        {icon}
      </div>
    </div>
  )
}

function AnnouncementItem({
  title,
  date,
  preview,
}: {
  title: string;
  date: string;
  preview: string;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{date}</span>
      </div>
      <p className="text-sm text-gray-600">{preview}</p>
    </div>
  )
}
