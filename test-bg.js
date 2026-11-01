// Test ページの背景(WebGPU): ドットの地球・光の軌道リング・ふわふわ浮かぶガラスの結晶・きらめき。ページを開いている間、ずっと動き続ける。
const WGSL = /* wgsl */ `
struct U { a: vec4f, b: vec4f, c: vec4f };   // a = (幅, 高さ, 時間, 0)  b = (マウスX, マウスY, 0, 0)  c = (赤への進み具合 0..1, 切り替え中の勢い, 衝撃波の経過時間, 0)
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
fn hash3(p: vec3f) -> f32 { return fract(sin(dot(p, vec3f(12.9898, 78.233, 37.719))) * 43758.5453); }
fn vnoise(p: vec3f) -> f32 {
  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3f(1, 0, 0)), w.x), mix(hash3(i + vec3f(0, 1, 0)), hash3(i + vec3f(1, 1, 0)), w.x), w.y),
             mix(mix(hash3(i + vec3f(0, 0, 1)), hash3(i + vec3f(1, 0, 1)), w.x), mix(hash3(i + vec3f(0, 1, 1)), hash3(i + vec3f(1, 1, 1)), w.x), w.y), w.z);
}
fn rot(a: f32) -> mat2x2f { let c = cos(a); let s = sin(a); return mat2x2f(c, s, -s, c); }

// 傾いた平行四辺形(ガラスの結晶)の符号付き距離
fn sdCrystal(p: vec2f, size: vec2f, skew: f32) -> f32 {
  var q = p; q.x -= q.y * skew;
  let d = abs(q) - size;
  return length(max(d, vec2f(0))) + min(max(d.x, d.y), 0.0);
}

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.a.xy; let t = u.a.z; let m = u.b.xy;
  var uv = (fc.xy - 0.5 * res) / res.y; uv.y = -uv.y;
  let par = m * 0.015;
  let prog = u.c.x;                       // 0 = 紫 / 1 = 赤
  let pulse = u.c.y;                      // 切り替えの最中だけ大きくなる勢い
  let shockAge = u.c.z;

  let violet = mix(vec3f(0.45, 0.32, 1.0), vec3f(1.0, 0.13, 0.2), prog);
  let lilac = mix(vec3f(0.72, 0.62, 1.0), vec3f(1.0, 0.5, 0.42), prog);
  let blue = mix(vec3f(0.35, 0.55, 1.0), vec3f(1.0, 0.3, 0.08), prog);

  // ---- 背景(深い紫の闇+大きな光のうねり) ----
  var col = mix(mix(vec3f(0.03, 0.02, 0.09), vec3f(0.09, 0.015, 0.025), prog), mix(vec3f(0.015, 0.01, 0.05), vec3f(0.04, 0.005, 0.01), prog), clamp(uv.y + 0.5, 0.0, 1.0));
  col += violet * 0.22 * exp(-length((uv - vec2f(-0.8, -0.55)) * vec2f(0.8, 1.7)) * 2.2);
  col += blue * 0.12 * exp(-length((uv - vec2f(0.9, 0.25)) * vec2f(1.0, 1.3)) * 2.6);
  let sw = uv.y + 0.34 - prog * 0.5 + 0.06 * sin(uv.x * 2.3 + t * 0.35 + prog * 5.0) - uv.x * (0.18 - prog * 0.5);
  col += violet * 0.5 * exp(-abs(sw) * 38.0) * smoothstep(-0.2, 1.1, -uv.x * 0.7 + 0.5);
  let sw2 = uv.y + 0.44 + 0.05 * sin(uv.x * 1.7 - t * 0.3 + 1.0);
  col += lilac * 0.32 * exp(-abs(sw2) * 70.0) * smoothstep(0.1, 0.9, uv.x * 0.5 + 0.55);

  // ---- 右上へ走る光の筋 ----
  let ac = vec2f(-0.55, -1.7);
  let ad = abs(length(uv - ac) - 2.15);
  col += lilac * exp(-ad * 220.0) * 0.9 * smoothstep(0.2, 0.8, uv.x) * (0.7 + 0.3 * sin(t * 1.3));
  col += violet * exp(-ad * 26.0) * 0.12 * smoothstep(0.1, 0.9, uv.x);

  // ---- 地球(ドットの球) ----
  let eased = prog * prog * (3.0 - 2.0 * prog);
  let gc = vec2f(mix(0.0, 0.2, eased) + 0.12 * sin(prog * 3.14159), mix(0.04, -0.1, eased)) + par;   // 動かす: 横へ滑りながら、ぐっと近づく
  let R = 0.32 * (1.0 + 0.55 * eased + 0.35 * pulse);
  let gp = (uv - gc) / R;
  let rr = dot(gp, gp);
  let inside = step(rr, 1.0);
  let zz = sqrt(max(1.0 - rr, 0.0));
  var n = vec3f(gp.x, gp.y, zz);
  let spin = t * 0.12 + prog * 9.0;
  let cs = cos(spin); let sn = sin(spin);
  let nr = vec3f(n.x * cs + n.z * sn, n.y, -n.x * sn + n.z * cs);
  let lat = asin(clamp(nr.y, -1.0, 1.0));
  let lon = atan2(nr.x, nr.z);
  let dl = 0.043;
  let cell = vec2f(lon, lat) / dl;
  let f = fract(cell) - 0.5;
  let sc = vec2f(cos(lat), 1.0);
  let dd = length(f * sc);
  let land = smoothstep(0.46, 0.56, vnoise(vec3f(nr * 2.6)) * 0.65 + vnoise(vec3f(nr * 6.0)) * 0.35);
  let dotm = smoothstep(0.34, 0.2, dd);
  let L = normalize(vec3f(-0.5, 0.7, 0.55));
  let lit = 0.18 + 0.95 * max(dot(n, L), 0.0);
  let rim = pow(1.0 - zz, 2.6);
  var globe = vec3f(0.015, 0.012, 0.06) + violet * 0.06 * (1.0 - rr);
  globe += mix(mix(vec3f(0.5, 0.45, 1.0), vec3f(1.0, 0.4, 0.38), prog), lilac, rim) * dotm * (0.05 + 1.0 * land) * lit * 1.5;
  globe += blue * rim * 0.55;
  // 球の外側にもうっすら光のにじみ
  let halo = exp(-max(sqrt(rr) - 1.0, 0.0) * 14.0) * (1.0 - inside) * 0.5;
  col += violet * halo * (0.5 + 0.5 * smoothstep(-0.6, 0.8, uv.y - gc.y + 0.3));

  // ---- 軌道のリング(奥は球に隠れ、手前は球の上を通る) ----
  var ringBack = vec3f(0.0); var ringFront = vec3f(0.0);
  for (var k = 0; k < 3; k++) {
    let kf = f32(k);
    let ang = -0.42 - kf * 0.07 + prog * (1.15 + kf * 0.35) + pulse * 0.25;
    let q0 = (uv - gc - vec2f(0.0, -kf * 0.02)) * rot(ang);
    let q = vec2f(q0.x, q0.y * (2.9 + kf * 0.5));
    let rad = 0.78 + kf * 0.12;
    let d = abs(length(q) - rad * (1.0 + 0.25 * eased)) / (2.9 + kf * 0.5 - 1.0) * 1.0;
    let theta = atan2(q.y, q.x);
    let sweep = pow(0.5 + 0.5 * cos(theta - t * (0.45 + kf * 0.12) * (1.0 + pulse * 6.0) - kf * 2.0 - prog * 7.0), 3.0);
    let core = exp(-d * (260.0 - kf * 60.0)) * (0.35 + 1.5 * sweep);
    let glow = exp(-d * 28.0) * (0.04 + 0.28 * sweep);
    let c = (lilac * core + violet * glow) * (1.0 - kf * 0.28);
    let front = step(0.0, -q.y);          // 画面の下側 = 手前
    ringFront += c * front; ringBack += c * (1.0 - front);
  }
  col += ringBack * (1.0 - inside);
  col = mix(col, globe, inside);
  col += ringFront;

  // ---- ふわふわ浮かぶガラスの結晶 ----
  for (var i = 0; i < 5; i++) {
    let fi = f32(i);
    let base = array<vec2f, 5>(vec2f(-0.62, 0.3), vec2f(0.8, -0.12), vec2f(-0.97, 0.05), vec2f(0.95, -0.42), vec2f(0.45, 0.42));
    let sz = array<f32, 5>(0.09, 0.075, 0.12, 0.06, 0.03);
    var p = uv - base[i] - par * (1.0 + fi * 0.6);
    p += vec2f(0.012 * sin(t * 0.5 + fi * 2.0), 0.02 * sin(t * 0.7 + fi * 3.1));
    p -= vec2f(sin(fi * 2.4 + 1.0), cos(fi * 1.7)) * (0.35 * eased + 0.15 * pulse);   // 結晶が弾き飛ばされる
    p = p * rot(0.5 * sin(t * 0.25 + fi) + fi * 0.9);
    let d = sdCrystal(p, vec2f(sz[i], sz[i] * 1.25), 0.45);
    let body = smoothstep(0.003, -0.003, d);
    let edge = exp(-abs(d) * 160.0);
    let g = clamp(0.5 + p.y / (sz[i] * 3.0) + p.x * 1.5, 0.0, 1.0);
    let glass = mix(vec3f(0.12, 0.08, 0.3), vec3f(0.5, 0.4, 0.95), g);
    col = mix(col, glass, body * 0.7);
    col += lilac * edge * (0.45 + 0.4 * sin(t * 0.8 + fi));
  }

  // ---- 衝撃波(切り替えの瞬間に、地球の中心から広がる) ----
  let shR = shockAge * 1.7;
  let shD = abs(length((uv - gc) * vec2f(1.0, 1.0)) - shR);
  col += lilac * exp(-shD * 38.0) * exp(-shockAge * 2.2) * 1.4 * step(shockAge, 3.0);
  col += violet * 0.18 * pulse;
  // ---- きらめき ----
  let g1 = uv * 70.0 + vec2f(0.0, t * 0.4 + prog * 6.0 + pulse * 3.0);
  let id = floor(g1); let h = hash(id);
  let sp = length(fract(g1) - 0.5);
  col += lilac * step(0.975, h) * smoothstep(0.26, 0.0, sp) * (0.35 + 0.65 * sin(t * 2.2 + h * 60.0));
  let g2 = uv * 22.0 + vec2f(t * 0.05, -t * 0.12);
  let h2 = hash(floor(g2) + 17.0);
  col += blue * step(0.985, h2) * smoothstep(0.2, 0.0, length(fract(g2) - 0.5)) * 0.8;

  // ビネット
  let vg = length(fc.xy / res - 0.5);
  col *= 1.0 - smoothstep(0.4, 0.95, vg) * 0.5;
  col = col / (1.0 + col * 0.35);
  return vec4f(pow(col, vec3f(0.92)), 1.0);
}
`;

