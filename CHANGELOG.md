# Changelog

## 1.0.1 - 2026-09-29

- **Presets that carry their own eases** (Micro) now show as their own keyframes - two points
  for Micro instead of nine - with the speed they play drawn between them, and are written
  key for key, each with its ease. Moving a point turns them into an ordinary point curve.
- **Slow-mo on beat** finds the slow moment of such a preset along its curve, so Micro goes
  onto the beat again.
- **The category and Length lists** no longer open wider than the panel after it has been
  made narrower (their list kept the widest width the panel ever had).
- Tooltips list the Edits and Zoom categories.

## 1.0 - 2026-09-28

First release.

- **Keyframes tab:** a curve editor with two handles, the curve as four numbers (paste
  `cubic-bezier` values), Apply to Keyframes on any selected keyframe pairs, Read from Keys,
  and presets - Essentials, Classic In / Out / In Out, Edit, Zoom and eight places for your
  own.
- **Speed tab:** a speed curve for video and precomp layers, written as Time Remap
  keyframes; Keep clip length or Keep all frames; Slow-mo on beat (onto the nearest marker,
  such as BeatDrop's); Smooth frames (Pixel Motion); Read from Layer; Popular, Edits
  (Micro and other edit ramps), Basic and your own presets.
- The panel fits narrow docked columns: presets go two to a row, and the logo and labels
  switch to smaller, sharp versions.
- Navy glass look, as BeatDrop's. made by Admiral.
