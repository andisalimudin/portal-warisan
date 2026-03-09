import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Amaran: GEMINI_API_KEY tidak ditetapkan dalam environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Senarai model yang disokong untuk fallback
const SUPPORTED_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export async function generateLetter(prompt: string) {
  let lastError: any = null;

  for (const modelName of SUPPORTED_MODELS) {
    try {
      console.log(`Mencuba menjana surat menggunakan model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("Respon kosong daripada model.");
      }

      console.log(`Berjaya menjana surat dengan model: ${modelName}`);
      return text;
    } catch (error) {
      console.error(`Gagal dengan model ${modelName}:`, error);
      lastError = error;
      // Teruskan ke model seterusnya dalam loop
      continue;
    }
  }

  // Jika semua model gagal
  console.error("Semua model Gemini gagal menjana surat. Ralat terakhir:", lastError);
  throw new Error("Gagal menjana surat dengan semua model AI yang tersedia. Sila pastikan API Key sah dan kuota mencukupi.");
}
