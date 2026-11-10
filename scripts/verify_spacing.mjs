#!/usr/bin/env node
/**
 * SPACING gate. Enforces "Spacing: rows, gaps and gutters" in
 * .claude/rules/components.md, the three things a reviewer sees at a glance and
 * no contrast or overflow gate measures:
 *
 *   A. UNEQUAL ROW  boxed siblings that start on the same line end on different
 *                   lines: two channel cards, a pipeline of columns. Almost always
 *                   an align-items:start someone added. An item that spans more
 *                   than one grid row (a bento lead tile) is not compared.
 *   B. TOUCHING     a control, badge or boxed card sits closer than 8px to the
 *                   sibling next to it, stacked or side by side, including after a
 *                   row wraps on a phone. A label may sit 4px from its own control.
 *                   Not judged: the segments of one control inside the box that
 *                   draws them (a segmented button, a stepper), full-width bands and
 *                   page sections stacked on each other, table and list rows, a
 *                   chart's cells, inline text, and layout inside a control.
 * Not measured here, though the same rule names them: "one relationship, one
 * gap" and "one gutter". Both were tried on all 56 example pages and both failed
 * good pages: a shared class name does not mean a shared relationship, and a
 * card's padding moves its text off the gutter while the card itself sits on it.
 * A gate that guesses teaches people to ignore it, so the design critic reads
 * those two by eye.
 *
 * Text is measured by its glyphs, not its padded box, so the gap the eye sees is
 * the gap the gate reads.
 *
 * Usage: node scripts/verify_spacing.mjs <file.html | dir> [--widths=320,390,1280] [--dark]
 *
 * 320 is in the default on purpose: a row wraps on the narrowest phone first, and
 * a badge that falls under its heading there is the touch this gate exists for.
 * Exit 1 on any finding, 2 if a target is missing.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { requireTargets } from './_targets.mjs';
import { launchOrSkip } from './_browser.mjs';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  // A missing browser must not read as a pass. Without DS_REQUIRE_BROWSER the gate
  // stays skippable for local convenience; CI and accuracy_report set it to 1, so a
  // machine that cannot render fails loudly instead of reporting green on nothing.
  const required = process.env.DS_REQUIRE_BROWSER === "1";
  console.log(`verify_spacing: playwright not installed: ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const targets = requireTargets(argv.filter(a => !a.startsWith('--')));
const widths = (argv.find(a => a.startsWith('--widths=')) || '--widths=320,390,1280').split('=')[1].split(',').map(Number);
const dark = argv.includes('--dark');

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

const AUDIT = ({ MIN, LABEL_MIN }) => {
  const CONTROL = 'button,input,textarea,select,[role=button],[role=tab],[role=combobox],[role=switch],[role=checkbox],[role=radio],a.btn,.btn';
  const SECTIONING = 'section,header,footer,main,nav,aside,article';
  const NOT_ROWS = 'table,svg,p,h1,h2,h3,h4,h5,h6,[role=img],[role=table],[role=grid],[role=row],[role=presentation],[role=listbox],[role=menu],[role=tablist]';
  const NOT_JUDGED = 'table,thead,tbody,tfoot,tr,ul,ol,dl,svg,p,h1,h2,h3,h4,h5,h6,[role=img],[role=table],[role=grid],[role=row],[role=presentation]';
  const name = (el) => {
    const c = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : c ? '.' + c : ''}${t ? ` "${t}"` : ''}`;
  };
  const shown = (el) => {
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.display !== 'inline' && s.display !== 'contents'
      && s.visibility !== 'hidden' && Number(s.opacity) > 0 && s.position !== 'absolute' && s.position !== 'fixed';
  };
  const srOnly = (el) => {
    const r = el.getBoundingClientRect();
    return r.width <= 1 || r.height <= 1 || /(^|\s)(sr-only|visually-hidden)(\s|$)/.test(el.getAttribute('class') || '');
  };
  // A box the eye can see: a border on every side, or a fill unlike what is
  // painted behind it. "Behind it" is the nearest ancestor that paints, not the
  // parent: a transparent parent says nothing about the colour underneath.
  const behind = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const c = getComputedStyle(a).backgroundColor;
      if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
    }
    return 'rgb(255, 255, 255)';
  };
  const drawsBox = (el) => {
    const s = getComputedStyle(el);
    const border = ['Top', 'Right', 'Bottom', 'Left'].every(k => parseFloat(s['border' + k + 'Width']) > 0 && s['border' + k + 'Style'] !== 'none');
    const fill = s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent' && s.backgroundColor !== behind(el);
    return border || fill;
  };
  const isControl = (el) => el.matches(CONTROL);
  const hiddenText = (n, root) => {
    for (let a = n.parentElement; a && a !== root.parentElement; a = a.parentElement) if (srOnly(a) || !shownAny(a)) return true;
    return false;
  };
  const shownAny = (el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden'; };
  // Text cut off by an ellipsis or a scroller is not on screen past the cut.
  const clip = (start, root, r) => {
    let left = r.left, right = r.right, top = r.top, bottom = r.bottom;
    for (let a = start; a && a !== root.parentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const b = a.getBoundingClientRect();
      if (s.overflowX !== 'visible') { left = Math.max(left, b.left); right = Math.min(right, b.right); }
      if (s.overflowY !== 'visible') { top = Math.max(top, b.top); bottom = Math.min(bottom, b.bottom); }
    }
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  };
  const seenRect = (el) => {
    const rs = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = walk.nextNode());) {
      if (!n.textContent.trim() || hiddenText(n, el)) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        const c = clip(n.parentElement, el, r);
        if (c.width > 0 && c.height > 0) rs.push(c);
      }
    }
    for (const d of el.querySelectorAll('*')) {
      if (!shownAny(d) || srOnly(d)) continue;
      if (isControl(d) || drawsBox(d) || d.matches('img,svg,video,canvas')) {
        if (d.parentElement && d.parentElement.closest('svg')) continue;
        const r = d.getBoundingClientRect(); if (r.width > 0 && r.height > 0) rs.push(r);
      }
    }
    return rs;
  };
  const textRect = (el) => {
    const rs = seenRect(el);
    if (!rs.length) return el.getBoundingClientRect();
    const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top));
    const r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
    return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t };
  };
  // Text a sighted reader sees: screen-reader-only text does not make a chart cell a neighbour.
  const seenText = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = walk.nextNode());) {
      if (!n.textContent.trim()) continue;
      let hidden = false;
      for (let a = n.parentElement; a && a !== el.parentElement; a = a.parentElement) if (srOnly(a)) { hidden = true; break; }
      if (!hidden) return true;
    }
    return false;
  };
  const labels = (x, y) => {
    const ids = (y.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
    return (x.matches('label') && (x.htmlFor ? x.htmlFor === y.id : x.contains(y)))
      || (x.id && ids.includes(x.id))
      || (y.querySelector && [...y.querySelectorAll('[aria-labelledby]')].some(z => z.getAttribute('aria-labelledby').split(/\s+/).includes(x.id)));
  };
  const spansRows = (el) => /span\s*([2-9]|\d{2,})/.test(getComputedStyle(el).gridRowEnd) || /span\s*([2-9]|\d{2,})/.test(getComputedStyle(el).gridRowStart);

  const rows = [], touching = [];
  for (const parent of document.querySelectorAll('body *')) {
    if (parent.closest(CONTROL) || !shown(parent)) continue;
    // A list of cards is still a row of cards: rows are judged in ul and ol too.
    // Touching is not, since list rows stack by design.
    const listOnly = parent.closest(NOT_JUDGED);
    if (listOnly && (parent.closest(NOT_ROWS) || !parent.matches('ul,ol'))) continue;
    const pr = parent.getBoundingClientRect();
    const kids = [...parent.children].filter(el => shown(el) && !srOnly(el)).map(el => {
      const own = drawsBox(el) || isControl(el);
      const box = own || !!el.querySelector(CONTROL);
      const pieces = own ? [el.getBoundingClientRect()] : seenRect(el);
      return { el, box, r: own ? el.getBoundingClientRect() : textRect(el), pieces: pieces.length ? pieces : [el.getBoundingClientRect()], text: seenText(el) };
    }).filter(k => k.r.width > 4 && k.r.height > 4 && (k.text || isControl(k.el)));

    // A. rows of boxed cards
    const byTop = new Map();
    for (const k of kids) {
      if (!drawsBox(k.el) || isControl(k.el) || k.r.width < 60 || k.r.height < 40 || spansRows(k.el)) continue;
      const key = Math.round(k.r.top / 3);
      (byTop.get(key) || byTop.set(key, []).get(key)).push(k);
    }
    for (const row of byTop.values()) {
      if (row.length < 2) continue;
      const hs = row.map(k => Math.round(k.r.height));
      if (Math.max(...hs) - Math.min(...hs) > 2) rows.push(`${name(parent)} > ${row.map((k, i) => `${name(k.el)} ${hs[i]}px`).join(' | ')}`);
    }

    // A, mixed rows: a boxed card beside a card that draws no box of its own but
    // carries a picture or a boxed part (a product card, a map). Both sit in one
    // grid or flex row, so both end where the row ends. Compared by the layout box,
    // margins included, so a card pushed down by a margin still counts as that row.
    // Not judged: a sticky column, which has to sit at the start to stick, and a
    // plain text column beside a card, which is copy, not a card.
    const ps = getComputedStyle(parent);
    if (ps.display.includes('grid') || (ps.display.includes('flex') && !ps.flexDirection.startsWith('column'))) {
      const edge = (k) => {
        const s = getComputedStyle(k.el), r = k.el.getBoundingClientRect();
        return { top: r.top - parseFloat(s.marginTop), bottom: r.bottom + parseFloat(s.marginBottom) };
      };
      const cardish = (k) => {
        const s = getComputedStyle(k.el);
        if (s.position === 'sticky' || isControl(k.el) || spansRows(k.el)) return false;
        const r = k.el.getBoundingClientRect();
        if (r.width < 60 || r.height < 40) return false;
        // A picture or a boxed part big enough to be the card's own: not an icon, a
        // badge or a button.
        const big = (d) => { const q = d.getBoundingClientRect(); return q.width >= 60 && q.height >= 40; };
        return drawsBox(k.el) ? 'box'
          : [...k.el.querySelectorAll('*')].some(d => shownAny(d) && !isControl(d) && !d.closest(CONTROL) && !(d.parentElement && d.parentElement.closest('svg'))
              && (d.matches('img,svg,video,canvas,picture') || drawsBox(d)) && big(d)) ? 'media' : false;
      };
      const ks = kids.map(k => ({ k, kind: cardish(k), e: edge(k) })).filter(x => x.kind);
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
        const a = ks[i], c = ks[j];
        if (a.kind === 'box' && c.kind === 'box') continue;             // judged above
        if (a.kind !== 'box' && c.kind !== 'box') continue;             // no card to judge
        if (Math.abs(a.e.top - c.e.top) > 3) continue;                  // not one row
        const d = Math.round(Math.abs(a.e.bottom - c.e.bottom));
        if (d > 2) rows.push(`${name(parent)} > ${name(a.k.el)} ends ${d}px from ${name(c.k.el)} in the same row`);
      }
    }

    if (listOnly) continue;

    // B. touching. Segments of one control may join inside the box drawing them.
    if (drawsBox(parent) && kids.length && kids.every(k => isControl(k.el))) continue;
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i], c = kids[j];
      if (!a.box && !c.box) continue;                                   // text beside text is the type's job
      if (a.r.width >= pr.width - 2 && c.r.width >= pr.width - 2) continue; // full-width bands
      if (a.el.matches(SECTIONING) && c.el.matches(SECTIONING)) continue;   // page structure
      let gap = null, axis = '';
      for (const pa of a.pieces) for (const pc of c.pieces) {
        const xo = Math.min(pa.right, pc.right) - Math.max(pa.left, pc.left);
        const yo = Math.min(pa.bottom, pc.bottom) - Math.max(pa.top, pc.top);
        let g = null, ax = '';
        if (xo > 4 && yo <= 0) { g = Math.max(pc.top - pa.bottom, pa.top - pc.bottom); ax = 'stacked'; }
        else if (yo > 4 && xo <= 0) { g = Math.max(pc.left - pa.right, pa.left - pc.right); ax = 'side by side'; }
        if (g !== null && g >= 0 && (gap === null || g < gap)) { gap = g; axis = ax; }
      }
      const min = (labels(a.el, c.el) || labels(c.el, a.el)) ? LABEL_MIN : MIN;
      if (gap !== null && gap >= 0 && gap < min) touching.push(`${axis} ${gap.toFixed(1)}px (min ${min}): ${name(a.el)} / ${name(c.el)}`);
    }
  }

  return { rows: [...new Set(rows)], touching: [...new Set(touching)] };
};

const browser = await launchOrSkip(chromium, 'verify_spacing', { fallback: false });
const fails = [];
for (const f of files) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce' });
    await page.goto('file://' + f);
    if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const r = await page.evaluate(AUDIT, { MIN: 8, LABEL_MIN: 4 });
    const at = `${f.split('/').pop()} @${w}px`;
    for (const m of r.rows) fails.push(`${at}  [A unequal row]  ${m}`);
    for (const m of r.touching) fails.push(`${at}  [B touching]  ${m}`);
    await page.close();
  }
}
await browser.close();

const label = `${widths.join('/')}px${dark ? ' (dark)' : ''}`;
if (fails.length) {
  console.log(`verify_spacing: FAIL (${label})`);
  for (const m of fails) console.log('  x ' + m);
  process.exit(1);
}
console.log(`verify_spacing: OK: ${files.length} file(s) @${label}: rows of cards share a height, nothing touches`);
