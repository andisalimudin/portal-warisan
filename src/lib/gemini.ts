import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateLetter(prompt: string) {
  const models = ["gemini-1.5-flash", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`Mencuba model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gagal dengan model ${modelName}:`, error);
      continue;
    }
  }
  
  return "Maaf, sistem AI tidak dapat menjana surat sekarang. Sila cuba lagi sebentar lagi.";
}
