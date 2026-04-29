/**
 * usePixelArt — Iron Man × Holographic Brain Animation
 * ─────────────────────────────────────────────────────
 * Design principles (matching mmguo.dev/clawd aesthetic):
 * - Large canvas (560×380), no mask, full-width display
 * - Warm light background to match linen-white page (#EEEBE5)
 * - Iron Man sprite: 14×22 px grid, P=5 → 70×110 real px (clearly recognisable)
 * - Walk cycle: proper foot-bob (±2px Y) so he walks, not floats
 * - Holographic brain: large (50px grid wide), bright cyan glow
 * - Stark lab bg: light warm tones, subtle hologram panels, mechanical arm
 */

import { useEffect, useRef, type RefObject } from "react";

const P = 5; // 1 grid unit = 5 real pixels

// ── Color palette ────────────────────────────────────────────────────────────
const COL: Record<number, string> = {
  0: 'transparent',
  1: '#C8181A',  // red main
  2: '#8A0E10',  // red dark / shadow
  3: '#E8C030',  // gold main
  4: '#A07818',  // gold dark
  5: '#55CCFF',  // arc reactor / eye blue
  6: '#AAEEFF',  // arc reactor bright
  7: '#2A2A2A',  // near-black joint
  8: '#E0E0E0',  // silver highlight
  9: '#1A1A1A',  // black outline
};

type Row = number[];

// ── Iron Man Sprite: 14 wide × 22 tall ──────────────────────────────────────
// Helmet (rows 0-5), torso (6-13), legs (14-21)
const STAND: Row[] = [
  // Row 0-1: helmet top
  [0,0,0,9,9,9,9,9,9,0,0,0,0,0],
  [0,0,9,1,1,1,1,1,1,9,0,0,0,0],
  // Row 2-3: faceplate with eyes
  [0,9,2,1,1,1,1,1,1,2,9,0,0,0],
  [0,9,1,5,5,1,1,5,5,1,9,0,0,0],
  // Row 4-5: chin/jaw
  [0,9,1,1,3,3,3,3,1,1,9,0,0,0],
  [0,0,9,3,3,3,3,3,3,9,0,0,0,0],
  // Row 6-7: neck + shoulder pad
  [0,9,3,1,1,1,1,1,1,3,9,0,0,0],
  [9,1,1,1,1,1,1,1,1,1,1,9,0,0],
  // Row 8-9: chest with arc reactor
  [9,1,2,1,5,6,6,5,1,2,1,9,0,0],
  [9,1,2,1,6,6,6,6,1,2,1,9,0,0],
  // Row 10-11: lower chest
  [9,1,1,1,5,1,1,5,1,1,1,9,0,0],
  [9,1,3,1,1,1,1,1,1,3,1,9,0,0],
  // Row 12-13: waist + upper arm
  [0,9,1,1,1,1,1,1,1,1,9,0,0,0],
  [0,9,3,3,1,1,1,1,3,3,9,0,0,0],
  // Row 14-15: hip / upper legs
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  // Row 16-17: thighs
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  [0,0,9,2,1,0,0,1,2,9,0,0,0,0],
  // Row 18-19: knees
  [0,0,9,3,1,0,0,1,3,9,0,0,0,0],
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  // Row 20-21: feet
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  [0,9,3,3,2,0,0,2,3,3,9,0,0,0],
];

// Walk A: left foot forward, right foot back
const WALK_A: Row[] = [
  ...STAND.slice(0, 14),
  // hip
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  // left leg forward (shifted left+up), right leg back (shifted right+down)
  [0,9,1,1,0,0,0,0,1,1,9,0,0,0],
  [9,1,1,0,0,0,0,0,0,1,1,9,0,0],
  [9,1,1,0,0,0,0,0,1,1,9,0,0,0],
  [9,3,2,0,0,0,0,0,2,3,9,0,0,0],
  [9,3,3,0,0,0,0,1,1,9,0,0,0,0],
  [0,0,0,0,0,0,9,3,3,9,0,0,0,0],
];

