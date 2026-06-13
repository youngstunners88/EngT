# EngT Claude Pack

This folder is a Claude-ready operating system for the English-learning Tetris repo.

What this pack does:
- Preserves the current polished game feel
- Adds Layer 3 learning-system direction
- Documents the API boundary so secrets stay server-side
- Gives Claude a routing map for planning, gameplay, curriculum, AI-learning, and implementation work

How to use it:
1. Copy `CLAUDE.md` into the repository root.
2. Copy the folder structure alongside the codebase.
3. Point Claude Code at the repo root and let it read the relevant CONTEXT.md file before editing.
4. Keep gameplay local and deterministic; use external APIs only for optional services like TTS or content generation.

Important:
- Do not place API keys in client code.
- Do not make core gameplay depend on a live model call.
- Keep the current visual polish, audio, and mobile support.
- Add telemetry before adding adaptive features.
