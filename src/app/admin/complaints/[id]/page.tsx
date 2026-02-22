"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, User, Save, AlertTriangle } from "lucide-react";
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

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignee, setAssignee] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: string; senderName: string; createdAt: string; content: string; senderRole: string | null }[]
  >([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const id = String((params as any)?.id || "");
        if (!id) {
          setError("ID aduan tidak sah.");
          return;
        }

        const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan maklumat aduan.");
          return;
        }

        const detail = data.complaint as ComplaintDetail;
        setComplaint(detail);
        setStatus(detail.status);
        setPriority(detail.priority);
        setAssignee(detail.assignedTo || "");

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
          setMessageError(
            msgData.error || "Gagal memuatkan mesej aduan."
          );
        }
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan aduan.");
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [params]);

  async function handleSave() {
    if (!complaint) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(complaint.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          priority,
          assignedTo: assignee,
          note: note || undefined,
          actorName: "Admin Portal",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan perubahan.");
        return;
      }
      const detailRes = await fetch(`/api/complaints/${encodeURIComponent(complaint.id)}`);
      const detailData = await detailRes.json();
      if (detailRes.ok && detailData.complaint) {
        setComplaint(detailData.complaint as ComplaintDetail);
      }
      setNote("");
    } catch {
      setError("Ralat rangkaian semasa menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

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
    if (!complaint || !messageInput.trim()) return;
    setSendingMessage(true);
    setMessageError(null);
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
            content: messageInput,
            senderId,
            senderName,
            senderRole,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setMessageError(data.error || "Gagal menghantar mesej.");
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
      setMessageInput("");
    } catch {
      setMessageError("Ralat rangkaian semasa menghantar mesej.");
    } finally {
      setSendingMessage(false);
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai
        </Link>
        <button className="bg-warisan-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-warisan-800 flex items-center gap-2">
            <Save className="w-4 h-4" /> Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
           {/* Header Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {complaint ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-500">{complaint.ticketId}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">
                            {complaint.status}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {complaint.reporter.name}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {complaint.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDateTime(complaint.createdAt)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Memuatkan maklumat aduan...
                  </p>
                )}
           </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Butiran Lanjut</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {complaint ? complaint.description : "-"}
                </p>
                
                <h4 className="text-sm font-medium text-gray-500 mb-2">Lampiran</h4>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Gambar Lampiran (Mock)</p>
                </div>
            </div>
            
            {/* Action Log Form */}
            <div className="p-6 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4">Log Tindakan Baru</h3>
                <textarea 
                    className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500 mb-3"
                    rows={3}
                    placeholder="Catatkan tindakan yang diambil..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !complaint}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Tambah Log
                    </button>
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
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-white z-10",
                      event.status === 'RESOLVED' ? "border-green-500 text-green-500" :
                      event.status === 'IN_PROGRESS' ? "border-blue-500 text-blue-500" :
                      "border-gray-300 text-gray-400"
                    )}>
                      {event.status === 'RESOLVED' ? <CheckCircle className="w-5 h-5" /> :
                       event.status === 'IN_PROGRESS' ? <User className="w-5 h-5" /> :
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className="text-xs text-gray-500">{formatDateTime(event.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{event.note}</p>
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

        {/* Sidebar - Management */}
        <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Pengurusan Tiket</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                    >
                        <option value="PENDING">Baru Diterima</option>
                        <option value="IN_PROGRESS">Dalam Tindakan</option>
                        <option value="RESOLVED">Selesai</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keutamaan</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                    >
                        <option value="LOW">Rendah (7 Hari)</option>
                        <option value="MEDIUM">Sederhana (3 Hari)</option>
                        <option value="HIGH">Tinggi (24 Jam)</option>
                    </select>
                </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Tugasan</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ditugaskan Kepada</label>
                    <input 
                        type="text"
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500 mb-2"
                        placeholder="Nama Wakil / Jawatan"
                    />
                    <p className="text-xs text-gray-500">
                        Wakil akan menerima notifikasi tugasan ini.
                    </p>
                </div>
            </div>
            {/* Messages from Pengadu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2">
                Mesej / Pertanyaan Pengadu
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
                    Belum ada mesej daripada pengadu.
                  </p>
                )}
              </div>
              {messageError && (
                <p className="text-xs text-red-600">
                  {messageError}
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Balas mesej pengadu..."
                  className="flex-1 text-sm rounded-lg border-gray-300 focus:ring-warisan-500 focus:border-warisan-500"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="px-3 py-2 bg-warisan-600 text-white rounded-lg text-sm hover:bg-warisan-700 disabled:opacity-50"
                >
                  Hantar
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
