import { toPng } from 'html-to-image';
import { Team } from '../types';

/**
 * Exports the team sheet element as a high-resolution PNG image (2x pixel ratio).
 */
export async function downloadTeamSheetPNG(
  element: HTMLElement,
  customFilename?: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const filename = customFilename || `night-curlers-team-sheet-${today}.png`;

  // Temporarily ensure light styling and no shadow/clipping during capture
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    filter: (node) => {
      // Exclude any interactive drag handles or action buttons
      if (node instanceof HTMLElement && node.classList.contains('no-export')) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats the teams into WhatsApp-friendly text with bold titles and clean emojis.
 */
export function formatWhatsAppRoster(
  clubName: string,
  title: string,
  teams: Team[],
  notes?: string,
  footerPayment?: string
): string {
  const lines: string[] = [];

  lines.push(`⚽ *${clubName.toUpperCase()}*`);
  lines.push(`📋 *${title}*`);
  lines.push(`📅 ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}`);
  lines.push('─────────────────────────');

  teams.forEach((team) => {
    const dCount = team.players.filter((p) => p.position === 'D').length;
    const mCount = team.players.filter((p) => p.position === 'M').length;
    const fCount = team.players.filter((p) => p.position === 'F').length;
    const gkCount = team.players.filter((p) => p.position === 'GK').length;

    const shapeParts = [];
    if (gkCount > 0) shapeParts.push(`${gkCount} GK`);
    shapeParts.push(`${dCount} D`, `${mCount} M`, `${fCount} F`);

    lines.push(`\n*${team.name.toUpperCase()} TEAM* (${team.players.length} players)`);
    lines.push(`Shape: ${shapeParts.join(' · ')}`);

    if (gkCount > 0) {
      lines.push('\n🧤 *Goalkeepers:*');
      team.players
        .filter((p) => p.position === 'GK')
        .forEach((p) => lines.push(`  #${p.originalNumber} ${p.name}`));
    }

    lines.push('\n🛡️ *Defenders:*');
    team.players
      .filter((p) => p.position === 'D')
      .forEach((p) => lines.push(`  #${p.originalNumber} ${p.name}`));

    lines.push('\n⚙️ *Midfielders:*');
    team.players
      .filter((p) => p.position === 'M')
      .forEach((p) => lines.push(`  #${p.originalNumber} ${p.name}`));

    lines.push('\n⚡ *Forwards:*');
    team.players
      .filter((p) => p.position === 'F')
      .forEach((p) => lines.push(`  #${p.originalNumber} ${p.name}`));

    if (team.subs.length > 0) {
      lines.push('\n🔄 *Substitutes:*');
      team.subs.forEach((p) => lines.push(`  #${p.originalNumber} ${p.name} (${p.position})`));
    }

    lines.push('─────────────────────────');
  });

  if (notes && notes.trim()) {
    lines.push('\n📝 *Notes:*');
    lines.push(notes.trim());
  }

  if (footerPayment && footerPayment.trim()) {
    lines.push('\n💳 *Payment & Info:*');
    lines.push(footerPayment.trim());
  }

  return lines.join('\n');
}
