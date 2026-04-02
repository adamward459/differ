export type LineType = 'added' | 'removed' | 'unchanged' | 'placeholder'

export interface DiffLine {
  num: number
  content: string
  type: LineType
}

export interface FileEntry {
  name: string
  additions: number
  deletions: number
  status?: 'modified' | 'added' | 'untracked' | 'deleted' | 'renamed'
}

export type DiffSide = 'left' | 'right'

export interface Comment {
  id: string
  body: string
  createdAt: number
}

export interface CommentThread {
  file: string
  side: DiffSide
  line: number
  comments: Comment[]
  /** Content of the line when the first comment was created */
  lineContent?: string
  /** Thread is outdated when the diff line content has changed */
  outdated?: boolean
}

export interface ThreadMap {
  [line: number]: { comments: Comment[]; outdated: boolean }
}

export interface IDE {
  id: string
  label: string
  command: string
}

export const IDE_LIST: IDE[] = [
  { id: 'vscode', label: 'VS Code', command: 'code' },
  { id: 'cursor', label: 'Cursor', command: 'cursor' },
  { id: 'windsurf', label: 'Windsurf', command: 'windsurf' },
  { id: 'kiro', label: 'Kiro', command: 'kiro' },
  { id: 'idea', label: 'IntelliJ IDEA', command: 'idea' },
  { id: 'webstorm', label: 'WebStorm', command: 'webstorm' }
]
