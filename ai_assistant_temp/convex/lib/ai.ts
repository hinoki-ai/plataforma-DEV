import OpenAI from "openai";
import type { ActionCtx } from "../_generated/server";

// Initialize OpenAI client for Embeddings (usually OpenAI)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize OpenAI client for Chat (using Groq)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const embed = async (ctx: ActionCtx, model: string, text: string) => {
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set. Returning mock embedding.");
    return new Array(1536).fill(0).map(() => Math.random());
  }

  const response = await openai.embeddings.create({
    model: model || "text-embedding-3-large",
    input: text,
  });
  return response.data[0].embedding;
};

export const ai = {
  chat: async (
    ctx: ActionCtx,
    model: string,
    args: { messages: any[]; max_tokens?: number },
  ) => {
    // Check if API key is set
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set. Returning mock response.");
      return {
        text: "I'm ready to help! Please set your GROQ_API_KEY in the Convex dashboard to get real answers.",
      };
    }

    const response = await groq.chat.completions.create({
      model: model || "llama3-8b-8192",
      messages: args.messages,
      max_tokens: args.max_tokens || 512,
    });

    return {
      text: response.choices[0].message.content || "",
    };
  },
};
