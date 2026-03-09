import { generateLetter as generateAiLetter } from "./ai";

export async function generateLetter(prompt: string) {
  // Backward compatibility wrapper
  return generateAiLetter(prompt);
}
