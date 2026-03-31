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

export type DiffSide = "left" | "right";

export interface Comment {
  id: string;
  body: string;
  createdAt: number;
}

export interface CommentThread {
  file: string;
  side: DiffSide;
  line: number;
  comments: Comment[];
}
