#!/usr/bin/env node
/**
 * THAI TEXT gate. Three faults the design critic found on the Thai example pages
 * that every other gate passed, because they live in where the browser breaks a
 * line and where the ink of one line lands on the next:
 *
 *   A. COMPOUND SPLIT  a compound word broken across two lines: ใบ / อนุญาต,
 *                      เจ้า / หน้าที่. Chrome breaks Thai with ICU's dictionary,
 *                      and that dictionary holds the parts, not the compound, so
 *                      the split is a legal break to the browser and a misreading
 *                      to a Thai reader. The gate knows the compounds in COMPOUNDS
 *                      below and no others: a name (a place, a person) cannot be
 *                      known to it, so the critic still reads those.
 *   B. NUMBER SPLIT    a number left on one line and its classifier or unit on the
 *                      next (23 / คน, สิบ / เก้าวัน), or a prefix cut from its
 *                      number (พ.ศ. / 2569).
 *   C. MARK COLLISION  the lines sit too close for Thai. A Thai line needs room
 *                      above for a consonant, an above vowel and a tone mark (ที่,
 *                      นี้) and room below for a below vowel (ุ). When the room one
 *                      line needs below reaches the room the next needs above, the
 *                      tone marks of the lower line land where the upper line keeps
 *                      its below vowels, and a reader takes ร้ under ต่ for ตุ่. The
 *                      ink need not touch for that: on the first gov page at 1.3 it
 *                      cleared by 12px and still read as one line. Measured with
 *                      canvas in the page's own loaded font, so the answer is the
 *                      font's: Sukhumvit Set needs about 1.35, Noto Sans Thai about 1.49.
 *
 * Also caught under A, with no list: a line that ends on ความ, การ, ผู้ or ชาว,
 * which only ever start a word (ความ / หมาย); and a break between two Thai
 * characters inside one dictionary word, which Chrome only makes when told to
 * (overflow-wrap:anywhere, word-break).
 *
 * The fix for A and B is the same: keep the pair on one line with a span set to
 * white-space:nowrap (the example pages call it .keep), including in strings a
 * script builds. The fix for C is the leading: Thai display type needs about 1.45,
 * and no negative letter-spacing on Thai.
 *
 * Usage: node scripts/verify_thai.mjs <file.html | dir> [--widths=320,390,768,1280]
 *
 * Only blocks that contain Thai are read. A page without Thai passes untouched.
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
  console.log(`verify_thai: playwright not installed: ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const targets = requireTargets(argv.filter(a => !a.startsWith('--')));
const widths = (argv.find(a => a.startsWith('--widths=')) || '--widths=320,390,768,1280').split('=')[1].split(',').map(Number);

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

// Compounds a Thai reader takes as one word and ICU's dictionary splits. Only
// unambiguous ones: ที่อยู่ is "address" and also "that is at", and วันที่ is "date"
// and also "the day that", so neither is here.
const COMPOUNDS = `
ใบอนุญาต ใบขับขี่ ใบเสร็จ ใบรับรอง ใบสมัคร ใบแจ้งหนี้ ใบสั่ง ใบหน้า หมดอายุ ต่ออายุ
เจ้าหน้าที่ เจ้าของ เจ้าภาพ ค่าธรรมเนียม ค่าบริการ ค่าใช้จ่าย ค่าจัดส่ง ค่าส่ง ค่าอาหาร
ค่าเช่า ค่าปรับ ค่าแรง ค่าจ้าง คำตอบ คำถาม คำขอ คำสั่ง คำแนะนำ คำอธิบาย คำเตือน
เครื่องมือ เครื่องดื่ม เครื่องเสียง เครื่องใช้ เครื่องหมาย เครื่องแบบ เครื่องปรุง
หน่วยงาน หน่วยความจำ บัตรประชาชน บัตรประจำตัว บัตรเครดิต บัตรคิว เลขประจำตัว
โทรศัพท์ ไปรษณีย์ อีเมล รหัสผ่าน รหัสไปรษณีย์ ชื่อผู้ใช้ ผู้ใช้งาน ผู้ใช้ ผู้สมัคร
ผู้ยื่นคำขอ ผู้ขอ ผู้รับ ผู้ส่ง ผู้ซื้อ ผู้ขาย ผู้เขียน ผู้อ่าน ผู้ชม ผู้คน ผู้ป่วย ผู้สูงอายุ
ผู้ใหญ่ บ้านเรือน หมู่บ้าน ครัวเรือน ครอบครัว โรงเรียน โรงพยาบาล โรงงาน โรงแรม ร้านอาหาร
ร้านค้า ห้องน้ำ ห้องครัว ห้องสมุด ห้องประชุม ที่นั่ง สำนักงาน
ทะเบียนบ้าน ทะเบียนราษฎร์ หนังสือเดินทาง หนังสือรับรอง หนังสือมอบอำนาจ
เอกสาร หลักฐาน ลายมือชื่อ ลายเซ็น วันหมดอายุ วันเกิด วันหยุด วันทำการ
เวลาทำการ ชั่วโมง นาฬิกา ตะกร้าสินค้า สินค้า รถยนต์ รถจักรยานยนต์ รถไฟ รถเมล์
น้ำปลา น้ำตาล น้ำมัน น้ำพริก ข้าวเหนียว ข้าวผัด ต้มยำ แกงเขียวหวาน ส้มตำ
แผ่นดิน ภาษาไทย ประเทศไทย กรุงเทพ ราชการ รัฐบาล ประชาชน สาธารณะ ออนไลน์
ล้มเหลว เข้าถึง ต่อมา ประเภทกิจการ บ้านเรือน
วันจันทร์ วันอังคาร วันพุธ วันพฤหัสบดี วันศุกร์ วันเสาร์ วันอาทิตย์
`.trim().split(/\s+/);

// A number word or a digit is never left at a line end with the word that counts.
const NUMBER_WORDS = 'ศูนย์ หนึ่ง สอง สาม สี่ ห้า หก เจ็ด แปด เก้า สิบ ยี่สิบ เอ็ด ร้อย พัน หมื่น แสน ล้าน ครึ่ง'.split(' ');
const CLASSIFIERS = `
คน ท่าน ราย บาท สตางค์ วัน คืน เดือน ปี ชั่วโมง ชม. นาที วินาที สัปดาห์ ครั้ง รอบ
ฉบับ แผ่น ใบ เล่ม ชิ้น อัน ตัว ข้อ หน้า แห่ง หลัง ห้อง ชั้น จาน ถ้วย แก้ว ขวด ที่นั่ง
กิโลเมตร กม. เมตร ซม. เซนติเมตร มิลลิเมตร กิโลกรัม กก. กรัม ลิตร มล. ไร่ ตารางวา
ตารางเมตร เปอร์เซ็นต์ องศา คัน ลำ เครื่อง ชุด คู่ โหล กล่อง ถุง ห่อ ซอง ชนิด ประเภท แบบ
อย่าง เรื่อง บท ตอน คำ ด้าน สาย เส้น ต้น ดอก ลูก เม็ด ช้อน นัด ระดับ ขั้น เท่า ส่วน
ครัวเรือน หลังคาเรือน จังหวัด อำเภอ ตำบล หมู่บ้าน ขวบ เดือนก่อน ปีก่อน
`.trim().split(/\s+/);
// A line never ends on a prefix that makes a noun of the word after it: ความ|หมาย,
// การ|ศึกษา, ผู้|ใช้, ชาว|บ้าน. This needs no list of compounds, because the prefix
// never stands alone.
const BOUND = ['ความ', 'การ', 'ผู้', 'ชาว'];
const PREFIXES = 'พ.ศ. ค.ศ. ร้อยละ มาตรา ข้อ ฉบับที่ ครั้งที่ ที่ หมายเลข เลขที่ หมู่ที่ ซอย'.split(' ');

const AUDIT = ({ COMPOUNDS, BOUND, CLASSIFIERS, NUMBER_WORDS, PREFIXES }) => {
  const THAI = /[\u0E00-\u0E7F]/;
  const LOOSE = ['หนึ่ง', 'ครึ่ง'];
  const SEP = '\u0000';
  const SKIP = 'script,style,noscript,template,svg,textarea,select,option,code,pre,kbd,samp';
  const name = (el) => {
    const c = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : c ? '.' + c : ''}`;
  };
  const style = new Map();
  const cs = (el) => { let s = style.get(el); if (!s) { s = getComputedStyle(el); style.set(el, s); } return s; };
  const isBlock = (el) => !['inline', 'contents'].includes(cs(el).display);
  const blockOf = (el) => { while (el && el !== document.body && !isBlock(el)) el = el.parentElement; return el || document.body; };

  const blocks = new Set();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const p = n.parentElement;
    if (!p || !THAI.test(n.data) || p.closest(SKIP)) continue;
    blocks.add(blockOf(p));
  }

  const words = new Intl.Segmenter('th', { granularity: 'word' });
  const graphemes = new Intl.Segmenter('th', { granularity: 'grapheme' });
  const canvas = document.createElement('canvas').getContext('2d');
  const ink = new Map();
  const measure = (el, text) => {
    const s = cs(el);
    const font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const key = font + '\u0001' + text;
    let m = ink.get(key);
    if (!m) {
      // font travels with the metrics so the glyph can be drawn again below
      canvas.font = font;
      const t = canvas.measureText(text);
      m = { font, asc: t.actualBoundingBoxAscent, desc: t.actualBoundingBoxDescent,
            left: t.actualBoundingBoxLeft, right: t.actualBoundingBoxRight, fasc: t.fontBoundingBoxAscent };
      ink.set(key, m);
    }
    return m;
  };
  // How far a full Thai line reaches in this font: the common stacks ที่ and นี้
  // above the baseline and the below vowels ุ and ู under it. Rarer glyphs (ฎุ, ปั๊)
  // reach further, and the line's own ink is counted too wherever they occur.
  const bands = new Map();
  const band = (g) => {
    let v = bands.get(g.font);
    if (!v) {
      canvas.font = g.font;
      const up = (s) => canvas.measureText(s).actualBoundingBoxAscent, dn = (s) => canvas.measureText(s).actualBoundingBoxDescent;
      v = { above: Math.max(up('ที่'), up('นี้')), below: Math.max(dn('กุ'), dn('กู')) };
      bands.set(g.font, v);
    }
    return v;
  };
  const show = (s) => s.replace(/\s+/g, ' ').split(SEP).join(' ');

  const splits = [], numbers = [], collisions = [];
  for (const b of blocks) {
    const br = b.getBoundingClientRect();
    if (br.width <= 2 || br.height <= 2) continue;                    // sr-only
    if (/^pre/.test(cs(b).whiteSpace) || cs(b).visibility === 'hidden') continue;

    // The block's own text, in order. A nested block, a <br> or anything skipped
    // becomes a separator, so text either side of it is never read as adjacent.
    let str = '';
    const at = [];
    const visit = (el) => {
      for (const c of el.childNodes) {
        if (c.nodeType === 3) { for (let i = 0; i < c.data.length; i++) at.push([c, i]); str += c.data; }
        else if (c.nodeType === 1) {
          if (c.matches(SKIP) || c.tagName === 'BR' || isBlock(c)) { str += SEP; at.push(null); continue; }
          visit(c);
        }
      }
    };
    visit(b);
    if (!THAI.test(str)) continue;

    const bounds = new Set([0, str.length]);
    for (const s of words.segment(str)) { bounds.add(s.index); bounds.add(s.index + s.segment.length); }
    const wordAt = (i, w) => str.startsWith(w, i) && bounds.has(i) && bounds.has(i + w.length);

    // Every visible character, with its box and its ink.
    const gs = [];
    const range = document.createRange();
    for (const g of graphemes.segment(str)) {
      const i = g.index, L = g.segment.length;
      if (/^\s+$/.test(g.segment) || g.segment === SEP) continue;
      const a = at[i], z = at[i + L - 1];
      if (!a || !z || a[0] !== z[0]) continue;
      range.setStart(a[0], a[1]); range.setEnd(a[0], a[1] + L);
      const r = range.getClientRects()[0];
      if (!r || r.width === 0 || r.height === 0) continue;
      const el = a[0].parentElement;
      if (cs(el).visibility === 'hidden') continue;
      const m = measure(el, g.segment);
      const base = r.top + m.fasc;
      gs.push({ i, L, text: g.segment, r, el, font: m.font, base,
        top: base - m.asc, bottom: base + m.desc, left: r.left - m.left, right: r.left + m.right });
    }

    // Lines: the next character sits lower and starts left of where the last ended.
    const lines = [];
    let line = null, prev = null;
    for (const g of gs) {
      if (prev && g.r.top > prev.r.top + prev.r.height * 0.5 && g.r.left < prev.r.right - 1) {
        // A break the browser chose, not one the markup forced.
        const gap = str.slice(prev.i + prev.L, g.i);
        if (!gap.includes(SEP)) {
          const cut = prev.i + prev.L;                      // where the left line's text ends
          const resume = g.i;                               // where the next line's text starts
          const ctx = `${show(str.slice(Math.max(0, cut - 14), cut)).trimStart()}|${show(str.slice(resume, resume + 14)).trimEnd()}`;
          // A. compound split, or a Thai word cut between two of its own letters
          if (!gap.length) {
            const hit = COMPOUNDS.find(w => { for (let k = 1; k < w.length; k++) if (wordAt(cut - k, w)) return true; return false; });
            const bound = !hit && THAI.test(str[cut] || '') && BOUND.find(w => wordAt(cut - w.length, w));
            if (hit) splits.push(`${name(b)}: "${hit}" split across lines: "${ctx}"`);
            else if (bound) splits.push(`${name(b)}: "${bound}" left at a line end without its word: "${ctx}"`);
            else if (!bounds.has(cut) && THAI.test(str[cut - 1]) && THAI.test(str[cut]))
              splits.push(`${name(b)}: a word cut inside itself: "${ctx}"`);
          }
          // B. a number and the word that counts it, or a prefix and its number
          const left = str.slice(0, cut), right = str.slice(resume);
          const digitLeft = /[0-9\u0E50-\u0E59]$/.test(left);
          // หนึ่ง and ครึ่ง after a classifier mean "a" and "and a half" (เรื่องหนึ่ง,
          // ชั่วโมงครึ่ง): the count is already behind them, so they do not start one.
          const wordLeft = NUMBER_WORDS.find(w => !LOOSE.includes(w) && left.endsWith(w) && bounds.has(cut - w.length));
          const counted = (digitLeft || wordLeft) && !COMPOUNDS.some(w => wordAt(resume, w))
            && (CLASSIFIERS.find(w => wordAt(resume, w)) || NUMBER_WORDS.find(w => wordAt(resume, w)));
          const prefix = PREFIXES.find(w => left.endsWith(w) && bounds.has(cut - w.length));
          if (counted)
            numbers.push(`${name(b)}: "${counted}" left without its number: "${ctx}"`);
          else if (prefix && /^[0-9\u0E50-\u0E59]/.test(right))
            numbers.push(`${name(b)}: "${prefix}" cut from its number: "${ctx}"`);
        }
        line = null;
      }
      if (!line) { line = []; lines.push(line); }
      line.push(g);
      prev = g;
    }

    // C. each line's band: its ink, and for a Thai character the room the font
    // gives a full Thai line (ที่ and นี้ above, ุ below). Where the band of one line
    // reaches into the band of the next, a tone mark lands where the line above
    // keeps its below vowels and reads as part of that line. One finding per block.
    let worst = null;
    for (let n = 0; n + 1 < lines.length; n++) {
      let low = null, high = null;
      for (const g of lines[n]) {
        const y = Math.max(g.bottom, THAI.test(g.text) ? g.base + band(g).below : -Infinity);
        if (!low || y > low.y) low = { y, g };
      }
      for (const g of lines[n + 1]) {
        const y = Math.min(g.top, THAI.test(g.text) ? g.base - band(g).above : Infinity);
        if (!high || y < high.y) high = { y, g };
      }
      const over = low.y - high.y;
      if (over > 0.5 && (!worst || over > worst.over)) worst = { over, low, high };
    }
    if (worst) {
      const el = worst.high.g.el, fs = parseFloat(cs(el).fontSize), lh = parseFloat(cs(el).lineHeight);
      const fix = Number.isFinite(lh) ? `; line-height ${(lh / fs).toFixed(2)} needs at least ${((lh + worst.over) / fs).toFixed(2)}` : '';
      collisions.push(`${name(b)}: the Thai bands of two lines overlap by ${worst.over.toFixed(1)}px at "${worst.high.g.text}" (font ${fs}px${fix})`);
    }
  }
  return { splits: [...new Set(splits)], numbers: [...new Set(numbers)], collisions };
};

const browser = await launchOrSkip(chromium, 'verify_thai', { fallback: false });
const fails = [];
for (const f of files) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await page.goto('file://' + f);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const r = await page.evaluate(AUDIT, { COMPOUNDS, BOUND, CLASSIFIERS, NUMBER_WORDS, PREFIXES });
    const at = `${f.split('/').pop()} @${w}px`;
    for (const m of r.splits) fails.push(`${at}  [A compound split]  ${m}`);
    for (const m of r.numbers) fails.push(`${at}  [B number split]  ${m}`);
    for (const m of r.collisions) fails.push(`${at}  [C mark collision]  ${m}`);
    await page.close();
  }
}
await browser.close();

const label = `${widths.join('/')}px`;
if (fails.length) {
  console.log(`verify_thai: FAIL (${label})`);
  for (const m of fails) console.log('  x ' + m);
  process.exit(1);
}
console.log(`verify_thai: OK: ${files.length} file(s) @${label}: no listed compound or number split across lines, no two Thai lines too close`);
