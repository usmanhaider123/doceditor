// src/tests/PresenceBar.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PresenceBar from '../components/Presence/PresenceBar';
import presenceReducer from '../store/slices/presenceSlice';
import uiReducer from '../store/slices/uiSlice';
import { MOCK_COLLABORATORS } from '../mocks/mockData';
import { PresenceState, UIState } from '../types';

const buildStore = (
  presenceOverride: Partial<PresenceState> = {},
  uiOverride: Partial<UIState> = {}
) =>
  configureStore({
    reducer: { presence: presenceReducer, ui: uiReducer },
    preloadedState: {
      presence: {
        collaborators: MOCK_COLLABORATORS,
        cursors: [],
        selections: [],
        ...presenceOverride,
      } as PresenceState,
      ui: {
        currentRole: 'editor',
        currentUserId: 'user-current',
        showCommentPanel: true,
        isAddingComment: false,
        ...uiOverride,
      } as UIState,
    },
  });

describe('PresenceBar', () => {
  test('renders all mock collaborators', () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <PresenceBar />
      </Provider>
    );
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Marcus Reid')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });

  test('shows "You" for current user', () => {
    const store = buildStore();
    render(
      <Provider store={store}>
        <PresenceBar />
      </Provider>
    );
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  test('displays current user role label', () => {
    const store = buildStore({}, { currentRole: 'reviewer' } as any);
    render(
      <Provider store={store}>
        <PresenceBar />
      </Provider>
    );
    expect(screen.getByText('reviewer')).toBeInTheDocument();
  });

  test('shows "editing…" label for actively cursored collaborators', () => {
    const store = buildStore({
      cursors: [
        { userId: 'user-sarah', offset: 100, line: 3, color: '#FF6B6B', name: 'Sarah Chen' },
      ],
    });
    render(
      <Provider store={store}>
        <PresenceBar />
      </Provider>
    );
    expect(screen.getByText('editing…')).toBeInTheDocument();
  });

  test('does not show "editing…" when no cursors are active', () => {
    const store = buildStore({ cursors: [] });
    render(
      <Provider store={store}>
        <PresenceBar />
      </Provider>
    );
    expect(screen.queryByText('editing…')).not.toBeInTheDocument();
  });
});
