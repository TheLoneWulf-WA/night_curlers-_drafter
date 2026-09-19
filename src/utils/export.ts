import { toPng } from 'html-to-image';
import { Team } from '../types';

/**
 * Exports the team sheet element as a high-resolution, portrait-oriented PNG image.
 * Renders in clean portrait aspect ratio (standard ~1000px width with 3x pixel ratio)
 * so that mobile screens and WhatsApp image viewers display a crystal clear,
 * high-fidelity portrait roster sheet without awkward wide letterboxing or low quality.
 */
export async function downloadTeamSheetPNG(
  element: HTMLElement,
  customFilename?: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const filename = customFilename || `night-curlers-team-sheet-${today}.png`;

  // Clone the element into an isolated offscreen staging wrapper with fixed portrait width
  // This guarantees that even if the user is on mobile (360px screen) or ultra-wide desktop,
  // the exported image has consistent, optimal portrait proportions and spacing.
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'export-sheet-clone';
  clone.style.width = '960px';
  clone.style.maxWidth = '960px';
  clone.style.minWidth = '960px';
  clone.style.boxSizing = 'border-box';
  clone.style.padding = '36px 36px 40px 36px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#111827';
  clone.style.borderRadius = '0px'; // clean sharp export border
  clone.style.boxShadow = 'none';

  // Replace editable inputs and textareas in the clone with standard clean static text spans
  const inputs = clone.querySelectorAll<HTMLInputElement>('input');
  inputs.forEach((input) => {
    const span = document.createElement('span');
    span.textContent = input.value || input.placeholder || '';
    span.className = input.className;
    span.style.border = 'none';
    span.style.outline = 'none';
    span.style.display = 'inline-block';
    if (input.parentNode) {
      input.parentNode.replaceChild(span, input);
    }
  });

  const textareas = clone.querySelectorAll<HTMLTextAreaElement>('textarea');
  textareas.forEach((ta) => {
    const div = document.createElement('div');
    div.textContent = ta.value || ta.placeholder || '';
    div.className = ta.className;
    div.style.border = '1px solid #e4e4e7';
    div.style.whiteSpace = 'pre-wrap';
    div.style.display = 'block';
    if (ta.parentNode) {
      ta.parentNode.replaceChild(div, ta);
    }
  });

  // Ensure grid is 2 columns in the clone for standard 4-team format, or 3 for 3-team format
  const teamGrids = clone.querySelectorAll<HTMLElement>('.grid');
  teamGrids.forEach((g) => {
    // Keep clean 2-column portrait layout
    g.style.display = 'grid';
    g.style.gap = '20px';
  });

  // Remove elements with 'no-export' class
  const noExports = clone.querySelectorAll('.no-export');
  noExports.forEach((el) => el.remove());

  // Mount offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Render at pixelRatio 3 for crisp high-resolution portrait sheet
    const dataUrl = await toPng(clone, {
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: 960,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    document.body.removeChild(container);
  }
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
