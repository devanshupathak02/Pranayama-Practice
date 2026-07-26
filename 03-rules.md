# Coding Rules

These are constraints, not suggestions. If a rule conflicts with a request, follow the rule and flag the conflict rather than silently picking one.

## Structure

1. Never place business logic (timer math, phase-advancing rules, round-counting) inside a React component. Components render state; they don't compute it.
2. TimerEngine never imports React, never touches audio, never touches storage. It is pure logic — given config + elapsed time, produce state.
3. Every screen lives in its own folder and exports exactly one component.
4. Maximum component size: 250 lines. Maximum function size: 50 lines. Maximum nesting: 3 levels. If you hit a limit, extract a hook or a helper — don't ask permission first, just do it and note what you extracted.
5. No prop drilling deeper than two levels — use the store instead.

## State & data

6. Zustand only. No Redux. No Context API for business state (Context is fine for theme/settings only).
7. No global mutable variables outside the designated stores.
8. Timer state is always derived from timestamps (`Date.now()` deltas), never from a counter that gets decremented once per tick. See `decisions.md` D2 — this is non-negotiable.

## TypeScript

9. Strict TypeScript. Never use `any`. Never use `@ts-ignore` — if a type doesn't fit, fix the type, don't suppress the error.
10. Every function is typed: inputs, outputs, and thrown errors documented in a comment if non-obvious.

## Error handling

11. Every async call is wrapped in try/catch. Never let a failed sound file or a failed storage write crash the app — log it and degrade gracefully (e.g. session continues silently if a chime fails to load).
12. Never swallow an error silently with an empty catch block — at minimum, log it.

## Hygiene

13. Never leave TODO comments in code that's presented as finished. If something is genuinely incomplete, say so directly instead of leaving a silent marker.
14. Never generate a placeholder/stub implementation and present it as done.
15. Before creating a new component or hook, check whether one already exists that does the job — no duplicates.
16. Don't install a new library for something 20 lines of plain code could do. Every added dependency is a maintenance cost.
17. No inline styles, no anonymous functions defined inside render (they cause needless re-renders and are hard to test).
18. Use constants for any repeated value (durations, colors, sizes) instead of magic numbers scattered through the code.

## Naming

19. Components: `PascalCase`. Variables/functions: `camelCase`. Constants: `UPPER_CASE`. Folders: `kebab-case`.
20. An action keeps the same name through the whole flow — if a function is called `startSession`, the button that triggers it says "Start," not "Begin" or "Go."
