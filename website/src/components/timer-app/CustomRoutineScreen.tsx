'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Routine, Phase } from '@/types/timer';

interface CustomRoutineScreenProps {
  onSaveRoutine: (routine: Routine) => void;
  onBack: () => void;
}

const PRESET_TECHNIQUES = [
  { label: 'Normal Breath / Stillness', type: 'witness' as const, defaultDuration: 180 },
  { label: 'Kapalbhati (Skull Shining Breath)', type: 'pranayama' as const, defaultDuration: 120 },
  { label: 'Anulom Vilom (Alternate Nostril)', type: 'pranayama' as const, defaultDuration: 300 },
  { label: 'Bhramari (Humming Bee Breath)', type: 'pranayama' as const, defaultDuration: 180 },
  { label: 'Ujjayi (Ocean Breath)', type: 'pranayama' as const, defaultDuration: 240 },
  { label: 'Sheetali (Cooling Breath)', type: 'pranayama' as const, defaultDuration: 180 },
  { label: 'Meditation & Silent Witness', type: 'witness' as const, defaultDuration: 300 },
];

function createPhaseId() {
  return `phase_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

export function CustomRoutineScreen({
  onSaveRoutine,
  onBack,
}: CustomRoutineScreenProps) {
  const [name, setName] = useState('Personal Sadhana');
  const [description, setDescription] = useState('Custom personalized pranayama routine');
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'p-1',
      type: 'witness',
      label: 'Initial Centering & Breath Awareness',
      description: 'Find a comfortable upright posture and observe the natural flow of your breath.',
      durationSeconds: 180,
    },
    {
      id: 'p-2',
      type: 'pranayama',
      label: 'Kapalbhati (Active Exhalations)',
      description: 'Active rapid abdominal exhalations followed by passive inhalations.',
      durationSeconds: 120,
    },
    {
      id: 'p-3',
      type: 'witness',
      label: 'Normal Breath & Internal Witnessing',
      description: 'Allow breath to stabilize naturally. Rest awareness in the forehead center.',
      durationSeconds: 120,
    },
    {
      id: 'p-4',
      type: 'pranayama',
      label: 'Anulom Vilom (Alternate Nostril Breathing)',
      description: 'Slow, rhythmic alternate nostril breathing for balance and nervous system harmony.',
      durationSeconds: 300,
    },
    {
      id: 'p-5',
      type: 'witness',
      label: 'Silent Integration & Meditation',
      description: 'Rest in pure stillness and witness the inner quietude.',
      durationSeconds: 300,
    },
  ]);

  const handleAddPhase = (presetIndex: number) => {
    const preset = PRESET_TECHNIQUES[presetIndex];
    if (!preset) return;

    const newPhase: Phase = {
      id: createPhaseId(),
      type: preset.type,
      label: preset.label,
      description: preset.type === 'witness' ? 'Normal natural breath and witnessing.' : 'Rhythmic classical practice.',
      durationSeconds: preset.defaultDuration,
    };

    setPhases([...phases, newPhase]);
  };

  const handleRemovePhase = (index: number) => {
    if (phases.length <= 1) return;
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleDurationChange = (index: number, newMinutes: number) => {
    const updated = [...phases];
    updated[index] = {
      ...updated[index],
      durationSeconds: Math.max(30, newMinutes * 60),
    };
    setPhases(updated);
  };

  const totalDurationSeconds = phases.reduce((acc, p) => acc + p.durationSeconds, 0);
  const totalMinutes = Math.round(totalDurationSeconds / 60);

  const handleSave = () => {
    if (!name.trim()) return;

    const customRoutine: Routine = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom sequence',
      category: 'pranayama',
      source: 'custom',
      totalDurationSeconds,
      phases,
    };

    onSaveRoutine(customRoutine);
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
              Create Custom Routine
            </h1>
            <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#82947A] block">
              Personal Sadhana Architecture
            </span>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Body Content (Independent Native Momentum Scroll) */}
      <main className="app-scrollable scrollbar-none flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A2D25]">
              Sequence Designer
            </h2>
            <p className="text-xs sm:text-sm text-[#355245] mt-1">
              Assemble your own custom sequence of pranayama techniques and witness phases.
            </p>
          </div>

          {/* Routine Metadata Card */}
          <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-6 space-y-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#355245] mb-1.5">
                  Routine Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#D6C6A5] rounded-2xl px-4 py-3 text-sm text-[#263F35] font-semibold focus:outline-none focus:ring-2 focus:ring-[#263F35]"
                  placeholder="e.g. Morning Vitality Set"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#355245] mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#D6C6A5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#263F35] font-normal focus:outline-none focus:ring-2 focus:ring-[#263F35]"
                  placeholder="Brief intention or description"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#82947A] pt-2 border-t border-[#D6C6A5]/40 font-medium">
              <span>{phases.length} Phases Configured</span>
              <span>Total Estimated Duration: <strong className="text-[#263F35]">{totalMinutes} minutes</strong></span>
            </div>
          </div>

          {/* Sequence Phases List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#355245]">
                Sequence Progression ({phases.length} Phases)
              </h3>
              <span className="text-xs text-[#82947A]">Adjust minutes or remove</span>
            </div>

            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div
                  key={phase.id || index}
                  className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-[#82947A]/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-full bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center text-xs font-bold text-[#263F35] shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#1A2D25] block truncate">
                        {phase.label}
                      </span>
                      <span className="text-[10px] text-[#82947A] uppercase tracking-wider font-semibold">
                        {phase.type === 'witness' ? 'Witness / Stillness' : 'Active Technique'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={Math.round(phase.durationSeconds / 60)}
                      onChange={(e) => handleDurationChange(index, parseInt(e.target.value, 10))}
                      className="bg-white border border-[#D6C6A5] rounded-xl px-3 py-1.5 text-xs text-[#263F35] font-bold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#263F35]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((m) => (
                        <option key={m} value={m}>
                          {m} min
                        </option>
                      ))}
                    </select>

                    {phases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(index)}
                        className="p-2 text-[#82947A] hover:text-[#B97755] hover:bg-[#EDE8DC] rounded-xl transition-colors"
                        title="Remove phase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Technique Presets */}
          <div className="bg-[#FAF7F2] border border-[#D6C6A5]/80 rounded-3xl p-6 space-y-3 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#355245]">
              Add Classical Technique or Witnessing Phase:
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_TECHNIQUES.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddPhase(idx)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white hover:bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] transition-all shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B97755]" />
                  <span>{preset.label.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Fixed Bottom Action Bar (Anchored at Bottom with Safe Area) */}
      <footer className="app-anchor-bar pb-safe w-full bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6C6A5]/40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <button
            onClick={handleSave}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#263F35] hover:bg-[#1A2D25] active:scale-[0.99] text-[#FAF7F2] font-sans font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <CheckCircle2 className="w-5 h-5 text-[#FAF7F2]" />
            <span>Save Routine &amp; Begin Practice</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
