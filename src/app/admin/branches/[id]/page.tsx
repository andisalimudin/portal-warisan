"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Users,
  CalendarDays,
  FileText,
  Loader2,
} from "lucide-react";

type BranchDetail = {
  id: string;
  name: string;
  code: string;
  status: string;
  leaderName: string;
  leaderPhone: string;
  location: string;
  description: string;
  activities: string;
  calendar: string;
  memberCount: number;
  establishedDate: string;
};

export default function BranchDetailPage() {
  const params = useParams();
  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [description, setDescription] = useState("");
  const [activities, setActivities] = useState("");
  const [calendar, setCalendar] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("warisan_user");
      if (raw) {
        try {
          const basic = JSON.parse(raw) as { role?: string };
          const role = String(basic.role || "");
          if (role.startsWith("ADMIN")) {
            setCanEdit(true);
          }
        } catch {
        }
      }
    }

    async function load() {
      try {
        const id = String(params?.id || "");
        if (!id) {
          setError("ID cawangan tidak sah.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/branches/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan maklumat cawangan.");
          return;
        }

        const b = data.branch as BranchDetail;
        setBranch(b);
        setDescription(b.description || "");
        setActivities(b.activities || "");
        setCalendar(b.calendar || "");
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan data cawangan.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [params]);

  function formatStatus(status: string) {
    if (status === "AKTIF") return "Aktif";
    if (status === "TIDAK_AKTIF") return "Tidak Aktif";
    return status || "-";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!branch) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/branches/${encodeURIComponent(branch.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          activities,
          calendar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || "Ralat semasa mengemas kini maklumat cawangan.");
        return;
      }

      const updated = data.branch as BranchDetail;
      setBranch(updated);
      setDescription(updated.description || "");
      setActivities(updated.activities || "");
      setCalendar(updated.calendar || "");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setSaveError("Ralat rangkaian semasa menyimpan maklumat.");
    } finally {
      setSaving(false);
    }
  }

  function renderLines(text: string) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/organization"
            className="inline-flex items-center text-gray-500 hover:text-warisan-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Senarai Cawangan
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuatkan maklumat cawangan...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!branch && !loading && !error && (
        <p className="text-sm text-gray-500">Cawangan tidak dijumpai.</p>
      )}

      {!branch ? null : (
        <>
          <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {branch.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warisan-50 text-warisan-800 border border-warisan-100 text-xs font-semibold">
                  Kod: {branch.code}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-800">
                  Ditubuhkan: {branch.establishedDate}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    branch.status === "AKTIF"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {formatStatus(branch.status)}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-warisan-700" />
                <span>
                  Ahli berdaftar:{" "}
                  <span className="font-semibold">
                    {branch.memberCount}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-warisan-700" />
                <span>
                  Ketua:{" "}
                  <span className="font-semibold">
                    {branch.leaderName || "Belum ditetapkan"}
                  </span>
                  {branch.leaderPhone && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      {branch.leaderPhone}
                    </span>
                  )}
                </span>
              </div>
              {branch.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-warisan-700 mt-0.5" />
                  <span className="text-xs text-gray-600">
                    {branch.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-warisan-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Profil Cawangan
                </h2>
              </div>
              {canEdit ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                  placeholder="Ringkasan tentang cawangan, sejarah penubuhan, fokus program dan lain-lain."
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {description || "Belum ada maklumat profil untuk cawangan ini."}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-warisan-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Aktiviti & Program
                </h2>
              </div>
              {canEdit ? (
                <textarea
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                  placeholder={"Contoh:\n- Gotong-royong bulanan\n- Kelas tuisyen percuma setiap Sabtu\n- Ziarah kebajikan warga emas"}
                />
              ) : (
                renderLines(activities) || (
                  <p className="text-sm text-gray-700">
                    Belum ada senarai aktiviti.
                  </p>
                )
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-5 h-5 text-warisan-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Kalendar Cawangan
                </h2>
              </div>
              {canEdit ? (
                <textarea
                  value={calendar}
                  onChange={(e) => setCalendar(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                  placeholder={"Contoh:\n- 5 Mac: Mesyuarat AJK Cawangan\n- 12 Mac: Program ziarah kampung\n- 25 Mac: Dialog bersama penduduk"}
                />
              ) : (
                renderLines(calendar) || (
                  <p className="text-sm text-gray-700">
                    Belum ada jadual dalam kalendar cawangan.
                  </p>
                )
              )}
            </div>

            {canEdit && (
              <div className="lg:col-span-3 flex justify-end gap-3">
                {saveError && (
                  <p className="text-sm text-red-600 mr-auto">
                    {saveError}
                  </p>
                )}
                {saveSuccess && (
                  <p className="text-sm text-green-600 mr-auto">
                    Maklumat cawangan berjaya dikemas kini.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-warisan-700 text-white text-sm font-semibold hover:bg-warisan-800 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}