let adapter = null, device = null, canvas = null, ctx = null, pipeline = null, buf = null, bind = null;
let raf = 0, running = false;
const mouse = [0, 0], target = [0, 0];
// 赤への切り替え: 1.8秒かけて動く(途中が一番勢いが強い)
const mode = { from: 0, to: 0, start: -10, shock: -10, host: null };
const DUR = 1.8;
const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export function setRed(on, host) {
  const now = performance.now() / 1000;
  const cur = current(now);
  mode.from = cur.prog; mode.to = on ? 1 : 0; mode.start = now; mode.shock = now;
  (host || mode.host)?.classList.toggle('red', on);
}
export const isRed = () => mode.to === 1;
function current(now) {
  const k = Math.min(1, Math.max(0, (now - mode.start) / DUR));
  return { prog: mode.from + (mode.to - mode.from) * ease(k), pulse: Math.sin(Math.PI * k) * (k < 1 ? 1 : 0) };
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const gpuSupported = () => !!navigator.gpu;

async function init(host) {
  adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('no adapter');
  device = await adapter.requestDevice();
  device.lost.then(info => { console.warn('WebGPU device lost:', info.message); stopTest(); host.classList.add('no-gpu'); });
  device.addEventListener('uncapturederror', e => console.warn('WebGPU error:', e.error.message));
  canvas = document.createElement('canvas');
  canvas.className = 'ts-gpu';
  host.prepend(canvas);
  ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'opaque' });
  const module = device.createShaderModule({ code: WGSL });
  pipeline = device.createRenderPipeline({
    layout: 'auto', vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' },
  });
  buf = device.createBuffer({ size: 48, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: buf } }] });
  window.addEventListener('pointermove', e => { target[0] = e.clientX / innerWidth * 2 - 1; target[1] = -(e.clientY / innerHeight * 2 - 1); });
}

