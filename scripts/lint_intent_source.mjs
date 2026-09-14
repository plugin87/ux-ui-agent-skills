#!/usr/bin/env node
/**
 * TOKEN-BY-INTENT, SOURCE SIDE — the same CLAUDE.md rule as lint_intent.mjs,
 * checked where that gate cannot look:
 *
 *   "Destructive actions (Delete, Remove, Revoke) -> action.destructive.
 *    NEVER action.primary. A blue Delete is a bug."
 *
 * lint_intent.mjs renders a page and reads real computed accents, which is the
 * only way to PROVE a colour. But it selects files with `.endsWith('.html')`, so
 * framework source is invisible to it: a blue Delete shipped in a .tsx is not
 * caught by anything. That is not hypothetical - it shipped in this repo's own
 * examples/sample-app/Settings.tsx, on both the trigger and the confirm, while
 * the HTML twin of the same screen was correct.
 *
 * This gate reads the source instead and asks a weaker but still useful
 * question: does a destructive control DECLARE destructive intent?
 *
 * Three signals:
 *   1. WRONG-INTENT  a destructive-labelled control given an explicitly primary
 *                    variant or class ("Delete" as variant="primary").
 *   2. INVERTED      an affirmative control given a danger variant or class
 *                    ("Save" as variant="destructive").
 *   3. UNMARKED      a destructive-labelled control carrying no intent marker at
 *                    all, so its colour comes from whatever the component
 *                    defaults to. This is signal 1 waiting to happen, and it is
 *                    the exact shape of the Settings.tsx bug: <Button>Delete
 *                    account</Button> against a component defaulting to primary.
 *                    Declining to be red is fine; declining to SAY is not.
 *
 * WHAT THIS CANNOT DO, stated plainly, because the numbers are not equivalent:
 *   - It cannot resolve a marker to a colour. `variant="destructive"` mapped to a
 *     blue token passes here and is caught only by lint_intent.mjs on a render.
 *     A green run here is not a claim about any pixel.
 *   - It reads literal attributes only. A computed variant
 *     (`variant={danger ? "destructive" : "primary"}`) is treated as marked, and
 *     a variant threaded through a wrapper component is not followed.
 *   - It scans source with a tag walker, not a real JSX/Vue/Svelte parser, so
 *     exotic formatting can be missed. A miss is a false negative, never a false
 *     positive: the gate only reports a control whose label and markers it read.
 *
 * Escape hatch, matching the `ds-allow-hardcode` precedent: put
 * `ds-allow-intent` in a comment on the control's line or the one above it,
 * with a reason.
 *
 * Usage: node scripts/lint_intent_source.mjs <file | dir> [...]
 * Exit 1 on any signal. No browser required - this gate is deliberately cheap
 * so it can run on every commit, unlike the render gates.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) {
  console.log('usage: node scripts/lint_intent_source.mjs <file | dir> [...]');
  process.exit(0);
}

const EXT = /\.(tsx|jsx|vue|svelte)$/;
const SKIP_DIR = /(^|\/)(node_modules|\.git|dist|build|__pycache__)$/;

function walk(abs) {
  if (statSync(abs).isFile()) return EXT.test(abs) ? [abs] : [];
  if (SKIP_DIR.test(abs)) return [];
  return readdirSync(abs).flatMap(e => walk(join(abs, e)));
}
const files = [...new Set(targets.flatMap(t => walk(resolve(t))))].sort();

/* Vocabulary held identical to lint_intent.mjs on purpose: two gates enforcing
   one rule must agree on what the rule covers, or a label is destructive to one
   and invisible to the other. Bare `cancel` stays out - it is the dismiss button
   on every dialog in the world. */
const DESTRUCTIVE = /\b(delete|remove|revoke|destroy|discard|erase|deactivate|terminate|wipe|unpublish|uninstall|drop|unsubscribe|cancel\s+(subscription|plan|account|membership)|close\s+account|leave\s+(team|workspace|organisation|organization))\b/i;
const AFFIRMATIVE = /\b(save|confirm|continue|submit|publish|apply|create|send)\b/i;

const DANGER_MARKER = /\b(danger|destructive|critical|negative)\b/i;
const PRIMARY_MARKER = /\b(primary|affirmative|cta|confirm)\b/i;

/** A control worth asking about: a real button, a button-ish component, or role=button. */
const CONTROL_TAG = /^(button|a|Button|[A-Z][A-Za-z0-9]*Button|IconButton|MenuItem)$/;

