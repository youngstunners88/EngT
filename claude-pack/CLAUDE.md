# EngT

English-learning Tetris built to become a Layer 3 adaptive learning game.

## Mission

Keep the current game feel:
- polished visuals
- responsive controls
- mobile support
- sound and voice
- satisfying word-completion feedback

Then evolve it into a system that learns from the player:
- track mistakes
- track speed
- track hint usage
- track mastery per word
- review weak items more often
- adapt challenge in real time

## Core rule

Do not turn the game into a dashboard or spreadsheet.
Do not make the player wait on an AI call for core gameplay.

The playable loop must stay fast, local, and reliable.

## Current codebase facts

- The app is a Next.js project.
- `app/page.tsx` routes between menu and game.
- Desktop and mobile game shells already exist.
- `hooks/use-game-state.ts` contains the current game logic.
- `data/words.ts` provides the vocabulary pools.
- `app/api/elevenlabs/speak/route.ts` is server-side only and reads `process.env.ELEVENLABS_API_KEY`.
- The client voice hook already falls back to browser speech synthesis when ElevenLabs is unavailable.

## Non-negotiable security rules

- Never hard-code secrets in client code.
- Never expose API keys in the browser.
- Keep external API use optional and failure-tolerant.
- If an API is down, the game still works.

## Routing

Before editing anything, read the matching CONTEXT.md:

- Planning and product direction: `planning/CONTEXT.md`
- Game loop and UX: `gameplay/CONTEXT.md`
- Vocabulary and learning: `curriculum/CONTEXT.md`
- Telemetry and adaptation: `ai-learning-engine/CONTEXT.md`
- Code structure and implementation: `src/CONTEXT.md`
- Testing and release process: `docs/CONTEXT.md`
- Claude behavior rules for special tasks: `skills/*.md`

## Build priority

1. Preserve the current experience.
2. Add persistence and telemetry.
3. Build the mastery model.
4. Add spaced repetition.
5. Make target word selection adaptive.
6. Only then expand into richer AI-assisted tooling.
