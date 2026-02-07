# ForgeAI – Full-Stack Base44-Style AI App Builder

ForgeAI is a **production-ready AI-powered application builder** inspired by tools like **Base44, Lovable, Bolt.new, and Replit**.

It allows users to generate complete web applications using **prompts and design screenshots**, preview them instantly, and (for Pro users) edit the generated code inline.

---

## ✨ Features

- 🧠 Prompt-based app generation
- 🖼️ Design-to-code via screenshot upload
- ⚡ Instant live preview (no local setup)
- ✏️ Monaco Editor (VS Code engine)
- 🔐 Subscription-based access (Free / Pro)
- 🔄 Background workflows with Inngest
- 🧪 Secure code execution using E2B sandbox
- 🚀 Production deployment ready

---

## 🏗 Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | Next.js (App Router)               |
| API             | Elysia.js (End-to-End Type Safety) |
| Background Jobs | Inngest                            |
| AI Models       | OpenAI, Gemini, Anthropic          |
| Database        | PostgreSQL (Neon)                  |
| ORM             | Prisma                             |
| Auth & Billing  | Clerk                              |
| UI              | Shadcn/UI + Tailwind CSS           |
| Code Execution  | E2B Sandbox                        |
| Editor          | Monaco Editor                      |

---

## Env Variables

- DATABASE_URL=""
- UPLOADTHING_TOKEN=""
- OPENAI_API_KEY=""
- E2B_API_KEY=""
- ANTHROPIC_API_KEY=""
- GEMINI_API_KEY=""
- UNSPLASH_API_KEY=""
- UNSPLASH_SECRET=""
- CLERK_PUBLISHABLE_KEY=""
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
- CLERK_SECRET_KEY=""
- NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
- NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
- NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
- NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
- NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
- NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"

## 🧪 Example Prompts

```text
Build a modern SaaS landing page with pricing, FAQ, and newsletter signup.
```
