// src/mocks/mockData.ts

import { User, Comment, DocumentState } from '../types';

export const MOCK_COLLABORATORS: User[] = [
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    color: '#FF6B6B',
    avatar: 'SC',
    role: 'editor',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Reid',
    color: '#4ECDC4',
    avatar: 'MR',
    role: 'reviewer',
  },
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    color: '#FFE66D',
    avatar: 'PS',
    role: 'viewer',
  },
];

export const CURRENT_USER: User = {
  id: 'user-current',
  name: 'You',
  color: '#6C63FF',
  avatar: 'YO',
  role: 'editor',
};

export const MOCK_DOCUMENT: DocumentState = {
  id: 'doc-001',
  title: 'Product Requirements Document — Q4 2024',
  version: 42,
  lastSaved: new Date().toISOString(),
  //mocked content generated from claude
  content: `# Product Requirements Document

## Overview

This document outlines the requirements for the next generation of our collaborative platform. The goal is to deliver a seamless real-time editing experience that supports distributed teams across multiple time zones.

## Goals & Objectives

The primary objective is to reduce friction in collaborative workflows. We have identified three core pillars that will drive our roadmap:

1. **Real-time collaboration** — Users should see changes instantly, with presence indicators showing who is actively working.

2. **Offline resilience** — The application must continue to function without an internet connection, queuing changes locally and syncing when connectivity is restored.

3. **Access control** — Different stakeholders require different levels of access. Editors, reviewers, and viewers each have distinct interaction patterns.

## Technical Architecture

The frontend will be built using React 18 with TypeScript for type safety. State management will be handled by Redux Toolkit, which provides a predictable state container with excellent DevTools support.

For real-time features, we will simulate WebSocket connections using mock services. In production, this would be replaced with an actual WebSocket server or a service like Pusher or Ably.

## Feature Breakdown

### Collaborative Editing

All users with editor access can modify document content simultaneously. Cursor positions and text selections are broadcast to all active participants, rendered in distinct colors tied to each user's identity.

### Comment System

Reviewers and editors can annotate specific passages by selecting text and attaching comments. Comments appear as side notes anchored to the relevant text. Each comment supports threaded replies and can be resolved when addressed.

### Offline Mode

When connectivity is lost, the application enters offline mode automatically. A persistent banner notifies users of the degraded state. All edits made offline are stored in a local queue and replayed against the document once the connection is restored.

## Success Metrics

- Time to first meaningful paint: < 1.5s
- Collaborative sync latency: < 200ms (simulated)
- Offline queue reliability: 100% of queued changes applied on sync
- Accessibility score: WCAG 2.1 AA compliant

## Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 1 | Core editor and state management | 2 weeks |
| Phase 2 | Real-time presence simulation | 1 week |
| Phase 3 | Comment system | 1 week |
| Phase 4 | Offline support and sync | 1 week |
| Phase 5 | Testing and hardening | 1 week |

## Open Questions

- Should comment threads support @mentions for targeted notifications?
- What is the maximum document size we need to support?
- Do we need version history / undo across sessions?
`,
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    authorId: 'user-sarah',
    authorName: 'Sarah Chen',
    authorColor: '#FF6B6B',
    text: 'Should we specify a latency budget for the WebSocket reconnection logic here?',
    selectedText: 'Offline resilience',
    selectionStart: 342,
    selectionEnd: 360,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
    replies: [
      {
        id: 'reply-1',
        authorId: 'user-marcus',
        authorName: 'Marcus Reid',
        text: 'Good point — I suggest < 5s for auto-reconnect with exponential backoff.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: 'comment-2',
    authorId: 'user-marcus',
    authorName: 'Marcus Reid',
    authorColor: '#4ECDC4',
    text: 'This section needs more detail on the conflict resolution strategy when two users edit the same paragraph.',
    selectedText: 'Collaborative Editing',
    selectionStart: 1100,
    selectionEnd: 1121,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    resolved: false,
    replies: [],
  },
];
