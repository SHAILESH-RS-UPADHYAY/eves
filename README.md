# EVES — Meeting Intelligence Dashboard

> Private, local, devastatingly accurate meeting analysis.

## What is EVES?

EVES is a personal Electron desktop app for reviewing meeting recordings.
Drop in an audio file, get a full transcript (via Deepgram), and let
Groq AI extract everything: decisions, action items, speaker intentions,
hidden agendas, sentiment by minute, power dynamics, and more.

It runs entirely on your machine. No cloud. No subscriptions.
Just you and your meetings.

## Features

- Transcription via Deepgram nova-2 (speaker diarization, smart formatting)
- AI analysis via Groq (intentions, actions, sentiment, power dynamics)
- Stealth mode: invisible during screen sharing (macOS + Windows)
- Google Drive integration: browse and download audio files from Drive
- Notion export: structured meeting pages with action item checkboxes
- Command palette (Cmd+K): quick search + actions
- Glassmorphism UI with animated liquid background

---

## Setup

### Step 1: Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/eves.git
cd eves
npm install
```

### Step 2: Get API Keys

Deepgram (for transcription):
1. Go to: https://console.deepgram.com
2. Create a new API key
3. You are already a subscriber — use nova-2 model

Groq (for AI analysis):
1. Go to: https://console.groq.com
2. API Keys → Create API Key
3. Pay-as-you-go — very cheap, ~$0.001 per analysis

### Step 3: Enter API keys in the app

Launch the app (see below), then:
- Settings → API Keys → paste your Deepgram and Groq keys → Save
- Keys are stored encrypted locally using electron-store.

### Step 4: Connect integrations (optional)

Settings → Integrations → Re-authenticate
- Google Drive MCP: authenticate your Google account
- Notion MCP: connect your Notion workspace

MCP Endpoints (pre-configured, read-only):
- Google Drive: https://drivemcp.googleapis.com/mcp/v1
- Notion: https://mcp.notion.com/mcp

---

## Run in Development

```bash
npm run dev
```

## Build for Distribution

```bash
npm run build && npm run package
```

Outputs: `dist/EVES.dmg` (macOS) or `dist/EVES-Setup.exe` (Windows)

## Website (Landing Page)

```bash
cd website
npm install
npm run dev      # local preview at localhost:5173
npm run build    # build for GitHub Pages → website/dist/
```

---

## Keyboard Shortcuts

| Shortcut              | Action                  |
|-----------------------|-------------------------|
| Cmd/Ctrl + K          | Open Command Palette    |
| Cmd/Ctrl + U          | Upload Recording        |
| Cmd/Ctrl + N          | Export to Notion        |
| Cmd/Ctrl + ,          | Open Settings           |
| Cmd/Ctrl + Shift + S  | Toggle Stealth Mode     |
| Cmd/Ctrl + Shift + E  | Show / Hide Window      |
| Cmd/Ctrl + F          | Search Transcripts      |
| Space                 | Play / Pause Audio      |
| J                     | Seek Back 5 seconds     |
| L                     | Seek Forward 5 seconds  |
| ?                     | Show All Shortcuts      |
| Escape                | Close Modal / Palette   |

---

## Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Desktop      | Electron 32                 |
| Frontend     | React 18 + TypeScript 5     |
| Build        | electron-vite + Vite 5      |
| Styling      | Tailwind CSS + custom CSS   |
| Animation    | Framer Motion 11            |
| Waveform     | WaveSurfer.js 7             |
| Charts       | Recharts                    |
| State        | Zustand 5                   |
| Data         | TanStack Query 5            |
| Storage      | electron-store 10           |
| Transcribe   | Deepgram SDK v3             |
| AI Analysis  | Groq SDK (llama-3.1-70b)    |
| Drive MCP    | drivemcp.googleapis.com     |
| Notion MCP   | mcp.notion.com              |
| 3D Website   | Three.js + R3F + GSAP       |

---

MIT License — Personal use only.
