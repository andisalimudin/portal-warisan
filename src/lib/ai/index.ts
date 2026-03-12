
import { generateWithGroq } from "./groq";
import { generateWithGemini, generateCopywritingWithGemini } from "./gemini";
import { generateWithOpenRouter } from "./openrouter";

export async function generateLetter(prompt: string): Promise<string> {
  // 1. Try GROQ (Fastest & Best Logic)
  const groqResult = await generateWithGroq(prompt);
  if (groqResult) return groqResult;

  // 2. Try GEMINI (Google ecosystem)
  const geminiResult = await generateWithGemini(prompt);
  if (geminiResult) return geminiResult;

  // 3. Try OPENROUTER (Fallback to Mistral/others)
  const openRouterResult = await generateWithOpenRouter(prompt);
  if (openRouterResult) return openRouterResult;

  // 4. All failed
  console.error("🔥 ALL AI SERVICES FAILED.");
  return "Maaf, sistem AI sedang sibuk atau mengalami gangguan teknikal. Sila cuba sebentar lagi.";
}

export async function generateCopywriting(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
  // 1. If Image is provided, force Gemini (as Groq Llama 3 is text-only usually)
  if (imageBase64 && mimeType) {
    console.log("📸 Image detected, using Gemini Multimodal...");
    const geminiResult = await generateCopywritingWithGemini(prompt, imageBase64, mimeType);
    if (geminiResult) return geminiResult;
    
    // Fallback? OpenRouter supports some vision models but let's stick to Gemini for now as primary.
    // If Gemini fails with image, maybe try text-only fallback?
    console.warn("⚠️ Gemini Vision failed. Falling back to text-only generation (ignoring image)...");
  }

  // 2. Text-only flow (same as letter generation but specific for copywriting)
  // Try GROQ
  const groqResult = await generateWithGroq(prompt);
  if (groqResult) return groqResult;

  // Try GEMINI
  const geminiResult = await generateWithGemini(prompt);
  if (geminiResult) return geminiResult;

  // Try OPENROUTER
  const openRouterResult = await generateWithOpenRouter(prompt);
  if (openRouterResult) return openRouterResult;

  return "Maaf, sistem AI tidak dapat menjana copywriting sekarang.";
}
