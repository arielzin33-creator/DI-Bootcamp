/**
 * script.js — Drum Set
 *
 * Pattern (from the assignment):
 *   var x = document.getElementById("sounds");
 *   x.play();
 *
 * For each key / click we:
 *   1. Get the keyCode (keyboard) or data-key attribute (mouse click).
 *   2. Use document.getElementById(keyCode) to grab the matching <audio>.
 *   3. Call .play() on it — exactly like the example above.
 */

'use strict';

// ─── 1. Play a sound by keyCode ──────────────────────────────────────────────

function playAudio(keyCode) {
    // Mirrors: var x = document.getElementById("sounds");
    var x = document.getElementById(keyCode);

    if (!x) return; // no audio element mapped to this key — do nothing

    // Rewind so hitting the same pad rapidly replays from the start
    x.currentTime = 0;

    // Mirrors: x.play();
    x.play();

    flashPad(keyCode);
}

// ─── 2. Visual feedback ──────────────────────────────────────────────────────

function flashPad(keyCode) {
    var pad = document.querySelector('.drum-pad[data-key="' + keyCode + '"]');
    if (!pad) return;

    pad.classList.add('active');
    setTimeout(function () {
        pad.classList.remove('active');
    }, 150);
}

// ─── 3. Keyboard events ──────────────────────────────────────────────────────
// e.keyCode gives us the numeric code (e.g. 65 for A).
// The <audio> elements have id="65", id="83" … matching those codes.

document.addEventListener('keydown', function (e) {
    playAudio(String(e.keyCode));
});

// ─── 4. Mouse click events ───────────────────────────────────────────────────
// Each button has data-key="65" etc., the same value as the audio id.
// "this" inside the listener refers to the clicked button.

var pads = document.querySelectorAll('.drum-pad');

pads.forEach(function (pad) {
    pad.addEventListener('click', function () {
        var keyCode = this.dataset.key; // read data-key from "this" element
        playAudio(keyCode);
    });
});
