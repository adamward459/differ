interface DifferAPI {
  openFolder(): Promise<string | null>;
  getChangedFiles(folderPath: string): Promise<{
    files?: { name: string; status: string }[];
    error?: string;
  }>;
  getFileDiff(
    folderPath: string,
    filePath: string,
  ): Promise<{
    leftLines?: { num: number; content: string; type: string }[];
    rightLines?: { num: number; content: string; type: string }[];
    raw?: string;
    error?: string;
  }>;
}

interface Window {
  api: DifferAPI;
}
