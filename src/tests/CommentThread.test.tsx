// src/tests/CommentThread.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CommentThread from '../components/Comments/CommentThread';
import commentsReducer from '../store/slices/commentsSlice';
import uiReducer from '../store/slices/uiSlice';
import { Comment } from '../types';

jest.mock('../mocks/mockApi', () => ({
  mockApi: {
    resolveComment: jest.fn().mockResolvedValue({ success: true }),
    addComment: jest.fn().mockResolvedValue({}),
  },
}));

const mockComment: Comment = {
  id: 'comment-1',
  authorId: 'user-sarah',
  authorName: 'Sarah Chen',
  authorColor: '#FF6B6B',
  text: 'This section needs more detail.',
  selectedText: 'Technical Architecture',
  selectionStart: 100,
  selectionEnd: 122,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  resolved: false,
  replies: [],
};

const buildStore = (commentState?: Partial<ReturnType<typeof commentsReducer>>) =>
  configureStore({
    reducer: { comments: commentsReducer, ui: uiReducer },
    preloadedState: {
      comments: {
        comments: [mockComment],
        activeCommentId: null,
        pendingSelection: null,
        ...commentState,
      },
    },
  });

const renderWithStore = (store = buildStore()) =>
  render(
    <Provider store={store}>
      <CommentThread comment={mockComment} />
    </Provider>
  );

describe('CommentThread', () => {
  test('renders comment text', () => {
    renderWithStore();
    expect(screen.getByText('This section needs more detail.')).toBeInTheDocument();
  });

  test('renders author name', () => {
    renderWithStore();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  test('renders selected text excerpt', () => {
    renderWithStore();
    expect(screen.getByText(/"Technical Architecture"/)).toBeInTheDocument();
  });

  test('shows Reply and Resolve buttons when comment is active', () => {
    const store = buildStore({ activeCommentId: 'comment-1' });
    renderWithStore(store);
    expect(screen.getByText('Reply')).toBeInTheDocument();
    expect(screen.getByText(/Resolve/)).toBeInTheDocument();
  });

  test('does NOT show action buttons when comment is inactive', () => {
    renderWithStore();
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  test('clicking thread sets it as active', () => {
    const store = buildStore();
    renderWithStore(store);
    fireEvent.click(screen.getByTestId('comment-thread'));
    expect(store.getState().comments.activeCommentId).toBe('comment-1');
  });

  test('clicking active thread deactivates it', () => {
    const store = buildStore({ activeCommentId: 'comment-1' });
    renderWithStore(store);
    fireEvent.click(screen.getByTestId('comment-thread'));
    expect(store.getState().comments.activeCommentId).toBeNull();
  });

  test('shows Reply form when Reply button is clicked', () => {
    const store = buildStore({ activeCommentId: 'comment-1' });
    renderWithStore(store);
    fireEvent.click(screen.getByText('Reply'));
    expect(screen.getByPlaceholderText('Write a reply…')).toBeInTheDocument();
  });

  test('shows Resolved badge for resolved comments', () => {
    const resolvedComment: Comment = { ...mockComment, resolved: true };
    const store = buildStore({ comments: [resolvedComment] });
    render(
      <Provider store={store}>
        <CommentThread comment={resolvedComment} />
      </Provider>
    );
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  test('renders replies correctly', () => {
    const commentWithReply: Comment = {
      ...mockComment,
      replies: [
        {
          id: 'reply-1',
          authorId: 'user-marcus',
          authorName: 'Marcus Reid',
          text: 'Good catch, will fix.',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    const store = configureStore({
      reducer: { comments: commentsReducer, ui: uiReducer },
      preloadedState: {
        comments: {
          comments: [commentWithReply],
          activeCommentId: null,
          pendingSelection: null,
        },
      },
    });
    render(
      <Provider store={store}>
        <CommentThread comment={commentWithReply} />
      </Provider>
    );
    expect(screen.getByText('Good catch, will fix.')).toBeInTheDocument();
    expect(screen.getByText('Marcus Reid')).toBeInTheDocument();
  });
});