// Walk B: right foot forward, left foot back
const WALK_B: Row[] = [
  ...STAND.slice(0, 14),
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  [0,0,9,1,1,0,0,1,1,9,0,0,0,0],
  // right leg forward, left leg back
  [0,0,9,1,1,0,0,0,1,1,9,0,0,0],
  [0,0,9,1,1,0,0,0,0,1,1,9,0,0],
  [0,0,9,1,1,0,0,0,1,1,9,0,0,0],
  [0,9,3,3,9,0,0,0,2,3,9,0,0,0],
  [9,1,1,9,0,0,0,0,0,0,0,0,0,0],
  [9,3,3,9,0,0,0,0,0,0,0,0,0,0],
];

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Row[],
  gx: number, gy: number,
  flipX: boolean,
  arcPulse: number,
) {
  const W = sprite[0].length;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < W; col++) {
      const code = sprite[row][flipX ? W - 1 - col : col];
      if (code === 0) continue;
      if (code === 5) {
        ctx.globalAlpha = 0.6 + arcPulse * 0.4;
        ctx.fillStyle = COL[5];
      } else if (code === 6) {
        ctx.globalAlpha = 0.8 + arcPulse * 0.2;
        ctx.fillStyle = COL[6];
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = COL[code] ?? '#FF0000';
      }
      ctx.fillRect((gx + col) * P, (gy + row) * P, P, P);
    }
  }
  ctx.globalAlpha = 1;
}

// ── Holographic Brain ────────────────────────────────────────────────────────
// Brain: solid filled pixel art, two lobes separated by a vertical sulcus at x=0
// Each entry: [dx, dy, brightness 0–1] where brightness drives color intensity
// Left lobe: x=-8..-1, Right lobe: x=1..8, Sulcus gap at x=0
const BRAIN_PIXELS: Array<[number, number, number]> = [
  // ── Left lobe ── (filled solid, brighter toward center)
  // Row -5 (top cap)
  [-5,-5,0.5],[-4,-5,0.6],[-3,-5,0.7],[-2,-5,0.6],[-1,-5,0.5],
  // Row -4
  [-7,-4,0.4],[-6,-4,0.55],[-5,-4,0.7],[-4,-4,0.85],[-3,-4,0.9],[-2,-4,0.85],[-1,-4,0.7],
  // Row -3
  [-7,-3,0.5],[-6,-3,0.65],[-5,-3,0.8],[-4,-3,0.95],[-3,-3,1.0],[-2,-3,0.95],[-1,-3,0.8],
  // Row -2 (sulcus groove — dimmer strip to simulate fold)
  [-7,-2,0.45],[-6,-2,0.6],[-5,-2,0.5],[-4,-2,0.4],[-3,-2,0.35],[-2,-2,0.4],[-1,-2,0.5],
  // Row -1
  [-8,-1,0.35],[-7,-1,0.55],[-6,-1,0.75],[-5,-1,0.9],[-4,-1,0.95],[-3,-1,0.9],[-2,-1,0.8],[-1,-1,0.7],
  // Row 0
  [-8,0,0.4],[-7,0,0.6],[-6,0,0.8],[-5,0,0.95],[-4,0,1.0],[-3,0,0.95],[-2,0,0.85],[-1,0,0.75],
  // Row 1 (another sulcus fold)
  [-8,1,0.4],[-7,1,0.55],[-6,1,0.45],[-5,1,0.35],[-4,1,0.4],[-3,1,0.5],[-2,1,0.65],[-1,1,0.7],
  // Row 2
  [-8,2,0.35],[-7,2,0.5],[-6,2,0.7],[-5,2,0.85],[-4,2,0.9],[-3,2,0.85],[-2,2,0.75],[-1,2,0.65],
  // Row 3
  [-7,3,0.4],[-6,3,0.55],[-5,3,0.65],[-4,3,0.7],[-3,3,0.65],[-2,3,0.55],[-1,3,0.45],
  // Row 4 (bottom)
  [-6,4,0.3],[-5,4,0.4],[-4,4,0.45],[-3,4,0.4],[-2,4,0.3],

  // ── Right lobe ── (mirror of left)
  [5,-5,0.5],[4,-5,0.6],[3,-5,0.7],[2,-5,0.6],[1,-5,0.5],
  [7,-4,0.4],[6,-4,0.55],[5,-4,0.7],[4,-4,0.85],[3,-4,0.9],[2,-4,0.85],[1,-4,0.7],
  [7,-3,0.5],[6,-3,0.65],[5,-3,0.8],[4,-3,0.95],[3,-3,1.0],[2,-3,0.95],[1,-3,0.8],
  [7,-2,0.45],[6,-2,0.6],[5,-2,0.5],[4,-2,0.4],[3,-2,0.35],[2,-2,0.4],[1,-2,0.5],
  [8,-1,0.35],[7,-1,0.55],[6,-1,0.75],[5,-1,0.9],[4,-1,0.95],[3,-1,0.9],[2,-1,0.8],[1,-1,0.7],
  [8,0,0.4],[7,0,0.6],[6,0,0.8],[5,0,0.95],[4,0,1.0],[3,0,0.95],[2,0,0.85],[1,0,0.75],
  [8,1,0.4],[7,1,0.55],[6,1,0.45],[5,1,0.35],[4,1,0.4],[3,1,0.5],[2,1,0.65],[1,1,0.7],
  [8,2,0.35],[7,2,0.5],[6,2,0.7],[5,2,0.85],[4,2,0.9],[3,2,0.85],[2,2,0.75],[1,2,0.65],
  [7,3,0.4],[6,3,0.55],[5,3,0.65],[4,3,0.7],[3,3,0.65],[2,3,0.55],[1,3,0.45],
  [6,4,0.3],[5,4,0.4],[4,4,0.45],[3,4,0.4],[2,4,0.3],

  // ── Corpus callosum (center bridge, dimmer) ──
  [0,-1,0.3],[0,0,0.35],[0,1,0.3],[0,2,0.25],

  // ── Brain stem ──
  [-1,5,0.4],[0,5,0.5],[1,5,0.4],
  [0,6,0.35],[0,7,0.25],
];

