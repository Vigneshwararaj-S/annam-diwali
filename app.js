import * as K from './kolam.js';

const $ = (s) => document.querySelector(s);

// ---- Event settings. Change these through the URL, e.g. ?e=Linkoping%20Diwali%20Mela ----
const params = new URLSearchParams(location.search);
const EVENT = {
  title: params.get('t') || 'Happy Diwali',
  foodTitle: params.get('ft') || 'Diwali Feast',
  name: params.get('e') || '',
  tag: params.get('h') ?? '#DiwaliKolam',
};

const W = 1080, H = 1440; // output photo size (3:4 portrait)

const PALETTES = {
  gold: { band: ['#2b0b3f', '#4a0f2e'], line: ['#ffd27a'], dot: '#fff4d6', rim: '#f5b942', text: '#ffd27a', sub: '#fde9c4' },
  rangoli: { band: ['#21063a', '#08324a'], line: ['#ff4f9a', '#ffd23f', '#35e0a1', '#53c7ff'], dot: '#ffffff', rim: '#ff4f9a', text: '#ffd23f', sub: '#ffffff' },
  classic: { band: ['#3a1a0c', '#1f0e08'], line: ['#ffffff'], dot: '#ffffff', rim: '#ffffff', text: '#ffffff', sub: '#f4e6d4' },
};
const lc = (p, i) => p.line[i % p.line.length];

// ---- Frame overlay (drawn once per mode/palette, then reused every frame) ----
function buildOverlay(mode, p) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const food = mode === 'food';
  const T = food ? 58 : 72;      // side/top band thickness
  const B = food ? 230 : 270;    // bottom band height
  const y0 = H - B;
  const flames = [];
  const sparkles = [];

  // Band with a rounded window for the photo
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, p.band[0]);
  g.addColorStop(1, p.band[1]);
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.94;
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  K.roundRectPath(ctx, T, T, W - 2 * T, y0 - T, 30);
  ctx.fill('evenodd');
  ctx.globalAlpha = 1;

  ctx.strokeStyle = p.rim;
  ctx.lineWidth = 5;
  ctx.beginPath();
  K.roundRectPath(ctx, T, T, W - 2 * T, y0 - T, 30);
  ctx.stroke();

  // Kolam chains around the band
  const s = food ? 50 : 56, a = food ? 15 : 17, lw = 4;
  K.chain(ctx, T, T / 2, W - T, T / 2, s, a, lc(p, 0), p.dot, lw);
  K.chain(ctx, T / 2, T, T / 2, y0, s, a, lc(p, 1), p.dot, lw);
  K.chain(ctx, W - T / 2, T, W - T / 2, y0, s, a, lc(p, 2), p.dot, lw);
  K.chain(ctx, T, y0 + T / 2, W - T, y0 + T / 2, s, a, lc(p, 3), p.dot, lw);
  for (const [x, y] of [[T / 2, T / 2], [W - T / 2, T / 2], [T / 2, y0 + T / 2], [W - T / 2, y0 + T / 2]]) {
    K.flower(ctx, x, y, T * 0.46, lc(p, 0), p.dot, 3);
  }

  // Food mode: kolam ring for the plate, drawn with a soft shadow so it shows on any food
  if (food) {
    const cx = W / 2, cy = (T + y0) / 2, R = 400;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 8;
    K.ring(ctx, cx, cy, R, 36, 20, lc(p, 0), p.dot, 5);
    ctx.fillStyle = p.dot;
    for (let i = 0; i < 48; i++) {
      const th = (i / 48) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + (R + 48) * Math.cos(th), cy + (R + 48) * Math.sin(th), 4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      const th = (i / 8) * Math.PI * 2 + Math.PI / 8;
      K.flower(ctx, cx + (R + 48) * Math.cos(th), cy + (R + 48) * Math.sin(th), 22, lc(p, i + 1), p.dot, 3, 6);
    }
    ctx.restore();
  }

  // Marigold toran hanging from the top
  K.garland(ctx, T + 10, W - T - 10, T + 4, food ? 40 : 56, 4, food ? 13 : 15);

  // Diyas on both sides of the title
  const dy = y0 + (food ? 135 : 150);
  const ds = food ? 40 : 46;
  flames.push(K.diya(ctx, 130, dy, ds, false));
  flames.push(K.diya(ctx, W - 130, dy, ds, true));

  // Title and event line
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.shadowColor = 'rgba(255,170,40,0.65)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = p.text;
  ctx.font = `${food ? 76 : 86}px "Yatra One", Georgia, serif`;
  ctx.fillText(food ? EVENT.foodTitle : EVENT.title, W / 2, y0 + (food ? 142 : 160));
  ctx.restore();
  const sub = [EVENT.name, EVENT.tag].filter(Boolean).join('   •   ');
  if (sub) {
    ctx.fillStyle = p.sub;
    ctx.font = `600 ${food ? 30 : 32}px Poppins, system-ui, sans-serif`;
    let size = food ? 30 : 32;
    while (ctx.measureText(sub).width > W - 2 * T - 40 && size > 18) {
      size -= 1;
      ctx.font = `600 ${size}px Poppins, system-ui, sans-serif`;
    }
    ctx.fillText(sub, W / 2, y0 + (food ? 196 : 222));
  }

  // Twinkle positions inside the band
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const side = i % 3;
    let x, y;
    if (side === 0) { x = T + rnd() * (W - 2 * T); y = y0 + T + 10 + rnd() * (B - T - 20); }
    else if (side === 1) { x = rnd() * T; y = T + rnd() * (y0 - T); }
    else { x = W - rnd() * T; y = T + rnd() * (y0 - T); }
    sparkles.push({ x, y, r: 6 + rnd() * 9, sp: 1.5 + rnd() * 2.5, ph: rnd() * 6.28 });
  }

  return { canvas: c, flames, sparkles };
}

