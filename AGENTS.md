# AGENTS.md

## Priority: Performance

This is a performance-critical, low-memory Electron application. All code contributions must prioritize:

- Speed: Minimize startup time and runtime latency. Avoid synchronous blocking operations. Prefer lazy loading and deferred initialization.
- Low memory: Keep memory footprint minimal. Avoid caching large datasets in memory. Release references early. Use streams over buffers when possible.
- Fast rendering: Minimize DOM operations and re-renders. Use `React.memo`, `useMemo`, and `useCallback` where appropriate. Avoid unnecessary state updates.
- Lean dependencies: Do not add heavy dependencies. Prefer native APIs and lightweight libraries. Tree-shake aggressively.
- Efficient IPC: Keep Electron IPC messages small and infrequent. Batch operations when possible. Avoid sending large objects between main and renderer processes.

## Icons

- Use `@remixicon/react` for all icons. Import individual icons like `import { RiFileCodeLine } from "@remixicon/react"`.
- Do not use inline SVGs, Heroicons, Lucide, or any other icon library.

## File Structure

- Keep components organized by feature in `src/renderer/src/components/<feature>/`, one component per file.
  - `diff/` — DiffPanel, DiffColumn, DiffLineRow
  - `sidebar/` — Sidebar, FileItem
  - `comments/` — CommentThread
  - `common/` — Reusable components shared across features (StatusBadge, DiffStats, StatusMessage, LandingView, Button, IconButton)
- Keep shared types in `src/renderer/src/types.ts`.
- Keep custom hooks in `src/renderer/src/hooks/`.
- Keep mock/static data in `src/renderer/src/data/`.
- Keep tests in `src/renderer/src/__tests__/`.
- `App.tsx` should be a thin shell that composes components — no large inline markup.

## SOLID Principles

All code must follow SOLID principles:

- Single Responsibility (SRP): Each module, component, and function should have one reason to change. Extract logic into custom hooks, utility functions, and focused components.
- Open/Closed (OCP): Components should be open for extension (via props, composition, render slots) but closed for modification. Prefer composable patterns over editing existing components.
- Liskov Substitution (LSP): Subtypes and component variants must be interchangeable. Shared interfaces/types must be honored by all implementations.
- Interface Segregation (ISP): Keep prop interfaces and type definitions small and focused. Don't force consumers to depend on props they don't use.
- Dependency Inversion (DIP): High-level components should depend on abstractions (hooks, interfaces), not concrete implementations. Extract side effects and data-fetching into hooks or services.

## Rules

- No memory leaks: Always clean up event listeners, timers, and subscriptions.
- No blocking the main thread: Use workers or async patterns for heavy computation.
- Profile before optimizing: Don't add complexity without measured need, but always default to the lighter-weight approach.
- Bundle size matters: Every kilobyte counts. Avoid importing entire libraries when only a single function is needed.
