# Pranayama Timer App

A distraction-free, audio-led interval timer built for pranayama breathing practices (React Native + Expo).

---

## 🚀 Quick Start

### 1. Local Development
Ensure Node.js (v20+) is installed, then run:

```bash
# Install dependencies
npm install

# Start Expo development server (clearing cache)
npx expo start -c
```

Scan the displayed QR code using the **Expo Go** app on iOS or Android.

### 2. Building Standalone Preview APK for Android Client
To generate a standalone `.apk` build to send directly to your client without requiring Expo Go:

```bash
# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build preview APK for Android
eas build --platform android --profile preview
```

The resulting `.apk` download link will be output directly in your terminal upon completion.

---

## 🎨 Asset File Registry & Client File Swaps

All media assets are cleanly wired in `app/data/pranayamaRoutine.ts`. To swap in real client-provided recordings or graphic designs, drop your files into the designated directories using these **exact filenames**:

### Technique Full-Screen Images (`assets/images/pranayama/`)
| Filename | Dimensions | Phase | Description |
|---|---|---|---|
| `bhastrika.png` | 1080×1920 (Portrait) | Phase 3 | Bhastrika Pranayam (Bellows Breath) |
| `kapalbhati.png` | 1080×1920 (Portrait) | Phase 5 | Kapalbhati Pranayam |
| `bahya.png` | 1080×1920 (Portrait) | Phase 7 | Bahya Pranayam |
| `ujjayi.png` | 1080×1920 (Portrait) | Phase 9 | Ujjayi Pranayam |
| `anulom_vilom.png` | 1080×1920 (Portrait) | Phase 11 | Anulom Vilom Pranayam |
| `bhramari.png` | 1080×1920 (Portrait) | Phase 13 | Bhramari Pranayam |
| `udgeeth.png` | 1080×1920 (Portrait) | Phase 15 | Udgeeth Pranayam (chant Om ×5) |

### Bell Audio Cues (`assets/audio/bell/`)
| Filename | Format | Category | Behavior |
|---|---|---|---|
| `witness_bell.mp3` | MP3 / WAV | `bell` | Plays ONCE at start of 35s Witness phases (unmutable) |
| `completion_bell.mp3` | MP3 / WAV | `ending` | Plays ONCE when Phase 17 Pranav ends (unmutable) |

### Spoken Technique Name Audio (`assets/audio/pranayama/`)
| Filename | Format | Category | Behavior |
|---|---|---|---|
| `bhastrika_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 3 (silenced if muted) |
| `kapalbhati_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 5 (silenced if muted) |
| `bahya_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 7 (silenced if muted) |
| `ujjayi_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 9 (silenced if muted) |
| `anulom_vilom_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 11 (silenced if muted) |
| `bhramari_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 13 (silenced if muted) |
| `udgeeth_name.mp3` | MP3 / WAV | `technique-name` | Plays ONCE at start of Phase 15 (silenced if muted) |

---

## 🏛️ Architecture Overview

The app is built using a strictly decoupled, layered architecture:

```
Presentation Layer   (HomeScreen, RoutineDetailScreen, ActiveSessionScreen, HistoryScreen, SettingsScreen)
        ↓
Business Layer       (Zustand sessionStore & historyStore)
        ↓
Timer Engine         (Pure TypeScript state machine — Date.now() deltas, zero UI/Audio/Storage imports)
        ↓
Event Bus / Callbacks (onPhaseChange, onTick, onComplete)
        ↓
Audio Service        (expo-audio — background audio & category-scoped muting)
        ↓
Storage              (AsyncStorage — persistent settings & session history)
```

### Architectural Highlights
- **Timestamp-Driven Engine (D2):** Remaining phase time is strictly computed as `phaseDuration - (Date.now() - phaseStartedAt)`. Eliminates background timer drift when screen is locked.
- **Pure Decoupled Engine (D5):** `TimerEngine.ts` has zero dependencies on React, audio, or storage modules.
- **Multi-Routine Extensibility (D10):** `ROUTINES` registry array and `RoutineDetailScreen` allow adding future routines without refactoring core plumbing.
- **Scoped Audio Muting (D8, D9a):** `muteTechniqueNames` silences ONLY spoken technique names. Witness bells and completion chime always play.
- **Full-Screen Image Scoping (D9):** Full-screen background image renders ONLY during `pranayama` phases. All other phases render calm view with `BreathingCircle`.

For complete design rationale and architectural history, refer to [01-brief.md](file:///c:/Users/devan/Desktop/Pranayama%20practice/01-brief.md) and [02-decisions.md](file:///c:/Users/devan/Desktop/Pranayama%20practice/02-decisions.md).
