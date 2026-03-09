import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Amaran: GEMINI_API_KEY tidak ditetapkan dalam environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateLetter(prompt: string) {
  try {
    // Use gemini-1.5-flash for speed and efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Ralat menjana surat dengan Gemini:", error);
    
    // Fallback to gemini-1.5-pro if flash fails
    try {
      console.log("Mencuba model fallback: gemini-1.5-pro...");
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (fallbackError) {
      console.error("Fallback model failed:", fallbackError);
      throw new Error("Gagal menjana surat. Sila pastikan API Key adalah sah dan kuota mencukupi.");
    }
  }
}
