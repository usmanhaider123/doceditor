// src/types/index.ts

export type UserRole = 'editor' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: UserRole;
}

export interface CursorPosition {
  userId: string;
  offset: number;
  line: number;
  color: string;
  name: string;
}

export interface Selection {
  userId: string;
  start: number;
  end: number;
  color: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
  createdAt: string;
  resolved: boolean;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface OfflineChange {
  id: string;
  type: 'edit' | 'comment';
  timestamp: string;
  payload: EditChange | CommentChange;
}

export interface EditChange {
  content: string;
  cursorOffset: number;
}

export interface CommentChange {
  comment: Comment;
}

export interface DocumentState {
  id: string;
  title: string;
  content: string;
  version: number;
  lastSaved: string;
}

export interface PresenceState {
  collaborators: User[];
  cursors: CursorPosition[];
  selections: Selection[];
}

export interface OfflineState {
  isOffline: boolean;
  pendingChanges: OfflineChange[];
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export interface CommentsState {
  comments: Comment[];
  activeCommentId: string | null;
  pendingSelection: { start: number; end: number; text: string } | null;
}

export interface UIState {
  currentRole: UserRole;
  currentUserId: string;
  showCommentPanel: boolean;
  isAddingComment: boolean;
}
