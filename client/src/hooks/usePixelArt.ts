/**
 * usePixelArt — Chibi AI Researcher × Holographic Brain Animation
 * ─────────────────────────────────────────────────────────────────
 * Reference: user-provided pixel art image showing:
 *   - Chibi character: dark curly hair, brown jacket, blue chest glow, beard
 *   - Holographic brain: projected from a pedestal on the right, bright cyan
 *   - Warm brown lab background: mechanical arms, hologram screens, circuit board
 *   - Ambient warm orange glow from center/back
 *
 * Canvas: 560 × 380, P = 4 (4 real px per grid unit)
 * Character sprite: 12 wide × 18 tall grid units → 48 × 72 real px (chibi proportions)
 */

import { useEffect, useRef, type RefObject } from "react";

const P = 4; // grid unit size in real pixels

// ── Color palette ─────────────────────────────────────────────────────────────
// Character
const HAIR  = '#1A1008'; // very dark brown/black
const SKIN  = '#E8B890'; // warm peach skin
const SKIN2 = '#C89060'; // shadow skin
const BEARD = '#2A1A08'; // dark beard
const JACK  = '#7A3818'; // brown jacket
const JACK2 = '#4A2008'; // dark jacket shadow
const SHIRT = '#1A1A2A'; // dark shirt/pants
const GLOW  = '#60D8FF'; // arc reactor / chest glow
const GLOW2 = '#B0EEFF'; // bright glow highlight
const SHOE  = '#0A0808'; // dark shoes

// Brain / hologram
const BCYAN  = '#38D8FF'; // brain cyan
const BCYAN2 = '#80EEFF'; // brain bright
const BBASE  = '#1A3050'; // brain dark blue
const PEDST  = '#3A4050'; // pedestal gray
const PEDST2 = '#5A6070'; // pedestal highlight

// Background
const WALL   = '#2A1A0A'; // dark warm brown wall
const WALL2  = '#3A2510'; // slightly lighter brown
const FLOOR  = '#1E1408'; // very dark floor
const FLOOR2 = '#2E2010'; // floor highlight
const WARM   = '#C06010'; // warm orange glow color
const HOLO   = '#20A8D0'; // hologram screen blue

type Row = number[];
// 0=transparent

// ── Chibi Character Sprite: 12 wide × 18 tall ─────────────────────────────────
// Proportions: big head (rows 0-6), short torso (7-12), stubby legs (13-17)
// Colors encoded as hex strings per pixel for clarity

// We'll use a numeric palette for the sprite grid:
// 1=HAIR 2=SKIN 3=SKIN2 4=BEARD 5=JACK 6=JACK2 7=SHIRT 8=GLOW 9=GLOW2 10=SHOE

const C: Record<number, string> = {
  1: HAIR, 2: SKIN, 3: SKIN2, 4: BEARD,
  5: JACK, 6: JACK2, 7: SHIRT, 8: GLOW, 9: GLOW2, 10: SHOE,
};

// STAND pose
const STAND: Row[] = [
  // Row 0: hair top (wide curly)
  [0,0,1,1,1,1,1,1,1,0,0,0],
  // Row 1: hair + forehead
  [0,1,1,1,1,1,1,1,1,1,0,0],
  // Row 2: hair sides + face
  [1,1,2,2,2,2,2,2,2,1,1,0],
  // Row 3: eyes row
  [1,2,7,2,2,2,2,7,2,2,1,0],
  // Row 4: nose / mid face
  [0,2,2,2,3,3,2,2,2,2,0,0],
  // Row 5: mouth / beard
  [0,2,4,4,4,4,4,4,2,2,0,0],
  // Row 6: chin / beard bottom
  [0,0,2,4,4,4,4,2,0,0,0,0],
  // Row 7: neck + shoulder
  [0,5,5,2,2,2,2,5,5,0,0,0],
  // Row 8: upper jacket + chest glow
  [5,5,5,5,8,9,5,5,5,5,0,0],
  // Row 9: jacket body
  [5,5,6,5,5,5,5,5,6,5,0,0],
  // Row 10: jacket lower
  [5,6,6,5,5,5,5,5,6,6,0,0],
  // Row 11: waist / belt
  [0,5,7,7,7,7,7,7,5,0,0,0],
  // Row 12: upper legs
  [0,0,7,7,0,0,7,7,0,0,0,0],
  // Row 13: thighs
  [0,0,7,7,0,0,7,7,0,0,0,0],
  // Row 14: knees
  [0,0,7,7,0,0,7,7,0,0,0,0],
  // Row 15: lower legs
  [0,0,7,7,0,0,7,7,0,0,0,0],
  // Row 16: ankles
  [0,0,7,7,0,0,7,7,0,0,0,0],
  // Row 17: shoes
  [0,10,10,10,0,0,10,10,10,0,0,0],
];

