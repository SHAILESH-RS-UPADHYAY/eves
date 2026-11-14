# EVES — Build Tracker

Single source of truth for the "meeting → mission" upgrade. Every phase lists what changed, where, and why.

## Goal

Turn EVES from "record + transcribe" into a full meeting-to-mission workflow for 2h+ company meetings:

1. Start EVES (INT / EXT / BOTH) → the whole meeting is recorded to disk and transcribed live.
2. EVES "brain" (Groq, Gemini AI Studio or OpenAI/Codex — user's choice) summarises the meeting, even when it is hours long.
3. Recordings stay stored and play back at any speed (0.5×–3×).
4. A chat workspace answers "what is the main goal / what exactly do I build / how" using the transcript + the attached company repo + an attached reference repo (skills vault).
5. Colored spatial prompt pills (click or speak) produce pro-grade prompts for Codex / Claude Code / Cursor — with the company repo path, the skills vault section and the expected frontend result baked in.
6. The desktop-runtime keyword disappears from the project; the floating overlay becomes a clean, movable, more opaque modal popup. Existing hacker look stays untouched.

## Interpretation notes (decisions made from the brief)

| Brief | Decision |
| :-- | :-- |
| "remove the e-word concept and keyword everywhere, but don't change its functionality" | Runtime stays (functionality unchanged). Every project-owned name loses the keyword: the runtime-named main-process folder → `core/`, build config → `eves.config.ts`, packager config → `packager.yml`, launcher no longer names the tool. The unavoidable third-party identifiers (npm package names in `package.json`/lockfile, one import boundary `core/runtime.ts`, the build-tool import in `eves.config.ts`) are the only places it can still exist. |
| "overlay → modal popup, more opacity, movable, clean, animated" | `overlay/` → `popup/`. Opaque glass panel, dedicated drag title bar, entrance/scan animations, slide-over session log. All capture behaviour kept. |
| "grok key" | The app uses **Groq** (groq.com). Kept, plus Gemini (AI Studio) and OpenAI ("Codex") keys in the same card style. |
| "codex ka api" | OpenAI API key + model picker. |
| "ref repo to attach github skills" | Second attachment slot "SKILL VAULT" (reference repo). EVES reads its `INDEX.md`/`README.md` catalog and injects the skills section into every prompt. |
| Prompt path format | User's own example uses WSL paths (`/mnt/c/...`) → default WSL, switchable to Windows. |

## Phase plan

| # | Phase | Status |
| :-- | :-- | :-- |
| 0 | Tracker + baseline audit | ✅ done |
| 1 | Keyword removal, folder/config renames, dead-code purge, type-error baseline to zero | ✅ done |
| 2 | Popup redesign (modal, movable, opaque, animated) + long-meeting capture hardening | ✅ done |
| 3 | Storage engine (per-meeting files) + long-recording playback (any speed) | ✅ done |
| 4 | Multi-provider AI brain backend (Groq / Gemini / OpenAI), long-transcript summarisation | ✅ done |
| 5 | Repo intelligence: company repo + reference (skills) repo, persisted attachments | ✅ done |
| 6 | BRAIN page: chat, spatial prompt pills, voice input, frontend preview | ✅ done |
| 7 | Settings (keys, provider, models, language, path style) + panel/status updates | ✅ done |
| 8 | Verification, README, final audit | ✅ done |

## Phase 0 — Baseline audit (2026-09-27)

Findings that shaped the plan:

- `tsc --noEmit` baseline: **17 type errors** in 7 files (build still passes because esbuild does not typecheck).
- Analysis model `llama-3.1-70b-versatile` (and `mixtral-8x7b-32768`) are decommissioned by Groq → auto-summary currently fails every time.
- 2h meeting risks found in the capture path:
  - elapsed time counted with `setInterval` → throttled when the popup is hidden → wrong duration / "nothing to save".
  - live transcript re-renders the entire meeting as HTML on every Deepgram message → O(n) per message, UI slows down over hours; transcript text injected unescaped.
  - Deepgram reconnect restarts timestamps at 0 → utterance times after a drop point to the wrong place in the recording.
  - player fetches + decodes the whole file in memory → 2h recordings risk freezing the dashboard.
- Storage: every change (even each keystroke in Notes) rewrites **all** meetings (with duplicated word arrays) into one JSON file.
- Dead code: stealth IPC/hook/util (always forced off), unused `MeetingComparison`, `TimelineScrubber`, `SentimentPulse`, unused native-rebuild dev dependency + unused react-query provider, unused imports in `App.tsx`.
- `SettingsModal` tab highlight never works (`tab.id` on a string).
- Popup history panel sits outside the 360px window (never visible).
- Deepgram "Test" button is a fake `setTimeout` success.

## Change log

### Phase 1 — Keyword removal, structure, dead code (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| Main-process folder renamed to `core/` | `core/**` (moved) | Keyword out of the project tree. |
| Single runtime boundary | `core/runtime.ts` (new); every `core/*` import now comes from it | The runtime package is named in exactly one source file; its export list documents the whole surface EVES uses. |
| Build config renamed | `eves.config.ts` (was the runtime-named config), `package.json` scripts pass `-c eves.config.ts` | Keyword out of file names. Dead aliases (`@` in main/renderer, unused) and a default-valued `server` block dropped. |
| Packager config renamed | `packager.yml`, `npm run package` passes `--config packager.yml` | Same. |
| Launcher rewritten | `launcher/runner.js` | Runs package.json's `dev` script via its own CLI with `--logLevel warn` (tool chatter gone) and rewrites any stray runtime-brand text to EVES. No tool name hard-coded. |
| Overlay folder renamed | `popup/` (was `overlay/`), second renderer entry `popup` | Preparation for the modal popup (Phase 2). |
| Dead stealth plumbing removed | `core/main.ts`, `core/preload.ts`, `core/utils/store.ts`, `src/store/ui.store.ts`, `src/types/index.ts`, `CyberKit.tsx`; deleted `core/utils/stealth.ts`, `src/hooks/useStealth.ts` | Content protection was force-disabled everywhere; the toggle, IPC, tray item, setting and migration did nothing. |
| Unused settings removed | `accentColor`, `orbIntensity`, `reduceMotion`, `stealthOnLaunch` | Never read anywhere. |
| Dead components removed | `MeetingComparison.tsx`, `TimelineScrubber.tsx`, `SentimentPulse.tsx`; unused imports in `App.tsx` | Not imported by anything. |
| Unused dependencies removed | native-rebuild dev dep, `@tanstack/react-query` (provider mounted, zero queries) | Smaller install, no garbage. |
| Command palette | `CommandPalette.tsx` | Removed no-op "stealth" and "compare" commands, correct hotkey option (`enableOnFormTags`), confirm before "Clear all data", added Repo Intel nav. |
| Type errors 17 → 0 | `GlassPanel.tsx` (style prop), `MatrixRain.tsx`, `TopBar.tsx` (typed `WebkitAppRegion` via module augmentation in `src/types`), `UploadZone.tsx` (dropzone root on plain div), `SettingsModal.tsx` (active-tab highlight bug), `core/main.ts` | `tsc --noEmit` is now a real gate. Stale `tsconfig.node.json` (unreferenced, duplicate coverage) removed; `eves.config.ts` added to the main tsconfig. |
| Keyword scrubbed from text | `README.md`, `docs/eves-architecture.svg`, comments, Repo Intel toast | — |

**Verification:** `tsc --noEmit` 0 errors · `npm run build` OK (bundle requires the runtime once through the boundary) · `node core/utils/audioUrl.test.mjs` ok · launcher smoke run prints only EVES lines and reaches "EVES Core Online".

**Keyword now only in:** `package.json`/`package-lock.json` (dependency + CLI names), `core/runtime.ts` (import boundary + the dev-URL env var the build tool sets), `eves.config.ts` (build-tool import). These are third-party identifiers; removing them means removing the runtime.

### Phase 2 — EVES popup: modal redesign + long-meeting capture (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| Modal frame | `popup/index.html`, `popup/styles.css` | Panel opacity 0.85 → 0.95 with inner glow, rounded modal with outer shadow (10px transparent margin so the glow renders), dedicated **drag title bar** (logo, REC chip, dashboard + hide buttons). Body is no longer a drag region, so text/buttons behave normally. |
| Kept hacker identity | same | Scanlines, hex decorations, orb, EXECUTE_LISTEN button, multi-colour live feed, Courier, cyan/green palette all preserved. |
| Added hacker motion | same | Running light around the frame (turns green + faster while recording), 4 HUD corner brackets, scan sweep, RGB glitch on the wordmark, sliding source glider, button sheen, live spectrum meter next to the orb, slide-over session-log drawer. `prefers-reduced-motion` respected. |
| Real resize grip | `popup/app.js`, `core/main.ts` (`popup:resize`) | Transparent windows have no native resize border; the old grip was decorative. Pointer-captured drag now resizes via IPC (min 330×470). |
| Position memory | `core/main.ts`, `core/utils/store.ts` (`getBounds`/`saveBounds`) | Popup and dashboard reopen where you left them, but only if that spot is still on a connected display. |
| Wall-clock timer | `popup/app.js` | Time = `Date.now() − start`, so hiding the popup for 2 hours can't shrink the saved duration (old counter was a throttled `setInterval`). |
| No background throttling | `core/main.ts` (`backgroundThrottling: false`) | The recorder window keeps full speed while hidden. |
| O(1) live feed | `popup/app.js` | Only the last 90 words are rendered (old code re-rendered the whole meeting as HTML on every Deepgram message). Words are inserted with `textContent` — no HTML injection. |
| Reconnect-safe timestamps | `popup/app.js` | Deepgram restarts its clock per socket; each socket's timestamps are offset to the recording clock, so seeking still lands correctly after a network drop. Reconnect uses backoff 2s → 15s for as long as you're listening. |
| Last words kept | `popup/app.js` (`closeSocket`) | Stop sends `CloseStream` and waits (≤2.5s) for Deepgram to flush final words before closing (old code closed immediately). |
| Speaker turns | `popup/app.js` (`addWords`) | Words grouped by speaker; consecutive segments of the same speaker merge into one utterance — cleaner transcript and better input for the AI brain. |
| Waveform peaks | `popup/app.js`, `src/types` (`peaks`), `recorder.handler.ts` | Two peaks/second folded from the audio blocks while recording (≈14k numbers for 2h) so the player can open multi-hour recordings instantly (Phase 3). |
| Speech bitrate | `popup/app.js` | Opus at 32 kbps → a 2h meeting ≈ 30 MB instead of ≈ 115 MB. |
| Diarization setting honoured | `popup/app.js` | The settings toggle was ignored before. |
| Popup-centric main process | `core/main.ts`, `core/preload.ts` | Data-driven hotkey table (warns if a key is taken), Alt+L / Alt+O create the popup on demand (dashboard-only launch), popup owns its own source state (main no longer keeps a desynced copy), tray + taskbar use the EVES sigil (`core/icon.ts`) instead of an invisible empty icon, media + clipboard permissions set once on the shared session (the old handler blocked clipboard writes = broken "copy prompt" buttons after the popup opened), `window:showDashboard` accepts a route (`{ page, meetingId }`). |
| Preload events unsubscribe | `core/preload.ts` | Every `on*` returns an unsubscribe — fixes transcription-progress listeners piling up per run. |
| Save → brain hand-off | `popup/app.js` | After saving, the notice offers **OPEN IN BRAIN ›** (opens the dashboard on that meeting). |
| Stale hotkey text fixed | `DashboardPage.tsx`, `ShortcutsOverlay.tsx`, `CyberKit.tsx`, `LiveLogFeed.tsx`, launcher `.bat` banners | Several screens still advertised the old Ctrl+Shift keys and a removed stealth key. Text only, same styling. |
| CSP on popup | `popup/index.html` | Only self + `wss://api.deepgram.com`. |

**Verification:** `tsc` 0 errors · build OK · launched and screenshotted the popup (renders as a framed modal, top-right, correct hotkeys).

### Phase 3 — Storage engine + long-recording playback (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| One file per meeting | `core/utils/meetings.ts` (new) | `userData/meetings/<id>.json`, atomic write-then-rename, ids sanitised (never a path). A notes keystroke now rewrites one meeting, not the whole archive. |
| Field-level patches | `core/ipc/meetings.handler.ts` (new), `meetings:patch` | Main-side jobs (analysis) and renderer edits (notes/tags) merge per field, so neither overwrites the other. |
| UI flags never persisted | `meetings.ts` `hydrate`/`write` | `isTranscribing`/`isAnalyzing` used to be saved — a crash mid-job left a meeting stuck "transcribing" forever. |
| Legacy migration | `migrateLegacyMeetings()` (runs before orphan recovery) | Moved the existing 14 meetings out of the single settings file; backup kept at `userData/meetings/_legacy-backup.json.bak`. The duplicated flat word list was dropped (16-min meeting: 323 KB → 183 KB). |
| Renderer persistence | `src/store/meetings.store.ts` | Replaced "save the whole array on every change" with per-meeting patches debounced 400 ms; `upsertMeeting` (already on disk) vs `createMeeting` (uploads). Removed dead duplicate `activeMeetingId` state. |
| Popup save moved | `meetings.handler.ts` (`popup:save-session`) | Broadcasts `session-saved` to every window; no transcript → audio-only meeting (old code stored a fake "(no transcript captured yet)" transcript). |
| Range-capable audio protocol | `core/ipc/recorder.handler.ts`, `byteRange()` in `core/utils/audioUrl.ts` | Streams recordings with HTTP 206 ranges so the player seeks inside multi-hour files without loading them; serves audio types only (403 otherwise). |
| Recording ids sanitised | `recorder.handler.ts` | A crafted id could previously write outside the recordings folder. |
| Delete safety | `meetings:delete` | Deletes the recording only for EVES-recorded meetings (never an uploaded user file). |
| Instant player for long recordings | `src/components/meeting/AudioPlayer.tsx` | Recorded meetings load with their captured peaks + duration: no fetch, no decode — the audio streams. Uploads fall back to decoding. Speaker bands capped at 400 regions. State resets when switching meetings. |
| Any-speed playback | same | Presets 0.5×/0.75×/1×/1.25×/1.5×/2×/2.5×/3× + a 0.5×–3× slider (0.05 steps), pitch preserved, last speed remembered. Keys: Space play/pause, ←/→ ±10 s, `[`/`]` ∓0.25×. h:mm:ss clock. Card no longer squeezed by the flex layout. |
| Uploads fixed | `MeetingPage.tsx`, `core/preload.ts` (`pathForFile` via `webUtils`) | `File.path` no longer exists in this runtime version, so uploads were getting only the bare file name. Upload meetings now get a playable protocol URL; Ctrl+U really opens the picker. |
| Prerecorded transcription | `core/ipc/deepgram.handler.ts` | File streamed from disk (no 100 MB buffer), honours the diarization setting, no duplicate word list, rounded timings, clear "file not found" error, real `deepgram:test` key check. |
| Transcript view | `TranscriptView.tsx`, `globals.css` (`.tx-word`) | One delegated click handler + CSS hover instead of three closures per word; entrance animation only for the first 24 turns (a 2h meeting has 1000+). |
| Progress listeners | `src/hooks/useDeepgram.ts` | Unsubscribes after each run (old listeners kept updating previous meetings). |
| Self-check | `core/utils/audioUrl.test.mts`, `npm test` | Tests the real TS module (no duplicated copy): URL round-trip + 9 range cases. |

**Verification (real app, driven over DevTools):** migration ran (14 meetings); a live 20 s recording via Alt+L with synthesized speech produced a 56 KB file, 39 peaks and two correctly timed utterances; the meeting page loaded it instantly from peaks; 2× playback measured (6 s audio in 3 s); seek +10 s landed at 0:13; protocol returned 206 / 200 / 416 / 403 as designed; an upload through the file input resolved its path, streamed to prerecorded transcription and rendered a decoded waveform. Test meetings deleted afterwards. `tsc` 0 · `npm test` ok.

### Phase 4 — Multi-provider AI brain backend (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| One provider table | `src/lib/providers.ts` (new) | Groq, Gemini (AI Studio) and OpenAI (Codex family): base URL, default model, context budget, key field, key URL, pitch, colour. Shared by backend and settings UI; also holds `DEFAULT_SETTINGS` (the two duplicated default blocks are gone). `activeProvider()` uses the chosen provider or falls back to any provider that has a key. |
| SDK-free LLM client | `core/utils/llm.ts` (new), `groq-sdk` removed (−10 packages) | All three speak the OpenAI chat-completions dialect → one `fetch` client: streaming (SSE), JSON mode + one repair round-trip, 429/5xx retries honouring `Retry-After` / Groq's "try again in 1m2.5s", actionable errors (bad key, model gone, too large → "switch to Gemini"), abortable. Groq gets an explicit output cap (it counts it against the per-minute budget). |
| Self-healing models | `ModelUnavailableError` (llm), `preferredModel` + `withModelFallback` (brain), `modelSwitcher` (store) | Providers retire models (Groq retired `llama-3.3-70b-versatile`; the old code was pinned to the already-dead `llama-3.1-70b-versatile`, so **every analysis was failing**). On "model not found / decommissioned" EVES lists the key's models, picks the strongest by a preference order, saves it and retries once. Groq default is now `openai/gpt-oss-120b`. |
| Brain engine | `core/utils/brain.ts` (new) | Transcript as `[mm:ss] S1: …` lines · local facts (talk time, word cloud — no tokens spent) · part-by-part digest for transcripts beyond the provider's budget (a 2h meeting on Groq = two rounds; Gemini reads it whole) with a no-infinite-loop guard · digest cached on the meeting · analysis prompt + `normalizeAnalysis` (any model output becomes something every chart can render) · question-aware context packing (summary + most relevant part notes + raw ±2-turn excerpts around the question's words) · prompt-pill instructions · deterministic prompt header. |
| Analysis gets `mainGoal` | `src/types` | Shown on the brief; "what needs to be done" in one sentence. |
| AI IPC | `core/ipc/ai.handler.ts` (new, replaces the Groq handler) | `ai:analyze(meetingId)` — main reads the transcript from disk (no 100 KB transcripts over IPC), saves analysis + digest. `ai:chat` — streams `ai:delta` events, progress via `ai:progress`, `ai:cancel` stops it. `ai:models` — model list, doubles as key test. |
| Analyze from the dashboard | `src/hooks/useAnalyze.ts` (replaces `useGroq`), `MeetingPage.tsx` (`./analyze_meeting` / `./re_analyze` button), `App.tsx` | Pending edits are flushed before main reads the meeting (fixes a transcribe→analyze race). Auto-analysis only runs when some AI key exists. |
| Loading toasts end | `ui.store.ts` (`addToast` returns id), hooks | "Transcribing… / Analyzing…" toasts used to stay forever (no timer, no close button). |
| Settings migration | `core/utils/store.ts` | Drops retired fields from the stored settings; `aiModels` merged per provider. |

