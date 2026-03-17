// src/store/slices/documentSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentState } from '../../types';
import { mockApi } from '../../mocks/mockApi';

interface DocumentSliceState {
  document: DocumentState | null;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
}

const initialState: DocumentSliceState = {
  document: null,
  status: 'idle',
  error: null,
  isDirty: false,
};

export const fetchDocument = createAsyncThunk('document/fetch', async () => {
  const doc = await mockApi.fetchDocument();
  return doc;
});

export const saveDocument = createAsyncThunk(
  'document/save',
  async ({ content, title }: { content: string; title: string }) => {
    const doc = await mockApi.saveDocument(content, title);
    return doc;
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    updateContent(state, action: PayloadAction<string>) {
      if (state.document) {
        state.document.content = action.payload;
        state.isDirty = true;
      }
    },
    updateTitle(state, action: PayloadAction<string>) {
      if (state.document) {
        state.document.title = action.payload;
        state.isDirty = true;
      }
    },
    markSaved(state) {
      state.isDirty = false;
    },
    applyRemoteContent(state, action: PayloadAction<string>) {
      // Apply content from sync without marking dirty
      if (state.document) {
        state.document.content = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocument.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.status = 'idle';
        state.document = action.payload;
        state.isDirty = false;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to fetch document';
      })
      .addCase(saveDocument.pending, (state) => {
        state.status = 'saving';
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        state.status = 'idle';
        state.document = action.payload;
        state.isDirty = false;
      })
      .addCase(saveDocument.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to save document';
      });
  },
});

export const { updateContent, updateTitle, markSaved, applyRemoteContent } =
  documentSlice.actions;
export default documentSlice.reducer;
