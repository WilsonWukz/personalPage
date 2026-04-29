/**
 * useLabScene — Wilson Wu personal site hero animation
 *
 * Design philosophy: "Bright Paper Canvas"
 * - Light parchment background (#F4F0E8) that blends with the page
 * - Circular canvas with feathered (vignette) edge — no hard border
 * - Warm desk-lamp scene: engineer at desk, glowing holographic brain
 * - Mouse-interactive particles that scatter and drift back
 * - Idle animations: lamp glow pulse, brain float, screen flicker, chest light
 * - Everything stays bright, airy, and "illustration-like" not "game-like"
 */

import { useEffect, useRef, type RefObject } from "react";

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 560;
const H = 400;
const P = 4; // pixel size

// ─── Color palette (BRIGHT, paper-toned) ─────────────────────────────────────
const C = {
  // Page-matching background
  bg: "#F4F0E8",
  bgWarm: "#EDE8DC",

  // Desk lamp warm light
  lampYellow: "#FFE066",
  lampAmber: "#FFB830",
  lampGlow: "rgba(255,200,80,",
  deskLight: "rgba(255,220,120,",

  // Holographic brain — cyan/blue
  holoCore: "#38D8FF",
  holoBright: "#B0EEFF",
  holoGlow: "rgba(56,216,255,",
  holoDim: "rgba(56,216,255,0.15)",

  // Engineer figure
  skin: "#F0C090",
  skinShadow: "#D4956A",
  hair: "#2C1A0E",
  jacket: "#8B4513",
  jacketDark: "#5C2E0A",
  shirt: "#E8E0D0",
  pants: "#3A3A4A",

  // Desk & environment
  desk: "#C8A878",
  deskDark: "#9A7850",
  deskTop: "#D4B888",
  lamp: "#B8A070",
  lampArm: "#8A7050",
  lampHead: "#C8B080",
  monitor: "#2A2A3A",
  monitorBezel: "#4A4A5A",
  monitorScreen: "#0A1A2A",
  monitorGlow: "rgba(56,216,255,",
  paper: "#FFFEF0",
  paperLine: "#E8E4D8",
  mug: "#D4907A",
  mugSteam: "rgba(200,200,200,",

  // Particles
  particleA: "rgba(56,216,255,",
  particleB: "rgba(255,180,50,",
  particleC: "rgba(180,150,255,",
};

// ─── Pixel drawing helpers ────────────────────────────────────────────────────
function px(
  ctx: CanvasRenderingContext2D,
  gx: number, gy: number,
  w = 1, h = 1,
  color = "#000",
  alpha = 1
) {
  if (alpha < 0.01) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx * P), Math.round(gy * P), Math.round(w * P), Math.round(h * P));
  ctx.globalAlpha = 1;
}

function rect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, alpha = 1
) {
  if (alpha < 0.01) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.globalAlpha = 1;
}

function radialGlow(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  colorStart: string, colorEnd = "rgba(0,0,0,0)"
) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, colorStart);
  g.addColorStop(1, colorEnd);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Particle system ──────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  ox: number; oy: number; // origin
  r: number;
  color: string;
  alpha: number;
  phase: number;
}

