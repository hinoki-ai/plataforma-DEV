# AI Assistant Integration Guide

This guide explains how to integrate the AI Assistant into your existing Next.js + Convex project (`plataforma-DEV`).

## 1. Environment Variables

Add the following environment variables to your Convex Dashboard (Settings > Environment Variables):

- `OPENAI_API_KEY`: For generating embeddings (used in `convex/lib/ai.ts`)
- `GROQ_API_KEY`: For fast LLM inference (used in `convex/lib/ai.ts`)

## 2. Backend Files (Convex)

Copy these files into your `convex/` folder:

- `convex/schema.ts`: Ensure your schema includes the `pages` table with the vector index.
- `convex/functions/ask.ts`: The main chat logic.
- `convex/functions/loadPages.ts`: The ingestion logic.
- `convex/lib/ai.ts`: The wrapper for OpenAI and Groq clients.

## 3. Frontend Component

Copy `vercel/components/ChatWidget.tsx` to your components directory (e.g., `components/ChatWidget.tsx`).

## 4. Dependencies

Ensure your `package.json` includes:
\`\`\`bash
npm install openai convex lucide-react
\`\`\`

## 5. Usage

Import and use the `ChatWidget` in any page or layout:

\`\`\`tsx
import ChatWidget from "@/components/ChatWidget";

export default function Page() {
return (

<main>
{/_ Your existing content _/}
<div className="fixed bottom-4 right-4 z-50">
<ChatWidget />
</div>
</main>
);
}
