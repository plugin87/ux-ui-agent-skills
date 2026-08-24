#!/usr/bin/env node
/**
 * ux-ui-agent-skills installer
 *
 * Copies the design-system skill kit into a target project.
 * Zero dependencies — Node built-ins only.
 *
 *   npx ux-ui-skills init [dest]        Install the full kit (default dest: cwd)
 *   npx ux-ui-skills new [dest]         Scaffold a NEW product repo from the starter template
 *   npx ux-ui-skills add <area>...      Install specific areas
 *   npx ux-ui-skills list               List available areas
 *   npx ux-ui-skills help
 *
 * Flags: --force (overwrite existing files), --dry (print actions only)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// area -> source path (relative to package root)
const AREAS = {
  claude: 'CLAUDE.md',
  tokens: 'tokens',
  components: 'components',
  taste: 'taste',
  'design-systems': 'design-systems',
  frameworks: 'frameworks',
  accessibility: 'accessibility',
  workflows: 'workflows',
  content: 'content',
  scripts: 'scripts',
  skills: '.claude/skills',
  rules: '.claude/rules',
};

const DESC = {
  claude: 'CLAUDE.md — agent persona & master instructions (+ Request Router)',
  tokens: '13 DTCG token files (colors, type, spacing, motion, theming…)',
  components: '42 component specs (atoms → templates + nav/feedback/forms/overlays)',
  taste: 'Anti-slop doctrine, aesthetic archetypes, motion choreography',
  'design-systems': 'Interop protocol + crosswalk + 138-system library',
  frameworks: 'Adapter Protocol + React/Next/SwiftUI + 10 concise adapters',
  accessibility: 'WCAG 2.2 checklist + ARIA patterns',
  workflows: 'Design review, handoff, prototyping, redesign-audit',
  content: 'Voice & tone / UX writing system',
  scripts: 'validate_tokens · contrast · design_systems · scaffold_component',
  skills: '10 runnable Claude skills (.claude/skills/)',
  rules: 'Depth split out of CLAUDE.md, loaded on demand (.claude/rules/)',
};

const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m',
};

function parseFlags(argv) {
  const flags = { force: false, dry: false };
  const rest = [];
  for (const a of argv) {
    if (a === '--force' || a === '-f') flags.force = true;
    else if (a === '--dry' || a === '--dry-run') flags.dry = true;
    else rest.push(a);
  }
  return { flags, rest };
}

let copied = 0;
let skipped = 0;

function copyRecursive(src, dest, flags) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!flags.dry) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), flags);
    }
  } else {
    if (fs.existsSync(dest) && !flags.force) {
      skipped++;
      console.log(`  ${C.yellow}skip${C.reset} ${path.relative(process.cwd(), dest)} ${C.dim}(exists — use --force)${C.reset}`);
      return;
    }
    if (!flags.dry) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    copied++;
    console.log(`  ${C.green}+${C.reset} ${path.relative(process.cwd(), dest)}`);
  }
}

function installAreas(areaKeys, destRoot, flags) {
  for (const key of areaKeys) {
    const rel = AREAS[key];
    if (!rel) {
      console.error(`  ${C.red}unknown area:${C.reset} ${key}`);
      continue;
    }
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) {
      console.error(`  ${C.red}missing in package:${C.reset} ${rel}`);
      continue;
    }
    const dest = path.join(destRoot, rel);
    copyRecursive(src, dest, flags);
  }
}

// `new` — scaffold a product repo: the starter layout + the engine areas it needs.
// The template ships CLAUDE.local.md as *.template so this repo's own gitignore
// cannot swallow it; the suffix is dropped on the way out.
const TEMPLATE = path.join('templates', 'product-design');

function cmdNew(destRoot, flags) {
  const src = path.join(ROOT, TEMPLATE);
  if (!fs.existsSync(src)) {
    console.error(`  ${C.red}missing in package:${C.reset} ${TEMPLATE}`);
    process.exit(1);
  }
  console.log(`\n${C.bold}Scaffolding a new design project${C.reset} → ${destRoot}${flags.dry ? C.dim + ' (dry run)' + C.reset : ''}\n`);
  for (const entry of fs.readdirSync(src)) {
    const out = entry === 'CLAUDE.local.md.template' ? 'CLAUDE.local.md' : entry;
    copyRecursive(path.join(src, entry), path.join(destRoot, out), flags);
  }
  // the engine, minus its own CLAUDE.md and rules: the product repo keeps the lean
  // brief and the three project rules the template ships, not the engine's depth
  installAreas(Object.keys(AREAS).filter(k => k !== 'claude' && k !== 'rules'), destRoot, flags);
  console.log(`\n${C.bold}Next${C.reset}`);
  console.log(`  1. Fill the placeholders in ${C.cyan}CLAUDE.md${C.reset} (product, user, stack, vocabulary).`);
  console.log(`  2. Point ${C.cyan}design-tokens.json${C.reset} at your brand, then prove it:`);
  console.log(`     ${C.dim}python3 scripts/validate_contrast.py design-tokens.json${C.reset}`);
  console.log(`  3. Put real screens in ${C.cyan}reference/${C.reset} and real imagery in ${C.cyan}public/images/${C.reset}.`);
  console.log(`  4. Set the MCP env vars (FIGMA_API_KEY, ...) in your shell. Never commit a secret.`);
  console.log(`  5. Run ${C.cyan}/gate${C.reset} in Claude Code before calling anything done.`);
}

function cmdList() {
  console.log(`\n${C.bold}Available areas${C.reset}\n`);
  for (const key of Object.keys(AREAS)) {
    console.log(`  ${C.cyan}${key.padEnd(15)}${C.reset} ${DESC[key]}`);
  }
  console.log(`\n${C.dim}Install all:${C.reset} npx ux-ui-skills init`);
  console.log(`${C.dim}Install some:${C.reset} npx ux-ui-skills add tokens components taste\n`);
}

function help() {
  console.log(`
${C.bold}ux-ui-agent-skills${C.reset} — install the design-system skill kit

${C.bold}Usage${C.reset}
  npx ux-ui-skills ${C.cyan}init${C.reset} [dest]        Install the full kit (default: current dir)
  npx ux-ui-skills ${C.cyan}new${C.reset} [dest]         Scaffold a NEW product repo (starter layout + engine)
  npx ux-ui-skills ${C.cyan}add${C.reset} <area>...      Install specific areas
  npx ux-ui-skills ${C.cyan}list${C.reset}               List available areas
  npx ux-ui-skills ${C.cyan}help${C.reset}

${C.bold}Flags${C.reset}
  --force, -f     Overwrite existing files
  --dry           Show what would be copied, change nothing

${C.bold}Examples${C.reset}
  npx ux-ui-skills init
  npx ux-ui-skills init ./my-app
  npx ux-ui-skills new ./my-product
  npx ux-ui-skills add tokens taste design-systems
  npx ux-ui-skills add skills --force
`);
}

function summary(destRoot) {
  console.log(`\n${C.bold}Done.${C.reset} ${C.green}${copied} copied${C.reset}, ${C.yellow}${skipped} skipped${C.reset} → ${path.relative(process.cwd(), destRoot) || '.'}`);
  console.log(`${C.dim}Open the folder in Claude Code — CLAUDE.md loads automatically. Try /design-tokens, /design-code, /apply-aesthetic.${C.reset}\n`);
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const { flags, rest } = parseFlags(argv.slice(1));

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') return help();
  if (cmd === 'list' || cmd === 'ls') return cmdList();

  if (cmd === 'init') {
    const destRoot = path.resolve(rest[0] || process.cwd());
    console.log(`\n${C.bold}Installing full kit${C.reset} → ${destRoot}${flags.dry ? C.dim + ' (dry run)' + C.reset : ''}\n`);
    installAreas(Object.keys(AREAS), destRoot, flags);
    return summary(destRoot);
  }

  if (cmd === 'new') {
    const destRoot = path.resolve(rest[0] || process.cwd());
    if (!flags.dry) fs.mkdirSync(destRoot, { recursive: true });
    cmdNew(destRoot, flags);
    return summary(destRoot);
  }

  if (cmd === 'add') {
    if (!rest.length) {
      console.error(`${C.red}error:${C.reset} specify at least one area. See: npx ux-ui-skills list`);
      process.exit(1);
    }
    const destRoot = process.cwd();
    console.log(`\n${C.bold}Installing:${C.reset} ${rest.join(', ')}${flags.dry ? C.dim + ' (dry run)' + C.reset : ''}\n`);
    installAreas(rest, destRoot, flags);
    return summary(destRoot);
  }

  console.error(`${C.red}unknown command:${C.reset} ${cmd}\n`);
  help();
  process.exit(1);
}

main();
