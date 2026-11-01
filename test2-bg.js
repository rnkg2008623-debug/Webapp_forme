// Test2 の背景(WebGPU): 白黒のゴシックの大聖堂。ステンドグラスの光の筋・揺れる鎖・舞う花びら・床への映り込み。
import { createGpuView } from './gpu-view.js?v=38';

const WGSL = /* wgsl */ `
struct U { a: vec4f, b: vec4f, c: vec4f };   // a = (幅, 高さ, 時間, 0)  b = (マウスX, マウスY, 0, 0)  c = (鎖が切れた度合い, 鎖が生えた度合い, 鎖が下がった度合い, 切り替えの勢い)
@group(0) @binding(0) var<uniform> u: U;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(p[i], 0, 1);
}

fn hash(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
fn vn(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1, 0)), w.x), mix(hash(i + vec2f(0, 1)), hash(i + vec2f(1, 1)), w.x), w.y);
}
fn fbm(p: vec2f) -> f32 {
  var s = 0.0; var a = 0.5; var q = p;
  for (var i = 0; i < 4; i++) { s += a * vn(q); q = q * 2.03 + vec2f(1.7, 9.2); a *= 0.5; }
  return s;
}
fn rot(a: f32) -> mat2x2f { let c = cos(a); let s = sin(a); return mat2x2f(c, s, -s, c); }

// 尖頭アーチ(ゴシックの窓)の符号付き距離。中心 x=0、底 y=0、幅の半分 w、肩の高さ h
fn sdArch(p: vec2f, w: f32, h: f32) -> f32 {
  let q = vec2f(abs(p.x), p.y);
  let r = w * 2.0;                                    // 尖頭アーチ: 2つの円の交わり
  let c = vec2f(w - r, h);
  let dArc = length(q - c) - r;
  let inBody = max(q.x - w, max(-q.y, q.y - h));
  let body = select(max(q.x - w, -q.y), dArc, q.y > h);
  return max(body, select(-1.0, dArc, q.y > h && q.x < w + 0.0001));
}

// 窓の中のステンドグラス: 鉛のさんと菱形の格子、上のバラ窓
fn glass(p: vec2f, w: f32, h: f32, t: f32, seed: f32) -> f32 {
  let g = p * vec2f(1.0, 1.0) * 26.0;
  let dia = abs(fract((g.x + g.y) * 0.5) - 0.5) + abs(fract((g.x - g.y) * 0.5) - 0.5);
  let lead = smoothstep(0.03, 0.09, abs(dia - 0.5));
  let mull = smoothstep(0.004, 0.012, abs(p.x)) * smoothstep(0.004, 0.012, abs(abs(p.x) - w * 0.5));
  let rose = length(p - vec2f(0.0, h * 0.86));
  let roseRing = smoothstep(0.002, 0.006, abs(rose - w * 0.55)) * smoothstep(0.002, 0.006, abs(rose - w * 0.28));
  let petals = 0.5 + 0.5 * cos(atan2(p.y - h * 0.86, p.x) * 8.0);
  var v = lead * mull;
  v *= select(1.0, roseRing * mix(0.5, 1.0, petals), rose < w * 0.6);
  let tint = 0.55 + 0.45 * vn(p * 9.0 + seed) + 0.1 * sin(t * 0.4 + seed);   // ガラスの明暗むら
  return v * tint;
}

// 鎖(つなぎ目が交互に向きを変える輪)。戻り値: x = 不透明度, y = 明るさ
fn chain(uv: vec2f, p0: vec2f, p1: vec2f, sag: f32, link: f32, t: f32, seed: f32, reveal: f32, brk: f32) -> vec2f {
  let dx = p1.x - p0.x;
  let s = clamp((uv.x - p0.x) / dx, -0.2, 1.2);
  let sway = 0.012 * sin(t * 0.8 + seed * 3.0 + s * 4.0);
  let e = min(s, 1.0 - s);                                          // 近い方の端からの距離
  let swing = brk * 1.3 * e * e * 4.0 + brk * 0.03 * sin(t * 3.0 + e * 9.0 + seed);   // 切れた鎖は、端を支点に垂れ下がって揺れる
  let yc = mix(p0.y, p1.y, s) - sag * 4.0 * s * (1.0 - s) + sway - swing;
  let slope = ((p1.y - p0.y) - sag * 4.0 * (1.0 - 2.0 * s) - brk * 1.3 * 8.0 * e * select(-1.0, 1.0, s < 0.5)) / dx;
  let ang = atan2(slope, 1.0);
  let q = rot(-ang) * vec2f(uv.x - uv.x, uv.y - yc);   // 接線方向に直した、鎖からの垂直距離
  let perp = (uv.y - yc) * cos(ang);
  let arc = (uv.x - p0.x) / cos(ang) / link;
  var best = 0.0; var shade = 0.0;
  for (var k = -1; k <= 1; k++) {
    let cell = floor(arc) + f32(k);
    let lx = (arc - cell - 0.5 - 0.0) * link;                // このコマの中心からの距離
    let odd = (i32(cell) & 1) == 1;
    let hw = link * 0.78;                                    // 輪の半分の長さ
    let ww = select(link * 0.075, link * 0.34, odd);         // 正面を向く輪は幅広、横向きは細い
    let qq = vec2f(abs(lx) - (hw - ww), perp);
    let d = length(vec2f(max(qq.x, 0.0), qq.y)) - ww;       // ストーン形(角丸の細長い輪)
    let ring = select(abs(d + ww * 0.0) - link * 0.07, d, !odd);   // 正面の輪は輪郭だけ、横向きは塊
    let a = smoothstep(link * 0.02, -link * 0.02, ring);
    let lit = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(perp / ww * 2.4 + 1.2 + f32(k) * 0.7), 3.0);
    if (a > best) { best = a; shade = lit; }
  }
  let gap = 0.02 + 0.12 * brk;
  best *= select(1.0, smoothstep(gap - 0.01, gap + 0.01, abs(s - 0.5)), brk > 0.001);    // 真ん中が切れて、すき間が開く
  best *= 1.0 - smoothstep(reveal - 0.03, reveal, s);                                     // 端から伸びてくる
  shade += smoothstep(0.06, 0.0, abs(s - reveal)) * select(0.0, 0.8, reveal < 0.999);   // 伸びている先端は光る
  return vec2f(best, shade);
}

fn star4(p: vec2f, r: f32) -> f32 {
  let a = abs(p);
  return exp(-(a.x * a.y) * 9000.0 / (r * r)) * smoothstep(r, 0.0, length(p));
}

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.a.xy; let t = u.a.z; let m = u.b.xy;
  var uv0 = (fc.xy - 0.5 * res) / res.y; uv0.y = -uv0.y;
  let brk = u.c.x; let grw = u.c.y; let drp = u.c.z; let pulse = u.c.w;
  let uv = uv0 / (1.0 + 0.75 * brk * brk * (3.0 - 2.0 * brk) + 0.12 * pulse);    // 前へ進む: 窓も羅針盤も、ぐっと迫ってくる
  let par = m * 0.012;
  var col = vec3f(0.0);

  // ---- 霧と暗い壁 ----
  let fog = fbm(uv * 2.2 + vec2f(t * 0.03, 0.0)) * 0.6 + fbm(uv * 4.0 - vec2f(t * 0.05, t * 0.02)) * 0.4;
  col += vec3f(0.035) + vec3f(0.07) * fog * smoothstep(-0.5, 0.3, uv.y);

  // 柱と、遠くのアーチのリブ
  let colx = abs(fract((uv.x + par.x * 2.0) * 2.4 + 0.5) - 0.5);
  col += vec3f(0.045) * smoothstep(0.1, 0.0, colx) * smoothstep(-0.3, 0.4, uv.y);

  // ---- 背景の円形の羅針盤(タイトルの後ろ) ----
  let cc = vec2f(0.0, 0.2) + par;
  let cr = length(uv - cc);
  let cang = atan2(uv.y - cc.y, uv.x - cc.x);
  var dial = exp(-abs(cr - 0.46) * 520.0) * 0.5 + exp(-abs(cr - 0.4) * 700.0) * 0.25;
  let tick = smoothstep(0.985, 1.0, abs(sin(cang * 36.0 + t * 0.03)));
  dial += tick * smoothstep(0.03, 0.0, abs(cr - 0.43)) * 0.9;
  col += vec3f(0.5) * dial * step(0.0, uv.y - cc.y + 0.28);

  // ---- 左右のステンドグラスの窓 ----
  var glowSum = 0.0;
  for (var side = 0; side < 2; side++) {
    let sx = select(-1.0, 1.0, side == 1);
    let wc = vec2f(sx * 0.7 + par.x * 3.0, -0.43);
    let p = uv - wc;
    let w = 0.115; let h = 0.64;
    let d = sdArch(p, w, h);
    let inside = smoothstep(0.003, -0.003, d);
    let frame = smoothstep(0.03, 0.0, abs(d - 0.012)) * 0.35;           // 石の枠
    let g = glass(p, w, h, t, f32(side) * 3.7);
    let bright = (0.55 + 0.45 * smoothstep(-0.1, 0.5, p.y + 0.1)) * g;
    col = mix(col, vec3f(0.92, 0.93, 1.0) * bright, inside);
    col += vec3f(0.8) * frame;
    // 窓のにじみ
    let halo = exp(-max(d, 0.0) * 9.0) * 0.28;
    col += vec3f(0.55, 0.57, 0.8) * halo;
    glowSum += halo;
    // 窓の左右にもう1本ずつ、奥の暗い窓
    let wc2 = vec2f(sx * 0.4 + par.x * 1.6, -0.43);
    let d2 = sdArch(uv - wc2, 0.055, 0.42);
    col += vec3f(0.2, 0.2, 0.28) * smoothstep(0.004, -0.004, d2) * (0.5 + 0.5 * glass(uv - wc2, 0.055, 0.42, t, 9.0));
    col += vec3f(0.35) * smoothstep(0.014, 0.0, abs(d2 - 0.006)) * 0.3;
  }

  // ---- 窓から差し込む光の筋 ----
  for (var side = 0; side < 2; side++) {
    let sx = select(-1.0, 1.0, side == 1);
    let src = vec2f(sx * 0.7, 0.05);
    let v = uv - src;
    let ang = atan2(v.y, v.x * -sx);
    let rays = pow(0.5 + 0.5 * sin(ang * 22.0 + fbm(vec2f(ang * 3.0, t * 0.08)) * 5.0), 3.0);
    let fall = exp(-length(v) * 2.4) * smoothstep(0.0, 0.25, length(v));
    col += vec3f(0.6, 0.62, 0.9) * rays * fall * 0.22 * smoothstep(-0.3, 0.2, v.y * 1.0 + 0.4);
  }

  // ---- 床(黒い大理石に、窓の光が映り込む) ----
  let fy = -0.43 + par.y * 0.5;
  if (uv.y < fy) {
    let d = fy - uv.y;
    let ripple = vn(vec2f(uv.x * 28.0, d * 55.0 - t * 0.3)) * 0.6 + vn(vec2f(uv.x * 90.0, d * 140.0)) * 0.4;
    var fl = vec3f(0.02) + vec3f(0.03) * fbm(vec2f(uv.x * 6.0, d * 10.0));
    for (var side = 0; side < 2; side++) {
      let sx = select(-1.0, 1.0, side == 1);
      let dx = uv.x - sx * 0.7;
      let refl = exp(-dx * dx * 55.0) * exp(-d * 2.6) * (0.4 + 0.9 * ripple);
      fl += vec3f(0.75, 0.77, 1.0) * refl * 0.55;
    }
    // 大理石の筋
    let vein = smoothstep(0.03, 0.0, abs(fbm(vec2f(uv.x * 3.0, d * 6.0 + 3.0)) - 0.5));
    fl += vec3f(0.07) * vein;
    col = mix(col, fl, smoothstep(0.0, 0.01, d));
    col += vec3f(0.5) * exp(-abs(d) * 160.0) * 0.12;       // 床の奥の縁
  }

  // ---- 鎖(奥の2本が交差し、手前は大きくぼやける。Threats: 切れる / Knowledge: 上下から生える / Practice: 全部が下がっていく) ----
  let cu = uv0 - par * 1.5;
  let metal = vec3f(0.86, 0.88, 0.95);
  let dpA = drp * 1.5;
  let cA = chain(cu + vec2f(0.0, dpA), vec2f(-1.0, 0.5), vec2f(1.0, 0.02), 0.16, 0.034, t, 0.0, 1.0, brk);
  let cB = chain(cu + vec2f(0.0, dpA * 1.1), vec2f(-1.0, 0.0), vec2f(1.0, 0.52), 0.14, 0.032, t, 1.0, 1.0, brk);
  let cC = chain(cu + vec2f(0.0, dpA * 1.25), vec2f(-1.0, -0.38), vec2f(-0.1, -0.6), 0.1, 0.05, t, 2.0, 1.0, brk);
  let cD = chain(cu + vec2f(0.0, dpA * 1.15), vec2f(0.2, -0.6), vec2f(1.0, -0.2), 0.12, 0.085, t, 3.0, 1.0, brk);
  col = mix(col, metal * (0.12 + 0.75 * cA.y), cA.x);
  col = mix(col, metal * (0.12 + 0.75 * cB.y), cB.x);
  col = mix(col, metal * (0.08 + 0.55 * cC.y), cC.x * 0.85);
  col = mix(col, metal * (0.1 + 0.7 * cD.y), cD.x * 0.9);
  // Knowledge: 上から垂れ下がる鎖と、下からせり上がる鎖(順番に伸びる)
  for (var i = 0; i < 6; i++) {
    let fi = f32(i);
    let down = i < 3;
    let xs = array<f32, 6>(-0.62, 0.08, 0.58, -0.3, 0.34, 0.84);
    let ls = array<f32, 6>(0.05, 0.065, 0.048, 0.07, 0.05, 0.08);
    let rv = clamp(grw * 1.6 - fi * 0.13, 0.0, 1.0);
    let xx = xs[i] + 0.05 * sin(fi * 2.0);
    // 縦の鎖は、座標の x と y を入れ替えて描く(上の鎖は y=0.7 から下へ、下の鎖は y=-0.7 から上へ)
    let y0 = select(-0.7, 0.7, down);
    let y1 = select(0.25 + 0.1 * sin(fi), -0.28 + 0.1 * cos(fi), down);
    let ch = chain(vec2f(uv0.y + drp * 1.5, uv0.x - par.x), vec2f(y0, xx), vec2f(y1, xx + 0.08 * sin(fi * 3.0)), 0.04, ls[i], t, 4.0 + fi, rv, 0.0);
    let on = step(0.001, grw);
    col = mix(col, metal * (0.1 + 0.8 * ch.y), ch.x * on * select(0.8, 1.0, i % 2 == 0));
  }
  // 切れた瞬間の火花と、前へ飛んでくる鎖のかけら
  for (var i = 0; i < 22; i++) {
    let fi = f32(i);
    let ang = hash(vec2f(fi, 7.0)) * 6.2832;
    let spd = 0.25 + hash(vec2f(fi, 8.0)) * 0.9;
    let org = vec2f(0.0, 0.17) + (vec2f(hash(vec2f(fi, 9.0)), hash(vec2f(fi, 10.0))) - 0.5) * 0.25;
    let pp = org + vec2f(cos(ang), sin(ang)) * (brk * brk * spd * 1.6);
    let q = rot(t * 1.5 + fi) * (uv0 - pp);
    let sz = (0.008 + hash(vec2f(fi, 11.0)) * 0.008) * (1.0 + brk * 3.5);
    let ring = abs(length(q / vec2f(sz * 1.5, sz)) - 1.0) - 0.06;
    col += metal * smoothstep(0.1, -0.1, ring) * step(0.001, brk) * (1.0 - smoothstep(0.85, 1.0, brk)) * 0.85;
  }
  col += vec3f(1.0) * exp(-length(uv0 - vec2f(0.0, 0.17)) * 7.0) * pulse * brk * 0.6;
  // 前へ進む勢いの線(切り替え中だけ)
  let sa = atan2(uv0.y - 0.17, uv0.x); let sr = length(uv0 - vec2f(0.0, 0.17));
  col += vec3f(0.9) * pow(0.5 + 0.5 * sin(sa * 70.0 + hash(vec2f(floor(sa * 11.0), 3.0)) * 20.0), 6.0) * smoothstep(0.1, 0.9, sr) * pulse * 0.28 * brk;

  // ---- 手前の百合(白い花)のぼんやりした影 ----
  let lp = uv - vec2f(-0.76, -0.42);
  let lr = length(lp); let la = atan2(lp.y, lp.x);
  let flower = smoothstep(0.17 * (0.55 + 0.45 * abs(cos(la * 3.0 + 0.4))), 0.0, lr - 0.0);
  col += vec3f(0.85, 0.87, 0.95) * flower * 0.38 * (0.7 + 0.3 * sin(t * 0.5));
  let lp2 = uv - vec2f(-0.62, -0.5);
  col += vec3f(0.8) * smoothstep(0.12 * (0.5 + 0.5 * abs(cos(atan2(lp2.y, lp2.x) * 2.5))), 0.0, length(lp2)) * 0.28;

  // ---- 舞う花びら ----
  for (var i = 0; i < 14; i++) {
    let fi = f32(i);
    let sp = 0.04 + hash(vec2f(fi, 1.0)) * 0.05;
    let ph = fract(t * sp + hash(vec2f(fi, 2.0)));
    var pp = vec2f(mix(-1.0, 1.0, hash(vec2f(fi, 3.0))) + 0.18 * sin(t * 0.4 + fi * 2.0), mix(0.6, -0.55, ph));
    let q = rot(t * (0.4 + hash(vec2f(fi, 4.0))) + fi) * (uv0 - pp);
    let sz = 0.008 + hash(vec2f(fi, 5.0)) * 0.009;
    let e = length(q / vec2f(sz * 2.0, sz)) - 1.0;
    col += vec3f(0.9, 0.92, 1.0) * smoothstep(0.2, -0.2, e) * 0.55 * smoothstep(0.0, 0.12, ph) * smoothstep(1.0, 0.85, ph);
  }

  // ---- 光のちり ----
  let g1 = uv0 * 60.0 + vec2f(t * 0.3, t * 0.5);
  let hh = hash(floor(g1));
  col += vec3f(0.8) * step(0.985, hh) * smoothstep(0.3, 0.0, length(fract(g1) - 0.5)) * (0.4 + 0.6 * sin(t * 2.0 + hh * 50.0));

  // ---- 仕上げ: モノクロ+ほんのり青、ビネット、フィルムのざらつき ----
  let vg = length(fc.xy / res - 0.5);
  col *= 1.0 - smoothstep(0.3, 0.9, vg) * 0.7;
  col += (hash(fc.xy + t) - 0.5) * 0.025;
  col = col / (1.0 + col * 0.45);
  let lum = dot(col, vec3f(0.3, 0.59, 0.11));
  return vec4f(pow(mix(vec3f(lum), col, 0.35) * vec3f(0.97, 0.98, 1.03), vec3f(0.9)), 1.0);
}
`;

