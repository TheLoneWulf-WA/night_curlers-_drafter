import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Trash2,
  ArrowRight,
  ClipboardPaste,
  Info,
  Check,
} from 'lucide-react';
import { ParsedRoster, DraftSettings } from '../types';
import { SAMPLE_ROSTER } from '../data/sampleRoster';
import { NightCurlersLogo } from './NightCurlersLogo';

interface InputScreenProps {
  rawText: string;
  setRawText: (text: string) => void;
  parsed: ParsedRoster;
  settings: DraftSettings;
  setSettings: React.Dispatch<React.SetStateAction<DraftSettings>>;
  onBuildTeams: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  rawText,
  setRawText,
  parsed,
  settings,
  setSettings,
  onBuildTeams,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const targetStartersNeeded = settings.numTeams * settings.playersPerTeam;
  const totalParsedStarters = parsed.starters.length;
  const isTargetMet = totalParsedStarters === targetStartersNeeded;
  const hasDeficit = totalParsedStarters > 0 && totalParsedStarters < targetStartersNeeded;
  const hasSurplus = totalParsedStarters > targetStartersNeeded;

  const handleLoadExample = () => {
    setRawText(SAMPLE_ROSTER);
  };

  const handleClear = () => {
    if (window.confirm('Clear the current roster text?')) {
      setRawText('');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setRawText(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      alert('Could not access clipboard. Please paste manually into the text area.');
    }
  };

  // Percentage calculations for distribution bar
  const totalPositions = parsed.counts.D + parsed.counts.M + parsed.counts.F + parsed.counts.GK;
  const pctD = totalPositions > 0 ? (parsed.counts.D / totalPositions) * 100 : 0;
  const pctM = totalPositions > 0 ? (parsed.counts.M / totalPositions) * 100 : 0;
  const pctF = totalPositions > 0 ? (parsed.counts.F / totalPositions) * 100 : 0;
  const pctGK = totalPositions > 0 ? (parsed.counts.GK / totalPositions) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Club Welcome & Motto Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <NightCurlersLogo size={220} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <NightCurlersLogo size={64} className="drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  Official Match Drafter
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Night Curlers Football Club
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium italic mt-0.5">
                &ldquo;Don&apos;t Do Drugs, Play Football&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Paste directly from clipboard"
            >
              {pasteSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Pasted!</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Paste Clipboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadExample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Load Sample</span>
            </button>

            {rawText && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center p-2 text-xs font-medium rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors cursor-pointer"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Textarea & Live Intelligence */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <label htmlFor="roster-textarea" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Paste WhatsApp Roster
          </label>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Automatically ignores headers, payment info &amp; trailing notes
          </span>
        </div>

        <div className="relative">
          <textarea
            id="roster-textarea"
            rows={11}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Paste your Saturday Night WhatsApp group roster here...\n\nExample format:\n1. Alvin (M)\n2. Malo (F)\n3. Jay Dee (D)\n...\n19. Phyno (D) - 200\n...\nSubs\n1. Dyte (F)`}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 py-3 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Live Diagnostics & Counter Card */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    totalParsedStarters > 0 ? 'text-emerald-500' : 'text-zinc-400'
                  }`}
                />
                <span>{totalParsedStarters} players parsed</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">—</span>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {parsed.counts.M} M
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  {parsed.counts.F} F
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  {parsed.counts.D} D
                </span>
                {parsed.counts.GK > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                    {parsed.counts.GK} GK
                  </span>
                )}
                {parsed.counts.subs > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                    +{parsed.counts.subs} subs
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Format:{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {settings.numTeams} teams × {settings.playersPerTeam}
              </strong>{' '}
              ({targetStartersNeeded} starters)
            </div>
          </div>

          {/* Visual Distribution Ratio Bar */}
          {totalPositions > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span>Position Pool Distribution</span>
                <span>{totalPositions} total registered</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                {pctD > 0 && (
                  <div
                    style={{ width: `${pctD}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Defenders: ${parsed.counts.D} (${pctD.toFixed(0)}%)`}
                  />
                )}
                {pctM > 0 && (
                  <div
                    style={{ width: `${pctM}%` }}
                    className="bg-blue-500 transition-all duration-300"
                    title={`Midfielders: ${parsed.counts.M} (${pctM.toFixed(0)}%)`}
                  />
                )}
                {pctF > 0 && (
                  <div
                    style={{ width: `${pctF}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Forwards: ${parsed.counts.F} (${pctF.toFixed(0)}%)`}
                  />
                )}
                {pctGK > 0 && (
                  <div
                    style={{ width: `${pctGK}%` }}
                    className="bg-purple-500 transition-all duration-300"
                    title={`Goalkeepers: ${parsed.counts.GK} (${pctGK.toFixed(0)}%)`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Target Status Callout */}
          {isTargetMet && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
              <Check className="w-3.5 h-3.5" />
              <span>Perfect count: Exactly {targetStartersNeeded} starters available for {settings.numTeams} teams.</span>
            </div>
          )}

          {hasSurplus && (
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5" />
              <span>
                {totalParsedStarters - targetStartersNeeded} excess player(s) beyond {targetStartersNeeded} will automatically be placed as substitutes.
              </span>
            </div>
          )}

          {hasDeficit && (
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Target is {targetStartersNeeded} starters, but roster has {totalParsedStarters}. Teams will be drafted to fit available players.
              </span>
            </div>
          )}
        </div>

        {/* Duplicate Names Warning */}
        {parsed.duplicates.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Duplicate player names detected</p>
              <p className="mt-0.5">
                Automatically kept with numeric suffixes to differentiate: {parsed.duplicates.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Unparsed Lines Notification */}
        {parsed.unparsedLines.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-900 dark:text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{parsed.unparsedLines.length} unparsed line(s) ignored (not dropped silently):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] bg-white/70 dark:bg-zinc-900/70 p-2.5 rounded-lg border border-red-200 dark:border-red-800/50 max-h-32 overflow-y-auto">
              {parsed.unparsedLines.map((u, idx) => (
                <li key={idx}>
                  Line {u.lineNumber}: <span className="text-zinc-700 dark:text-zinc-300">{u.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Team Draft Configuration & Launch Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Tournament &amp; Squad Parameters
          </h3>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            Even Positions + Scattered Numbers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Number of Teams
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {settings.numTeams} Teams
              </span>
            </div>
            <input
              type="number"
              min={2}
              max={8}
              value={settings.numTeams}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  numTeams: Math.max(2, Math.min(8, parseInt(e.target.value, 10) || 2)),
                }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-semibold focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              Red, Blue, Yellow, Black (Standard 4 teams)
            </span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Players per Team
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {settings.playersPerTeam} / Team
              </span>
            </div>
            <input
              type="number"
              min={3}
              max={25}
              value={settings.playersPerTeam}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  playersPerTeam: Math.max(3, Math.min(25, parseInt(e.target.value, 10) || 3)),
                }))
              }
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-semibold focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
              Default: 10 players ({settings.numTeams * settings.playersPerTeam} starters total)
            </span>
          </div>
        </div>

        {/* Build Teams Button */}
        <button
          type="button"
          disabled={totalParsedStarters === 0}
          onClick={onBuildTeams}
          className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer ${
            totalParsedStarters > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99] hover:shadow-emerald-600/20'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
          }`}
        >
          <span>Draft &amp; Balance Teams</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
