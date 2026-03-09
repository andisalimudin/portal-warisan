import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateLetter(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("AI GENERATION ERROR:", error);
    return "Maaf, sistem AI tidak dapat menjana surat sekarang. Sila cuba lagi sebentar lagi.";
  }
}
