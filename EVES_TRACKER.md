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
| 4 | Multi-provider AI brain backend (Groq / Gemini / OpenAI), long-transcript summarisation | ⏳ |
| 5 | Repo intelligence: company repo + reference (skills) repo, persisted attachments | ⏳ |
| 6 | BRAIN page: chat, spatial prompt pills, voice input, frontend preview | ⏳ |
| 7 | Settings (keys, provider, models, language, path style) + panel/status updates | ⏳ |
| 8 | Verification, README, final audit | ⏳ |

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
