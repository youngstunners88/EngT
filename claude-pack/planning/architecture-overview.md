# Architecture Overview

Current shape:
- Next.js app
- client game shell
- hook-driven game state
- separate desktop and mobile game components
- server-only ElevenLabs TTS route
- browser speech fallback

Current strengths:
- strong presentation
- clear separation of UI and logic
- reusable hooks
- easy place to add telemetry and persistence

Current gap:
- the game does not yet store a durable learner profile
- target word selection is still pool-based, not mastery-based
- there is no review scheduler

Preferred future shape:
- UI layer
- game loop layer
- learning model layer
- telemetry layer
- persistence layer
- optional AI/content tooling layer

Rule:
Do not mix the learning model directly into presentational components.
