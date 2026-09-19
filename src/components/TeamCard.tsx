import React, { useState } from 'react';
import { Check, ArrowLeftRight, Edit3 } from 'lucide-react';
import { Player, Team } from '../types';

interface TeamCardProps {
  team: Team;
  selectedPlayer: Player | null;
  onSelectPlayer: (player: Player) => void;
  onUpdateTeamName: (teamId: string, newName: string) => void;
  onDropPlayerOnTeam: (playerId: string, targetTeamId: string) => void;
  onDropPlayerOnPlayer: (sourcePlayerId: string, targetPlayerId: string) => void;
  onQuickSwapRequest?: (player: Player) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  selectedPlayer,
  onSelectPlayer,
  onUpdateTeamName,
  onDropPlayerOnTeam,
  onDropPlayerOnPlayer,
  onQuickSwapRequest,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState(team.name);
  const [isDragOver, setIsDragOver] = useState(false);

  // Position breakdown
  const gkCount = team.players.filter((p) => p.position === 'GK').length;
  const dCount = team.players.filter((p) => p.position === 'D').length;
  const mCount = team.players.filter((p) => p.position === 'M').length;
  const fCount = team.players.filter((p) => p.position === 'F').length;

  const shapeParts: string[] = [];
  if (gkCount > 0) shapeParts.push(`${gkCount} GK`);
  shapeParts.push(`${dCount} D`, `${mCount} M`, `${fCount} F`);
  shapeParts.push(`${team.players.length} players`);

  const defenders = team.players.filter((p) => p.position === 'D');
  const midfielders = team.players.filter((p) => p.position === 'M');
  const forwards = team.players.filter((p) => p.position === 'F');
  const goalkeepers = team.players.filter((p) => p.position === 'GK');

