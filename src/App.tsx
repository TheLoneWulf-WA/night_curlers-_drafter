import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { DraftSettings, ParsedRoster, Team } from './types';
import { parseRosterText } from './utils/parser';
import { buildTeams } from './utils/drafter';
import { InputScreen } from './components/InputScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SAMPLE_ROSTER } from './data/sampleRoster';
import { NightCurlersLogo } from './components/NightCurlersLogo';

const STORAGE_KEY_ROSTER = 'night_curlers_raw_roster_v2';
const STORAGE_KEY_SETTINGS = 'night_curlers_settings_v2';
const STORAGE_KEY_TEAMS = 'night_curlers_teams_v2';
const STORAGE_KEY_SEED = 'night_curlers_seed_v2';

export default function App() {
  // Initialize state with localStorage fallbacks
  const [rawText, setRawText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROSTER);
      return saved !== null ? saved : SAMPLE_ROSTER;
    } catch {
      return SAMPLE_ROSTER;
    }
  });

  const [settings, setSettings] = useState<DraftSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      numTeams: 4,
      playersPerTeam: 10,
      seed: Math.floor(Math.random() * 90000) + 1000,
    };
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [seedUsed, setSeedUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEED);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return settings.seed;
  });

  const [scatterValid, setScatterValid] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'input' | 'results'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
      if (saved && JSON.parse(saved).length > 0) return 'results';
    } catch {}
    return 'input';
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROSTER, rawText);
    } catch (e) {
      console.warn('Failed to save roster to localStorage:', e);
    }
  }, [rawText]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.warn('Failed to save teams to localStorage:', e);
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEED, seedUsed.toString());
    } catch (e) {
      console.warn('Failed to save seed to localStorage:', e);
    }
  }, [seedUsed]);

  // Real-time live parsing of the pasted roster
  const parsed: ParsedRoster = useMemo(() => {
    return parseRosterText(rawText);
  }, [rawText]);

  const handleBuildTeams = (overrideSeed?: number) => {
    if (parsed.starters.length === 0) return;

    const baseSeed = overrideSeed !== undefined ? overrideSeed : settings.seed;
    const result = buildTeams(
      parsed.starters,
      parsed.subs,
      settings.numTeams,
      settings.playersPerTeam,
      baseSeed
    );

    setTeams(result.teams);
    setSeedUsed(result.actualSeedUsed);
    setScatterValid(result.scatterValid);
    setCurrentView('results');
  };

  const handleReshuffle = () => {
    const nextSeed = seedUsed + 1;
    setSettings((prev) => ({ ...prev, seed: nextSeed }));
    handleBuildTeams(nextSeed);
  };

  return (
    <div className="min-h-screen bg-zinc-100/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/30">
      {/* Top Application Header Bar */}
      <header className="no-print app-header border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NightCurlersLogo size={42} className="drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base leading-tight tracking-tight uppercase">
                  Night Curlers FC
                </h1>
                <span className="hidden md:inline-block text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                  Team Drafter
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block italic">
                &ldquo;Don&apos;t Do Drugs, Play Football&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentView === 'results' ? (
              <button
                type="button"
                onClick={() => setCurrentView('input')}
                className="text-xs font-bold px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer active:scale-95"
              >
                Roster Input
              </button>
            ) : teams.length > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentView('results')}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
              >
                View Draft ({teams.length} Teams)
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentView === 'input' ? (
          <InputScreen
            rawText={rawText}
            setRawText={setRawText}
            parsed={parsed}
            settings={settings}
            setSettings={setSettings}
            onBuildTeams={() => handleBuildTeams()}
          />
        ) : (
          <ResultsScreen
            teams={teams}
            setTeams={setTeams}
            parsed={parsed}
            seedUsed={seedUsed}
            scatterValid={scatterValid}
            onReshuffle={handleReshuffle}
            onBackToInput={() => setCurrentView('input')}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="no-print border-t border-zinc-200 dark:border-zinc-800/80 py-5 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <NightCurlersLogo size={20} />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Night Curlers Football Club
            </span>
            <span>· Offline &amp; Deterministic Drafter</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Position-Balanced · Numbers Scattered
          </span>
        </div>
      </footer>
    </div>
  );
}
