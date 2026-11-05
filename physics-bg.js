// Physics 画面の背景(WebGPU): 白黒のゴシックの大聖堂に、月のように浮かぶ惑星・軌道リング・床の魔法陣・ステンドグラスの光。
export const WGSL = /* wgsl */ `
struct U { a: vec4f, b: vec4f, c: vec4f };   // a = (幅, 高さ, 時間, 0)  b = (マウスX, マウスY, 0, 0)  c = 予備
@group(0) @binding(0) var<uniform> u: U;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(p[i], 0, 1);
}
fn hash(p: vec2f) -> f32 { var q = fract(p * vec2f(123.34, 456.21)); q += dot(q, q + 45.32); return fract(q.x * q.y); }
fn vn(p: vec2f) -> f32 { let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1, 0)), w.x), mix(hash(i + vec2f(0, 1)), hash(i + vec2f(1, 1)), w.x), w.y); }
fn fbm(p: vec2f) -> f32 { var s = 0.0; var a = 0.5; var q = p; for (var i = 0; i < 5; i++) { s += a * vn(q); q = q * 2.03 + vec2f(1.7, 9.2); a *= 0.5; } return s; }
fn rot(a: f32) -> mat2x2f { let c = cos(a); let s = sin(a); return mat2x2f(c, s, -s, c); }

fn sdArch(p: vec2f, w: f32, h: f32) -> f32 {
  let q = vec2f(abs(p.x), p.y); let r = w * 2.0; let c = vec2f(w - r, h);
  let dArc = length(q - c) - r;
  let body = select(max(q.x - w, -q.y), dArc, q.y > h);
  return max(body, select(-1.0, dArc, q.y > h && q.x < w + 0.0001));
}
fn glass(p: vec2f, w: f32, h: f32, t: f32, seed: f32) -> f32 {
  let g = p * 24.0;
  let dia = abs(fract((g.x + g.y) * 0.5) - 0.5) + abs(fract((g.x - g.y) * 0.5) - 0.5);
  let lead = smoothstep(0.03, 0.09, abs(dia - 0.5));
  let mull = smoothstep(0.004, 0.012, abs(p.x)) * smoothstep(0.004, 0.012, abs(abs(p.x) - w * 0.5));
  return lead * mull * (0.5 + 0.5 * vn(p * 9.0 + seed) + 0.1 * sin(t * 0.4 + seed));
}
fn star4(p: vec2f, r: f32) -> f32 { let a = abs(p); return exp(-(a.x * a.y) * 9000.0 / (r * r)) * smoothstep(r, 0.0, length(p)); }

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.a.xy; let t = u.a.z; let m = u.b.xy;
  var uv = (fc.xy - 0.5 * res) / res.y; uv.y = -uv.y;
  let par = m * 0.012;
  let ice = vec3f(0.78, 0.8, 1.0);
  var col = vec3f(0.012, 0.012, 0.02);

  // ---- 霧 ----
  let fog = fbm(uv * 2.0 + vec2f(t * 0.02, 0.0));
  col += vec3f(0.05, 0.05, 0.08) * fog * smoothstep(-0.5, 0.45, uv.y);

  // ---- 惑星(地平線に浮かぶ月) ----
  let mc = vec2f(0.0, -0.5) + par;
  let R = 0.56;
  let mp = (uv - mc) / R;
  let rr = dot(mp, mp);
  let inside = step(rr, 1.0);
  let z = sqrt(max(1.0 - rr, 0.0));
  let n = vec3f(mp.x, mp.y, z);
  let sp = t * 0.03;
  let nr = vec3f(n.x * cos(sp) + n.z * sin(sp), n.y, -n.x * sin(sp) + n.z * cos(sp));
  let surf = fbm(nr.xy * 3.2 + nr.z * 2.0);
  let crater = smoothstep(0.55, 0.62, fbm(nr.xy * 7.0 + vec2f(nr.z * 5.0, 3.0)));
  let L = normalize(vec3f(-0.25, 0.85, 0.45));
  let lit = pow(max(dot(n, L), 0.0), 0.8);
  var moon = vec3f(0.55, 0.58, 0.72) * (0.06 + 0.6 * lit) * (0.45 + 0.8 * surf) * (1.0 - 0.4 * crater);
  let rim = pow(1.0 - z, 3.0);
  moon += vec3f(0.85, 0.9, 1.0) * rim * 1.3 * smoothstep(-0.2, 0.6, mp.y);
  let halo = exp(-max(sqrt(rr) - 1.0, 0.0) * 8.0) * (1.0 - inside);
  col += ice * halo * 0.4;
  col = mix(col, moon, inside);

  // ---- 上に浮かぶ軌道リング ----
  let rc = vec2f(0.0, 0.4) + par * 2.0;
  for (var k = 0; k < 3; k++) {
    let kf = f32(k);
    let q0 = (uv - rc) * rot(-0.28 + kf * 0.22 * select(-1.0, 1.0, k % 2 == 0));
    let q = vec2f(q0.x, q0.y * (3.4 + kf * 0.7));
    let rad = 0.62 + kf * 0.09;
    let d = abs(length(q) - rad) / (2.4 + kf * 0.7);
    let theta = atan2(q.y, q.x);
    let sweep = pow(0.5 + 0.5 * cos(theta - t * (0.35 + kf * 0.1) - kf * 2.0), 4.0);
    col += ice * (exp(-d * 330.0) * (0.3 + 1.6 * sweep) + exp(-d * 30.0) * (0.03 + 0.25 * sweep));
  }

  // ---- 左右のステンドグラスの窓 ----
  for (var side = 0; side < 2; side++) {
    let sx = select(-1.0, 1.0, side == 1);
    let wc = vec2f(sx * 0.8 + par.x * 3.0, -0.5);
    let p = uv - wc;
    let d = sdArch(p, 0.12, 0.62);
    let inw = smoothstep(0.003, -0.003, d);
    let g = glass(p, 0.12, 0.62, t, f32(side) * 3.7);
    col = mix(col, vec3f(0.9, 0.92, 1.0) * (0.35 + 0.65 * smoothstep(-0.1, 0.5, p.y + 0.1)) * g, inw);
    col += vec3f(0.8) * smoothstep(0.03, 0.0, abs(d - 0.012)) * 0.3;
    col += vec3f(0.5, 0.52, 0.8) * exp(-max(d, 0.0) * 9.0) * 0.3;
    // 柱(窓の外側)
    let px = abs(uv.x - sx * 0.96);
    col += vec3f(0.05) * smoothstep(0.05, 0.0, px) * smoothstep(-0.5, 0.4, uv.y);
  }

  // ---- 床(反射する魔法陣) ----
  let fy = -0.34 + par.y * 0.5;
  if (uv.y < fy) {
    let d = fy - uv.y;
    let zz = 0.28 / (d + 0.015);
    let fx = uv.x * zz * 2.2;
    let r = length(vec2f(fx, zz - 1.0));
    let ringD = abs(fract(r * 0.7 + 0.5) - 0.5);
    let spoke = abs(fract(atan2(fx, zz - 1.0) * 8.0 / 6.2832 + 0.5) - 0.5);
    let fade = exp(-zz * 0.09);
    var fl = vec3f(0.012, 0.012, 0.02) + vec3f(0.03) * fbm(vec2f(uv.x * 5.0, d * 9.0));
    fl += ice * ((1.0 - smoothstep(0.0, 0.03 + 0.01 * zz, ringD)) * 0.9 + (1.0 - smoothstep(0.0, 0.012 + 0.004 * zz, spoke)) * smoothstep(0.5, 2.5, r) * 0.5) * fade;
    fl += ice * exp(-uv.x * uv.x * 14.0) * exp(-d * 2.5) * (0.5 + 0.5 * vn(vec2f(uv.x * 30.0, d * 60.0 - t * 0.3))) * 0.6;   // 中央の光の筋の映り込み
    col = mix(col, fl, smoothstep(0.0, 0.012, d));
    col += ice * exp(-d * 120.0) * 0.18;
  }

  // ---- 中央の光の柱 ----
  col += ice * exp(-uv.x * uv.x * 90.0) * smoothstep(0.1, -0.5, uv.y - 0.1) * 0.1 * (0.8 + 0.2 * sin(t * 0.7));

  // ---- きらめき(カードの角あたり) ----
  for (var i = 0; i < 16; i++) {
    let fi = f32(i);
    let sp2 = vec2f((hash(vec2f(fi, 1.0)) - 0.5) * 1.7, (hash(vec2f(fi, 2.0)) - 0.5) * 0.9 - 0.1);
    col += ice * star4(uv - sp2, 0.05 + hash(vec2f(fi, 3.0)) * 0.04) * (0.4 + 0.6 * sin(t * (1.2 + hash(vec2f(fi, 4.0))) + fi * 3.0)) * 0.8;
  }
  let g1 = uv * 70.0 + vec2f(0.0, t * 0.3); let hh = hash(floor(g1));
  col += vec3f(0.85) * step(0.985, hh) * smoothstep(0.3, 0.0, length(fract(g1) - 0.5)) * (0.4 + 0.6 * sin(t * 2.0 + hh * 50.0));

  // ---- 仕上げ ----
  let vg = length(fc.xy / res - 0.5);
  col *= 1.0 - smoothstep(0.35, 0.95, vg) * 0.65;
  col += (hash(fc.xy + t) - 0.5) * 0.02;
  col = col / (1.0 + col * 0.45);
  let lum = dot(col, vec3f(0.3, 0.59, 0.11));
  return vec4f(pow(mix(vec3f(lum), col, 0.4) * vec3f(0.97, 0.98, 1.03), vec3f(0.9)), 1.0);
}
`;
