
// Placeholder for OpenRouter integration
// Install: npm install openai (OpenRouter uses OpenAI SDK)
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
const openai = apiKey 
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    }) 
  : null;

export async function generateWithOpenRouter(prompt: string): Promise<string | null> {
  if (!openai) {
    console.warn("⚠️ OPENROUTER_API_KEY not found. Skipping OpenRouter.");
    return null;
  }

  try {
    console.log("🚀 Trying OPENROUTER (mistralai/mixtral-8x7b)...");
    
    const completion = await openai.chat.completions.create({
      model: "mistralai/mixtral-8x7b-instruct",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content || null;
    if (text) console.log("✅ OPENROUTER success!");
    return text;
  } catch (error) {
    console.error("❌ OPENROUTER failed:", error);
    return null;
  }
}