**Verification:** `npm test` (llm: fake-fetch retry/stream/JSON repair/model-gone; brain: paths, chunking, talk time, word cloud, normalisation, single-pass vs part-by-part summarisation, digest reuse, question-aware excerpts, budget, fallback picking the real Groq list). Real calls with the saved Groq key: 49 s meeting analysed in 3.1 s; the 16-min mixed Hindi-English meeting in 5.2 s with owned/dated action items and timestamped decisions; streamed Codex/Claude prompts (1,361 deltas, 4–8 s).

### Phase 5 — Repository intelligence: company repo + skill vault (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| Monorepo-aware scanner | `core/ipc/repo.handler.ts` | Manifests found at root **and one level down** (`frontend/package.json`, `backend/requirements.txt`) — your repo was detected as just "Codebase" before; now: Node, TypeScript, React, Tailwind, Redux Toolkit, Vite, Python, FastAPI, Pydantic, LangChain/LangGraph, Redis, APScheduler, Uvicorn, Docker + build scripts. Data-driven stack tables. |
| Root files never lost | same (`scanDir`) | Each level's files are indexed before descending — in a 23k-file vault the file cap used to be spent inside `external_repos`, hiding `INDEX.md`. Catalog detected on disk. |
| Secret-safe context | same (`READABLE`, `SECRET_NAME`) | Only source-like files are ever read into a prompt; names like `service_account.json`, `*token*`, `.env`, `*.db` never are. `uploads/`, `logs/`, `tmp/` skipped. |
| Model context builder | `repoContext(root, 'company' \| 'vault', budget, query)` | Company: path, stack, scripts, **agent rules files** (`CODE_AGENT_RULES.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`), README, files most related to the meeting/question (file-name hits weigh double), openings of the top files for big-context providers, directory index. Vault: its catalog (`INDEX.md`) + top level. Cached 5 min. |
| Persisted attachments | `src/hooks/useRepoLink.ts` (new), `src/store/repo.store.ts` | Company repo and skill vault paths live in settings (the old attachment vanished on restart) and are re-indexed on first use. Dead `history` state removed. |
| Skill-vault cartridge | `src/components/repo/RepoSlot.tsx` (new) | Attach / switch / rescan / detach, shows the exact path written into prompts (WSL or Windows), catalog status, skill count, top folders; glowing spine that sweeps while indexing. |
| Repo Intel page | `RepoIntelPage.tsx` | Uses the shared hook; SKILL_VAULT slot added between repo recon and meeting context; synthesis is provider-agnostic, reads long meetings via their digest, and its prompt starts with the same deterministic workspace + skills header. |
| Spinners spin | `src/styles/animations.css` | `animate-spin`/`animate-pulse` were no-op class names (no Tailwind output is generated in this project), so every loading icon was frozen. |

