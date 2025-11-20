import { action, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { ai, embed } from "../lib/ai";
import { internal } from "../_generated/api";

const refusalText =
  "I can only help with questions about using the Plataforma Astral educational platform. I cannot perform modifications, access private data, or provide administrative functions.";

function isAllowed(question: string) {
  if (!question || typeof question !== "string") return false;
  const q = question.trim().toLowerCase();

  // Allow broader question types about platform usage, features, and navigation
  const allowedStarts = [
    "how ",
    "what ",
    "where ",
    "why ",
    "when ",
    "can i ",
    "do i ",
    "is there ",
    "does ",
    "are there ",
    "help with ",
    "tell me about ",
    "explain ",
    "show me ",
    "guide me ",
    "i need to ",
    "i want to ",
  ];

  const startsAllowed = allowedStarts.some((start) => q.startsWith(start));
  if (!startsAllowed) return false;

  // Blocklist of dangerous verbs/phrases and sensitive topics
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
    "secret",
    "master",
    "admin",
    "superuser",
    "root",
    "hack",
    "exploit",
    "bypass",
    "override",
    "force",
    "break",
    "crash",
    "database",
    "server",
    "backend",
    "code",
    "source",
    "config",
    "settings",
    "api key",
    "token",
    "session",
    "cookie",
    "cache",
    "log",
    "debug",
  ];

  for (const f of forbidden) {
    if (q.includes(f)) return false;
  }

  return true;
}

const SYSTEM_PROMPT = [
  "You are Cognito, a helpful read-only assistant for Plataforma Astral.",
  "Help users understand and navigate the educational platform using the provided context.",
  "Answer questions about features, navigation, usage, and general platform information.",
  "Do NOT suggest or instruct any actions that modify data, access private information, or perform administrative tasks.",
  "Keep responses helpful, friendly, and focused on user experience.",
  "If you cannot help with a question or lack sufficient context, suggest contacting support or checking the documentation.",
].join(" ");

export const search = internalQuery({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, { embedding }) => {
    try {
      // For now, use basic query until vector search is properly configured
      // Filter out master/admin content
      const results = await ctx.db
        .query("pages")
        .filter((q: any) => q.neq(q.field("url"), "master"))
        .filter((q: any) => q.neq(q.field("url"), "admin"))
        .take(5);
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
    try {
      if (!isAllowed(question)) {
        return refusalText;
      }

      // Add timeout handling for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), 25000); // 25s timeout to stay under Convex limit
      });

      const chatPromise = async () => {
        // Step 1: Compute embedding for the question with error handling
        let qVector;
        try {
          qVector = await embed(ctx, "text-embedding-3-large", question);
        } catch (embedError) {
          console.error("Embedding computation failed:", embedError);
          // Fall back to mock embedding if OpenAI fails
          qVector = new Array(1536).fill(0).map(() => Math.random());
        }

        // Step 2: Search for relevant context with timeout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results: any[] = [];
        try {
          results = await ctx.runQuery(internal.functions.ask.search, {
            embedding: qVector,
          });
        } catch (searchError) {
          console.error("Search failed:", searchError);
          results = []; // Continue without context if search fails
        }

        // Step 3: Build context and call AI
        const context = results
          .map((r: any) => `URL: ${r.url}\n${r.content}`)
          .join("\n\n---\n\n");

        const response = await ai.chat(ctx, "llama-3.1-8b-instant", {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Context:\n${context}\n\nQuestion:\n${question}`,
            },
          ],
          max_tokens: 512,
        });

        // Basic safety: strip any suspicious instruction-like lines
        const text = response.text.replace(
          /(^|\n)\s*(sudo|rm\s+-rf|curl|wget|psql|mysql|vault|gcloud)\b.*$/gi,
          "",
        );

        return text;
      };

      // Race between the operation and timeout
      return await Promise.race([chatPromise(), timeoutPromise]);
    } catch (error) {
      console.error("Chat action failed:", error);
      if (error instanceof Error) {
        if (
          error.message.includes("timed out") ||
          error.message.includes("Connection lost")
        ) {
          return "Lo siento, la operación tomó demasiado tiempo. ¿Puedes reformular tu pregunta de manera más específica?";
        }
      }
      return "Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo.";
    }
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
5. ONLY respond in Spanish or English - no other languages
6. Use Spanish for Spanish-speaking users, English otherwise
7. Don't make assumptions about user capabilities
8. If you can't help with something specific, guide them to the right resources

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
      // Add timeout handling for the AI call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI response timed out")), 20000); // 20s timeout
      });

      const aiPromise = ai.chat(ctx, "llama-3.1-8b-instant", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);

      return {
        success: true,
        response: (response as any).text || response,
      };
    } catch (error) {
      console.error("Cognito chat error:", error);

      let errorMessage =
        "Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?";
      let errorType = "unknown";

      if (error instanceof Error) {
        if (
          error.message.includes("timed out") ||
          error.message.includes("timeout")
        ) {
          errorMessage =
            "La respuesta tomó demasiado tiempo. ¿Puedes reformular tu mensaje?";
          errorType = "timeout";
        } else if (error.message.includes("rate limit")) {
          errorMessage =
            "Demasiadas solicitudes. Por favor, espera un momento antes de continuar.";
          errorType = "rate_limit";
        } else if (error.message.includes("Connection lost")) {
          errorMessage =
            "Se perdió la conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
          errorType = "connection";
        }
      }

      return {
        success: false,
        response: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
        errorType,
      };
    }
  },
});
