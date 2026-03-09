
"use server";

import { generateLetter as generateAiLetter } from "@/lib/ai";
import { z } from "zod";

const letterSchema = z.object({
  // Pengirim
  senderName: z.string().min(1, "Nama pengirim diperlukan"),
  senderPosition: z.string().min(1, "Jawatan pengirim diperlukan"),
  senderOrg: z.string().min(1, "Organisasi pengirim diperlukan"),
  
  // Penerima
  recipientName: z.string().min(1, "Nama penerima diperlukan"),
  recipientPosition: z.string().min(1, "Jawatan penerima diperlukan"),
  recipientOrg: z.string().min(1, "Organisasi penerima diperlukan"),
  recipientAddress: z.string().min(1, "Alamat penerima diperlukan"),
  
  // Kandungan
  title: z.string().min(1, "Tajuk surat diperlukan"),
  purpose: z.string().min(1, "Tujuan surat diperlukan"),
  points: z.string().min(1, "Isi penting diperlukan"),
});

export type LetterInput = z.infer<typeof letterSchema>;

export async function generateLetterAction(input: LetterInput) {
  try {
    const validated = letterSchema.parse(input);
    
    // Construct a detailed prompt for the AI
    const prompt = `
Sila tulis satu surat rasmi kerajaan Malaysia yang profesional dan lengkap berdasarkan maklumat berikut:

MAKLUMAT PENGIRIM:
Nama: ${validated.senderName}
Jawatan: ${validated.senderPosition}
Organisasi: ${validated.senderOrg}

MAKLUMAT PENERIMA:
Nama: ${validated.recipientName}
Jawatan: ${validated.recipientPosition}
Organisasi: ${validated.recipientOrg}
Alamat: ${validated.recipientAddress}

MAKLUMAT SURAT:
Tajuk: ${validated.title}
Tujuan: ${validated.purpose}
Isi-isi Penting:
${validated.points}

ARAHAN FORMAT:
1. Gunakan Bahasa Melayu baku dan formal (gaya surat rasmi kerajaan).
2. Format output MESTI dalam HTML (tanpa tag <html>, <head>, <body>).
3. Gunakan struktur berikut:
   - Tarikh hari ini di sebelah kanan (format: DD Bulan YYYY).
   - Blok alamat penerima di sebelah kiri.
   - Kata sapaan (Tuan/Puan).
   - Tajuk surat (Huruf besar, tebal).
   - Perenggan pendahuluan ("Merujuk perkara di atas...").
   - Perenggan isi (huraikan isi penting dengan ayat gramatis).
   - Perenggan penutup ("Sekian, terima kasih").
   - Slogan ("BERKHIDMAT UNTUK NEGARA").
   - Tandatangan (Nama & Jawatan pengirim).

JANGAN masukkan placeholder seperti [Tarikh] atau [Tandatangan], gunakan maklumat yang diberikan atau tarikh hari ini.
    `;

    console.log("[AI Action] Generating letter...");
    const htmlContent = await generateAiLetter(prompt);
    
    return { success: true, content: htmlContent };
  } catch (error) {
    console.error("[AI Action] Error:", error);
    return { success: false, error: "Gagal menjana surat. Sila cuba lagi." };
  }
}