**Verification:** real scan of your company repo (1,181 files, full stack, scripts) and your vault (`INDEX.md` catalog, 1,808 skill files); generated Claude Code prompt opens with your exact section-1 wording including the master catalog line.

### Phase 6 — EVES BRAIN page (✅)

New sidebar item **EVES Brain** (`brain.sh`, top bar `NEURAL_CORE`, command palette entry). The popup's **OPEN IN BRAIN ›** and session-log items land here on the right meeting.

| Piece | Files | What it does |
| :-- | :-- | :-- |
| Page | `src/components/brain/BrainPage.tsx` | Left dock: **MEETING_LINK** (pick any transcribed meeting, length/speakers/words, ANALYZE / RE-ANALYZE with live stage, LISTEN → player), **COMPANY_REPO** and **SKILL_VAULT** cartridges. Right console: **mission brief** (main goal, TL;DR, decisions / actions / open questions / concerns), **spatial pills**, streaming **chat**, **composer**. Header: active brain chip (provider · model), WSL / WIN toggles. One scroll area per column (no double scrollbars). Empty state with `./launch_eves` when nothing is transcribed. |
| Spatial pills | `src/components/brain/SpatialPills.tsx` | MAIN GOAL · HOW TO BUILD · CODEX PROMPT · CLAUDE CODE PROMPT · CURSOR PROMPT · FRONTEND PREVIEW · ACTION PLAN · RISKS & QUESTIONS. Neon glass capsules with cursor-tracking 3D tilt, moving specular highlight, staggered entrance, orbit ring while their answer streams; others dim. Each pill also has spoken triggers (English + mixed Hindi-English). |
| Chat | `src/components/brain/ChatThread.tsx`, `src/hooks/useBrainChat.ts` | Terminal-style turns; answers rendered as Markdown with [mm:ss] highlighted; coding-tool answers become a **prompt capsule** (exact paste text, "COPY FOR CODEX/CLAUDE CODE/CURSOR"); streaming bubble shows live stages ("condensing part 2/5…", "thinking…"); stop button cancels; history saved per meeting; deltas painted once per frame. |
| Markdown | `src/lib/markdown.ts` (parser, tested), `src/components/brain/Markdown.tsx` | Headings, lists, tables, quotes, inline code/bold, fenced code with COPY; ```html blocks get **RENDER PREVIEW** — a sandboxed iframe (no scripts, parent CSP) showing the model's mock of the finished screen. No new dependency. |
| Voice | `src/hooks/useVoiceInput.ts`, `src/lib/stt.ts` (shared with the popup) | Click the mic, speak, click again: short commands ("codex prompt", "main goal") run a pill, anything else is sent as a question. Deepgram nova-3 multilingual with key-term boost for Codex / Claude / Cursor / EVES. |
| mixed Hindi-English answers | `core/utils/brain.ts` | The language rule also rides on the question (with a mixed Hindi-English example) — models follow the latest message over the system prompt. Coding-tool prompts are always English. |
| Popup de-duplication | `popup/app.js` | Uses the shared `deepgramUrl` / `toPcm16`. |
| Placeholder transcripts | `core/utils/meetings.ts` | Old builds saved "(no transcript captured yet)" as a transcript for silent sessions; it is ignored at load so those show as audio-only. |

**Verification (real app, real Groq key, driven over DevTools):** brain page renders in the hacker style; picking the 16-min meeting shows its mission brief; MAIN GOAL streamed with the active pill glowing and a working stop button; a mixed Hindi-English question came back in mixed Hindi-English citing `backend/database.py`; FRONTEND PREVIEW rendered the model's HTML mock of the task-table screen; saying "codex prompt" into the laptop mic (synthesized speech) fired the CODEX pill and produced a capsule with your workspace + skills sections; `showDashboard({page:'brain', meetingId})` switched page and meeting. Test settings/chats were reset afterwards.

### Phase 7 — Settings & status panels (✅, done before Phase 6 because the brain needs keys)

| Change | Files | Why |
| :-- | :-- | :-- |
| Four key cards | `src/components/settings/SettingsModal.tsx` | Deepgram, Groq, Gemini (AI Studio), OpenAI (Codex) in the existing card style; eye toggle; **real** Test buttons (Deepgram project list / provider model list — the old Deepgram test faked success); `ACTIVE BRAIN` badge; one `./save_keys`. |
| BRAIN tab | same | Provider picker (with key status), per-provider model field with the live model list, reset-to-default, EVES-explains-in (English / mixed Hindi-English), path format for prompts (WSL / Windows with a live example), auto-analyze toggle. |
| STORAGE tab | same, `core/ipc/settings.handler.ts` (`app:storage`, `app:open-folder`) | Replaces a "delete audio" toggle and a "clear all data" button that did nothing: shows where recordings and meetings live, recording count/size, and opens the folders. |
| Removed dead model radio | same | Both listed Groq models are decommissioned. |
| Hacker panels | `CyberKit.tsx` (ConnectionMatrix, ConfigConsole), `ControlPanelPage.tsx` | GEMINI and OPENAI uplinks added; config console shows `[brain]` provider/model/auto-analyze/reply-language, `[workspace]` company repo / skill vault / prompt paths, all four keys; API_KEYS stat counts 4 and turns green when transcription + a brain are ready. Same styling. |

### Phase 8 — Final audit, docs, verification (✅)

| Change | Files | Why |
| :-- | :-- | :-- |
| Unused code gate | `tsconfig.json` (`noUnusedLocals`, `noUnusedParameters`) | Swept leftover unused imports/vars from 13 older components (ActionItems, InsightPanel, IntentRadar, KeyMoments, DashboardPage, GlassCard, DriveSync, Sidebar, TopBar, TranscriptView, TranscriptsPage, RepoIntelPage) and made it a compile error from now on. |
| Popup truly opaque | `popup/styles.css` | Measured ~9 % see-through on the real screen. Panel alpha 0.95 → 0.985; removed `backdrop-filter` (a transparent window can't blur other apps — it was pure overhead); entrance animation uses `backwards` so its `filter` doesn't keep a permanent compositing layer for hours. |
| Stale copy | `DashboardPage.tsx` feature cards | "nova-2" / "Groq LLaMA-3 70B" → nova-3 mixed Hindi-English / Groq · Gemini · OpenAI brain. Text only. |
| README | `README.md` | Meeting → Mission workflow, three brains, pills, skill vault, Alt shortcuts, new structure, `npm test`, repository-safety note. |

**Final state:** `tsc` (strict unused) 0 errors · `npm test` → audioUrl, llm, brain, markdown all ok · `npm run build` ok · normal launch boots clean (only EVES lines in the console) · keyword left only in `package.json`/lockfile, `core/runtime.ts`, `eves.config.ts`.

## Known limits / next steps

- The dashboard loads every meeting fully at startup (~1–2 MB per 2 h transcript). Fine for dozens; lazy-load transcripts if the archive reaches hundreds (`ponytail:` note in `core/utils/meetings.ts`).
- Groq's free tier is small: a 2 h meeting is summarised in parts (slower, uses daily tokens). Gemini reads it in one pass — switch the brain there for very long meetings.
- Gemini / OpenAI defaults (`gemini-2.5-flash`, `gpt-4.1`) could not be tested without keys; if retired, EVES auto-switches to the best model the key lists.
- Google Drive / Notion integrations still point at placeholder MCP endpoints (untouched — not part of this brief).
- Tailwind is configured but emits nothing (no `@tailwind` directives); its classes in older components are no-ops. Left in place; remove the dependency if you never plan to use it.
- In dev mode (the launchers) Task Manager still shows the runtime's own process name; `npm run package` builds a proper `EVES.exe`.

### Follow-up — popup: fully opaque + more hacker motion (2026-09-27)

| Change | Files | Why |
| :-- | :-- | :-- |
| Fully solid panel | `popup/styles.css` (`--bg-panel: #05070d`, `--bg-inset: #020306`) | Requested more opacity — nothing behind the popup shows through now. |
| Boot sequence | `popup/index.html` (`#boot`), `popup/app.js` (`boot()`) | ~1.5 s typed lines on launch (`init audio_core [OK]` …), then fades out; never blocks clicks. |
| Radar sweep in the orb | `#orb-radar` | Slow sweep on standby, fast green sweep while listening. |
| Live hex stream | `#hex-stream` | Header hex line keeps decrypting (switches to `REC:` while recording); ticks only while the popup is visible. |
| Status glitch-in | `setStatus()` + `.glitch-in` | RGB-split glitch whenever the status changes (LISTENING, SAVING…). |
| Listening accents | corner brackets pulse green; faint grid drifts behind the live feed | Clear "recording" state without clutter. |

