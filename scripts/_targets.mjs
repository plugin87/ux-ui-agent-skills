/**
 * Refuse to measure a path that is not there.
 *
 * Thirteen of the fourteen render gates took their file arguments and went
 * straight to the browser. A path that did not exist produced an uncaught
 * exception somewhere inside Playwright - on macOS that happened to exit 1, and
 * on Linux CI `verify_states.mjs tests/fixtures/nope.html` exited **0**.
 *
 * Exit 0 on a file that does not exist is the worst result available to a gate:
 * a typo in a filename reads as a clean pass. "Scanning nothing must not read as
 * clean" is already the rule for the file-reading gates; this applies it to the
 * render gates, in one place so the thirteen cannot drift apart.
 *
 * Exit code 2, not 1, and deliberately: 1 means "I looked and found something
 * wrong", 2 means "I could not look". A caller that treats them the same is
 * already wrong, and several in this repo do not.
 */
import { existsSync, statSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * @param {string[]} paths  non-flag arguments, as the gate parsed them
 * @param {object}  [opts]
 * @param {string}  [opts.usage]  the one-line usage to print when nothing was given
 * @param {boolean} [opts.allowDirs=true]  whether a directory is a valid target
 * @returns {string[]} the same paths, once every one of them is real
 */
export function requireTargets(paths, opts = {}) {
  const { usage, allowDirs = true } = opts;
  const who = basename(process.argv[1] || 'gate');

  if (!paths || paths.length === 0) {
    console.log(usage || `Usage: node scripts/${who} <file|dir> [...]`);
    console.log('ERROR: no target given. A gate with nothing to measure is not a pass.');
    process.exit(2);
  }

  const missing = paths.filter(p => !existsSync(p));
  if (missing.length) {
    console.log(`ERROR: path(s) not found: ${missing.join(', ')}`);
    console.log('Nothing was measured. This is not a pass - check the path and run it again.');
    process.exit(2);
  }

  if (!allowDirs) {
    const dirs = paths.filter(p => statSync(p).isDirectory());
    if (dirs.length) {
      console.log(`ERROR: expected a file, got a directory: ${dirs.join(', ')}`);
      process.exit(2);
    }
  }

  return paths;
}