/** Attribute values that can carry intent. className/class are scanned as a whole. */
const MARKER_ATTRS = /(?:^|\s)(variant|color|tone|intent|kind|appearance|data-variant|className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g;

/** Strip JSX expressions, nested tags and entities so what is left is the visible label. */
function labelOf(inner) {
  return inner
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Find the matching close tag for `tag` starting at `from`, honouring nesting. */
function innerText(src, tag, from) {
  const open = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
  const close = new RegExp(`</${tag}\\s*>`, 'g');
  let depth = 1, i = from;
  while (i < src.length && depth > 0) {
    open.lastIndex = i; close.lastIndex = i;
    const o = open.exec(src), c = close.exec(src);
    if (!c) return src.slice(from, Math.min(src.length, from + 400));
    if (o && o.index < c.index) { depth++; i = o.index + 1; }
    else { depth--; if (depth === 0) return src.slice(from, c.index); i = c.index + 1; }
  }
  return src.slice(from, Math.min(src.length, from + 400));
}

/**
 * Yield every opening tag, hand-scanned rather than matched with one regex.
 *
 * A JSX prop can contain the tag terminator: `onClick={() => close()}` has a
 * `>` inside an arrow function, and a regex that stops at the first `>`
 * truncates the attribute list. That is not cosmetic - it drops every prop
 * after the handler, so a correct `variant="destructive"` written after an
 * onClick would read as unmarked and this gate would report a false positive
 * on correct code. Strings and brace depth are tracked so `>` ends the tag
 * only when it really is the terminator.
 */
function* openTags(src) {
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== '<') continue;
    const nameM = /^<([A-Za-z][A-Za-z0-9]*)(?=[\s/>])/.exec(src.slice(i, i + 64));
    if (!nameM) continue;
    let j = i + nameM[0].length;
    let depth = 0, quote = null, end = -1;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (quote) { if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') { depth++; continue; }
      if (ch === '}') { depth--; continue; }
      if (ch === '>' && depth === 0) { end = j; break; }
    }
    if (end === -1) continue;
    const selfClose = src[end - 1] === '/';
    yield {
      tag: nameM[1],
      attrs: src.slice(i + nameM[0].length, selfClose ? end - 1 : end),
      selfClose,
      index: i,
      afterOpen: end + 1,
    };
    i = end;
  }
}

const problems = [];
let checked = 0;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const rel = relative(process.cwd(), f);
  const lines = src.split('\n');
  const lineAt = (idx) => src.slice(0, idx).split('\n').length;

  for (const { tag, attrs, selfClose, index, afterOpen } of openTags(src)) {
    if (!CONTROL_TAG.test(tag)) continue;

    const line = lineAt(index);
    // The opt-out is honoured on the control's own line or the one above it: in
    // JSX the comment almost always sits on the preceding line, and an escape
    // hatch nobody can place where it reads naturally is an escape hatch nobody
    // uses.
    const nearby = `${lines[line - 2] || ''}\n${lines[line - 1] || ''}`;
    if (/ds-allow-intent/.test(nearby)) continue;

    // An <a> is only a control for this gate when it is explicitly button-like.
    if (tag === 'a' && !/role\s*=\s*["']button["']/.test(attrs)) continue;

    const aria = (attrs.match(/aria-label\s*=\s*"([^"]*)"/) || attrs.match(/title\s*=\s*"([^"]*)"/) || [])[1] || '';
    const text = selfClose ? '' : labelOf(innerText(src, tag, afterOpen));
    const name = (aria || text).slice(0, 60);
    if (!name) continue;

    const destructive = DESTRUCTIVE.test(name);
    const affirmative = !destructive && AFFIRMATIVE.test(name);
    if (!destructive && !affirmative) continue;
    checked++;

    let markedDanger = false, markedPrimary = false, marked = false;
    MARKER_ATTRS.lastIndex = 0;
    let a;
    while ((a = MARKER_ATTRS.exec(attrs)) !== null) {
      const value = a[2] ?? a[3] ?? a[4] ?? a[5] ?? a[6] ?? '';
      if (!/class/i.test(a[1])) marked = true;
      if (DANGER_MARKER.test(value)) { markedDanger = true; marked = true; }
      if (PRIMARY_MARKER.test(value)) { markedPrimary = true; marked = true; }
    }
    // A non-literal variant (variant={tone}) counts as marked: unreadable, not absent.
    if (/(?:^|\s)(variant|color|tone|intent|kind|appearance)\s*=\s*\{/.test(attrs)) marked = true;

    if (destructive && markedPrimary && !markedDanger) {
      problems.push(`${rel}:${line}  [1 wrong-intent]  "${name}" is destructive but given a primary variant`);
    } else if (affirmative && markedDanger && !markedPrimary) {
      problems.push(`${rel}:${line}  [2 inverted]  "${name}" is affirmative but given a danger variant`);
    } else if (destructive && !marked) {
      problems.push(`${rel}:${line}  [3 unmarked]  "${name}" is destructive but declares no intent - its colour comes from the component default`);
    }
  }
}

if (problems.length) {
  console.log('lint_intent_source: FAIL — a destructive action does not declare destructive intent');
  for (const p of [...new Set(problems)]) console.log('  x ' + p);
  console.log('  Fix: give it the destructive variant, or annotate the line with ds-allow-intent and a reason.');
  console.log('  Note: this gate reads source only. It never proves a colour — that is lint_intent.mjs on a render.');
  process.exit(1);
}
console.log(`lint_intent_source: OK — ${files.length} file(s), ${checked} intent-bearing control(s): every destructive action declares its intent`);
