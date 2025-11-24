import { GoogleGenAI } from "@google/genai";

// NOTE: This assumes process.env.API_KEY is available.
// In a real production app, this should be proxied through a backend or user-provided.
// For this demo, we will gracefully fail if no key is present or use a user-provided one in UI.

let aiClient: GoogleGenAI | null = null;

export const initGemini = (apiKey: string) => {
  aiClient = new GoogleGenAI({ apiKey });
};

export const getProblemHint = async (problemTitle: string, difficulty: string): Promise<string> => {
  if (!aiClient) {
    throw new Error("API Key not configured");
  }

  const modelId = "gemini-2.5-flash"; // Efficient for text hints
  const prompt = `
    I am solving a LeetCode problem titled "${problemTitle}" which is rated as ${difficulty}.
    Without giving me the full code solution, please provide:
    1. A conceptual hint or intuition on how to approach it.
    2. Any specific data structures or algorithms that are commonly used for this type of problem.
    Keep the response concise and under 150 words.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "No hint generated.";
  } catch (error) {
    console.error("Gemini API Error", error);
    throw new Error("Failed to fetch hint from Gemini.");
  }
};
