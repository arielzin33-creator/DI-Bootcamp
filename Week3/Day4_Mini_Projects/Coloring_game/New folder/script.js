/**
 * script.js — Coloring Squares
 *
 * Core concepts used:
 *  - CSS Grid built dynamically in JS
 *  - mousedown  → start painting
 *  - mouseover  → paint while dragging (only when mouse is held down)
 *  - mouseup    → stop painting
 *  - Color chosen by clicking a palette swatch
 */

'use strict';

/* ── Palette colors ─────────────────────────────────────────────────────── */

var COLORS = [
  '#e63946', '#f4723b', '#f7a824', '#ffd166',
  '#a8d149', '#2dc653', '#06d6a0', '#4cc9f0',
  '#118ab2', '#3a86ff', '#7b5ea7', '#e040fb',
  '#ff6b9d', '#f4a261', '#ffffff', '#2b2b2b'
];

/* ── State ──────────────────────────────────────────────────────────────── */

var selectedColor = COLORS[0]; // currently active paint color
var isEraser      = false;     // eraser mode flag
var isPainting    = false;     // true while mouse button is held down

/* ── DOM refs ───────────────────────────────────────────────────────────── */

var paletteEl  = document.getElementById('palette');
var gridEl     = document.getElementById('drawing-grid');
var btnEraser  = document.getElementById('btn-eraser');
var btnClear   = document.getElementById('btn-clear');
var gridSize   = document.getElementById('grid-size');

/* ══════════════════════════════════════════════════════════════════════════
   1. BUILD THE PALETTE
   ══════════════════════════════════════════════════════════════════════════ */

function buildPalette() {
  paletteEl.innerHTML = '';

  COLORS.forEach(function (color) {
    var swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = color;
    swatch.title = color;

    // Mark the first swatch as selected on load
    if (color === selectedColor) {
      swatch.classList.add('selected');
    }

    // How does a user choose a color?
    // → Click a swatch: store the color, clear eraser mode, update UI.
    swatch.addEventListener('click', function () {
      selectedColor = color;
      isEraser = false;
      btnEraser.classList.remove('active');
      updateSelectedSwatch();
    });

    paletteEl.appendChild(swatch);
  });
}

function updateSelectedSwatch() {
  document.querySelectorAll('.swatch').forEach(function (s) {
    s.classList.toggle('selected', s.style.backgroundColor === hexToRgb(selectedColor) || s.title === selectedColor);
  });
}

// Browsers store backgroundColor as rgb(...), so convert hex for comparison
function hexToRgb(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

/* ══════════════════════════════════════════════════════════════════════════
   2. BUILD THE DRAWING GRID
   ══════════════════════════════════════════════════════════════════════════ */

function buildGrid(size) {
  gridEl.innerHTML = '';

  // Dynamically set grid columns and cell size via CSS
  gridEl.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';

  // Shrink cells for larger grids so the canvas stays a reasonable size
  var cellPx = size <= 10 ? 40 : size <= 20 ? 28 : size <= 30 ? 20 : 15;
  document.documentElement.style.setProperty('--cell-size', cellPx + 'px');

  // Create size × size cells
  var total = size * size;
  for (var i = 0; i < total; i++) {
    var cell = document.createElement('div');
    cell.className = 'cell';

    // ── Paint on click ───────────────────────────────────────────────────
    // mousedown on a cell: set isPainting = true, paint this cell
    cell.addEventListener('mousedown', function () {
      isPainting = true;
      paintCell(this);
    });

    // ── Paint while dragging ─────────────────────────────────────────────
    // mouseover fires when the mouse moves over a cell.
    // We only paint if isPainting is true (mouse button is held down).
    cell.addEventListener('mouseover', function () {
      if (isPainting) {
        paintCell(this);
      }
    });

    gridEl.appendChild(cell);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   3. PAINT A CELL
   ══════════════════════════════════════════════════════════════════════════ */

function paintCell(cell) {
  if (isEraser) {
    cell.style.backgroundColor = '#fff'; // erase → reset to white
  } else {
    cell.style.backgroundColor = selectedColor;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   4. GLOBAL MOUSE EVENTS  (mouseup)
   ══════════════════════════════════════════════════════════════════════════ */

// mouseup must be on the document, not individual cells,
// so releasing the button anywhere stops painting.
document.addEventListener('mouseup', function () {
  isPainting = false;
});

// Prevent the browser's default drag behavior (e.g. image ghost) on the grid
gridEl.addEventListener('dragstart', function (e) {
  e.preventDefault();
});

/* ══════════════════════════════════════════════════════════════════════════
   5. TOOLBAR BUTTONS
   ══════════════════════════════════════════════════════════════════════════ */

// Eraser: toggle eraser mode
btnEraser.addEventListener('click', function () {
  isEraser = !isEraser;
  btnEraser.classList.toggle('active', isEraser);

  // Visually deselect palette when eraser is on
  document.querySelectorAll('.swatch').forEach(function (s) {
    s.classList.toggle('selected', !isEraser && s.title === selectedColor);
  });
});

// Clear: reset every cell back to white
btnClear.addEventListener('click', function () {
  document.querySelectorAll('.cell').forEach(function (cell) {
    cell.style.backgroundColor = '#fff';
  });
});

// Grid size selector: rebuild the grid when a new size is chosen
gridSize.addEventListener('change', function () {
  buildGrid(parseInt(this.value));
});

/* ══════════════════════════════════════════════════════════════════════════
   6. INIT
   ══════════════════════════════════════════════════════════════════════════ */

buildPalette();
buildGrid(parseInt(gridSize.value)); // default: 20 × 20
