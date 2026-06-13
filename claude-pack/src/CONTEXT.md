# Source Context

Purpose:
Tell Claude how to work inside the codebase safely.

Current code map:
- `app/page.tsx` is the entry point
- `components/tetris-game.tsx` is the desktop shell
- `components/mobile-tetris-game.tsx` is the mobile shell
- `hooks/use-game-state.ts` contains the main game logic
- `data/words.ts` contains the vocabulary lists
- `data/pieces.ts` contains Tetris piece templates
- `hooks/use-audio.ts`, `hooks/use-speech.ts`, and `hooks/use-background-music.ts` handle presentation audio
- `hooks/use-elevenlabs-voice.ts` handles voice with fallback
- `app/api/elevenlabs/speak/route.ts` is the server-side TTS boundary

Implementation rules:
- preserve current behavior unless a change is clearly better
- keep logic in hooks and data files, not in UI components
- add types for new state
- avoid hard-coding secrets
- keep mobile and desktop in sync
