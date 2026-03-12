
"use server";

import { generateCopywriting } from "@/lib/ai";

export async function generateCopywritingAction(formData: FormData) {
  const topic = formData.get("topic") as string;
  const points = formData.get("points") as string;
  const tone = formData.get("tone") as string;
  const platform = formData.get("platform") as string;
  const imageFile = formData.get("image") as File | null;

  // Validation
  if (!topic) return { success: false, error: "Sila masukkan tajuk atau topik." };

  let imageBase64: string | undefined;
  let mimeType: string | undefined;

  if (imageFile && imageFile.size > 0) {
    // Validate image type/size if needed
    if (imageFile.size > 5 * 1024 * 1024) return { success: false, error: "Saiz gambar terlalu besar (maks 5MB)." };
    
    const buffer = await imageFile.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
    mimeType = imageFile.type;
  }

  const prompt = `
Sila hasilkan satu teks copywriting yang menarik, profesional, dan berimpak tinggi untuk ${platform || "media sosial"}.

Topik: ${topic}
${points ? `Isi Penting: ${points}` : ""}
${tone ? `Nada/Gaya Bahasa: ${tone}` : ""}

Arahan:
1. Gunakan Bahasa Melayu yang natural dan menarik.
2. Sertakan emoji yang sesuai.
3. Gunakan perenggan pendek supaya mudah dibaca.
4. Sertakan Call-to-Action (CTA) yang jelas di akhir.
5. Jika ada gambar yang disertakan, huraikan sedikit kaitan gambar dengan topik dalam teks (jika relevan).
`;

  try {
    const content = await generateCopywriting(prompt, imageBase64, mimeType);
    return { success: true, content };
  } catch (error) {
    console.error("Copywriting Action Error:", error);
    return { success: false, error: "Gagal menjana copywriting." };
  }
}
