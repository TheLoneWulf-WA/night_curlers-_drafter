import { Player, Position, Team } from '../types';

/**
 * Mulberry32 seeded Pseudo-Random Number Generator.
 * Fast, 32-bit deterministic state, ideal for reproducible shuffling.
 */
export function createPRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using deterministic PRNG.
 */
export function shuffleArray<T>(array: T[], prng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const DEFAULT_TEAM_CONFIGS = [
  { id: 'team-1', name: 'Red', color: '#C0392B', bgLight: '#FEF2F2', borderAccent: '#DC2626' },
  { id: 'team-2', name: 'Blue', color: '#1F4E9C', bgLight: '#EFF6FF', borderAccent: '#2563EB' },
  { id: 'team-3', name: 'Yellow', color: '#B7860B', bgLight: '#FEFCE8', borderAccent: '#CA8A04' },
  { id: 'team-4', name: 'Black', color: '#1B1F24', bgLight: '#F3F4F6', borderAccent: '#374151' },
  { id: 'team-5', name: 'Green', color: '#1E7E34', bgLight: '#F0FDF4', borderAccent: '#16A34A' },
  { id: 'team-6', name: 'Purple', color: '#6F42C1', bgLight: '#FAF5FF', borderAccent: '#9333EA' },
  { id: 'team-7', name: 'Orange', color: '#EA580C', bgLight: '#FFF7ED', borderAccent: '#F97316' },
  { id: 'team-8', name: 'Teal', color: '#0D9488', bgLight: '#F0FDFA', borderAccent: '#14B8A6' },
];

/**
 * Checks if a team's players contain a run of more than 2 consecutive original list numbers.
 * e.g. [1, 2, 3] has a run of 3 consecutive numbers -> invalid.
 * e.g. [1, 2, 5, 6] has max run of 2 -> valid.
 */
export function hasRunOverTwo(players: Player[]): boolean {
  if (players.length < 3) return false;
  const numbers = players.map((p) => p.originalNumber).sort((a, b) => a - b);
  let currentRun = 1;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1] + 1) {
      currentRun++;
      if (currentRun > 2) {
        return true;
      }
    } else if (numbers[i] !== numbers[i - 1]) {
      currentRun = 1;
    }
  }
  return false;
}

/**
 * Calculates max consecutive run length for diagnostic scoring.
 */
export function getMaxRun(players: Player[]): number {
  if (players.length === 0) return 0;
  const numbers = players.map((p) => p.originalNumber).sort((a, b) => a - b);
  let maxRun = 1;
  let currentRun = 1;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1] + 1) {
      currentRun++;
      if (currentRun > maxRun) maxRun = currentRun;
    } else if (numbers[i] !== numbers[i - 1]) {
      currentRun = 1;
    }
  }
  return maxRun;
}

/**
 * Builds balanced teams according to the specific position quota and scatter rules.
 */