function frame(now) {
  if (!running) return;
  raf = requestAnimationFrame(frame);
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  mouse[0] += (target[0] - mouse[0]) * 0.05; mouse[1] += (target[1] - mouse[1]) * 0.05;
  const sec = now / 1000, cur = current(performance.now() / 1000);
  device.queue.writeBuffer(buf, 0, new Float32Array([w, h, reduce ? 4 : sec, 0, mouse[0], mouse[1], 0, 0, cur.prog, reduce ? 0 : cur.pulse, performance.now() / 1000 - mode.shock, 0]));
  const enc = device.createCommandEncoder();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
}

export async function startTest(host) {
  mode.host = host;
  if (!gpuSupported()) { host.classList.add('no-gpu'); return false; }
  try {
    if (!canvas) await init(host);
    host.classList.remove('no-gpu');
    if (!running) { running = true; raf = requestAnimationFrame(frame); }
    return true;
  } catch (e) { console.warn('WebGPU init failed', e); host.classList.add('no-gpu'); return false; }
}
export function stopTest() { running = false; cancelAnimationFrame(raf); }

document.addEventListener('visibilitychange', () => {
  if (!canvas || !device) return;
  if (document.hidden) { running = false; cancelAnimationFrame(raf); }
  else if (document.body.dataset.view === 'test' && !running) { running = true; raf = requestAnimationFrame(frame); }
});
