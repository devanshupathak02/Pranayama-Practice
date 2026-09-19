# PWA Migration — Architecture & Decisions

Client decision: no Apple/Google store publishing, to avoid the $99/yr + $25 costs. Instead, the app becomes a PWA (Progressive Web App) hosted at **app.smwr.org**, installable via "Add to Home Screen," with real Web Push notifications for background progress (client explicitly chose to build this properly rather than accept a degraded "foreground-only" experience).

## What's reused vs. rebuilt

**Reused almost as-is** (via Expo's web export, `expo export --platform web`):
- `TimerEngine` (pure TS, D2's timestamp-based math — works identically on web)
- `sessionStore`, `routineStore` (Zustand — platform-agnostic)
- All routine data (`04-routine-data.md`'s three builtin sets + custom routine model)
- Most UI components (React Native Web renders existing components fine)
- `05-design-system.md`'s color tokens/theme

**Must be rebuilt** (native-only APIs with no web equivalent):
| Native (current) | Web replacement |
|---|---|
| `AsyncStorage` | `IndexedDB` (via a wrapper matching AsyncStorage's get/set interface, to minimize changes elsewhere) |
| `expo-audio` | HTML `<audio>` element / Web Audio API |
| `expo-image-picker` / `expo-document-picker` | Native HTML `<input type="file" accept="image/*">` / `accept="audio/*"` |
| `notifee` (Android foreground service + chronometer) | Web Push API (see below) — fundamentally different mechanism |
| `eas build` / app store distribution | Static hosting + PWA manifest, no app store at all |

## D19: PWA chosen over native app store distribution

**Reason:** client wants zero ongoing/one-time store costs ($99/yr Apple, $25 one-time Google). A PWA hosted on the client's own domain has no store fees at all — installable via browser "Add to Home Screen."

**Trade-off accepted knowingly:** a PWA cannot register a true native foreground service (the fix from D17). Background/locked-screen behavior must be rebuilt using Web Push, which is architecturally different — notifications are triggered by a server pushing to the device, not the device's own app keeping itself alive. This is real, new infrastructure, not a small tweak.

**Status:** Accepted

## D20: Web Push architecture — scheduled server-side pushes, not client-side timers

**Reason:** a backgrounded/closed browser tab cannot reliably run JS on a timer to trigger its own notifications — the whole reason D17 existed was that even a backgrounded *native app* struggled with this; a browser tab has less background privilege, not more. The only reliable way to deliver a notification at a precise future time (e.g. "phase changes in 3 minutes") is to have a server schedule and send it.

**Architecture:**
```
Session starts (client, in-browser)
        ↓
Client computes exact future timestamps for every phase change,
witness bell, and completion (same D2 math, just used to schedule
future events instead of only checking elapsed time)
        ↓
Client sends these scheduled times + push subscription to backend
        ↓
Backend schedules a delayed webhook per event (via a scheduling
service — see below)
        ↓
At each scheduled time, backend sends a real Web Push notification
to the device via the stored push subscription
        ↓
Device shows notification even if the tab/app is fully closed
(this is Web Push's actual capability — better than what a PWA's
own JS could do on its own)
```

**Recommended free stack:**
- **Push delivery:** Web Push API + VAPID keys (free, open web standard, no service needed — just a small server-side library like `web-push` npm package).
- **Scheduling delayed sends:** **Upstash QStash** (generous free tier, purpose-built for "call this webhook N seconds from now" — exactly what's needed here, no server of your own needs to stay running).
- **Storing push subscriptions:** a small database — **Supabase** free tier is a good fit (just one table: `push_subscriptions`, keyed by a device/session identifier).
- **Hosting the backend endpoints:** serverless functions on **Vercel** or **Netlify** (both have generous free tiers, and can host the static PWA itself too, in the same project).

**iOS caveat, stated plainly:** Web Push on iOS only works if the user has already tapped "Add to Home Screen" — a plain Safari tab cannot receive push notifications at all, no matter what the backend does. This must be communicated to users (e.g. an on-screen prompt: "Add this to your Home Screen to get session reminders").

**Scope simplified:** the PWA's Web Push notification is informational only — phase name + time remaining. No interactive Pause/Resume action buttons on the notification itself (this applies ONLY to the new PWA/Web Push notification — the native app's existing notifee-based notification keeps its Pause/Resume buttons unchanged). Reason: a Web Push action tap would need the service worker to signal pause/resume back into the running app's state, with no clean equivalent to notifee's direct in-process callback — removing this avoids a fragile, complex piece of Phase D. Pausing/resuming a session still works normally from within the app; it just can't be triggered from the push notification itself.

**Status:** Accepted — this is the "do it properly" option the client chose, over the simpler "foreground only" fallback.

## D21: Storage layer — IndexedDB behind an AsyncStorage-shaped wrapper

**Reason:** minimize changes to `db.ts`, `sessionStore`, `historyStore`, `routineStore` — all of which currently call `AsyncStorage`-shaped methods. Write a thin wrapper exposing the same `get/set/delete` shape, backed by IndexedDB under the hood, so the calling code barely changes.

**Status:** Accepted

## Migration phases (mirrors the original native build's phase structure)

1. **Phase A:** Expo web export working locally, confirm existing UI/timer/routine logic renders and runs correctly in a browser (before touching audio/storage/push at all).
2. **Phase B:** Swap storage (IndexedDB wrapper) and media pickers (HTML file inputs) — get full feature parity for foreground use.
3. **Phase C:** PWA manifest + service worker + installability (Add to Home Screen working on both Android Chrome and iOS Safari).
4. **Phase D:** Web Push backend (QStash + Supabase + VAPID) — the biggest, riskiest phase, test thoroughly on real devices, both platforms.
5. **Phase E:** Domain/hosting setup at `app.smwr.org`, final production deploy.

## Domain setup (client has direct DNS access)

Add a CNAME (or A record, depending on the chosen host's instructions) for `app.smwr.org` pointing to wherever the PWA is deployed (Vercel/Netlify will give the exact record to add once the project is created there). SSL is handled automatically by these hosts.