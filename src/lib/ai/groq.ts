
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function generateWithGroq(prompt: string): Promise<string | null> {
  if (!groq) {
    console.warn("⚠️ GROQ_API_KEY not found. Skipping Groq.");
    return null;
  }

  try {
    console.log("🚀 Trying GROQ (llama-3.3-70b-versatile)...");
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content || null;
    if (text) console.log("✅ GROQ success!");
    return text;
  } catch (error) {
    console.error("❌ GROQ failed:", error);
    return null;
  }
}
