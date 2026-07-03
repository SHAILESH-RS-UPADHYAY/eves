```


                                   ███████╗██╗   ██╗███████╗███████╗
                                   ██╔════╝██║   ██║██╔════╝██╔════╝
                                   █████╗  ██║   ██║█████╗  ███████╗
                                   ██╔══╝  ╚██╗ ██╔╝██╔══╝  ╚════██║
                                   ███████╗ ╚████╔╝ ███████╗███████║
                                   ╚══════╝  ╚═══╝  ╚══════╝╚══════╝

                                   ███╗   ███╗███████╗███████╗████████╗
                                   ████╗ ████║██╔════╝██╔════╝╚══██╔══╝
                                   ██╔████╔██║█████╗  █████╗     ██║
                                   ██║╚██╔╝██║██╔══╝  ██╔══╝     ██║
                                   ██║ ╚═╝ ██║███████╗███████╗   ██║
                                   ╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝


                                   ██╗███╗   ██╗████████╗███████╗██╗
                                   ██║████╗  ██║╚══██╔══╝██╔════╝██║
                                   ██║██╔██╗ ██║   ██║   █████╗  ██║
                                   ██║██║╚██╗██║   ██║   ██╔══╝  ██║
                                   ██║██║ ╚████║   ██║   ███████╗███████╗
                                   ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝

                              ███╗   ███╗███████╗ ██████╗ ██████╗ ██████╗
                              ████╗ ████║██╔════╝██╔════╝██╔═══██╗██╔══██╗
                              ██╔████╔██║█████╗  ██║     ██║   ██║██████╔╝
                              ██║╚██╔╝██║██╔══╝  ██║     ██║   ██║██╔══██╗
                              ██║ ╚═╝ ██║███████╗╚██████╗╚██████╔╝██║  ██║
                              ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝


         ╔══════════════════════════════════════════════════════════════════════════╗
         ║            MEETING INTELLIGENCE SYSTEM  ◆  v2.1.0                      ║
         ║            [ STEALTH ]  [ AI-POWERED ]  [ REAL-TIME ]  [ LOCAL ]       ║
         ╚══════════════════════════════════════════════════════════════════════════╝


       ┌─────────────────────────────────────────────────────────────────────────────┐
       │                                                                             │
       │   $ whoami                                                                  │
       │   > EVES — The only meeting intelligence system that sees everything         │
       │     and is invisible while doing it.                                        │
       │                                                                             │
       │   $ ./eves --what                                                            │
       │   > Real-time meeting transcription + AI summarization                      │
       │   > Runs entirely on YOUR machine — zero cloud dependency                   │
       │   > Invisible on screen share (SetWindowDisplayAffinity)                    │
       │   > Captures internal loopback (system audio) AND external mic              │
       │   > Hollywood hacker HUD interface with Matrix rain + scanlines             │
       │   > Deepgram nova-2 → Groq LLaMA-3 70B pipeline                            │
       │                                                                             │
       └─────────────────────────────────────────────────────────────────────────────┘


```

<br/>

---

## ▌ DEPLOYMENT VECTORS

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ./launch/                                                                                │
│   ├── start.vbs           ◆ VBScript launcher — zero visible terminal                     │
│   ├── start.hta           ◆ Animated HTA launcher — scanlines + grid + glow               │
│   ├── start.bat           ◆ Terminal launch — shows EVES ASCII header                     │
│   ├── stop.bat            ◆ Kill all EVES processes                                       │
│   └── "Launch EVES.bat"   ◆ One-click batch — npx electron-vite dev                       │
│                                                                                           │
│  $ npm install            ◆ Install 20+ dependencies (Electron 32, React 18,              │
│                             Deepgram SDK, Groq SDK, Zustand, Framer Motion, Recharts)     │
│  $ npm run dev            ◆ Launch both windows: Dashboard (center) + Overlay (top-right) │
│  $ npm run build          ◆ Production build → out/ directory                              │
│  $ npm run package        ◆ Package with electron-builder → standalone installer          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### API KEY ACQUISITION

