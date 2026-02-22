 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, User, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

type ComplaintTimelineItem = {
  id: string;
  status: string;
  title: string;
  note: string;
  actor: string;
  createdAt: string;
};

type ComplaintDetail = {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  description: string;
  location: string;
  area: string;
  createdAt: string;
  slaDue: string | null;
  assignedTo: string;
  reporter: {
    id: string | null;
    name: string;
    phone: string;
  };
  timeline: ComplaintTimelineItem[];
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; senderName: string; createdAt: string; content: string; senderRole: string | null }[]
  >([]);
  const [sending, setSending] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const id = String((params as any)?.id || "");
        if (!id) {
          setError("ID aduan tidak sah.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan maklumat aduan.");
          return;
        }

        setComplaint(data.complaint as ComplaintDetail);

        const msgRes = await fetch(
          `/api/complaints/${encodeURIComponent(id)}/messages`
        );
        const msgData = await msgRes.json();
        if (msgRes.ok && Array.isArray(msgData.messages)) {
          setMessages(
            msgData.messages.map((m: any) => ({
              id: String(m.id),
              senderName: String(m.senderName),
              content: String(m.content),
              createdAt: String(m.createdAt),
              senderRole: m.senderRole ? String(m.senderRole) : null,
            }))
          );
        } else if (!msgRes.ok) {
          setMessagesError(
            msgData.error || "Gagal memuatkan mesej aduan."
          );
        }
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
  }, [params]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">Baru Diterima</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">Dalam Tindakan</span>;
      case 'RESOLVED': return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Selesai</span>;
      default: return null;
    }
  };

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSendMessage() {
    if (!complaint || !message.trim()) return;
    setSending(true);
    setMessagesError(null);
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("warisan_user");
      let senderId: string | null = null;
      let senderName: string | null = null;
      let senderRole: string | null = null;
      if (raw) {
        try {
          const basic = JSON.parse(raw) as {
            id?: string;
            fullName?: string;
            role?: string;
          };
          if (basic.id) senderId = String(basic.id);
          if (basic.fullName) senderName = String(basic.fullName);
          if (basic.role) senderRole = String(basic.role);
        } catch {
        }
      }

      const res = await fetch(
        `/api/complaints/${encodeURIComponent(complaint.id)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            senderId,
            senderName,
            senderRole,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setMessagesError(data.error || "Gagal menghantar mesej.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: String(data.message.id),
          senderName: String(data.message.senderName),
          content: String(data.message.content),
          createdAt: String(data.message.createdAt),
          senderRole: data.message.senderRole
            ? String(data.message.senderRole)
            : null,
        },
      ]);
      setMessage("");
    } catch {
      setMessagesError("Ralat rangkaian semasa menghantar mesej.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai
        </Link>
        {!complaint && loading && (
          <p className="text-sm text-gray-500">
            Memuatkan maklumat aduan...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
        {complaint && (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm text-gray-500">
                  {complaint.ticketId}
                </span>
                {getStatusBadge(complaint.status)}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {complaint.title}
              </h1>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                Sasaran Selesai (SLA)
              </div>
              <div className="font-mono font-bold text-blue-900">
                {complaint.slaDue
                  ? formatDateTime(complaint.slaDue)
                  : "Tidak ditetapkan"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {complaint && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Butiran Aduan
                    </h3>
                    <p className="text-gray-900 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Lokasi
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {complaint.location}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Tarikh Laporan
                      </h3>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(complaint.createdAt)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Mock Image */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lampiran</h3>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Gambar Lampiran (Mock)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6">Sejarah Tindakan</h3>
            {complaint && complaint.timeline.length > 0 ? (
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {complaint.timeline.map((event) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-white z-10",
                        event.status === "RESOLVED"
                          ? "border-green-500 text-green-500"
                          : event.status === "IN_PROGRESS"
                          ? "border-blue-500 text-blue-500"
                          : "border-gray-300 text-gray-400"
                      )}
                    >
                      {event.status === "RESOLVED" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : event.status === "IN_PROGRESS" ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {event.note}
                      </p>
                      {event.actor && (
                        <div className="text-xs font-medium text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
                          Oleh: {event.actor}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Belum ada rekod tindakan untuk aduan ini.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <div className="bg-warisan-50 border border-warisan-100 rounded-xl p-6">
                <h3 className="font-bold text-warisan-900 mb-2">Wakil Bertugas</h3>
                <p className="text-sm text-warisan-700 mb-4">
                  Aduan ini sedang dipantau oleh wakil kawasan anda.
                </p>
                {complaint ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-warisan-100 shadow-sm">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {complaint.assignedTo || "Wakil kawasan"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Kawasan: {complaint.area || "N.52 Sungai Sibuga"}
                      </div>
                    </div>
                  </div>
                ) : null}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Mesej / Pertanyaan</h3>
                <div className="space-y-4 mb-4 h-64 overflow-y-auto pr-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="bg-gray-50 p-3 rounded-lg rounded-tl-none"
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        {m.senderName} • {formatDateTime(m.createdAt)}
                      </p>
                      <p className="text-sm text-gray-800">{m.content}</p>
                    </div>
                  ))}
                  {!messages.length && (
                    <p className="text-xs text-gray-500">
                      Belum ada mesej untuk aduan ini. Tulis pertanyaan anda di
                      bawah.
                    </p>
                  )}
                </div>
                {messagesError && (
                  <p className="text-xs text-red-600 mb-2">
                    {messagesError}
                  </p>
                )}
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tulis mesej..." 
                        className="flex-1 text-sm rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                      className="p-2 bg-warisan-600 text-white rounded-lg hover:bg-warisan-700 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