// ---- State ----
const stage = $('#stage');
stage.width = W; stage.height = H;
const ctx = stage.getContext('2d');
const video = document.createElement('video');
video.playsInline = true; video.muted = true; video.autoplay = true;
video.setAttribute('playsinline', '');

let mode = 'selfie';
let facing = 'user';
let paletteKey = 'gold';
let overlay = null;
let stream = null;
let still = null;       // fallback photo (from file picker)
let raf = 0;
let lastBlob = null;

function drawCover(src, sw, sh, mirror) {
  const sc = Math.max(W / sw, H / sh);
  const dw = sw * sc, dh = sh * sc;
  ctx.save();
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();
}

function drawScene(t) {
  ctx.fillStyle = '#120720';
  ctx.fillRect(0, 0, W, H);
  if (still) drawCover(still, still.naturalWidth, still.naturalHeight, false);
  else if (video.videoWidth) drawCover(video, video.videoWidth, video.videoHeight, facing === 'user');
  if (!overlay) return;
  ctx.drawImage(overlay.canvas, 0, 0);
  for (const f of overlay.flames) K.flame(ctx, f.x, f.y, f.s, t);
  for (const s of overlay.sparkles) K.sparkle(ctx, s.x, s.y, s.r, Math.sin(t * s.sp + s.ph) * 0.9);
}

function loop(now) {
  drawScene(now / 1000);
  raf = requestAnimationFrame(loop);
}
function startLoop() { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
function stopLoop() { cancelAnimationFrame(raf); }

function rebuildOverlay() { overlay = buildOverlay(mode, PALETTES[paletteKey]); }

// ---- Camera ----
function stopCamera() {
  if (stream) stream.getTracks().forEach((tr) => tr.stop());
  stream = null;
  video.srcObject = null;
}

async function startCamera() {
  stopCamera();
  still = null;
  $('#fallback').hidden = true;
  if (!navigator.mediaDevices?.getUserMedia) return showFallback();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    console.warn('camera failed', e);
    showFallback();
  }
}

function showFallback() {
  $('#fallback').hidden = false;
}

$('#pick').addEventListener('click', () => {
  const inp = $('#fileIn');
  inp.setAttribute('capture', facing === 'user' ? 'user' : 'environment');
  inp.click();
});
$('#fileIn').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => { still = img; $('#fallback').hidden = true; };
  img.src = URL.createObjectURL(file);
  e.target.value = '';
});

// ---- Screens ----
function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
}

