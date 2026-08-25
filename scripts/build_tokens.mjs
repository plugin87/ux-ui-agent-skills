#!/usr/bin/env node
/**
 * TOKEN BUILD — a real, working reference implementation of workflows/token-build.md.
 * Reads the DTCG tokens in tokens/*.json (source of truth), resolves every alias
 * (incl. cross-file {../colors.*} and the dark override map), and emits a single
 * CSS-variable theme: `:root { … }` + `:root[data-theme="dark"] { … }`.
 *
 * Scope: the colour system (semantic + component + dark) PLUS the rest of the system -
 * type, space, radius, shadow, motion, size - under the names the kit's components and
 * rules already use (--text-sm, --space-4, --radius-card, --duration-fast, --ease-out).
 * A colours-only theme leaves every var(--space-*) undefined on a project's first screen.
 *
 * Usage:
 *   node scripts/build_tokens.mjs                                   # prints CSS to stdout
 *   node scripts/build_tokens.mjs --out dist/tokens.css
 *   node scripts/build_tokens.mjs --in design-tokens.json --out src/theme.css
 *
 * --in takes a directory of DTCG files (default: tokens/) or a single self-contained
 * file, which is what a product repo scaffolded from templates/product-design/ has.
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const arg = (name) => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1]
  || (process.argv.includes(`--${name}`) ? process.argv[process.argv.indexOf(`--${name}`) + 1] : null);
const out = arg('out');
const IN = resolve(arg('in') || join(ROOT, 'tokens'));
const SINGLE = statSync(IN).isFile();
const TOKENS = SINGLE ? dirname(IN) : IN;

// 1) load every token file into a global path->value map (file-namespaced + bare)
const all = {};
const SOURCES = SINGLE ? [IN.split('/').pop()] : readdirSync(TOKENS).filter(n => n.endsWith('.json'));
for (const f of SOURCES) {
  const data = JSON.parse(readFileSync(join(TOKENS, f)));
  const stem = f.replace(/\.json$/, '');
  (function walk(o, p) {
    if (o && typeof o === 'object') {
      if ('$value' in o) { all[p] = o.$value; all[`${stem}.${p}`] = o.$value; }
      for (const k of Object.keys(o)) if (!k.startsWith('$')) walk(o[k], p ? `${p}.${k}` : k);
    }
  })(data, '');
}

// 2) resolve a value (follow {ref} chains incl. ../ and file prefixes).
// `dark` re-resolves semantic refs through the dark override map, so a COMPONENT
// token that aliases into the semantic tier gets its dark value instead of keeping
// the light one. Without this a `button.secondary-text` pinned to the light ink
// ships dark-on-dark: found by a blind eval run at 1.13:1.
function res(v, depth = 0, dark = null) {
  if (depth > 16 || typeof v !== 'string') return v;
  const m = v.match(/^\{(.+)\}$/);
  if (!m) return v;
  let ref = m[1].trim();
  while (ref.startsWith('../') || ref.startsWith('./')) ref = ref.startsWith('../') ? ref.slice(3) : ref.slice(2);
  let val;
  if (dark) {
    const bare = ref.replace(/^(colors\.)?semantic\./, '');
    val = dark[bare] ?? dark[ref];
  }
  if (val === undefined) val = all[ref];
  if (val === undefined) { const tail = ref.split('.').slice(1).join('.'); val = all[ref] ?? all[tail]; }
  return val === undefined ? v : res(val, depth + 1, dark);
}

// 3) emit semantic + component color tokens as --color-* ; dark section as overrides
const colors = JSON.parse(readFileSync(SINGLE ? IN : join(TOKENS, 'colors.json')));
const lines = { light: [], dark: [] };
function emit(obj, prefix, bucket, dark = null) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const hex = res(v.$value, 0, dark);
      if (typeof hex === 'string' && /^(#|rgb|hsl)/.test(hex)) lines[bucket].push(`  --color-${prefix}${k}: ${hex};`);
    } else if (v && typeof v === 'object') {
      emit(v, `${prefix}${k}-`, bucket, dark);
    }
  }
}

// flatten the dark override map once: "text.primary" -> "{primitive.gray.50}"
function flattenDark(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) out[`${prefix}${k}`] = v.$value;
    else if (v && typeof v === 'object') flattenDark(v, `${prefix}${k}.`, out);
  }
  return out;
}
emit(colors.semantic, '', 'light');
if (colors.component) emit(colors.component, '', 'light');
if (colors.dark) {
  const darkMap = flattenDark(colors.dark);
  emit(colors.dark, '', 'dark');
  // the component tier follows the semantic swap into dark, or it stays light
  if (colors.component) emit(colors.component, '', 'dark', darkMap);
}

/* 4) the rest of the system. Colour alone is not a theme: a project scaffolded from
   the template writes var(--space-4) and var(--text-sm) on its first screen, and a
   colours-only build leaves every one of those undefined. Two blind eval runs hit
   this within minutes of starting. Groups map to the names the kit's own components
   and rules use. */
const GROUPS = [
  ['font.family', 'font-'], ['font.size', 'text-'], ['font.weight', 'weight-'],
  ['font.leading', 'leading-'], ['space', 'space-'], ['radius', 'radius-'],
  ['shadow', 'shadow-'], ['motion.duration', 'duration-'], ['motion.easing', 'ease-'],
  ['size', 'size-'], ['opacity', 'opacity-'], ['blur', 'blur-'], ['z', 'z-'],
];
const at = (path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), colors);

function cssValue(v, dark = null) {
  if (Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;           // DTCG cubicBezier
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return null;
  // a shadow or gradient can carry {refs} inside a longer string
  return v.replace(/\{([^}]+)\}/g, (_, ref) => {
    const out = res(`{${ref}}`, 0, dark);
    return typeof out === 'string' ? out : `{${ref}}`;
  });
}

function emitGroup(node, prefix, bucket, dark = null) {
  for (const [k, v] of Object.entries(node || {})) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const out = cssValue(v.$value, dark);
      if (out !== null && !/\{[^}]+\}/.test(String(out))) lines[bucket].push(`  --${prefix}${k}: ${out};`);
    } else if (v && typeof v === 'object') {
      emitGroup(v, `${prefix}${k}-`, bucket, dark);
    }
  }
}

for (const [path, prefix] of GROUPS) {
  const node = at(path);
  if (node) emitGroup(node, prefix, 'light');
}
// a shadow that references a surface (the focus ring's gap colour) has to follow dark
if (colors.dark && at('shadow')) emitGroup(at('shadow'), 'shadow-', 'dark', flattenDark(colors.dark));

const css = `/* Generated by scripts/build_tokens.mjs from ${SINGLE ? arg('in') : 'tokens/*.json'} — do not edit by hand. */
:root {
${[...new Set(lines.light)].join('\n')}
}
:root[data-theme="dark"] {
${[...new Set(lines.dark)].join('\n')}
}
`;

if (out) {
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), css);
  console.log(`wrote ${[...new Set(lines.light)].length} light + ${[...new Set(lines.dark)].length} dark color vars → ${out}`);
} else {
  process.stdout.write(css);
}
