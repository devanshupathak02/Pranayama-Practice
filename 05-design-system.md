# Design System — Light, Warm, Premium Theme

This supersedes the earlier dark-navy default theme from Phase 1. Apply these exact values across every screen — do not approximate or pick similar-looking colors.

## Why this direction

Dark navy read as a utility/fitness-tracker app. This app is a guided breathing practice — the palette should feel calm, warm, and premium rather than technical. Cream/warm-white surfaces with a restrained gold/amber accent, generous whitespace, soft rounded corners, and subtle shadows (not flat, not harsh) is the target feel.

## Color tokens

| Token | Hex | Usage |
|---|---|---|
| `background` (page) | `#FAF7F2` | App background, all screens |
| `surface` (cards, default) | `#FFFFFF` | Default card/panel background |
| `surface-tinted` (accent cards) | `#FAEEDA` | The routine card on HomeScreen, any highlighted/featured card |
| `border` | `#EFE8DA` | Default hairline borders on cards/dividers |
| `border-accent` | `#D8A93B` | Border on the tinted/accent card specifically |
| `text-primary` | `#2C2416` | Headings, primary body text (warm charcoal, not pure black) |
| `text-secondary` | `#6B5D4F` | Supporting text, descriptions |
| `text-muted` | `#9C8F7D` | Placeholder text, least emphasis |
| `accent` (buttons, key actions) | `#BA7517` | "Begin Session" button, active states, key CTAs |
| `accent-hover` | `#8B5A0F` | Pressed/hover state for accent elements |
| `accent-on-tint` (text on tinted surfaces) | `#412402` | Text sitting on `surface-tinted` background |
| `success` (completion states) | `#3B6D11` | Completion checkmarks, "session complete" state |

## Typography

- Headings: warm charcoal (`text-primary`), medium weight — not bold/heavy.
- Body: `text-secondary` for descriptions, `text-primary` for primary content.
- No pure black anywhere in the app. `text-primary` (`#2C2416`) is the darkest text gets.

## Shape & elevation

- Card corner radius: **16px** (not the default 12px — this app should read slightly softer/rounder than a typical utility app).
- Button corner radius: 12px.
- Card shadow: soft and subtle — `box-shadow: 0 4px 20px rgba(120, 90, 40, 0.08)`. Never a hard/sharp drop shadow.
- Card padding: generous — minimum 20px internal padding, not tight/dense.

## Component-specific rules

- **HomeScreen routine cards**: use `surface-tinted` background + `border-accent` border + `accent-on-tint` text (this is the "featured" look — matches the approved mockup). This applies to every routine card once more bundles are added, not just the current one.
- **Buttons (primary/CTA)**: `accent` background, white text, 12px radius, no border.
- **Buttons (secondary)**: `surface` background, `text-primary` text, `border` outline.
- **Duration/phase-count badges**: pill shape (999px radius), `border-accent`-tinted background at ~20% opacity or the tinted amber fill, `accent-on-tint` text.
- **Bottom nav (History / Settings)**: `text-secondary` for inactive icons/labels, `accent` for the active/selected one.
- **Full-screen pranayama image phases**: keep dark/moody imagery as-is if the client's photos are naturally dark — the LIGHT theme applies to app chrome (nav, cards, buttons, backgrounds), not necessarily to full-bleed technique photography, which can stay true to whatever the client's actual images look like.

## Dark mode

Not required for v1 (supersedes the earlier requirement in 01-brief.md). Single light theme only. Revisit later if the client asks for it.

## Icon-related images (app.json)

Since the palette changed, also update:
- App icon background should use `background` (`#FAF7F2`) or `accent` (`#BA7517`), not the default Expo dark placeholder.
- Splash screen background should match `background` (`#FAF7F2`), not a dark background — the app should feel warm and light from the very first frame the user sees.
