import { action, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { ai, embed } from "../lib/ai";
import { internal } from "../_generated/api";

const refusalText =
  "I can only answer HOW, WHERE and WHY questions. I cannot perform or instruct any modifications, deletions, or other actions.";

function isAllowed(question: string) {
  if (!question || typeof question !== "string") return false;
  const q = question.trim().toLowerCase();

  // Must begin with how/where/why or be a polite variant:
  const starts =
    q.startsWith("how ") || q.startsWith("where ") || q.startsWith("why ");
  if (!starts) return false;

  // Blocklist of dangerous verbs/phrases
  const forbidden = [
    "delete",
    "remove",
    "modify",
    "change",
    "update",
    "insert",
    "create",
    "add",
    "disable",
    "enable",
    "reset",
    "drop",
    "grant",
    "revoke",
    "edit",
    "register",
    "unregister",
    "make me admin",
    "transfer",
    "export",
    "download",
    "upload",
    "password",
    "credentials",
  ];
  for (const f of forbidden) {
    if (q.includes(f)) return false;
  }

  return true;
}

const SYSTEM_PROMPT = [
  "You are a read-only assistant.",
  "Answer ONLY HOW, WHERE, and WHY questions using ONLY the provided context.",
  "Do NOT suggest or instruct any actions that modify data or systems.",
  "If the question is outside HOW/WHERE/WHY or if context is insufficient, refuse politely.",
].join(" ");

export const search = internalQuery({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, { embedding }) => {
    try {
      // For now, just return a few pages as a simple implementation
      // TODO: Implement proper vector search when available
      const results = await ctx.db.query("pages").take(5);
      return results;
    } catch (e) {
      console.error("Search failed:", e);
      return [];
    }
  },
});

export const chat = action({
  args: { question: v.string() },
  handler: async (ctx, { question }) => {
    if (!isAllowed(question)) {
      return refusalText;
    }

    // Compute embedding for the question
    const qVector = await embed(ctx, "text-embedding-3-large", question);

    const results = await ctx.runQuery(internal.functions.ask.search, {
      embedding: qVector,
    });

    const context = results
      .map((r: any) => `URL: ${r.url}\n${r.content}`)
      .join("\n\n---\n\n");

    // Call the LLM (provider and model configured in Convex)
    const response = await ai.chat(ctx, "llama3-8b-8192", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
      // keep responses concise
      max_tokens: 512,
    });

    // Basic safety: strip any suspicious instruction-like lines (best-effort)
    const text = response.text.replace(
      /(^|\n)\s*(sudo|rm\s+-rf|curl|wget|psql|mysql|vault|gcloud)\b.*$/gi,
      "",
    );

    return text;
  },
});

export const cognitoChat = action({
  args: {
    message: v.string(),
    context: v.optional(
      v.object({
        role: v.string(),
        section: v.string(),
        userId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { message, context }) => {
    const systemPrompt = `You are Cognito, a helpful AI assistant for an educational platform called Plataforma Astral.
You help teachers, parents, administrators, and students navigate and use the platform effectively.

Current user context:
- Role: ${context?.role || "general user"}
- Section: ${context?.section || "general"}

Guidelines:
1. Be friendly, helpful, and professional
2. Provide clear, actionable guidance
3. Offer to start guided tours when users seem confused
4. Keep responses conversational but informative
5. Use Spanish for Spanish-speaking users, English otherwise
6. Don't make assumptions about user capabilities
7. If you can't help with something specific, guide them to the right resources

Platform features you can help with:
- User management and registration
- Class management and libro de clases
- Grade book and attendance tracking
- Parent communication and meetings
- Administrative functions
- Planning and curriculum
- Reports and analytics

Always end responses by offering further assistance.`;

    try {
      const response = await ai.chat(ctx, "llama3-8b-8192", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      });

      return {
        success: true,
        response: response.text,
      };
    } catch (error) {
      console.error("Cognito chat error:", error);
      return {
        success: false,
        response:
          "Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
