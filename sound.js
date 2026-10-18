// 終了の合図(短いピッ音)。ブラウザの決まりで、操作(クリックなど)のあとでないと音を出せないため、開始時に unlockAudio() を呼ぶ。
let ctx;
export function unlockAudio() {
  try { ctx ??= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume?.(); } catch (_) { /* 音なしで動く */ }
}
export function beep(times = 3) {
  if (!ctx) return;
  for (let i = 0; i < times; i++) {
    const t = i * 0.28, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.25);
  }
}
