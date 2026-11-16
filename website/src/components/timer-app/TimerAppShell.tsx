'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Routine, AppSettings, SessionRecord } from '@/types/timer';
import {
  PRANAYAMA_ROUTINES,
  YOGA_NIDRA_ROUTINES,
  SET_35_ROUTINE,
  getRoutineById,
} from '@/data/routines';
import {
  loadAppSettings,
  saveAppSettings,
  loadSessionHistory,
  clearAllSessionHistory,
} from '@/lib/storage/indexedDB';
import { startupMetrics } from '@/lib/performance/startupMetrics';
import { AppSplashScreen } from './AppSplashScreen';
import { AppHomeScreen } from './AppHomeScreen';

// Progressive Code-Splitting: Load non-initial screens dynamically
// Prevents downloading secondary screens during critical iPhone startup
const PranayamaListScreen = dynamic(
  () => import('./PranayamaListScreen').then((m) => m.PranayamaListScreen),
  { ssr: false }
);
const YogaNidraListScreen = dynamic(
  () => import('./YogaNidraListScreen').then((m) => m.YogaNidraListScreen),
  { ssr: false }
);
const AppSettingsScreen = dynamic(
  () => import('./AppSettingsScreen').then((m) => m.AppSettingsScreen),
  { ssr: false }
);
const AppHistoryScreen = dynamic(
  () => import('./AppHistoryScreen').then((m) => m.AppHistoryScreen),
  { ssr: false }
);
const CustomRoutineScreen = dynamic(
  () => import('./CustomRoutineScreen').then((m) => m.CustomRoutineScreen),
  { ssr: false }
);
const ActivePracticeScreen = dynamic(
  () => import('./ActivePracticeScreen').then((m) => m.ActivePracticeScreen),
  { ssr: false }
);

type AppView =
  | 'home'
  | 'pranayama'
  | 'yoga-nidra'
  | 'active'
  | 'settings'
  | 'history'
  | 'custom-routine';

