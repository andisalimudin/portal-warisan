"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, DollarSign, Filter, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type CsrType = "KEMPEN" | "ISU";
type CsrStatus = "AKTIF" | "TAMAT";

type DonationPreview = {
  id: string;
  donor: string;
  amount: number;
  date: string;
};

type CsrCampaign = {
  id: string;
  title: string;
  type: CsrType;
  status: CsrStatus;
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  endDate: string;
  createdBy: string;
  recentDonations: DonationPreview[];
};

const MOCK_CAMPAIGNS: CsrCampaign[] = [
  {
    id: "air-sandakan",
    title: "Kempen CSR: Bantuan Tangki Air Sandakan",
    type: "KEMPEN",
    status: "AKTIF",
    targetAmount: 50000,
    raisedAmount: 18750,
    donorsCount: 128,
    endDate: "2026-02-15",
    createdBy: "Admin Portal",
    recentDonations: [
      { id: "d1", donor: "Ali bin Abu", amount: 50, date: "2026-01-12" },
      { id: "d2", donor: "Siti Aminah", amount: 100, date: "2026-01-11" },
      { id: "d3", donor: "Ahmad bin Ali", amount: 30, date: "2026-01-10" },
    ],
  },
  {
    id: "banjir-bukit-garam",
    title: "Isu Semasa: Bantuan Pasca Banjir Bukit Garam",
    type: "ISU",
    status: "AKTIF",
    targetAmount: 20000,
    raisedAmount: 9200,
    donorsCount: 74,
    endDate: "2026-01-31",
    createdBy: "Admin Portal",
    recentDonations: [
      { id: "d4", donor: "Wong Ah Seng", amount: 80, date: "2026-01-12" },
      { id: "d5", donor: "Dayang Ku Intan", amount: 20, date: "2026-01-09" },
    ],
  },
  {
    id: "tablet-pusat-komuniti",
    title: "Kempen CSR: Tablet Untuk Pusat Komuniti",
    type: "KEMPEN",
    status: "TAMAT",
    targetAmount: 15000,
    raisedAmount: 15280,
    donorsCount: 96,
    endDate: "2026-01-05",
    createdBy: "Admin Portal",
    recentDonations: [
      { id: "d6", donor: "Muthu A/L Raju", amount: 200, date: "2026-01-04" },
      { id: "d7", donor: "Sarah Media", amount: 60, date: "2026-01-03" },
    ],
  },
];

function formatRM(value: number) {
  return `RM ${value.toLocaleString("ms-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CsrPage() {
  const [filter, setFilter] = useState<"SEMUA" | "AKTIF" | "TAMAT">("SEMUA");

  const filteredCampaigns = useMemo(() => {
    if (filter === "SEMUA") return MOCK_CAMPAIGNS;
    return MOCK_CAMPAIGNS.filter((c) => c.status === filter);
  }, [filter]);

  const summary = useMemo(() => {
    const totalRaised = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.raisedAmount, 0);
    const totalDonors = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.donorsCount, 0);
    const activeCount = MOCK_CAMPAIGNS.filter((c) => c.status === "AKTIF").length;
    return { totalRaised, totalDonors, activeCount };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-warisan-700" />
            CSR / Derma Kempen
          </h1>
          <p className="text-gray-500">Sumbangan anda membantu gerak kerja kempen dan isu semasa.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
            value={filter}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "SEMUA" || next === "AKTIF" || next === "TAMAT") setFilter(next);
            }}
          >
            <option value="SEMUA">Semua</option>
            <option value="AKTIF">Aktif</option>
            <option value="TAMAT">Tamat</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Jumlah Sumbangan (Semua Kempen)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatRM(summary.totalRaised)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Penyumbang</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalDonors}</p>
          </div>
          <div className="w-12 h-12 bg-warisan-50 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-warisan-700" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Kempen Aktif</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.activeCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCampaigns.map((c) => {
          const progress = c.targetAmount > 0 ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100)) : 0;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      c.type === "KEMPEN" ? "bg-warisan-50 text-warisan-800" : "bg-orange-50 text-orange-700"
                    )}
                  >
                    {c.type}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      c.status === "AKTIF" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {c.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    Tamat: {c.endDate}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Terkumpul</p>
                    <p className="font-semibold text-gray-900">{formatRM(c.raisedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sasaran</p>
                    <p className="font-semibold text-gray-900">{formatRM(c.targetAmount)}</p>
                  </div>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-warisan-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{progress}% capai sasaran</span>
                  <span>{c.donorsCount} penyumbang</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Sumbangan Terkini</p>
                  <div className="space-y-2">
                    {c.recentDonations.length === 0 ? (
                      <div className="text-sm text-gray-500">Belum ada sumbangan.</div>
                    ) : (
                      c.recentDonations.slice(0, 3).map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{d.donor}</span>
                          <span className="font-semibold text-gray-900">{formatRM(d.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                <div className="text-xs text-gray-500">Dicipta oleh: {c.createdBy}</div>
                <Link
                  href={`/dashboard/csr/${c.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-warisan-700 hover:text-warisan-900"
                >
                  Lihat & Derma <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