// Neural connection pairs (grid offsets) — connect within each lobe
const NEURAL_LINKS: Array<[number,number,number,number]> = [
  // Left lobe internal
  [-7,0,-5,2],[-6,-2,-4,0],[-5,-3,-3,-2],[-4,2,-2,1],
  [-6,3,-4,3],[-5,1,-3,2],[-7,2,-5,4],[-4,-3,-2,-2],
  // Cross-lobe (corpus callosum connections)
  [-2,0,2,0],[-1,1,1,1],[-1,-1,1,-1],
  // Right lobe internal
  [2,-2,4,0],[3,2,5,1],[4,-3,6,-1],[5,3,7,2],
  [6,2,8,2],[4,2,6,3],[3,-2,5,-3],[6,0,8,1],
];

function drawBrain(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  floatY: number, time: number,
) {
  const acy = cy + floatY;
  const pulse = 0.75 + 0.25 * Math.sin(time * 1.2);

  // Neural connections (drawn first, behind pixels)
  ctx.lineWidth = 1;
  for (const [dx1, dy1, dx2, dy2] of NEURAL_LINKS) {
    const spark = 0.15 + 0.55 * Math.sin(time * 2.5 + dx1 * 1.1 + dy2 * 1.7);
    if (spark <= 0.05) continue;
    ctx.globalAlpha = spark * pulse * 0.45;
    ctx.strokeStyle = '#38D8FF';
    ctx.beginPath();
    ctx.moveTo((cx + dx1) * P + P / 2, (acy + dy1) * P + P / 2);
    ctx.lineTo((cx + dx2) * P + P / 2, (acy + dy2) * P + P / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Brain pixels — now with per-pixel brightness from data
  for (let i = 0; i < BRAIN_PIXELS.length; i++) {
    const [dx, dy, bBase] = BRAIN_PIXELS[i];
    const flicker = pulse * (0.75 + 0.25 * Math.sin(time * 1.6 + i * 0.43 + dx * 0.25));
    const b = bBase * flicker;

    // Subtle outer glow
    ctx.globalAlpha = b * 0.15;
    ctx.fillStyle = '#20B8FF';
    ctx.fillRect((cx + dx) * P - 2, (acy + dy) * P - 2, P + 4, P + 4);

    // Core pixel — color shifts from deep blue (dim) to bright cyan (bright)
    const green = Math.round(120 + bBase * 120);
    const blue = 255;
    const red = Math.round(30 + bBase * 50);
    ctx.globalAlpha = Math.min(1, b * 0.9 + 0.1);
    ctx.fillStyle = `rgb(${red},${green},${blue})`;
    ctx.fillRect((cx + dx) * P, (acy + dy) * P, P, P);
  }
  ctx.globalAlpha = 1;
}

// ── Speech Bubble ────────────────────────────────────────────────────────────
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  ironGx: number, ironGy: number,
  facingLeft: boolean,
  time: number,
) {
  // Position bubble above and to the side Iron Man faces
  const bw = 72;
  const bh = 26;
  const bx = facingLeft
    ? (ironGx - 16) * P
    : (ironGx + 15) * P;
  const by = (ironGy - 8) * P;

  // Bubble body
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#E8F4FC';
  ctx.strokeStyle = '#90C8E8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(bx, by, bw, bh, 6);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();
  ctx.stroke();

  // Tail pointing toward Iron Man's head
  const tailX = facingLeft ? bx + bw - 10 : bx + 10;
  ctx.fillStyle = '#E8F4FC';
  ctx.strokeStyle = '#90C8E8';
  ctx.beginPath();
  ctx.moveTo(tailX - 6, by + bh);
  ctx.lineTo(tailX, by + bh + 10);
  ctx.lineTo(tailX + 6, by + bh);
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 1;

  // Animated dots
  const dotIdx = Math.floor(time * 2.2) % 3;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i <= dotIdx ? 0.85 : 0.2;
    ctx.fillStyle = '#1A5080';
    ctx.beginPath();
    ctx.arc(bx + 18 + i * 14, by + bh / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Stark Lab Background (light warm tones) ──────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  const floorY = Math.floor(H * 0.68);

  // Back wall — warm off-white (matches linen page)
  ctx.fillStyle = '#F0EDE6';
  ctx.fillRect(0, 0, W, floorY);

  // Floor — slightly darker warm tone
  ctx.fillStyle = '#E4DFD5';
  ctx.fillRect(0, floorY, W, H - floorY);

  // Floor grid (subtle, warm gray)
  ctx.lineWidth = 0.6;
  for (let x = 0; x <= W; x += P * 6) {
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#8090B0';
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = floorY; y <= H; y += P * 5) {
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = '#8090B0';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Wall panel lines
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#707880';
  ctx.lineWidth = 1;
  for (let x = P * 8; x < W - P * 4; x += P * 12) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Holographic screen — left wall (blue-tinted, semi-transparent)
  const s1 = 0.3 + 0.12 * Math.sin(time * 0.6);
  // Screen border
  ctx.globalAlpha = s1 * 0.7;
  ctx.strokeStyle = '#3080C8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(P * 2, P * 3, P * 16, P * 14);
  // Screen fill
  ctx.globalAlpha = s1 * 0.08;
  ctx.fillStyle = '#2060B0';
  ctx.fillRect(P * 2, P * 3, P * 16, P * 14);
  // Data lines
  for (let i = 0; i < 7; i++) {
    const lw = P * 3 + Math.sin(time * 1.0 + i * 0.9) * P * 3;
    ctx.globalAlpha = s1 * 0.45;
    ctx.fillStyle = '#4090D8';
    ctx.fillRect(P * 3, P * (5 + i * 1.7), lw, 1.5);
  }
  ctx.globalAlpha = 1;

  // Holographic screen — right wall
  const s2 = 0.25 + 0.1 * Math.sin(time * 0.45 + 1.2);
  ctx.globalAlpha = s2 * 0.6;
  ctx.strokeStyle = '#2870C0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(W - P * 20, P * 4, P * 15, P * 10);
  ctx.globalAlpha = s2 * 0.07;
  ctx.fillStyle = '#1850A0';
  ctx.fillRect(W - P * 20, P * 4, P * 15, P * 10);
  // Circular data viz
  const circX = W - P * 12, circY = P * 9;
  for (let r = 1; r <= 3; r++) {
    ctx.globalAlpha = s2 * 0.35;
    ctx.strokeStyle = '#3880D0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(circX, circY, P * r * 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ambient brain glow (soft blue halo around brain area)
  const brainGlowX = P * 16;
  const brainGlowY = P * 36;
  const grd = ctx.createRadialGradient(brainGlowX, brainGlowY, 0, brainGlowX, brainGlowY, P * 28);
  grd.addColorStop(0, 'rgba(30,130,220,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Mechanical arm (upper right)
  drawMechArm(ctx, W, time);
}

function drawMechArm(ctx: CanvasRenderingContext2D, W: number, time: number) {
  const sw = Math.sin(time * 0.35) * 8;

  const j0: [number,number] = [W - P * 5, 0];
  const j1: [number,number] = [W - P * 8 + sw * 0.3, P * 9];
  const j2: [number,number] = [W - P * 13 + sw * 0.6, P * 18];
  const j3: [number,number] = [W - P * 17 + sw, P * 26];

  ctx.lineCap = 'round';

  // Arm segments — warm dark gray
  const segs: Array<[[number,number],[number,number],number,string]> = [
    [j0, j1, P * 1.2, '#5A6070'],
    [j1, j2, P * 1.0, '#4A5060'],
    [j2, j3, P * 0.8, '#3A4050'],
  ];
  for (const [a, b, lw, col] of segs) {
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }

  // Joints
  for (const [jx, jy] of [j1, j2, j3]) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#6A7888';
    ctx.beginPath(); ctx.arc(jx, jy, P * 0.7, 0, Math.PI * 2); ctx.fill();
  }

  // Glowing end effector (cyan)
  ctx.globalAlpha = 0.4 + 0.3 * Math.sin(time * 2.0);
  ctx.fillStyle = '#50B8FF';
  ctx.beginPath(); ctx.arc(j3[0], j3[1], P * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ── Main animation hook ──────────────────────────────────────────────────────
// Canvas: 560 × 380
export function usePixelArt(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;   // 560
    const H = canvas.height;  // 380

    // Layout (grid units). Canvas = 560×380, P=5.
    // Floor at grid row ~50 (pixel 250). Brain on left, Iron Man on right.
    // Brain spans x: cx-8 to cx+8. Iron Man sprite is 14 wide.
    // Gap between brain right edge and Iron Man left edge: ~4 grid units
    const BRAIN_CX    = 30;   // brain center x — brain right edge at ~38
    const BRAIN_CY    = 30;   // brain center y — vertically centered in canvas
    const IRON_X_HOME = 44;   // Iron Man left edge — ~6 units gap from brain
    const IRON_Y_BASE = 22;   // Iron Man top (feet at ~row 44, floor at ~50)
    const WALK_DEST   = 68;   // Iron Man walks right to here

    const TALK_DUR = 7;
    const WALK_DUR = 5;

    type Phase = 'talking' | 'walking';
    let phase: Phase = 'talking';
    let phaseStart = 0;
    let time = 0;
    let lastTs = performance.now();

    let ironX = IRON_X_HOME;
    let flipX = true;   // true = faces left (toward brain)
    let walkFrame = 0;
    let walkBob = 0;    // vertical bob offset in real pixels

    const tick = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      time += dt;

      const phaseTime = time - phaseStart;

      // Phase transitions
      if (phase === 'talking' && phaseTime >= TALK_DUR) {
        phase = 'walking';
        phaseStart = time;
      } else if (phase === 'walking' && phaseTime >= WALK_DUR) {
        phase = 'talking';
        phaseStart = time;
        ironX = IRON_X_HOME;
        flipX = true;
        walkBob = 0;
      }

      // Iron Man movement + walk bob
      if (phase === 'walking') {
        const wp = Math.min((time - phaseStart) / WALK_DUR, 1);
        if (wp < 0.5) {
          ironX = IRON_X_HOME + (WALK_DEST - IRON_X_HOME) * (wp / 0.5);
          flipX = false;  // moving right → faces right
        } else {
          ironX = WALK_DEST + (IRON_X_HOME - WALK_DEST) * ((wp - 0.5) / 0.5);
          flipX = true;   // moving left → faces left
        }
        // Foot bob: sine wave tied to walk speed (not time, so it scales with speed)
        walkFrame = Math.floor(time * 6) % 2;
        walkBob = Math.sin(time * 12) * 2; // ±2 real px vertical bob
      } else {
        ironX = IRON_X_HOME;
        flipX = true;
        walkFrame = 0;
        walkBob = 0;
      }

      const arcPulse = 0.5 + 0.5 * Math.sin(time * 3.0);
      const floatY   = Math.sin(time * 0.9) * 1.8; // brain float (grid units)

      // ── Render ──
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, W, H, time);
      drawBrain(ctx, BRAIN_CX, BRAIN_CY, floatY, time);

      const sprite = phase === 'walking'
        ? (walkFrame === 0 ? WALK_A : WALK_B)
        : STAND;

      // Save/restore for bob offset (real pixels)
      ctx.save();
      ctx.translate(0, walkBob);
      drawSprite(ctx, sprite, Math.round(ironX), IRON_Y_BASE, flipX, arcPulse);
      ctx.restore();

      if (phase === 'talking') {
        drawSpeechBubble(ctx, Math.round(ironX), IRON_Y_BASE, flipX, time);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasRef]);
}