// WALK A: left foot forward
const WALK_A: Row[] = [
  ...STAND.slice(0, 12),
  // Legs: left forward, right back
  [0,0,7,7,0,0,7,7,0,0,0,0],
  [0,7,7,0,0,0,0,7,7,0,0,0],
  [7,7,0,0,0,0,0,0,7,7,0,0],
  [7,7,0,0,0,0,0,7,7,0,0,0],
  [7,7,0,0,0,0,0,7,7,0,0,0],
  [10,10,10,0,0,0,7,10,10,0,0,0],
];

// WALK B: right foot forward
const WALK_B: Row[] = [
  ...STAND.slice(0, 12),
  [0,0,7,7,0,0,7,7,0,0,0,0],
  [0,0,7,7,0,0,0,7,7,0,0,0],
  [0,0,7,7,0,0,0,0,7,7,0,0],
  [0,0,7,7,0,0,0,7,7,0,0,0],
  [0,7,7,0,0,0,7,7,0,0,0,0],
  [0,10,10,10,0,7,10,10,0,0,0,0],
];

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Row[],
  gx: number, gy: number,
  flipX: boolean,
  glowPulse: number,
) {
  const W = sprite[0].length;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < W; col++) {
      const code = sprite[row][flipX ? W - 1 - col : col];
      if (code === 0) continue;
      if (code === 8) {
        ctx.globalAlpha = 0.7 + glowPulse * 0.3;
        ctx.fillStyle = GLOW;
      } else if (code === 9) {
        ctx.globalAlpha = 0.8 + glowPulse * 0.2;
        ctx.fillStyle = GLOW2;
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = C[code] ?? '#FF00FF';
      }
      ctx.fillRect((gx + col) * P, (gy + row) * P, P, P);
    }
  }
  ctx.globalAlpha = 1;
}

