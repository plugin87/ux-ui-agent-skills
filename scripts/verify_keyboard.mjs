#!/usr/bin/env node
/**
 * KEYBOARD OPERABILITY gate — WCAG 2.2 SC 2.1.1 (Keyboard) and the P0 rule in
 * CLAUDE.md: "Keyboard navigable — Tab reaches it, Enter/Space activates it."
 *
 * The kit already gated how focus LOOKS (verify_states measures the ring) and
 * that a modal holds focus (verify_focustrap). Nothing checked the thing both
 * depend on: that a control can be reached and operated at all. A <div onclick>
 * styled as a button passes contrast, passes axe's colour rules, and cannot be
 * used without a mouse.
 *
 * The keyboard is actually driven here, not inspected. Crucially, the gate
 * understands the WAI-ARIA composite pattern: in a tablist, listbox, tree, grid
 * or menu, items deliberately carry tabindex="-1" and are reached with ARROW
 * keys, not Tab. Flagging those as unreachable would be wrong, so they are
 * judged by the rule that actually applies to them (signals C and D).
 *
 *   A. UNREACHABLE   a control that IS meant to be in the tab order (operable,
 *                    not tabindex="-1") that repeated Tab never focuses. When a
 *                    dialog is open the audit scopes to it, since a correct
 *                    focus trap is supposed to keep Tab inside.
 *   B. DEAD KEY      a tabbable custom control carrying an interaction state
 *                    (aria-checked/-selected/-expanded/-pressed) whose state
 *                    changes on neither Enter nor Space. Only stateful controls
 *                    are judged, so an effect invisible to the DOM is never
 *                    guessed at.
 *   C. ORPHAN WIDGET a composite (tablist/listbox/tree/grid/menu/radiogroup/
 *                    toolbar) with no keyboard way in at all: no tabbable item,
 *                    no tabbable container, and no tabbable owner pointing at it
 *                    via aria-controls/aria-owns.
 *   D. DEAD ARROWS   a composite that IS reachable but whose items do not
 *                    respond to ArrowDown/ArrowRight — roving tabindex declared
 *                    and never implemented, which strands the user on item one.
 *                    Widgets driven by aria-activedescendant are judged on that
 *                    attribute moving instead of on focus moving.
 *
 * Usage: node scripts/verify_keyboard.mjs <file.html | dir>
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
  console.log(`verify_keyboard: playwright not installed — ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) { console.log('usage: node scripts/verify_keyboard.mjs <file.html | dir>'); process.exit(0); }

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

/** Tag auditable controls and composite widgets; return their metadata. */
const MARK = () => {
  const NATIVE = /^(a|button|input|select|textarea|summary)$/;
  const ITEM_SEL = '[role="tab"],[role="option"],[role="treeitem"],[role="menuitem"],'
    + '[role="menuitemcheckbox"],[role="menuitemradio"],[role="radio"],[role="gridcell"],'
    + '[role="row"],button,a[href]';
  const CONTROL_SEL = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,'
    + '[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],'
    + '[role="menuitem"],[role="menuitemcheckbox"],[role="option"],[tabindex]';
  const COMPOSITE_SEL = '[role="tablist"],[role="listbox"],[role="tree"],[role="grid"],'
    + '[role="menu"],[role="menubar"],[role="radiogroup"],[role="toolbar"]';

  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const operable = (el) =>
    !el.disabled && el.getAttribute('aria-disabled') !== 'true' && getComputedStyle(el).pointerEvents !== 'none';
  /** In the tab order: natively focusable with no negative tabindex, or tabindex >= 0. */
  const tabbable = (el) => {
    const ti = el.getAttribute('tabindex');
    if (ti !== null) return Number(ti) >= 0;
    return NATIVE.test(el.tagName.toLowerCase());
  };
  const name = (el) => {
    const t = (el.getAttribute('aria-label') || el.title || el.textContent || '').replace(/\s+/g, ' ').trim();
    const id = el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    return `${el.tagName.toLowerCase()}${id}${t ? ` "${t.slice(0, 28)}"` : ''}`;
  };

  // A correct focus trap keeps Tab inside an open dialog — scope to it if present.
  const openDialog = [...document.querySelectorAll('[role="dialog"],dialog')].find(vis) || null;
  const root = openDialog || document.body;

  const STATE = ['aria-checked', 'aria-selected', 'aria-expanded', 'aria-pressed'];
  const controls = [];
  let n = 0;
  for (const el of root.querySelectorAll(CONTROL_SEL)) {
    if (!vis(el) || !operable(el) || !tabbable(el)) continue;
    el.setAttribute('data-kbd-idx', String(n));
    const stateAttr = STATE.find(a => el.hasAttribute(a)) || null;
    controls.push({ i: n, name: name(el), stateAttr, native: NATIVE.test(el.tagName.toLowerCase()) });
    n++;
  }

  const composites = [];
  let c = 0;
  for (const box of root.querySelectorAll(COMPOSITE_SEL)) {
    if (!vis(box)) continue;
    const items = [...box.querySelectorAll(ITEM_SEL)].filter(el => vis(el) && operable(el));
    if (items.length < 2) continue;
    box.setAttribute('data-kbd-comp', String(c));
    items.forEach((el, k) => el.setAttribute('data-kbd-item', `${c}.${k}`));

    // Owner that points at this widget (combobox -> listbox) counts as the way in.
    const owner = box.id
      ? [...document.querySelectorAll(`[aria-controls~="${CSS.escape(box.id)}"],[aria-owns~="${CSS.escape(box.id)}"]`)]
        .find(el => vis(el) && tabbable(el))
      : null;
    const activeDescendantHost = owner && owner.hasAttribute('aria-activedescendant') ? owner
      : (box.hasAttribute('aria-activedescendant') ? box : null);
    if (activeDescendantHost) activeDescendantHost.setAttribute('data-kbd-ad', String(c));

    composites.push({
      c,
      name: name(box),
      role: box.getAttribute('role'),
      items: items.length,
      tabbableItem: items.findIndex(tabbable),
      boxTabbable: tabbable(box),
      hasOwner: !!owner,
      activeDescendant: !!activeDescendantHost,
    });
    c++;
  }
  return { controls, composites, scoped: !!openDialog };
};

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];
let totalControls = 0, totalComposites = 0;

