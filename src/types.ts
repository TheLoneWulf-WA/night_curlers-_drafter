export type Position = 'D' | 'M' | 'F' | 'GK';

export interface Player {
  id: string; // unique ID
  originalNumber: number;
  name: string;
  position: Position;
  isSub: boolean;
  rawLine?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  borderAccent: string;
  players: Player[];
  subs: Player[];
}

export interface ParsedRoster {
  starters: Player[];
  subs: Player[];
  unparsedLines: { lineNumber: number; text: string }[];
  duplicates: string[];
  counts: {
    total: number;
    D: number;
    M: number;
    F: number;
    GK: number;
    subs: number;
  };
  detectedHeaderNote?: string;
}

export interface DraftSettings {
  numTeams: number;
  playersPerTeam: number;
  seed: number;
}
