// src/mocks/mockApi.ts

import { Comment, DocumentState, OfflineChange } from '../types';
import { MOCK_DOCUMENT } from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulated in-memory database
let documentStore: DocumentState = { ...MOCK_DOCUMENT };

export const mockApi = {
  /**
   * Fetch current document state
   */
  async fetchDocument(): Promise<DocumentState> {
    await delay(300);
    return { ...documentStore };
  },

  /**
   * Save document content
   */
  async saveDocument(content: string, title: string): Promise<DocumentState> {
    await delay(200);
    documentStore = {
      ...documentStore,
      content,
      title,
      version: documentStore.version + 1,
      lastSaved: new Date().toISOString(),
    };
    return { ...documentStore };
  },

  /**
   * Add a new comment
   */
  async addComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    await delay(150);
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
    };
    return newComment;
  },

  /**
   * Resolve a comment
   */
  async resolveComment(commentId: string): Promise<{ success: boolean }> {
    await delay(100);
    return { success: true };
  },

  /**
   * Sync offline changes — applies queued changes sequentially
   */
  async syncOfflineChanges(
    changes: OfflineChange[]
  ): Promise<{ applied: number; conflicts: number; document: DocumentState }> {
    await delay(800); // simulate network latency

    let applied = 0;
    let conflicts = 0;

    for (const change of changes) {
      if (change.type === 'edit') {
        const editPayload = change.payload as { content: string };
        documentStore = {
          ...documentStore,
          content: editPayload.content,
          version: documentStore.version + 1,
          lastSaved: new Date().toISOString(),
        };
        applied++;
      } else if (change.type === 'comment') {
        // Comments are always applied (no conflict possible)
        applied++;
      }
    }

    return {
      applied,
      conflicts,
      document: { ...documentStore },
    };
  },

  /**
   * Simulate a connection check
   */
  async checkConnectivity(): Promise<boolean> {
    await delay(100);
    return true;
  },
};
