# Decisions (ADR)

Every entry below is a decision an AI coding agent (or a future contributor) must not silently "optimize away." If a decision needs to change, add a new entry below it — don't delete the old one, mark it superseded.

---

### D1: React Native + Expo over Flutter or native

**Reason:** The app's core complexity is timer state + audio cues + local storage — none of it needs platform-specific power. Expo gives background audio, timers, and notifications through simple JS APIs, letting one codebase cover iOS + Android without native build config overhead.

**Status:** Accepted

---

### D2: Timer engine uses elapsed real time, never a decrementing counter

**Reason:** Phones throttle background JS timers. If the engine just counts down with `setInterval`, the displayed time and audio cues drift once the screen locks or the app backgrounds — which happens on essentially every real session, since practitioners close their eyes and often set the phone face-down.

**Implementation rule:** Always compute remaining time as `phaseDuration - (Date.now() - phaseStartedAt)`. Never trust a counter that's just been decremented once per tick.

**Status:** Critical — do not change without updating this doc.

---

### D3: Zustand over Redux or Context API for business state

**Reason:** Only one active session exists at a time, plus a history list. Redux's boilerplate (actions, reducers, middleware) buys nothing here. Context API is fine for things like theme, but is the wrong tool for frequently-updating business state like a running timer — it causes unnecessary re-renders.

**Status:** Accepted

---

### D4: AsyncStorage over SQLite for v1

**Reason:** Data size is small (session configs + a history log of simple records) and there's no complex querying need (no joins, no heavy filtering across thousands of rows). SQLite would add setup and migration overhead with no real benefit at this scale.

**Revisit when:** History grows to a size or query complexity (e.g. "show me trends across techniques over a year") where AsyncStorage's flat JSON reads become slow.

**Status:** Accepted

---

### D5: TimerEngine, AudioService, and Storage are strictly decoupled

**Reason:** TimerEngine only emits events. AudioService only listens and plays. Storage only persists what it's told. This means we can swap sound packs, change the visual, or move to SQLite later without touching timer logic — and it makes TimerEngine unit-testable with zero mocking of UI or native modules.

**Status:** Accepted

---

### D6: No technique presets in v1 — SUPERSEDED

**Original reasoning:** Presets were excluded to keep v1 small, with custom duration input covering the use case instead.

**Why superseded:** Client requirement changed — v1 now ships with exactly **one fixed preset routine** ("Pranayama": preparation → chant → meditation → repeating pranayama-technique/witness pairs). This is not the same as "many presets to choose from" — it's a single, non-editable, content-driven routine. See D6a below.

**Status:** Superseded by D6a

---

### D6a: v1 ships three fixed builtin routines, defined as data, not built live by the user

**Reason:** The client needs three produced sequences (35/46/60-min sets, same six techniques, different durations) with real media assets attached to specific phases. This isn't something a user configures — it's content the app ships with. Modeling each as a plain data array (`Routine.phases: Phase[]`) keeps the TimerEngine completely unaware of what any phase "means" — it just plays phases in order. All meaning lives in `data/` routine files, not in engine or UI logic.

**Updated:** the original single "Pranayama" routine (18 phases, ~34.5 min) has been fully removed and replaced by three separate routines — see `04-routine-data.md` for the complete phase-by-phase data. This is not an addition alongside the old routine; the old one is gone.

**Implementation rule:** Do not hardcode phase order, technique names, or durations inside components or the engine. They live in data files so routines can be edited without touching logic. `BUILTIN_ROUTINES` now contains three entries instead of one.

**Status:** Accepted

---

### D7: Two session modes selected per-session, not detected/inferred

**Reason:** Simple work/rest and 4-phase breath cycle are different enough (2 phases vs 4, different mental model) that guessing which one a person wants from partial input would be fragile. Explicit mode selection at session setup is simpler and more honest than "smart" inference.

**Status:** Accepted

---

### D8: Audio is per-phase-category, spoken once for pranayama names, and selectively mutable

**Reason:** Refined client requirement, three parts:
1. **Chant phase has no audio at all** — it's visual/timer only, the client chants Om themselves. Don't attach any audio file to chant phases.
2. **Pranayama phases speak the technique's name once** at the start of the phase — not a looping track, not ambient sound for the whole duration.
3. **Mute setting is scoped, not global.** One toggle ("mute technique names") silences only the `technique-name` audio category. The witness-phase `bell` and the final `ending` sound must always play regardless of that toggle — they're not part of what gets muted.

