import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateLetter(prompt: string) {
  // 1. Cuba Gemini (Pelbagai model)
  const geminiModels = ["gemini-1.5-flash", "gemini-pro"];
  
  for (const modelName of geminiModels) {
    try {
      console.log(`Mencuba model Gemini: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gagal dengan Gemini ${modelName}:`, error);
      continue;
    }
  }

  // 2. Cuba Groq (Llama 3 sebagai fallback)
  try {
    console.log("Mencuba fallback Groq (llama-3.1-70b-versatile)...");
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-70b-versatile",
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Gagal dengan Groq:", error);
  }
  
  return "Maaf, sistem AI tidak dapat menjana surat sekarang (Semua model gagal). Sila cuba lagi sebentar lagi.";
}
