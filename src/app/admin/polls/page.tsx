"use client";

import { useEffect, useState } from "react";

type PollOptionInput = {
  id: number;
  value: string;
};

export default function AdminPollsPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOptionInput[]>([
    { id: 1, value: "" },
    { id: 2, value: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("warisan_user");
      if (!raw) return;
      const user = JSON.parse(raw);
      if (user && typeof user.id === "string") {
        setAdminId(user.id);
      }
    } catch {
    }
  }, []);

  function handleOptionChange(id: number, value: string) {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, value } : opt))
    );
  }

  function handleAddOption() {
    setOptions((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((o) => o.id)) + 1 : 1;
      return [...prev, { id: nextId, value: "" }];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setError(null);
    setSuccess(null);

    const trimmedQuestion = question.trim();
    const optionValues = options
      .map((o) => o.value.trim())
      .filter((v) => v.length > 0);

    if (!trimmedQuestion || trimmedQuestion.length < 5) {
      setError("Sila masukkan soalan poll (minimum 5 aksara).");
      return;
    }

    if (optionValues.length < 2) {
      setError("Sila sediakan sekurang-kurangnya dua pilihan jawapan.");
      return;
    }

    if (!adminId) {
      setError("Sesi pentadbir tidak sah. Sila log masuk semula.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          options: optionValues,
          createdById: adminId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mencipta poll baharu.");
        return;
      }

      setSuccess("Poll baharu berjaya dicipta dan diaktifkan.");
      setQuestion("");
      setOptions([
        { id: 1, value: "" },
        { id: 2, value: "" },
      ]);
    } catch {
      setError("Ralat rangkaian semasa menghantar permintaan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tinjauan Ahli</h1>
        <p className="text-sm text-gray-600">
          Cipta poll baharu untuk dipaparkan di halaman utama dan dashboard ahli.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soalan Poll
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
              placeholder="Contoh: Apakah isu utama yang perlu diberi keutamaan di kawasan anda?"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Pilihan Jawapan
            </label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) =>
                    handleOptionChange(option.id, e.target.value)
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                  placeholder={`Pilihan ${index + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-medium text-warisan-700 hover:text-warisan-900"
            >
              + Tambah pilihan
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600">
              {success}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-warisan-900 text-white text-sm font-medium hover:bg-warisan-800 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Cipta Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

