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
