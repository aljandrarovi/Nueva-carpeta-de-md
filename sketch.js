let video;
let handpose;
let hands = [];

let drops = [];
const MAX_DROPS = 150;

let audioCtx;
let handState = 'open'; // 'open' | 'closed'
let statusEl;

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  const ml5Failed = window.__ml5Failed || typeof ml5 === 'undefined';

  if (ml5Failed) {
    console.error('ml5 no se pudo cargar. Verifica que tengas conexión a internet y que el CDN no esté bloqueado.');
    statusEl = select('#status');
    if (statusEl) statusEl.html('Error: ml5 no cargó. Revisa tu conexión a internet y recarga la página.');
    return;
  }

  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', (results) => {
    hands = results;
  });

  // Audio context nativo (más ligero que p5.sound)
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  for (let i = 0; i < MAX_DROPS; i++) {
    drops.push(new Drop());
  }

  statusEl = select('#status');
}

function modelReady() {
  console.log('HandPose listo');
  if (statusEl) statusEl.html('Listo. Muestra tu mano y abre/cierra el puño.');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (typeof ml5 === 'undefined') return;

  background(10, 10, 15, 45); // estela suave de lluvia

  if (hands.length > 0) {
    const hand = hands[0];
    const keypoints = hand.keypoints;
    const closed = isFistClosed(keypoints);

    // Máquina de estados: abierto -> cerrado -> abierto dispara la salpicada
    if (closed && handState === 'open') {
      handState = 'closed';
    }
    if (!closed && handState === 'closed') {
      handState = 'open';
      triggerSplash(hand);
    }
  }

  for (let drop of drops) {
    if (drop.active) {
      drop.update();
      drop.show();
    }
  }
}

/**
 * Detecta puño cerrado midiendo distancia promedio de la muñeca a las puntas
 * de los 5 dedos, normalizada por el tamaño de la mano.
 */
function isFistClosed(keypoints) {
  if (!keypoints || keypoints.length < 21) return false;

  const wrist = keypoints[0];
  const tips = [4, 8, 12, 16, 20]; // pulgar, índice, medio, anular, meñique

  let sum = 0;
  for (let i of tips) {
    sum += dist(wrist.x, wrist.y, keypoints[i].x, keypoints[i].y);
  }
  const avg = sum / tips.length;

  const base = dist(wrist.x, wrist.y, keypoints[9].x, keypoints[9].y) || 1;
  const ratio = avg / base;

  return ratio < 0.85;
}

function triggerSplash(hand) {
  let cx = random(width);
  let cy = random(height);
  if (hand.boundingBox) {
    cx = (hand.boundingBox[0][0] + hand.boundingBox[1][0]) / 2;
    cy = (hand.boundingBox[0][1] + hand.boundingBox[1][1]) / 2;
  }

  playDropSound();

  for (let drop of drops) {
    drop.activate(cx + random(-100, 100), cy + random(-50, 50));
  }
}

function playDropSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(random(600, 1100), audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.25);
}

class Drop {
  constructor() { this.reset(); this.active = false; }
  reset() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.len = random(10, 20);
    this.speed = random(2, 4);
    this.alpha = random(120, 200);
  }
  activate(x, y) {
    this.x = x; this.y = y;
    this.len = random(10, 20);
    this.speed = random(2, 4);
    this.alpha = random(120, 200);
    this.active = true;
  }
  update() {
    this.y += this.speed;
    if (this.y > height) this.reset();
  }
  show() {
    stroke(120, 170, 220, this.alpha);
    strokeWeight(1.5);
    line(this.x, this.y, this.x, this.y + this.len);
  }
}