// ── Holographic Brain Projection ──────────────────────────────────────────────
// Brain shape: two lobes, projected upward from a pedestal
// Pixels: [dx, dy, brightness] relative to brain center
// Brain is ~18 wide × 16 tall grid units (much larger than before)
const BRAIN_PX: Array<[number, number, number]> = [
  // ── Left lobe ── (x: -9 to -1)
  // Row -8 (top cap)
  [-6,-8,0.45],[-5,-8,0.55],[-4,-8,0.65],[-3,-8,0.55],[-2,-8,0.45],
  // Row -7
  [-8,-7,0.35],[-7,-7,0.5],[-6,-7,0.65],[-5,-7,0.78],[-4,-7,0.85],[-3,-7,0.78],[-2,-7,0.65],[-1,-7,0.5],
  // Row -6
  [-9,-6,0.3],[-8,-6,0.5],[-7,-6,0.68],[-6,-6,0.82],[-5,-6,0.92],[-4,-6,1.0],[-3,-6,0.95],[-2,-6,0.82],[-1,-6,0.65],
  // Row -5 (sulcus groove)
  [-9,-5,0.28],[-8,-5,0.42],[-7,-5,0.38],[-6,-5,0.32],[-5,-5,0.28],[-4,-5,0.3],[-3,-5,0.35],[-2,-5,0.42],[-1,-5,0.5],
  // Row -4
  [-9,-4,0.32],[-8,-4,0.52],[-7,-4,0.72],[-6,-4,0.88],[-5,-4,0.96],[-4,-4,1.0],[-3,-4,0.96],[-2,-4,0.85],[-1,-4,0.7],
  // Row -3
  [-9,-3,0.35],[-8,-3,0.55],[-7,-3,0.75],[-6,-3,0.9],[-5,-3,0.98],[-4,-3,1.0],[-3,-3,0.95],[-2,-3,0.82],[-1,-3,0.68],
  // Row -2 (sulcus)
  [-9,-2,0.28],[-8,-2,0.4],[-7,-2,0.35],[-6,-2,0.3],[-5,-2,0.28],[-4,-2,0.32],[-3,-2,0.38],[-2,-2,0.45],[-1,-2,0.55],
  // Row -1
  [-9,-1,0.3],[-8,-1,0.5],[-7,-1,0.68],[-6,-1,0.82],[-5,-1,0.9],[-4,-1,0.92],[-3,-1,0.85],[-2,-1,0.72],[-1,-1,0.6],
  // Row 0
  [-9,0,0.3],[-8,0,0.48],[-7,0,0.65],[-6,0,0.78],[-5,0,0.85],[-4,0,0.88],[-3,0,0.8],[-2,0,0.68],[-1,0,0.55],
  // Row 1 (sulcus)
  [-8,1,0.28],[-7,1,0.32],[-6,1,0.28],[-5,1,0.25],[-4,1,0.3],[-3,1,0.35],[-2,1,0.42],[-1,1,0.5],
  // Row 2
  [-8,2,0.3],[-7,2,0.48],[-6,2,0.65],[-5,2,0.75],[-4,2,0.78],[-3,2,0.72],[-2,2,0.6],[-1,2,0.48],
  // Row 3
  [-7,3,0.28],[-6,3,0.42],[-5,3,0.55],[-4,3,0.6],[-3,3,0.55],[-2,3,0.45],[-1,3,0.35],
  // Row 4
  [-6,4,0.22],[-5,4,0.32],[-4,4,0.38],[-3,4,0.32],[-2,4,0.22],

  // ── Right lobe ── (mirror of left)
  [6,-8,0.45],[5,-8,0.55],[4,-8,0.65],[3,-8,0.55],[2,-8,0.45],[1,-8,0.4],
  [8,-7,0.35],[7,-7,0.5],[6,-7,0.65],[5,-7,0.78],[4,-7,0.85],[3,-7,0.78],[2,-7,0.65],[1,-7,0.5],
  [9,-6,0.3],[8,-6,0.5],[7,-6,0.68],[6,-6,0.82],[5,-6,0.92],[4,-6,1.0],[3,-6,0.95],[2,-6,0.82],[1,-6,0.65],
  [9,-5,0.28],[8,-5,0.42],[7,-5,0.38],[6,-5,0.32],[5,-5,0.28],[4,-5,0.3],[3,-5,0.35],[2,-5,0.42],[1,-5,0.5],
  [9,-4,0.32],[8,-4,0.52],[7,-4,0.72],[6,-4,0.88],[5,-4,0.96],[4,-4,1.0],[3,-4,0.96],[2,-4,0.85],[1,-4,0.7],
  [9,-3,0.35],[8,-3,0.55],[7,-3,0.75],[6,-3,0.9],[5,-3,0.98],[4,-3,1.0],[3,-3,0.95],[2,-3,0.82],[1,-3,0.68],
  [9,-2,0.28],[8,-2,0.4],[7,-2,0.35],[6,-2,0.3],[5,-2,0.28],[4,-2,0.32],[3,-2,0.38],[2,-2,0.45],[1,-2,0.55],
  [9,-1,0.3],[8,-1,0.5],[7,-1,0.68],[6,-1,0.82],[5,-1,0.9],[4,-1,0.92],[3,-1,0.85],[2,-1,0.72],[1,-1,0.6],
  [9,0,0.3],[8,0,0.48],[7,0,0.65],[6,0,0.78],[5,0,0.85],[4,0,0.88],[3,0,0.8],[2,0,0.68],[1,0,0.55],
  [8,1,0.28],[7,1,0.32],[6,1,0.28],[5,1,0.25],[4,1,0.3],[3,1,0.35],[2,1,0.42],[1,1,0.5],
  [8,2,0.3],[7,2,0.48],[6,2,0.65],[5,2,0.75],[4,2,0.78],[3,2,0.72],[2,2,0.6],[1,2,0.48],
  [7,3,0.28],[6,3,0.42],[5,3,0.55],[4,3,0.6],[3,3,0.55],[2,3,0.45],[1,3,0.35],
  [6,4,0.22],[5,4,0.32],[4,4,0.38],[3,4,0.32],[2,4,0.22],

  // ── Corpus callosum (center, dim) ──
  [0,-7,0.2],[0,-6,0.25],[0,-5,0.15],[0,-4,0.22],[0,-3,0.25],[0,-2,0.15],[0,-1,0.2],[0,0,0.18],[0,1,0.12],

  // ── Brain stem ──
  [-1,5,0.38],[0,5,0.48],[1,5,0.38],
  [-1,6,0.3],[0,6,0.4],[1,6,0.3],
  [0,7,0.3],[0,8,0.22],
];

