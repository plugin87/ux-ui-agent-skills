#!/usr/bin/env node
/**
 * INTERACTIVE TRUTH gate. A control that DECLARES a state contract must honour it.
 *
 * The kit already proves a control is reachable (verify_keyboard), large enough
 * (verify_target_size) and readable in every state (verify_states). None of that
 * catches the failure a designer spots in two seconds: a header that says
 * `aria-sort="ascending"`, draws a chevron, highlights on hover — and sorts nothing.
 * The doctrine's answer was "click every control and look", which is a promise, not
 * a gate. This is the gate.
 *
 * Signal [A] DEAD STATE CONTRACT (fails): an enabled, visible control that declares
 *   aria-pressed / aria-expanded / aria-checked / aria-selected / aria-sort, or wears
 *   a state-bearing role (switch, tab, menuitemcheckbox, menuitemradio, option), and
 *   a real click changes NOTHING: no attribute anywhere in the document, no DOM
 *   mutation, no focus move. The element promises state and lies.
 *
 * Signal [B] INERT CONTROL (advisory): a plain button with no state contract whose
 *   click has no observable effect. Harnesses legitimately ship static demo buttons,
 *   so this is reported, never failed.
 *
 * Signal [C] INVISIBLE STATE (fails): the control's state attribute flips, but the
 *   control itself looks exactly the same - same computed styles, same text, same
 *   geometry, everywhere inside it. A screen reader hears the change and a sighted
 *   user sees nothing. Found by a critique of a blind eval run: a theme toggle that
 *   said "Dark mode" with the same icon in both states, flipping only aria-checked.
 *
 * Opt-out: `data-demo-state` on a control means "this is a RENDERING of a state, not a
 * live control" - what a states harness legitimately ships when it shows a toggle in
 * both positions. The marker has to be written by hand, so the exemption is a claim
 * the author makes on the record, not something the gate infers.
 *
 * Each candidate is clicked on a FRESH load, so one control cannot mask another.
 *
 * Usage: node scripts/verify_interactive.mjs <file.html | dir> [--dark] [--advisory]
 * Exit 1 on any [A] signal.
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
  console.log(`verify_interactive: playwright not installed — ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const dark = argv.includes('--dark');
const advisory = argv.includes('--advisory');
const target = argv.find(a => !a.startsWith('--'));
if (!target) {
  console.log('usage: node scripts/verify_interactive.mjs <file.html | dir> [--dark] [--advisory]');
  process.exit(0);
}
const abs = resolve(target);
const files = statSync(abs).isDirectory()
  ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f)).sort()
  : [abs];

const STATE_ATTRS = ['aria-pressed', 'aria-expanded', 'aria-checked', 'aria-selected', 'aria-sort'];
const STATE_ROLES = ['switch', 'tab', 'menuitemcheckbox', 'menuitemradio', 'option'];

const COLLECT = ({ attrs, roles }) => {
  const path = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const i = [...n.parentElement.children].indexOf(n) + 1;
      parts.unshift(`${n.tagName.toLowerCase()}:nth-child(${i})`);
    }
    return parts.join(' > ');
  };
  const visible = (el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0
      && r.width > 0 && r.height > 0 && !el.closest('[hidden]');
  };
  const out = [];
  const clickable = 'button,[role="button"],input[type="checkbox"],input[type="radio"],'
    + '[role="switch"],[role="tab"],[role="option"],[role="menuitemcheckbox"],[role="menuitemradio"],summary';
  for (const el of document.querySelectorAll(clickable)) {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
    if (el.hasAttribute('data-demo-state')) continue;   // a state rendering, declared as such
    // NB: HTMLButtonElement.type defaults to 'submit' even with no form, so only
    // skip a real submit control that actually belongs to a form.
    if (el.type === 'file') continue;
    if (el.form && (el.type === 'submit' || el.type === 'reset')) continue;
    if (!visible(el)) continue;
    const owner = el.closest('th,[role="columnheader"],[role="tab"],[role="option"]') || el;
    const declared = attrs.filter(a => el.hasAttribute(a) || owner.hasAttribute(a));
    const role = el.getAttribute('role') || '';
    const roleDeclared = roles.includes(role);
    const isNativeCheckable = el.tagName === 'INPUT';   // browser toggles these itself
    out.push({
      sel: path(el),
      label: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/)[0] : ''}` +
        (el.textContent ? ` "${el.textContent.replace(/\s+/g, ' ').trim().slice(0, 22)}"` : ''),
      declares: [...declared, ...(roleDeclared ? [`role=${role}`] : [])],
      native: isNativeCheckable,
    });
  }
  return out;
};

const WATCH = () => {
  window.__mut = 0;
  window.__focus = document.activeElement;
  const o = new MutationObserver(recs => { window.__mut += recs.length; });
  o.observe(document.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
};

/* What the control LOOKS like, itself and everything inside it. Compared before and
   after the click: an identical fingerprint next to a flipped state attribute means
   the state is audible and invisible. */
const STATE_OF = ({ sel, attrs }) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const owner = el.closest('th,[role="columnheader"],[role="tab"],[role="option"]') || el;
  return attrs.map(a => `${a}=${el.getAttribute(a) ?? owner.getAttribute(a) ?? ''}`).join(',');
};

