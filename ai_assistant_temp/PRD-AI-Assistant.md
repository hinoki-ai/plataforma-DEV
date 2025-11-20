# PRD: Read‑Only AI Assistant — Groq + Llama 3 (Vercel + Convex)

Summary:
Build a low-cost, ultra-fast, read-only AI assistant for your school SaaS. It will answer only `how / where / why` questions using your website content (RAG). The stack: Vercel (frontend) + Convex (backend + vector DB) + Groq-hosted Llama 3.1 (cheap, fast). The assistant NEVER performs writes or triggers admin actions.

Goals:

- Provide accurate, concise answers to user questions about the platform using only on-site content.
- Guarantee read‑only behaviour (no DB writes, no admin effects).
- Keep runtime costs extremely low and latency sub-second where possible.
- Harden against jailbreaks and social engineering.

(Full PRD and tasklist adapted from the previous conversation.)
