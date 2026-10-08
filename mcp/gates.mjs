/**
 * The gate catalogue the MCP server exposes.
 *
 * Derived from the scripts themselves where it can be - whether a gate needs a
 * browser is read from its source, not asserted here - so a gate cannot drift
 * into the wrong column. The one-line descriptions are written by hand because
 * no script states its own purpose in a form worth showing an agent.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KIT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** What each gate measures. A gate missing from here is not exposed. */
const WHAT = {
  'verify_states.mjs':        'WCAG contrast on a real render, for every element in default, hover and focus. The state most pages fail is not the resting one.',
  'measure_render.mjs':       'WCAG contrast measured on the rendered page rather than on the token source, so a value overridden in CSS is caught.',
  'axe_audit.mjs':            'axe-core WCAG 2.2 A/AA: roles, names, labels, landmarks.',
  'verify_responsive.mjs':    'No horizontal overflow at 280, 320 and 414px. --scale=1.25 re-runs it with a wider root font, which is how a layout breaks on another platform.',
  'verify_keyboard.mjs':      'WCAG 2.1.1: Tab reaches every control, Enter and Space operate it, composite widgets implement their arrow-key model.',
  'verify_target_size.mjs':   'WCAG 2.5.8: every target at least 24x24, with the spec\'s spacing and inline exceptions.',
  'verify_mobile_first.mjs':  'Strips every @media and renders the base layer at 320px. A mobile-first page survives it; a desktop-first page cannot.',
  'verify_reduced_motion.mjs':'A reduced-motion policy exists, motion actually stops under it, and no content is lost - the failure where an entrance animation is the only thing that reveals text.',
  'verify_overflow.mjs':      'Silently clipped text and overlapping controls: the failures that stay inside the page and survive a screenshot.',
  'verify_interactive.mjs':   'A control that declares aria-sort, aria-pressed, aria-expanded or aria-checked must change something on a real click.',
  'verify_focustrap.mjs':     'Modal focus trap: Tab stays inside, Escape closes, focus returns to the trigger.',
  'verify_rtl.mjs':           'Renders mirrored to catch layout built on physical properties rather than logical ones.',
  'verify_screen_economy.mjs':'Media bounded, no large hollow boxes, the first screen carries a heading and a way to act, images sized, nothing animating forever.',
  'lint_intent.mjs':          'Token by intent, measured on the render: a destructive action never wears the primary colour, and the same action wears the same variant everywhere.',
  'slop_tells.mjs':           'Render-based tells of machine-generated UI: one radius everywhere, a hardcoded indigo gradient, #000 text, a coloured border on one side only.',
  'taste_audit.mjs':          'Type scale, uniform repetition, line measure and palette discipline. A signal, never a score.',

  'validate_tokens.py':       'DTCG token files parse and every alias resolves.',
  'validate_contrast.py':     'WCAG contrast on the token source itself, light and dark, before anything is built from it.',
  'lint_hardcodes.py':        'No raw hex, px, ms, Tailwind palette class or font stack where a token belongs.',
  'check_no_emoji.py':        'No emoji anywhere in UI, code, JSON or copy. The loudest tell of generated work.',
  'validate_theme_refs.py':   'Every var(--...) resolves to something the theme defines. Needs --theme.',
  'lint_native_select.py':    'No native <select>: it draws its own chevron and cannot be made to match the system.',
  'validate_component_spec.py':'A component spec documents anatomy, variants, states, token mapping and accessibility.',
};

/** True when the script actually drives a browser, read from its source. */
const usesBrowser = (file) => {
  const p = join(KIT, 'scripts', file);
  if (!existsSync(p)) return false;
  return /(^import[^;]*from '|await import\(')(playwright|playwright-core)'/m.test(readFileSync(p, 'utf8'));
};

export function catalogue() {
  const present = new Set(readdirSync(join(KIT, 'scripts')));
  return Object.entries(WHAT)
    .filter(([file]) => present.has(file))
    .map(([file, measures]) => ({
      name: file.replace(/\.(mjs|py)$/, ''),
      file,
      runner: file.endsWith('.py') ? 'python3' : 'node',
      browser: usesBrowser(file),
      measures,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const byName = (name) => catalogue().find(g => g.name === name);
