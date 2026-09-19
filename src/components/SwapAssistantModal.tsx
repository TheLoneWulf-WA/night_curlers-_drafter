import React from 'react';
import { X, ArrowLeftRight, Shield, Sparkles } from 'lucide-react';
import { Player, Team } from '../types';

interface SwapAssistantModalProps {
  player: Player | null;
  teams: Team[];
  onClose: () => void;
  onSwapWith: (targetPlayerId: string) => void;
}

export const SwapAssistantModal: React.FC<SwapAssistantModalProps> = ({
  player,
  teams,
  onClose,
  onSwapWith,
}) => {
  if (!player) return null;

  // Find player's current team
  const currentTeam = teams.find(
    (t) => t.players.some((p) => p.id === player.id) || t.subs.some((p) => p.id === player.id)
  );

  // Find all players across OTHER teams with the SAME position
  const eligibleCandidates: { team: Team; candidate: Player }[] = [];

  teams.forEach((team) => {
    if (team.id !== currentTeam?.id) {
      team.players
        .filter((p) => p.position === player.position)
        .forEach((candidate) => {
          eligibleCandidates.push({ team, candidate });
        });
      team.subs
        .filter((p) => p.position === player.position)
        .forEach((candidate) => {
          eligibleCandidates.push({ team, candidate });
        });
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Swap Assistant: #{player.originalNumber} {player.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Position: <strong className="text-emerald-600 dark:text-emerald-400">{player.position}</strong> (Current Team: {currentTeam?.name || 'Unknown'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invariant Note */}
        <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Strict Balance rule: Showing only {player.position} players on other teams to keep squads even.
          </span>
        </div>

        {/* Candidate List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {eligibleCandidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No eligible {player.position} players found on other teams.
            </div>
          ) : (
            eligibleCandidates.map(({ team, candidate }) => (
              <div
                key={candidate.id}
                onClick={() => {
                  onSwapWith(candidate.id);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full"
                    style={{ backgroundColor: team.color }}
                    title={team.name}
                  />
                  <div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-2">
                      <span>#{candidate.originalNumber} {candidate.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {team.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Position: {candidate.position} {candidate.isSub ? '(Sub)' : '(Starter)'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-600 group-hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Swap Here
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
