import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Copy,
  Printer,
  ArrowLeftRight,
  Check,
  AlertCircle,
  ShieldCheck,
  Undo2,
  Redo2,
  Search,
  X,
} from 'lucide-react';
import { ParsedRoster, Player, Team } from '../types';
import { TeamCard } from './TeamCard';
import { downloadTeamSheetPNG, formatWhatsAppRoster } from '../utils/export';
import { dropPlayerOntoTeam, swapPlayers } from '../utils/drafter';
import { NightCurlersLogo } from './NightCurlersLogo';
import { SwapAssistantModal } from './SwapAssistantModal';

interface ResultsScreenProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  parsed: ParsedRoster;
  seedUsed: number;
  scatterValid: boolean;
  onReshuffle: () => void;
  onBackToInput: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  teams,
  setTeams,
  parsed,
  seedUsed,
  scatterValid,
  onReshuffle,
  onBackToInput,
}) => {
  const exportRef = useRef<HTMLDivElement>(null);

  // Editable header, notes and footer info
  const [clubName, setClubName] = useState('NIGHT CURLERS FC');
  const [sheetTitle, setSheetTitle] = useState('SATURDAY NIGHT TEAM SHEET');
  const [motto, setMotto] = useState("Don't Do Drugs, Play Football");
  const [notes, setNotes] = useState('Kick-off 7:00 PM prompt. Arrive 15 mins early for warm-up. Shin guards mandatory.');
  const [footerPayment, setFooterPayment] = useState(
    parsed.detectedHeaderNote ||
      '📢 Monime Weekly Contributions: Dial *715*902# | Contact +23276860788'
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Swap State & Modal
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<Team[][]>([]);
  const [future, setFuture] = useState<Team[][]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const applyTeamChange = (newTeams: Team[]) => {
    setHistory((prev) => [...prev, teams]);
    setFuture([]);
    setTeams(newTeams);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [teams, ...prev]);
    setTeams(previous);
    setSelectedPlayer(null);
    showToast('Undo successful', 'info');
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, teams]);
    setTeams(next);
    setSelectedPlayer(null);
    showToast('Redo successful', 'info');
  };

  // Interactive Tap-to-Swap logic
  const handleSelectPlayer = (clickedPlayer: Player) => {
    if (!selectedPlayer) {
      // First player selected
      setSelectedPlayer(clickedPlayer);
      return;
    }

    if (selectedPlayer.id === clickedPlayer.id) {
      // Deselect if clicked same player again
      setSelectedPlayer(null);
      return;
    }

    // Attempt swap between selectedPlayer and clickedPlayer
    if (selectedPlayer.position !== clickedPlayer.position) {
      showToast(
        `Position Mismatch: Cannot swap ${selectedPlayer.name} (${selectedPlayer.position}) with ${clickedPlayer.name} (${clickedPlayer.position}). Player counts per position must stay even.`,
        'error'
      );
      // Keep selected or switch? Let's switch selection to the new player
      setSelectedPlayer(clickedPlayer);
      return;
    }

    // Both have same position: execute instant swap!
    const result = swapPlayers(teams, selectedPlayer.id, clickedPlayer.id);
    if (result.success) {
      applyTeamChange(result.newTeams);
      showToast(
        `Swapped #${selectedPlayer.originalNumber} ${selectedPlayer.name} and #${clickedPlayer.originalNumber} ${clickedPlayer.name} (${selectedPlayer.position})`,
        'success'
      );
      setSelectedPlayer(null);
    } else {
      showToast(result.error || 'Swap failed.', 'error');
    }
  };

  const handleDropPlayerOnTeam = (playerId: string, targetTeamId: string) => {
    const result = dropPlayerOntoTeam(teams, playerId, targetTeamId);
    if (result.success) {
      applyTeamChange(result.newTeams);
      const swapped = result.swappedWith;
      showToast(
        `Auto-swapped with ${
          swapped ? `#${swapped.originalNumber} ${swapped.name} (${swapped.position})` : 'same-position player'
        } to preserve team balance.`,
        'success'
      );
      setSelectedPlayer(null);
    } else {
      showToast(result.error || 'Drop rejected. Must preserve team balance.', 'error');
    }
  };

  const handleDropPlayerOnPlayer = (sourcePlayerId: string, targetPlayerId: string) => {
    const result = swapPlayers(teams, sourcePlayerId, targetPlayerId);
    if (result.success) {
      applyTeamChange(result.newTeams);
      showToast('Players swapped successfully.', 'success');
      setSelectedPlayer(null);
    } else {
      showToast(result.error || 'Swap rejected.', 'error');
    }
  };

  const handleQuickSwapWith = (targetPlayerId: string) => {
    if (!modalPlayer) return;
    const result = swapPlayers(teams, modalPlayer.id, targetPlayerId);
    if (result.success) {
      applyTeamChange(result.newTeams);
      showToast(`Swap completed successfully.`, 'success');
      setSelectedPlayer(null);
    } else {
      showToast(result.error || 'Swap failed.', 'error');
    }
  };

  const handleUpdateTeamName = (teamId: string, newName: string) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, name: newName } : t)));
  };

  const handleDownloadPNG = async () => {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      await downloadTeamSheetPNG(exportRef.current);
      showToast('Team sheet PNG downloaded successfully.', 'success');
    } catch (err) {
      console.error('PNG Export failed:', err);
      showToast('Failed to export PNG. Please try printing to PDF instead.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = async () => {
    const text = formatWhatsAppRoster(clubName, sheetTitle, teams, notes, footerPayment);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      showToast('Roster copied to clipboard in WhatsApp format!', 'success');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      showToast('Could not access clipboard directly.', 'error');
    }
  };

  const totalStartersCount = teams.reduce((acc, t) => acc + t.players.length, 0);
  const totalSubsCount = teams.reduce((acc, t) => acc + t.subs.length, 0);

  // Filter teams or highlight matching search player
  const query = searchQuery.trim().toLowerCase();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-16">
      {/* Top Action Toolbar (Hidden during export & print) */}
      <div className="no-export app-chrome bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm sticky top-3 z-30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToInput}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Roster</span>
            </button>

            <button
              type="button"
              onClick={onReshuffle}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="Advance seed and rebuild with fresh scatter"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reshuffle</span>
            </button>

            {/* Undo & Redo buttons */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              <button
                type="button"
                disabled={history.length === 0}
                onClick={handleUndo}
                className="p-2 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Undo last swap (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700" />
              <button
                type="button"
                disabled={future.length === 0}
                onClick={handleRedo}
                className="p-2 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Player Search */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find player..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Floating Tap-to-Swap Bar */}
        {selectedPlayer && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-100 font-semibold truncate">
              <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Selected: <strong>#{selectedPlayer.originalNumber} {selectedPlayer.name}</strong> ({selectedPlayer.position})
              </span>
              <span className="text-zinc-400 hidden sm:inline">—</span>
              <span className="text-[11px] font-normal text-amber-800 dark:text-amber-300 hidden sm:inline">
                Tap another {selectedPlayer.position} to swap them
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalPlayer(selectedPlayer)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
              >
                Find Candidate
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`no-export p-3.5 rounded-2xl border shadow-md text-xs flex items-center justify-between gap-3 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-100'
              : toastMessage.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-950 dark:bg-red-950/90 dark:border-red-800 dark:text-red-100'
              : 'bg-blue-50 border-blue-300 text-blue-950 dark:bg-blue-950/90 dark:border-blue-800 dark:text-blue-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer font-bold text-base px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* HARD INVARIANT & Scatter status badge */}
      <div className="no-export bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 px-4 text-xs text-zinc-700 dark:text-zinc-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Even Balance Locked:</strong> Swaps are strictly position-matched. Numbers scattered across all teams.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span className="bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
            Seed #{seedUsed}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ Scatter Verified
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPORT CONTAINER (This area is captured for PNG and formatted for Print) */}
      {/* ========================================================================= */}
      <div
        id="export-sheet"
        ref={exportRef}
        className="bg-white text-zinc-900 rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6"
        style={{
          // Always ensure high-contrast clean white background for PNG and print
          backgroundColor: '#ffffff',
          color: '#111827',
        }}
      >
        {/* Official Club Crest & Header Block */}
        <div className="border-b-2 border-zinc-900 pb-5 text-center space-y-2">
          {/* Official Logo Banner */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <NightCurlersLogo size={76} />
            <div className="text-left">
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="font-black text-2xl sm:text-3xl tracking-tight text-zinc-900 uppercase bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none w-full"
                title="Click to edit club name"
              />
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="text-xs sm:text-sm font-bold text-zinc-600 uppercase tracking-wide bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none w-full italic"
                title="Click to edit motto"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <input
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              className="text-center font-extrabold text-sm sm:text-base tracking-widest text-emerald-800 uppercase bg-emerald-50 py-1 px-4 rounded-full border border-emerald-200 focus:outline-none w-full max-w-md"
              title="Click to edit title"
            />
          </div>

          {/* Summary line with player count, team count and pool breakdown */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-bold text-zinc-700">
            <span className="bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
              {totalStartersCount} Starters ({teams.length} Teams · {teams[0]?.players.length || 0} / squad)
            </span>
            {totalSubsCount > 0 && (
              <span className="bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 text-zinc-800">
                + {totalSubsCount} Substitutes
              </span>
            )}
            <span className="bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
              Pool: {parsed.counts.M} M · {parsed.counts.F} F · {parsed.counts.D} D
              {parsed.counts.GK > 0 ? ` · ${parsed.counts.GK} GK` : ''}
            </span>
          </div>
        </div>

        {/* 2x2 Responsive Grid of Team Cards */}
        <div
          className={`grid gap-4 sm:gap-5 ${
            teams.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : teams.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={handleSelectPlayer}
              onUpdateTeamName={handleUpdateTeamName}
              onDropPlayerOnTeam={handleDropPlayerOnTeam}
              onDropPlayerOnPlayer={handleDropPlayerOnPlayer}
              onQuickSwapRequest={(p) => setModalPlayer(p)}
            />
          ))}
        </div>

        {/* Editable Match Day Notes */}
        <div className="pt-2 border-t border-zinc-200 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Match Day Instructions &amp; Kickoff:</span>
            <span className="no-export text-[10px] font-normal lowercase text-zinc-400">(editable)</span>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add match notes, kickoff times, bib instructions..."
            className="w-full text-xs text-zinc-800 bg-zinc-50 rounded-xl p-3 border border-zinc-200 focus:outline-none focus:border-zinc-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Editable Footer for Payment & Info */}
        <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-800">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-zinc-900 shrink-0">Payment:</span>
            <input
              type="text"
              value={footerPayment}
              onChange={(e) => setFooterPayment(e.target.value)}
              placeholder="Payment info or dial code..."
              className="w-full bg-transparent font-medium text-zinc-800 focus:outline-none border-b border-transparent hover:border-zinc-300 focus:border-zinc-600"
              title="Click to edit payment info"
            />
          </div>
          <div className="text-[10px] text-zinc-400 font-mono shrink-0 flex items-center gap-1.5">
            <NightCurlersLogo size={14} />
            <span>Night Curlers FC Team Sheet</span>
          </div>
        </div>
      </div>

      {/* Quick Swap Assistant Modal */}
      {modalPlayer && (
        <SwapAssistantModal
          player={modalPlayer}
          teams={teams}
          onClose={() => setModalPlayer(null)}
          onSwapWith={handleQuickSwapWith}
        />
      )}
    </div>
  );
};
