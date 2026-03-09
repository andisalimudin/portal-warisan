
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateWithGemini(prompt: string): Promise<string | null> {
  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY not found. Skipping Gemini.");
    return null;
  }

  // Model fallback list for Gemini internally
  const models = ["gemini-1.5-flash-002", "gemini-1.5-flash", "gemini-1.5-pro"];

  for (const modelName of models) {
    try {
      console.log(`🚀 Trying GEMINI (${modelName})...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ GEMINI success with ${modelName}!`);
        return text;
      }
    } catch (error) {
      console.error(`❌ GEMINI ${modelName} failed:`, error);
      continue;
    }
  }

  return null;
}