export function TimerAppShell() {
  startupMetrics.mark('mount_start');

  // Navigation View State - Initialized deterministically for SSR and hydration parity
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine>(SET_35_ROUTINE);
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);

  // Splash Screen State: starts true, dismisses progressively on mount
  const [showSplash, setShowSplash] = useState(true);

  // App Settings: Default SSR state, reconciled instantly on mount from local cache
  const [settings, setSettings] = useState<AppSettings>({
    muteTechniqueNames: false,
    muteAllAudio: false,
    witnessSoundId: 'bell-1',
  });

  // History state - initialized lazily on-demand
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Combine built-in routines with user custom routines
  const allPranayamaRoutines = useMemo(() => {
    return [...PRANAYAMA_ROUTINES, ...customRoutines];
  }, [customRoutines]);

  // Read URL query params on mount & popstate
  const syncStateFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as AppView | null;
    const routineId = params.get('routine');
    const sessionId = params.get('session');

    if (routineId) {
      const match = allPranayamaRoutines.find((r) => r.id === routineId) || getRoutineById(routineId);
      if (match) {
        setSelectedRoutine(match);
      }
    } else if (sessionId) {
      const match = YOGA_NIDRA_ROUTINES.find((r) => r.id === sessionId) || getRoutineById(sessionId);
      if (match) {
        setSelectedRoutine(match);
      }
    }

    if (view) {
      setCurrentView(view);
      return;
    }

    // Active session recovery matching routine
    try {
      const raw = sessionStorage.getItem('pranayama_active_session');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.routineId && saved.sessionStartedAtMs) {
          const match = getRoutineById(saved.routineId);
          if (match) {
            setSelectedRoutine(match);
          }
          setCurrentView('active');
          return;
        }
      }
    } catch {
      // Ignore
    }

    setCurrentView('home');
  }, [allPranayamaRoutines]);

  // Navigate to view and update URL history
  const navigateTo = useCallback((view: AppView, params?: { routineId?: string; sessionId?: string }) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (view === 'home') {
      url.searchParams.delete('view');
      url.searchParams.delete('routine');
      url.searchParams.delete('session');
    } else {
      url.searchParams.set('view', view);
      if (params?.routineId) {
        url.searchParams.set('routine', params.routineId);
        url.searchParams.delete('session');
      } else if (params?.sessionId) {
        url.searchParams.set('session', params.sessionId);
        url.searchParams.delete('routine');
      } else {
        url.searchParams.delete('routine');
        url.searchParams.delete('session');
      }
    }

    window.history.pushState({}, '', url.toString());
    setCurrentView(view);
  }, []);

  // Hydration sync on client mount & popstate navigation
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      syncStateFromUrl();

      // Reconcile settings from localStorage cache immediately on mount
      try {
        const cached = localStorage.getItem('pranayama_app_settings_v1');
        if (cached) {
          setSettings(JSON.parse(cached));
        }
      } catch {
        // Ignore
      }
    });

    window.addEventListener('popstate', syncStateFromUrl);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('popstate', syncStateFromUrl);
    };
  }, [syncStateFromUrl]);

  // Critical Startup Effect: Measure milestones, defer nonessential I/O to idle time
  useEffect(() => {
    startupMetrics.measure('app_mounting', 'mount_start');
    startupMetrics.measure('react_hydration', 'html_script_execution');
    startupMetrics.measure('first_meaningful_render', 'mount_start');

    // Asynchronously reconcile settings from IndexedDB in the background
    startupMetrics.mark('settings_fetch_start');
    loadAppSettings()
      .then((s) => {
        startupMetrics.measure('settings_retrieval', 'settings_fetch_start');
        setSettings(s);
      })
      .catch(() => { });

    // Schedule background nonessential work during browser idle time
    const scheduleIdleWork = () => {
      // 1. Preload history in background
      if (!historyLoaded) {
        loadSessionHistory()
          .then((h) => {
            setHistory(h);
            setHistoryLoaded(true);
          })
          .catch(() => { });
      }

      // Log report after initial render is stable
      setTimeout(() => {
        startupMetrics.logReportOnce();
      }, 500);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(scheduleIdleWork);
    } else {
      setTimeout(scheduleIdleWork, 800);
    }
  }, [historyLoaded]);

  // On-demand load: History when opened
  useEffect(() => {
    if (currentView === 'history' && !historyLoaded) {
      loadSessionHistory()
        .then((h) => {
          setHistory(h);
          setHistoryLoaded(true);
        })
        .catch(() => { });
    }
  }, [currentView, historyLoaded]);

  // Handlers
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveAppSettings(newSettings);
  };

  const handleClearHistory = async () => {
    await clearAllSessionHistory();
    setHistory([]);
  };

  const handleRefreshHistory = async () => {
    const updated = await loadSessionHistory();
    setHistory(updated);
    setHistoryLoaded(true);
  };

  const handleSelectPranayama = (routine: Routine) => {
    setSelectedRoutine(routine);
    navigateTo('active', { routineId: routine.id });
  };

  const handleSelectYogaNidra = (session: Routine) => {
    setSelectedRoutine(session);
    navigateTo('active', { sessionId: session.id });
  };

  const handleSaveCustomRoutine = (routine: Routine) => {
    setCustomRoutines((prev) => [routine, ...prev]);
    setSelectedRoutine(routine);
    navigateTo('active', { routineId: routine.id });
  };

  const handleSessionComplete = (record: SessionRecord) => {
    setHistory((prev) => [record, ...prev]);
  };

  return (
    <div className="app-shell-fixed meditation-canvas text-[#263F35] pl-safe pr-safe select-none">
      {/* 1. App Splash Breath Pulse (Hydration overlay) */}
      {showSplash && <AppSplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 2. Main Screen Routing */}
      {currentView === 'home' && (
        <AppHomeScreen
          onSelectCategory={(cat) => navigateTo(cat)}
          onOpenSettings={() => navigateTo('settings')}
          onOpenHistory={() => navigateTo('history')}
          onOpenCreateRoutine={() => navigateTo('custom-routine')}
        />
      )}

      {currentView === 'pranayama' && (
        <PranayamaListScreen
          routines={allPranayamaRoutines}
          onSelectRoutine={handleSelectPranayama}
          onBack={() => navigateTo('home')}
          onOpenSettings={() => navigateTo('settings')}
          onOpenHistory={() => navigateTo('history')}
          onOpenCreateRoutine={() => navigateTo('custom-routine')}
        />
      )}

      {currentView === 'yoga-nidra' && (
        <YogaNidraListScreen
          sessions={YOGA_NIDRA_ROUTINES}
          onSelectSession={handleSelectYogaNidra}
          onBack={() => navigateTo('home')}
          onOpenSettings={() => navigateTo('settings')}
          onOpenHistory={() => navigateTo('history')}
          onOpenCreateRoutine={() => navigateTo('custom-routine')}
        />
      )}

      {currentView === 'active' && (
        <ActivePracticeScreen
          routine={selectedRoutine}
          settings={settings}
          onSessionComplete={handleSessionComplete}
          onExit={() => {
            if (selectedRoutine.category === 'yoga-nidra') {
              navigateTo('yoga-nidra');
            } else {
              navigateTo('pranayama');
            }
          }}
        />
      )}

      {currentView === 'settings' && (
        <AppSettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              navigateTo('home');
            }
          }}
        />
      )}

      {currentView === 'history' && (
        <AppHistoryScreen
          history={history}
          onClearHistory={handleClearHistory}
          onRefreshHistory={handleRefreshHistory}
          onBack={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              navigateTo('home');
            }
          }}
        />
      )}

      {currentView === 'custom-routine' && (
        <CustomRoutineScreen
          onSaveRoutine={handleSaveCustomRoutine}
          onBack={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              navigateTo('pranayama');
            }
          }}
        />
      )}
    </div>
  );
}
