"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, DollarSign, Send, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

type CsrType = "KEMPEN" | "ISU";
type CsrStatus = "AKTIF" | "TAMAT";

type Donation = {
  id: string;
  donor: string;
  amount: number;
  date: string;
  note?: string;
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
  description: string;
  donations: Donation[];
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
    description:
      "Dana ini digunakan untuk bantuan segera (tangki air/air minuman) dan logistik agihan di sekitar Sandakan.",
    donations: [
      { id: "d1", donor: "Ali bin Abu", amount: 50, date: "2026-01-12", note: "Semoga dipermudahkan." },
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
    description:
      "Sumbangan akan disalurkan untuk barangan asas, kit kebersihan, dan bantuan pembersihan pasca banjir.",
    donations: [
      { id: "d4", donor: "Wong Ah Seng", amount: 80, date: "2026-01-12" },
      { id: "d5", donor: "Dayang Ku Intan", amount: 20, date: "2026-01-09", note: "Untuk mangsa banjir." },
    ],
  },
];

function formatRM(value: number) {
  return `RM ${value.toLocaleString("ms-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getParamId(params: Record<string, string | string[]>) {
  const raw = params.id;
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

export default function CsrDetailPage() {
  const params = useParams();
  const campaignId = getParamId(params as Record<string, string | string[]>);

  const baseCampaign = useMemo(() => {
    return MOCK_CAMPAIGNS.find((c) => c.id === campaignId) ?? null;
  }, [campaignId]);

  const [donationAmount, setDonationAmount] = useState<string>("");
  const [donationNote, setDonationNote] = useState<string>("");
  const [donations, setDonations] = useState<Donation[]>(baseCampaign?.donations ?? []);
  const [raisedAmount, setRaisedAmount] = useState<number>(baseCampaign?.raisedAmount ?? 0);

  const progress = useMemo(() => {
    if (!baseCampaign || baseCampaign.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((raisedAmount / baseCampaign.targetAmount) * 100));
  }, [baseCampaign, raisedAmount]);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseCampaign || baseCampaign.status !== "AKTIF") return;

    const amount = Number(donationAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const newDonation: Donation = {
      id: `d-${Date.now()}`,
      donor: "Ali bin Abu",
      amount,
      date: new Date().toISOString().slice(0, 10),
      note: donationNote.trim() ? donationNote.trim() : undefined,
    };

    setDonations((prev) => [newDonation, ...prev]);
    setRaisedAmount((prev) => prev + amount);
    setDonationAmount("");
    setDonationNote("");
    alert("Sumbangan berjaya direkodkan (simulasi).");
  };

  if (!baseCampaign) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/csr" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-lg font-bold text-gray-900 mb-1">Kempen tidak dijumpai</div>
          <div className="text-sm text-gray-600">Sila kembali ke senarai CSR.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/csr" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke CSR
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    baseCampaign.type === "KEMPEN" ? "bg-warisan-50 text-warisan-800" : "bg-orange-50 text-orange-700"
                  )}
                >
                  {baseCampaign.type}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    baseCampaign.status === "AKTIF" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                  )}
                >
                  {baseCampaign.status}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" />
                  Tamat: {baseCampaign.endDate}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{baseCampaign.title}</h1>
              <p className="text-gray-600 mt-2">{baseCampaign.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500">Terkumpul</div>
                  <div className="text-lg font-bold text-gray-900">{formatRM(raisedAmount)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500">Sasaran</div>
                  <div className="text-lg font-bold text-gray-900">{formatRM(baseCampaign.targetAmount)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Penyumbang</div>
                    <div className="text-lg font-bold text-gray-900">{baseCampaign.donorsCount}</div>
                  </div>
                  <Users className="w-6 h-6 text-warisan-700" />
                </div>
              </div>

              <div className="mt-5">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-warisan-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{progress}% capai sasaran</span>
                  <span>Baki: {formatRM(Math.max(0, baseCampaign.targetAmount - raisedAmount))}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white">
              <h2 className="text-base font-bold text-gray-900 mb-3">Buat Sumbangan</h2>
              <form onSubmit={handleDonate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jumlah (RM)</label>
                    <input
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      inputMode="decimal"
                      placeholder="Contoh: 50"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Penyumbang</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                      Ali bin Abu
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nota (pilihan)</label>
                  <input
                    value={donationNote}
                    onChange={(e) => setDonationNote(e.target.value)}
                    placeholder="Contoh: Semoga dipermudahkan."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={baseCampaign.status !== "AKTIF"}
                  className={cn(
                    "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                    baseCampaign.status === "AKTIF"
                      ? "bg-warisan-accent-500 text-white hover:bg-warisan-accent-600"
                      : "bg-gray-200 text-gray-600 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                  Derma Sekarang
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Senarai Sumbangan</h3>
              <div className="text-sm text-gray-500">{donations.length} rekod</div>
            </div>
            <div className="divide-y divide-gray-100">
              {donations.length === 0 ? (
                <div className="p-6 text-sm text-gray-600">Belum ada sumbangan.</div>
              ) : (
                donations.map((d) => (
                  <div key={d.id} className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">{d.donor}</div>
                      <div className="text-xs text-gray-500">{d.date}</div>
                      {d.note ? <div className="text-sm text-gray-700 mt-1">{d.note}</div> : null}
                    </div>
                    <div className="font-bold text-gray-900 shrink-0">{formatRM(d.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-warisan-50 border border-warisan-100 rounded-xl p-5">
            <h4 className="font-bold text-warisan-950 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Nota
            </h4>
            <div className="text-sm text-warisan-900/90 space-y-2">
              <div>Ini ialah modul simulasi untuk rekod sumbangan dan paparan jumlah.</div>
              <div>Halaman ciptaan kempen hanya tersedia di bahagian admin.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