export function buildTeams(
  allStarters: Player[],
  initialSubs: Player[],
  numTeams: number,
  playersPerTeam: number,
  seed: number
): { teams: Team[]; actualSeedUsed: number; scatterValid: boolean } {
  const totalStarterSpots = numTeams * playersPerTeam;

  // If there are more starters than spots, excess starters become subs
  const eligibleStarters = allStarters.slice(0, totalStarterSpots);
  const excessStarters = allStarters.slice(totalStarterSpots).map((p) => ({ ...p, isSub: true }));
  const allSubsPool = [...initialSubs, ...excessStarters];

  // Positions to allocate
  const positions: Position[] = ['D', 'M', 'F'];
  const hasGK = eligibleStarters.some((p) => p.position === 'GK');
  if (hasGK) {
    positions.unshift('GK');
  }

  // 1. Separate into buckets
  const buckets: Record<Position, Player[]> = {
    GK: eligibleStarters.filter((p) => p.position === 'GK'),
    D: eligibleStarters.filter((p) => p.position === 'D'),
    M: eligibleStarters.filter((p) => p.position === 'M'),
    F: eligibleStarters.filter((p) => p.position === 'F'),
  };

  // Compute quotas per team:
  // For a position with n players across t teams, every team gets floor(n/t),
  // and the remaining n mod t extras are handed out one per team in rotating order:
  // rotate the starting team between the positions so the same team doesn't collect every extra.
  const quotas: Record<number, Record<Position, number>> = {};
  for (let t = 0; t < numTeams; t++) {
    quotas[t] = { GK: 0, D: 0, M: 0, F: 0 };
  }

  positions.forEach((pos, posIndex) => {
    const count = buckets[pos].length;
    const base = Math.floor(count / numTeams);
    const extras = count % numTeams;
    const startTeam = posIndex % numTeams;

    for (let t = 0; t < numTeams; t++) {
      quotas[t][pos] = base;
    }

    for (let e = 0; e < extras; e++) {
      const teamIdx = (startTeam + e) % numTeams;
      quotas[teamIdx][pos] += 1;
    }
  });

  // Verify each team's quotas sum to exactly playersPerTeam;
  // If a team is over/under, move one quota unit from the most abundant position
  // of an over-full team to an under-full team, re-verify.
  let maxAdjustments = 100;
  while (maxAdjustments-- > 0) {
    let overTeam = -1;
    let underTeam = -1;

    for (let t = 0; t < numTeams; t++) {
      const sum = positions.reduce((acc, p) => acc + quotas[t][p], 0);
      if (sum > playersPerTeam && (overTeam === -1 || sum > positions.reduce((acc, p) => acc + quotas[overTeam][p], 0))) {
        overTeam = t;
      }
      if (sum < playersPerTeam && (underTeam === -1 || sum < positions.reduce((acc, p) => acc + quotas[underTeam][p], 0))) {
        underTeam = t;
      }
    }

    if (overTeam === -1 || underTeam === -1) {
      break; // All teams are exactly playersPerTeam!
    }

    // Find the most abundant position in overTeam where overTeam has more than underTeam
    let bestPos: Position | null = null;
    let maxCount = -1;

    for (const p of positions) {
      if (quotas[overTeam][p] > quotas[underTeam][p] && quotas[overTeam][p] > maxCount) {
        maxCount = quotas[overTeam][p];
        bestPos = p;
      }
    }

    if (!bestPos) {
      // Fallback: any position where overTeam has > 0
      for (const p of positions) {
        if (quotas[overTeam][p] > 0) {
          bestPos = p;
          break;
        }
      }
    }

    if (bestPos) {
      quotas[overTeam][bestPos]--;
      quotas[underTeam][bestPos]++;
    } else {
      break;
    }
  }

  // Generate snake order for dealing: 0, 1, ..., t-1, t-1, ..., 1, 0, ...
  const generateSnakeOrder = (length: number) => {
    const order: number[] = [];
    let forward = true;
    while (order.length < length) {
      if (forward) {
        for (let i = 0; i < numTeams; i++) order.push(i);
      } else {
        for (let i = numTeams - 1; i >= 0; i--) order.push(i);
      }
      forward = !forward;
    }
    return order.slice(0, length);
  };

  // Attempt building with seed; if scatter verification fails, advance seed (up to 80 tries)
  let bestAttemptTeams: Team[] | null = null;
  let bestMaxRunScore = 999;
  let bestSeedUsed = seed;
  let scatterValid = false;

  for (let attempt = 0; attempt < 80; attempt++) {
    const currentSeed = seed + attempt;
    const prng = createPRNG(currentSeed);

    // 2. SHUFFLE each bucket independently
    const shuffledBuckets: Record<Position, Player[]> = {
      GK: shuffleArray(buckets.GK, prng),
      D: shuffleArray(buckets.D, prng),
      M: shuffleArray(buckets.M, prng),
      F: shuffleArray(buckets.F, prng),
    };

    // Initialize team rosters
    const teamPlayers: Player[][] = Array.from({ length: numTeams }, () => []);
    const remainingQuotas: Record<number, Record<Position, number>> = {};
    for (let t = 0; t < numTeams; t++) {
      remainingQuotas[t] = { ...quotas[t] };
    }

    // 4. DEAL from each shuffled bucket in snake order
    for (const pos of positions) {
      const bucket = [...shuffledBuckets[pos]];
      const totalNeeded = bucket.length;
      const snake = generateSnakeOrder(totalNeeded * 2);

      let snakeIdx = 0;
      while (bucket.length > 0 && snakeIdx < snake.length) {
        const teamIdx = snake[snakeIdx++];
        if (remainingQuotas[teamIdx][pos] > 0) {
          const player = bucket.shift()!;
          teamPlayers[teamIdx].push(player);
          remainingQuotas[teamIdx][pos]--;
        }
      }
      // Any leftovers if quotas were slightly mismatched
      while (bucket.length > 0) {
        // find team with fewest players
        let minT = 0;
        for (let t = 1; t < numTeams; t++) {
          if (teamPlayers[t].length < teamPlayers[minT].length) minT = t;
        }
        teamPlayers[minT].push(bucket.shift()!);
      }
    }

    // 5. VERIFY SCATTER: no team may contain a run of more than 2 consecutive list numbers
    let currentAttemptMaxRun = 0;
    let passesScatter = true;
    for (let t = 0; t < numTeams; t++) {
      const teamRun = getMaxRun(teamPlayers[t]);
      if (teamRun > currentAttemptMaxRun) currentAttemptMaxRun = teamRun;
      if (hasRunOverTwo(teamPlayers[t])) {
        passesScatter = false;
      }
    }

    // Build provisional teams
    const provisionalTeams: Team[] = Array.from({ length: numTeams }, (_, idx) => {
      const config = DEFAULT_TEAM_CONFIGS[idx % DEFAULT_TEAM_CONFIGS.length];
      return {
        id: `team-${idx + 1}`,
        name: config.name,
        color: config.color,
        bgLight: config.bgLight,
        borderAccent: config.borderAccent,
        players: teamPlayers[idx],
        subs: [],
      };
    });

    if (passesScatter) {
      bestAttemptTeams = provisionalTeams;
      bestSeedUsed = currentSeed;
      scatterValid = true;
      break;
    }

    if (currentAttemptMaxRun < bestMaxRunScore) {
      bestMaxRunScore = currentAttemptMaxRun;
      bestAttemptTeams = provisionalTeams;
      bestSeedUsed = currentSeed;
    }
  }

  const finalTeams = bestAttemptTeams!;

  // 6. Assign subs
  // Subs: after teams are built, assign one sub per team to whichever teams
  // have the thinnest position spread, until subs run out.
  const unassignedSubs = [...allSubsPool];

  for (const sub of unassignedSubs) {
    // Find team with lowest count of sub's position, breaking ties with lowest sub count
    let bestTeamIdx = 0;
    let minPosCount = 999;
    let minSubsCount = 999;

    for (let t = 0; t < finalTeams.length; t++) {
      const team = finalTeams[t];
      const posCount = team.players.filter((p) => p.position === sub.position).length;
      const subCount = team.subs.length;

      if (
        posCount < minPosCount ||
        (posCount === minPosCount && subCount < minSubsCount)
      ) {
        minPosCount = posCount;
        minSubsCount = subCount;
        bestTeamIdx = t;
      }
    }

    finalTeams[bestTeamIdx].subs.push(sub);
  }

  return {
    teams: finalTeams,
    actualSeedUsed: bestSeedUsed,
    scatterValid,
  };
}

