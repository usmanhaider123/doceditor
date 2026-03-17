// src/App.tsx

import React, { useEffect } from 'react';
import { useAppDispatch } from './hooks/redux';
import { fetchDocument } from './store/slices/documentSlice';
import { useAutoSave } from './hooks/useAutoSave';
import { useOfflineSync } from './hooks/useOfflineSync';
import Header from './components/Layout/Header';
import OfflineBanner from './components/Layout/OfflineBanner';
import DocumentEditor from './components/Editor/DocumentEditor';
import CommentPanel from './components/Comments/CommentPanel';
import PresenceBar from './components/Presence/PresenceBar';
import './styles/globals.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useAutoSave();
  useOfflineSync();

  useEffect(() => {
    dispatch(fetchDocument());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <OfflineBanner />

      <div className="flex flex-1 overflow-hidden">
        <PresenceBar />

        <main
          className="flex-1 overflow-y-auto bg-bg-base flex flex-col items-center px-6 py-10 max-[680px]:px-3 max-[680px]:py-5"
          role="main"
        >
          <DocumentEditor />
        </main>

        <CommentPanel />
      </div>
    </div>
  );
};

export default App;
