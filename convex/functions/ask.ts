import { action, internalQuery } from "../_generated/server"
import { v } from "convex/values"
import { ai, embed } from "../lib/ai"
import { internal } from "../_generated/api"

const refusalText =
  "I can only answer HOW, WHERE and WHY questions. I cannot perform or instruct any modifications, deletions, or other actions."

function isAllowed(question: string) {
  if (!question || typeof question !== "string") return false
  const q = question.trim().toLowerCase()

  // Must begin with how/where/why or be a polite variant:
  const starts = q.startsWith("how ") || q.startsWith("where ") || q.startsWith("why ")
  if (!starts) return false

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
  ]
  for (const f of forbidden) {
    if (q.includes(f)) return false
  }

  return true
}

const SYSTEM_PROMPT = [
  "You are a read-only assistant.",
  "Answer ONLY HOW, WHERE, and WHY questions using ONLY the provided context.",
  "Do NOT suggest or instruct any actions that modify data or systems.",
  "If the question is outside HOW/WHERE/WHY or if context is insufficient, refuse politely.",
].join(" ")

export const search = internalQuery({
  args: { embedding: v.array(v.float64()) },
  handler: async (ctx, { embedding }) => {
    try {
      // For now, just return a few pages as a simple implementation
      // TODO: Implement proper vector search when available
      const results = await ctx.db.query("pages").take(5)
      return results
    } catch (e) {
      console.error("Search failed:", e)
      return []
    }
  },
})

export const chat = action({
  args: { question: v.string() },
  handler: async (ctx, { question }) => {
    if (!isAllowed(question)) {
      return refusalText
    }

    // Compute embedding for the question
    const qVector = await embed(ctx, "text-embedding-3-large", question)

    const results = await ctx.runQuery(internal.functions.ask.search, { embedding: qVector })

    const context = results.map((r: any) => `URL: ${r.url}\n${r.content}`).join("\n\n---\n\n")

    // Call the LLM (provider and model configured in Convex)
    const response = await ai.chat(ctx, "llama3-8b-8192", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Context:\n${context}\n\nQuestion:\n${question}` },
      ],
      // keep responses concise
      max_tokens: 512,
    })

    // Basic safety: strip any suspicious instruction-like lines (best-effort)
    const text = response.text.replace(/(^|\n)\s*(sudo|rm\s+-rf|curl|wget|psql|mysql|vault|gcloud)\b.*$/gi, "")

    return text
  },
})
