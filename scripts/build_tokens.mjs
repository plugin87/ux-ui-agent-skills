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
const TREES = {};
for (const f of SOURCES) {
  const data = JSON.parse(readFileSync(join(TOKENS, f)));
  const stem = f.replace(/\.json$/, '');
  TREES[stem] = data;
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
  [['font.family', 'typography.fontFamily'], 'font-'],
  [['font.size', 'typography.fontSize'], 'text-'],
  [['font.weight', 'typography.fontWeight'], 'weight-'],
  [['font.leading', 'typography.lineHeight'], 'leading-'],
  [['space', 'spacing.scale'], 'space-'],
  [['radius', 'borders.radius'], 'radius-'],
  [['borders.radius-semantic'], 'radius-'],
  [['shadow', 'shadows.elevation'], 'shadow-'],
  [['shadows.inner'], 'shadow-inner-'],
  [['shadows.focus-ring'], 'shadow-focus-ring'],
  [['motion.duration'], 'duration-'],
  [['motion.easing'], 'ease-'],
  [['motion.transition'], 'transition-'],
  [['size', 'sizing'], 'size-'],
  [['opacity'], 'opacity-'],
  [['blur'], 'blur-'],
  [['z', 'breakpoints.z-index'], 'z-'],
  [['breakpoints.breakpoint'], 'bp-'],
  [['data-viz.categorical', 'chart.categorical'], 'color-chart-'],
  [['data-viz.grid.line'], 'color-chart-grid'],
  [['data-viz.axis'], 'color-chart-axis-'],
];

/* A single self-contained design-tokens.json holds every group inside one tree, so
   `colors` IS that tree. The kit's own tokens/ is a DIRECTORY, where space lives in
   spacing.json and radius in borders.json - looking those up inside colors.json
   returned undefined and emitted NOTHING but colour. That is exactly the failure
   this section exists to prevent, and it shipped: a directory build produced 85
   colour vars and left every var(--space-*) undefined. Resolve against both shapes. */
function lookup(path) {
  const parts = path.split('.');
  const direct = parts.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), colors);
  if (direct) return direct;
  const [stem, ...rest] = parts;
  return rest.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), TREES[stem]);
}
const at = (paths) => (Array.isArray(paths) ? paths : [paths]).map(lookup).find(Boolean);

/* DTCG composites are not all arrays of numbers. Treating every array as a
   cubicBezier turned the font stack into `cubic-bezier(Inter, system-ui, ...)` and
   every shadow into `cubic-bezier([object Object])`. Dispatch on the shape. */
function cssValue(v, dark = null, type = null) {
  // A ref can resolve to a non-string: {easing.ease-out} is a cubicBezier ARRAY.
  // Returning it raw left the brace in place and the whole token was dropped -
  // which is why every --transition-* was missing. Flatten through cssValue.
  const sub = (x) => typeof x === 'string'
    ? x.replace(/\{([^}]+)\}/g, (_, ref) => {
        const out = res(`{${ref}}`, 0, dark);
        const flat = typeof out === 'string' ? out : cssValue(out, dark);
        return typeof flat === 'string' ? flat : `{${ref}}`;
      })
    : x;
  const shadowPart = (o) => [o.inset ? 'inset' : null, sub(o.offsetX), sub(o.offsetY),
    sub(o.blur), sub(o.spread), sub(o.color)].filter(Boolean).join(' ');

  if (Array.isArray(v)) {
    if (v.every(x => typeof x === 'number')) return `cubic-bezier(${v.join(', ')})`;
    if (v.every(x => typeof x === 'string')) {                            // fontFamily stack
      return v.map(f => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
    }
    if (v.every(x => x && typeof x === 'object')) return v.map(shadowPart).join(', ');
    return null;
  }
  if (v && typeof v === 'object') {
    if (type === 'transition' || ('duration' in v && 'timingFunction' in v)) {
      const delay = sub(v.delay);
      return [sub(v.duration), sub(v.timingFunction), delay && delay !== '0ms' ? delay : null]
        .filter(Boolean).join(' ');
    }
    if ('offsetX' in v || 'blur' in v) return shadowPart(v);              // single shadow
    return null;
  }
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return null;
  return sub(v);
}

function emitGroup(node, prefix, bucket, dark = null) {
  for (const [k, v] of Object.entries(node || {})) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && '$value' in v) {
      const out = cssValue(v.$value, dark, v.$type);
      const name = k.startsWith(prefix) ? k : `${prefix}${k}`;   // "ease-" + "ease-out" is one name, not two
      if (out !== null && !/\{[^}]+\}/.test(String(out))) lines[bucket].push(`  --${name}: ${out};`);
    } else if (v && typeof v === 'object') {
      emitGroup(v, `${prefix}${k}-`, bucket, dark);
    }
  }
}

function emitLeafOrGroup(node, prefix, bucket, dark = null) {
  if (!node) return;
  if ('$value' in node) {
    const out = cssValue(node.$value, dark, node.$type);
    if (out !== null && !/\{[^}]+\}/.test(String(out))) lines[bucket].push(`  --${prefix.replace(/-$/, '')}: ${out};`);
  } else emitGroup(node, prefix, bucket, dark);
}

for (const [paths, prefix] of GROUPS) emitLeafOrGroup(at(paths), prefix, 'light');

// a shadow that references a surface (the focus ring's gap colour) has to follow dark
if (colors.dark) {
  const darkMap = flattenDark(colors.dark);
  emitLeafOrGroup(at(['shadow', 'shadows.elevation']), 'shadow-', 'dark', darkMap);
  emitLeafOrGroup(at(['shadows.focus-ring']), 'shadow-focus-ring', 'dark', darkMap);
}

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
