# AGENTS.md

## Priority: Performance

This is a performance-critical, low-memory Electron application. All code contributions must prioritize:

- Speed: Minimize startup time and runtime latency. Avoid synchronous blocking operations. Prefer lazy loading and deferred initialization.
- Low memory: Keep memory footprint minimal. Avoid caching large datasets in memory. Release references early. Use streams over buffers when possible.
- Fast rendering: Minimize DOM operations and re-renders. Use `React.memo`, `useMemo`, and `useCallback` where appropriate. Avoid unnecessary state updates.
- Lean dependencies: Do not add heavy dependencies. Prefer native APIs and lightweight libraries. Tree-shake aggressively.
- Efficient IPC: Keep Electron IPC messages small and infrequent. Batch operations when possible. Avoid sending large objects between main and renderer processes.

## Rules

- No memory leaks: Always clean up event listeners, timers, and subscriptions.
- No blocking the main thread: Use workers or async patterns for heavy computation.
- Profile before optimizing: Don't add complexity without measured need, but always default to the lighter-weight approach.
- Bundle size matters: Every kilobyte counts. Avoid importing entire libraries when only a single function is needed.
