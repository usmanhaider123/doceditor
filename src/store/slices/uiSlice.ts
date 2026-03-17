// src/store/slices/uiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, UserRole } from '../../types';
import { CURRENT_USER } from '../../mocks/mockData';

const initialState: UIState = {
  currentRole: 'editor',
  currentUserId: CURRENT_USER.id,
  showCommentPanel: true,
  isAddingComment: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<UserRole>) {
      state.currentRole = action.payload;
    },
    toggleCommentPanel(state) {
      state.showCommentPanel = !state.showCommentPanel;
    },
    setIsAddingComment(state, action: PayloadAction<boolean>) {
      state.isAddingComment = action.payload;
    },
  },
});

export const { setRole, toggleCommentPanel, setIsAddingComment } =
  uiSlice.actions;
export default uiSlice.reducer;
