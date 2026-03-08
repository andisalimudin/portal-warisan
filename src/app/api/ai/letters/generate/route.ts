import { NextResponse } from "next/server";
import { generateLetter } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      senderName, senderPosition, senderOrg, senderAddress,
      receiverName, receiverPosition, receiverOrg, receiverAddress,
      title, purpose, points
    } = body;

    const prompt = `
      Anda adalah pembantu profesional untuk menulis surat rasmi dalam Bahasa Melayu.
      
      Berdasarkan maklumat berikut, hasilkan surat rasmi yang profesional dan lengkap menggunakan format surat rasmi Malaysia.
      
      Maklumat Pengirim:
      Nama: ${senderName}
      Jawatan: ${senderPosition}
      Organisasi: ${senderOrg}
      Alamat: ${senderAddress || "Tidak dinyatakan"}
      
      Maklumat Penerima:
      Nama: ${receiverName}
      Jawatan: ${receiverPosition}
      Organisasi: ${receiverOrg}
      Alamat: ${receiverAddress}
      
      Tajuk Surat: ${title}
      
      Tujuan Surat: ${purpose}
      
      Isi Penting:
      ${points}
      
      Sila hasilkan output dalam format HTML (gunakan tag <p>, <br>, <strong>, dsb) supaya mudah dipaparkan dalam rich text editor. Jangan sertakan tag <html> atau <body>, hanya kandungan surat sahaja.
      
      Gunakan struktur berikut:
      <div style="text-align: right;">Tarikh: [Tarikh Hari Ini]</div>
      <br>
      <div>
        <strong>${receiverName}</strong><br>
        ${receiverPosition}<br>
        ${receiverOrg}<br>
        ${receiverAddress.replace(/\n/g, '<br>')}
      </div>
      <br>
      <div>Tuan/Puan,</div>
      <br>
      <div><strong>${title.toUpperCase()}</strong></div>
      <br>
      <div>Merujuk kepada perkara di atas,</div>
      <br>
      [Isi kandungan surat yang lengkap dan profesional berdasarkan tujuan dan isi penting]
      <br>
      <div>Sekian, terima kasih.</div>
      <br>
      <div>"BERKHIDMAT UNTUK NEGARA"</div>
      <br>
      <div>Saya yang menjalankan amanah,</div>
      <br><br><br>
      <div><strong>(${senderName})</strong></div>
      <div>${senderPosition}</div>
      <div>${senderOrg}</div>
    `;

    console.log("Generating letter with prompt:", prompt);
    const generatedContent = await generateLetter(prompt);
    console.log("Generated content:", generatedContent.substring(0, 100) + "...");

    // Clean up markdown code blocks if any
    const cleanContent = generatedContent.replace(/```html/g, '').replace(/```/g, '');

    return NextResponse.json({ content: cleanContent });
  } catch (error: any) {
    console.error("GENERATE_ERROR", error);
    return NextResponse.json({ error: error.message || "Gagal menjana surat" }, { status: 500 });
  }
}
