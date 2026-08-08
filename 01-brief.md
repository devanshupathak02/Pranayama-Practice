# Brief — Pranayama Interval Timer

## Vision

A distraction-free breathing timer for people who practice pranayama. It should feel like a quiet instrument, not a gym app repurposed with a yoga skin. The person using it usually has their eyes closed — the app's job is to hold time accurately and speak through sound, not through a screen they're staring at.

## Why this exists

Every popular interval timer (Tabata, HIIT apps) is built for a person watching a countdown with their eyes open, expecting sharp digital beeps, and stopping the session if their phone locks. None of that fits pranayama:

- Practitioners keep eyes closed through most of a session.
- Sessions require gentle, distinguishable audio cues per phase, not one generic beep.
- The phone is often face-down or the screen is off — timing must not drift when backgrounded.
- Session structure varies: some techniques are simple work/rest repeated for rounds (Tabata-style), others are four-phase breath cycles (inhale / hold / exhale / hold) with independently configurable durations.

## Non-negotiable requirements

| Requirement | Target |
|---|---|
| Works fully offline | Yes — no network calls required to run a session |
| Timing stays accurate when screen is locked / app backgrounded | Yes — timestamp-based, not counter-based |
| No account required | Yes — all data stays on-device |
| One fixed preset routine (v1) | "Pranayama" — a specific ordered sequence, not user-built |
| Each phase can carry media | Full-screen image + pre-recorded audio, per phase, not a generic tone |
| Session history | Local log of past sessions (date, routine, duration, completed) |
| App launch time | Under 2 seconds |
| Works in dark mode | No — v1 uses a single light, warm theme (see 05-design-system.md). Dark mode is not required for v1. |

## The v1 routine: "Pranayama"

This is the one and only routine shipped in v1, defined as a fixed, ordered sequence of phases:

```
1. Preparation                          — 10 sec
2. Meditation (Pranav, top)              — 1 min  (60 sec)
3. Bhastrika Pranayam (Bellows Breath)   — 2 min  (120 sec) → Witness/Normal Breath (35 sec)
4. Kapalbhati Pranayam                   — 5 min  (300 sec) → Witness/Normal Breath (35 sec)
5. Bahya Pranayam                        — 2 min  (120 sec) → Witness/Normal Breath (35 sec)
6. Ujjayi Pranayam                       — 2 min  (120 sec) → Witness/Normal Breath (35 sec)
7. Anulom Vilom Pranayam                 — 5 min  (300 sec) → Witness/Normal Breath (35 sec)
8. Bhramari Pranayam                     — 3 min  (180 sec) → Witness/Normal Breath (35 sec)
9. Udgeeth Pranayam (chant Om ×5)        — 4 min  (240 sec) → Witness/Normal Breath (35 sec)
10. Pranav (meditation, end)              — 5 min  (300 sec)
11. Completion bell rings
```

Preparation (10 sec) and the first Meditation/Pranav (1 min) happen once, at the very start, with no witness pause between them. From item 3 onward, every pranayama technique is followed by a fixed 35-second Normal Breath / Witness pause — same duration for all seven techniques regardless of the technique's own length. The final Pranav meditation (5 min) is **not** followed by a witness pause — the completion bell rings immediately once it ends.

**Assumption flagged:** the client's instructions didn't explicitly say whether a witness pause follows the closing Pranav meditation before the bell. This spec assumes **no** — bell fires right when Pranav ends. If that's wrong, this is a one-line change in the routine data file, not a structural one.

Total routine length: 10s + 60s + (7 technique durations + 7×35s witness) + 300s (closing Pranav) ≈ 34 min 30 sec.

**Audio mute rule:** the app has one settings toggle — "mute pranayama technique names" — which only affects the spoken technique-name audio in the 7 pranayama phases. It does **not** affect the witness-phase bell or the final completion bell; those always play regardless of that setting.

**Key structural implication:** a routine is not a live user-configured interval list — it's closer to a **content playlist**: an ordered array of phase objects, each with a `type`, a `duration`, and optional `image` + `audioFile` fields. The engine doesn't care what a phase "means" — it just plays phases in order. All the meaning (which image, which audio, which technique) lives in data, not in engine logic.

## Explicitly out of scope for v1

- User accounts / cloud sync (custom routines are stored locally on-device only, not synced)
- Apple Health / Google Fit integration
- Social features, sharing, streak leaderboards
- Sharing custom routines between users/devices

These aren't rejected forever — they're deferred so v1 ships. Record any future decision to add them in `decisions.md`.

