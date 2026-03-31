import type { DiffLine, FileEntry } from "../types";

const PH: DiffLine = { num: 0, content: "", type: "placeholder" };

export const files: FileEntry[] = [
  { name: "src/utils/parser.ts", additions: 12, deletions: 4 },
  { name: "src/renderer/App.tsx", additions: 45, deletions: 20 },
  { name: "package.json", additions: 2, deletions: 1 },
  { name: "src/main/index.ts", additions: 8, deletions: 0 },
  { name: "README.md", additions: 5, deletions: 3 },
  { name: "tsconfig.json", additions: 1, deletions: 0 },
  { name: ".gitignore", additions: 3, deletions: 0 },
];

// Aligned side-by-side: placeholders keep rows in sync.
// Row mapping (left / right):
//  1-5  unchanged / unchanged
//  6    removed "width: 800"   / added "width: 1200"
//  7    removed "height: 600"  / added "height: 800"
//  -    placeholder            / added "minWidth: 600"
//  8    unchanged "webPreferences" / unchanged
//  9    removed "preload…"     / added "preload…"
//  -    placeholder            / added "contextIsolation"
//  10-12 unchanged             / unchanged
//  13   removed "win.loadFile" / added "if (MAIN…)"
//  -    placeholder            / added "win.loadURL…"
//  -    placeholder            / added "} else {"
//  -    placeholder            / added "win.loadFile…"
//  -    placeholder            / added "}"
//  14-22 unchanged             / unchanged

export const leftLines: DiffLine[] = [
  {
    num: 1,
    content: "import { app, BrowserWindow } from 'electron';",
    type: "unchanged",
  },
  { num: 2, content: "import path from 'path';", type: "unchanged" },
  { num: 3, content: "", type: "unchanged" },
  { num: 4, content: "function createWindow() {", type: "unchanged" },
  { num: 5, content: "  const win = new BrowserWindow({", type: "unchanged" },
  { num: 6, content: "    width: 800,", type: "removed" },
  { num: 7, content: "    height: 600,", type: "removed" },
  PH,
  { num: 8, content: "    webPreferences: {", type: "unchanged" },
  {
    num: 9,
    content: "      preload: path.join(__dirname, 'preload.js'),",
    type: "removed",
  },
  PH,
  { num: 10, content: "    },", type: "unchanged" },
  { num: 11, content: "  });", type: "unchanged" },
  { num: 12, content: "", type: "unchanged" },
  { num: 13, content: "  win.loadFile('index.html');", type: "removed" },
  PH,
  PH,
  PH,
  PH,
  { num: 14, content: "}", type: "unchanged" },
  { num: 15, content: "", type: "unchanged" },
  {
    num: 16,
    content: "app.whenReady().then(createWindow);",
    type: "unchanged",
  },
  { num: 17, content: "", type: "unchanged" },
  {
    num: 18,
    content: "app.on('window-all-closed', () => {",
    type: "unchanged",
  },
  {
    num: 19,
    content: "  if (process.platform !== 'darwin') {",
    type: "unchanged",
  },
  { num: 20, content: "    app.quit();", type: "unchanged" },
  { num: 21, content: "  }", type: "unchanged" },
  { num: 22, content: "});", type: "unchanged" },
];

export const rightLines: DiffLine[] = [
  {
    num: 1,
    content: "import { app, BrowserWindow } from 'electron';",
    type: "unchanged",
  },
  { num: 2, content: "import path from 'path';", type: "unchanged" },
  { num: 3, content: "", type: "unchanged" },
  { num: 4, content: "function createWindow() {", type: "unchanged" },
  { num: 5, content: "  const win = new BrowserWindow({", type: "unchanged" },
  { num: 6, content: "    width: 1200,", type: "added" },
  { num: 7, content: "    height: 800,", type: "added" },
  { num: 8, content: "    minWidth: 600,", type: "added" },
  { num: 9, content: "    webPreferences: {", type: "unchanged" },
  {
    num: 10,
    content: "      preload: path.join(__dirname, 'preload.js'),",
    type: "added",
  },
  { num: 11, content: "      contextIsolation: true,", type: "added" },
  { num: 12, content: "    },", type: "unchanged" },
  { num: 13, content: "  });", type: "unchanged" },
  { num: 14, content: "", type: "unchanged" },
  {
    num: 15,
    content: "  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {",
    type: "added",
  },
  {
    num: 16,
    content: "    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);",
    type: "added",
  },
  { num: 17, content: "  } else {", type: "added" },
  { num: 18, content: "    win.loadFile('index.html');", type: "added" },
  { num: 19, content: "  }", type: "added" },
  { num: 20, content: "}", type: "unchanged" },
  { num: 21, content: "", type: "unchanged" },
  {
    num: 22,
    content: "app.whenReady().then(createWindow);",
    type: "unchanged",
  },
  { num: 23, content: "", type: "unchanged" },
  {
    num: 24,
    content: "app.on('window-all-closed', () => {",
    type: "unchanged",
  },
  {
    num: 25,
    content: "  if (process.platform !== 'darwin') {",
    type: "unchanged",
  },
  { num: 26, content: "    app.quit();", type: "unchanged" },
  { num: 27, content: "  }", type: "unchanged" },
  { num: 28, content: "});", type: "unchanged" },
];
