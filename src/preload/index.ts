import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  openFolder: (): Promise<string | null> => ipcRenderer.invoke("open-folder"),
  getChangedFiles: (
    folderPath: string,
  ): Promise<{
    files?: { name: string; status: string }[];
    error?: string;
  }> => ipcRenderer.invoke("get-changed-files", folderPath),
  getFileDiff: (
    folderPath: string,
    filePath: string,
  ): Promise<{
    leftLines?: { num: number; content: string; type: string }[];
    rightLines?: { num: number; content: string; type: string }[];
    raw?: string;
    error?: string;
  }> => ipcRenderer.invoke("get-file-diff", folderPath, filePath),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
}
