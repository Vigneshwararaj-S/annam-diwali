// Drawing helpers: kolam lines, diyas, marigolds, sparkles.
// All functions draw on a 2D canvas context. No dependencies.

const TAU = Math.PI * 2;

// A kolam "chain": two wavy lines that cross between dots and wrap around each dot.
export function chain(ctx, x0, y0, x1, y1, s, a, color, dotColor, lw) {
  const L = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(1, Math.round(L / s));
  const ss = L / n;
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const sign of [1, -1]) {
    ctx.beginPath();
    const steps = n * 24;
    for (let k = 0; k <= steps; k++) {
      const x = (k / steps) * L;
      const y = sign * a * Math.sin((Math.PI * x) / ss);
      if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  ctx.fillStyle = dotColor;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc((i + 0.5) * ss, 0, lw * 0.95, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// The same chain bent into a circle. N must be even.
export function ring(ctx, cx, cy, R, N, a, color, dotColor, lw) {
  ctx.save();
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.lineJoin = 'round';
  for (const sign of [1, -1]) {
    ctx.beginPath();
    const steps = N * 24;
    for (let k = 0; k <= steps; k++) {
      const th = (k / steps) * TAU;
      const r = R + sign * a * Math.sin((N * th) / 2);
      const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
      if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = dotColor;
  for (let i = 0; i < N; i++) {
    const th = ((i + 0.5) * TAU) / N;
    ctx.beginPath();
    ctx.arc(cx + R * Math.cos(th), cy + R * Math.sin(th), lw * 0.95, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// A small kolam flower: looped petals around a dot.
export function flower(ctx, x, y, r, color, dotColor, lw, petals = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let k = 0; k < petals; k++) {
    ctx.save();
    ctx.rotate((k * TAU) / petals);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.2, r * 0.48, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(0, 0, lw * 1.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function marigold(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffe066');
  g.addColorStop(0.55, '#ffa41b');
  g.addColorStop(1, '#d9480f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,50,0,0.45)';
  ctx.lineWidth = Math.max(1, r * 0.09);
  for (let k = 0; k < 6; k++) {
    const th = (k * TAU) / 6 + x * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.62, th, th + 0.6);
    ctx.stroke();
  }
}

export function leaf(ctx, x, y, len, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(0, 0, 0, len);
  g.addColorStop(0, '#2f9e44');
  g.addColorStop(1, '#0b5d1e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.32, len * 0.45, 0, len);
  ctx.quadraticCurveTo(-len * 0.32, len * 0.45, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, len * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, len * 0.08);
  ctx.lineTo(0, len * 0.9);
  ctx.stroke();
  ctx.restore();
}

// A toran (door garland): marigold scallops with mango leaves at the joints.
export function garland(ctx, x0, x1, y, sag, scallops, r) {
  const w = (x1 - x0) / scallops;
  for (let i = 0; i < scallops; i++) {
    const sx = x0 + i * w;
    const n = Math.max(3, Math.round((Math.PI * 0.5 * w + sag) / (r * 1.55)));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      marigold(ctx, sx + t * w, y + sag * Math.sin(Math.PI * t), r);
    }
  }
  for (let i = 0; i <= scallops; i++) {
    const jx = x0 + i * w;
    leaf(ctx, jx - r * 0.4, y + r * 0.5, r * 3.6, 0.25);
    leaf(ctx, jx + r * 0.4, y + r * 0.5, r * 3.6, -0.25);
    marigold(ctx, jx, y, r * 1.25);
  }
}

// A clay diya. Returns where the flame sits.
export function diya(ctx, x, y, s, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  const g = ctx.createLinearGradient(0, -s * 0.2, 0, s * 0.75);
  g.addColorStop(0, '#e8590c');
  g.addColorStop(1, '#7c2d12');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(-s * 0.95, s * 0.75, 0, s * 0.75);
  ctx.quadraticCurveTo(s * 0.95, s * 0.75, s * 1.35, -s * 0.28);
  ctx.quadraticCurveTo(s * 0.55, s * 0.12, -s, 0);
  ctx.fill();
  // rim
  ctx.fillStyle = '#5c1d0a';
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(s * 0.55, s * 0.12, s * 1.35, -s * 0.28);
  ctx.quadraticCurveTo(s * 0.45, -s * 0.12, -s, 0);
  ctx.fill();
  ctx.strokeStyle = '#ffd27a';
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(s * 0.55, s * 0.12, s * 1.35, -s * 0.28);
  ctx.stroke();
  // gold dot pattern on the bowl
  ctx.fillStyle = '#ffd27a';
  for (let k = 0; k < 5; k++) {
    const t = (k + 0.5) / 5;
    ctx.beginPath();
    ctx.arc(-s * 0.7 + t * s * 1.4, s * 0.4 + Math.sin(t * Math.PI) * s * 0.08, s * 0.06, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  return { x: x + (flip ? -1 : 1) * s * 1.28, y: y - s * 0.3, s: s * 0.42 };
}

// A flickering flame with a warm glow. t is time in seconds.
export function flame(ctx, x, y, s, t) {
  const f = 1 + 0.1 * Math.sin(t * 13 + x) + 0.06 * Math.sin(t * 7.3 + y * 0.7);
  const sway = Math.sin(t * 5 + x * 0.3) * s * 0.12;
  const h = s * 2.6 * f;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y - h * 0.4, 0, x, y - h * 0.4, s * 4.5);
  glow.addColorStop(0, 'rgba(255,190,80,0.55)');
  glow.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y - h * 0.4, s * 4.5, 0, TAU);
  ctx.fill();
  ctx.restore();

  const drawDrop = (w, hh, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + sway, y - hh);
    ctx.bezierCurveTo(x + sway * 0.5 + w * 0.3, y - hh * 0.6, x + w, y - hh * 0.25, x, y);
    ctx.bezierCurveTo(x - w, y - hh * 0.25, x + sway * 0.5 - w * 0.3, y - hh * 0.6, x + sway, y - hh);
    ctx.fill();
  };
  const g = ctx.createLinearGradient(x, y - h, x, y);
  g.addColorStop(0, '#ff922b');
  g.addColorStop(0.5, '#ffd43b');
  g.addColorStop(1, '#fff3bf');
  drawDrop(s * 0.9, h, g);
  drawDrop(s * 0.4, h * 0.45, 'rgba(255,255,255,0.9)');
}

// A four-point twinkle.
export function sparkle(ctx, x, y, r, alpha, color = '#fff3c4') {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
