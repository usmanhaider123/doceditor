# Document Editor

A production-quality frontend for a real-time collaborative document editor, built with React 18, TypeScript, Redux Toolkit, and a dark editorial aesthetic. Implements role-based access, simulated real-time presence, inline commenting, and offline-first support with change queuing.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/doceditor.git
cd doceditor
npm install

# 2. Start development server
npm start
# → Opens at http://localhost:3000

# 3. Run tests
npm test

# 4. Run tests with coverage
npm run test:coverage

# 5. Production build
npm run build
```

**Requirements:** Node.js ≥ 16, npm ≥ 8

---

## Feature Overview

| Feature | Status | Notes |
| Document editing | ✅ | Full textarea with autosave |
| Role-based access | ✅ | Editor / Reviewer / Viewer |
| Real-time presence (simulated) | ✅ | 3 mock collaborators, cursor activity every 10s |
| Inline comments | ✅ | Select text → add comment, with replies |
| Comment resolution | ✅ | Marks thread resolved |
| Offline mode | ✅ | Toggle switch, change queue, sync on reconnect |
| Autosave | ✅ | 2s debounce, queued when offline |
| Unit tests | ✅ | Slices + component tests with Jest |

---

## State Management Strategy

Redux Toolkit manages all application state in five slices:

**`documentSlice`** owns the document content, title, version, and save status. Async thunks (`fetchDocument`, `saveDocument`) call the mock API. The `isDirty` flag is set on any content change and cleared on successful save.

**`commentsSlice`** maintains the comment array, tracks which comment is active (for highlighting), and stores a pending selection (the text the user has highlighted but hasn't yet submitted a comment for).

**`offlineSlice`** holds a typed change queue (`OfflineChange[]`) persisted to `localStorage` so edits survive a page refresh while offline. Edit changes are _collapsed_ — only the latest content snapshot is kept, preventing unbounded queue growth. Comment changes accumulate individually. The `syncOfflineChanges` thunk replays the queue against the mock API on reconnect.

**`presenceSlice`** holds the collaborator list and their current cursor/selection positions, updated by `usePresenceSimulation`.

**`uiSlice`** holds view-layer state: current role, panel visibility, and whether the comment form is open.

---

## Offline Strategy

```
User edits  →  updateContent (Redux)
                    ↓
             useAutoSave (2s debounce)
                    ↓
          isOffline?
          ├─ YES → queueEditChange (localStorage)
          └─ NO  → saveDocument (mock API)

User toggles back online
                    ↓
          syncOfflineChanges thunk
                    ↓
          mockApi.syncOfflineChanges(queue)
                    ↓
          fetchDocument → UI reflects synced state
```

Offline changes are stored with `type`, `timestamp`, and `payload`. The queue is persisted to `localStorage` under the key `collab_editor_offline_queue`, so queued edits survive a hard refresh. Consecutive edits are collapsed to one entry on enqueue, minimising the payload on sync.

---

## Role-Based Access

| Action | Editor | Reviewer | Viewer |
|---|---|---|---|
| Edit document text | ✅ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ❌ |
| Reply to comments | ✅ | ✅ | ❌ |
| Resolve comments | ✅ | ✅ | ❌ |
| View document | ✅ | ✅ | ✅ |

The role dropdown updates `uiSlice.currentRole`. Components read this value to gate interactions: the textarea gains `readOnly`, comment UI is hidden, and a "View only" badge appears for viewers.

---

## Real-Time Presence Simulation

`usePresenceSimulation` runs on a 10-second interval and randomly picks one of the three mock collaborators, generates a character offset within the current document length, and dispatches `updateCursor`. 50% of the time it also dispatches `updateSelection` for a 60-character window, then clears it after 3 seconds.

In production this hook would be replaced by a WebSocket event handler (Socket.IO, Ably, Pusher) receiving presence updates from a server.

---

## Design Decisions & Assumptions

- **No backend required.** All persistence is mocked in `mockApi.ts` with artificial delays. The `localStorage` queue is the only real persistence layer.
- **Textarea over rich text editor.** Chosen to keep the implementation self-contained. In production, ProseMirror or TipTap would provide block-level operations, OT/CRDT merging, and richer cursor positioning.
- **Cursor position is approximate.** With a plain textarea, pixel-accurate cursor placement requires canvas measurement. The implementation uses a line-height × line-number approximation to demonstrate the concept.
- **Offline collapse strategy.** Multiple rapid edits are collapsed into a single queue entry (last-write wins) to avoid sending near-identical snapshots during sync.
- **No authentication.** The current user is hard-coded as `CURRENT_USER` in `mockData.ts`. A real implementation derives this from an auth token.

---

## Tech Stack

| Framework | React 18 | Industry standard, concurrent features |
| Language | TypeScript | Type safety across the entire data flow |
| State | Redux Toolkit | Predictable state, excellent DevTools |
| Styling | Custom CSS Design System | Full control over the dark editorial aesthetic |
| API mocking | In-memory async functions | Zero external dependencies |
| Testing | Jest + RTL | Official CRA stack, great component testing |
| Fonts | DM Sans + DM Serif Display + DM Mono | Cohesive editorial feel |

---
