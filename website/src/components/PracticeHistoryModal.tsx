"use client";

import React, { useRef } from "react";
import { SessionRecord } from "@/types/timer";
import { X, Calendar, Clock, CheckCircle2, Trash2, Download, Upload } from "lucide-react";

interface PracticeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionRecord[];
  onClearHistory: () => Promise<void>;
  onImportHistory?: (records: SessionRecord[]) => Promise<void>;
}

export const PracticeHistoryModal: React.FC<PracticeHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onImportHistory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalPracticeMinutes = Math.round(
    history.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0) / 60
  );

  const handleExport = () => {
    if (history.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pranayama_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportHistory) {
          await onImportHistory(parsed);
          alert(`Successfully imported ${parsed.length} sessions!`);
        }
      } catch {
        alert("Invalid history file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2D25]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D6C6A5]/50 bg-[#EDE8DC]/50">
          <div>
            <h3 className="font-serif font-bold text-2xl text-[#263F35]">
              Practice Journal & History
            </h3>
            <p className="text-xs text-[#82947A]">
              Stored privately in your browser storage (IndexedDB)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#82947A] hover:text-[#263F35] hover:bg-[#EDE8DC] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 gap-4 p-5 bg-[#EDE8DC]/30 border-b border-[#D6C6A5]/40 text-center">
          <div>
            <span className="block text-2xl font-serif font-bold text-[#263F35]">
              {history.length}
            </span>
            <span className="text-xs uppercase tracking-wider text-[#82947A]">
              Sessions Completed
            </span>
          </div>
          <div>
            <span className="block text-2xl font-serif font-bold text-[#263F35]">
              {totalPracticeMinutes}
            </span>
            <span className="text-xs uppercase tracking-wider text-[#82947A]">
              Total Minutes
            </span>
          </div>
        </div>

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#82947A] space-y-2">
              <Calendar className="w-8 h-8 mx-auto opacity-50 text-[#263F35]" />
              <p className="text-sm font-medium">No sessions logged yet.</p>
              <p className="text-xs max-w-xs mx-auto">
                Complete your first breathing sequence to start recording your personal practice sadhana.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const date = new Date(record.startedAt);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const durationMins = Math.max(1, Math.round(record.durationSeconds / 60));

              return (
                <div
                  key={record.id}
                  className="bg-[#EDE8DC] border border-[#D6C6A5] rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-[#263F35] text-base">
                        {record.routineName}
                      </span>
                      {record.completed && (
                        <CheckCircle2 className="w-4 h-4 text-[#82947A]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#82947A]">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate} at {formattedTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {durationMins} min
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5]">
                    {record.completed
                      ? "Complete"
                      : `${record.completedPhases}/${record.totalPhases} phases`}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D6C6A5]/50 bg-[#EDE8DC]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your local practice history?")) {
                    onClearHistory();
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-[#B97755] hover:text-[#8C4F35] font-medium transition-colors mr-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {history.length > 0 && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1 text-xs text-[#263F35] hover:text-[#82947A] font-medium transition-colors"
                title="Export backup of practice sessions as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs text-[#263F35] hover:text-[#82947A] font-medium transition-colors ml-1"
              title="Import practice history backup from another device or domain"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#263F35] text-[#FAF7F2] text-xs font-medium hover:bg-[#1A2D25] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