**Implementation rule:** AudioService checks `audio.category` before deciding whether the mute setting applies. Never implement a single global "mute all audio" switch unless a future decision explicitly changes this — see D9a below for why category matters here.

**Status:** Critical — do not collapse to one global mute switch, and do not add looping audio to pranayama phases without checking with the person first.

---

### D9: Full-screen image only during `pranayama`-type phases

**Reason:** Client requirement — when a pranayama technique phase begins, its image should occupy the entire screen (replacing the normal calm-timer view used for prep/chant/meditation/witness phases). This is a rendering rule based purely on `phase.type`, decided in the UI layer (`ActiveSessionScreen` / a phase-type switch), never inside TimerEngine.

**Status:** Accepted

---

### D9a: Mute setting is scoped by audio category, not a single global switch

**Reason:** The client wants to be able to turn off the spoken pranayama technique names (perhaps once they've memorized them) without losing the witness-phase bell or the ending sound, which serve as timing/completion cues the client still relies on. A single global mute would remove functionality the client wants to keep.

**Implementation rule:** Settings stores `muteTechniqueNames: boolean` specifically — not a generic `audioEnabled` boolean. AudioService reads `phase.audio.category` and only checks this flag when `category === "technique-name"`.

**Status:** Critical — do not simplify to a single mute-all toggle.

---

### D14: Session-wide remaining time is computed by TimerEngine, never by the UI

**Reason:** Client needs a clock showing total time remaining in the WHOLE session (not just the current phase), and it must stay correct if the user skips a phase. If the UI computed this independently (e.g. by subtracting elapsed time from a session-start timestamp), a skip would silently desync it — the skipped phase's remaining time needs to actually disappear from the total, not just visually jump.

**Formula:** `totalSecondsRemaining = currentPhaseSecondsRemaining + sum(durationSeconds for all phases with index > currentPhaseIndex)`

This recalculates naturally and correctly on every skip, since skipping just advances `currentPhaseIndex` — no special-case skip logic needed for the clock itself, as long as the formula is applied fresh on every tick/phase-change rather than cached.

**Implementation rule:** TimerEngine (or sessionStore, reading TimerEngine's state) exposes `totalSecondsRemaining` as a computed value, recalculated on every tick and every phase change (including skips). ActiveSessionScreen only renders it — never computes it independently. Format as `MM:SS` (routines run under 100 min, so no need for an hours segment).

**Status:** Accepted

---

### D10: Data model must stay multi-routine-ready — routine list UI now built in v1

**Reason:** The client will add more routine bundles soon after launch. Originally this decision only asked for the data plumbing to be ready (array-based `ROUTINES`, no selection UI yet). That's now changed: the client wants the routine-card list built now, so adding future bundles requires zero UI rework — just adding entries to `ROUTINES`.

**Updated flow:**
```
HomeScreen           → renders one card per entry in ROUTINES (name + total duration)
        ↓ (tap a card)
RoutineDetailScreen  → shows the selected routine's info + "Begin Session" button
        ↓ (tap Begin Session)
ActiveSessionScreen  → unchanged, runs the routine
```

**Implementation rule:**
- HomeScreen renders `ROUTINES.map(...)` as tappable cards — even though `ROUTINES` currently has exactly one entry, the UI must not special-case "just show the one routine directly." It must render a list/grid, so a second entry added later needs no HomeScreen changes.
- Each card navigates to `RoutineDetailScreen` with the selected `routineId` as a nav param — do not navigate directly to `ActiveSessionScreen` from a card tap.
- `RoutineDetailScreen` looks up the routine from `ROUTINES` by `routineId`, displays its name and total duration (sum of `phases[].durationSeconds`), and only calls `sessionStore.startSession(routineId)` when "Begin Session" is tapped.
- The screen folder previously named `SessionConfigScreen` should be repurposed/renamed to `RoutineDetailScreen` — it is not a config screen, it's a detail/confirmation screen before starting.

**Status:** Accepted — supersedes the "no selection UI yet" clause of the original D10.

---

### D15: Persistent session notification while backgrounded — phase-change updates on both platforms

**Reason:** Timing and audio already survive backgrounding/lock correctly (D2, background audio config) — the session itself doesn't break when the user switches apps or locks the phone. What's missing is *visibility*: a way to see progress without reopening the app.

**Superseded during implementation:** this decision originally assumed Android's native chronometer (`setUsesChronometer`) would give a true live-ticking countdown via `expo-notifications`. During implementation the agent found `expo-notifications`'s `NotificationContentInput` type does not expose `usesChronometer` or `when` — those are raw native `Notification.Builder` fields not surfaced by the library. A true live tick on either platform would require dropping into a bare/native workflow (a custom native module), which is a meaningfully bigger scope than this feature warranted.

**Actual behavior, both platforms:** the notification updates once per phase change (session start, skip, natural transition) — showing the current phase name and that phase's remaining time — not a smooth per-second tick. Android's notification is non-dismissable (`ongoing`) while a session is active; iOS's is a regular dismissable alert (iOS doesn't support true persistent/ongoing notifications the way Android does).

**Implementation rule:**
- Use `expo-notifications` for a notification shown whenever a session is `RUNNING`, updated on phase change.
- Tapping the notification reopens the app to `ActiveSessionScreen`.
- Notification is dismissed automatically when the session completes or is manually ended.
- Request notification permission at session start (not app launch). If denied, the session must still run completely normally — no crash, no repeated permission prompting.

**Status:** Accepted, with the live-tick capability explicitly deferred. Revisit only if the client specifically wants true live-ticking, since it requires a bare/native workflow change — a meaningfully bigger scope than this feature.

---

### D16: Notification upgraded to periodic live updates + interactive Pause/Resume, riding on the existing background-audio keep-alive

**Reason:** The client wants the notification to feel live (phase name, phase time remaining, total time remaining) and to include working Pause/Resume buttons directly on the notification — usable while in another app or from the lock screen, without opening the app.

**Why this is now more achievable than D15 assumed:** the app already keeps its JS process alive while backgrounded, on both platforms, because of the existing background-audio requirement (D2/D8's background audio config) — that's the same mechanism that lets witness/completion chimes play while locked. Since the process is already alive for that reason, it can also periodically update the notification's text — this is different from D15's "phase-change only" limit, which assumed no ongoing background execution to drive it.

**What this gets us vs. what it doesn't:**
- ✅ Notification text (phase name, phase time remaining, total time remaining) refreshes periodically while backgrounded/locked — not phase-change-only anymore.
- ✅ Working Pause/Resume action buttons on the notification itself (via `expo-notifications` notification categories + `addNotificationResponseReceivedListener`), calling the existing `sessionStore.pauseSession()`/`resumeSession()`.
- ❌ Still NOT a true OS-native chronometer tick (per D15) — updates happen on an interval (e.g. every 5–10 seconds), not a smooth per-second visual tick, to avoid Android/iOS rate-limiting or visual flicker from updating a notification too frequently.
- ⚠️ Still subject to the same known limitation as D15: if the OS aggressively force-kills the process (some Android OEMs, or iOS under memory pressure), updates and the background audio it depends on both stop — this is a pre-existing risk, not a new one introduced here.

**Implementation rule:**
- Pick an update interval (suggest 5 seconds) and update the notification's phase name, phase-remaining, and session-total-remaining text on that interval while `RUNNING`, plus immediately on every phase change (don't lose the existing phase-change-triggered update).
- Register a notification category with `Pause`/`Resume` actions; the visible action swaps based on current session status (show "Pause" while running, "Resume" while paused) — don't show both simultaneously.
- The notification action listener calls the exact same `sessionStore` methods the in-app Pause/Resume buttons call — no separate/duplicate pause logic.
- Test that rapid interaction (tapping Pause from the notification, then immediately Resume from the notification) doesn't desync the in-app UI from the notification's displayed state — both must read from the same single source of truth (`sessionStore`), never track their own separate "paused" flag.

**Status:** Accepted — supersedes D15's "phase-change only" limitation. The chronometer-native-tick limitation from D15 still stands; this decision does not reverse that, it works around it differently.

**Update (platform split confirmed):** true Live Activities-style behavior on iOS (lock-screen live-ticking banner + inline pause button, like the Stopwatch app) is explicitly **out of scope** — it requires a native Swift widget extension and a paid Apple Developer account ($99/yr) to test/distribute on a real device, which is a meaningfully bigger undertaking than this project's scope. This was a deliberate choice, not an oversight: Android gets the near-live experience described below; iOS keeps the existing periodic notification from D16 as originally implemented (updates on phase change + interval), with no lock-screen live banner. Do not attempt Live Activities work without this decision being revisited first.

**Android update frequency increased:** since Android's background process already stays alive (same mechanism as background audio), reduce the update interval from 5 seconds to **1–2 seconds** for a near-live-tick feel. Confirm the exact interval doesn't trigger Android notification rate-limiting or visible flicker — test on a real device, adjust upward slightly (e.g. to 2s) if 1s proves unstable.

**Testing note:** the "notification goes static once I leave the app" symptom reported during testing was very likely an **Expo Go artifact**, not a real bug — `app.json`'s background-mode config only takes effect in an actual standalone build, and Expo Go doesn't honor project-specific native config. All further testing of this feature must happen on the real EAS preview build, not Expo Go.

---

### D17: CRITICAL — Android JS execution fully suspends on lock, breaking phase advancement, audio, and notifications together

**Discovered:** real-device testing on the EAS preview build revealed that once the Android screen locks, not just the notification freezes — **phase advancement itself stops**, and subsequent audio cues never fire. Only the phase already playing at the moment of locking continues naturally (that part is native, already in motion); everything after that requires reopening the app to "catch up," at which point D2's timestamp math correctly recalculates and jumps to the right phase.

**Root cause:** Android suspends an app's JavaScript execution entirely once the screen locks, unless the app is registered as a genuine **foreground service** — a much stronger, OS-level declaration than what `expo-notifications`'s `ongoing: true` flag provides (that flag only affects the notification's visual dismissability, not actual process/JS survival). Without a real foreground service, phase-advancement logic, audio-triggering logic, and notification-update logic — all of which live in JS — simply don't run while locked.

**Fix:** switch the notification library from `expo-notifications` to **`notifee`**, which supports genuine Android foreground services (plus native chronometer support, incidentally also solving the D15 "no true live tick" limitation). This is a bigger fix than originally scoped for D16 — it's not just a notification upgrade, it fixes the app's actual core background-operation promise. Works with Expo managed builds via a config plugin; no bare/eject workflow, no paid Apple account needed (this is an Android-side fix).

**iOS note:** iOS uses a different mechanism (background audio mode keeping the process alive, not a foreground service concept) and hasn't been confirmed broken in this same way — but the exact same class of bug is possible if iOS's background audio session isn't being kept continuously active between phases. Test iOS specifically for the same three symptoms (audio, phase advancement, notification) once the Android fix is in — don't assume iOS is fine just because it wasn't the one reported broken.

**Status:** Critical — this must be fixed before the app can be considered to actually deliver on its core purpose. Do not treat this as a nice-to-have notification polish item.

**Scope simplified:** audio is no longer required to play while the app is backgrounded/locked — that requirement is dropped. What's still required: the notification must keep ticking correctly and must correctly switch to the next phase's info when a phase ends, while locked. This still requires the same foreground-service fix (notifee) — a foreground service is what keeps the JS process alive long enough to detect a phase ending and update the notification to the next one; without it, the notification would freeze on lock exactly as before, just without the audio complication. Use notifee's native Android chronometer for the current phase's live countdown display (ticks with zero JS needed once set) plus the session-total-remaining as secondary text, refreshed on each phase change.

**Suggested notification format:**
```
🧘 [Phase Label]
[MM:SS remaining]        ← native chronometer, ticks live
[MM:SS] left in session   ← updates on phase change
```

---

### D18: Session-start bell — reuses the same completion bell audio, triggered by lifecycle not phase data

**Reason:** Sessions currently start in total silence — no audio plays until the first witness bell, which feels dead. Fix: play the same bell sound already used for session completion (`category: "ending"`) once at the very start of every session too.

**Implementation rule:** this is triggered directly from `sessionStore.startSession()` as a lifecycle event — NOT added as `audio` data on each routine's first phase. This is deliberate: doing it at the lifecycle level means it automatically applies to every routine, including builtin sets AND any user-created custom routine, without needing to edit routine data or expect users to add it themselves when building a custom routine. Reuse the exact same audio file already used for the completion/`ending` category — don't create a duplicate asset.

**Status:** Accepted