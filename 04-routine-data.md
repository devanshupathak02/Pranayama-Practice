# Routine Data — Three Builtin Sets (v1)

The old single "Pranayama" routine is **removed entirely**. This file is the complete replacement — the literal content for the three builtin routines. Do not alter order, durations, or audio rules — this is client-approved content from their spreadsheet, not a placeholder.

## Shared rules across all three routines

- All three are `source: "builtin"`, non-editable by users.
- Same six pranayama techniques, same order, in every routine: Bhastrika → Kapalbhati → Bahya → Ujjayi → Anulom Vilom → Bhramari.
- Every technique is followed by a **1-minute** Normal Breath / Witness pause (not 35 sec — that was the old routine's number, this is different and explicit in the client's data).
- "Chant Om 3 Times" and "Chant Om 5 Times" are **visual only, no audio** — same treatment as the original Om Chant phase.
- Technique phases (`pranayama` type) keep the same behavior as before: full-screen image + spoken technique name once at phase start, mutable via the existing `muteTechniqueNames` setting.
- `Settle in / Meditation`, `Meditation` (closing), and `Shavasana` are all timer-only, no audio, no image — calm view, same as `meditation` phases always were.
- Completion bell fires immediately after Shavasana ends, same as before.
- **Asset reuse:** image/audio files for the six techniques are identical across all three routines — reuse the same files already named (e.g. `bhastrika.png` / `bhastrika_name.mp3`, etc.), don't create per-routine duplicates.

## New phase types needed

Add two values to `PhaseType`: `"chant"` and `"shavasana"`. Both render identically to `"meditation"` (calm timer view, no image, no audio) — they exist only for correct labeling/history, not different UI behavior. Full-screen-image logic stays presence-based (`!!phase.image`) per D13, unaffected by these additions.

```
type PhaseType = "preparation" | "meditation" | "pranayama" | "witness" | "ending" | "chant" | "shavasana" | "custom"
```

## Routine 1 — "35 Min Set" (id: `set-35`)

| Phase | type | Duration |
|---|---|---|
| Settle in / Meditation | meditation | 2 min (120s) |
| Chant Om 3 Times | chant | 1 min (60s) |
| Bhastrika | pranayama | 3 min (180s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Kapalbhati | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bahya | pranayama | 3 min (180s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Ujjayi | pranayama | 3 min (180s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Anulom Vilom | pranayama | 3 min (180s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bhramari | pranayama | 2 min (120s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Chant Om 5 Times | chant | 2 min (120s) |
| Meditation (closing) | meditation | 3 min (180s) |
| Shavasana | shavasana | 3 min (180s) |
| **Completion bell** | ending | instant |

**Total: 35 min** (matches spreadsheet)

## Routine 2 — "46 Min Set" (id: `set-46`)

| Phase | type | Duration |
|---|---|---|
| Settle in / Meditation | meditation | 4 min (240s) |
| Chant Om 3 Times | chant | 1 min (60s) |
| Bhastrika | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Kapalbhati | pranayama | 7 min (420s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bahya | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Ujjayi | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Anulom Vilom | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bhramari | pranayama | 4 min (240s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Chant Om 5 Times | chant | 2 min (120s) |
| Meditation (closing) | meditation | 3 min (180s) |
| Shavasana | shavasana | 3 min (180s) |
| **Completion bell** | ending | instant |

**Total: 46 min** (matches spreadsheet)

## Routine 3 — "60 Min Set" (id: `set-60`)

| Phase | type | Duration |
|---|---|---|
| Settle in / Meditation | meditation | 5 min (300s) |
| Chant Om 3 Times | chant | 2 min (120s) |
| Bhastrika | pranayama | 5 min (300s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Kapalbhati | pranayama | 10 min (600s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bahya | pranayama | 5 min (300s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Ujjayi | pranayama | 5 min (300s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Anulom Vilom | pranayama | 5 min (300s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Bhramari | pranayama | 5 min (300s) |
| Normal Breath / Witness | witness | 1 min (60s) |
| Chant Om 5 Times | chant | 3 min (180s) |
| Meditation (closing) | meditation | 4 min (240s) |
| Shavasana | shavasana | 5 min (300s) |
| **Completion bell** | ending | instant |

**Total: 60 min** (matches spreadsheet)

## Naming assumption flagged

Routine `name` fields aren't specified by the client beyond the spreadsheet column headers ("1st set 35 Min", etc.). Suggested display names: **"35 Minute Practice"**, **"46 Minute Practice"**, **"60 Minute Practice"** — clean and duration-forward for the HomeScreen cards. Confirm with client if they'd prefer different naming (e.g. beginner/intermediate/advanced), otherwise proceed with duration-based names.

## Migration note for the agent

- Delete/replace `PRANAYAMA_ROUTINE` in `app/data/pranayamaRoutine.ts` — either rename the file to reflect the new content or replace it with three exported routine objects (e.g. `SET_35_ROUTINE`, `SET_46_ROUTINE`, `SET_60_ROUTINE`).
- Update `BUILTIN_ROUTINES` (the array feeding `ROUTINES`, per D10/D10a) to contain these three instead of the old one.
- Any existing history records referencing the old `pranayama-v1` routineId will still display correctly by stored `routineName` (per the existing SessionRecord design) even though the routine itself no longer exists — no migration needed for history.