// モード: threats = 鎖が切れて前に進む / knowledge = 鎖が上下から生える / practice = 鎖が全部下がっていく
const MODES = ['brk', 'grw', 'drp'];
const KEY = { threats: 'brk', knowledge: 'grw', practice: 'drp' };
const DUR = 2.2;
const st = Object.fromEntries(MODES.map(k => [k, { from: 0, to: 0, start: -10 }]));
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cur = (k, now) => { const m = st[k], x = Math.min(1, Math.max(0, (now - m.start) / DUR)); return { v: m.from + (m.to - m.from) * ease(x), x }; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let active = null;

export const test2 = createGpuView(WGSL, now => {
  let pulse = 0;
  const v = MODES.map(k => { const c = cur(k, now); if (c.x < 1) pulse = Math.max(pulse, Math.sin(Math.PI * c.x)); return c.v; });
  return [v[0], v[1], v[2], reduce ? 0 : pulse];
});

// 同じモードをもう一度押すと元に戻る。ほかのモードに切り替えると、今のモードは元に戻りながら次が始まる
export function setMode(name) {
  const now = performance.now() / 1000;
  const next = active === name ? null : name;
  MODES.forEach(k => {
    const to = next && KEY[next] === k ? 1 : 0, c = cur(k, now);
    if (st[k].to !== to) st[k] = { from: c.v, to, start: now };
  });
  active = next;
  return active;
}
export { WGSL };