function makeParticles(): Particle[] {
  const pts: Particle[] = [];
  const colors = [C.particleA, C.particleB, C.particleC];
  // Cluster around brain area (right side) and desk lamp area
  const zones = [
    { cx: 380, cy: 160, spread: 80, count: 18 }, // brain zone
    { cx: 200, cy: 200, spread: 60, count: 10 }, // lamp zone
    { cx: 300, cy: 250, spread: 120, count: 12 }, // scattered
  ];
  for (const z of zones) {
    for (let i = 0; i < z.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * z.spread;
      const ox = z.cx + Math.cos(angle) * dist;
      const oy = z.cy + Math.sin(angle) * dist;
      const col = colors[Math.floor(Math.random() * colors.length)];
      pts.push({
        x: ox, y: oy, ox, oy,
        vx: 0, vy: 0,
        r: 1.5 + Math.random() * 2.5,
        color: col,
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  return pts;
}

// ─── Draw background (bright parchment) ──────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D) {
  // Base parchment
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#F8F4EC");
  bg.addColorStop(0.5, "#F4F0E6");
  bg.addColorStop(1, "#EDE8DC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

// ─── Draw desk surface ────────────────────────────────────────────────────────
function drawDesk(ctx: CanvasRenderingContext2D, t: number) {
  const DESK_Y = 260;
  const DESK_H = 140;

  // Desk top surface (warm wood tone)
  const deskGrad = ctx.createLinearGradient(0, DESK_Y, 0, DESK_Y + 20);
  deskGrad.addColorStop(0, "#D4B888");
  deskGrad.addColorStop(1, "#C0A070");
  ctx.fillStyle = deskGrad;
  ctx.fillRect(60, DESK_Y, W - 120, 18);

  // Desk front face
  const frontGrad = ctx.createLinearGradient(0, DESK_Y + 18, 0, DESK_Y + DESK_H);
  frontGrad.addColorStop(0, "#B89860");
  frontGrad.addColorStop(1, "#9A7840");
  ctx.fillStyle = frontGrad;
  ctx.fillRect(60, DESK_Y + 18, W - 120, DESK_H - 18);

  // Desk edge highlight
  ctx.fillStyle = "#E8C888";
  ctx.fillRect(60, DESK_Y, W - 120, 3);

  // Desk lamp warm glow on surface
  const lampGlowIntensity = 0.18 + Math.sin(t * 1.5) * 0.04;
  const lampGlow = ctx.createRadialGradient(180, DESK_Y, 0, 180, DESK_Y, 140);
  lampGlow.addColorStop(0, `rgba(255,210,100,${lampGlowIntensity})`);
  lampGlow.addColorStop(1, "rgba(255,210,100,0)");
  ctx.fillStyle = lampGlow;
  ctx.fillRect(60, DESK_Y - 40, 280, 80);

  // Scattered papers on desk
  // Paper 1
  ctx.save();
  ctx.translate(100, DESK_Y + 4);
  ctx.rotate(-0.05);
  ctx.fillStyle = "#FFFEF0";
  ctx.fillRect(0, 0, 52, 36);
  ctx.fillStyle = "#E0DDD0";
  for (let i = 0; i < 5; i++) ctx.fillRect(6, 6 + i * 5, 30 + (i % 2) * 8, 2);
  ctx.restore();

  // Paper 2 (slightly overlapping)
  ctx.save();
  ctx.translate(130, DESK_Y + 2);
  ctx.rotate(0.04);
  ctx.fillStyle = "#FAFAF0";
  ctx.fillRect(0, 0, 48, 34);
  ctx.fillStyle = "#E0DDD0";
  for (let i = 0; i < 4; i++) ctx.fillRect(5, 5 + i * 6, 28 + (i % 3) * 4, 2);
  ctx.restore();

  // Coffee mug
  ctx.fillStyle = "#C07860";
  ctx.fillRect(300, DESK_Y + 2, 22, 18);
  ctx.fillStyle = "#A06040";
  ctx.fillRect(300, DESK_Y + 18, 22, 2);
  ctx.fillStyle = "#D09080";
  ctx.fillRect(302, DESK_Y + 4, 18, 2);
  // Mug handle
  ctx.strokeStyle = "#C07860";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(322, DESK_Y + 10, 5, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Steam
  const steamAlpha = 0.15 + Math.sin(t * 2.2 + 1) * 0.08;
  for (let i = 0; i < 3; i++) {
    const sx = 306 + i * 5;
    const sy = DESK_Y - 4 + Math.sin(t * 1.8 + i) * 3;
    ctx.strokeStyle = `rgba(200,200,200,${steamAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 3, sy - 8, sx, sy - 16);
    ctx.stroke();
  }

  // Small circuit board / chip on desk
  ctx.fillStyle = "#2A4A2A";
  ctx.fillRect(340, DESK_Y + 4, 36, 24);
  ctx.fillStyle = "#38D8FF";
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.fillRect(344 + j * 8, DESK_Y + 8 + i * 6, 4, 4);
    }
  }
  ctx.globalAlpha = 1;
  // Chip glow
  const chipGlow = 0.08 + Math.sin(t * 2.8) * 0.04;
  radialGlow(ctx, 358, DESK_Y + 16, 30, `rgba(56,216,255,${chipGlow})`);
}

// ─── Draw desk lamp ───────────────────────────────────────────────────────────
function drawLamp(ctx: CanvasRenderingContext2D, t: number) {
  const BASE_X = 155;
  const BASE_Y = 260;
  const glowPulse = 0.85 + Math.sin(t * 1.5) * 0.12;

  // Lamp base
  ctx.fillStyle = "#B8A070";
  ctx.fillRect(BASE_X - 12, BASE_Y - 4, 24, 6);
  ctx.fillStyle = "#A09060";
  ctx.fillRect(BASE_X - 8, BASE_Y - 10, 16, 6);

  // Lamp arm (lower)
  ctx.strokeStyle = "#9A8060";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(BASE_X, BASE_Y - 10);
  ctx.lineTo(BASE_X - 20, BASE_Y - 70);
  ctx.stroke();

  // Lamp arm (upper)
  ctx.beginPath();
  ctx.moveTo(BASE_X - 20, BASE_Y - 70);
  ctx.lineTo(BASE_X - 10, BASE_Y - 130);
  ctx.stroke();

  // Lamp head
  const headX = BASE_X - 10;
  const headY = BASE_Y - 130;
  ctx.fillStyle = "#C8B080";
  ctx.beginPath();
  ctx.ellipse(headX, headY, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#A89060";
  ctx.beginPath();
  ctx.ellipse(headX, headY + 2, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Lamp light cone
  ctx.save();
  const coneGrad = ctx.createRadialGradient(headX, headY + 5, 0, headX, headY + 5, 140);
  coneGrad.addColorStop(0, `rgba(255,220,100,${0.22 * glowPulse})`);
  coneGrad.addColorStop(0.4, `rgba(255,200,80,${0.12 * glowPulse})`);
  coneGrad.addColorStop(1, "rgba(255,200,80,0)");
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(headX - 14, headY + 5);
  ctx.lineTo(headX - 80, BASE_Y + 10);
  ctx.lineTo(headX + 80, BASE_Y + 10);
  ctx.lineTo(headX + 14, headY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Lamp bulb glow
  radialGlow(ctx, headX, headY, 20, `rgba(255,240,160,${0.6 * glowPulse})`);
  ctx.fillStyle = `rgba(255,255,200,${0.9 * glowPulse})`;
  ctx.beginPath();
  ctx.arc(headX, headY, 4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Draw monitor ─────────────────────────────────────────────────────────────
function drawMonitor(ctx: CanvasRenderingContext2D, t: number) {
  const MX = 390;
  const MY = 180;
  const MW = 110;
  const MH = 76;

  // Monitor bezel
  ctx.fillStyle = "#3A3A4A";
  ctx.fillRect(MX - 4, MY - 4, MW + 8, MH + 8);
  ctx.fillStyle = "#2A2A3A";
  ctx.fillRect(MX, MY, MW, MH);

  // Screen content (code-like lines)
  const screenFlicker = 0.85 + Math.sin(t * 3.7) * 0.12;
  ctx.globalAlpha = screenFlicker;

  // Code lines
  const lineColors = ["#38D8FF", "#B0EEFF", "#88CCFF", "#38D8FF", "#AAFFCC", "#38D8FF", "#88CCFF"];
  const lineWidths = [60, 40, 70, 30, 55, 45, 65];
  for (let i = 0; i < 7; i++) {
    const ly = MY + 8 + i * 9;
    const indent = i % 3 === 1 ? 14 : i % 3 === 2 ? 22 : 6;
    ctx.fillStyle = lineColors[i];
    ctx.fillRect(MX + indent, ly, lineWidths[i] - indent, 3);
  }

  // Cursor blink
  const cursorOn = Math.floor(t * 2) % 2 === 0;
  if (cursorOn) {
    ctx.fillStyle = "#38D8FF";
    ctx.fillRect(MX + 6, MY + 71, 6, 3);
  }

  ctx.globalAlpha = 1;

  // Screen glow
  const screenGlow = 0.06 + Math.sin(t * 2.1) * 0.02;
  radialGlow(ctx, MX + MW / 2, MY + MH / 2, 80, `rgba(56,216,255,${screenGlow})`);

  // Monitor stand
  ctx.fillStyle = "#3A3A4A";
  ctx.fillRect(MX + MW / 2 - 6, MY + MH + 4, 12, 14);
  ctx.fillRect(MX + MW / 2 - 18, MY + MH + 16, 36, 5);
}

// ─── Draw holographic brain ───────────────────────────────────────────────────
function drawHoloBrain(ctx: CanvasRenderingContext2D, t: number) {
  const BCX = 390;
  const BCY = 200 + Math.sin(t * 1.3) * 5; // gentle float
  const BSCALE = 1.0;

  // Pedestal base
  ctx.fillStyle = "#6A8A9A";
  ctx.fillRect(BCX - 20, 258, 40, 6);
  ctx.fillStyle = "#8AAABB";
  ctx.fillRect(BCX - 14, 254, 28, 4);

  // Projection beam
  const beamAlpha = 0.12 + Math.sin(t * 2.0) * 0.04;
  const beamGrad = ctx.createLinearGradient(BCX, 258, BCX, BCY + 50);
  beamGrad.addColorStop(0, `rgba(56,216,255,${beamAlpha})`);
  beamGrad.addColorStop(1, "rgba(56,216,255,0)");
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(BCX - 4, 258);
  ctx.lineTo(BCX + 4, 258);
  ctx.lineTo(BCX + 30, BCY + 50);
  ctx.lineTo(BCX - 30, BCY + 50);
  ctx.closePath();
  ctx.fill();

  // Brain glow halo
  const glowA = 0.12 + Math.sin(t * 1.8) * 0.05;
  radialGlow(ctx, BCX, BCY, 70 * BSCALE, `rgba(56,216,255,${glowA})`);

  // Brain pixel art — two lobes, filled solid
  const bp = P * BSCALE;
  function bpx(dx: number, dy: number, w: number, h: number, bright: number) {
    const alpha = (0.55 + bright * 0.45) * (0.8 + Math.sin(t * 2.2) * 0.15);
    const r = Math.round(56 + bright * 180);
    const g = Math.round(216 + bright * 39);
    const b = 255;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(
      Math.round(BCX + dx * P),
      Math.round(BCY + dy * P),
      Math.round(w * P),
      Math.round(h * P)
    );
    ctx.globalAlpha = 1;
  }

  // Left lobe (solid blocks)
  bpx(-9, -8, 3, 2, 0.5);
  bpx(-8, -9, 5, 2, 0.6);
  bpx(-10, -7, 7, 2, 0.7);
  bpx(-10, -6, 9, 2, 0.85);
  bpx(-10, -5, 9, 2, 0.4); // sulcus
  bpx(-10, -4, 9, 2, 0.9);
  bpx(-10, -3, 9, 2, 1.0);
  bpx(-10, -2, 9, 2, 0.4); // sulcus
  bpx(-10, -1, 9, 2, 0.9);
  bpx(-10, 0, 9, 2, 0.85);
  bpx(-9, 1, 8, 2, 0.4); // sulcus
  bpx(-9, 2, 8, 2, 0.75);
  bpx(-8, 3, 7, 2, 0.6);
  bpx(-7, 4, 5, 2, 0.45);
  bpx(-5, 5, 3, 1, 0.3);

  // Right lobe (mirror)
  bpx(6, -8, 3, 2, 0.5);
  bpx(3, -9, 5, 2, 0.6);
  bpx(3, -7, 7, 2, 0.7);
  bpx(1, -6, 9, 2, 0.85);
  bpx(1, -5, 9, 2, 0.4);
  bpx(1, -4, 9, 2, 0.9);
  bpx(1, -3, 9, 2, 1.0);
  bpx(1, -2, 9, 2, 0.4);
  bpx(1, -1, 9, 2, 0.9);
  bpx(1, 0, 9, 2, 0.85);
  bpx(1, 1, 8, 2, 0.4);
  bpx(1, 2, 8, 2, 0.75);
  bpx(1, 3, 7, 2, 0.6);
  bpx(2, 4, 5, 2, 0.45);
  bpx(2, 5, 3, 1, 0.3);

  // Corpus callosum (center gap)
  bpx(-1, -8, 2, 14, 0.15);

  // Brain stem
  bpx(-1, 6, 2, 2, 0.45);
  bpx(-1, 7, 2, 2, 0.35);

  // Neural network lines on brain surface
  const nlAlpha = 0.25 + Math.sin(t * 2.5) * 0.1;
  ctx.strokeStyle = `rgba(176,238,255,${nlAlpha})`;
  ctx.lineWidth = 1;
  const links: [number, number, number, number][] = [
    [-7 * P, -6 * P, -5 * P, -4 * P],
    [-6 * P, -3 * P, -4 * P, -1 * P],
    [-5 * P, 0 * P, -3 * P, 2 * P],
    [7 * P, -6 * P, 5 * P, -4 * P],
    [6 * P, -3 * P, 4 * P, -1 * P],
    [5 * P, 0 * P, 3 * P, 2 * P],
    [-2 * P, -6 * P, 2 * P, -6 * P],
    [-1 * P, -2 * P, 1 * P, -2 * P],
  ];
  for (const [x1, y1, x2, y2] of links) {
    ctx.beginPath();
    ctx.moveTo(BCX + x1, BCY + y1);
    ctx.lineTo(BCX + x2, BCY + y2);
    ctx.stroke();
  }
}

// ─── Draw engineer character ──────────────────────────────────────────────────
function drawEngineer(ctx: CanvasRenderingContext2D, t: number) {
  const CX = 200; // center x
  const CY = 255; // feet y

  // Subtle breathing: torso shifts 1px up/down
  const breathY = Math.sin(t * 1.2) * 1.5;

  // Legs
  px(ctx, CX / P - 2, CY / P - 4, 2, 4, C.pants);
  px(ctx, CX / P + 0, CY / P - 4, 2, 4, C.pants);
  // Feet
  px(ctx, CX / P - 3, CY / P, 3, 1, "#2A2A3A");
  px(ctx, CX / P + 0, CY / P, 3, 1, "#2A2A3A");

  // Torso (jacket)
  const ty = CY / P - 12 + breathY / P;
  px(ctx, CX / P - 3, ty, 6, 8, C.jacket);
  px(ctx, CX / P - 2, ty + 1, 4, 6, C.jacketDark);
  // Shirt visible
  px(ctx, CX / P - 1, ty + 1, 2, 5, C.shirt);

  // Chest arc reactor glow
  const chestGlow = 0.7 + Math.sin(t * 3.0) * 0.25;
  const chestX = CX;
  const chestY = CY - 7 * P + breathY;
  radialGlow(ctx, chestX, chestY, 14, `rgba(56,216,255,${chestGlow * 0.4})`);
  ctx.fillStyle = `rgba(56,216,255,${chestGlow})`;
  ctx.beginPath();
  ctx.arc(chestX, chestY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  // Left arm (pointing toward monitor, slightly raised)
  px(ctx, CX / P - 5, ty + 1, 2, 3, C.jacket);
  px(ctx, CX / P - 6, ty + 3, 2, 2, C.skin); // hand
  // Right arm (down)
  px(ctx, CX / P + 3, ty + 1, 2, 4, C.jacket);
  px(ctx, CX / P + 3, ty + 4, 2, 2, C.skin);

  // Head
  const hy = ty - 5;
  px(ctx, CX / P - 2, hy, 4, 5, C.skin);
  // Hair (curly top)
  px(ctx, CX / P - 2, hy - 2, 4, 2, C.hair);
  px(ctx, CX / P - 3, hy - 1, 2, 2, C.hair);
  px(ctx, CX / P + 1, hy - 1, 2, 2, C.hair);
  px(ctx, CX / P - 2, hy, 1, 1, C.hair); // side hair
  px(ctx, CX / P + 1, hy, 1, 1, C.hair);
  // Eyes
  px(ctx, CX / P - 1, hy + 1, 1, 1, "#2C1A0E");
  px(ctx, CX / P + 0, hy + 1, 1, 1, "#2C1A0E");
  // Nose
  px(ctx, CX / P - 1, hy + 2, 1, 1, C.skinShadow);
  // Beard / mouth
  px(ctx, CX / P - 1, hy + 3, 2, 1, "#5C3020");
  px(ctx, CX / P - 1, hy + 4, 2, 1, "#3C2010");
}

// ─── Draw floating particles ──────────────────────────────────────────────────
function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  mouse: { x: number; y: number },
  t: number
) {
  const REPEL_RADIUS = 80;
  const REPEL_FORCE = 0.15;
  const RETURN_FORCE = 0.04;
  const DAMPING = 0.88;

  for (const p of particles) {
    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPEL_RADIUS && dist > 0) {
      const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
      p.vx += (dx / dist) * force * 3;
      p.vy += (dy / dist) * force * 3;
    }

    // Spring return to origin + gentle drift
    p.vx += (p.ox - p.x) * RETURN_FORCE;
    p.vy += (p.oy - p.y) * RETURN_FORCE;
    p.vx += Math.sin(t * 0.8 + p.phase) * 0.02;
    p.vy += Math.cos(t * 0.6 + p.phase) * 0.02;

    // Damping
    p.vx *= DAMPING;
    p.vy *= DAMPING;

    p.x += p.vx;
    p.y += p.vy;

    // Draw particle
    const alpha = p.alpha * (0.7 + Math.sin(t * 1.5 + p.phase) * 0.25);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color + "0.9)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ─── Draw circular vignette (feathered edge) ──────────────────────────────────
function drawVignette(ctx: CanvasRenderingContext2D) {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) * 0.52;

  // Feathered circular mask — fade to page background color
  const vg = ctx.createRadialGradient(cx, cy, r * 0.65, cx, cy, r);
  vg.addColorStop(0, "rgba(244,240,232,0)");
  vg.addColorStop(0.5, "rgba(244,240,232,0.3)");
  vg.addColorStop(0.8, "rgba(244,240,232,0.75)");
  vg.addColorStop(1, "rgba(244,240,232,1)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Corner fill (make it truly circular)
  ctx.save();
  ctx.fillStyle = "#F4F0E8";
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.restore();
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useLabScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const mouseRef = useRef({ x: W / 2, y: H / 2 });
  const particlesRef = useRef<Particle[]>(makeParticles());
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: W / 2, y: H / 2 };
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    let startTime = performance.now();

    function frame(now: number) {
      const t = (now - startTime) / 1000;

      // Clear
      ctx!.clearRect(0, 0, W, H);

      // Draw layers
      drawBackground(ctx!);
      drawDesk(ctx!, t);
      drawLamp(ctx!, t);
      drawMonitor(ctx!, t);
      drawHoloBrain(ctx!, t);
      drawEngineer(ctx!, t);
      updateAndDrawParticles(ctx!, particlesRef.current, mouseRef.current, t);
      drawVignette(ctx!);

      frameRef.current = requestAnimationFrame(frame);
    }

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [canvasRef]);
}
