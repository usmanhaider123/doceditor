// src/store/slices/commentsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Comment, CommentReply, CommentsState } from '../../types';
import { mockApi } from '../../mocks/mockApi';
import { MOCK_COMMENTS } from '../../mocks/mockData';
import { v4 as uuidv4 } from 'uuid';

const initialState: CommentsState = {
  comments: MOCK_COMMENTS,
  activeCommentId: null,
  pendingSelection: null,
};

export const addComment = createAsyncThunk(
  'comments/add',
  async (
    payload: {
      text: string;
      selectedText: string;
      selectionStart: number;
      selectionEnd: number;
      authorId: string;
      authorName: string;
      authorColor: string;
    }
  ) => {
    const comment = await mockApi.addComment({
      ...payload,
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    });
    return comment;
  }
);

export const resolveComment = createAsyncThunk(
  'comments/resolve',
  async (commentId: string) => {
    await mockApi.resolveComment(commentId);
    return commentId;
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setPendingSelection(
      state,
      action: PayloadAction<{ start: number; end: number; text: string } | null>
    ) {
      state.pendingSelection = action.payload;
    },
    setActiveComment(state, action: PayloadAction<string | null>) {
      state.activeCommentId = action.payload;
    },
    addReply(
      state,
      action: PayloadAction<{
        commentId: string;
        text: string;
        authorId: string;
        authorName: string;
      }>
    ) {
      const comment = state.comments.find(
        (c) => c.id === action.payload.commentId
      );
      if (comment) {
        const reply: CommentReply = {
          id: uuidv4(),
          authorId: action.payload.authorId,
          authorName: action.payload.authorName,
          text: action.payload.text,
          createdAt: new Date().toISOString(),
        };
        comment.replies.push(reply);
      }
    },
    // Used when syncing offline comment additions
    injectComment(state, action: PayloadAction<Comment>) {
      const exists = state.comments.find((c) => c.id === action.payload.id);
      if (!exists) {
        state.comments.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        state.pendingSelection = null;
      })
      .addCase(resolveComment.fulfilled, (state, action) => {
        const comment = state.comments.find((c) => c.id === action.payload);
        if (comment) {
          comment.resolved = true;
        }
        if (state.activeCommentId === action.payload) {
          state.activeCommentId = null;
        }
      });
  },
});

export const { setPendingSelection, setActiveComment, addReply, injectComment } =
  commentsSlice.actions;
export default commentsSlice.reducer;
