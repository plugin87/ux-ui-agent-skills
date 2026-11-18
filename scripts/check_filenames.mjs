#!/usr/bin/env node
/**
 * check_filenames.mjs: every path in the repo must check out on Windows.
 *
 * Windows refuses a path segment named after a device (CON, PRN, AUX, NUL,
 * COM0-9, LPT0-9, with or without an extension, in any case), a segment holding
 * < > : " | ? *, and a segment that ends with a space or a dot. Git for Windows
 * turns on core.protectNTFS, so one such folder leaves `git clone` and
 * `/plugin marketplace add` with an empty tree (issue #31: design-systems/library/com7).
 *
 * Walks the working tree (not only what git tracks, so a new folder fails before
 * it is committed), skipping .git and node_modules.
 *
 *   node scripts/check_filenames.mjs [dir]
 *
 * Exit 0: every path is portable. Exit 1: at least one is not (each is listed).
 * Exit 2: the directory could not be read.
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules']);

const RESERVED = /^(con|prn|aux|nul|com[0-9¹²³]|lpt[0-9¹²³])(\..*)?$/i;
const BAD_CHARS = /[<>:"|?*]/;

export function problem(name) {
  if (RESERVED.test(name)) return 'a reserved device name on Windows';
  if (BAD_CHARS.test(name)) return 'a character Windows forbids (< > : " | ? *)';
  if (/[ .]$/.test(name)) return 'ends with a space or a dot, which Windows strips';
  return null;
}

export function scan(dir) {
  const found = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = join(d, e.name);
      const why = problem(e.name);
      if (why) found.push({ path: relative(dir, p), why });
      if (e.isDirectory()) walk(p);
    }
  };
  walk(dir);
  return found;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] || ROOT);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`check_filenames: cannot read ${dir}`);
    process.exit(2);
  }
  const found = scan(dir);
  if (found.length) {
    console.error(`FAIL: ${found.length} path(s) cannot be checked out on Windows:`);
    for (const f of found) console.error(`  ${f.path}: ${f.why}`);
    console.error('Rename them; a reserved name with an extension (nul.txt) is reserved too.');
    process.exit(1);
  }
  console.log('PASS: every path in the tree can be checked out on Windows.');
}
