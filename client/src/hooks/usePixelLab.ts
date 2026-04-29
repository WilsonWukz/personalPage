import { useEffect, type RefObject } from "react";

const W = 560;
const H = 380;
const P = 4;
const FLOOR_Y = 266;

type Pt = { x: number; y: number };

const C = {
  wallTop: "#20150d",
  wall: "#33210f",
  wallPanel: "#4a3119",
  floor: "#18110b",
  amber: "#d17a27",
  cyan: "#35d9ff",
  cyanBright: "#b8f7ff",
  metal: "#4d5566",
  metalDark: "#2d3442",
  metalLight: "#747d91",
  skin: "#efb48a",
  skinShadow: "#c9875e",
  hair: "#14100c",
  beard: "#2a160c",
  jacket: "#7b351d",
  jacketDark: "#4b2116",
  shirt: "#111827",
  pants: "#0d1320",
  desk: "#4a301d",
  deskDark: "#24180f",
  board: "#2f7b59",
  boardDark: "#174937",
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.globalAlpha = 1;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w = 1, h = 1, color = "#fff", alpha = 1) {
  rect(ctx, x * P, y * P, w * P, h * P, color, alpha);
}

function line(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, width = 2, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(Math.round(a.x), Math.round(a.y));
  ctx.lineTo(Math.round(b.x), Math.round(b.y));
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function pixelLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, alpha = 1) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let x = x1;
  let y = y1;
  while (true) {
    px(ctx, x, y, 1, 1, color, alpha);
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgba: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba.replace("1)", `${alpha})`));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawHoloPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number, mode: "chip" | "notes" | "network" | "wave") {
  const a = 0.4 + Math.sin(t * 1.2) * 0.06;
  rect(ctx, x, y, w, h, "#062a37", 0.14);
  line(ctx, { x, y }, { x: x + w, y }, C.cyan, 1, a);
  line(ctx, { x: x + w, y }, { x: x + w, y: y + h }, C.cyan, 1, a);
  line(ctx, { x: x + w, y: y + h }, { x, y: y + h }, C.cyan, 1, a);
  line(ctx, { x, y: y + h }, { x, y }, C.cyan, 1, a);

  if (mode === "chip") {
    rect(ctx, x + 38, y + 17, 20, 20, C.cyan, 0.14);
    line(ctx, { x: x + 38, y: y + 17 }, { x: x + 58, y: y + 17 }, C.cyan, 1, 0.5);
    line(ctx, { x: x + 58, y: y + 17 }, { x: x + 58, y: y + 37 }, C.cyan, 1, 0.5);
    line(ctx, { x: x + 58, y: y + 37 }, { x: x + 38, y: y + 37 }, C.cyan, 1, 0.5);
    line(ctx, { x: x + 38, y: y + 37 }, { x: x + 38, y: y + 17 }, C.cyan, 1, 0.5);
    for (let i = 0; i < 5; i++) rect(ctx, x + 10, y + 10 + i * 7, 22 + i * 6, 2, C.cyan, 0.24);
  }
  if (mode === "notes") for (let i = 0; i < 7; i++) rect(ctx, x + 12, y + 10 + i * 6, 42 + ((i * 11) % 24), 2, C.cyan, 0.28);
  if (mode === "network") {
    const pts = [[20,18],[48,15],[70,28],[34,42],[62,55],[20,60]];
    for (let i = 0; i < pts.length - 1; i++) line(ctx, { x: x + pts[i][0], y: y + pts[i][1] }, { x: x + pts[i + 1][0], y: y + pts[i + 1][1] }, C.cyan, 1, 0.32);
    for (const [px0, py0] of pts) rect(ctx, x + px0 - 2, y + py0 - 2, 4, 4, C.cyanBright, 0.55);
  }
  if (mode === "wave") {
    let last = { x: x + 9, y: y + 24 };
    for (let i = 1; i < 21; i++) {
      const next = { x: x + 9 + i * 3.2, y: y + 24 + Math.sin(i * 0.9 + t * 2) * 9 };
      line(ctx, last, next, C.cyan, 1, 0.46);
      last = next;
    }
  }
}

function drawMechArm(ctx: CanvasRenderingContext2D, rootX: number, rootY: number, t: number, phase: number, mirror: boolean) {
  const s = Math.sin(t * 0.55 + phase);
  const dir = mirror ? 1 : -1;
  const pts = [
    { x: rootX, y: rootY },
    { x: rootX + dir * (18 + s * 4), y: rootY + 42 },
    { x: rootX + dir * (31 + s * 7), y: rootY + 80 },
    { x: rootX + dir * (28 + s * 10), y: rootY + 115 },
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    line(ctx, pts[i], pts[i + 1], C.metalDark, 7, 0.85);
    line(ctx, pts[i], pts[i + 1], C.metalLight, 2, 0.55);
    rect(ctx, pts[i + 1].x - 5, pts[i + 1].y - 5, 10, 10, C.metal, 0.95);
    rect(ctx, pts[i + 1].x - 2, pts[i + 1].y - 2, 4, 4, C.metalLight, 0.9);
  }
  const tip = pts[3];
  line(ctx, tip, { x: tip.x + dir * 10, y: tip.y + 8 }, C.metalLight, 2, 0.85);
  line(ctx, tip, { x: tip.x - dir * 8, y: tip.y + 9 }, C.metalLight, 2, 0.85);
  rect(ctx, tip.x - 2, tip.y + 13, 4, 7, C.cyanBright, 0.45 + Math.sin(t * 2 + phase) * 0.12);
}

