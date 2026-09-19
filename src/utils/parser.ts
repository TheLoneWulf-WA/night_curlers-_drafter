import { ParsedRoster, Player, Position } from '../types';

/**
 * Strips zero-width, invisible characters and normalizes Unicode characters.
 */
export function cleanLine(raw: string): string {
  if (!raw) return '';
  return raw
    // Strip zero-width & invisible characters: U+200B, U+200C, U+200D, U+2060, U+FEFF
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
    // Normalize unicode non-breaking and special spaces to standard ASCII space
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // Normalize curly single and double quotes to plain ASCII
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .trim();
}

/**
 * Checks if a cleaned line is a player line.
 * Matches: number + dot (or closing bracket) + name + (position) + optional trailing notes
 */
const PLAYER_LINE_REGEX = /^\s*(\d+)\s*[\.\)]\s*(.+?)\s*\(\s*(D|M|F|GK|G)\s*\)(.*)$/i;

/**
 * Checks if a line marks the beginning of the Substitutes section.
 */
const SUBS_HEADER_REGEX = /^\s*(subs?|substitutes?)\s*:?\s*$/i;

export function parseRosterText(rawText: string): ParsedRoster {
  const lines = rawText.split(/\r?\n/);
  const starters: Player[] = [];
  const subs: Player[] = [];
  const unparsedLines: { lineNumber: number; text: string }[] = [];
  const nameCounts = new Map<string, number>();
  const duplicateNamesSet = new Set<string>();

  let hasStartedRoster = false;
  let inSubsSection = false;
  const headerLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleaned = cleanLine(rawLine);

    if (!cleaned) {
      continue; // empty line
    }

    // Check if this line is the "Subs" header
    if (SUBS_HEADER_REGEX.test(cleaned)) {
      hasStartedRoster = true;
      inSubsSection = true;
      continue;
    }

    // Try matching player
    const match = cleaned.match(PLAYER_LINE_REGEX);

    if (match) {
      hasStartedRoster = true;

      const originalNumber = parseInt(match[1], 10);
      let name = cleanLine(match[2]);
      const rawPos = match[3].toUpperCase();
      const trailingNotes = cleanLine(match[4]);

      // Normalize position
      let position: Position = 'M';
      if (rawPos === 'D') position = 'D';
      else if (rawPos === 'F') position = 'F';
      else if (rawPos === 'GK' || rawPos === 'G') position = 'GK';
      else position = 'M';

      // Check duplicates and append suffix if duplicate
      const lowerName = name.toLowerCase();
      const currentCount = nameCounts.get(lowerName) || 0;
      nameCounts.set(lowerName, currentCount + 1);

      if (currentCount > 0) {
        duplicateNamesSet.add(name);
        name = `${name} (${currentCount + 1})`;
      }

      const player: Player = {
        id: `p-${originalNumber}-${name.replace(/\s+/g, '_')}-${Math.random().toString(36).substring(2, 7)}`,
        originalNumber,
        name,
        position,
        isSub: inSubsSection,
        rawLine,
        notes: trailingNotes || undefined,
      };

      if (inSubsSection) {
        subs.push(player);
      } else {
        starters.push(player);
      }
    } else {
      // Line is not a player line
      if (!hasStartedRoster) {
        // Line is part of the header block before the roster starts
        headerLines.push(cleaned);
      } else {
        // Line is inside the roster area but failed to parse as a player
        unparsedLines.push({
          lineNumber: i + 1,
          text: rawLine,
        });
      }
    }
  }

  // Count positions for starters
  const counts = {
    total: starters.length,
    D: starters.filter((p) => p.position === 'D').length,
    M: starters.filter((p) => p.position === 'M').length,
    F: starters.filter((p) => p.position === 'F').length,
    GK: starters.filter((p) => p.position === 'GK').length,
    subs: subs.length,
  };

  return {
    starters,
    subs,
    unparsedLines,
    duplicates: Array.from(duplicateNamesSet),
    counts,
    detectedHeaderNote: headerLines.length > 0 ? headerLines.join('\n') : undefined,
  };
}
