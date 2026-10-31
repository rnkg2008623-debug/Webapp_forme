// ネオン風の3D背景(WebGPU)。夕焼けの空・縞のある太陽・遠くへ流れる光のグリッド床を、フラグメントシェーダで描く。
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

fn ridge(x: f32) -> f32 {
  return 0.5 * sin(x * 3.1 + 1.0) + 0.3 * sin(x * 7.3 + 2.0) + 0.2 * sin(x * 15.7);
}

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.a.xy;
  let t = u.a.z;
  let m = u.b.xy;
  var uv = (fc.xy - 0.5 * res) / res.y;
  uv.y = -uv.y;
  uv.x -= m.x * 0.025;
  let hz = -0.1 + m.y * 0.02;

  let cyan = vec3f(0.1, 0.95, 1.0);
  let pink = vec3f(1.0, 0.1, 0.7);
  let violet = vec3f(0.45, 0.15, 1.0);

  // ---- 空 ----
  let sy = clamp((uv.y - hz) / 0.7, 0.0, 1.0);
  var sky = mix(vec3f(0.95, 0.12, 0.55), vec3f(0.28, 0.06, 0.5), pow(sy, 0.55));
  sky = mix(sky, vec3f(0.02, 0.0, 0.1), smoothstep(0.25, 1.0, sy));

  // 星
  let sg = floor(uv * 90.0);
  let sh = hash(sg);
  let sd = length(fract(uv * 90.0) - 0.5);
  let star = step(0.985, sh) * smoothstep(0.22, 0.0, sd) * (0.5 + 0.5 * sin(t * 2.0 + sh * 40.0));
  sky += vec3f(star) * smoothstep(0.15, 0.6, sy);

  // 太陽
  let sc = vec2f(0.0, hz + 0.25);
  let sp = uv - sc;
  let sr = length(sp);
  let disc = smoothstep(0.262, 0.255, sr);
  let lowy = clamp((sc.y - uv.y) / 0.26, 0.0, 1.0);
  let stripe = step(0.0, sin((uv.y * 52.0) + t * 0.6) + 1.4 - lowy * 2.2);
  let sunCol = mix(vec3f(1.0, 0.85, 0.2), vec3f(1.0, 0.15, 0.6), clamp((sc.y + 0.26 - uv.y) / 0.52, 0.0, 1.0));
  sky = mix(sky, sunCol, disc * select(1.0, stripe, uv.y < sc.y));
  sky += pink * exp(-max(sr - 0.255, 0.0) * 7.0) * 0.55;

  // 遠くの山
  let mh = hz + 0.035 + 0.045 * (ridge(uv.x * 2.2 + 3.0) * 0.5 + 0.5);
  let mtn = smoothstep(mh, mh - 0.002, uv.y);
  let medge = exp(-abs(uv.y - mh) * 160.0);
  sky = mix(sky, vec3f(0.05, 0.0, 0.14), mtn);
  sky += cyan * medge * 0.6 * step(hz, uv.y);

  // ---- 床(グリッド) ----
  let d = max(hz - uv.y, 0.0005);
  let z = 0.32 / d;
  let wx = uv.x * z * 2.0;
  let wz = z + t * 1.6;
  let w = 0.015 + 0.012 * z;
  let dx = abs(fract(wx + 0.5) - 0.5);
  let dz = abs(fract(wz * 0.5 + 0.5) - 0.5);
  let g = max(1.0 - smoothstep(0.0, w, dx), 1.0 - smoothstep(0.0, w * 1.6, dz));
  let fog = exp(-z * 0.12);
  let gridCol = mix(cyan, pink, clamp(0.5 + 0.5 * sin(wz * 0.15 + t * 0.4), 0.0, 1.0));
  var floorC = mix(vec3f(0.01, 0.0, 0.05), violet * 0.25, exp(-d * 9.0));
  floorC += gridCol * g * fog * 1.5;
  floorC += pink * exp(-d * 18.0) * 0.5;

  var col = select(sky, floorC, uv.y < hz);
  // 地平線の光
  col += mix(pink, cyan, 0.35) * exp(-abs(uv.y - hz) * 90.0) * 0.9;

  // ビネット
  let vg = length((fc.xy / res) - 0.5);
  col *= 1.0 - smoothstep(0.35, 0.9, vg) * 0.55;
  col = col / (1.0 + col * 0.25);
  return vec4f(pow(col, vec3f(0.95)), 1.0);
}
`;

let adapter = null, canvas = null, raf = 0, running = false, device = null, ctx = null, pipeline = null, buf = null, bind = null;
const mouse = [0, 0, 0, 0], target = [0, 0];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const gpuSupported = () => !!navigator.gpu;

async function init(host) {
  adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('no adapter');
  device = await adapter.requestDevice();
  device.lost.then(info => { console.warn('WebGPU device lost:', info.message); stopNeon(); document.documentElement.classList.remove('neon-gpu'); });
  device.addEventListener('uncapturederror', e => console.warn('WebGPU error:', e.error.message));
  canvas = document.createElement('canvas');
  canvas.className = 'bg-gpu';
  host.appendChild(canvas);
  ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'opaque' });
  const module = device.createShaderModule({ code: WGSL });
  pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });
  buf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: buf } }] });
  window.addEventListener('pointermove', e => { target[0] = e.clientX / innerWidth * 2 - 1; target[1] = e.clientY / innerHeight * 2 - 1; });
}

function frame(now) {
  if (!running) return;
  raf = requestAnimationFrame(frame);
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  mouse[0] += (target[0] - mouse[0]) * 0.05; mouse[1] += (target[1] - mouse[1]) * 0.05;
  const time = reduce ? 0 : now / 1000;
  device.queue.writeBuffer(buf, 0, new Float32Array([w, h, time, 0, mouse[0], mouse[1], 0, 0]));
  const enc = device.createCommandEncoder();
  const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
  pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
  device.queue.submit([enc.finish()]);
}

// 描画を始める。成功したら true、WebGPUが使えなければ false(CSSの簡易ネオンのまま)。
export async function startNeon(host) {
  if (!gpuSupported()) return false;
  try {
    if (!canvas) await init(host);
    canvas.hidden = false;
    if (!running) { running = true; raf = requestAnimationFrame(frame); }
    return true;
  } catch (e) { console.warn('WebGPU init failed', e); return false; }
}

export function stopNeon() {
  running = false; cancelAnimationFrame(raf);
  if (canvas) canvas.hidden = true;
}

document.addEventListener('visibilitychange', () => {
  if (!canvas || canvas.hidden) return;
  if (document.hidden) { running = false; cancelAnimationFrame(raf); }
  else if (!running) { running = true; raf = requestAnimationFrame(frame); }
});
