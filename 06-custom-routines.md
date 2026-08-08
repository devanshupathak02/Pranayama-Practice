# Custom Routines — Feature Spec

Users can build their own routines from scratch: name it, add/reorder/remove phases, set each phase's duration, and attach a custom image and custom audio per phase (both picked from the user's phone). The original "Pranayama" routine is never modified — custom routines are entirely separate, additional entries in `ROUTINES`.

## Scope confirmed with client/user

- Editing creates a **new custom routine** — the built-in "Pranayama" routine is read-only and untouched.
- Per phase, users can customize: **duration, order (add/remove/reorder), image, and audio.**
- Images come from the **user's own phone photo library** (not a stock library).

## Data model changes

```
Routine {
  id: string
  name: string
  source: "builtin" | "custom"      // NEW — builtin = shipped Pranayama routine, custom = user-created
  phases: Phase[]
}

Phase {
  id: string
  type: "preparation" | "meditation" | "pranayama" | "witness" | "ending" | "custom"
                                       // "custom" = user-defined phase in a custom routine, no fixed meaning
  label: string
  durationSeconds: number
  image?: ImageSource                  // local file URI for custom routines, bundled asset for builtin
  audio?: {
    file: AudioSource                  // local file URI for custom routines, bundled asset for builtin
    category: "technique-name" | "bell" | "ending" | "custom"
    playOnce: boolean
  }
}
```

## D13: Full-screen image rule changes from type-based to presence-based

**Original D9** said: full-screen image only when `phase.type === "pranayama"`. That doesn't generalize to custom routines, where phase types are arbitrary/"custom."

**New rule:** full-screen image shows whenever `phase.image` is present/truthy — regardless of `phase.type`. This is a strict generalization, not a behavior change for the builtin routine (its pranayama phases already have images, its other phases don't), but it makes the rule correctly apply to any custom phase a user attaches an image to.

**Update ActiveSessionScreen accordingly:** check `if (phase.image)`, not `if (phase.type === 'pranayama')`.

## Critical: picked media must be copied into permanent app storage

**The problem:** when a user picks a photo or audio file from their phone, the picker returns a temporary URI (especially on iOS) that can become invalid later — after the OS clears cache, revokes permission-scoped access, or the original file moves/deletes. If a custom routine's `Phase.image` stores that temporary URI directly, the image can silently break days later.

**The fix:** immediately after picking, copy the file into the app's own permanent storage directory, and store *that* stable path — never the picker's original URI.

```
Use expo-file-system:
  FileSystem.documentDirectory + 'custom-media/' + generatedFilename

On pick:
  1. User picks image/audio via picker
  2. Copy picked file to FileSystem.documentDirectory + 'custom-media/{uuid}.{ext}'
  3. Store that permanent path in Phase.image / Phase.audio.file
  4. Never store the picker's original (temporary) URI
```

**Status: Critical** — skipping this step is the single most likely cause of "my custom routine's images disappeared" bug reports later.

## Picker libraries

- **Images:** `expo-image-picker` — `launchImageLibraryAsync()`, restricted to photo library (no camera needed unless later requested).
- **Audio:** `expo-document-picker` filtered to `type: 'audio/*'` — Expo doesn't have a dedicated "pick audio from library" API, but the document picker surfaces audio files from the Files app (iOS) / device storage (Android), which covers this.

## New/modified screens

### RoutineBuilderScreen (NEW)
Used for both creating a new custom routine and editing an existing custom one (never used on the builtin routine).
- Routine name text input.
- Ordered list of phases, each showing: label, duration, thumbnail (if image set), audio indicator (if audio set).
- Per phase: edit duration, pick/replace image, pick/replace audio, edit label.
- Add Phase button (appends a new blank phase to the end).
- Remove phase (swipe or explicit delete button per row).
- Reorder phases (drag handles — needs a library such as `react-native-draggable-flatlist`, since native `FlatList` doesn't support drag-reorder).
- Save button — validates routine has a name and at least one phase, generates a new `id` (uuid) for new routines, persists to storage, and returns to HomeScreen.

### HomeScreen (MODIFIED)
- Renders `ROUTINES.map(...)` as before (builtin + custom routines together).
- Custom routines show a small **"Custom"** badge on their card (small pill/label, distinct from the duration/phase-count badges — e.g. top corner of the card) so users can visually tell their own routines apart from the client's official "Pranayama" routine. Builtin routines show no such badge.
- New **"+ Create Routine"** card/button, always present, navigates to `RoutineBuilderScreen` in "create" mode.
- **No limit** on the number of custom routines a user can create — HomeScreen's list must scroll/handle an arbitrary number of cards, not assume a small fixed count.

### RoutineDetailScreen (MODIFIED)
- For `source: "custom"` routines only: show **Edit** and **Delete** actions in addition to "Begin Session."
- Delete requires a confirmation dialog (destructive action). On delete: remove from `ROUTINES`/storage. Do NOT delete the associated media files automatically in v1 (safer default — orphaned files cost disk space but avoid any risk of deleting something still referenced elsewhere; can be revisited later).
- For `source: "builtin"` routines: no Edit/Delete — read-only as before.

## Storage changes

- New storage key/table for custom routines, separate from settings and history: `saveCustomRoutine`, `loadCustomRoutines`, `deleteCustomRoutine` in `app/storage/db.ts`.
- At app startup, `ROUTINES` is composed as `[...BUILTIN_ROUTINES, ...await loadCustomRoutines()]` — builtin routines remain hardcoded in `data/pranayamaRoutine.ts`, custom ones load from `AsyncStorage`.

## History behavior when a custom routine is later deleted

Already handled correctly by the existing data model: `SessionRecord` stores both `routineId` AND `routineName` (see Phase 2 spec). If a custom routine is deleted after a session was logged, the history entry still displays the routine's name correctly — it just can't be "started again" from that history entry, which is expected and fine.

## Explicitly out of scope for this feature (v1)

- Editing the builtin "Pranayama" routine — never editable.
- Sharing/exporting a custom routine to another device or user.
- Stock/built-in image library as an alternative to the photo picker (photo library only, per confirmed scope).
- Recording audio directly in-app (only picking existing audio files from the device).
- Automatic cleanup of orphaned media files when a routine/phase is deleted.