for (const f of files) {
  const fname = f.split('/').pop();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('file://' + f);

  const { controls, composites, scoped } = await page.evaluate(MARK);
  totalControls += controls.length;
  totalComposites += composites.length;

  // ---- A. reachability: actually drive Tab and see who receives focus.
  if (controls.length) {
    await page.evaluate(() => document.body.focus());
    const reached = new Set();
    const budget = controls.length * 3 + 20;
    for (let k = 0; k < budget; k++) {
      await page.keyboard.press('Tab');
      const idx = await page.evaluate(() => {
        const a = document.activeElement;
        return a && a.getAttribute ? a.getAttribute('data-kbd-idx') : null;
      });
      if (idx !== null) reached.add(Number(idx));
      if (reached.size === controls.length) break;
    }
    const unreachable = controls.filter(x => !reached.has(x.i));
    if (unreachable.length) {
      problems.push(`${fname}  [A unreachable]  ${unreachable.length} tabbable control(s) Tab never reaches${scoped ? ' (scoped to open dialog)' : ''}`);
      for (const x of unreachable.slice(0, 4)) problems.push(`      ${x.name}`);
    }
  }

  // ---- B. dead key: stateful custom controls must answer Enter or Space.
  for (const x of controls.filter(x => x.stateAttr && !x.native)) {
    const sel = `[data-kbd-idx="${x.i}"]`;
    const read = () => page.$eval(sel, (el, a) => el.getAttribute(a), x.stateAttr);
    let changed = false;
    for (const key of ['Enter', 'Space']) {
      await page.focus(sel).catch(() => {});
      const before = await read();
      await page.keyboard.press(key);
      await page.waitForTimeout(60);
      if (before !== await read()) { changed = true; break; }
    }
    if (!changed) problems.push(`${fname}  [B dead-key]  ${x.name} exposes ${x.stateAttr} but neither Enter nor Space changes it`);
  }

  // ---- C/D. composite widgets: reachable at all, and arrows actually move.
  for (const w of composites) {
    const wayIn = w.tabbableItem >= 0 || w.boxTabbable || w.hasOwner;
    if (!wayIn) {
      problems.push(`${fname}  [C orphan-widget]  ${w.name} (${w.role}, ${w.items} items) has no tabbable item, container or owner — unreachable by keyboard`);
      continue;
    }

    if (w.activeDescendant) {
      const host = `[data-kbd-ad="${w.c}"]`;
      const read = () => page.$eval(host, el => el.getAttribute('aria-activedescendant'));
      await page.focus(host).catch(() => {});
      const before = await read();
      let moved = false;
      for (const key of ['ArrowDown', 'ArrowRight']) {
        await page.keyboard.press(key);
        await page.waitForTimeout(60);
        if (before !== await read()) { moved = true; break; }
      }
      if (!moved) problems.push(`${fname}  [D dead-arrows]  ${w.name} drives aria-activedescendant but arrows never move it`);
      continue;
    }

    if (w.tabbableItem < 0) continue; // reached via owner; no roving model declared
    const start = `[data-kbd-item="${w.c}.${w.tabbableItem}"]`;
    await page.focus(start).catch(() => {});
    let moved = false;
    for (const key of ['ArrowDown', 'ArrowRight']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(60);
      const now = await page.evaluate(() => {
        const a = document.activeElement;
        return a && a.getAttribute ? a.getAttribute('data-kbd-item') : null;
      });
      if (now && now !== `${w.c}.${w.tabbableItem}`) { moved = true; break; }
    }
    if (!moved) problems.push(`${fname}  [D dead-arrows]  ${w.name} (${w.role}) uses roving tabindex but ArrowDown/ArrowRight never move focus`);
  }

  await page.close();
}
await browser.close();

if (problems.length) {
  console.log('verify_keyboard: FAIL — WCAG 2.1.1 Keyboard');
  for (const p of problems) console.log(p.startsWith('      ') ? p : '  x ' + p);
  console.log('  Fix A: give the control a native element or tabindex="0" and put it in the tab order.');
  console.log('  Fix B: handle keydown for Enter and Space on custom controls, and update the aria state.');
  console.log('  Fix C: make one item tabindex="0" (roving), or expose the widget through a tabbable owner.');
  console.log('  Fix D: implement the arrow-key model for the pattern (see accessibility/aria-patterns.md).');
  process.exit(1);
}
console.log(`verify_keyboard: OK — ${files.length} file(s), ${totalControls} control(s) + ${totalComposites} composite widget(s): all reachable, Enter/Space and arrow keys answer`);
