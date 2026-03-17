// src/store/slices/presenceSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CursorPosition, PresenceState, Selection, User } from '../../types';
import { MOCK_COLLABORATORS } from '../../mocks/mockData';

const initialState: PresenceState = {
  collaborators: MOCK_COLLABORATORS,
  cursors: [],
  selections: [],
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    updateCursor(state, action: PayloadAction<CursorPosition>) {
      const index = state.cursors.findIndex(
        (c) => c.userId === action.payload.userId
      );
      if (index !== -1) {
        state.cursors[index] = action.payload;
      } else {
        state.cursors.push(action.payload);
      }
    },
    removeCursor(state, action: PayloadAction<string>) {
      state.cursors = state.cursors.filter((c) => c.userId !== action.payload);
    },
    updateSelection(state, action: PayloadAction<Selection>) {
      const index = state.selections.findIndex(
        (s) => s.userId === action.payload.userId
      );
      if (index !== -1) {
        state.selections[index] = action.payload;
      } else {
        state.selections.push(action.payload);
      }
    },
    clearSelection(state, action: PayloadAction<string>) {
      state.selections = state.selections.filter(
        (s) => s.userId !== action.payload
      );
    },
    setCollaborators(state, action: PayloadAction<User[]>) {
      state.collaborators = action.payload;
    },
    updateCollaboratorRole(
      state,
      action: PayloadAction<{ userId: string; role: User['role'] }>
    ) {
      const collaborator = state.collaborators.find(
        (c) => c.id === action.payload.userId
      );
      if (collaborator) {
        collaborator.role = action.payload.role;
      }
    },
  },
});

export const {
  updateCursor,
  removeCursor,
  updateSelection,
  clearSelection,
  setCollaborators,
  updateCollaboratorRole,
} = presenceSlice.actions;
export default presenceSlice.reducer;