function drawDesk(ctx: CanvasRenderingContext2D, t: number) {
  rect(ctx, 24, 244, 156, 10, C.desk, 0.95);
  rect(ctx, 36, 254, 8, 62, C.deskDark, 0.9);
  rect(ctx, 154, 254, 8, 48, C.deskDark, 0.9);
  rect(ctx, 42, 229, 36, 20, C.boardDark, 1);
  rect(ctx, 47, 225, 70, 28, C.board, 1);
  rect(ctx, 70, 231, 24, 16, "#0d1d20", 0.95);
  rect(ctx, 75, 235, 14, 8, C.amber, 0.45 + Math.sin(t * 2.2) * 0.08);
  for (let i = 0; i < 12; i++) rect(ctx, 51 + i * 5, 228 + ((i * 7) % 20), 2, 2, C.cyanBright, 0.35);
  line(ctx, { x: 35, y: 244 }, { x: 49, y: 220 }, C.metalLight, 3, 0.8);
  line(ctx, { x: 49, y: 220 }, { x: 68, y: 214 }, C.metalLight, 3, 0.8);
  rect(ctx, 64, 207, 28, 12, "#7f633d", 1);
  glow(ctx, 76, 222, 48, "rgba(255,196,108,1)", 0.18);
  rect(ctx, 68, 219, 20, 3, "#ffd08a", 0.55);
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, C.wallTop);
  bg.addColorStop(0.7, C.wall);
  bg.addColorStop(0.701, C.floor);
  bg.addColorStop(1, "#090806");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  glow(ctx, W / 2, 132, 210, "rgba(209,122,39,1)", 0.22 + Math.sin(t * 0.6) * 0.03);
  glow(ctx, 358, 220, 135, "rgba(53,217,255,1)", 0.15);

  for (let x = 30; x < W; x += 56) line(ctx, { x, y: 0 }, { x, y: FLOOR_Y }, C.wallPanel, 1, 0.18);
  for (let y = 42; y < FLOOR_Y; y += 38) line(ctx, { x: 0, y }, { x: W, y }, C.wallPanel, 1, 0.12);

  rect(ctx, 232, 40, 96, 176, "#26190e", 0.85);
  rect(ctx, 240, 49, 80, 158, "#3d2512", 0.55);
  for (let i = 0; i < 12; i++) rect(ctx, 267 - (20 + ((i * 13) % 46)) / 2, 64 + i * 11, 20 + ((i * 13) % 46), 3, C.amber, 0.18 + Math.sin(t + i) * 0.04);
  rect(ctx, 276, 137, 8, 8, "#ffd08a", 0.55 + Math.sin(t * 2) * 0.15);

  drawHoloPanel(ctx, 18, 22, 92, 56, t, "chip");
  drawHoloPanel(ctx, 447, 18, 92, 58, t + 1.1, "notes");
  drawHoloPanel(ctx, 438, 126, 92, 78, t + 2.0, "network");
  drawHoloPanel(ctx, 410, 226, 83, 46, t + 2.7, "wave");
  drawMechArm(ctx, 204, -12, t, 0, false);
  drawMechArm(ctx, 344, -12, t, 1.4, true);
  drawDesk(ctx, t);

  rect(ctx, 0, FLOOR_Y, W, 3, "#2b2018", 0.8);
  for (let x = 0; x <= W; x += 36) line(ctx, { x, y: FLOOR_Y }, { x: x - 26, y: H }, "#314253", 1, 0.08);
  for (let y = FLOOR_Y + 20; y < H; y += 24) line(ctx, { x: 0, y }, { x: W, y }, "#314253", 1, 0.07);
}

const sprite = [
  "..hhhhhhhh...",
  ".hhhhhhhhhh..",
  "hhsssssssshh.",
  "hseesssseesh.",
  ".ssssddssss..",
  ".sbbbbbbbss..",
  "..sbbbbbss...",
  ".jjssssjj....",
  "jjjjgGjjjj...",
  "jjdjjjjdjj...",
  "jddjjjjddj...",
  ".jppppppj....",
  "..pp..pp.....",
  "..pp..pp.....",
  "..pp..pp.....",
  ".pp....pp....",
  ".pp....pp....",
  "bbb....bbb...",
];

const palette: Record<string, string> = { h: C.hair, s: C.skin, d: C.skinShadow, e: C.shirt, b: C.beard, j: C.jacket, p: C.pants, g: C.cyan, G: C.cyanBright };