/**
 * Hard Invariant: Swaps two players between teams.
 * Must be same position, otherwise rejected.
 */
export function swapPlayers(
  teams: Team[],
  playerAId: string,
  playerBId: string
): { success: boolean; newTeams: Team[]; error?: string } {
  let playerA: Player | null = null;
  let playerB: Player | null = null;
  let teamAIdx = -1;
  let teamBIdx = -1;
  let isASub = false;
  let isBSub = false;

  for (let t = 0; t < teams.length; t++) {
    const pAStarter = teams[t].players.find((p) => p.id === playerAId);
    const pASub = teams[t].subs.find((p) => p.id === playerAId);
    if (pAStarter) {
      playerA = pAStarter;
      teamAIdx = t;
      isASub = false;
    } else if (pASub) {
      playerA = pASub;
      teamAIdx = t;
      isASub = true;
    }

    const pBStarter = teams[t].players.find((p) => p.id === playerBId);
    const pBSub = teams[t].subs.find((p) => p.id === playerBId);
    if (pBStarter) {
      playerB = pBStarter;
      teamBIdx = t;
      isBSub = false;
    } else if (pBSub) {
      playerB = pBSub;
      teamBIdx = t;
      isBSub = true;
    }
  }

  if (!playerA || !playerB) {
    return { success: false, newTeams: teams, error: 'One or both players could not be found.' };
  }

  if (teamAIdx === teamBIdx && isASub === isBSub) {
    return { success: false, newTeams: teams, error: 'Both players are already on the same team in the same role.' };
  }

  // Check position matching invariant
  if (playerA.position !== playerB.position) {
    return {
      success: false,
      newTeams: teams,
      error: `Cannot swap: ${playerA.name} is a ${playerA.position} while ${playerB.name} is a ${playerB.position}. Swapping different positions would violate team balance.`,
    };
  }

  // Create deep copy of teams
  const newTeams = teams.map((t) => ({
    ...t,
    players: [...t.players],
    subs: [...t.subs],
  }));

  // Remove player A from team A
  if (isASub) {
    newTeams[teamAIdx].subs = newTeams[teamAIdx].subs.filter((p) => p.id !== playerAId);
  } else {
    newTeams[teamAIdx].players = newTeams[teamAIdx].players.filter((p) => p.id !== playerAId);
  }

  // Remove player B from team B
  if (isBSub) {
    newTeams[teamBIdx].subs = newTeams[teamBIdx].subs.filter((p) => p.id !== playerBId);
  } else {
    newTeams[teamBIdx].players = newTeams[teamBIdx].players.filter((p) => p.id !== playerBId);
  }

  // Place player A in team B
  if (isBSub) {
    newTeams[teamBIdx].subs.push({ ...playerA, isSub: true });
  } else {
    newTeams[teamBIdx].players.push({ ...playerA, isSub: false });
  }

  // Place player B in team A
  if (isASub) {
    newTeams[teamAIdx].subs.push({ ...playerB, isSub: true });
  } else {
    newTeams[teamAIdx].players.push({ ...playerB, isSub: false });
  }

  return { success: true, newTeams };
}

