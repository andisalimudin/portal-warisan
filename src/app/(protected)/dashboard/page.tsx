"use client";

import { useEffect, useState } from "react";
import { QrCode, UserCheck, Users, Activity, Map as MapIcon, Copy } from "lucide-react";
import Image from "next/image";

type PollOptionData = {
  id: string;
  text: string;
  votes: number;
};

type PollData = {
  id: string;
  question: string;
  options: PollOptionData[];
  totalVotes: number;
  userVoteOptionId: string | null;
};

function formatStatus(status: string) {
  if (status === "APPROVED") return "Aktif";
  if (status === "PENDING") return "Menunggu Kelulusan";
  if (status === "SUSPENDED") return "Digantung";
  if (status === "REJECTED") return "Ditolak";
  return status || "-";
}

export default function DashboardPage() {
  const [statusLabel, setStatusLabel] = useState("Memuatkan...");
  const [branchName, setBranchName] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchOptions, setBranchOptions] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branchSaving, setBranchSaving] = useState(false);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const hasBranch = !!branchName;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("warisan_user");

    if (!raw) {
      setStatusLabel("Sila log masuk semula");
      return;
    }

    try {
      const basicUser = JSON.parse(raw) as { id?: string };
      const userId = basicUser.id;

      if (!userId) {
        setStatusLabel("Maklumat pengguna tidak sah");
        return;
      }

      setUserId(userId);

      async function load(id: string) {
        try {
          const [profileRes, referralsRes] = await Promise.all([
            fetch(`/api/profile?userId=${encodeURIComponent(id)}`),
            fetch(`/api/referrals?userId=${encodeURIComponent(id)}`),
          ]);

          const profileData = await profileRes.json();
          const referralsData = await referralsRes.json();

          if (profileRes.ok) {
            const u = profileData.user;

            setStatusLabel(formatStatus(String(u.status ?? "")));
            setBranchName(
              (u.dun as string | null) ||
                (u.parliament as string | null) ||
                null
            );

            const fullCode = String(u.referralCode ?? "");
            const shortCode = fullCode ? fullCode.slice(0, 10) : "";
            setReferralCode(shortCode);
            setMembershipId(shortCode || String(u.id ?? "").slice(0, 10));
          } else {
            setStatusLabel(profileData.error || "Gagal memuatkan status keahlian");
          }

          if (referralsRes.ok) {
            const rStats = referralsData.stats || {};
            setReferralCount(Number(rStats.total || 0));
            setRewardPoints(Number(rStats.points || 0));
          }

          try {
            const pollRes = await fetch(
              `/api/polls/active?userId=${encodeURIComponent(id)}`
            );
            const pollData = await pollRes.json();
            if (pollRes.ok && pollData.poll) {
              const incoming = pollData.poll as PollData;
              setPoll(incoming);
              setSelectedOptionId(incoming.userVoteOptionId);
            } else {
              setPoll(null);
            }
          } catch {
          }

          try {
            const branchesRes = await fetch("/api/admin/branches");
            const branchesData = await branchesRes.json();
            if (branchesRes.ok && Array.isArray(branchesData.branches)) {
              setBranchOptions(
                branchesData.branches.map((b: any) => ({
                  id: String(b.id),
                  name: String(b.name),
                  code: String(b.code),
                }))
              );
            }
          } catch {
          }
        } catch {
          setStatusLabel("Ralat semasa memuatkan data");
        }
      }

      load(userId);
    } catch {
      setStatusLabel("Maklumat sesi tidak sah");
    }
  }, []);

  async function handleVote() {
    if (!poll || !selectedOptionId || !userId) {
      return;
    }

    setVoting(true);
    setPollError(null);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selectedOptionId,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPollError(data.error || "Gagal menghantar undian.");
        return;
      }

      if (data.poll) {
        const updated = data.poll as PollData;
        setPoll(updated);
        setSelectedOptionId(updated.userVoteOptionId || selectedOptionId);
      }
    } catch {
      setPollError("Ralat rangkaian semasa menghantar undian.");
    } finally {
      setVoting(false);
    }
  }

  function handleCopyReferral() {
    if (!referralCode) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Status Keahlian"
          value={statusLabel}
          icon={<UserCheck className="w-6 h-6 text-warisan-700" />}
          statusColor="text-warisan-700"
        />
        <StatCard
          title="Jumlah Rujukan"
          value={`${referralCount} Ahli`}
          icon={<Users className="w-6 h-6 text-warisan-700" />}
        />
        <StatCard
          title="Mata Ganjaran"
          value={`${rewardPoints} Pts`}
          icon={<Activity className="w-6 h-6 text-warisan-accent-600" />}
        />
        <StatCard
          title="Cawangan"
          value={branchName || "Tiada"}
          icon={<MapIcon className="w-6 h-6 text-warisan-500" />}
          actionLabel={hasBranch ? "Mohon Ubah Cawangan" : "Mohon Cawangan"}
          onActionClick={() => {
            setBranchError(null);
            const current = branchOptions.find(
              (b) => b.name === (branchName || "")
            );
            setSelectedBranchId(current ? current.id : "");
            setShowBranchModal(true);
          }}
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

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kad Ahli Digital</h3>
            <div className="bg-warisan-50 p-4 rounded-lg mb-4">
              <QrCode className="w-32 h-32 text-warisan-950" />
            </div>
            <p className="text-sm text-gray-500 mb-2">Imbas untuk kehadiran</p>
            <div className="font-mono text-lg font-bold text-warisan-950">
              {membershipId ? `ID: ${membershipId}` : "ID ahli belum dijana"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-warisan-950 to-warisan-800 p-6 rounded-xl shadow-sm text-white border border-warisan-800">
            <h3 className="font-bold mb-2">Kod Referral Anda</h3>
            <p className="text-warisan-200 text-sm mb-4">
              Kongsi kod ini untuk jemput rakan.
            </p>
            <div className="bg-white/10 p-3 rounded text-center font-mono text-xl font-bold tracking-widest border border-white/20">
              {referralCode || "Tiada kod referral"}
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              disabled={!referralCode}
              className="mt-4 w-full bg-warisan-accent-500 text-white py-2 rounded font-medium text-sm hover:bg-warisan-accent-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Kod Disalin" : "Salin Kod"}
            </button>
          </div>

          {poll && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tinjauan Ahli</h3>
              <p className="text-sm text-gray-700 mb-4">
                {poll.question}
              </p>
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage =
                    poll.totalVotes > 0
                      ? Math.round((option.votes / poll.totalVotes) * 100)
                      : 0;
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedOptionId(option.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isSelected
                          ? "border-warisan-600 bg-warisan-50 text-warisan-900"
                          : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="truncate">{option.text}</span>
                        <span className="text-xs text-gray-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-warisan-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              {pollError && (
                <p className="mt-3 text-xs text-red-600">{pollError}</p>
              )}
              <button
                type="button"
                onClick={handleVote}
                disabled={!selectedOptionId || voting}
                className="mt-4 w-full bg-warisan-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-warisan-800 disabled:opacity-50"
              >
                {poll.userVoteOptionId ? "Kemaskini Undian" : "Hantar Undian"}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                {poll.totalVotes > 0
                  ? `${poll.totalVotes} undian setakat ini.`
                  : "Belum ada undian untuk poll ini."}
              </p>
            </div>
          )}
        </div>
      </div>

      {showBranchModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {hasBranch ? "Mohon Ubah Cawangan" : "Mohon Cawangan"}
            </h3>
            <p className="text-sm text-gray-600">
              Sila pilih cawangan yang anda ingin daftar.
            </p>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Pilih Cawangan</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
              >
                <option value="">Sila pilih cawangan</option>
                {branchOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            {branchError && (
              <p className="text-sm text-red-600">{branchError}</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (branchSaving) return;
                  setShowBranchModal(false);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={branchSaving}
                onClick={async () => {
                  if (!userId) {
                    setBranchError("Sesi tidak sah. Sila log masuk semula.");
                    return;
                  }

                  if (!selectedBranchId) {
                    setBranchError("Sila pilih cawangan.");
                    return;
                  }

                  const selected = branchOptions.find(
                    (b) => b.id === selectedBranchId
                  );

                  if (!selected) {
                    setBranchError("Pilihan cawangan tidak sah.");
                    return;
                  }

                  setBranchSaving(true);
                  setBranchError(null);

                  try {
                    const res = await fetch("/api/profile", {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userId,
                        dun: selected.name,
                      }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      setBranchError(
                        data.error || "Gagal mengemas kini cawangan."
                      );
                      return;
                    }

                    setBranchName(selected.name);
                    setShowBranchModal(false);
                  } catch {
                    setBranchError(
                      "Ralat rangkaian semasa mengemas kini cawangan."
                    );
                  } finally {
                    setBranchSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-warisan-900 text-white text-sm hover:bg-warisan-800 disabled:opacity-50"
              >
                {branchSaving ? "Menyimpan..." : "Hantar Permohonan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  statusColor = "text-gray-900",
  actionLabel,
  onActionClick,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  statusColor?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${statusColor}`}>{value}</p>
        </div>
        <div className="p-3 bg-warisan-50 rounded-lg">
          {icon}
        </div>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onActionClick}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-warisan-200 bg-warisan-50 px-3 py-1.5 text-xs font-medium text-warisan-800 hover:bg-warisan-100 transition-colors"
        >
          {actionLabel}
        </button>
      )}
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
