# English Learning Tetris

> **AI-Powered Language Learning Through Gameplay** — Learn vocabulary while playing Tetris. Words fall like blocks; type them before they stack up.

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## The 3-Layer AI Architecture

This app implements the **Claude Code workspace pattern**:

### Layer 1 (Book) — Individual AI Outputs
- Word definitions from curated lists
- AI-generated example sentences
- Memory hooks for difficult words

### Layer 2 (Movie) — Orchestrated Learner Flows
- **Adaptive Difficulty**: Words selected based on your mastery level
- **Spaced Repetition**: SM-2 algorithm schedules reviews optimally
- **Progress Tracking**: Per-word stats (exposures, completions, misses)

### Layer 3 (Video Game) — Systems That Learn
- **AI Coach Briefing**: Pre-game personalized coaching based on your history
- **Struggle Detection**: Identifies words you miss frequently
- **Memory Hooks**: AI generates vivid associations for difficult words

---

## Features

### Core Gameplay
- 🎮 Classic Tetris mechanics with a twist — words instead of blocks
- ⌨️ Type the falling word to "clear" it before it stacks
- 📈 Three difficulty levels: Easy, Medium, Hard
- 🎯 Increasing speed as you progress

### AI-Powered Learning
- 🤖 **Pre-Game Briefing**: AI coach analyzes your progress and gives personalized tips
- 📊 **Spaced Repetition**: Words you struggle with appear more frequently
- 🧠 **Memory Hooks**: AI-generated vivid associations for difficult words
- 🗣️ **Voice Integration**: Optional ElevenLabs TTS for pronunciation practice

### Progress Tracking
- ✅ Words completed per session
- 🔥 Streak counter
- 📊 Mastery levels: New → Learning → Mastered
- 🎯 Focus words for each session

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/youngstunners88/English-Tetris.git
cd English-Tetris

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

```bash
# AI Coach API (optional, provides personalized briefings)
OPENAI_API_KEY=sk-...

# Voice Integration (optional, enables pronunciation)
ELEVENLABS_API_KEY=...
```

---

## How It Works

### 1. Select Difficulty
Choose Easy (10 common words), Medium (20 intermediate), or Hard (30 advanced).

### 2. AI Briefing (Layer 3)
The AI coach analyzes your learning history and generates a personalized briefing:
- **Today's Focus**: Specific words to practice
- **Memory Hooks**: Vivid associations for words you struggle with
- **Strategy Tips**: Based on your completion patterns

### 3. Play & Learn
- Words fall like Tetris pieces
- Type the word correctly to clear it
- Speed increases as you progress
- Difficulty adapts based on your mastery

### 4. Progress Tracking
Every interaction is logged:
- **Exposures**: How many times you've seen a word
- **Completions**: Successful typing attempts
- **Misses**: Timeouts or errors
- **Time-to-Complete**: Speed tracking

The SM-2 spaced repetition algorithm schedules reviews optimally.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks with localStorage persistence
- **AI**: OpenAI GPT-4 for coach briefings
- **Voice**: ElevenLabs for pronunciation (optional)

---

## Controls

| Key | Action |
|-----|--------|
| `←` / `→` | Move falling word |
| `↑` | Rotate piece |
| `↓` | Soft drop |
| `Space` | Hard drop |
| `P` | Pause/Resume |
| `R` | Reset game |
| `M` | Toggle music |

---

## Word Lists

| Difficulty | Word Count | Example |
|------------|------------|---------|
| Easy | 10 words | cat, dog, sun, moon |
| Medium | 20 words | happy, water, music, friend |
| Hard | 30 words | beautiful, knowledge, adventure, creative |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT © 2026 English Learning Tetris

---

**Built with the Claude Code 3-Layer Architecture** — Book → Movie → Video Game
