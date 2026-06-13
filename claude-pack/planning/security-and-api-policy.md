# Security and API Policy

This repository must treat external services as optional infrastructure.

Rules:
- no API keys in client code
- no secrets committed to the repo
- server routes read secrets from environment variables only
- gameplay must not depend on a live API response
- every external call needs a fallback path

Current TTS policy:
- ElevenLabs is server-side only
- the client speaks through the API route
- if the API fails, browser speech synthesis is used
- if browser speech is unavailable, the game still runs

This policy exists to protect users from slowdowns, outages, and exposed credentials.
