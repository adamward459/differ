<p align="center">
  <img src="resources/Logo.png" alt="Differ" width="128" height="128" />
</p>

<h1 align="center">Differ</h1>

<p align="center">
  A lightweight, native-feeling Git diff viewer built with Electron, React 19, and Tailwind CSS 4.<br/>
  Open any local repository, browse changed files, and review diffs side-by-side — with inline commenting.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue" alt="Platforms" />
  <img src="https://img.shields.io/badge/electron-33-47848f" alt="Electron" />
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Features

- **Side-by-side diff view** — Aligned left/right columns with synchronized scrolling, just like GitHub.
- **Live file watching** — Diffs refresh automatically when you save files, switch branches, commit, or stash.
- **Inline comments** — Click any line to add review comments. Threads are marked outdated when the underlying code changes.
- **Copy comments** — One-click export of all active (non-outdated) comments to clipboard.
- **OS-adaptive theme** — Light and dark modes via `prefers-color-scheme`, using OKLCH colors for perceptual uniformity.
- **Open at login** — Optional system startup toggle built in.
- **Keyboard navigation** — Arrow keys to move through the file list, `⌘/Ctrl+Enter` to submit comments, `Escape` to close.

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Shell     | Electron 33                             |
| Frontend  | React 19, React Compiler (babel plugin) |
| Styling   | Tailwind CSS 4 (`@tailwindcss/vite`)    |
| Build     | electron-vite 5, Vite 6                 |
| Git       | simple-git                              |
| Icons     | @remixicon/react                        |
| Tests     | Vitest 3, Testing Library, jsdom        |
| Packaging | electron-builder                        |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Git

### Install

```bash
git clone <repo-url>
cd differ
npm install
```

### Develop

```bash
npm run dev
```

This launches the Electron app with hot-reload for the renderer process.

### Build

```bash
npm run build
```

Compiles the main, preload, and renderer bundles into `out/`.

### Package

```bash
# macOS
npx electron-builder --mac

# Windows
npx electron-builder --win
```

Produces distributable artifacts (`.dmg`, `.zip`, `.exe`) in `dist/`.

### Test

```bash
npm test
```

Runs the Vitest suite in single-run mode (`vitest --run`).

## Project Structure

```
src/
├── main/                  # Electron main process
│   └── index.ts           #   Window creation, IPC handlers, file watcher
├── preload/               # Context bridge
│   ├── index.ts           #   API exposed to renderer
│   └── index.d.ts         #   Type declarations for window.api
└── renderer/
    └── src/
        ├── App.tsx                # Root shell — composes sidebar + diff panel
        ├── main.tsx               # React entry point
        ├── index.css              # Tailwind imports + OKLCH theme tokens
        ├── types.ts               # Shared types (DiffLine, FileEntry, CommentThread, etc.)
        ├── components/
        │   ├── diff/              # DiffPanel, DiffColumn, DiffLineRow
        │   ├── sidebar/           # Sidebar, FileItem
        │   ├── comments/          # CommentThread
        │   └── common/            # Button, IconButton, StatusBadge, DiffStats, StatusMessage, LandingView
        ├── hooks/
        │   ├── useRepo.ts         # Folder selection, file list, diff fetching, FS subscription
        │   ├── useThreads.ts      # Comment thread state, outdated detection
        │   └── useStartup.ts      # Open-at-login toggle
        ├── utils/
        │   └── parseDiff.ts       # Unified diff → aligned side-by-side lines
        └── data/
            └── mock.ts            # Static/mock data
```

## Architecture

### IPC Channels

| Channel                                   | Direction       | Purpose                                                    |
| ----------------------------------------- | --------------- | ---------------------------------------------------------- |
| `open-folder`                             | renderer → main | Open native folder picker                                  |
| `get-changed-files`                       | renderer → main | List modified/added/deleted/renamed files via `git status` |
| `get-file-diff`                           | renderer → main | Get unified diff (tracked) or full content (untracked)     |
| `watch-repo` / `unwatch-repo`             | renderer → main | Start/stop FS watchers on `.git/` and working tree         |
| `repo-changed`                            | main → renderer | Notify renderer of file system changes (debounced 300ms)   |
| `get-open-at-login` / `set-open-at-login` | renderer → main | Read/write system login item setting                       |

### Diff Parsing

`parseDiff` converts unified diff output into aligned left/right `DiffLine[]` arrays. Removed lines pair with placeholders on the right, added lines pair with placeholders on the left, keeping both columns the same height for row-aligned rendering.

### Comment Threads

Comments are stored in-memory per session. Each thread tracks the line content at creation time. When the diff refreshes, `markOutdatedThreads` compares current line content against the snapshot — if it changed, the thread is flagged as outdated with a visual indicator.

## macOS Troubleshooting

### "Differ.app contains malware" on macOS 26 Tahoe

macOS 26 Tahoe tightened Gatekeeper restrictions. Unsigned apps are blocked with a malware warning, and the old right-click → "Open" workaround no longer works.

#### For locally built apps (`dist/mac-arm64/Differ.app`):

```bash
# Remove quarantine flag and clear Gatekeeper cache
sudo xattr -cr dist/mac-arm64/Differ.app
sudo spctl --remove dist/mac-arm64/Differ.app
sudo spctl --add --label "Differ" dist/mac-arm64/Differ.app
```

#### For installed apps (`/Applications/Differ.app`):

```bash
xattr -r -d com.apple.quarantine /Applications/Differ.app
```

#### If issues persist:

Temporarily disable Gatekeeper (not recommended for production):

```bash
sudo spctl --master-disable
# Open the app, then re-enable:
sudo spctl --master-enable
```

**Permanent solution:** The build configuration now includes ad-hoc signing (`"identity": null`) to improve compatibility with macOS 26 Tahoe. Rebuild the app after pulling the latest changes.

> This is not required on macOS 15 Sequoia or earlier.

## CI/CD

A GitHub Actions workflow (`.github/workflows/release.yml`) builds and publishes releases:

1. Push a tag matching `v*` (e.g., `v1.0.0`)
2. Parallel builds run on macOS and Windows
3. Artifacts (`.dmg`, `.zip`, `.exe`) are uploaded to the GitHub Release

## License

MIT