```bash
$ cat ~/eves/api_keys.cfg

  ┌────────────────────────────────────────────────────────────────┐
  │  SERVICE         │  PURPOSE                │  ACQUIRE AT        │
  ├──────────────────┼─────────────────────────┼────────────────────┤
  │  Deepgram        │  Real-time transcription│  console.deepgram  │
  │                  │  (nova-2, 95%+ acc.)    │  .com              │
  ├──────────────────┼─────────────────────────┼────────────────────┤
  │  Groq            │  AI summarization       │  console.groq      │
  │                  │  (LLaMA-3.1 70B)        │  .com              │
  └──────────────────┴─────────────────────────┴────────────────────┘

  > Enter both keys in Settings → api_keys → ./save_keys
  > Keys persist locally via Conf store. Never transmitted except to respective APIs.
```

---

## ▌ CORE CAPABILITIES

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  MODULE_01.DLL  ◆  AI TRANSCRIPTION                                                  │
│  ■ Deepgram nova-2 — real-time streaming WebSocket                                   │
│  ■ 16kHz PCM audio — internal loopback + external mic                                │
│  ■ Speaker diarization — knows who said what                                         │
│  ■ Smart formatting — punctuation, paragraphs, numbers                               │
│  ■ Multi-color terminal output ⚡ green ⚡ red ⚡ cyan ⚡ yellow                       │
│                                                                                       │
│  MODULE_02.DLL  ◆  STEALTH MODE                                                      │
│  ■ setContentProtection() — WDA_EXCLUDEFROMCAPTURE active                            │
│  ■ Invisible to: OBS, Zoom, Teams, Meet, Discord, screenshots                        │
│  ■ Removed from: taskbar, Alt+Tab, window switcher                                   │
│  ■ setIgnoreMouseEvents() — click-through mode                                       │
│                                                                                       │
│  MODULE_03.DLL  ◆  AUDIO CAPTURE                                                      │
│  ■ Internal: getDisplayMedia({ audio: 'loopback' }) — captures system audio          │
│  ■ External: getUserMedia() — microphone input                                       │
│  ■ Runtime source toggle — Ctrl+Shift+O                                              │
│  ■ 16kHz PCM→Deepgram WebSocket pipeline                                            │
│                                                                                       │
│  MODULE_04.DLL  ◆  AI SUMMARIZATION                                                  │
│  ■ Groq LLaMA-3.1 70B — inference engine                                             │
│  ■ Summary extraction — what was decided, what was avoided                           │
│  ■ Intent detection — hidden agendas, unspoken concerns                              │
│  ■ Action items — who needs to do what by when                                       │
│                                                                                       │
│  MODULE_05.DLL  ◆  SESSION HISTORY                                                   │
│  ■ Full transcripts saved to dashboard via IPC                                       │
│  ■ AI summaries + intent + action items per session                                  │
│  ■ Overlay history panel — slides out from right                                     │
│  ■ Ctrl+Space to save — auto-syncs to dashboard                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ▌ SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                       │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────────────┐    │
│  │  LAUNCHER     │    │  ELECTRON        │    │  AUDIO PIPELINE                   │    │
│  │               │    │                  │    │                                    │    │
│  │  start.vbs ───┼───>│  Main Process    │    │  ┌──────────┐   ┌─────────────┐   │    │
│  │  start.hta    │    │  ┌────────────┐  │    │  │ Internal  │   │  Deepgram   │   │    │
│  │  Launch.bat ──┼───>│  │ Dashboard  │  │    │  │ Loopback──┼──>│  WebSocket  │   │    │
│  │               │    │  │ (React App)│  │    │  │ 16kHz PCM │   │  nova-2     │   │    │
│  │               │    │  ├────────────┤  │    │  ├──────────┤   └──────┬──────┘   │    │
│  │               │    │  │  Preload   │  │    │  │ External  │          │          │    │
│  │               │    │  │ (IPC Bridge│  │    │  │ Mic ──────┼──────────┘          │    │
│  │               │    │  └─────┬──────┘  │    │  └──────────┘                     │    │
│  │               │    │        │         │    └──────────────────┬───────────────────┘    │
│  │               │    │  ┌─────┴──────┐  │                       │                        │
│  │               │    │  │  Overlay   │  │              ┌────────┴────────┐               │
│  │               │    │  │ (HTML+HUD) │<─┼──────────────┤  Live Transcript│               │
│  │               │    │  └────────────┘  │              │  (Multi-Color)  │               │
│  │               │    └──────────────────┘              └─────────────────┘               │
│  └──────────────┘                                                                         │
│                                                                                           │
│  ┌──────────────────┐    ┌─────────────────────┐    ┌────────────────────────────────┐   │
│  │  AI PROCESSING    │    │  STEALTH LAYER      │    │  DATA PERSISTENCE               │   │
│  │                   │    │                     │    │                                  │   │
│  │  Groq             │    │  setContentProtect  │    │  Conf store (local JSON)         │   │
│  │  LLaMA-3.1 70B   │    │  skipTaskbar        │    │  Session transcripts             │   │
│  │  ┌─────────────┐  │    │  setIgnoreMouse    │    │  AI summaries                   │   │
│  │  │ Summary     │  │    │  WS_EX_TOOLWINDOW  │    │  API keys (encrypted)            │   │
│  │  │ Intent      │  │    │  Alt+Tab invisible │    │  Window bounds                  │   │
│  │  │ Actions     │  │    │                     │    │                                  │   │
│  │  └─────────────┘  │    └─────────────────────┘    └────────────────────────────────┘   │
│  └──────────────────┘                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### AUDIO PIPELINE SEQUENCE

```
 TIME  │  USER ACTION                │  OVERLAY              │  DEEPGRAM              │  GROQ
───────┼─────────────────────────────┼───────────────────────┼────────────────────────┼───────────────
  0    │  Ctrl+Shift+L               │  CONNECTING...         │                        │
  1    │  (select audio source)      │  ▶ EXECUTE_LISTEN      │  WebSocket handshake   │
  2    │                             │  LISTENING [00:00]     │  ← Metadata            │
  3    │  (someone speaks)           │  ┌─ LIVE_FEED ──────┐  │  ← interim results     │
  4    │                             │  │ hello world ...  │  │                        │
  5    │  (continued speech)         │  │ this is a test   │  │  ← final results       │
  6    │                             │  └──────────────────┘  │                        │
  ...  │  Ctrl+Space                 │  [OK] saving...        │                        │  ← transcript
  ...  │                             │                        │                        │  → summary
  ...  │                             │  Session saved to DB   │                        │  → actions
```

---

## ▌ KEY BINDINGS

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                           │
│  Ctrl + Shift + L    ║  Start / Stop listening     ║  Toggles the audio capture pipeline  │
│  Ctrl + Shift + A    ║  Hide / Show overlay        ║  Keeps listening while hidden        │
│  Ctrl + Shift + O    ║  Toggle audio source        ║  Internal ↔ External mic             │
│  Ctrl + Shift + T    ║  Toggle click-through       ║  Mouse passes through overlay        │
│  Ctrl + Shift + D    ║  Show / Hide dashboard      ║  Focus the main EVES dashboard       │
│  Ctrl + Shift + S    ║  Toggle stealth mode        ║  Invisible to screen share           │
│  Ctrl + Space        ║  Save session to history    ║  Transcript + summary saved          │
│  Ctrl + Shift + X    ║  Quit EVES                  ║  Kills all processes                 │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ▌ OVERLAY HUD REFERENCE

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                           │
│  0x45564553 0x4D495320 0x56322E31                                                         │
│                                                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ● EVES  v2.1.0                                        [● STEALTH]                │  │
│  │                                                                                     │  │
│  │  ┌──────┐                                                                           │  │
│  │  │  ●   │  STANDBY / LISTENING / CONNECTING... / ERROR                              │  │
│  │  └──────┘  00:00                                                                    │  │
│  │                                                                                     │  │
│  │  ▸ AUDIO_SOURCE                                                                     │  │
│  │  ┌─────────┐  ┌─────────┐                                                          │  │
│  │  │ [INT]   │  │  EXT    │                                                          │  │
│  │  └─────────┘  └─────────┘                                                          │  │
│  │                                                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────┐   │  │
│  │  │ ▸ LIVE_FEED [COLOR]                                                         │   │  │
│  │  │ <span class="color-cyan">hello</span> <span class="color-green">world</span>│   │  │
│  │  │ <span class="color-white">this</span> <span class="color-red">is</span>    │   │  │
│  │  │ a test transcript in multi-color ▊                                       │   │  │
│  │  └──────────────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                                     │  │
│  │  [▶ EXECUTE_LISTEN]                                        [☰] ← CTRL+SPACE SAVE  │  │
│  │  ┌──────────┐                                                                            │  │
│  │  │ L listen │ A hide │ ␣ save │                                                          │  │
│  │  └──────────┘                                                                            │  │
│  │                                                                                     │  │
│  │  SECURE_CHANNEL // ENC: AES-256 // PID: 0x1A4F                                      │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ▸ SESSION_LOG                                                         [✕]         │  │
│  │  $ Session at 14:32                                 ────  INT  3:45                 │  │
│  │  $ Standup notes                                      ────  EXT  12:10              │  │
│  │  $ Client call                                        ────  INT  24:30              │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ├── PROJECT STRUCTURE

```
evessys@machine:~$ tree eves/ --depth 2

eves/
├── electron/                          # Electron main process
│   ├── main.ts                        # Window creation, hotkeys, IPC, tray
│   ├── preload.ts                     # contextBridge API (eves.* methods)
│   └── ipc/                           # IPC handlers per service
│       ├── deepgram.handler.ts
│       ├── groq.handler.ts
│       ├── drive.handler.ts
│       ├── notion.handler.ts
│       └── settings.handler.ts
│
├── overlay/                           # Overlay HUD (plain HTML/CSS/JS)
│   ├── index.html                     # HUD layout with hex decorations
│   ├── app.js                         # Audio capture + Deepgram WebSocket
│   └── styles.css                     # Glassmorphism + scanlines + glitch
│
├── src/                               # Dashboard React application
│   ├── main.tsx                       # React entry point
│   ├── App.tsx                        # App shell + routing
│   ├── components/                    # UI components
│   │   ├── hacker/                    # 8 hacker-themed components
│   │   ├── dashboard/                 # Dashboard pages
│   │   ├── layout/                    # Sidebar + TopBar
│   │   ├── settings/                  # Settings modal
│   │   ├── glass/                     # Glass UI primitives
│   │   └── meetings/                  # Meeting views
│   ├── store/                         # Zustand state stores
│   ├── styles/                        # Global CSS + hacker animations
│   ├── types/                         # TypeScript interfaces
│   └── index.html                     # Vite entry page
│
├── launcher/                          # Launch scripts
│   ├── start.hta                      # Animated HTA launcher
│   ├── start.vbs                      # Stealth VBS launcher
│   ├── start.bat                      # Terminal launcher
│   ├── stop.bat                       # Kill EVES
│   └── Launch EVES.bat                # One-click batch launch
│
├── config/                            # Build configuration
│   ├── electron-builder.yml
│   ├── electron.vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── package.json
├── .gitignore
└── README.md
```

---

## ─── HACKER COMPONENT LIBRARY

```
src/components/hacker/

  MatrixRain.tsx       ◆ Canvas-based falling katakana + hex characters
                       ◆ Variable speed, cyan glow trails
                       ◆ Full-screen or container-cropped

  Scanlines.tsx        ◆ CRT monitor effect
                       ◆ Horizontal lines + moving scan beam + vignette

  BootSequence.tsx     ◆ Full-screen terminal boot animation
                       ◆ 28 lines: "Initializing neural core... [OK]"
                       ◆ Fades to reveal dashboard after completion

  GlitchText.tsx       ◆ RGB split animation
                       ◆ glitchShift1 + glitchShift2 keyframes
                       ◆ Random offset on cycle

  SystemStatus.tsx     ◆ Animated CPU/Memory/Network/Latency bars
                       ◆ Sparkline graphs + audio equalizer

  LiveLogFeed.tsx      ◆ Scrolling terminal log entries
                       ◆ Timestamps + [INFO]/[WARN]/[DEBUG] levels
                       ◆ Blinking cursor prompt

  RadarSweep.tsx       ◆ Radar SVG animation
                       ◆ Rotating sweep line + random blips
                       ◆ Ping-style contact detection

  HackerImage.tsx      ◆ Cyberpunk image card
                       ◆ Scanline overlay + HUD corner brackets
                       ◆ Cyan/magenta/yellow gradient tint
                       ◆ Error fallback: CSS gradient grid
```

---

## ─── TECHNICAL SPECIFICATIONS

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                           │
│  FRAMEWORK      Electron 32 + React 18 + TypeScript 5.5                                  │
│  BUILD           electron-vite 2.3 → out/ directory                                       │
│  STATE           Zustand 5 (renderer) + Conf 10 (main process store)                      │
│  ANIMATIONS      Framer Motion 11 + GSAP patterns + CSS keyframes                         │
│  CHARTS          Recharts 2 (sparklines + stats)                                          │
│  AUDIO           Web Audio API (ScriptProcessor) + Deepgram WebSocket SDK                 │
│  AI              Groq SDK (LLaMA-3.1 70B) — summarization, intent, actions               │
│  STORAGE          Conf 10 → local JSON (api keys, settings, window bounds)                │
│  STEALTH          setContentProtection, skipTaskbar, WS_EX_TOOLWINDOW, click-through      │
│  FONTS            Courier New, Consolas, SF Mono (monospace stack)                        │
│  COLORS           Cyan #00F5FF, Green #10B981, Red #FF006E, Yellow #FCD34D, Violet       │
│  LICENSE          MIT                                                                     │
│                                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ─── DEPENDENCIES

```
$ npm ls --depth=0

eves@1.0.0
├── @deepgram/sdk@^3.6.0          # Deepgram transcription SDK
├── @tanstack/react-query@^5.56   # Async state management
├── clsx@^2.1.1                   # Conditional classes
├── conf@^10.2.0                  # Persistent config store
├── date-fns@^3.6.0              # Date formatting
├── framer-motion@^11.5           # Animations
├── groq-sdk@^0.7.0              # Groq AI inference
├── lucide-react@^0.447          # Icons
├── react@^18.3.0                # UI framework
├── react-dom@^18.3.0            # DOM renderer
├── react-dropzone@^14.2          # File upload
├── react-hotkeys-hook@^4.5     # Hotkey bindings
├── recharts@^2.12               # Charts & sparklines
├── wavesurfer.js@^7.8           # Audio waveform
└── zustand@^5.0.0               # State management
```

---

## ─── QUICK DEPLOY

```bash
# 1. Clone
git clone https://github.com/SHAILESH-RS-UPADHYAY/eves.git
cd eves

# 2. Install
npm install

# 3. Configure API keys
#    Open Settings → api_keys → enter Deepgram + Groq keys → ./save_keys

# 4. Launch
npm run dev

# 5. Use
#    Ctrl+Shift+L    → Start listening
#    Ctrl+Shift+A    → Hide overlay
#    Ctrl+Space      → Save session
#    Ctrl+Shift+X    → Quit
```

---

<p align="center">
  <sub>
    Built with ██████ by <a href="https://github.com/SHAILESH-RS-UPADHYAY">SHAILESH-RS-UPADHYAY</a>
    <br/>
    <br/>
    <img src="https://img.shields.io/badge/license-MIT-0c0c18?style=flat&labelColor=0c0c18&color=00F5FF" />
    <img src="https://img.shields.io/badge/electron-32-0c0c18?style=flat&logo=electron&logoColor=00F5FF&labelColor=0c0c18&color=00F5FF" />
    <img src="https://img.shields.io/badge/react-18-0c0c18?style=flat&logo=react&logoColor=00F5FF&labelColor=0c0c18&color=00F5FF" />
    <img src="https://img.shields.io/badge/version-2.1.0-0c0c18?style=flat&labelColor=0c0c18&color=10B981" />
  </sub>
</p>
