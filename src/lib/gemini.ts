import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Amaran: GEMINI_API_KEY tidak ditetapkan dalam environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateLetter(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Ralat menjana surat dengan Gemini:", error);
    throw new Error("Gagal menjana surat. Sila cuba lagi.");
  }
}
