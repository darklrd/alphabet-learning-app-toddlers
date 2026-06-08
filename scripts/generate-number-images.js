#!/usr/bin/env node
/*
 * Generate clean, child-friendly counting images for Numbers mode (1-10).
 *
 * Each image shows a big numeral, that many gold stars in a tidy grid, and the
 * word — so the picture itself teaches quantity. Output is deterministic and
 * fully self-contained (no external/internet content), which is exactly what a
 * young-children app needs.
 *
 * Pipeline (no third-party deps): build an SVG -> rasterize with macOS Quick
 * Look (`qlmanage`) -> convert PNG to JPEG with `sips`. Files are written to
 * public/images/numbers/<N>-<word>.jpg, matching src/constants/numbersData.js.
 *
 * Usage: npm run generate:numbers   (or: node scripts/generate-number-images.js)
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SIZE = 800; // square canvas (Quick Look squares the output anyway)
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'numbers');

// number -> word (must match numbersData.js) + a cheerful background gradient.
const NUMBERS = [
  { n: 1, word: 'one', colors: ['#FF6B6B', '#FF8E53'] },
  { n: 2, word: 'two', colors: ['#4FACFE', '#00F2FE'] },
  { n: 3, word: 'three', colors: ['#43E97B', '#38F9D7'] },
  { n: 4, word: 'four', colors: ['#FA709A', '#FEE140'] },
  { n: 5, word: 'five', colors: ['#667EEA', '#764BA2'] },
  { n: 6, word: 'six', colors: ['#F093FB', '#F5576C'] },
  { n: 7, word: 'seven', colors: ['#30CFD0', '#330867'] },
  { n: 8, word: 'eight', colors: ['#FF9A9E', '#FAD0C4'] },
  { n: 9, word: 'nine', colors: ['#A18CD1', '#FBC2EB'] },
  { n: 10, word: 'ten', colors: ['#0BA360', '#3CBA92'] },
];

// SVG path for a 5-pointed star centered at (cx, cy) with outer radius r.
function starPath(cx, cy, r) {
  const inner = r * 0.42;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2; // start at the top point
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

// Lay out `count` stars in a centered grid (max 5 per row) within a band.
function starsSvg(count) {
  const cols = Math.min(count, 5);
  const rows = Math.ceil(count / cols);
  const bandTop = 250;
  const bandHeight = 360;
  const cellW = SIZE / cols;
  const cellH = bandHeight / rows;
  const r = Math.min(cellW, cellH) * 0.34;

  let out = '';
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const inThisRow = Math.min(cols, count - row * cols);
    const col = i - row * cols;
    // center the last (possibly shorter) row
    const rowOffset = (cols - inThisRow) * cellW / 2;
    const cx = rowOffset + cellW * (col + 0.5);
    const cy = bandTop + cellH * (row + 0.5);
    out +=
      `<path d="${starPath(cx, cy, r)}" fill="#FFD23F" ` +
      `stroke="#E8A100" stroke-width="${(r * 0.08).toFixed(1)}" stroke-linejoin="round"/>`;
  }
  return out;
}

function buildSvg({ n, word, colors }) {
  const [c1, c2] = colors;
  const label = word.charAt(0).toUpperCase() + word.slice(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <text x="${SIZE / 2}" y="190" font-family="Arial, sans-serif" font-size="200" font-weight="bold"
        fill="#ffffff" text-anchor="middle">${n}</text>
  ${starsSvg(n)}
  <text x="${SIZE / 2}" y="720" font-family="Arial, sans-serif" font-size="96" font-weight="bold"
        fill="#ffffff" text-anchor="middle">${label}</text>
</svg>`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'numimg-'));

  let ok = 0;
  for (const item of NUMBERS) {
    const svgPath = path.join(tmp, `${item.n}.svg`);
    const pngPath = `${svgPath}.png`;
    const outPath = path.join(OUT_DIR, `${item.n}-${item.word}.jpg`);
    try {
      fs.writeFileSync(svgPath, buildSvg(item));
      // Quick Look rasterizes the SVG -> <name>.svg.png in the tmp dir.
      execFileSync('qlmanage', ['-t', '-s', String(SIZE), '-o', tmp, svgPath], { stdio: 'ignore' });
      if (!fs.existsSync(pngPath)) throw new Error('qlmanage produced no PNG');
      execFileSync('sips', ['-s', 'format', 'jpeg', pngPath, '--out', outPath], { stdio: 'ignore' });
      console.log(`  ✅ ${item.n}-${item.word}.jpg`);
      ok++;
    } catch (err) {
      console.error(`  ⚠️  failed for ${item.n} (${item.word}): ${err.message}`);
    }
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDone: ${ok}/${NUMBERS.length} counting images written to public/images/numbers/`);
  if (ok < NUMBERS.length) process.exitCode = 1;
}

main();
