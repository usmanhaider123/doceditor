// src/tests/mockApi.test.ts

import { mockApi } from '../mocks/mockApi';
import { OfflineChange } from '../types';

describe('mockApi', () => {
  test('fetchDocument — returns a document with content', async () => {
    const doc = await mockApi.fetchDocument();
    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('content');
    expect(doc).toHaveProperty('title');
    expect(typeof doc.content).toBe('string');
  });

  test('saveDocument — updates content and increments version', async () => {
    const original = await mockApi.fetchDocument();
    const updated = await mockApi.saveDocument('New content here', 'New Title');
    expect(updated.content).toBe('New content here');
    expect(updated.title).toBe('New Title');
    expect(updated.version).toBeGreaterThan(original.version);
  });

  test('saveDocument — updates lastSaved timestamp', async () => {
    const before = Date.now();
    const doc = await mockApi.saveDocument('content', 'title');
    const savedTime = new Date(doc.lastSaved).getTime();
    expect(savedTime).toBeGreaterThanOrEqual(before);
  });

  test('addComment — returns comment with generated id', async () => {
    const input = {
      authorId: 'user-1',
      authorName: 'Alice',
      authorColor: '#FF0000',
      text: 'Test comment',
      selectedText: 'selected',
      selectionStart: 10,
      selectionEnd: 18,
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    };
    const comment = await mockApi.addComment(input);
    expect(comment.id).toBeDefined();
    expect(comment.id).toMatch(/^comment-/);
    expect(comment.text).toBe('Test comment');
  });

  test('resolveComment — returns success true', async () => {
    const result = await mockApi.resolveComment('comment-123');
    expect(result.success).toBe(true);
  });

  test('syncOfflineChanges — applies edit changes and returns count', async () => {
    const changes: OfflineChange[] = [
      {
        id: '1',
        type: 'edit',
        timestamp: new Date().toISOString(),
        payload: { content: 'synced content', cursorOffset: 0 },
      },
    ];

    const result = await mockApi.syncOfflineChanges(changes);
    expect(result.applied).toBe(1);
    expect(result.conflicts).toBe(0);
    expect(result.document.content).toBe('synced content');
  });

  test('syncOfflineChanges — applies comment changes', async () => {
    const changes: OfflineChange[] = [
      {
        id: '2',
        type: 'comment',
        timestamp: new Date().toISOString(),
        payload: {} as any,
      },
    ];

    const result = await mockApi.syncOfflineChanges(changes);
    expect(result.applied).toBe(1);
  });

  test('syncOfflineChanges — handles empty queue', async () => {
    const result = await mockApi.syncOfflineChanges([]);
    expect(result.applied).toBe(0);
    expect(result.conflicts).toBe(0);
  });

  test('checkConnectivity — returns true', async () => {
    const online = await mockApi.checkConnectivity();
    expect(online).toBe(true);
  });
});