async function openCamera(m) {
  mode = m;
  facing = m === 'food' ? 'environment' : 'user';
  $('#hint').textContent = m === 'food' ? 'Fit your plate inside the kolam circle' : 'Smile! Fit your group inside the frame';
  rebuildOverlay();
  show('camera');
  startLoop();
  await startCamera();
}

document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => openCamera(b.dataset.mode)));

$('#back').addEventListener('click', () => { stopLoop(); stopCamera(); show('home'); });
$('#flip').addEventListener('click', async () => {
  facing = facing === 'user' ? 'environment' : 'user';
  await startCamera();
});

document.querySelectorAll('[data-pal]').forEach((b) => b.addEventListener('click', () => {
  paletteKey = b.dataset.pal;
  document.querySelectorAll('[data-pal]').forEach((x) => x.classList.toggle('on', x === b));
  rebuildOverlay();
}));

$('#shutter').addEventListener('click', () => {
  if (!still && !video.videoWidth) { showFallback(); return; }
  drawScene(performance.now() / 1000);
  const flash = $('#flash');
  flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  stage.toBlob((blob) => {
    lastBlob = blob;
    const img = $('#photo');
    if (img.src) URL.revokeObjectURL(img.src);
    img.src = URL.createObjectURL(blob);
    stopLoop();
    show('result');
    $('#share').hidden = !canShareFiles();
  }, 'image/jpeg', 0.92);
});

function photoFile() {
  return new File([lastBlob], `diwali-kolam-${Date.now()}.jpg`, { type: 'image/jpeg' });
}
function canShareFiles() {
  try { return !!(navigator.canShare && lastBlob && navigator.canShare({ files: [photoFile()] })); }
  catch { return false; }
}

$('#share').addEventListener('click', async () => {
  try {
    await navigator.share({ files: [photoFile()], title: EVENT.title, text: `${EVENT.title}! ${EVENT.tag}`.trim() });
  } catch (e) { if (e.name !== 'AbortError') save(); }
});
function save() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(lastBlob);
  a.download = photoFile().name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
$('#save').addEventListener('click', save);
$('#again').addEventListener('click', () => { show('camera'); startLoop(); });
$('#home2').addEventListener('click', () => { stopCamera(); show('home'); });

// ---- Home screen: a little animated diya ----
const hc = $('#heroCanvas');
const hx = hc.getContext('2d');
function hero(now) {
  if (!$('#home').classList.contains('active')) { requestAnimationFrame(hero); return; }
  const t = now / 1000;
  hx.clearRect(0, 0, hc.width, hc.height);
  K.chain(hx, 20, 210, 580, 210, 56, 16, '#ffd27a', '#fff4d6', 3.5);
  const f1 = K.diya(hx, 180, 150, 40, false);
  const f2 = K.diya(hx, 420, 150, 40, true);
  K.flame(hx, f1.x, f1.y, f1.s, t);
  K.flame(hx, f2.x, f2.y, f2.s, t + 1.3);
  K.flower(hx, 300, 120, 34, '#ff9f43', '#fff4d6', 3);
  requestAnimationFrame(hero);
}

// Wait for fonts so the title draws in the festive font
const fontsReady = Promise.race([
  Promise.all([document.fonts.load('86px "Yatra One"'), document.fonts.load('600 32px Poppins')]),
  new Promise((r) => setTimeout(r, 2500)),
]).catch(() => {});
fontsReady.then(() => { if (overlay) rebuildOverlay(); });
if (EVENT.name) $('#eventName').textContent = EVENT.name;
requestAnimationFrame(hero);

// Test hook: ?demo=selfie or ?demo=food draws the frame over a sample image (no camera needed)
const demo = params.get('demo');
if (demo) {
  fontsReady.then(() => {
    mode = demo === 'food' ? 'food' : 'selfie';
    paletteKey = params.get('pal') || 'gold';
    rebuildOverlay();
    const img = new Image();
    img.onload = () => { still = img; show('camera'); startLoop(); };
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><defs><radialGradient id="g"><stop offset="0" stop-color="#c98b5e"/><stop offset="1" stop-color="#3a2a40"/></radialGradient></defs><rect width="900" height="1200" fill="url(#g)"/><circle cx="450" cy="540" r="300" fill="#f1e3c8"/><circle cx="450" cy="540" r="220" fill="#e9a23b"/></svg>`);
  });
}
