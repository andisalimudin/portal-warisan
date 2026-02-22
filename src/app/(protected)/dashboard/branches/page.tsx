"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Users, Loader2 } from "lucide-react";

type BranchListItem = {
  id: string;
  name: string;
  code: string;
  location: string;
  status: "AKTIF" | "TIDAK_AKTIF" | string;
  memberCount: number;
};

export default function BranchesPublicListPage() {
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/admin/branches");
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan senarai cawangan.");
          return;
        }

        const items = Array.isArray(data.branches) ? data.branches : [];
        setBranches(
          items.map((b: any) => ({
            id: String(b.id),
            name: String(b.name),
            code: String(b.code),
            location: String(b.location || ""),
            status: String(b.status || "AKTIF"),
            memberCount: Number(b.memberCount || 0),
          }))
        );
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan senarai cawangan.");
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
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Senarai Cawangan N.52 Sungai Sibuga
        </h1>
        <p className="text-sm text-gray-600">
          Pilih salah satu cawangan untuk melihat maklumat profil, aktiviti dan
          kalendar program di kawasan tersebut.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memuatkan senarai cawangan...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!branches.length && !loading && !error && (
        <p className="text-sm text-gray-500">
          Tiada cawangan untuk dipaparkan.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((b) => (
          <Link
            key={b.id}
            href={`/dashboard/branches/${b.id}`}
            className="group bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-2 hover:border-warisan-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  {b.name}
                </span>
                <span className="text-xs text-gray-500">
                  {b.code}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  b.status === "AKTIF"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {b.status}
              </span>
            </div>
            {b.location && (
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin className="w-3 h-3 mt-0.5 text-warisan-700" />
                <span>{b.location}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                {b.memberCount} ahli
              </span>
              <span className="text-warisan-700 font-semibold text-[11px] group-hover:underline">
                Lihat laman cawangan
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