### Follow-up — "stealth" wording removed everywhere (2026-09-27)

Stealth was disabled long ago but the dashboard still advertised it. Replaced with **SENTINEL / SECURE** wording, same styling:
dashboard feature card (`SENTINEL MODE` — local-first vault), boot log line, `./launch_eves --secure`, `SENTINEL_LAYER` status, boot sequence (`BootSequence.tsx`), log feed (`LiveLogFeed.tsx`), cipher panel (`HackerPanels.tsx`), art variant `stealth` → `sentinel` (`CyberArt.tsx`, `CyberKit.tsx`), keyframes `stealthPulse` → `sentinelPulse` (`animations.css`, `tailwind.config.ts`), retired-settings list (`store.ts`), marketing site feature card (`website/…/FeaturesGrid.tsx`).
Scan: zero "stealth" / "WDA_EXCLUDEFROMCAPTURE" left · `tsc` 0 · `npm test` ok.

### Follow-up — English-only wording (2026-09-27)

Removed every Hinglish mention and the Hinglish reply mode: EVES now always answers in English (meetings that mix Hindi and English are still transcribed and understood).
- Brain page: EN/HINGLISH toggle removed; example "what is the main goal?"; composer placeholder in English.
- Settings: "EVES explains in" option removed; Deepgram hint and language option reworded; old saved `brainLanguage` value dropped on startup (`store.ts`).
- Voice pill triggers are English phrases only; AI prompts say "may mix Hindi and English" and always reply in English (`brain.ts`, `repo.handler.ts`).
- Dashboard card, config console line, comments, README and test fixture updated.

