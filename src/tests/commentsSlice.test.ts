// src/tests/commentsSlice.test.ts

import commentsReducer, {
  setPendingSelection,
  setActiveComment,
  addReply,
  injectComment,
  addComment,
  resolveComment,
} from '../store/slices/commentsSlice';
import { CommentsState, Comment } from '../types';

// Mock the API
jest.mock('../mocks/mockApi', () => ({
  mockApi: {
    addComment: jest.fn().mockImplementation((data) =>
      Promise.resolve({ ...data, id: 'comment-new-123' })
    ),
    resolveComment: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const mockComment: Comment = {
  id: 'comment-test-1',
  authorId: 'user-1',
  authorName: 'Alice',
  authorColor: '#FF6B6B',
  text: 'Great point here',
  selectedText: 'some text',
  selectionStart: 10,
  selectionEnd: 19,
  createdAt: new Date().toISOString(),
  resolved: false,
  replies: [],
};

const getInitialState = (): CommentsState => ({
  comments: [],
  activeCommentId: null,
  pendingSelection: null,
});

describe('commentsSlice reducers', () => {
  test('setPendingSelection — stores selection', () => {
    const selection = { start: 0, end: 10, text: 'hello text' };
    const state = commentsReducer(getInitialState(), setPendingSelection(selection));
    expect(state.pendingSelection).toEqual(selection);
  });

  test('setPendingSelection — clears selection when null', () => {
    const withSelection: CommentsState = {
      ...getInitialState(),
      pendingSelection: { start: 0, end: 5, text: 'hello' },
    };
    const state = commentsReducer(withSelection, setPendingSelection(null));
    expect(state.pendingSelection).toBeNull();
  });

  test('setActiveComment — sets active comment id', () => {
    const state = commentsReducer(getInitialState(), setActiveComment('comment-123'));
    expect(state.activeCommentId).toBe('comment-123');
  });

  test('setActiveComment — clears active comment when null', () => {
    const withActive: CommentsState = {
      ...getInitialState(),
      activeCommentId: 'comment-123',
    };
    const state = commentsReducer(withActive, setActiveComment(null));
    expect(state.activeCommentId).toBeNull();
  });

  test('addReply — appends reply to existing comment', () => {
    const initial: CommentsState = {
      ...getInitialState(),
      comments: [{ ...mockComment }],
    };

    const state = commentsReducer(
      initial,
      addReply({
        commentId: mockComment.id,
        text: 'I agree!',
        authorId: 'user-2',
        authorName: 'Bob',
      })
    );

    expect(state.comments[0].replies).toHaveLength(1);
    expect(state.comments[0].replies[0].text).toBe('I agree!');
    expect(state.comments[0].replies[0].authorName).toBe('Bob');
  });

  test('addReply — does nothing for unknown comment id', () => {
    const initial: CommentsState = {
      ...getInitialState(),
      comments: [{ ...mockComment }],
    };

    const state = commentsReducer(
      initial,
      addReply({
        commentId: 'non-existent-id',
        text: 'reply',
        authorId: 'user-2',
        authorName: 'Bob',
      })
    );

    expect(state.comments[0].replies).toHaveLength(0);
  });

  test('injectComment — adds comment if not already present', () => {
    const state = commentsReducer(getInitialState(), injectComment(mockComment));
    expect(state.comments).toHaveLength(1);
    expect(state.comments[0].id).toBe(mockComment.id);
  });

  test('injectComment — does not duplicate existing comment', () => {
    const initial: CommentsState = {
      ...getInitialState(),
      comments: [{ ...mockComment }],
    };

    const state = commentsReducer(initial, injectComment(mockComment));
    expect(state.comments).toHaveLength(1);
  });
});

describe('commentsSlice async thunks', () => {
  test('addComment.fulfilled — appends comment and clears pendingSelection', () => {
    const initial: CommentsState = {
      ...getInitialState(),
      pendingSelection: { start: 0, end: 9, text: 'some text' },
    };

    const newComment: Comment = {
      ...mockComment,
      id: 'comment-new-123',
    };

    const action = {
      type: addComment.fulfilled.type,
      payload: newComment,
    };

    const state = commentsReducer(initial, action);
    expect(state.comments).toHaveLength(1);
    expect(state.comments[0].id).toBe('comment-new-123');
    expect(state.pendingSelection).toBeNull();
  });

  test('resolveComment.fulfilled — marks comment resolved', () => {
    const initial: CommentsState = {
      ...getInitialState(),
      comments: [{ ...mockComment }],
      activeCommentId: mockComment.id,
    };

    const action = {
      type: resolveComment.fulfilled.type,
      payload: mockComment.id,
    };

    const state = commentsReducer(initial, action);
    expect(state.comments[0].resolved).toBe(true);
    expect(state.activeCommentId).toBeNull();
  });

  test('resolveComment.fulfilled — does not affect other comments', () => {
    const otherComment: Comment = { ...mockComment, id: 'other-comment', resolved: false };
    const initial: CommentsState = {
      ...getInitialState(),
      comments: [{ ...mockComment }, otherComment],
    };

    const action = {
      type: resolveComment.fulfilled.type,
      payload: mockComment.id,
    };

    const state = commentsReducer(initial, action);
    expect(state.comments[0].resolved).toBe(true);
    expect(state.comments[1].resolved).toBe(false);
  });
});
