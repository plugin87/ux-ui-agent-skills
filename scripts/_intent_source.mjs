/**
 * Token by intent, read from component source (.tsx, .jsx, .vue) and the
 * stylesheets beside it. lint_intent.mjs renders HTML and measures the real
 * accent; this is the half for a folder of framework source that nothing has
 * rendered. Pointed at examples/sample-app before this existed, the gate read
 * only the .html files and said nothing about the blue Delete in Settings.tsx
 * (#11). The repo's own TSX is ALSO rendered and measured (render_framework_source
 * then lint_intent in accuracy_report); this pass is for a user's folder.
 *
 * Reading source cannot see a computed colour, so it checks the two places a
 * wrong intent is written down:
 *
 *   S1  a destructive control that asks for the primary look: variant="primary"
 *       (or default, brand, solid), a primary/blue class, or no variant at all on
 *       a component whose default variant is not a danger one.
 *   S2  a destructive or danger variant wired to a primary or blue token: in a
 *       cva/variant map (`destructive: "bg-blue-600"`) or in a stylesheet rule
 *       whose selector names destructive/danger and whose fill is primary.
 *
 * A neutral destructive control (ghost, outline, secondary) is not flagged:
 * the bug is wearing the primary accent, not declining to be red. That matches
 * the render pass.
 */
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

export const SOURCE_EXT = new Set(['.tsx', '.jsx', '.vue']);
export const STYLE_EXT = new Set(['.css', '.scss']);

/* The same vocabulary as the render pass in lint_intent.mjs. */
export const DESTRUCTIVE = /\b(delete|remove|revoke|destroy|discard|erase|deactivate|terminate|wipe|unpublish|uninstall|drop|unsubscribe|cancel\s+(subscription|plan|account|membership|order|booking|reservation|shipment|invoice|payment|transfer|request|job|build|deployment|run)|close\s+account|leave\s+(team|workspace|organisation|organization))\b/i;