**Note:** user-built custom routines are now IN scope — see `06-custom-routines.md` for the full spec. This supersedes the earlier restriction against user-built routines.

## Target user

**Primary:** an individual pranayama practitioner who wants a timer that respects how the practice actually feels — calm, audio-led, accurate when unattended.

**Not the target for v1:** instructors managing multiple students, therapists needing clinical logging. Building for one person doing their own practice keeps v1 honest and shippable.

## Architecture style

```
Presentation Layer   (screens, components — render only)
        ↓
Business Layer       (SessionStore — orchestrates, exposes actions)
        ↓
Timer Engine         (pure state machine — no UI, no audio, no storage)
        ↓
Event Bus            (phase-change / round-change events)
        ↓
Audio Service        (listens to events, plays cues)
        ↓
Storage              (session config + history, local only)
```

## Layer responsibilities

### TimerEngine
**Responsible for:** running the countdown, changing phases, changing rounds, emitting events, calculating remaining time from elapsed real time (not decrementing a counter).
**Never:** renders UI, plays sound, reads/writes storage, knows about React at all. It should be portable enough to unit-test with zero UI dependencies.

### SessionStore (Zustand)
**Responsible for:** holding the current `SessionConfig` and `SessionState`, exposing `start() / pause() / resume() / reset()`, telling TimerEngine what to do.
**Never:** contains audio logic or storage logic directly — it calls out to AudioService and Storage, it doesn't own their implementation.

### AudioService
**Responsible for:** subscribing to phase-change events, playing whatever audio file is attached to the current phase's data (chant recording, technique-specific pranayama recording, etc.), including while backgrounded.
**Never:** touches the timer's internal state or drives timing itself. It only reacts. It doesn't decide which file plays — that's data on the phase, not logic in the service.

### Storage
**Responsible for:** persisting SessionConfig presets the user saves, and completed session history.
**Never:** contains business rules about what counts as a "completed" session — that's TimerEngine/SessionStore's call; Storage just saves what it's told.

## Folder structure

```
app/
  screens/
    HomeScreen/
    SessionConfigScreen/
    ActiveSessionScreen/
    HistoryScreen/
    SettingsScreen/
  components/
    BreathingCircle/
    PhaseIndicator/
    RoundCounter/
  timer/
    TimerEngine.ts
    types.ts
  audio/
    AudioService.ts
  store/
    sessionStore.ts
    historyStore.ts
  storage/
    db.ts
  navigation/
    RootNavigator.tsx
  models/
    Routine.ts
    Phase.ts
  data/
    pranayamaRoutine.ts     // the fixed "Pranayama" routine definition
  constants/
  utils/
assets/
  images/
    pranayama/              // one image per technique
  audio/
    pranayama/               // one technique-name recording per technique
    bell/                    // witness bell + completion bell
```

## Phase data shape (replaces free-form custom config)

```
Phase {
  id: string
  type: "preparation" | "meditation" | "pranayama" | "witness" | "ending"
  label: string               // e.g. "Kapalbhati Pranayam", "Udgeeth Pranayam"
  durationSeconds: number
  image?: ImageSource          // only pranayama phases use this (full-screen)
  audio?: {
    file: AudioSource
    category: "technique-name" | "bell" | "ending"   // determines mute behavior
    playOnce: boolean          // true = play once at phase start, don't loop for duration
  }
}

Routine {
  id: string
  name: string                 // "Pranayama" for v1
  phases: Phase[]               // fixed order, defined in data/pranayamaRoutine.ts
}
```

The TimerEngine only ever sees this generic `Phase[]` array — it has no special-case logic for any specific technique. The UI layer is what decides: if `phase.type === "pranayama"`, render the image full-screen; otherwise render the calm timer view. `meditation` phases (both the opening 1-min Pranav and the closing 5-min Pranav) have no `audio` field — timer/visual only. Udgeeth Pranayam is modeled as a normal `pranayama`-type phase like the other six — its "chant Om ×5" instruction is just its `label` and spoken-name audio, not a separate phase type.

AudioService respects a settings flag `muteTechniqueNames: boolean` — when true, it skips playback only for `category: "technique-name"` audio. `bell` and `ending` categories always play regardless of that setting.

## Definition of done for v1

A person can: open the app, tap the single "Pranayama" routine, have it run through all 10 phases in exact order and duration as specified above, lock their phone partway through, unlock it and find timing hasn't drifted, hear the correct technique name once at the start of each pranayama phase (unless muted), hear the witness bell after each of the 7 techniques, see the correct full-screen image during each pranayama phase, hear the completion bell when Pranav (closing) ends, and see the completed session logged in history — with zero crashes.