function drawInventor(ctx: CanvasRenderingContext2D, gx: number, gy: number, t: number) {
  const bob = Math.sin(t * 2.1) > 0.7 ? -1 : 0;
  glow(ctx, (gx + 6) * P, (gy + 9) * P, 38, "rgba(53,217,255,1)", 0.12 + Math.sin(t * 3) * 0.03);
  for (let y = 0; y < sprite.length; y++) {
    for (let x = 0; x < sprite[y].length; x++) {
      const ch = sprite[y][x];
      if (ch === ".") continue;
      const alpha = ch === "g" || ch === "G" ? 0.75 + Math.sin(t * 3) * 0.18 : 1;
      px(ctx, gx + x, gy + y + bob, 1, 1, palette[ch], alpha);
    }
  }
  px(ctx, gx + 2, gy + 5 + bob, 1, 1, "#e08478", 0.7);
  px(ctx, gx + 9, gy + 5 + bob, 1, 1, "#e08478", 0.7);
  rect(ctx, (gx - 1) * P, (gy + 18) * P + 2, 62, 6, "#000", 0.18);
}

const brainPixels: Array<[number, number, number]> = [];
for (let y = -11; y <= 9; y++) {
  for (let x = -16; x <= 16; x++) {
    const left = ((x + 8) / 11) ** 2 + ((y + 2) / 12) ** 2;
    const right = ((x - 8) / 11) ** 2 + ((y + 2) / 12) ** 2;
    const stem = Math.abs(x) <= 2 && y >= 4 && y <= 11;
    if (left < 1 || right < 1 || stem) {
      const groove = Math.abs(Math.sin(x * 0.85 + y * 0.8)) < 0.24;
      brainPixels.push([x, y, groove ? 0.36 : 0.78 + Math.sin(x * y) * 0.15]);
    }
  }
}

const links: Array<[number, number, number, number]> = [[-13,-6,-7,-3],[-10,-1,-4,3],[-5,-8,-1,-3],[-14,2,-7,6],[13,-6,7,-3],[10,-1,4,3],[5,-8,1,-3],[14,2,7,6],[-2,-7,2,-7],[-1,-2,1,-2],[-3,3,3,3],[-7,6,7,6]];

function drawBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const float = Math.sin(t * 1.45) * 3;
  const pulse = 0.78 + Math.sin(t * 2.2) * 0.16;
  glow(ctx, cx * P, (cy + 13) * P, 60, "rgba(53,217,255,1)", 0.22);
  px(ctx, cx - 8, cy + 12, 16, 2, C.metalDark, 1);
  px(ctx, cx - 6, cy + 11, 12, 1, C.metalLight, 0.9);
  px(ctx, cx - 4, cy + 10, 8, 1, C.cyan, 0.38 + pulse * 0.24);
  px(ctx, cx - 2, cy + 8, 4, 3, C.metal, 0.95);
  for (let y = cy + 8; y > cy - 7; y--) px(ctx, cx - (1 + (cy + 8 - y) * 0.25) / 2, y, 1 + (cy + 8 - y) * 0.25, 1, C.cyan, 0.05 + pulse * 0.05);
  for (const [x1, y1, x2, y2] of links) pixelLine(ctx, cx + x1, cy + y1 + Math.round(float / P), cx + x2, cy + y2 + Math.round(float / P), C.cyanBright, Math.max(0.04, 0.18 + Math.sin(t * 2.6 + x1) * 0.12));
  for (let i = 0; i < brainPixels.length; i++) {
    const [x, y, b] = brainPixels[i];
    const flicker = pulse + Math.sin(t * 4 + i * 0.37) * 0.08;
    px(ctx, cx + x, cy + y + float / P, 1, 1, b > 0.55 ? C.cyan : "rgba(53,217,255,0.22)", Math.min(0.92, Math.max(0.22, b * flicker)));
    if (b > 0.8 && i % 9 === 0) px(ctx, cx + x, cy + y + float / P, 1, 1, C.cyanBright, 0.65);
  }
  glow(ctx, cx * P, (cy - 1) * P + float, 92, "rgba(53,217,255,1)", 0.2);
}

function drawParticles(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < 44; i++) {
    const x = (i * 79 + 31) % W;
    const y = 18 + ((i * 53 + 17) % 238);
    const a = 0.08 + Math.max(0, Math.sin(t * 1.5 + i * 1.7)) * 0.38;
    rect(ctx, x, y + Math.sin(t + i) * 2, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2, i % 3 !== 0 ? C.cyanBright : "#ffd28a", a);
  }
}

function vignette(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 335);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.7, "rgba(255,255,255,0.02)");
  g.addColorStop(1, "rgba(238,235,229,0.88)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function usePixelLab(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    let frame = 0;
    let raf = 0;
    const render = () => {
      const t = frame / 60;
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      drawBackground(ctx, t);
      drawParticles(ctx, t);
      drawInventor(ctx, 186, 177, t);
      drawBrain(ctx, 322, 178, t);
      vignette(ctx);
      frame += 1;
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);
}
