// src/store/slices/offlineSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OfflineChange, OfflineState } from '../../types';
import { mockApi } from '../../mocks/mockApi';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'collab_editor_offline_queue';

function loadQueueFromStorage(): OfflineChange[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistQueue(changes: OfflineChange[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
  } catch {
    // Storage might be full or unavailable
  }
}

const initialState: OfflineState = {
  isOffline: false,
  pendingChanges: loadQueueFromStorage(),
  isSyncing: false,
  lastSyncedAt: null,
};

export const syncOfflineChanges = createAsyncThunk(
  'offline/sync',
  async (_, { getState, rejectWithValue }) => {
    const state = (getState() as { offline: OfflineState }).offline;
    if (state.pendingChanges.length === 0) {
      return { applied: 0, conflicts: 0 };
    }
    try {
      const result = await mockApi.syncOfflineChanges(state.pendingChanges);
      localStorage.removeItem(STORAGE_KEY);
      return result;
    } catch (err) {
      return rejectWithValue('Sync failed');
    }
  }
);

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOffline(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    queueEditChange(
      state,
      action: PayloadAction<{ content: string; cursorOffset: number }>
    ) {
      const change: OfflineChange = {
        id: uuidv4(),
        type: 'edit',
        timestamp: new Date().toISOString(),
        payload: action.payload,
      };
      // Collapse consecutive edit changes — keep only the latest content snapshot
      let lastIndex = -1;
      for (let i = state.pendingChanges.length - 1; i >= 0; i--) {
        if (state.pendingChanges[i].type === 'edit') { lastIndex = i; break; }
      }
      if (lastIndex !== -1) {
        state.pendingChanges[lastIndex] = change;
      } else {
        state.pendingChanges.push(change);
      }
      persistQueue(state.pendingChanges);
    },
    queueCommentChange(state, action: PayloadAction<OfflineChange['payload']>) {
      const change: OfflineChange = {
        id: uuidv4(),
        type: 'comment',
        timestamp: new Date().toISOString(),
        payload: action.payload,
      };
      state.pendingChanges.push(change);
      persistQueue(state.pendingChanges);
    },
    clearQueue(state) {
      state.pendingChanges = [];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncOfflineChanges.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncOfflineChanges.fulfilled, (state) => {
        state.isSyncing = false;
        state.pendingChanges = [];
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(syncOfflineChanges.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export const { setOffline, queueEditChange, queueCommentChange, clearQueue } =
  offlineSlice.actions;
export default offlineSlice.reducer;