const FINGERPRINT = (sel) => {
  const root = document.querySelector(sel);
  if (!root) return null;
  const props = ['backgroundColor', 'color', 'borderColor', 'borderWidth', 'boxShadow',
    'transform', 'opacity', 'outlineColor', 'backgroundImage', 'textDecorationLine', 'fontWeight'];
  const one = (el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return props.map(p => cs[p]).join('|') + '|' + Math.round(r.width) + 'x' + Math.round(r.height)
      + '|' + (el.getAttribute('href') || '') + '|' + (el.tagName === 'use' ? el.getAttribute('href') : '');
  };
  const parts = [one(root), (root.textContent || '').replace(/\s+/g, ' ').trim()];
  for (const el of root.querySelectorAll('*')) parts.push(one(el));
  return parts.join('~');
};

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const dead = [], inert = [], invisible = [];
let checked = 0;

for (const f of files) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  if (dark) await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('file://' + f);
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const candidates = await page.evaluate(COLLECT, { attrs: STATE_ATTRS, roles: STATE_ROLES });
  await page.close();

  for (const c of candidates) {
    // native checkboxes/radios are toggled by the browser itself: their contract is
    // kept without a listener, so they are not evidence of anything.
    if (c.native && !c.declares.length) continue;
    const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    if (dark) await p.emulateMedia({ colorScheme: 'dark' });
    await p.goto('file://' + f);
    if (dark) await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await p.evaluate(WATCH);
    const declaredAttrs = c.declares.filter(d => !d.startsWith('role='));
    const before = c.declares.length ? await p.evaluate(FINGERPRINT, c.sel) : null;
    const stateBefore = declaredAttrs.length
      ? await p.evaluate(STATE_OF, { sel: c.sel, attrs: declaredAttrs }) : null;
    let changed = null;
    try {
      await p.click(c.sel, { timeout: 1500 });
      await p.waitForTimeout(80);
      changed = await p.evaluate((sel) => {
        // Clicking a button focuses it. That is the browser, not the component:
        // only focus landing somewhere ELSE (a dialog, a revealed field) is evidence.
        const me = document.querySelector(sel);
        const now = document.activeElement;
        return { mut: window.__mut, focusMoved: window.__focus !== now && now !== me };
      }, c.sel);
      if (c.declares.length) {
        await p.waitForTimeout(260);          // let a transition finish before comparing
        changed.after = await p.evaluate(FINGERPRINT, c.sel);
        changed.stateAfter = declaredAttrs.length
          ? await p.evaluate(STATE_OF, { sel: c.sel, attrs: declaredAttrs }) : null;
      }
    } catch { changed = { mut: -1, focusMoved: false, error: true }; }
    await p.close();
    checked++;
    if (!changed || changed.error) continue;             // could not click: not evidence
    const moved = changed.mut > 0 || changed.focusMoved;
    if (moved) {
      /* Only when the state VALUE actually moved. Clicking the day that is already
         selected, or the tab that is already current, legitimately changes nothing
         about that control - that is a no-op, not a hidden state. */
      const stateMoved = stateBefore !== null && changed.stateAfter !== null
        && stateBefore !== changed.stateAfter;
      if (stateMoved && before && changed.after && before === changed.after) {
        invisible.push(`${f.split('/').pop()}  ${c.label} — ${c.declares.join(', ')} flipped, but the control looks identical`);
      }
      continue;
    }
    const where = `${f.split('/').pop()}  ${c.label}`;
    if (c.declares.length) dead.push(`${where} — declares ${c.declares.join(', ')} but a click changes nothing`);
    else inert.push(`${where} — click has no observable effect`);
  }

}
await browser.close();

const mode = dark ? ' (dark)' : '';
if (dead.length) {
  console.log(`verify_interactive: ${advisory ? 'ADVISORY' : 'FAIL'}${mode} — a control promises state it does not deliver`);
  for (const d of dead) console.log('  x [A dead] ' + d);
  console.log('  Fix: wire the handler so the state attribute actually changes, or stop');
  console.log('       declaring the state (drop aria-sort/aria-pressed and the affordance with it).');
}
if (inert.length) {
  console.log(`  (advisory) ${inert.length} control(s) with no observable effect:`);
  for (const i of inert.slice(0, 8)) console.log('    - [B inert] ' + i);
  if (inert.length > 8) console.log(`    ... and ${inert.length - 8} more`);
}
if (invisible.length) {
  console.log(`verify_interactive: ${advisory ? 'ADVISORY' : 'FAIL'}${mode} — a state change nobody can see`);
  for (const i of invisible) console.log('  x [C invisible] ' + i);
  console.log('  Fix: give the control itself a visual state - a track that fills, an icon that');
  console.log('       swaps, a label that changes. aria-checked alone serves only a screen reader.');
}
if ((dead.length || invisible.length) && !advisory) process.exit(1);
console.log(`verify_interactive: OK${mode} — ${checked} control(s) clicked across ${files.length} file(s); every declared state contract is honoured.`);
