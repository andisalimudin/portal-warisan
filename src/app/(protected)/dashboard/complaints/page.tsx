"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus, AlertCircle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ComplaintListItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  ticketId: string;
};

export default function ComplaintsPage() {
  const [filter, setFilter] = useState("ALL");
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Baru Diterima';
      case 'IN_PROGRESS': return 'Dalam Tindakan';
      case 'RESOLVED': return 'Selesai';
      case 'REJECTED': return 'Ditolak';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (typeof window === "undefined") return;

        const raw = window.localStorage.getItem("warisan_user");
        let reporterId: string | null = null;

        if (raw) {
          try {
            const basic = JSON.parse(raw) as { id?: string };
            if (basic.id) {
              reporterId = String(basic.id);
            }
          } catch {
          }
        }

        const query = reporterId
          ? `?reporterId=${encodeURIComponent(reporterId)}`
          : "";

        const res = await fetch(`/api/complaints${query}`);
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan senarai aduan.");
          return;
        }

        const items = Array.isArray(data.complaints)
          ? data.complaints
          : [];

        setComplaints(
          items.map((c: any) => ({
            id: String(c.id),
            title: String(c.title),
            category: String(c.category),
            status: String(c.status),
            date: String(c.date),
            ticketId: String(c.ticketId),
          }))
        );
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan aduan.");
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

  const filteredComplaints = useMemo(() => {
    if (filter === "ALL") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  function formatDate(dateIso: string) {
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return dateIso;
    return d.toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-warisan-700" />
            Aduan Rakyat
          </h1>
          <p className="text-gray-500">Salurkan aduan dan cadangan anda terus kepada wakil rakyat.</p>
        </div>
        <Link 
          href="/dashboard/complaints/create"
          className="flex items-center justify-center gap-2 bg-warisan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-warisan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Aduan Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Dalam Tindakan
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {complaints.filter((c) => c.status === "IN_PROGRESS").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Selesai</div>
          <div className="text-2xl font-bold text-green-600">
            {complaints.filter((c) => c.status === "RESOLVED").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Menunggu
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {complaints.filter((c) => c.status === "PENDING").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === status
                ? "bg-warisan-900 text-white" 
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {status === "ALL" ? "Semua" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="p-6 text-sm text-gray-500">
            Memuatkan senarai aduan...
          </div>
        )}
        {error && !loading && (
          <div className="p-6 text-sm text-red-600">
            {error}
          </div>
        )}
        {!loading && !error && !filteredComplaints.length && (
          <div className="p-6 text-sm text-gray-500">
            Tiada aduan ditemui.
          </div>
        )}
        <div className="divide-y divide-gray-100">
          {filteredComplaints.map((complaint) => (
            <Link
              key={complaint.id}
              href={`/dashboard/complaints/${complaint.id}`}
              className="block hover:bg-gray-50 transition-colors p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-gray-500">
                      {complaint.ticketId}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1",
                        getStatusColor(complaint.status)
                      )}
                    >
                      {getStatusIcon(complaint.status)}
                      {getStatusLabel(complaint.status)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {complaint.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{complaint.category}</span>
                    <span>•</span>
                    <span>{formatDate(complaint.date)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
