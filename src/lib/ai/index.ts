
import { generateWithGroq } from "./groq";
import { generateWithGemini } from "./gemini";
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
