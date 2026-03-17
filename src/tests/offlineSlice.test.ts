// src/tests/offlineSlice.test.ts

import offlineReducer, {
  setOffline,
  queueEditChange,
  queueCommentChange,
  clearQueue,
  syncOfflineChanges,
} from '../store/slices/offlineSlice';
import { OfflineState } from '../types';
import { configureStore } from '@reduxjs/toolkit';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock mockApi
jest.mock('../mocks/mockApi', () => ({
  mockApi: {
    syncOfflineChanges: jest.fn().mockResolvedValue({
      applied: 1,
      conflicts: 0,
      document: { id: 'doc-001', content: 'synced', version: 2, title: 'Test', lastSaved: new Date().toISOString() },
    }),
  },
}));

const getInitialState = (): OfflineState => ({
  isOffline: false,
  pendingChanges: [],
  isSyncing: false,
  lastSyncedAt: null,
});

describe('offlineSlice reducers', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('setOffline — sets isOffline to true', () => {
    const state = offlineReducer(getInitialState(), setOffline(true));
    expect(state.isOffline).toBe(true);
  });

  test('setOffline — sets isOffline to false', () => {
    const state = offlineReducer({ ...getInitialState(), isOffline: true }, setOffline(false));
    expect(state.isOffline).toBe(false);
  });

  test('queueEditChange — adds an edit change to the queue', () => {
    const state = offlineReducer(
      getInitialState(),
      queueEditChange({ content: 'hello', cursorOffset: 5 })
    );
    expect(state.pendingChanges).toHaveLength(1);
    expect(state.pendingChanges[0].type).toBe('edit');
  });

  test('queueEditChange — collapses consecutive edits, keeping only latest', () => {
    let state = offlineReducer(
      getInitialState(),
      queueEditChange({ content: 'first', cursorOffset: 5 })
    );
    state = offlineReducer(
      state,
      queueEditChange({ content: 'second', cursorOffset: 6 })
    );
    expect(state.pendingChanges).toHaveLength(1);
    const payload = state.pendingChanges[0].payload as { content: string };
    expect(payload.content).toBe('second');
  });

  test('queueCommentChange — adds a comment change to the queue', () => {
    const mockComment = { comment: { id: 'c1', text: 'test' } } as any;
    const state = offlineReducer(
      getInitialState(),
      queueCommentChange(mockComment)
    );
    expect(state.pendingChanges).toHaveLength(1);
    expect(state.pendingChanges[0].type).toBe('comment');
  });

  test('queueCommentChange does NOT collapse — multiple comments accumulate', () => {
    let state = offlineReducer(
      getInitialState(),
      queueCommentChange({ comment: { id: 'c1' } } as any)
    );
    state = offlineReducer(
      state,
      queueCommentChange({ comment: { id: 'c2' } } as any)
    );
    expect(state.pendingChanges).toHaveLength(2);
  });

  test('clearQueue — empties pendingChanges', () => {
    const withChanges: OfflineState = {
      ...getInitialState(),
      pendingChanges: [
        { id: '1', type: 'edit', timestamp: '', payload: { content: 'x', cursorOffset: 0 } },
      ],
    };
    const state = offlineReducer(withChanges, clearQueue());
    expect(state.pendingChanges).toHaveLength(0);
  });

  test('clearQueue — removes item from localStorage', () => {
    localStorageMock.setItem('collab_editor_offline_queue', JSON.stringify([{ id: '1' }]));
    offlineReducer(getInitialState(), clearQueue());
    expect(localStorageMock.getItem('collab_editor_offline_queue')).toBeNull();
  });
});

describe('offlineSlice async thunks', () => {
  test('syncOfflineChanges — sets isSyncing during pending', () => {
    const store = configureStore({ reducer: { offline: offlineReducer } });
    const action = { type: syncOfflineChanges.pending.type };
    const state = offlineReducer(getInitialState(), action);
    expect(state.isSyncing).toBe(true);
  });

  test('syncOfflineChanges — clears queue on fulfilled', () => {
    const withChanges: OfflineState = {
      ...getInitialState(),
      isSyncing: true,
      pendingChanges: [
        { id: '1', type: 'edit', timestamp: '', payload: { content: 'x', cursorOffset: 0 } },
      ],
    };
    const action = {
      type: syncOfflineChanges.fulfilled.type,
      payload: { applied: 1, conflicts: 0 },
    };
    const state = offlineReducer(withChanges, action);
    expect(state.isSyncing).toBe(false);
    expect(state.pendingChanges).toHaveLength(0);
    expect(state.lastSyncedAt).not.toBeNull();
  });

  test('syncOfflineChanges — resets isSyncing on rejected', () => {
    const state = offlineReducer(
      { ...getInitialState(), isSyncing: true },
      { type: syncOfflineChanges.rejected.type }
    );
    expect(state.isSyncing).toBe(false);
  });
});
