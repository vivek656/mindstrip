<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MindStrip Agent Guidelines & Operating Protocols

Welcome, Agent. You are contributing to **MindStrip**, a web application built for the **Meta Global AI Developer Hackathon**. When working in this codebase, you MUST adhere strictly to the following rules:

---

## 1. Keep `memory.md` Updated
- Always write something useful and actionable to `memory.md` whenever you complete a feature, discover a critical dependency detail, or define an architectural convention.
- Other agents or sessions rely on `memory.md` to pick up work seamlessly without repeating discovery steps.

## 2. Zero-Secret Policy (CRITICAL)
- **DO NOT add any secret keys, API tokens, passwords, or personal credentials** to ANY file in this repository (code, markdown, comments, logs, or documentation).
- Any API keys for Meta Model API, Fireworks, Baseten, or Modal must be loaded exclusively via client-side ephemeral in-memory state or `.env.local` (which is strictly listed in `.gitignore`).
- Verify before any commit or edit that no keys, tokens, or credentials are hardcoded or leaked.

## 3. Consult `docs/idea.md` & `docs/functionalities/`
- Before designing new interfaces or altering existing logic, reference:
  - [`docs/idea.md`](docs/idea.md): The project thesis, problem statement, and hackathon criteria.
  - [`docs/functionalities/`](docs/functionalities/): Granular functional requirements for each subsystem.

## 4. Documentation Integrity & Code Quality
- Preserve existing comments and docstrings.
- Ensure all components are fully typed with TypeScript.
- Verify production build cleanliness with `npm run build` before completing major tasks.
