// Test2 の背景(WebGPU): 白黒のゴシックの大聖堂。ステンドグラスの光の筋・揺れる鎖・舞う花びら・床への映り込み。
import { createGpuView } from './gpu-view.js?v=36';

const WGSL = /* wgsl */ `
struct U { a: vec4f, b: vec4f };   // a = (幅, 高さ, 時間, 0)  b = (マウスX, マウスY, 0, 0)
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
fn chain(uv: vec2f, p0: vec2f, p1: vec2f, sag: f32, link: f32, t: f32, seed: f32) -> vec2f {
  let dx = p1.x - p0.x;
  let s = clamp((uv.x - p0.x) / dx, -0.2, 1.2);
  let sway = 0.012 * sin(t * 0.8 + seed * 3.0 + s * 4.0);
  let yc = mix(p0.y, p1.y, s) - sag * 4.0 * s * (1.0 - s) + sway;
  let slope = ((p1.y - p0.y) - sag * 4.0 * (1.0 - 2.0 * s)) / dx;
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
  return vec2f(best, shade);
}

fn star4(p: vec2f, r: f32) -> f32 {
  let a = abs(p);
  return exp(-(a.x * a.y) * 9000.0 / (r * r)) * smoothstep(r, 0.0, length(p));
}

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.a.xy; let t = u.a.z; let m = u.b.xy;
  var uv = (fc.xy - 0.5 * res) / res.y; uv.y = -uv.y;
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

  // ---- 鎖(奥の2本が交差し、手前は大きくぼやける) ----
  let cu = uv - par * 1.5;
  var chainAcc = vec3f(0.0); var cover = 0.0;
  let cA = chain(cu, vec2f(-1.0, 0.5), vec2f(1.0, 0.02), 0.16, 0.034, t, 0.0);
  let cB = chain(cu, vec2f(-1.0, 0.0), vec2f(1.0, 0.52), 0.14, 0.032, t, 1.0);
  let cC = chain(cu, vec2f(-1.0, -0.38), vec2f(-0.1, -0.6), 0.1, 0.05, t, 2.0);
  let cD = chain(cu, vec2f(0.2, -0.6), vec2f(1.0, -0.2), 0.12, 0.085, t, 3.0);
  let metal = vec3f(0.86, 0.88, 0.95);
  col = mix(col, metal * (0.12 + 0.75 * cA.y), cA.x);
  col = mix(col, metal * (0.12 + 0.75 * cB.y), cB.x);
  col = mix(col, metal * (0.08 + 0.55 * cC.y), cC.x * 0.85);
  col = mix(col, metal * (0.1 + 0.7 * cD.y), cD.x * 0.9);
  // 鎖のきらめき
  let gl = 0.5 + 0.5 * sin(t * 1.3 + uv.x * 6.0);
  col += vec3f(1.0) * star4(fract(uv * 6.0 + vec2f(0.0, 0.0)) - 0.5, 0.08) * 0.0;

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
    let q = rot(t * (0.4 + hash(vec2f(fi, 4.0))) + fi) * (uv - pp);
    let sz = 0.008 + hash(vec2f(fi, 5.0)) * 0.009;
    let e = length(q / vec2f(sz * 2.0, sz)) - 1.0;
    col += vec3f(0.9, 0.92, 1.0) * smoothstep(0.2, -0.2, e) * 0.55 * smoothstep(0.0, 0.12, ph) * smoothstep(1.0, 0.85, ph);
  }

  // ---- 光のちり ----
  let g1 = uv * 60.0 + vec2f(t * 0.3, t * 0.5);
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

export const test2 = createGpuView(WGSL);
export { WGSL };
