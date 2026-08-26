#!/usr/bin/env node
/**
 * TOKEN-BY-INTENT gate — enforces the CLAUDE.md rule that a token must be
 * chosen by MEANING, not by whatever resolves:
 *
 *   "Destructive actions (Delete, Remove, Revoke) -> action.destructive.
 *    NEVER action.primary. A blue Delete is a bug. The same destructive action
 *    uses the same danger variant everywhere — never red in one place and blue
 *    in another."
 *
 * Source-grepping cannot prove this (a class name says nothing about the colour
 * it resolves to), so the gate RENDERS the page and reads the real computed
 * accent of every control, then compares it against the theme's own resolved
 * --color-action-primary / --color-action-danger.
 *
 * Three signals:
 *   1. WRONG-INTENT   a destructive-labelled control painted with the PRIMARY
 *                     accent (the blue Delete).
 *   2. INVERTED       an affirmative control (Save, Confirm, Continue) painted
 *                     with the DANGER accent.
 *   3. INCONSISTENT   the same destructive label rendered with materially
 *                     different accents in different places (red trigger,
 *                     blue confirm).
 *
 * A neutral/ghost destructive control is NOT flagged — the bug is wearing the
 * primary accent, not declining to be red.
 *
 * Usage: node scripts/lint_intent.mjs <file.html | dir> [--dark] [--tolerance=40]
 * Exit 1 on any signal.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  // A missing browser must not read as a pass. Without DS_REQUIRE_BROWSER the gate
  // stays skippable for local convenience; CI and accuracy_report set it to 1, so a
  // machine that cannot render fails loudly instead of reporting green on nothing.
  const required = process.env.DS_REQUIRE_BROWSER === "1";
  console.log(`lint_intent: playwright not installed — ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) {
  console.log('usage: node scripts/lint_intent.mjs <file.html | dir> [--dark] [--tolerance=40]');
  process.exit(0);
}
const dark = argv.includes('--dark');
const TOL = Number((argv.find(a => a.startsWith('--tolerance=')) || '--tolerance=40').split('=')[1]);

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

const COLLECT = () => {
  /* `cancel subscription`, `close account`, `unsubscribe` are destructive in every
     product that has them; a blind eval run shipped a Cancel flow this gate scored
     as "0 intent-bearing controls". Bare `cancel` stays out: it is the dismiss
     button on every dialog in the world. */
  const DESTRUCTIVE = /\b(delete|remove|revoke|destroy|discard|erase|deactivate|terminate|wipe|unpublish|uninstall|drop|unsubscribe|cancel\s+(subscription|plan|account|membership)|close\s+account|leave\s+(team|workspace|organisation|organization))\b/i;
  const AFFIRMATIVE = /\b(save|confirm|continue|submit|publish|apply|create|send)\b/i;

  // Resolve theme tokens to real rgb by probing, so we compare like with like.
  const probe = document.createElement('div');
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const resolveToken = (name) => {
    probe.style.backgroundColor = '';
    probe.style.backgroundColor = `var(${name})`;
    const v = getComputedStyle(probe).backgroundColor;
    return v && v !== 'rgba(0, 0, 0, 0)' ? v : null;
  };
  const theme = {
    primary: resolveToken('--color-action-primary'),
    danger: resolveToken('--color-action-danger') || resolveToken('--color-action-destructive'),
  };
  probe.remove();

  const accessibleName = (el) =>
    (el.getAttribute('aria-label') || el.title || el.textContent || '').replace(/\s+/g, ' ').trim();

  const controls = [...document.querySelectorAll('button,[role="button"],[role="menuitem"],a[href]')]
    .filter((el) => {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
    .map((el) => {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const alpha = (bg.match(/rgba?\(([^)]+)\)/) || [, '0,0,0,1'])[1].split(',')[3];
      const opaque = alpha === undefined || Number(alpha) > 0.1;
      // Filled control -> the fill is the accent. Ghost/outline -> the text is.
      const accent = opaque ? bg : cs.color;
      const name = accessibleName(el);
      return {
        name: name.slice(0, 40),
        accent,
        filled: opaque,
        kind: DESTRUCTIVE.test(name) ? 'destructive' : AFFIRMATIVE.test(name) ? 'affirmative' : null,
      };
    })
    .filter(c => c.kind && c.name);

  return { theme, controls };
};

const rgb = (s) => (String(s).match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const dist = (a, b) => {
  const [x, y, z] = rgb(a), [p, q, r] = rgb(b);
  if ([x, y, z, p, q, r].some(n => n === undefined)) return Infinity;
  return Math.hypot(x - p, y - q, z - r);
};

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];
const byLabel = new Map();
let checked = 0;

for (const f of files) {
  const name = f.split('/').pop();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: dark ? 'dark' : 'light' });
  await page.goto('file://' + f);
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const { theme, controls } = await page.evaluate(COLLECT);
  await page.close();

  if (!theme.primary || !theme.danger) continue; // page has no themed action tokens
  checked += controls.length;

  for (const c of controls) {
    const toPrimary = dist(c.accent, theme.primary);
    const toDanger = dist(c.accent, theme.danger);

    if (c.kind === 'destructive' && toPrimary <= TOL && toPrimary < toDanger) {
      problems.push(`${name}  [1 wrong-intent]  "${c.name}" is destructive but painted with action.primary (${c.accent})`);
    }
    if (c.kind === 'affirmative' && toDanger <= TOL && toDanger < toPrimary) {
      problems.push(`${name}  [2 inverted]  "${c.name}" is affirmative but painted with action.danger (${c.accent})`);
    }
    if (c.kind === 'destructive') {
      const key = c.name.toLowerCase();
      if (!byLabel.has(key)) byLabel.set(key, []);
      byLabel.get(key).push({ file: name, accent: c.accent, filled: c.filled });
    }
  }
}
await browser.close();

// 3 — same destructive action, different accent in different places.
for (const [label, uses] of byLabel) {
  if (uses.length < 2) continue;
  const filled = uses.filter(u => u.filled);
  for (let i = 1; i < filled.length; i++) {
    if (dist(filled[0].accent, filled[i].accent) > TOL) {
      problems.push(`[3 inconsistent]  "${label}" is ${filled[0].accent} in ${filled[0].file} but ${filled[i].accent} in ${filled[i].file}`);
      break;
    }
  }
}

if (problems.length) {
  console.log(`lint_intent: FAIL — token chosen by convenience, not by intent${dark ? ' [dark]' : ''}`);
  for (const p of [...new Set(problems)]) console.log('  x ' + p);
  console.log('  Fix: destructive -> component.button.destructive-* / action.danger, everywhere it appears.');
  process.exit(1);
}
console.log(`lint_intent: OK — ${files.length} file(s), ${checked} intent-bearing control(s): destructive never wears primary, affirmative never wears danger${dark ? ' [dark]' : ''}`);
