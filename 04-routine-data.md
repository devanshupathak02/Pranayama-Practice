# Routine Data — "Pranayama" (v1, single fixed routine)

This is the literal content for `app/data/pranayamaRoutine.ts`. Do not alter order, durations, or the audio/mute rules described here — this is client-approved content, not a placeholder.

## Ordered phase list

| # | type | label | duration | image | audio category | audio behavior |
|---|---|---|---|---|---|---|
| 1 | preparation | Preparation | 10 sec | — | — | none |
| 2 | meditation | Pranav (opening meditation) | 60 sec | — | — | none |
| 3 | pranayama | Bhastrika Pranayam (Bellows Breath) | 120 sec | ✅ full-screen | technique-name | plays once at phase start |
| 4 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 5 | pranayama | Kapalbhati Pranayam | 300 sec | ✅ full-screen | technique-name | plays once at phase start |
| 6 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 7 | pranayama | Bahya Pranayam | 120 sec | ✅ full-screen | technique-name | plays once at phase start |
| 8 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 9 | pranayama | Ujjayi Pranayam | 120 sec | ✅ full-screen | technique-name | plays once at phase start |
| 10 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 11 | pranayama | Anulom Vilom Pranayam | 300 sec | ✅ full-screen | technique-name | plays once at phase start |
| 12 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 13 | pranayama | Bhramari Pranayam | 180 sec | ✅ full-screen | technique-name | plays once at phase start |
| 14 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 15 | pranayama | Udgeeth Pranayam (chant Om ×5) | 240 sec | ✅ full-screen | technique-name | plays once at phase start |
| 16 | witness | Normal Breath / Witness | 35 sec | — | bell | always plays, not mutable |
| 17 | meditation | Pranav (closing meditation) | 300 sec | — | — | none |
| 18 | ending | Completion | 0 sec (instant) | — | ending | always plays, not mutable, fires immediately when phase 17 ends |

**Total runtime: ≈ 34 min 30 sec**

## Rules the agent must follow exactly

1. Phase order above is fixed and non-editable by the user in v1. Do not build a UI for reordering or adding/removing phases.
2. Exactly one settings toggle exists: `muteTechniqueNames: boolean`. It silences ONLY `audio category: technique-name` playback. `bell` and `ending` categories are never affected by any mute setting.
3. `technique-name` audio plays once, at the moment the phase starts — it is not looped for the phase's full duration.
4. `image` is shown full-screen only during `pranayama`-type phases. All other phase types (`preparation`, `meditation`, `witness`) use the standard calm timer view (no full-screen image).
5. Placeholder assets (images/audio files) are fine for Phase 1/2 scaffolding — but the data structure (7 techniques, exact durations, exact order) must match this table exactly, not be simplified or approximated.
6. This is the ONLY routine in v1. Do not build multi-routine selection UI.
