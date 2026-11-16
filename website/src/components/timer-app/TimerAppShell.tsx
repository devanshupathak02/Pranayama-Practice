'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Routine, AppSettings, SessionRecord } from '@/types/timer';
import {
  PRANAYAMA_ROUTINES,
  YOGA_NIDRA_ROUTINES,
  SET_35_ROUTINE,
} from '@/data/routines';
import {
  loadAppSettings,
  saveAppSettings,
  loadSessionHistory,
  clearAllSessionHistory,
} from '@/lib/storage/indexedDB';
import { isAudioCachedOffline, downloadAudioTrack } from '@/lib/storage/offlineAudio';
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

function getInitialView(): AppView {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  const paramView = params.get('view') as AppView | null;
  if (paramView) return paramView;

  // Active Session Recovery: Prioritize resuming active session if practitioner was interrupted
  try {
    const raw = sessionStorage.getItem('pranayama_active_session');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.routineId && saved.sessionStartedAtMs) {
        return 'active';
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  return 'home';
}

function getInitialRoutine(): Routine {
  if (typeof window === 'undefined') return SET_35_ROUTINE;
  const params = new URLSearchParams(window.location.search);
  const routineId = params.get('routine');
  const sessionId = params.get('session');

  if (routineId) {
    const match = PRANAYAMA_ROUTINES.find((r) => r.id === routineId);
    if (match) return match;
  } else if (sessionId) {
    const match = YOGA_NIDRA_ROUTINES.find((r) => r.id === sessionId);
    if (match) return match;
  }

  // Active session recovery matching routine
  try {
    const raw = sessionStorage.getItem('pranayama_active_session');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.routineId) {
        const match = [...PRANAYAMA_ROUTINES, ...YOGA_NIDRA_ROUTINES].find((r) => r.id === saved.routineId);
        if (match) return match;
      }
    }
  } catch {
    // Ignore
  }

  return SET_35_ROUTINE;
}

export function TimerAppShell() {
  startupMetrics.mark('mount_start');

  // Navigation View State
  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine>(getInitialRoutine);
  const [customRoutines, setCustomRoutines] = useState<Routine[]>([]);

  // Splash Screen State: starts true, dismisses progressively on mount
  const [showSplash, setShowSplash] = useState(true);

  // App Settings: Read synchronously from localStorage cache for instant 0ms availability
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pranayama_app_settings_v1');
        if (cached) return JSON.parse(cached);
      } catch {
        // Fallback to default
      }
    }
    return {
      muteTechniqueNames: false,
      muteAllAudio: false,
      witnessSoundId: 'bell-1',
    };
  });

  // History and cache state - initialized lazily on-demand
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [cachedAudioMap, setCachedAudioMap] = useState<Record<string, boolean>>({});
  const [audioCacheChecked, setAudioCacheChecked] = useState(false);
  const [downloadingTrack, setDownloadingTrack] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Combine built-in routines with user custom routines
  const allPranayamaRoutines = useMemo(() => {
    return [...PRANAYAMA_ROUTINES, ...customRoutines];
  }, [customRoutines]);

  // Read URL query params on mount & popstate
  const syncStateFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const view = (params.get('view') as AppView) || 'home';
    const routineId = params.get('routine');
    const sessionId = params.get('session');

    if (routineId) {
      const match = allPranayamaRoutines.find((r) => r.id === routineId);
      if (match) {
        setSelectedRoutine(match);
      }
    } else if (sessionId) {
      const match = YOGA_NIDRA_ROUTINES.find((r) => r.id === sessionId);
      if (match) {
        setSelectedRoutine(match);
      }
    }

    setCurrentView(view);
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

  // Listen for browser popstate (back/forward navigation)
  useEffect(() => {
    window.addEventListener('popstate', syncStateFromUrl);
    return () => window.removeEventListener('popstate', syncStateFromUrl);
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

  // On-demand load: Check Yoga Nidra offline audio cache only when visiting Yoga Nidra screen
  useEffect(() => {
    if (currentView === 'yoga-nidra' && !audioCacheChecked) {
      const timer = setTimeout(() => {
        setAudioCacheChecked(true);
        YOGA_NIDRA_ROUTINES.forEach((session) => {
          if (session.audioFile) {
            isAudioCachedOffline(session.audioFile)
              .then((cached) => {
                setCachedAudioMap((prev) => ({ ...prev, [session.audioFile!]: cached }));
              })
              .catch(() => { });
          }
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentView, audioCacheChecked]);

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

  const handleDownloadTrack = async (audioFile: string) => {
    if (downloadingTrack) return;
    setDownloadingTrack(audioFile);
    setDownloadProgress(0);

    const res = await downloadAudioTrack(audioFile, (p) => {
      setDownloadProgress(p.percentage);
    });

    setDownloadingTrack(null);
    if (res.success) {
      setCachedAudioMap((prev) => ({ ...prev, [audioFile]: true }));
    }
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
          cachedAudioMap={cachedAudioMap}
          downloadingTrack={downloadingTrack}
          downloadProgress={downloadProgress}
          onSelectSession={handleSelectYogaNidra}
          onDownloadTrack={handleDownloadTrack}
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
