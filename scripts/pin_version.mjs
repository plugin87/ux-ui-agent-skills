#!/usr/bin/env node
/**
 * Pin every documented `npx` command to an exact version.
 *
 *   node scripts/pin_version.mjs           rewrite the pins in place
 *   node scripts/pin_version.mjs --check   exit 1 if any command is unpinned or stale
 *
 * Why. `npx ux-ui-agent-skills init` with no version runs whatever is newest on
 * npm, on the reader's machine, at the moment they paste it. A pinned command
 * runs the release the docs were written for, and the reader can audit that
 * exact tarball first. A review (SkillCritic, 2026-10-29) flagged the unpinned
 * form as the kit's main security caveat.
 *
 * Writing out the bin name was worse than leaving it unpinned. The docs said
 * `npx ux-ui-skills init` in places, and `ux-ui-skills` is only a bin inside
 * this package, not a package on npm. Outside a project that has the kit
 * installed, npx resolves that name against the registry, so whoever registers
 * it would have run their code for everyone following the docs. Every form is
 * rewritten to the real package name, at an exact version.
 *
 * What it pins, and to what:
 *   npx [-y] ux-ui-agent-skills | ux-ui-skills   -> npx [-y] ux-ui-agent-skills@<package.json version>
 *   --package=ux-ui-agent-skills (MCP configs)    -> --package=ux-ui-agent-skills@<package.json version>
 *   npx [-y] skills add                          -> npx [-y] skills@<SKILLS_CLI> add
 *   npm i -D playwright                          -> npm i -D playwright@<devDependencies.playwright>
 *
 * `npx playwright install chrome` is left alone on purpose: every place the
 * docs use it follows an `npm install`, so it resolves the Playwright the kit
 * pinned in devDependencies. Pinning it separately could only ever disagree.
 *
 * It runs as the npm `version` lifecycle script, so `npm version <x>` rewrites
 * every pin in the same commit as the bump and the pins cannot go stale.
 * tests/meta/pins.test.mjs runs --check.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

/** The vercel-labs `skills` CLI, verified against npm when this was set. */
export const SKILLS_CLI = '1.7.6';
export const KIT = pkg.version;
export const PLAYWRIGHT = pkg.devDependencies.playwright;

if (!/^\d+\.\d+\.\d+$/.test(PLAYWRIGHT)) {
  console.error(`pin_version: devDependencies.playwright is "${PLAYWRIGHT}", not an exact version; pin it first`);
  process.exit(2);
}

const EXT = new Set(['.md', '.json', '.js', '.mjs', '.cjs', '.html', '.toml', '.yml', '.yaml', '.py', '.sh', '.txt', '.rb']);
/* History and tests keep what they say: CHANGELOG.md describes commands as
   they were at each release, and tests quote the broken commands they guard
   against. bin/cli.js prints its own version at runtime instead of a pin. */
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'library', 'tests', 'out']);
const SKIP_FILES = new Set(['CHANGELOG.md', 'package-lock.json', 'scripts/pin_version.mjs', 'tests/meta/pins.test.mjs']);

function files(dir = ROOT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : files(p);
    const rel = relative(ROOT, p);
    return EXT.has(extname(e.name)) && !SKIP_FILES.has(rel) ? [rel] : [];
  });
}

/* A version is an exact x.y.z, or a placeholder someone typed. `(?![\w@-])`
   keeps `ux-ui-agent-skills-foo` and `ux-ui-skills.md` from matching. */
const VER = '(?:@[\\w.^~*-]+)?';
const RULES = [
  /* `\s+`, not a space: prose wraps, and `npx\nux-ui-agent-skills init` in a
     paragraph is still a command a reader copies. The whitespace is kept. */
  { re: new RegExp(`\\bnpx(\\s+)(-y\\s+)?(?:ux-ui-agent-skills|ux-ui-skills)${VER}(?![\\w@.-])`, 'g'),
    to: (_, sp, y = '') => `npx${sp}${y}ux-ui-agent-skills@${KIT}`, ok: m => m.endsWith(`ux-ui-agent-skills@${KIT}`) },
  { re: new RegExp(`--package=ux-ui-agent-skills${VER}(?![\\w@.-])`, 'g'),
    to: () => `--package=ux-ui-agent-skills@${KIT}`, ok: m => m.endsWith(`@${KIT}`) },
  { re: new RegExp(`\\bnpx(\\s+)(-y\\s+)?skills${VER}(\\s+)add\\b`, 'g'),
    to: (_, sp, y = '', sp2) => `npx${sp}${y}skills@${SKILLS_CLI}${sp2}add`, ok: m => new RegExp(`skills@${SKILLS_CLI.replace(/\\./g, '\\.')}\\s`).test(m) },
  /* Any other exact mention, such as `npm pack ux-ui-agent-skills@3.0.0` or the
     version quoted in prose. Missed by the npx rules in the 3.1.0 bump. The
     lookbehinds leave the npx and --package forms to their own rules. */
  { re: /(?<!\bnpx\s+(?:-y\s+)?)(?<![\w\/=-])ux-ui-agent-skills@\d+\.\d+\.\d+(?![\w.-])/g,
    to: () => `ux-ui-agent-skills@${KIT}`, ok: m => m === `ux-ui-agent-skills@${KIT}` },
  { re: new RegExp(`\\bnpm i(?:nstall)? -D playwright${VER}(?![\\w@.-])`, 'g'),
    to: m => m.replace(/playwright(@\S*)?$/, `playwright@${PLAYWRIGHT}`), ok: m => m.endsWith(`playwright@${PLAYWRIGHT}`) },
];

/** Stale or unpinned commands in one text, and the text with them pinned. */
export function audit(src) {
  const stale = [];
  let out = src;
  for (const r of RULES) {
    for (const m of src.matchAll(r.re)) {
      if (!r.ok(m[0])) stale.push({ line: src.slice(0, m.index).split('\n').length, text: m[0] });
    }
    out = out.replace(r.re, r.to);
  }
  return { stale, out };
}

export function scan() {
  const stale = [];
  const changed = new Map();
  for (const f of files()) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    const r = audit(src);
    stale.push(...r.stale.map(s => `${f}:${s.line}: ${s.text}`));
    if (r.out !== src) changed.set(f, r.out);
  }
  return { stale, changed };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { stale, changed } = scan();
  if (process.argv[2] === '--check') {
    if (stale.length) {
      console.log(`pin_version: ${stale.length} command(s) not pinned to ${KIT} (skills ${SKILLS_CLI}, playwright ${PLAYWRIGHT})`);
      for (const s of stale) console.log(`  ${s}`);
      console.log('Fix: node scripts/pin_version.mjs');
      process.exit(1);
    }
    console.log(`pin_version: every documented npx command is pinned (kit ${KIT}, skills ${SKILLS_CLI}, playwright ${PLAYWRIGHT})`);
  } else {
    for (const [f, text] of changed) writeFileSync(join(ROOT, f), text);
    console.log(`pin_version: ${stale.length} pin(s) rewritten in ${changed.size} file(s) to kit ${KIT}`);
  }
}
