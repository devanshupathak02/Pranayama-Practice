'use client';

import React, { useState } from 'react';
import { ArrowLeft, History, Download, Upload, Trash2, Award, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { SessionRecord } from '@/types/timer';
import { importSessionHistory } from '@/lib/storage/indexedDB';

interface AppHistoryScreenProps {
  history: SessionRecord[];
  onClearHistory: () => Promise<void>;
  onRefreshHistory: () => Promise<void>;
  onBack: () => void;
}

export function AppHistoryScreen({
  history,
  onClearHistory,
  onRefreshHistory,
  onBack,
}: AppHistoryScreenProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Aggregated Stats
  const totalSessions = history.length;
  const totalSeconds = history.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Export JSON backup
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pranayama_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const records = JSON.parse(text);
      if (!Array.isArray(records)) {
        throw new Error('Invalid format: expected an array of session records');
      }
      await importSessionHistory(records);
      await onRefreshHistory();
      setImportStatus(`Successfully restored ${records.length} sessions.`);
      setTimeout(() => setImportStatus(null), 4000);
    } catch {
      setImportStatus('Failed to import: file is not a valid practice history backup.');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Fixed Top Header (Anchored at Top with Safe Area) */}
      <header className="app-anchor-bar pt-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#D6C6A5]/60 flex items-center justify-center text-[#263F35] hover:bg-[#E2E8DF] active:scale-95 transition-all shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-sans font-bold text-base sm:text-lg text-[#263F35] tracking-tight leading-tight">
              Practice Journal
            </h1>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
              Sadhana Records &bull; Dedicated History
            </span>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Independent Native Momentum Scroll) */}
      <main className="app-scrollable scrollbar-none flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A2D25]">
              Sadhana Journal &amp; Metrics
            </h2>
            <p className="text-xs sm:text-sm text-[#355245] mt-1">
              Your logged breathing sessions and restorative journeys, stored locally in your private browser storage.
            </p>
          </div>

          {/* Aggregate Stat Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-6 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-[#82947A] font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#B97755]" />
                <span>Total Sessions</span>
              </div>
              <span className="font-serif font-bold text-4xl sm:text-5xl text-[#263F35] block">
                {totalSessions}
              </span>
              <span className="text-xs text-[#355245]">Completed Conscious Breathing Sessions</span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-6 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-[#82947A] font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#82947A]" />
                <span>Mindful Presence</span>
              </div>
              <span className="font-serif font-bold text-4xl sm:text-5xl text-[#263F35] block">
                {totalMinutes}
                <span className="text-xl font-normal text-[#82947A] ml-2">minutes</span>
              </span>
              <span className="text-xs text-[#355245]">Total Time Anchored in Conscious Prana</span>
            </div>
          </div>

          {/* Backup Tools */}
          <div className="flex items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={history.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D6C6A5] bg-[#FAF7F2] text-[#263F35] hover:bg-[#E2E8DF] disabled:opacity-40 transition-colors shadow-2xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-[#82947A]" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D6C6A5] bg-[#FAF7F2] text-[#263F35] hover:bg-[#E2E8DF] cursor-pointer transition-colors shadow-2xs font-semibold">
                <Upload className="w-3.5 h-3.5 text-[#82947A]" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {history.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Clear all recorded practice sessions? This cannot be undone.')) {
                    await onClearHistory();
                  }
                }}
                className="inline-flex items-center gap-1.5 text-[#B97755] hover:text-[#985E40] py-1.5 px-3 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                title="Clear practice history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {importStatus && (
            <div className="p-4 bg-[#E2E8DF] text-[#263F35] text-xs rounded-2xl border border-[#C5D3C2] font-medium">
              {importStatus}
            </div>
          )}

          {/* Chronological Session Log */}
          <div className="space-y-4 pt-2">
            <h3 className="font-sans font-bold text-xs text-[#1A2D25] uppercase tracking-wider">
              Chronological Session History
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-dashed border-[#D6C6A5] p-8 space-y-3">
                <History className="w-10 h-10 text-[#82947A] mx-auto opacity-50" />
                <p className="font-serif font-bold text-lg text-[#263F35]">No practice sessions recorded yet</p>
                <p className="text-xs text-[#82947A] max-w-sm mx-auto">
                  Complete a Pranayama sequence or Yoga Nidra session to record your sadhana and track your mindful presence.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {history.map((record) => {
                  const date = new Date(record.completedAt || record.startedAt);
                  const formattedDate = date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const durationMin = Math.round(record.durationSeconds / 60);

                  return (
                    <div
                      key={record.id}
                      className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-[#82947A]/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#82947A]" />
                          <span className="font-serif font-bold text-base sm:text-lg text-[#1A2D25]">
                            {record.routineName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#82947A]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                          <span>&bull;</span>
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-lg sm:text-xl text-[#263F35] block">
                          {durationMin} min
                        </span>
                        <span className="text-[11px] font-semibold text-[#82947A] uppercase tracking-wider">
                          {record.completed ? 'Completed' : 'Partial'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <button
            onClick={onBack}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#263F35] hover:bg-[#1A2D25] active:scale-[0.99] text-[#FAF7F2] font-sans font-bold text-sm sm:text-base transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            Return to Previous Screen
          </button>
        </div>
      </footer>
    </div>
  );
}
