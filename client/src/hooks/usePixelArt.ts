import { useEffect, useRef, type RefObject } from "react";

const P = 4; // one "pixel art pixel" = 4 real canvas pixels

// ── Iron Man color palette ──────────────────────────────────────────────────
const R  = '#D42020'; // red
const RD = '#8A1010'; // dark red
const G  = '#D4A010'; // gold
const GD = '#8A6000'; // dark gold
const AB = '#40C8FF'; // arc / eye blue
const AG = '#A0EAFF'; // arc bright/glow

type SpriteRow = number[];
// 0=transparent, 1=R, 2=RD, 3=G, 4=GD, 5=AB, 6=AG

function colorOf(code: number): string {
  return [R, R, RD, G, GD, AB, AG][code] ?? R;
}

// ── Sprite data: 10 wide × 16 tall ─────────────────────────────────────────
const STAND: SpriteRow[] = [
  [0,0,2,1,1,1,1,2,0,0],
  [0,2,1,1,1,1,1,1,2,0],
  [2,1,3,3,3,3,3,3,1,2],
  [2,1,5,5,5,5,5,5,1,0],
  [0,2,1,1,1,1,1,1,2,0],
  [0,0,3,1,1,1,1,3,0,0],
  [0,2,1,3,3,3,3,1,2,0],
  [2,1,1,3,5,5,3,1,1,0],
  [2,1,1,5,6,6,5,1,1,0],
  [2,1,1,3,3,3,3,1,1,0],
  [0,3,1,1,1,1,1,3,0,0],
  [0,1,1,1,0,0,1,1,0,0],
  [0,1,1,1,0,0,1,1,0,0],
  [0,2,1,1,0,0,1,1,2,0],
  [0,3,1,1,0,0,1,1,3,0],
  [0,3,3,2,0,0,2,3,3,0],
];

const WALK_A: SpriteRow[] = [
  ...STAND.slice(0, 11),
  [0,0,1,1,1,0,1,0,0,0],
  [0,0,2,1,0,0,1,1,0,0],
  [0,0,2,1,0,0,0,1,1,0],
  [0,3,1,0,0,0,0,3,1,0],
  [0,3,3,0,0,0,0,0,3,3],
];

const WALK_B: SpriteRow[] = [
  ...STAND.slice(0, 11),
  [0,1,0,1,1,0,1,1,0,0],
  [0,1,1,0,0,1,1,0,0,0],
  [0,1,1,0,0,0,1,2,0,0],
  [0,3,1,0,0,0,1,3,0,0],
  [3,3,0,0,0,0,3,3,0,0],
];

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteRow[],
  gx: number, gy: number,
  flipX: boolean,
  arcPulse: number,
) {
  const w = sprite[0].length;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < w; col++) {
      const code = sprite[row][flipX ? w - 1 - col : col];
      if (code === 0) continue;
      if (code === 5) {
        ctx.globalAlpha = 0.65 + arcPulse * 0.35;
        ctx.fillStyle = AB;
      } else if (code === 6) {
        ctx.globalAlpha = 0.75 + arcPulse * 0.25;
        ctx.fillStyle = AG;
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = colorOf(code);
      }
      ctx.fillRect((gx + col) * P, (gy + row) * P, P, P);
    }
  }
  ctx.globalAlpha = 1;
}

// ── Brain hologram ──────────────────────────────────────────────────────────
// Pixels: [dx, dy] relative to brain center
const BRAIN_CELLS: Array<[number, number]> = [
  // Left lobe
  [-5,0],[-5,1],
  [-4,-1],[-4,0],[-4,1],[-4,2],
  [-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-3,3],
  [-2,-3],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-2,3],
  [-1,-2],[-1,-1],[-1,0],[-1,1],[-1,2],
  // Center (corpus callosum)
  [0,-1],[0,0],[0,1],[0,2],
  // Right lobe
  [1,-2],[1,-1],[1,0],[1,1],[1,2],
  [2,-3],[2,-2],[2,-1],[2,0],[2,1],[2,2],[2,3],
  [3,-2],[3,-1],[3,0],[3,1],[3,2],[3,3],
  [4,-1],[4,0],[4,1],[4,2],
  [5,0],[5,1],
];

// Fixed neural connection pairs (index pairs into BRAIN_CELLS)
const NEURAL_LINKS: Array<[number,number,number,number]> = [
  [-4,0,-1,2],[-3,1,0,0],[-2,-2,2,-1],[0,1,3,0],
  [1,-1,4,1],[-1,1,2,2],[-3,-1,-1,-2],[2,-2,4,0],
  [-2,2,1,1],[0,-1,-3,2],[3,2,1,2],[-4,1,-2,3],
  [-2,0,1,1],[-1,-1,2,0],[3,-1,5,0],[-3,3,0,2],
];

