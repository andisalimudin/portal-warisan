"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Copy, Share2, QrCode, Search, Filter, MoreHorizontal, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock Data
const REFERRAL_STATS = {
  total: 124,
  active: 98,
  pending: 26,
  points: 1240
};

const REFERRAL_LIST = [
  { id: '1', name: 'Ahmad bin Ali', date: '2026-01-10', status: 'ACTIVE', role: 'AHLI_BIASA', location: 'Taman Mawar (N.52)' },
  { id: '2', name: 'Siti Sarah', date: '2026-01-09', status: 'PENDING', role: 'AHLI_BIASA', location: 'Kg. Tinusa 2 (N.52)' },
  { id: '3', name: 'Wong Ah Seng', date: '2026-01-08', status: 'ACTIVE', role: 'AHLI_BIASA', location: 'Taman Sibuga (N.52)' },
  { id: '4', name: 'Muthu A/L Raju', date: '2026-01-05', status: 'ACTIVE', role: 'AHLI_BIASA', location: 'Batu 8 (N.52)' },
  { id: '5', name: 'Dayang Ku Intan', date: '2026-01-01', status: 'REJECTED', role: 'AHLI_BIASA', location: 'Kg. Rancangan (N.52)' },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("warisan_user");

    if (!raw) {
      setError("Sesi anda telah tamat. Sila log masuk semula.");
      setLoading(false);
      return;
    }

    try {
      const basicUser = JSON.parse(raw) as { id?: string };
      const userId = basicUser.id;

      if (!userId) {
        setError("Maklumat pengguna tidak sah. Sila log masuk semula.");
        setLoading(false);
        return;
      }

      async function load(id: string) {
        try {
          const res = await fetch(`/api/profile?userId=${encodeURIComponent(id)}`);
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Gagal memuatkan maklumat referral.");
            return;
          }

          const userReferralCode = String(data.user?.referralCode || "").trim();

          if (!userReferralCode) {
            setError("Kod referral tidak dijumpai. Sila hubungi admin.");
            return;
          }

          const origin = window.location.origin;
          const link = `${origin}/register?ref=${encodeURIComponent(userReferralCode)}`;

          setReferralCode(userReferralCode);
          setReferralLink(link);
        } catch {
          setError("Ralat rangkaian semasa memuatkan maklumat referral.");
        } finally {
          setLoading(false);
        }
      }

      load(userId);
    } catch {
      setError("Maklumat sesi tidak sah. Sila log masuk semula.");
      setLoading(false);
    }
  }, []);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
        referralLink
      )}`
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rangkaian Saya</h1>
        <p className="text-gray-500">
          Urus dan pantau perkembangan rangkaian ahli di bawah rujukan anda.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Rujukan</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{REFERRAL_STATS.total}</h3>
          </div>
          <div className="w-12 h-12 bg-warisan-50 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-warisan-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ahli Aktif</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{REFERRAL_STATS.active}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Menunggu Kelulusan</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{REFERRAL_STATS.pending}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-warisan-900 p-6 rounded-xl shadow-sm flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-medium text-warisan-200">Mata Terkumpul</p>
            <h3 className="text-2xl font-bold mt-1">{REFERRAL_STATS.points} pts</h3>
          </div>
          <div className="w-12 h-12 bg-warisan-800 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-warisan-100">W</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Tools */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Kod Rujukan Anda</h3>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">Kod Unik</p>
              {loading ? (
                <p className="text-sm text-gray-400">Memuatkan kod referral...</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <p className="text-2xl font-mono font-bold text-warisan-700 tracking-wider">
                  {referralCode}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={referralLink || ""}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button 
                onClick={handleCopy}
                disabled={!referralLink}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Salin Pautan"
              >
                <Copy className={cn("w-5 h-5", copied ? "text-green-500" : "text-gray-500")} />
              </button>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 bg-warisan-600 text-white px-4 py-3 rounded-lg hover:bg-warisan-700 transition-colors font-medium disabled:opacity-50"
              disabled={!referralLink}
            >
              <Share2 className="w-5 h-5" />
              Kongsi Pautan
            </button>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Kod QR</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center">
                {referralLink && qrUrl ? (
                  <>
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                      <img
                        src={qrUrl}
                        alt="Kod QR Referral"
                        className="w-48 h-48 rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Imbas untuk mendaftar di bawah rangkaian anda
                    </p>
                    <a
                      href={qrUrl}
                      download={`warisan-referral-${referralCode || "kod"}.png`}
                      className="mt-3 flex items-center gap-1 text-sm text-warisan-600 hover:text-warisan-700 font-medium"
                    >
                      <Download className="w-4 h-4" /> Muat Turun QR
                    </a>
                  </>
                ) : (
                  <>
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Kod QR akan dijana selepas kod referral dimuatkan.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Referral List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900">Senarai Ahli Rujukan</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau ID..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama / Lokasi</th>
                  <th className="px-6 py-4">Tarikh</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {REFERRAL_LIST.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warisan-100 flex items-center justify-center text-warisan-700 font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{member.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        member.status === 'ACTIVE' ? "bg-green-100 text-green-800" :
                        member.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {member.status === 'ACTIVE' ? 'Aktif' :
                         member.status === 'PENDING' ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex justify-center">
            <button className="text-sm text-warisan-600 font-medium hover:text-warisan-700">
              Lihat Semua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
