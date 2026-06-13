# Persistence

The game currently behaves like a session-first game.
Layer 3 requires persistent memory.

Persist:
- mastered words
- weak words
- recent failures
- review schedule
- recent session summaries
- player preferences

Preferred storage shape:
- local-first for quick wins
- server-side later if accounts are added

Rule:
Do not make persistence a dependency for basic play.
If storage fails, the game should still run.
