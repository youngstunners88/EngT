# File Map

High-value files to understand first:

- `app/page.tsx` — route selection between menu and game
- `components/main-menu.tsx` — difficulty selection and entry point
- `components/tetris-game.tsx` — desktop game shell and HUD wiring
- `components/mobile-tetris-game.tsx` — mobile variant
- `hooks/use-game-state.ts` — board, scoring, target word logic, reset flow
- `hooks/use-elevenlabs-voice.ts` — TTS client with fallback
- `app/api/elevenlabs/speak/route.ts` — server-only speech endpoint
- `data/words.ts` — current vocabulary pool
- `data/pieces.ts` — piece templates
- `types/game.ts` — state contracts

What is missing for Layer 3:
- persistent learner profile
- mastery storage
- telemetry event schema
- adaptive word selection layer
- review scheduling
