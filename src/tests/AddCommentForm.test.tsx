// src/tests/AddCommentForm.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddCommentForm from '../components/Comments/AddCommentForm';
import commentsReducer from '../store/slices/commentsSlice';
import uiReducer from '../store/slices/uiSlice';
import { CommentsState, UIState } from '../types';

jest.mock('../mocks/mockApi', () => ({
  mockApi: {
    addComment: jest.fn().mockImplementation((data) =>
      Promise.resolve({ ...data, id: 'comment-mock-id' })
    ),
  },
}));

const buildStore = (
  commentsOverride: Partial<CommentsState> = {},
  uiOverride: Partial<UIState> = {}
) =>
  configureStore({
    reducer: { comments: commentsReducer, ui: uiReducer },
    preloadedState: {
      comments: {
        comments: [],
        activeCommentId: null,
        pendingSelection: { start: 0, end: 10, text: 'selected text' },
        ...commentsOverride,
      } as CommentsState,
      ui: {
        currentRole: 'editor',
        currentUserId: 'user-current',
        showCommentPanel: true,
        isAddingComment: true,
        ...uiOverride,
      } as UIState,
    },
  });

describe('AddCommentForm', () => {
  test('renders when user is editor with a pending selection', () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument();
    expect(screen.getByText(/selected text/)).toBeInTheDocument();
  });

  test('does not render for viewer role', () => {
    const store = buildStore({}, { currentRole: 'viewer' } as any);
    const { container } = render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  test('does not render when isAddingComment is false', () => {
    const store = buildStore({}, { isAddingComment: false } as any);
    const { container } = render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  test('submit button is disabled when input is empty', () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    const submitBtn = screen.getByText('Comment');
    expect(submitBtn).toBeDisabled();
  });

  test('submit button is enabled after typing text', async () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    const input = screen.getByTestId('comment-input');
    await userEvent.type(input, 'This is a great point');
    expect(screen.getByText('Comment')).not.toBeDisabled();
  });

  test('cancel clears pendingSelection and closes form', async () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(store.getState().comments.pendingSelection).toBeNull();
      expect(store.getState().ui.isAddingComment).toBe(false);
    });
  });

  test('submitting a comment dispatches addComment and clears form', async () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    const input = screen.getByTestId('comment-input');
    await userEvent.type(input, 'My inline comment');
    fireEvent.click(screen.getByText('Comment'));

    await waitFor(() => {
      const state = store.getState().comments;
      expect(state.comments.length).toBeGreaterThan(0);
      expect(state.pendingSelection).toBeNull();
    });
  });

  test('reviewer role can also add comments', () => {
    const store = buildStore({}, { currentRole: 'reviewer' } as any);
    render(
      <Provider store={store}>
        <AddCommentForm />
      </Provider>
    );
    expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument();
  });
});
