export type LineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  num: number;
  content: string;
  type: LineType;
}

export interface FileEntry {
  name: string;
  additions: number;
  deletions: number;
  status?: "modified" | "added" | "untracked" | "deleted" | "renamed";
}
