import { app, shell, BrowserWindow, ipcMain, dialog, nativeImage, Menu } from 'electron'
import { join } from 'path'
import { watch, type FSWatcher } from 'fs'
import { execFile } from 'child_process'
import { optimizer, is } from '@electron-toolkit/utils'
import simpleGit from 'simple-git'
import { initAutoUpdater, checkForUpdatesManually, quitAndInstall } from './autoUpdater'

function createWindow(): void {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/Logo.png'))

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ── IPC Handlers ──

ipcMain.handle('get-open-at-login', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('set-open-at-login', (_event, enabled: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enabled })
})

ipcMain.handle('open-folder', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('get-changed-files', async (_event, folderPath: string) => {
  try {
    const git = simpleGit(folderPath)
    const isRepo = await git.checkIsRepo()
    if (!isRepo) return { error: 'Not a git repository' }

    const status = await git.status()
    const files = [
      ...status.modified.map((f) => ({ name: f, status: 'modified' as const })),
      ...status.created.map((f) => ({ name: f, status: 'added' as const })),
      ...status.not_added.map((f) => ({ name: f, status: 'untracked' as const })),
      ...status.deleted.map((f) => ({ name: f, status: 'deleted' as const })),
      ...status.renamed.map((r) => ({ name: r.to, status: 'renamed' as const }))
    ]
    return { files }
  } catch (err) {
    return { error: String(err) }
  }
})

ipcMain.handle('get-file-diff', async (_event, folderPath: string, filePath: string) => {
  try {
    const git = simpleGit(folderPath)
    // Diff against HEAD for tracked files, show full content for untracked
    const status = await git.status()
    const isUntracked = status.not_added.includes(filePath) || status.created.includes(filePath)

    if (isUntracked) {
      const { readFile } = await import('fs/promises')
      const content = await readFile(join(folderPath, filePath), 'utf-8')
      return {
        leftLines: [],
        rightLines: content.split('\n').map((line, i) => ({
          num: i + 1,
          content: line,
          type: 'added' as const
        }))
      }
    }

    const diff = await git.diff(['HEAD', '--', filePath])
    return { raw: diff }
  } catch (err) {
    return { error: String(err) }
  }
})

ipcMain.handle(
  'open-in-ide',
  async (_event, command: string, folderPath: string, filePath: string, line: number) => {
    const fullPath = join(folderPath, filePath)
    try {
      if (command === 'idea' || command === 'webstorm') {
        execFile(command, ['--line', String(line), fullPath], { timeout: 5000 })
      } else {
        // VS Code, Cursor, Windsurf, Kiro all support --goto file:line
        execFile(command, ['--goto', `${fullPath}:${line}`], { timeout: 5000 })
      }
    } catch {
      // non-critical — IDE may not be installed
    }
  }
)

// ── Auto-updater IPC ──

ipcMain.handle('check-for-updates', () => {
  checkForUpdatesManually()
})

ipcMain.handle('quit-and-install', () => {
  quitAndInstall()
})

// ── Repo watcher ──

let activeWatchers: FSWatcher[] = []
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function stopWatching(): void {
  for (const w of activeWatchers) w.close()
  activeWatchers = []
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

function watchRepo(folderPath: string): void {
  stopWatching()

  const notify = (): void => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send('repo-changed')
      }
    }, 300)
  }

  // Watch .git dir (covers commits, branch switches, stash, etc.)
  try {
    activeWatchers.push(watch(join(folderPath, '.git'), { recursive: true }, notify))
  } catch {
    // .git may not exist yet — that's fine
  }

  // Watch working tree (covers file edits, new files, deletes)
  try {
    activeWatchers.push(
      watch(folderPath, { recursive: true }, (_event, filename) => {
        // Skip .git internal churn — already covered above
        if (filename && filename.startsWith('.git')) return
        // Skip node_modules noise
        if (filename && filename.startsWith('node_modules')) return
        notify()
      })
    )
  } catch {
    // non-critical
  }
}

ipcMain.handle('watch-repo', (_event, folderPath: string) => {
  watchRepo(folderPath)
})

ipcMain.handle('unwatch-repo', () => {
  stopWatching()
})

// ── Application Menu ──

function buildMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder…',
          accelerator: 'CmdOrCtrl+O',
          click: (): void => {
            const win = BrowserWindow.getFocusedWindow()
            if (win) win.webContents.send('menu-open-folder')
          }
        },
        {
          label: 'Check for Updates',
          click: (): void => {
            checkForUpdatesManually()
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── App lifecycle ──

app.whenReady().then(() => {
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  buildMenu()
  createWindow()
  initAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopWatching()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  stopWatching()
})
