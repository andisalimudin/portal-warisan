import Link from "next/link";
import { Calendar, DollarSign, Plus, Users } from "lucide-react";

type CsrStatus = "AKTIF" | "TAMAT";

type AdminCsrCampaign = {
  id: string;
  title: string;
  status: CsrStatus;
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  endDate: string;
};

const MOCK_CAMPAIGNS: AdminCsrCampaign[] = [
  {
    id: "air-sandakan",
    title: "Kempen CSR: Bantuan Tangki Air Sandakan",
    status: "AKTIF",
    targetAmount: 50000,
    raisedAmount: 18750,
    donorsCount: 128,
    endDate: "2026-02-15",
  },
  {
    id: "banjir-bukit-garam",
    title: "Isu Semasa: Bantuan Pasca Banjir Bukit Garam",
    status: "AKTIF",
    targetAmount: 20000,
    raisedAmount: 9200,
    donorsCount: 74,
    endDate: "2026-01-31",
  },
  {
    id: "tablet-pusat-komuniti",
    title: "Kempen CSR: Tablet Untuk Pusat Komuniti",
    status: "TAMAT",
    targetAmount: 15000,
    raisedAmount: 15280,
    donorsCount: 96,
    endDate: "2026-01-05",
  },
];

function formatRM(value: number) {
  return `RM ${value.toLocaleString("ms-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AdminCsrPage() {
  const totalRaised = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonors = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.donorsCount, 0);
  const activeCount = MOCK_CAMPAIGNS.filter((c) => c.status === "AKTIF").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CSR (Admin)</h1>
          <p className="text-gray-500">Hanya admin boleh memuat naik kempen / isu untuk sumbangan.</p>
        </div>
        <Link
          href="/admin/csr/create"
          className="inline-flex items-center justify-center gap-2 bg-warisan-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-warisan-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Kempen Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Jumlah Terkumpul</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatRM(totalRaised)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Penyumbang</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalDonors}</p>
          </div>
          <div className="w-12 h-12 bg-warisan-50 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-warisan-700" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Kempen Aktif</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            Senarai Kempen / Isu
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{MOCK_CAMPAIGNS.length} rekod</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-white text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Tajuk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sasaran</th>
                <th className="px-6 py-4">Terkumpul</th>
                <th className="px-6 py-4">Penyumbang</th>
                <th className="px-6 py-4">Tamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_CAMPAIGNS.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        c.status === "AKTIF"
                          ? "px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                          : "px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatRM(c.targetAmount)}</td>
                  <td className="px-6 py-4 font-semibold">{formatRM(c.raisedAmount)}</td>
                  <td className="px-6 py-4">{c.donorsCount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {c.endDate}
                    </span>
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

