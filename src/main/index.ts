import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import simpleGit from "simple-git";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// ── IPC Handlers ──

ipcMain.handle("open-folder", async event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win!, {
    properties: ["openDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle("get-changed-files", async (_event, folderPath: string) => {
  try {
    const git = simpleGit(folderPath);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) return { error: "Not a git repository" };

    const status = await git.status();
    const files = [
      ...status.modified.map(f => ({ name: f, status: "modified" as const })),
      ...status.created.map(f => ({ name: f, status: "added" as const })),
      ...status.not_added.map(f => ({ name: f, status: "untracked" as const })),
      ...status.deleted.map(f => ({ name: f, status: "deleted" as const })),
      ...status.renamed.map(r => ({ name: r.to, status: "renamed" as const })),
    ];
    return { files };
  } catch (err) {
    return { error: String(err) };
  }
});

ipcMain.handle(
  "get-file-diff",
  async (_event, folderPath: string, filePath: string) => {
    try {
      const git = simpleGit(folderPath);
      // Diff against HEAD for tracked files, show full content for untracked
      const status = await git.status();
      const isUntracked =
        status.not_added.includes(filePath) ||
        status.created.includes(filePath);

      if (isUntracked) {
        const { readFile } = await import("fs/promises");
        const content = await readFile(join(folderPath, filePath), "utf-8");
        return {
          leftLines: [],
          rightLines: content.split("\n").map((line, i) => ({
            num: i + 1,
            content: line,
            type: "added" as const,
          })),
        };
      }

      const diff = await git.diff(["HEAD", "--", filePath]);
      return { raw: diff };
    } catch (err) {
      return { error: String(err) };
    }
  },
);

// ── App lifecycle ──

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.differ");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
