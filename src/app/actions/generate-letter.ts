
"use server";

import { generateLetter as generateAiLetter } from "@/lib/ai";
import { z } from "zod";

const letterSchema = z.object({
  senderName: z.string().min(1, "Nama pengirim diperlukan"),
  senderPosition: z.string().min(1, "Jawatan pengirim diperlukan"),
  senderOrg: z.string().min(1, "Organisasi pengirim diperlukan"),
  
  recipientName: z.string().min(1, "Nama penerima diperlukan"),
  recipientPosition: z.string().min(1, "Jawatan penerima diperlukan"),
  recipientOrg: z.string().min(1, "Organisasi penerima diperlukan"),
  recipientAddress: z.string().min(1, "Alamat penerima diperlukan"),
  
  title: z.string().min(1, "Tajuk surat diperlukan"),
  purpose: z.string().min(1, "Tujuan surat diperlukan"),
  points: z.string().min(1, "Isi penting diperlukan"),
});

export type LetterInput = z.infer<typeof letterSchema>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHtmlFragment(value: string) {
  const withoutScripts = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  const withoutOnAttrs = withoutScripts
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  const withoutJsUrls = withoutOnAttrs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, "href=\"#\"")
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
    .replace(/src\s*=\s*"javascript:[^"]*"/gi, "")
    .replace(/src\s*=\s*'javascript:[^']*'/gi, "");
  return withoutJsUrls.trim();
}

function formatMalayDate(date: Date) {
  const months = [
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()] || "";
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function normalizePoints(points: string) {
  const lines = points
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*•]\s*/, ""));
  if (lines.length === 0) return "";
  return lines.map((l) => `- ${l}`).join("\n");
}

function buildLetterHtml(input: LetterInput, aiBodyHtml: string) {
  const dateText = formatMalayDate(new Date());

  const recipientAddressHtml = escapeHtml(input.recipientAddress).replaceAll("\n", "<br>");
  const titleUpper = input.title.trim().toUpperCase();

  const safe = {
    senderName: escapeHtml(input.senderName.trim()),
    senderPosition: escapeHtml(input.senderPosition.trim()),
    senderOrg: escapeHtml(input.senderOrg.trim()),
    recipientName: escapeHtml(input.recipientName.trim()),
    recipientPosition: escapeHtml(input.recipientPosition.trim()),
    recipientOrg: escapeHtml(input.recipientOrg.trim()),
    titleUpper: escapeHtml(titleUpper),
  };

  const safeBody = sanitizeHtmlFragment(aiBodyHtml);

  return [
    `<div style="text-align: right;">Tarikh: ${escapeHtml(dateText)}</div>`,
    `<br>`,
    `<div>`,
    `  <strong>${safe.recipientName}</strong><br>`,
    `  ${safe.recipientPosition}<br>`,
    `  ${safe.recipientOrg}<br>`,
    `  ${recipientAddressHtml}`,
    `</div>`,
    `<br>`,
    `<div>Tuan/Puan,</div>`,
    `<br>`,
    `<div><strong>${safe.titleUpper}</strong></div>`,
    `<br>`,
    `<div>Merujuk kepada perkara di atas,</div>`,
    `<br>`,
    safeBody || `<p>Maaf, sistem AI sedang sibuk. Sila cuba sebentar lagi.</p>`,
    `<br>`,
    `<div>Sekian, terima kasih.</div>`,
    `<br>`,
    `<div>"BERKHIDMAT UNTUK NEGARA"</div>`,
    `<br>`,
    `<div>Saya yang menjalankan amanah,</div>`,
    `<br><br><br>`,
    `<div><strong>(${safe.senderName})</strong></div>`,
    `<div>${safe.senderPosition}</div>`,
    `<div>${safe.senderOrg}</div>`,
  ].join("\n");
}

export async function generateLetterAction(input: LetterInput) {
  try {
    const validated = letterSchema.parse(input);

    const prompt = [
      `Anda adalah penulis surat rasmi kerajaan Malaysia.`,
      ``,
      `Tugas: Hasilkan hanya ISI SURAT dalam format HTML yang profesional.`,
      `Jangan tulis tarikh, alamat penerima, kata sapaan, tajuk, penutup, slogan, atau tandatangan.`,
      `Hasilkan hanya bahagian selepas ayat "Merujuk kepada perkara di atas," dan sebelum "Sekian, terima kasih."`,
      ``,
      `Gaya penulisan: Bahasa Melayu baku, formal, profesional, tidak terlalu panjang (3 hingga 6 perenggan).`,
      `Format: HTML sahaja dengan <p>, <br>, <strong> jika perlu. Jangan gunakan Markdown.`,
      ``,
      `Maklumat rujukan:`,
      `- Tajuk: ${validated.title}`,
      `- Tujuan: ${validated.purpose}`,
      `- Isi penting (bullet):`,
      normalizePoints(validated.points),
      ``,
      `Pastikan isi surat:`,
      `- Terus kepada isu dan tujuan`,
      `- Memohon tindakan/pertimbangan yang munasabah`,
      `- Nada sopan dan jelas`,
    ].join("\n");

    console.log("[AI Action] Generating letter body...");
    const aiBody = await generateAiLetter(prompt);
    const htmlContent = buildLetterHtml(validated, aiBody);

    return { success: true, content: htmlContent };
  } catch (error) {
    console.error("[AI Action] Error:", error);
    return { success: false, error: "Gagal menjana surat. Sila cuba lagi." };
  }
}