// Neural links (updated for larger brain)
const NEURAL_LINKS: Array<[number,number,number,number]> = [
  // Left lobe internal
  [-7,-6,-5,-4],[-6,-4,-4,-2],[-5,-2,-3,0],[-4,0,-2,2],
  [-8,-5,-6,-3],[-7,-3,-5,-1],[-6,-1,-4,1],[-8,-2,-6,0],
  [-9,-4,-7,-2],[-9,-1,-7,1],
  // Right lobe internal
  [7,-6,5,-4],[6,-4,4,-2],[5,-2,3,0],[4,0,2,2],
  [8,-5,6,-3],[7,-3,5,-1],[6,-1,4,1],[8,-2,6,0],
  [9,-4,7,-2],[9,-1,7,1],
  // Cross-lobe
  [-2,-6,2,-6],[-1,-3,1,-3],[-1,0,1,0],
];

function drawBrain(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  floatY: number, time: number,
) {
  const acy = cy + floatY;
  const pulse = 0.8 + 0.2 * Math.sin(time * 1.3);

  // ── Pedestal (base platform) ──
  const px = cx * P;
  const py = (cy + 7) * P;
  // Platform glow ring
  const glowR = ctx.createRadialGradient(px, py + P, 0, px, py + P, P * 10);
  glowR.addColorStop(0, `rgba(56,216,255,${0.15 + pulse * 0.1})`);
  glowR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowR;
  ctx.fillRect(px - P * 12, py - P * 2, P * 24, P * 8);

  // Pedestal body (pixel art style)
  ctx.globalAlpha = 1;
  // Base
  ctx.fillStyle = PEDST;
  ctx.fillRect((cx - 4) * P, (cy + 7) * P, P * 8, P * 2);
  ctx.fillStyle = PEDST2;
  ctx.fillRect((cx - 3) * P, (cy + 7) * P, P * 6, P);
  // Stem
  ctx.fillStyle = PEDST;
  ctx.fillRect((cx - 1) * P, (cy + 5) * P, P * 2, P * 2);
  // Top disc
  ctx.fillStyle = GLOW;
  ctx.globalAlpha = 0.4 + pulse * 0.3;
  ctx.fillRect((cx - 2) * P, (cy + 5) * P, P * 4, P);
  ctx.globalAlpha = 1;

  // ── Projection beam (from pedestal up to brain) ──
  for (let y = cy + 4; y >= cy - 6; y--) {
    const dist = (cy + 4 - y);
    const beamW = 1 + dist * 0.15;
    ctx.globalAlpha = (0.08 + pulse * 0.05) * (1 - dist / 12);
    ctx.fillStyle = BCYAN;
    ctx.fillRect((cx - beamW / 2) * P, y * P, beamW * P, P);
  }
  ctx.globalAlpha = 1;

  // ── Neural connections ──
  ctx.lineWidth = 0.8;
  for (const [dx1, dy1, dx2, dy2] of NEURAL_LINKS) {
    const spark = 0.1 + 0.7 * Math.sin(time * 2.8 + dx1 * 1.2 + dy2 * 1.5);
    if (spark <= 0.05) continue;
    ctx.globalAlpha = spark * pulse * 0.5;
    ctx.strokeStyle = BCYAN2;
    ctx.beginPath();
    ctx.moveTo((cx + dx1) * P + P / 2, (acy + dy1) * P + P / 2);
    ctx.lineTo((cx + dx2) * P + P / 2, (acy + dy2) * P + P / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ── Brain pixels ──
  for (let i = 0; i < BRAIN_PX.length; i++) {
    const [dx, dy, bBase] = BRAIN_PX[i];
    const flicker = pulse * (0.7 + 0.3 * Math.sin(time * 1.7 + i * 0.41 + dx * 0.22));
    const b = bBase * flicker;

    // Glow halo
    ctx.globalAlpha = b * 0.12;
    ctx.fillStyle = BCYAN;
    ctx.fillRect((cx + dx) * P - 2, (acy + dy) * P - 2, P + 4, P + 4);

    // Core pixel
    const green = Math.round(130 + bBase * 110);
    const red   = Math.round(20 + bBase * 40);
    ctx.globalAlpha = Math.min(1, b * 0.85 + 0.12);
    ctx.fillStyle = `rgb(${red},${green},255)`;
    ctx.fillRect((cx + dx) * P, (acy + dy) * P, P, P);
  }
  ctx.globalAlpha = 1;
}

// ── Speech Bubble ─────────────────────────────────────────────────────────────
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  charGx: number, charGy: number,
  facingRight: boolean,
  time: number,
) {
  const bw = 56;
  const bh = 22;
  // Position above character's head, on the side they face
  const bx = facingRight
    ? (charGx + 13) * P
    : (charGx - 15) * P;
  const by = (charGy - 7) * P;

  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#E8F4FC';
  ctx.strokeStyle = '#70B8D8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(bx, by, bw, bh, 5);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();
  ctx.stroke();

  // Tail
  const tailX = facingRight ? bx + 8 : bx + bw - 8;
  ctx.fillStyle = '#E8F4FC';
  ctx.strokeStyle = '#70B8D8';
  ctx.beginPath();
  ctx.moveTo(tailX - 5, by + bh);
  ctx.lineTo(tailX, by + bh + 9);
  ctx.lineTo(tailX + 5, by + bh);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Animated dots
  const dotIdx = Math.floor(time * 2.0) % 3;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i <= dotIdx ? 0.85 : 0.2;
    ctx.fillStyle = '#1A4060';
    ctx.beginPath();
    ctx.arc(bx + 16 + i * 13, by + bh / 2, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Warm Brown Lab Background ─────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  const floorY = Math.floor(H * 0.70);

  // Back wall — warm dark brown
  ctx.fillStyle = WALL2;
  ctx.fillRect(0, 0, W, floorY);

  // Floor — very dark
  ctx.fillStyle = FLOOR;
  ctx.fillRect(0, floorY, W, H - floorY);

  // Floor highlight strip
  ctx.fillStyle = FLOOR2;
  ctx.fillRect(0, floorY, W, P);

  // ── Central warm glow (orange/amber, like the reference image) ──
  const warmPulse = 0.85 + 0.15 * Math.sin(time * 0.5);
  const warmGrd = ctx.createRadialGradient(W / 2, floorY * 0.5, 0, W / 2, floorY * 0.5, W * 0.55);
  warmGrd.addColorStop(0, `rgba(200,90,15,${0.18 * warmPulse})`);
  warmGrd.addColorStop(0.5, `rgba(160,60,10,${0.08 * warmPulse})`);
  warmGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warmGrd;
  ctx.fillRect(0, 0, W, H);

  // ── Wall panels (pixel art style) ──
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#4A3020';
  ctx.lineWidth = 1;
  // Vertical panel lines
  for (let x = P * 10; x < W - P * 5; x += P * 14) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ── Hologram screen — LEFT (circuit board / chip design) ──
  drawHoloScreen(ctx, P * 2, P * 4, P * 18, P * 14, time, 0);

  // ── Hologram screen — RIGHT (neural network / waveform) ──
  drawHoloScreen(ctx, W - P * 22, P * 3, P * 18, P * 13, time, 1.5);

  // ── Mechanical arms (upper, from ceiling) ──
  drawMechArm(ctx, W * 0.38, 0, time, 0);
  drawMechArm(ctx, W * 0.62, 0, time, 1.2);

  // ── Circuit board on desk (lower left) ──
  drawCircuitBoard(ctx, P * 2, floorY - P * 6, time);

  // ── Desk lamp (lower left) ──
  drawLamp(ctx, P * 5, floorY - P * 8, time);

  // ── Floor grid (subtle) ──
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += P * 7) {
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#6080A0';
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = floorY; y <= H; y += P * 5) {
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = '#6080A0';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawHoloScreen(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, phase: number,
) {
  const p = 0.3 + 0.15 * Math.sin(time * 0.55 + phase);

  // Screen border
  ctx.globalAlpha = p * 0.9;
  ctx.strokeStyle = HOLO;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Screen fill
  ctx.globalAlpha = p * 0.08;
  ctx.fillStyle = '#0A3050';
  ctx.fillRect(x, y, w, h);

  // Content: alternating lines (simulating circuit/data)
  for (let i = 0; i < 6; i++) {
    const lw = (w * 0.3) + Math.sin(time * 0.9 + i * 0.8 + phase) * (w * 0.25);
    ctx.globalAlpha = p * 0.55;
    ctx.fillStyle = HOLO;
    ctx.fillRect(x + P, y + P * (1.5 + i * 1.8), lw, 1.5);
  }

  // Corner accent squares
  ctx.globalAlpha = p * 0.7;
  ctx.fillStyle = HOLO;
  const cs = P * 0.8;
  ctx.fillRect(x, y, cs, cs);
  ctx.fillRect(x + w - cs, y, cs, cs);
  ctx.fillRect(x, y + h - cs, cs, cs);
  ctx.fillRect(x + w - cs, y + h - cs, cs, cs);

  ctx.globalAlpha = 1;
}

function drawMechArm(
  ctx: CanvasRenderingContext2D,
  rootX: number, rootY: number,
  time: number, phase: number,
) {
  const sw = Math.sin(time * 0.32 + phase) * 10;
  const sw2 = Math.sin(time * 0.45 + phase + 0.5) * 8;

  const j0: [number,number] = [rootX, rootY];
  const j1: [number,number] = [rootX - 15 + sw * 0.4, rootY + 30];
  const j2: [number,number] = [rootX - 25 + sw * 0.7, rootY + 65];
  const j3: [number,number] = [rootX - 30 + sw + sw2 * 0.3, rootY + 95];

  ctx.lineCap = 'round';

  const segs: Array<[[number,number],[number,number],number,string]> = [
    [j0, j1, P * 1.4, '#4A5060'],
    [j1, j2, P * 1.1, '#3A4050'],
    [j2, j3, P * 0.9, '#2A3040'],
  ];
  for (const [a, b, lw, col] of segs) {
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }

  // Joints — pixel art circles
  for (const [jx, jy] of [j1, j2]) {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#6A7888';
    ctx.beginPath(); ctx.arc(jx, jy, P * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#A0B0C0';
    ctx.beginPath(); ctx.arc(jx - 1, jy - 1, P * 0.3, 0, Math.PI * 2); ctx.fill();
  }

  // Claw end effector
  const [ex, ey] = j3;
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#5A6878';
  ctx.beginPath(); ctx.arc(ex, ey, P * 1.0, 0, Math.PI * 2); ctx.fill();
  // Claw fingers
  ctx.strokeStyle = '#4A5868';
  ctx.lineWidth = P * 0.5;
  for (let i = -1; i <= 1; i++) {
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + i * P * 1.5, ey + P * 2.5);
    ctx.stroke();
  }
  // Glow at tip
  ctx.globalAlpha = 0.3 + 0.25 * Math.sin(time * 2.2 + phase);
  ctx.fillStyle = BCYAN;
  ctx.beginPath(); ctx.arc(ex, ey, P * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawCircuitBoard(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  const w = P * 14, h = P * 5;
  // Board base
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#1A3020';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#2A5030';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Circuit traces
  ctx.strokeStyle = '#40A050';
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(x + P, y + P); ctx.lineTo(x + P * 5, y + P); ctx.lineTo(x + P * 5, y + P * 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + P * 7, y + P * 2); ctx.lineTo(x + P * 12, y + P * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + P * 9, y + P); ctx.lineTo(x + P * 9, y + P * 4); ctx.stroke();

  // Chip (center)
  ctx.fillStyle = '#1A1A2A';
  ctx.globalAlpha = 0.9;
  ctx.fillRect(x + P * 5, y + P, P * 4, P * 3);
  ctx.strokeStyle = '#60A870';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + P * 5, y + P, P * 4, P * 3);

  // Chip glow
  ctx.globalAlpha = 0.2 + 0.15 * Math.sin(time * 1.8);
  ctx.fillStyle = '#40D060';
  ctx.fillRect(x + P * 6, y + P * 1.5, P * 2, P * 2);
  ctx.globalAlpha = 1;
}

function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  // Lamp arm
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = '#5A4030';
  ctx.lineWidth = P * 0.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + P * 6);
  ctx.lineTo(x + P * 2, y + P * 3);
  ctx.lineTo(x + P * 4, y);
  ctx.stroke();

  // Lamp head
  ctx.fillStyle = '#7A6040';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x + P * 4, y, P * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Warm light glow
  const lampGrd = ctx.createRadialGradient(x + P * 4, y + P * 2, 0, x + P * 4, y + P * 2, P * 10);
  lampGrd.addColorStop(0, `rgba(220,150,30,${0.25 + 0.1 * Math.sin(time * 1.5)})`);
  lampGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lampGrd;
  ctx.globalAlpha = 1;
  ctx.fillRect(x - P * 4, y, P * 16, P * 12);
}

// ── Main animation hook ────────────────────────────────────────────────────────
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

    // Layout (grid units, P=4)
    // Character: 12 wide × 18 tall. Placed center-left.
    // Brain pedestal: right of character.
    const CHAR_X_HOME = 38;  // character left edge (center at ~44)
    const CHAR_Y      = 30;  // character top (feet at ~row 48, floor at ~row 66)
    const BRAIN_CX    = 78;  // brain center x — right of character
    const BRAIN_CY    = 28;  // brain center y — higher up, floating in air
    const WALK_DEST   = 55;  // character walks right to here

    const TALK_DUR = 7;
    const WALK_DUR = 5;

    type Phase = 'talking' | 'walking';
    let phase: Phase = 'talking';
    let phaseStart = 0;
    let time = 0;
    let lastTs = performance.now();

    let charX = CHAR_X_HOME;
    let facingRight = true;  // true = faces right (toward brain)
    let walkFrame = 0;
    let walkBob = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      time += dt;

      const phaseTime = time - phaseStart;

      if (phase === 'talking' && phaseTime >= TALK_DUR) {
        phase = 'walking';
        phaseStart = time;
      } else if (phase === 'walking' && phaseTime >= WALK_DUR) {
        phase = 'talking';
        phaseStart = time;
        charX = CHAR_X_HOME;
        facingRight = true;
        walkBob = 0;
      }

      if (phase === 'walking') {
        const wp = Math.min((time - phaseStart) / WALK_DUR, 1);
        if (wp < 0.5) {
          charX = CHAR_X_HOME + (WALK_DEST - CHAR_X_HOME) * (wp / 0.5);
          facingRight = false; // walking right → but facing away from brain
        } else {
          charX = WALK_DEST + (CHAR_X_HOME - WALK_DEST) * ((wp - 0.5) / 0.5);
          facingRight = true;  // walking back → facing brain
        }
        walkFrame = Math.floor(time * 6) % 2;
        walkBob = Math.sin(time * 12) * 1.5;
      } else {
        charX = CHAR_X_HOME;
        facingRight = true;
        walkFrame = 0;
        walkBob = 0;
      }

      const glowPulse = 0.5 + 0.5 * Math.sin(time * 2.8);
      const floatY    = Math.sin(time * 0.85) * 1.5;

      // ── Render ──
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, W, H, time);
      drawBrain(ctx, BRAIN_CX, BRAIN_CY, floatY, time);

      const sprite = phase === 'walking'
        ? (walkFrame === 0 ? WALK_A : WALK_B)
        : STAND;

      ctx.save();
      ctx.translate(0, walkBob);
      drawSprite(ctx, sprite, Math.round(charX), CHAR_Y, !facingRight, glowPulse);
      ctx.restore();

      if (phase === 'talking') {
        drawSpeechBubble(ctx, Math.round(charX), CHAR_Y, facingRight, time);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasRef]);
}