/**
 * Handles dropping a player onto a target team.
 * Automatically finds a same-position player on target team to swap with.
 * If target team has no same-position player, rejects with explanation!
 */
export function dropPlayerOntoTeam(
  teams: Team[],
  playerId: string,
  targetTeamId: string
): { success: boolean; newTeams: Team[]; swappedWith?: Player; error?: string } {
  let sourcePlayer: Player | null = null;
  let sourceTeamIdx = -1;

  for (let t = 0; t < teams.length; t++) {
    const p = teams[t].players.find((pl) => pl.id === playerId) || teams[t].subs.find((pl) => pl.id === playerId);
    if (p) {
      sourcePlayer = p;
      sourceTeamIdx = t;
      break;
    }
  }

  if (!sourcePlayer || sourceTeamIdx === -1) {
    return { success: false, newTeams: teams, error: 'Player not found.' };
  }

  const targetTeamIdx = teams.findIndex((t) => t.id === targetTeamId);
  if (targetTeamIdx === -1) {
    return { success: false, newTeams: teams, error: 'Target team not found.' };
  }

  if (sourceTeamIdx === targetTeamIdx) {
    return { success: false, newTeams: teams, error: 'Player is already on this team.' };
  }

  const targetTeam = teams[targetTeamIdx];
  // Look for a player on the target team with the same position
  // Prefer regular player over sub
  const candidate =
    targetTeam.players.find((p) => p.position === sourcePlayer.position) ||
    targetTeam.subs.find((p) => p.position === sourcePlayer.position);

  if (!candidate) {
    return {
      success: false,
      newTeams: teams,
      error: `Drop rejected: ${targetTeam.name} has no ${sourcePlayer.position} to swap with ${sourcePlayer.name}. Player counts per position must remain even.`,
    };
  }

  const swapResult = swapPlayers(teams, sourcePlayer.id, candidate.id);
  return {
    ...swapResult,
    swappedWith: candidate,
  };
}