const PRIMARY_VARIANT = /^(primary|default|brand|solid|accent|cta|filled)$/i;
const NEUTRAL_OR_DANGER = /^(destructive|danger|error|critical|negative|secondary|ghost|outline|outlined|link|neutral|tertiary|subtle|plain|text|quiet|minimal)$/i;
/* A class or token that means "the primary / blue accent". */
const PRIMARY_LOOK = /(action-primary|--color-primary|\b(?:bg|border)-(?:primary|blue|indigo|sky|violet)(?:-\d{2,3})?\b|\bbtn-primary\b|--primary\b|\b[\w-]*btn--primary\b|\bvar\(--primary)/i;
const BUTTONISH = /^(button|(?:[A-Z][\w.]*)?(?:Button|Action|Btn))$/;

/** Walk an opening tag from `<`, honouring quotes and {} so `() => x` is not its end. */
function openingTag(src, at) {
  let depth = 0, q = null;
  for (let i = at + 1; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === q && src[i - 1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return { end: i, self: src[i - 1] === '/' };
  }
  return null;
}

/** `name="v"`, `name='v'` or `name={"v"}` / `name={'v'}`; undefined when absent. */
function attr(tag, name) {
  const m = tag.match(new RegExp(`(?:^|\\s|:)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*["'\`]([^"'\`]*)["'\`]\\s*\\})`));
  if (m) return m[1] ?? m[2] ?? m[3];
  return new RegExp(`(?:^|\\s)${name}\\s*=`).test(tag) ? '' : undefined;
}

/** Text a user would read: plain text plus the string literals inside {} expressions. */
function label(children) {
  return children
    .replace(/\{([^{}]*)\}/g, (_, e) => ' ' + (e.match(/(["'`])([^"'`]*)\1/g) || []).map(s => s.slice(1, -1)).join(' ') + ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The default variant a component declares: `variant = "x"` or defaultVariants { variant: "x" }. */
export function defaultVariants(sources) {
  const out = new Map();
  for (const { file, text } of sources) {
    const comp = [...text.matchAll(/(?:function|const|class)\s+([A-Z]\w*)/g)].map(m => m[1]);
    const d = text.match(/\bvariant\s*=\s*["'`](\w+)["'`]\s*[,}]/) ||
              text.match(/defaultVariants\s*:\s*\{[^}]*\bvariant\s*:\s*["'`](\w+)["'`]/);
    if (!d) continue;
    for (const name of comp) out.set(name, { variant: d[1], file: basename(file) });
  }
  return out;
}

/** S1: destructive controls that ask for the primary look. `seen` counts every
 *  destructive control read, so a pass can say how much it looked at. */
export function controls(file, text, defaults) {
  const found = [];
  let seen = 0;
  const name = basename(file);
  const lineOf = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/<([A-Za-z][\w.]*)(?=[\s/>])/g)) {
    const tagName = m[1];
    if (!BUTTONISH.test(tagName)) continue;
    const open = openingTag(text, m.index);
    if (!open) continue;
    const tag = text.slice(m.index, open.end + 1);
    let children = '';
    if (!open.self) {
      const close = text.indexOf(`</${tagName}>`, open.end);
      if (close === -1) continue;
      children = text.slice(open.end + 1, close);
    }
    const said = [label(children), attr(tag, 'aria-label') || ''].join(' ').trim();
    if (!DESTRUCTIVE.test(said)) continue;
    seen++;
    const where = `${name}:${lineOf(m.index)}`;
    const shown = said.slice(0, 40);
    const variant = attr(tag, 'variant') ?? attr(tag, 'color') ?? attr(tag, 'severity');
    const cls = attr(tag, 'className') ?? attr(tag, 'class') ?? '';
    if (variant && PRIMARY_VARIANT.test(variant)) {
      found.push(`${where}  [1 wrong-intent]  "${shown}" is destructive but asks for variant="${variant}"`);
    } else if (PRIMARY_LOOK.test(cls)) {
      found.push(`${where}  [1 wrong-intent]  "${shown}" is destructive but its class names the primary accent (${cls.match(PRIMARY_LOOK)[0]})`);
    } else if (variant === undefined && tagName !== 'button') {
      const d = defaults.get(tagName.split('.').pop());
      if (!d || !NEUTRAL_OR_DANGER.test(d.variant)) {
        found.push(`${where}  [1 wrong-intent]  "${shown}" is destructive and sets no variant, so it renders <${tagName}>'s default` +
          (d ? ` ("${d.variant}", ${d.file})` : ', which is primary in most kits') + '; give it variant="destructive"');
      }
    }
  }
  return { found, seen };
}

/** S2: a destructive/danger variant whose styling is the primary accent. */
export function wiring(file, text) {
  const found = [];
  const name = basename(file);
  const lineOf = (i) => text.slice(0, i).split('\n').length;
  if (STYLE_EXT.has(extname(file))) {
    const css = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      if (!/(destructive|danger)/i.test(m[1])) continue;
      for (const d of m[2].matchAll(/\b(background(?:-color)?|border-color)\s*:\s*([^;]+)/g)) {
        if (PRIMARY_LOOK.test(d[2]) || /\b(blue|indigo)\b/i.test(d[2])) {
          found.push(`${name}:${lineOf(m.index + m[1].length)}  [S2 wired wrong]  ${m[1].trim()} sets ${d[1]}: ${d[2].trim()}, the primary accent`);
        }
      }
    }
    return found;
  }
  for (const m of text.matchAll(/\b(destructive|danger)\s*:\s*(["'`])([^"'`]*)\2/g)) {
    if (PRIMARY_LOOK.test(m[3])) {
      found.push(`${name}:${lineOf(m.index)}  [S2 wired wrong]  the ${m[1]} variant is styled "${m[3].slice(0, 60)}", the primary accent`);
    }
  }
  return found;
}

/** Every finding across the given files. */
export function auditSource(files) {
  const read = files.map(file => ({ file, text: readFileSync(file, 'utf8') }));
  const defaults = defaultVariants(read.filter(r => SOURCE_EXT.has(extname(r.file))));
  const problems = [];
  let scanned = 0, destructive = 0;
  for (const { file, text } of read) {
    scanned++;
    if (SOURCE_EXT.has(extname(file))) {
      const c = controls(file, text, defaults);
      problems.push(...c.found);
      destructive += c.seen;
    }
    problems.push(...wiring(file, text));
  }
  return { problems, scanned, destructive };
}
