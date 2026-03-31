export type LineType = "added" | "removed" | "unchanged" | "placeholder";

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
  /** Content of the line when the first comment was created */
  lineContent?: string;
  /** Thread is outdated when the diff line content has changed */
  outdated?: boolean;
}

export interface ThreadMap {
  [line: number]: { comments: Comment[]; outdated: boolean };
}