  const handleNameSubmit = () => {
    if (teamNameInput.trim()) {
      onUpdateTeamName(team.id, teamNameInput.trim());
    } else {
      setTeamNameInput(team.name);
    }
    setIsEditingName(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const sourcePlayerId = e.dataTransfer.getData('text/plain');
    if (sourcePlayerId) {
      onDropPlayerOnTeam(sourcePlayerId, team.id);
    }
  };

  const renderPlayerRow = (player: Player, isSub = false) => {
    const isThisSelected = selectedPlayer?.id === player.id;
    const isSwapCandidate =
      selectedPlayer &&
      selectedPlayer.id !== player.id &&
      selectedPlayer.position === player.position;
    const isDifferentPositionWhenSelected =
      selectedPlayer &&
      selectedPlayer.id !== player.id &&
      selectedPlayer.position !== player.position;

    return (
      <div
        key={player.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', player.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const sourcePlayerId = e.dataTransfer.getData('text/plain');
          if (sourcePlayerId && sourcePlayerId !== player.id) {
            onDropPlayerOnPlayer(sourcePlayerId, player.id);
          }
        }}
        onClick={() => onSelectPlayer(player)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs cursor-pointer select-none min-h-[38px] ${
          isThisSelected
            ? 'bg-amber-100 dark:bg-amber-950/80 ring-2 ring-amber-500 text-amber-950 dark:text-amber-100 font-bold shadow-xs'
            : isSwapCandidate
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-dashed border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100'
            : isDifferentPositionWhenSelected
            ? 'opacity-60 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
            : 'hover:bg-zinc-100/90 dark:hover:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100'
        } ${isSub ? 'italic text-zinc-600 dark:text-zinc-400' : ''}`}
        title={
          isSwapCandidate
            ? `Click to swap with ${selectedPlayer?.name} (${player.position})`
            : isDifferentPositionWhenSelected
            ? `Cannot swap: ${player.name} is ${player.position}, but selected is ${selectedPlayer?.position}`
            : `Click to select ${player.name} for swap, or drag to another team`
        }
      >
        <div className="flex items-center gap-2 truncate">
          {/* Faint list number */}
          <span className="font-mono text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 w-6">
            #{player.originalNumber}
          </span>
          <span className="truncate font-medium">{player.name}</span>
          {player.notes && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline">
              {player.notes}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isSwapCandidate && (
            <span className="no-export text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
              <ArrowLeftRight className="w-3 h-3" />
              Swap
            </span>
          )}

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
              player.position === 'D'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : player.position === 'M'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : player.position === 'F'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
            }`}
          >
            {player.position}
          </span>

          {isThisSelected && (
            <span className="text-amber-600 dark:text-amber-400 no-export">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Quick Swap Drawer trigger for mobile */}
          {onQuickSwapRequest && !isThisSelected && !isSwapCandidate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickSwapRequest(player);
              }}
              className="no-export p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Quick swap candidate finder"
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all flex flex-col ${
        isDragOver
          ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-[1.008]'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Team Header Bar */}
      <div
        className="px-4 py-3 text-white flex items-center justify-between gap-2 shadow-xs transition-colors"
        style={{ backgroundColor: team.color }}
      >
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              autoFocus
              value={teamNameInput}
              onChange={(e) => setTeamNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setTeamNameInput(team.name);
                  setIsEditingName(false);
                }
              }}
              className="bg-black/40 text-white font-extrabold text-base px-2 py-0.5 rounded border border-white/50 focus:outline-none w-full"
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="group cursor-pointer flex items-center gap-1.5"
              title="Click to rename team"
            >
              <h3 className="font-black text-base tracking-wider uppercase drop-shadow-xs truncate">
                {team.name}
              </h3>
              <Edit3 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity no-export shrink-0" />
            </div>
          )}
          {/* Shape Line */}
          <div className="text-xs text-white/95 font-semibold tracking-wide mt-0.5">
            {shapeParts.join(' · ')}
          </div>
        </div>
      </div>

      {/* Roster Sections */}
      <div className="p-3.5 sm:p-4 space-y-3.5 flex-1 text-zinc-800 dark:text-zinc-200">
        {/* Goalkeepers if any */}
        {goalkeepers.length > 0 && (
          <div>
            <div className="text-[10px] font-bold tracking-wider text-purple-700 dark:text-purple-400 uppercase px-2 mb-1 flex items-center justify-between">
              <span>Goalkeepers</span>
              <span className="font-mono">{goalkeepers.length}</span>
            </div>
            <div className="space-y-0.5">{goalkeepers.map((p) => renderPlayerRow(p))}</div>
          </div>
        )}

        {/* Defenders */}
        <div>
          <div className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase px-2 mb-1 flex items-center justify-between">
            <span>Defenders</span>
            <span className="font-mono">{defenders.length}</span>
          </div>
          <div className="space-y-0.5">{defenders.map((p) => renderPlayerRow(p))}</div>
        </div>

        {/* Midfielders */}
        <div>
          <div className="text-[10px] font-bold tracking-wider text-blue-700 dark:text-blue-400 uppercase px-2 mb-1 flex items-center justify-between">
            <span>Midfielders</span>
            <span className="font-mono">{midfielders.length}</span>
          </div>
          <div className="space-y-0.5">{midfielders.map((p) => renderPlayerRow(p))}</div>
        </div>

        {/* Forwards */}
        <div>
          <div className="text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase px-2 mb-1 flex items-center justify-between">
            <span>Forwards</span>
            <span className="font-mono">{forwards.length}</span>
          </div>
          <div className="space-y-0.5">{forwards.map((p) => renderPlayerRow(p))}</div>
        </div>

        {/* Subs Section */}
        {team.subs.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase px-2 mb-1 flex items-center justify-between">
              <span>Substitutes</span>
              <span className="font-mono">{team.subs.length}</span>
            </div>
            <div className="space-y-0.5">{team.subs.map((p) => renderPlayerRow(p, true))}</div>
          </div>
        )}
      </div>

      {/* Card Drop Footer hint */}
      <div className="no-export px-3 py-1.5 bg-zinc-50/80 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 text-center font-medium">
        Drag or tap players to swap positions
      </div>
    </div>
  );
};