function drawBrain(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  floatY: number, time: number,
) {
  const acy = cy + floatY; // actual y with float
  const pulse = 0.7 + 0.3 * Math.sin(time * 1.4);

  // Neural connections
  ctx.lineWidth = 0.8;
  for (const [dx1, dy1, dx2, dy2] of NEURAL_LINKS) {
    const spark = 0.15 + 0.55 * Math.sin(time * 2.8 + dx1 * 1.3 + dy2 * 1.9);
    if (spark <= 0) continue;
    ctx.globalAlpha = spark * pulse * 0.5;
    ctx.strokeStyle = '#60D8FF';
    ctx.beginPath();
    ctx.moveTo((cx + dx1) * P + P / 2, (acy + dy1) * P + P / 2);
    ctx.lineTo((cx + dx2) * P + P / 2, (acy + dy2) * P + P / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Brain pixels with soft glow
  for (let i = 0; i < BRAIN_CELLS.length; i++) {
    const [dx, dy] = BRAIN_CELLS[i];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const brightness = Math.max(0, 1 - dist / 7.5);
    const flicker = pulse * (0.65 + 0.35 * Math.sin(time * 2 + i * 0.73 + dx * 0.4));

    // Outer glow
    ctx.globalAlpha = flicker * brightness * 0.22;
    ctx.fillStyle = '#40C8FF';
    ctx.fillRect((cx + dx) * P - 2, (acy + dy) * P - 2, P + 4, P + 4);

    // Core pixel
    const g = Math.round(155 + brightness * 65);
    const b = 255;
    ctx.globalAlpha = flicker * (0.55 + brightness * 0.45);
    ctx.fillStyle = `rgb(80,${g},${b})`;
    ctx.fillRect((cx + dx) * P, (acy + dy) * P, P, P);
  }
  ctx.globalAlpha = 1;
}

// ── Speech bubble ────────────────────────────────────────────────────────────
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  ironGx: number, ironGy: number,
  time: number,
) {
  const bx = (ironGx - 9) * P;
  const by = (ironGy - 7) * P;
  const bw = 48;
  const bh = 18;

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#D0E8F5';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(bx, by, bw, bh, 4);
  } else {
    ctx.rect(bx, by, bw, bh);
  }
  ctx.fill();

  // Tail pointing down-right toward Iron Man's head
  ctx.beginPath();
  ctx.moveTo(bx + bw - 8, by + bh);
  ctx.lineTo(bx + bw - 3, by + bh + 8);
  ctx.lineTo(bx + bw - 14, by + bh);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Animated "..." dots
  const dotIdx = Math.floor(time * 2.5) % 3;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i <= dotIdx ? 0.8 : 0.18;
    ctx.fillStyle = '#1A4060';
    ctx.beginPath();
    ctx.arc(bx + 10 + i * 11, by + bh / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Background: Stark lab ────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, time: number) {
  const floorY = Math.floor(H * 0.68);

  // Ceiling / back wall
  ctx.fillStyle = '#040810';
  ctx.fillRect(0, 0, W, floorY);

  // Floor
  ctx.fillStyle = '#060D1C';
  ctx.fillRect(0, floorY, W, H - floorY);

  // Floor holographic grid
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += P * 5) {
    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = '#0E55CC';
    ctx.beginPath(); ctx.moveTo(x, floorY); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = floorY; y <= H; y += P * 4) {
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = '#0E55CC';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Holographic screen — left wall
  const s1 = 0.22 + 0.1 * Math.sin(time * 0.55);
  ctx.globalAlpha = s1 * 0.28;
  ctx.fillStyle = '#071888';
  ctx.fillRect(P * 2, P * 4, P * 14, P * 12);
  ctx.globalAlpha = s1;
  ctx.strokeStyle = '#1050C8'; ctx.lineWidth = 1;
  ctx.strokeRect(P * 2, P * 4, P * 14, P * 12);
  ctx.fillStyle = '#3070E0';
  for (let i = 0; i < 6; i++) {
    const lw = P * 4 + Math.sin(time * 1.1 + i * 0.85) * P * 2.5;
    ctx.globalAlpha = s1 * 0.55;
    ctx.fillRect(P * 3, P * (6 + i * 1.8), lw, 2);
  }
  ctx.globalAlpha = 1;

  // Holographic screen — right wall
  const s2 = 0.18 + 0.08 * Math.sin(time * 0.4 + 1.1);
  ctx.globalAlpha = s2 * 0.22;
  ctx.fillStyle = '#06168A';
  ctx.fillRect(W - P * 18, P * 3, P * 13, P * 9);
  ctx.globalAlpha = s2;
  ctx.strokeStyle = '#0A48C8'; ctx.lineWidth = 1;
  ctx.strokeRect(W - P * 18, P * 3, P * 13, P * 9);
  ctx.globalAlpha = 1;

  // Ambient brain-area glow
  const grd = ctx.createRadialGradient(P * 20, P * 48, 0, P * 20, P * 48, P * 22);
  grd.addColorStop(0, 'rgba(16,100,210,0.07)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

  // Mechanical arm (upper right)
  drawMechArm(ctx, W, time);
}

function drawMechArm(ctx: CanvasRenderingContext2D, W: number, time: number) {
  const sw = Math.sin(time * 0.38) * 7;

  // Joint coordinates (real pixels)
  const j0 = [W - P * 6, 0];
  const j1 = [W - P * 9 + sw * 0.3, P * 10];
  const j2 = [W - P * 13 + sw * 0.7, P * 20];
  const j3 = [W - P * 16 + sw,       P * 27];

  ctx.lineCap = 'round';

  const segs: Array<[[number,number],[number,number],number,string]> = [
    [j0 as [number,number], j1 as [number,number], P,       '#2E3E58'],
    [j1 as [number,number], j2 as [number,number], P * 0.8, '#263550'],
    [j2 as [number,number], j3 as [number,number], P * 0.6, '#1E2C48'],
  ];

  for (const [a, b, lw, col] of segs) {
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }

  // Joints
  ctx.fillStyle = '#3A5070';
  for (const [jx, jy] of [j1, j2, j3]) {
    ctx.globalAlpha = 0.65;
    ctx.beginPath(); ctx.arc(jx, jy, P * 0.65, 0, Math.PI * 2); ctx.fill();
  }

  // Glowing end effector
  ctx.globalAlpha = 0.35 + 0.3 * Math.sin(time * 2.1);
  ctx.fillStyle = '#40A0FF';
  ctx.beginPath(); ctx.arc(j3[0], j3[1], P * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ── Main hook ────────────────────────────────────────────────────────────────
// Canvas should be 320×320.
export function usePixelArt(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;  // 320
    const H = canvas.height; // 320

    // Layout (grid units). Floor at grid row ~54 (pixel 217).
    const IRON_X_HOME = 50;
    const IRON_Y      = 38;  // sprite top; feet land at row 54
    const BRAIN_CX    = 19;
    const BRAIN_CY    = 46;
    const WALK_DEST   = 30;  // Iron Man walks to here then returns

    const TALK_DUR = 7;   // seconds
    const WALK_DUR = 5;   // seconds

    type Phase = 'talking' | 'walking';
    let phase: Phase = 'talking';
    let phaseStart = 0;
    let time = 0;
    let lastTs = performance.now();

    let ironX = IRON_X_HOME;
    let flipX = true;       // true = faces left (toward brain)
    let walkFrame = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      time += dt;

      const phaseTime = time - phaseStart;

      // State transitions
      if (phase === 'talking' && phaseTime >= TALK_DUR) {
        phase = 'walking';
        phaseStart = time;
      } else if (phase === 'walking' && phaseTime >= WALK_DUR) {
        phase = 'talking';
        phaseStart = time;
        ironX = IRON_X_HOME;
        flipX = true;
      }

      // Iron Man movement
      if (phase === 'walking') {
        const wp = Math.min((time - phaseStart) / WALK_DUR, 1);
        if (wp < 0.5) {
          ironX = IRON_X_HOME + (WALK_DEST - IRON_X_HOME) * (wp / 0.5);
          flipX = true;   // moving left, facing left
        } else {
          ironX = WALK_DEST + (IRON_X_HOME - WALK_DEST) * ((wp - 0.5) / 0.5);
          flipX = false;  // moving right, facing right
        }
        walkFrame = Math.floor(time * 5) % 2;
      } else {
        ironX = IRON_X_HOME;
        flipX = true;
        walkFrame = 0;
      }

      const arcPulse = 0.5 + 0.5 * Math.sin(time * 3.2);
      const floatY   = Math.sin(time * 0.85) * 1.5;

      // ── Render ──
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx, W, H, time);
      drawBrain(ctx, BRAIN_CX, BRAIN_CY, floatY, time);

      const sprite =
        phase === 'walking' ? (walkFrame === 0 ? WALK_A : WALK_B) : STAND;
      drawSprite(ctx, sprite, Math.round(ironX), IRON_Y, flipX, arcPulse);

      if (phase === 'talking') {
        drawSpeechBubble(ctx, Math.round(ironX), IRON_Y, time);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasRef]);
}