### Follow-up — Live website + EVES mark everywhere (2026-11-14)

- **Website live on Vercel** (project `eves`, root `website`, Vite preset). Fixes: `website/package-lock.json`, missing `lucide-react` dep, `css.postcss: {}` so it no longer inherits the Electron app's Tailwind config.
- **PWA**: `manifest.webmanifest`, `sw.js` (network-first, cache fallback), PNG icons 192/512 + apple-touch-icon → "Install app" on phone and laptop.
- **One mark everywhere** (the portfolio's EVES mark: cyan wave → cursor on a dark tile): `core/utils/evesMark.ts` draws it; `core/icon.ts` (window/taskbar/tray), `resources/icon.png` (installer, via `node scripts/icons.mts`), `EvesLogo.tsx` (sidebar/topbar/CyberKit), popup titlebar, `.github/logo.svg`, website favicon/PWA icons.
- Popup panel left as-is (visible in screenshots/screen share). `npm run build` ok · `npm test` ok.

### Follow-up — Website redesign: hand-drawn intro, light/dark, pills, downloads (2026-11-14)

- **Intro** (`website/src/components/Intro.tsx`): the EVES mark is drawn by hand, fast — pen nib on the tip, boiling line, cursor outlined then stamped, "EVES" written, then the mark flies into the navbar. Click skips; off under reduced motion.
- **Light mode is default**, dark via toggle (`ThemeToggle.tsx`): circular ink-wipe from the button + shockwave ring (View Transitions), sun⇄moon morph; choice saved in `localStorage`.
- **Palette**: violet→cyan gradient removed. Warm paper/ink neutrals + one accent from the mark (`#0b7285` light / `#22d3ee` dark). Solid ink buttons, no rainbow icons; 3D scene uses brand colours, floating "EVES" 3D text removed.
- **Section titles** (`SectionTitle.tsx`): words ink in on scroll, accent word gets a hand-drawn wave underline.
- **Features**: detailed cards with custom line icons that draw on reveal + hover micro-motion, bullet specs.
- **Nav pills** (`NavPills.tsx`): Features / How it works / GitHub with gliding indicator, scroll-spy, detailed hover cards.
- **Downloads** (`DownloadButtons.tsx`): detected OS primary + other OS (Windows & macOS), phones get "Install EVES" (PWA prompt / iOS Add-to-Home steps). All GitHub links → `SHAILESH-RS-UPADHYAY/eves`; downloads → latest release.
- Tested: iPhone, Android, macOS UA, Windows desktop — no overflow, no console errors.
- **Wordmark** (2026-11-14): "EVES" now set in MuseoModerno (the portfolio's font) everywhere — app `EvesLogo` (sidebar/topbar), popup titlebar (glitch kept), site navbar + intro. Shared `.eves-word` animation: letters write in, idle wave, hop on hover. Font bundled in the app via `@fontsource/museomoderno` (works offline).
- **Downloads live** (2026-11-14): installers in public `SHAILESH-RS-UPADHYAY/eves-releases` (source repo stays private); site links straight to `releases/latest/download/EVES-Setup.exe` / `EVES.dmg` (universal). CI (`.github/workflows/release.yml`) builds both on real runners → `gh run download` → `gh release upload`. Unsigned builds. Nav pill glider fixed (measured the slot, not the `<a>`), `scroll-margin-top` on sections.
