import { Users, UserPlus, FileCheck, MapPin, Search, Filter, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { getPrisma } from "@/lib/prisma";

type MemberStatus = "AKTIF" | "MENUNGGU" | "DIGANTUNG";

function mapUserStatusToMemberStatus(status: "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED"): MemberStatus {
  if (status === "APPROVED") return "AKTIF";
  if (status === "PENDING") return "MENUNGGU";
  return "DIGANTUNG";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const prisma = getPrisma();

  const [totalMembers, pendingMembers, branchesCount, latestPending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.branch.count(),
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const lastMonthMembers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        lt: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    },
  });

  const thisMonthMembers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    },
  });

  const newApplications = thisMonthMembers;
  const changePercent =
    lastMonthMembers === 0
      ? thisMonthMembers > 0
        ? "+100%"
        : "0%"
      : `${(((thisMonthMembers - lastMonthMembers) / lastMonthMembers) * 100).toFixed(0)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Jumlah Keahlian" 
          value={totalMembers.toLocaleString("ms-MY")} 
          change={`Jumlah ahli berdaftar`}
          icon={<Users className="w-6 h-6 text-warisan-700" />} 
        />
        <StatCard 
          title="Permohonan Baru (bulan ini)" 
          value={newApplications.toString()} 
          change={`${changePercent} berbanding bulan lepas`}
          icon={<UserPlus className="w-6 h-6 text-warisan-accent-600" />} 
        />
        <StatCard 
          title="Menunggu Kelulusan" 
          value={pendingMembers.toString()} 
          change="Permohonan status MENUNGGU"
          icon={<FileCheck className="w-6 h-6 text-orange-600" />} 
        />
        <StatCard 
          title="Jumlah Cawangan" 
          value={branchesCount.toString()} 
          change="Rekod cawangan dalam sistem"
          icon={<MapPin className="w-6 h-6 text-warisan-500" />} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Permohonan Keahlian Terkini</h3>
            <p className="text-sm text-gray-500">Senarai permohonan baru dengan status MENUNGGU.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Nama Pemohon</th>
                <th className="px-6 py-4">No. KP</th>
                <th className="px-6 py-4">Kawasan</th>
                <th className="px-6 py-4">Tarikh</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {latestPending.map((u) => (
                <TableRow
                  key={u.id}
                  name={u.fullName}
                  ic={u.icNumber}
                  area={u.dun || u.parliament || "Tidak dinyatakan"}
                  date={formatDate(u.createdAt)}
                  status={mapUserStatusToMemberStatus(u.status as any)}
                />
              ))}
              {!latestPending.length && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>
                    Tiada permohonan baharu dengan status MENUNGGU.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
          <button className="text-sm font-medium text-warisan-700 hover:text-warisan-800 flex items-center gap-1">
            Lihat Semua Permohonan <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-xs text-gray-500">{change}</p>
      </div>
      <div className="p-3 bg-warisan-50 rounded-lg">
        {icon}
      </div>
    </div>
  )
}

function TableRow({ name, ic, area, date, status }: { name: string, ic: string, area: string, date: string, status: MemberStatus }) {
  const statusStyles: Record<MemberStatus, string> = {
    MENUNGGU: "bg-orange-50 text-orange-700 border-orange-100",
    AKTIF: "bg-green-50 text-green-700 border-green-100",
    DIGANTUNG: "bg-red-50 text-red-700 border-red-100",
  };

  const statusLabels: Record<MemberStatus, string> = {
    MENUNGGU: "Menunggu",
    AKTIF: "Lulus",
    DIGANTUNG: "Digantung",
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{name}</td>
      <td className="px-6 py-4 font-mono text-xs">{ic}</td>
      <td className="px-6 py-4">{area}</td>
      <td className="px-6 py-4">{date}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
