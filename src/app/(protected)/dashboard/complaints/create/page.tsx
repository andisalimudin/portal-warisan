"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, MapPin, Camera, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateComplaintPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    fullName?: string;
    phoneNumber?: string;
    dun?: string | null;
    parliament?: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("warisan_user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        id?: string;
        fullName?: string;
        phoneNumber?: string;
        dun?: string | null;
        parliament?: string | null;
      };
      setCurrentUser(parsed);
    } catch {
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body: any = {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location,
      };

      if (imageUrl) {
        body.imageUrl = imageUrl;
      }

      if (currentUser?.id) {
        body.reporterId = currentUser.id;
        body.reporterName = currentUser.fullName;
        body.reporterPhone = currentUser.phoneNumber;
        body.area = currentUser.dun || currentUser.parliament || undefined;
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Gagal menghantar aduan');
      }

      alert("Aduan berjaya dihantar! WhatsApp AI akan memproses aduan anda sebentar lagi.");
      
      router.push('/dashboard/complaints');
    } catch (error) {
      console.error(error);
      alert("Ralat semasa menghantar aduan. Sila cuba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/complaints", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat naik gambar.");
      }

      setImageUrl(data.url);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Ralat semasa memuat naik gambar. Sila cuba lagi.");
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai Aduan
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Hantar Aduan Baru</h1>
        <p className="text-gray-500">Butiran aduan anda akan disalurkan kepada wakil kawasan yang bertugas.</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-orange-800">
          <p className="font-semibold mb-1">Peringatan Penting</p>
          <p>Sila pastikan maklumat yang diberikan adalah benar. Aduan palsu boleh dikenakan tindakan. Keutamaan diberikan kepada isu-isu kritikal yang melibatkan keselamatan awam.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Kategori Aduan</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 focus:border-warisan-500 focus:ring-warisan-500"
            required
          >
            <option value="">Pilih Kategori</option>
            <option value="INFRASTRUKTUR">Infrastruktur (Jalan/Lampu/Parit)</option>
            <option value="KEBAJIKAN">Kebajikan & Bantuan</option>
            <option value="KESELAMATAN">Keselamatan & Jenayah</option>
            <option value="ALAM_SEKITAR">Kebersihan & Alam Sekitar</option>
            <option value="LAIN">Lain-lain</option>
          </select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tajuk Aduan</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Jalan Berlubang di hadapan SK Sungai Manila"
            className="w-full rounded-lg border-gray-300 focus:border-warisan-500 focus:ring-warisan-500"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Butiran Lanjut</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Sila nyatakan lokasi tepat, tarikh kejadian, dan perincian masalah..."
            className="w-full rounded-lg border-gray-300 focus:border-warisan-500 focus:ring-warisan-500"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Lokasi Kejadian</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Alamat atau nama tempat"
              className="w-full pl-10 rounded-lg border-gray-300 focus:border-warisan-500 focus:ring-warisan-500"
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Bukti Bergambar (Pilihan)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={handleClickUpload}
          >
            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Pratonton aduan"
                  className="max-h-40 rounded-lg object-contain"
                />
                <p className="text-xs text-gray-500">
                  Klik untuk tukar gambar. PNG, JPG sehingga 5MB.
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Klik untuk muat naik gambar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG sehingga 5MB
                </p>
              </>
            )}
          </div>
          {uploadingImage && (
            <p className="text-xs text-gray-500">
              Memuat naik gambar...
            </p>
          )}
          {imageUrl && !uploadingImage && (
            <p className="text-xs text-green-600">
              Gambar berjaya dimuat naik.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-warisan-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-warisan-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>Menghantar...</>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Hantar Aduan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
