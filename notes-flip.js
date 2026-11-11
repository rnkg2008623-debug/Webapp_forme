// Notes のページめくり(WebGPU): 今のページと次のページの絵(2D canvas)を2枚のテクスチャにして、
// 紙がくるっと丸まってめくれるようすを、シェーダで描く。WebGPUが使えないときは false を返す(呼び出し側がCSSで代用する)。
export const WGSL = /* wgsl */`
struct U { res: vec2f, p: f32, a: f32, };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var smp: sampler;
@group(0) @binding(2) var tOld: texture_2d<f32>;
@group(0) @binding(3) var tNew: texture_2d<f32>;
struct VOut { @builtin(position) pos: vec4f, @location(0) uv: vec2f, };
@vertex fn vs(@builtin(vertex_index) i: u32) -> VOut {
  var q = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var o: VOut; o.pos = vec4f(q[i], 0.0, 1.0); o.uv = vec2f((q[i].x + 1.0) * 0.5, (1.0 - q[i].y) * 0.5); return o;
}
fn inside(v: vec2f) -> bool { return v.x >= 0.0 && v.x <= 1.0 && v.y >= 0.0 && v.y <= 1.0; }
fn old(v: vec2f) -> vec3f { return textureSampleLevel(tOld, smp, v, 0.0).rgb; }
@fragment fn fs(@location(0) uv: vec2f) -> @location(0) vec4f {
  let A = u.a;
  let P = vec2f(uv.x * A, uv.y);
  let n = normalize(vec2f(1.0, 0.26));
  let r = 0.085;
  let PI = 3.14159265;
  let smax = max(max(0.0, A * n.x), max(n.y, A * n.x + n.y));
  let e = u.p * u.p * (3.0 - 2.0 * u.p);
  let c = mix(smax, -0.32, e);
  let s = dot(P, n);
  let back = vec3f(0.90, 0.88, 0.83);
  var col: vec3f;
  if (s < c) {
    col = old(uv) * (1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.22, c - s)));
    // 丸まって裏返った紙(左へかぶさる)
    let delta = 2.0 * (c - s) + PI * r;
    let src = (P + n * delta) / vec2f(A, 1.0);
    if (inside(src)) { col = mix(back, old(src), 0.10) * 0.93; }
  } else {
    col = textureSampleLevel(tNew, smp, uv, 0.0).rgb * (1.0 - 0.38 * (1.0 - smoothstep(0.0, r * 2.6, s - c)));
    let x = (s - c) / r;
    if (x < 1.0) {
      let th2 = PI - asin(x);
      let src2 = (P + n * (r * th2 + c - s)) / vec2f(A, 1.0);
      let th1 = asin(x);
      let src1 = (P + n * (r * th1 + c - s)) / vec2f(A, 1.0);
      if (inside(src2)) { col = mix(back, old(src2), 0.10) * (0.58 + 0.42 * x); }
      else if (inside(src1)) { col = old(src1) * (0.82 + 0.18 * x); }
    }
  }
  return vec4f(col, 1.0);
}`;

let adapter = null, dev = null, fmt = '', pipeline = null, sampler = null, failed = false;
async function init() {
  adapter = await navigator.gpu.requestAdapter();   // adapter を持ち続ける(手放すと、deviceが失われることがある)
  if (!adapter) throw new Error('no adapter');
  dev = await adapter.requestDevice();
  dev.lost.then(info => { console.warn('WebGPU device lost:', info.reason, info.message); dev = null; pipeline = null; });
  fmt = navigator.gpu.getPreferredCanvasFormat();
  const module = dev.createShaderModule({ code: WGSL });
  pipeline = dev.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs' }, fragment: { module, entryPoint: 'fs', targets: [{ format: fmt }] } });
  sampler = dev.createSampler({ magFilter: 'linear', minFilter: 'linear' });
}

// ノートを開いたときに、先にGPUの準備をしておく(最初のページめくりが、もたつかないように)
export function warmFlip() { if (navigator.gpu && !dev && !failed) init().catch(() => { failed = true; }); }
export const flipSupported = () => !!navigator.gpu && !failed;

// host: 紙の枠(canvas をその中に重ねる)。from/to: 2D canvas(同じ大きさ)。dir: +1 次のページ / -1 前のページ
export async function playFlip(host, from, to, dir, ms = 900) {
  for (let attempt = 0; attempt < 2; attempt++) {   // GPUが途中で失われたら(ソフトウェア描画などで起きる)、準備し直して、もう一度だけ試す
    const r = await playOnce(host, from, to, dir, ms);
    if (r !== 'retry') return r;
  }
  return false;
}
async function playOnce(host, from, to, dir, ms) {
  if (!navigator.gpu || failed) return false;
  let canvas;
  try {
    if (!dev) await init();
    canvas = document.createElement('canvas');
    canvas.className = 'nt-flip';
    canvas.width = from.width; canvas.height = from.height;
    const ctx = canvas.getContext('webgpu');
    ctx.configure({ device: dev, format: fmt, alphaMode: 'opaque' });
    const mk = src => {
      const tex = dev.createTexture({ size: [from.width, from.height], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
      dev.queue.copyExternalImageToTexture({ source: src }, { texture: tex }, [from.width, from.height]);
      return tex;
    };
    const next = dir > 0;
    const tOld = mk(next ? from : to), tNew = mk(next ? to : from);   // めくられる紙 / その下に出てくる紙
    const ubuf = dev.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bind = dev.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: sampler },
      { binding: 2, resource: tOld.createView() }, { binding: 3, resource: tNew.createView() }] });
    const draw = p => {
      dev.queue.writeBuffer(ubuf, 0, new Float32Array([canvas.width, canvas.height, p, canvas.width / canvas.height]));
      const enc = dev.createCommandEncoder();
      const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 1, g: 1, b: 1, a: 1 } }] });
      pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
      dev.queue.submit([enc.finish()]);
    };
    draw(next ? 0 : 1);
    host.appendChild(canvas);
    await new Promise((res, rej) => {
      const t0 = performance.now();
      const guard = setTimeout(() => rej(new Error('flip timeout')), ms + 2500);   // 描画が止まっても、画面が固まらないように
      const tick = now => {
        try {
          const k = Math.min(1, (now - t0) / ms);
          draw(next ? k : 1 - k);
          if (k < 1) requestAnimationFrame(tick); else { clearTimeout(guard); res(); }
        } catch (e) { clearTimeout(guard); rej(e); }
      };
      requestAnimationFrame(tick);
    });
    tOld.destroy(); tNew.destroy(); ubuf.destroy();
    return true;
  } catch (e) {
    if (!dev) { adapter = null; return 'retry'; }   // GPUが失われた → もう一度
    console.warn('ページめくり(WebGPU)に失敗しました', e); failed = true; return false;
  } finally { canvas?.remove(); }
}
